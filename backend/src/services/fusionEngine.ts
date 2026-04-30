import { evaluateTriage, TriageResult } from './claudeService';
import { calculateRiskScore } from './riskEngine';

export interface FusionInput {
  text?: string;
  voiceTranscript?: string;
  hasImage?: boolean;
  sensorData?: {
    gForce?: number;
    impactDetected?: boolean;
  };
  location?: { lat: number; lng: number };
  medicalProfile?: any;
  blackboxData?: any[];
  emotionalState?: string;
  networkCondition?: string;
}

export interface FusionResult extends TriageResult {
  riskScore: number;
  fusionConfidence: number;
}

export const processFusionTriage = async (input: FusionInput): Promise<FusionResult> => {
  // 1. Combine inputs into a robust text description
  let combinedDescription = "";
  if (input.text) combinedDescription += `User Text: ${input.text}\n`;
  if (input.voiceTranscript) combinedDescription += `Voice Transcript: ${input.voiceTranscript}\n`;
  if (input.sensorData?.impactDetected) combinedDescription += `Sensor: High Impact Detected (${input.sensorData.gForce}G)\n`;
  if (input.emotionalState) combinedDescription += `Emotional State: ${input.emotionalState.toUpperCase()}\n`;
  if (input.networkCondition) combinedDescription += `Network Condition: ${input.networkCondition.toUpperCase()}\n`;
  if (input.blackboxData && input.blackboxData.length > 0) {
    const duration = input.blackboxData.length * 0.1; // approx seconds if 10Hz
    combinedDescription += `Telemetry: Available for last ~${duration.toFixed(1)} seconds leading to incident.\n`;
  }

  if (!combinedDescription) {
    combinedDescription = "Unresponsive user. Potential severe emergency.";
  }

  // 2. Run traditional AI Triage
  const triageResult = await evaluateTriage({
    description: combinedDescription,
    hasImage: !!input.hasImage,
    medicalProfile: input.medicalProfile
  });

  // 3. Apply Context-Aware Intelligence (Location Risk)
  let riskScore = 0;
  if (input.location) {
    riskScore = calculateRiskScore(input.location.lat, input.location.lng);
  }

  // 4. Overwrite severity based on rigid sensor rules (Fail-safe)
  let severity = triageResult.severity;
  let requiredServices = [...triageResult.requiredServices];
  
  if (input.sensorData?.impactDetected && (input.sensorData.gForce || 0) > 4.0) {
    severity = 'CRITICAL';
    if (!requiredServices.includes('ambulance')) requiredServices.push('ambulance');
    if (!requiredServices.includes('police')) requiredServices.push('police');
  }

  // 5. Final Confidence Check
  let fusionConfidence = triageResult.confidenceScore;
  if (input.sensorData?.impactDetected) fusionConfidence = 0.99; // Hard evidence overrides text

  return {
    ...triageResult,
    severity,
    requiredServices,
    riskScore,
    fusionConfidence
  };
};
