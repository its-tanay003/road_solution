import { runTriageAgent } from '../agents/agentTriage';
import { runVisionAgent } from '../agents/agentVision';
import { runVitalsAgent } from '../agents/agentVitals';
import { runIdentityAgent } from '../agents/agentIdentity';
import { runOrchestratorAgent } from '../agents/agentOrchestrator';
import { runFirstAidAgent } from '../agents/agentFirstAid';

interface OrchestratorInput {
  textMessage?: string;
  imageBase64?: string;
  videoFrames?: string[];
  vitalsData?: any;
  userProfile?: any;
  language?: string;
  incidentId: string;
}

export async function runEmergencyAnalysis(input: OrchestratorInput, io: any) {
  const {
    textMessage,
    imageBase64,
    videoFrames,
    vitalsData,
    userProfile,
    language = 'en',
    incidentId
  } = input;

  const emitStream = (agentName: string, text: string) => {
    if (io) {
      io.emit('agent:stream', { incidentId, agentName, text });
    }
  };

  const promises: Promise<any>[] = [];
  const results: any = {};

  // 1. Run TriageAgent
  if (textMessage || vitalsData || imageBase64) {
    promises.push(
      runTriageAgent({ textMessage, vitalsData, userProfile }, (text) => emitStream('triage', text))
        .then(res => {
          results.triage = res;
          if (io) io.emit('agent:update', { incidentId, agentName: 'triage', data: res });
        })
    );
  }

  // 2. Run MedicalVisionAgent
  if (imageBase64 || (videoFrames && videoFrames.length > 0)) {
    promises.push(
      runVisionAgent(imageBase64, videoFrames, (text) => emitStream('vision', text))
        .then(res => {
          results.vision = res;
          if (io) io.emit('agent:update', { incidentId, agentName: 'vision', data: res });
        })
    );
  }

  // 3. Run VitalSignsAgent
  if (vitalsData) {
    promises.push(
      runVitalsAgent(vitalsData, userProfile, (text) => emitStream('vitals', text))
        .then(res => {
          results.vitals = res;
          if (io) io.emit('agent:update', { incidentId, agentName: 'vitals', data: res });
        })
    );
  }

  // Identity Agent (if needed based on context)
  if (userProfile || imageBase64) {
    promises.push(
      runIdentityAgent(imageBase64 ? { imageBase64 } : null, userProfile, (text) => emitStream('identity', text))
        .then(res => {
          results.identity = res;
          if (io) io.emit('agent:update', { incidentId, agentName: 'identity', data: res });
        })
    );
  }

  // 4. Await all initial agents
  await Promise.all(promises);

  // 5. Feed into OrchestratorAgent
  const orchestratorResult = await runOrchestratorAgent(results, (text) => emitStream('orchestrator', text));
  if (io) io.emit('agent:update', { incidentId, agentName: 'orchestrator', data: orchestratorResult });
  results.orchestrator = orchestratorResult;

  // 6. Run FirstAidAgent
  const firstAidResult = await runFirstAidAgent(orchestratorResult, language, (text) => emitStream('firstAid', text));
  if (io) io.emit('agent:update', { incidentId, agentName: 'firstAid', data: firstAidResult });
  results.firstAid = firstAidResult;

  // 8. Return final unified response
  return results;
}
