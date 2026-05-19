import { runTriageAgent } from '../agents/agentTriage';
import { runVisionAgent } from '../agents/agentVision';
import { runVitalsAgent } from '../agents/agentVitals';
import { runIdentityAgent } from '../agents/agentIdentity';
import { runOrchestratorAgent } from '../agents/agentOrchestrator';
import { runFirstAidAgent } from '../agents/agentFirstAid';

import { 
  runGeminiTriageAgent,
  runGeminiVisionAgent,
  runGeminiVitalsAgent,
  runGeminiIdentityAgent,
  runGeminiOrchestratorAgent,
  runGeminiFirstAidAgent
} from '../agents/geminiAgents';

export async function triage(input: any, onStream?: (text: string) => void) {
  const provider = process.env.TRIAGE_AI || 'claude';
  try {
    if (provider === 'gemini') return await runGeminiTriageAgent(input, onStream);
    return await runTriageAgent(input, onStream);
  } catch (error) {
    console.error(`Triage agent (${provider}) failed, falling back...`, error);
    // Fallback logic
    if (provider === 'gemini') return await runTriageAgent(input, onStream);
    return await runGeminiTriageAgent(input, onStream);
  }
}

export async function vision(imageBase64: string, context?: string | string[], onStream?: (text: string) => void, patientProfile?: any) {
  const provider = process.env.VISION_AI || 'claude';
  try {
    if (provider === 'gemini') return await runGeminiVisionAgent(imageBase64, context, onStream, patientProfile);
    return await runVisionAgent(imageBase64, context, onStream, patientProfile);
  } catch (error) {
    console.error(`Vision agent (${provider}) failed, falling back...`, error);
    if (provider === 'gemini') return await runVisionAgent(imageBase64, context, onStream, patientProfile);
    return await runGeminiVisionAgent(imageBase64, context, onStream, patientProfile);
  }
}

export async function vitals(vitalsData: any, userProfile?: any, onStream?: (text: string) => void) {
  const provider = process.env.VITALS_AI || 'claude';
  try {
    if (provider === 'gemini') return await runGeminiVitalsAgent(vitalsData, userProfile, onStream);
    return await runVitalsAgent(vitalsData, userProfile, onStream);
  } catch (error) {
    console.error(`Vitals agent (${provider}) failed, falling back...`, error);
    if (provider === 'gemini') return await runVitalsAgent(vitalsData, userProfile, onStream);
    return await runGeminiVitalsAgent(vitalsData, userProfile, onStream);
  }
}

export async function identity(identityData: any, context?: any, onStream?: (text: string) => void) {
  const provider = process.env.IDENTITY_AI || 'claude';
  try {
    if (provider === 'gemini') return await runGeminiIdentityAgent(identityData, context, onStream);
    return await runIdentityAgent(identityData, context, onStream);
  } catch (error) {
    console.error(`Identity agent (${provider}) failed, falling back...`, error);
    if (provider === 'gemini') return await runIdentityAgent(identityData, context, onStream);
    return await runGeminiIdentityAgent(identityData, context, onStream);
  }
}

export async function orchestrate(allResults: any, onStream?: (text: string) => void) {
  const provider = process.env.ORCHESTRATOR_AI || 'claude';
  try {
    if (provider === 'gemini') return await runGeminiOrchestratorAgent(allResults, onStream);
    return await runOrchestratorAgent(allResults, onStream);
  } catch (error) {
    console.error(`Orchestrator agent (${provider}) failed, falling back...`, error);
    if (provider === 'gemini') return await runOrchestratorAgent(allResults, onStream);
    return await runGeminiOrchestratorAgent(allResults, onStream);
  }
}

export async function firstAid(orchestratorOutput: any, language: string = 'en', onStream?: (text: string) => void) {
  const provider = process.env.FIRST_AID_AI || 'claude';
  try {
    if (provider === 'gemini') return await runGeminiFirstAidAgent(orchestratorOutput, language, onStream);
    return await runFirstAidAgent(orchestratorOutput, language, onStream);
  } catch (error) {
    console.error(`FirstAid agent (${provider}) failed, falling back...`, error);
    if (provider === 'gemini') return await runFirstAidAgent(orchestratorOutput, language, onStream);
    return await runGeminiFirstAidAgent(orchestratorOutput, language, onStream);
  }
}
