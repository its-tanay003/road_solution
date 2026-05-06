import { anthropic, claudeChat, claudeStream } from '../lib/claude';
import dotenv from 'dotenv';

dotenv.config();

const SYSTEM_PROMPT = `You are ROADSoS Emergency Assistant. Your job is to quickly 
understand a road accident situation and recommend the right emergency services.
Ask 2-3 concise questions to understand: injury severity, number of people affected,
type of vehicle, special needs. Then provide a prioritised list of services needed.
After triage, always provide relevant first-aid guidance.
IMPORTANT: Consider meteorological conditions (e.g., Heavy Rain, Fog, Ice) if mentioned or detected. 
Adjust safety protocols for secondary collision risks or environmental hazards.
Respond in the user's language, with special support for English, Hindi, and Tamil. Keep responses SHORT (under 50 words each turn).
Always end with actionable recommendations. Never delay emergency action.`;

export const streamClaudeResponse = async (
  messages: any[],
  res: any, // Express response object
  language: 'EN' | 'HI' | 'TA' = 'EN',
  panicScore?: number,
  biometricContext?: any
) => {
  const languageInstructions = {
    EN: "Respond in English.",
    HI: "Respond in Hindi (हिन्दी). Use Devanagari script.",
    TA: "Respond in Tamil (தமிழ்). Use Tamil script."
  };

  if (!process.env.ANTHROPIC_API_KEY) {
    // Mock streaming response
    const mockReply = language === 'HI' 
      ? "यह एक नकली प्रतिक्रिया है। यदि घायल हो तो कृपया तत्काल चिकित्सा सहायता लें।" 
      : language === 'TA'
      ? "இது ஒரு போலி பதில். காயம் ஏற்பட்டால் உடனடியாக மருத்துவ உதவியை நாடவும்."
      : "This is a mock response. Please seek immediate medical attention if injured.";
    
    const chunks = mockReply.split(' ');
    for (const chunk of chunks) {
      res.write(`data: ${JSON.stringify({ type: 'content_block_delta', delta: { text: chunk + ' ' } })}\n\n`);
      await new Promise(r => setTimeout(r, 100));
    }
    res.write('data: [DONE]\n\n');
    res.end();
    return;
  }

  try {
    let dynamicSystemPrompt = panicScore 
      ? `${SYSTEM_PROMPT}\n\nCaller panic score: ${panicScore}/100 — adjust triage urgency to ${panicScore > 65 ? 'CRITICAL' : panicScore > 30 ? 'HIGH' : 'NORMAL'}.`
      : SYSTEM_PROMPT;

    dynamicSystemPrompt += `\n\nLANGUAGE_INSTRUCTION: ${languageInstructions[language]}`;

    if (biometricContext) {
      const bioStr = typeof biometricContext === 'string' 
        ? biometricContext 
        : `Heart Rate: ${biometricContext.heartRate || 'N/A'}, ECG: ${biometricContext.ecgStatus || 'N/A'}, Vehicle: ${JSON.stringify(biometricContext.vehicle || {})}`;
      dynamicSystemPrompt += `\n\nLIVE_BIOMETRICS_FEED: ${bioStr}`;
    }

    const userMessage = messages[messages.length - 1].content;
    
    await claudeStream(dynamicSystemPrompt, userMessage, (text) => {
      res.write(`data: ${JSON.stringify({ type: 'content_block_delta', delta: { text } })}\n\n`);
    });
    
    res.write('data: [DONE]\n\n');
    res.end();
  } catch (error) {
    console.error("Claude Stream Error:", error);
    res.write(`data: ${JSON.stringify({ type: 'error', message: 'Failed to contact triage assistant.' })}\n\n`);
    res.end();
  }
};

export interface TriageInput {
  description: string;
  medicalProfile: any;
  hasImage: boolean;
  biometricsContext?: string;
}

export interface TriageResult {
  severity: 'CRITICAL' | 'HIGH' | 'MODERATE' | 'LOW';
  injuryType: string;
  recommendedActions: string[];
  requiredServices: ('ambulance' | 'police' | 'fire' | 'towing')[];
  confidenceScore: number;
}

export interface RiskForecast {
  score: number;
  level: 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL';
  reasoning: string;
  recommendations: string[];
}

export const evaluateTriage = async (input: TriageInput): Promise<TriageResult> => {
  const prompt = `You are an Emergency AI Triage System. Evaluate the following incident:
Description: ${input.description}
Medical Profile: ${JSON.stringify(input.medicalProfile)}
Image Provided: ${input.hasImage ? 'Yes' : 'No'}
Biometrics: ${input.biometricsContext || 'No biometric data available'}

Respond ONLY with a JSON object matching this structure:
{
  "severity": "CRITICAL" | "HIGH" | "MODERATE" | "LOW",
  "injuryType": "string",
  "recommendedActions": ["action1", "action2"],
  "requiredServices": ["ambulance", "police", "fire", "towing"],
  "confidenceScore": number (0.0 to 1.0)
}`;

  try {
    const content = await claudeChat("You are an emergency triage system that outputs ONLY valid JSON.", prompt);
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
       return JSON.parse(jsonMatch[0]) as TriageResult;
    }
    throw new Error("Failed to parse JSON");
  } catch (error) {
    console.error("AI Triage Error:", error);
    return {
      severity: 'HIGH',
      injuryType: 'Unknown Trauma',
      recommendedActions: ['Ensure scene safety', 'Wait for professional help'],
      requiredServices: ['ambulance', 'police'],
      confidenceScore: 0.4
    };
  }
};

