import { triage, vision, vitals, identity, orchestrate, firstAid } from './hybridAI';

interface OrchestratorInput {
  textMessage?: string;
  imageBase64?: string;
  videoFrames?: string[];
  vitalsData?: Record<string, unknown>;
  userProfile?: Record<string, unknown>;
  language?: string;
  incidentId: string;
}

export async function runEmergencyAnalysis(input: OrchestratorInput, io: import('socket.io').Server | null) {
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

  const promises: Promise<void>[] = [];
  const results: Record<string, unknown> = {};

  // 1. Run TriageAgent
  if (textMessage || vitalsData || imageBase64) {
    promises.push(
      triage({ textMessage, vitalsData, userProfile }, (text: string) => emitStream('triage', text))
        .then((res: unknown) => {
          results.triage = res;
          if (io) io.emit('agent:update', { incidentId, agentName: 'triage', data: res });
        })
    );
  }

  // 2. Run MedicalVisionAgent
  if (imageBase64 || (videoFrames && videoFrames.length > 0)) {
    promises.push(
      vision(imageBase64!, textMessage || videoFrames, (text: string) => emitStream('vision', text), userProfile)
        .then((res: unknown) => {
          results.vision = res;
          if (io) io.emit('agent:update', { incidentId, agentName: 'vision', data: res });
        })
    );
  }

  // 3. Run VitalSignsAgent
  if (vitalsData) {
    promises.push(
      vitals(vitalsData, userProfile, (text: string) => emitStream('vitals', text))
        .then((res: unknown) => {
          results.vitals = res;
          if (io) io.emit('agent:update', { incidentId, agentName: 'vitals', data: res });
        })
    );
  }

  // Identity Agent (if needed based on context)
  if (userProfile || imageBase64) {
    promises.push(
      identity(imageBase64 ? { imageBase64 } : null, userProfile, (text: string) => emitStream('identity', text))
        .then((res: unknown) => {
          results.identity = res;
          if (io) io.emit('agent:update', { incidentId, agentName: 'identity', data: res });
        })
    );
  }

  // 4. Await all initial agents
  await Promise.all(promises);

  // 5. Feed into OrchestratorAgent
  const orchestratorResult = await orchestrate(results, (text: string) => emitStream('orchestrator', text));
  if (io) io.emit('agent:update', { incidentId, agentName: 'orchestrator', data: orchestratorResult });
  results.orchestrator = orchestratorResult;

  // 6. Run FirstAidAgent
  const firstAidResult = await firstAid(orchestratorResult, language, (text: string) => emitStream('firstAid', text));
  if (io) io.emit('agent:update', { incidentId, agentName: 'firstAid', data: firstAidResult });
  results.firstAid = firstAidResult;

  // 8. Return final unified response
  return results;
}
