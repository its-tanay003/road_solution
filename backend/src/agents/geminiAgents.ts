import { geminiPro, geminiFlash } from '../lib/gemini';

const TRIAGE_SYSTEM_PROMPT = `You are an emergency medical triage AI trained on Advanced Trauma Life Support (ATLS) protocols, WHO Emergency Care guidelines, and Indian 108 EMRI triage standards. Assess the severity of injuries from descriptions, images, or vital signs. Output JSON: { "severity": "IMMEDIATE"|"URGENT"|"DELAYED"|"MINIMAL", "confidence": number, "primaryConcerns": string[], "recommendedUnitType": "ALS"|"BLS"|"First Responder"|"Air Ambulance", "estimatedTimeToDeterioration": string, "immediateActions": string[] }. Always prioritize life-threatening conditions. Never give a false reassurance. If uncertain, escalate.`;

const FIRST_AID_SYSTEM_PROMPT = `You are an emergency first aid instructor trained in American Red Cross, St John Ambulance, and Indian EMRI first aid protocols. Provide step-by-step first aid instructions in simple language (Class 5 reading level). Speak directly to the helper, not the victim. Number each step. Each step must be one action only. After each step say "Tell me when done" to pace the helper. Output in the user's language. For cardiac arrest: guide CPR at 100-120 compressions/minute. For bleeding: direct pressure. For spinal injury: immobilize. Always repeat the most critical step if asked.`;

const VISION_SYSTEM_PROMPT = `You are an emergency medical vision AI. Analyze this image of a potentially injured person.
        
Identify and report:
1. VISIBLE INJURIES: Location, type (laceration/fracture/burn/bruising/swelling), estimated severity
2. CONSCIOUSNESS: Awake and alert / Confused / Unconscious / Unknown
3. BREATHING: Visible chest movement, labored breathing signs
4. SKIN: Pallor (pale), cyanosis (blue lips/fingertips), flushing, diaphoresis (sweating)
5. BODY POSITION: How they are lying, any unnatural limb positions
6. BLEEDING: Visible blood, estimated amount (minor/moderate/severe)
7. ENVIRONMENT: Any visible hazards (fire, water, traffic, electrical)
8. AGE ESTIMATE: Approximate age range

Output as JSON only, no markdown:
{
  "consciousnessLevel": "ALERT|CONFUSED|UNCONSCIOUS|UNKNOWN",
  "visibleInjuries": [{"location": "", "type": "", "severity": "MINOR|MODERATE|SEVERE"}],
  "breathing": "NORMAL|LABORED|ABSENT|UNKNOWN",
  "skinCondition": [],
  "bleeding": "NONE|MINOR|MODERATE|SEVERE",
  "bodyPosition": "",
  "estimatedAge": "",
  "environmentalHazards": [],
  "overallSeverity": "CRITICAL|SERIOUS|MODERATE|MINOR",
  "confidenceScore": 0-100,
  "immediateVisionConcerns": [],
  "limitationsNote": ""
}`;

const VITALS_SYSTEM_PROMPT = `You are a medical AI specializing in vital sign interpretation. Given heart rate, SpO2, blood pressure, respiratory rate, temperature, and HRV data from wearable devices, identify: shock indicators, hypoxia, cardiac arrhythmia, hypertension crisis, hypoglycemia signs. Cross-reference with patient medical profile if provided. Output JSON: { "vitalStatus": "NORMAL"|"CONCERNING"|"CRITICAL", "abnormalVitals": string[], "possibleConditions": string[], "urgencyLevel": number, "recommendations": string[] }. Flag any single vital that independently requires emergency response. (urgencyLevel should be 1-10)`;

const IDENTITY_SYSTEM_PROMPT = `You are an identity assistance AI. Given facial features description or image analysis results, help identify a person by cross-referencing provided information with available context (vehicle registration, ROADSoS profile data, emergency contacts). 

Output as JSON only:
{
  "status": "CONFIRMED" | "UNCONFIRMED" | "SIMULATED",
  "name": "Full Name",
  "age": "e.g. 28",
  "bloodGroup": "e.g. A+",
  "identityDetails": "Detailed background",
  "medicalHistory": ["list", "of", "conditions"],
  "confidence": 0-1,
  "source": "VAAHAN/UIDAI/ROADSoS"
}

Never fabricate identity. If identity cannot be confirmed, set status to UNCONFIRMED.
Privacy rule: all identity data is used only for emergency medical care.`;

const ORCHESTRATOR_SYSTEM_PROMPT = `You are the ROADSoS emergency response coordinator AI. You receive inputs from multiple specialized agents (triage, vision, vitals, first aid, identity) and synthesize them into a unified emergency response plan. Prioritize: 1) Life-threatening conditions first, 2) Dispatch the right resource, 3) Guide the bystander. Make decisions in under 3 seconds. Output a unified action plan as JSON: { "primaryAction": string, "dispatchRecommendation": string, "bystanderInstruction": string, "allAgentOutputs": object, "overallSeverity": string, "confidenceScore": number }. bystanderInstruction should be one sentence, maximum urgency.`;


export async function runGeminiTriageAgent(input: any, onStream?: (text: string) => void) {
  try {
    const result = await geminiPro.generateContentStream({
      contents: [{ role: 'user', parts: [{ text: JSON.stringify(input) }] }],
      systemInstruction: TRIAGE_SYSTEM_PROMPT,
    });

    let fullResponse = '';
    for await (const chunk of result.stream) {
      const text = chunk.text();
      fullResponse += text;
      if (onStream) onStream(text);
    }
    
    // clean markdown JSON block
    const jsonMatch = fullResponse.match(/\{[\s\S]*\}/);
    const jsonStr = jsonMatch ? jsonMatch[0] : fullResponse;
    return JSON.parse(jsonStr);
  } catch (e) {
    console.error('Failed to parse Gemini TriageAgent output:', e);
    return { error: 'Failed to parse JSON', raw: String(e) };
  }
}