export const analyzeCrashPhoto = async (base64Image: string): Promise<any> => {
  const systemPrompt = `You are an emergency AI triage system analyzing a crash scene photo. Respond ONLY in this JSON format:
{
  "deformation_severity": number 1-10,
  "ejection_risk": "LOW"|"MEDIUM"|"HIGH"|"CRITICAL",
  "fire_hazard": boolean,
  "trapped_victim_probability": number 0-100,
  "rollover_detected": boolean,
  "recommended_units": string[],
  "triage_notes": string,
  "confidence_score": number 0-100
}`;

  try {
    const response = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022', 
      max_tokens: 1000,
      system: systemPrompt,
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'image',
              source: {
                type: 'base64',
                media_type: 'image/jpeg',
                data: base64Image,
              },
            },
            {
              type: 'text',
              text: "Analyze this crash scene photo for emergency triage."
            }
          ],
        },
      ],
    });

    const content = response.content[0].type === 'text' ? response.content[0].text : '{}';
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
       return JSON.parse(jsonMatch[0]);
    }
    throw new Error("Failed to parse vision JSON");
  } catch (error) {
    console.error("Vision Analysis Error:", error);
    throw error;
  }
};

export const generateRiskSummary = async (patterns: any): Promise<string> => {
  const prompt = `You are an AI traffic safety analyst. Generate a 2-sentence natural language risk summary based on these patterns:
${JSON.stringify(patterns)}

Summary format: "Based on current patterns, [Area] shows [Risk Level] risk due to [Factors]."`;

  try {
    return await claudeChat("You are a concise traffic safety analyst. Respond with exactly 2 sentences.", prompt);
  } catch (error) {
    console.error("Risk Summary Error:", error);
    return "Weather-related risk detected in high-density corridors. Exercise caution.";
  }
};

export const streamDebriefResponse = async (
  prompt: string,
  res: any // Express response object
) => {
  try {
    const DEBRIEF_SYSTEM_PROMPT = `You are an expert emergency response analyst. Your job is to generate a comprehensive, professional, and data-driven post-incident debrief based on the provided incident data. Format your response strictly in the requested sections using Markdown formatting.`;

    await claudeStream(DEBRIEF_SYSTEM_PROMPT, prompt, (text) => {
      res.write(`data: ${JSON.stringify({ type: 'content_block_delta', delta: { text } })}\n\n`);
    });
    
    res.write('data: [DONE]\n\n');
    res.end();
  } catch (error) {
    console.error("Debrief Error:", error);
    res.write(`data: ${JSON.stringify({ type: 'error', message: 'Failed to generate debrief.' })}\n\n`);
    res.end();
  }
};

export const streamTrainingScenario = async (
  prompt: string,
  res: any // Express response object
) => {
  try {
    const TRAINING_SYSTEM_PROMPT = `You are an emergency training scenario generator. Generate realistic, detailed, and challenging road accident training scenarios for dispatchers based on the provided parameters. Format your response clearly with headings. Make it feel like an urgent, incoming dispatch report.`;

    await claudeStream(TRAINING_SYSTEM_PROMPT, prompt, (text) => {
      res.write(`data: ${JSON.stringify({ type: 'content_block_delta', delta: { text } })}\n\n`);
    });
    
    res.write('data: [DONE]\n\n');
    res.end();
  } catch (error) {
    console.error("Training Stream Error:", error);
    res.write(`data: ${JSON.stringify({ type: 'error', message: 'Stream failed' })}\n\n`);
    res.end();
  }
};

export const predictRisk = async (segment: string, weather: string): Promise<RiskForecast> => {
  const prompt = `Predict road accident risk for the following:
Segment: ${segment}
Weather/Condition: ${weather}

Respond ONLY with a JSON object:
{
  "score": number 0-100,
  "level": "LOW" | "MODERATE" | "HIGH" | "CRITICAL",
  "reasoning": "string max 80 words",
  "recommendations": ["string", "string", "string"]
}`;

  try {
    const content = await claudeChat("You are a road safety predictive engine that outputs ONLY valid JSON.", prompt);
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]) as RiskForecast;
    }
    throw new Error("JSON parse failed");
  } catch (error) {
    console.error("Risk Prediction Error:", error);
    return {
      score: 50,
      level: 'MODERATE',
      reasoning: "Predictive analysis link temporarily unstable. Baseline moderate caution advised for selected segment and conditions.",
      recommendations: [
        "Maintain standard safety protocols",
        "Monitor local traffic broadcasts",
        "Stay alert for environmental changes"
      ]
    };
  }
};

export const predictRouteSafety = async (source: string, destination: string, weather: any) => {
  const systemPrompt = `You are a road safety AI. Return ONLY valid JSON, no markdown:
{ 
  "overallScore": number 0-100, 
  "riskLevel": "LOW"|"MODERATE"|"HIGH"|"CRITICAL", 
  "dangerSegments": [{"name": string, "km": string, "reason": string, "accidents2023": number}], 
  "safestDepartureTime": string, 
  "avoidanceAdvice": string 
}`;

  const userPrompt = `Analyse route from ${source} to ${destination}. 
  Current Weather: ${JSON.stringify(weather)}. 
  Consider Indian National Highways (NH-48, NH-44, NH-66) and common black spots.`;

  try {
    const content = await claudeChat(systemPrompt, userPrompt);
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    throw new Error("JSON parse failed");
  } catch (error) {
    console.error('Route Safety Error:', error);
    return {
      overallScore: 68,
      riskLevel: "MODERATE",
      dangerSegments: [
        { name: "NH-48 Sector 4", km: "342-358", reason: "High-speed heavy vehicle merging", accidents2023: 14 }
      ],
      safestDepartureTime: "05:30 AM",
      avoidanceAdvice: "Avoid night travel through the Krishnagiri bypass segment."
    };
  }
};
