export type TriageInput = {
  gForce: number;
  movement: boolean;
  spO2: number;
  heartRate: number;
  crashType: 'urban' | 'rural' | 'highway';
  vehicleType: 'two-wheeler' | 'car' | 'truck';
};

export type TriageOutput = {
  severity: 'CRITICAL' | 'SERIOUS' | 'MODERATE' | 'MINOR';
  unitType: 'ALS' | 'BLS' | 'First Responder';
  responseTimeTarget: number;
  reasoning: string[];
  immediateActions: string[];
  offlineMode: true;
};

export const triageIncident = (input: TriageInput): TriageOutput => {
  const { gForce, movement, spO2, heartRate, crashType, vehicleType } = input;
  const reasoning: string[] = [];
  const immediateActions: string[] = ["Do not move the victim", "Ensure clear airway", "Wait for emergency unit"];

  let severity: TriageOutput['severity'] = 'MINOR';
  let responseTimeTarget = 15; // default in minutes

  // 1. CRITICAL checks
  if ((gForce > 12 && !movement) || (spO2 < 88) || (heartRate > 150 || heartRate < 40)) {
    severity = 'CRITICAL';
    if (gForce > 12 && !movement) reasoning.push("High-impact G-force (>12G) detected with zero victim movement.");
    if (spO2 < 88) reasoning.push(`Critical SpO2 level detected (${spO2}%). High hypoxia risk.`);
    if (heartRate > 150 || heartRate < 40) reasoning.push(`Severe cardiac arrhythmia detected (HR: ${heartRate}bpm).`);
  } 
  // 2. CRITICAL two-wheeler check
  else if (vehicleType === 'two-wheeler' && gForce > 8) {
    severity = 'CRITICAL';
    reasoning.push("Two-wheeler impact > 8G indicates high risk of ejection and spinal trauma.");
  }
  // 3. SERIOUS checks
  else if (gForce >= 8 && gForce <= 12 && spO2 >= 88 && spO2 <= 93) {
    severity = 'SERIOUS';
    reasoning.push(`Sustained impact (${gForce}G) with declining respiratory metrics (SpO2: ${spO2}%).`);
  }
  // 4. SERIOUS highway check
  else if (crashType === 'highway' && gForce > 6) {
    severity = 'SERIOUS';
    reasoning.push("High-speed highway impact (>6G) detected. Internal trauma suspected.");
  }
  // 5. MODERATE checks
  else if (gForce >= 4 && gForce <= 8 && movement && spO2 > 93) {
    severity = 'MODERATE';
    reasoning.push("Moderate impact with conscious victim movement and stable vitals.");
  }
  // 6. MINOR checks
  else if (gForce < 4 && movement && spO2 > 95) {
    severity = 'MINOR';
    reasoning.push("Low-impact minor event. Full consciousness and normal respiratory function.");
  }

  // Unit Type Rules
  let unitType: TriageOutput['unitType'] = 'First Responder';
  if (severity === 'CRITICAL' || (severity === 'SERIOUS' && (vehicleType === 'two-wheeler' || crashType === 'highway'))) {
    unitType = 'ALS';
    responseTimeTarget = 8;
  } else if (severity === 'SERIOUS' && crashType === 'urban' && vehicleType === 'car') {
    unitType = 'BLS';
    responseTimeTarget = 12;
  } else if (severity === 'MODERATE' || severity === 'MINOR') {
    unitType = 'First Responder';
    responseTimeTarget = 15;
  }

  if (severity === 'CRITICAL') {
    immediateActions[0] = "Begin controlled CPR if heart rate is absent";
    immediateActions[1] = "Apply direct pressure to any visible bleeding";
    immediateActions[2] = "Maintain spinal immobilization immediately";
  }

  return {
    severity,
    unitType,
    responseTimeTarget,
    reasoning,
    immediateActions,
    offlineMode: true
  };
};