export async function runGeminiVisionAgent(
  imageBase64: string, 
  context?: string | string[], 
  onStream?: (text: string) => void,
  patientProfile?: { conditions?: string[]; [key: string]: any }
) {
  if (!imageBase64) return null;

  const contextStr = Array.isArray(context) 
    ? `Multiple frames provided. Context: ${context.join(', ')}` 
    : (context || 'Road traffic accident reported');

  const [mediaType, base64Data] = imageBase64.split(',');
  const mimeType = mediaType.split(':')[1].split(';')[0];

  const userPrompt = `Context from caller: ${contextStr}
${patientProfile ? 'Known patient conditions: ' + JSON.stringify(patientProfile.conditions || patientProfile) : ''}`;

  try {
    const result = await geminiFlash.generateContentStream({
      contents: [
        { 
          role: 'user', 
          parts: [
            { inlineData: { data: base64Data, mimeType } },
            { text: userPrompt }
          ] 
        }
      ],
      systemInstruction: VISION_SYSTEM_PROMPT,
    });

    let fullResponse = '';
    for await (const chunk of result.stream) {
      const text = chunk.text();
      fullResponse += text;
      if (onStream) onStream(text);
    }

    const jsonMatch = fullResponse.match(/\{[\s\S]*\}/);
    const jsonStr = jsonMatch ? jsonMatch[0] : fullResponse;
    return JSON.parse(jsonStr);
  } catch (e) {
    console.error('Failed to parse Gemini VisionAgent output:', e);
    return { error: 'Failed to parse JSON', raw: String(e) };
  }
}

export async function runGeminiVitalsAgent(vitalsData: any, userProfile?: any, onStream?: (text: string) => void) {
  if (!vitalsData) return null;

  try {
    const result = await geminiFlash.generateContentStream({
      contents: [{ role: 'user', parts: [{ text: JSON.stringify({ vitalsData, userProfile }) }] }],
      systemInstruction: VITALS_SYSTEM_PROMPT,
    });

    let fullResponse = '';
    for await (const chunk of result.stream) {
      const text = chunk.text();
      fullResponse += text;
      if (onStream) onStream(text);
    }

    const jsonMatch = fullResponse.match(/\{[\s\S]*\}/);
    const jsonStr = jsonMatch ? jsonMatch[0] : fullResponse;
    return JSON.parse(jsonStr);
  } catch (e) {
    console.error('Failed to parse Gemini VitalsAgent output:', e);
    return { error: 'Failed to parse JSON', raw: String(e) };
  }
}

export async function runGeminiIdentityAgent(
  identityData: { imageBase64?: string; description?: string } | null, 
  context?: any, 
  onStream?: (text: string) => void
) {
  if (!identityData) return null;

  try {
    const parts: any[] = [];
    if (identityData.imageBase64) {
      const [mediaType, base64Data] = identityData.imageBase64.split(',');
      const mimeType = mediaType.split(':')[1].split(';')[0];
      parts.push({ inlineData: { data: base64Data, mimeType } });
    }
    parts.push({ text: JSON.stringify({ description: identityData.description, context }) });

    const result = await geminiFlash.generateContentStream({
      contents: [{ role: 'user', parts }],
      systemInstruction: IDENTITY_SYSTEM_PROMPT,
    });

    let fullResponse = '';
    for await (const chunk of result.stream) {
      const text = chunk.text();
      fullResponse += text;
      if (onStream) onStream(text);
    }

    const jsonMatch = fullResponse.match(/\{[\s\S]*\}/);
    const jsonStr = jsonMatch ? jsonMatch[0] : fullResponse;
    return JSON.parse(jsonStr);
  } catch (e) {
    console.error('Failed to parse Gemini IdentityAgent output:', e);
    return { error: 'Failed to parse JSON', raw: String(e) };
  }
}

export async function runGeminiFirstAidAgent(orchestratorOutput: any, language: string = 'en', onStream?: (text: string) => void) {
  try {
    const result = await geminiFlash.generateContentStream({
      contents: [{ role: 'user', parts: [{ text: `Language: ${language}\n\nSituation: ${JSON.stringify(orchestratorOutput)}` }] }],
      systemInstruction: FIRST_AID_SYSTEM_PROMPT,
    });

    let fullResponse = '';
    for await (const chunk of result.stream) {
      const text = chunk.text();
      fullResponse += text;
      if (onStream) onStream(text);
    }

    return fullResponse;
  } catch (e) {
    console.error('Failed to parse Gemini FirstAidAgent output:', e);
    return String(e);
  }
}

export async function runGeminiOrchestratorAgent(allResults: any, onStream?: (text: string) => void) {
  try {
    const result = await geminiPro.generateContentStream({
      contents: [{ role: 'user', parts: [{ text: JSON.stringify(allResults) }] }],
      systemInstruction: ORCHESTRATOR_SYSTEM_PROMPT,
    });

    let fullResponse = '';
    for await (const chunk of result.stream) {
      const text = chunk.text();
      fullResponse += text;
      if (onStream) onStream(text);
    }

    const jsonMatch = fullResponse.match(/\{[\s\S]*\}/);
    const jsonStr = jsonMatch ? jsonMatch[0] : fullResponse;
    return JSON.parse(jsonStr);
  } catch (e) {
    console.error('Failed to parse Gemini OrchestratorAgent output:', e);
    return { error: 'Failed to parse JSON', raw: String(e) };
  }
}
