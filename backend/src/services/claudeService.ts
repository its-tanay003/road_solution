import Anthropic from '@anthropic-ai/sdk';
import OpenAI from "openai";
import dotenv from 'dotenv';

dotenv.config();

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || 'mock_key',
});

const openai = new OpenAI({
  baseURL: "https://openrouter.ai/api/v1",
  apiKey: process.env.OPENROUTER_API_KEY || '',
  defaultHeaders: {
    "HTTP-Referer": "https://roadsos.app", // Optional, for OpenRouter rankings
    "X-Title": "ROADSoS Emergency Assistant", // Optional
  }
});

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

  if (!process.env.OPENROUTER_API_KEY) {
    // Mock streaming response for local development without key
    const mockReply = language === 'HI' 
      ? "यह एक नकली प्रतिक्रिया है। यदि घायल हो तो कृपया तत्काल चिकित्सा सहायता लें।" 
      : language === 'TA'
      ? "இது ஒரு போலி பதில். காயம் ஏற்பட்டால் உடனடியாக மருத்துவ உதவியை நாடவும்."
      : "This is a mock response. Please seek immediate medical attention if injured.";
    
    const chunks = mockReply.split(' ');
    
    for (let i = 0; i < chunks.length; i++) {
      res.write(`data: ${JSON.stringify({ type: 'content_block_delta', delta: { text: chunks[i] + ' ' } })}\n\n`);
      await new Promise(r => setTimeout(r, 100)); // simulate delay
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

    // Use OpenAI SDK targeting OpenRouter
    const stream = await openai.chat.completions.create({
      model: "openrouter/auto",
      messages: [
        { role: "system", content: dynamicSystemPrompt },
        ...messages.map(m => ({ role: m.role, content: m.content }))
      ],
      stream: true
    });

    for await (const chunk of stream) {
      const content = chunk.choices[0]?.delta?.content;
      if (content) {
        res.write(`data: ${JSON.stringify({ type: 'content_block_delta', delta: { text: content } })}\n\n`);
      }

      // Log reasoning tokens for performance monitoring
      const usage = chunk.usage as any;
      if (usage && usage.reasoningTokens) {
        console.log(`[INCIDENT TRIAGE] Reasoning tokens: ${usage.reasoningTokens}`);
      }
    }
    
    res.write('data: [DONE]\n\n');
    res.end();
  } catch (error) {
    console.error("OpenRouter API Error:", error);
    res.write(`data: ${JSON.stringify({ type: 'error', message: 'Failed to contact triage assistant via OpenRouter.' })}\n\n`);
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
  if (process.env.ANTHROPIC_API_KEY === 'mock_key' || !process.env.ANTHROPIC_API_KEY) {
    // Mock triage evaluation
    let severity: 'CRITICAL' | 'HIGH' | 'MODERATE' | 'LOW' = 'MODERATE';
    let confidenceScore = 0.85;
    
    if (input.description.toLowerCase().includes('blood') || input.description.toLowerCase().includes('unconscious')) {
      severity = 'CRITICAL';
    } else if (input.description.toLowerCase().includes('scratch') || input.description.toLowerCase().includes('minor')) {
      severity = 'LOW';
      confidenceScore = 0.9;
    }

    // If description is too short, lower confidence
    if (input.description.length < 10 && !input.hasImage) {
      confidenceScore = 0.5;
    }

    return {
      severity,
      injuryType: severity === 'CRITICAL' ? 'Severe Trauma' : 'Minor Injury',
      recommendedActions: [
        'Ensure the area is safe',
        'Do not move the victim unless in immediate danger',
        'Apply pressure to any bleeding'
      ],
      requiredServices: severity === 'CRITICAL' ? ['ambulance', 'police'] : [],
      confidenceScore
    };
  }

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
    const response = await anthropic.messages.create({
      model: 'claude-3-sonnet-20240229',
      max_tokens: 500,
      system: "You are an emergency triage system that outputs ONLY valid JSON.",
      messages: [{ role: 'user', content: prompt }],
    });

    const content = response.content[0].type === 'text' ? response.content[0].text : '{}';
    // Find json block
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
       const parsed = JSON.parse(jsonMatch[0]) as TriageResult;
       return parsed;
    }
    throw new Error("Failed to parse JSON");
  } catch (error) {
    console.error("AI Triage Error:", error);
    // Fallback if AI fails completely
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
  if (process.env.ANTHROPIC_API_KEY === 'mock_key' || !process.env.ANTHROPIC_API_KEY) {
    // Mock vision response
    return {
      deformation_severity: 8,
      ejection_risk: 'MEDIUM',
      fire_hazard: true,
      trapped_victim_probability: 65,
      rollover_detected: false,
      recommended_units: ['Ambulance', 'Fire Squad', 'Heavy Extraction'],
      triage_notes: "Severe front-end deformation detected. Engine fluid leak observed - fire hazard high. Potential occupant trapped in driver side.",
      confidence_score: 94
    };
  }

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
  if (process.env.ANTHROPIC_API_KEY === 'mock_key' || !process.env.ANTHROPIC_API_KEY) {
    return "Based on current patterns, the Downtown corridor shows elevated risk due to peak commute traffic and recent rainfall.";
  }

  const prompt = `You are an AI traffic safety analyst. Generate a 2-sentence natural language risk summary based on these patterns:
${JSON.stringify(patterns)}

Summary format: "Based on current patterns, [Area] shows [Risk Level] risk due to [Factors]."`;

  try {
    const response = await anthropic.messages.create({
      model: 'claude-3-sonnet-20240229',
      max_tokens: 100,
      system: "You are a concise traffic safety analyst. Respond with exactly 2 sentences.",
      messages: [{ role: 'user', content: prompt }],
    });

    return response.content[0].type === 'text' ? response.content[0].text : "Risk patterns are currently stable across all monitored sectors.";
  } catch (error) {
    console.error("Risk Summary Error:", error);
    return "Weather-related risk detected in high-density corridors. Exercise caution.";
  }
};

export const streamDebriefResponse = async (
  prompt: string,
  res: any // Express response object
) => {
  if (!process.env.OPENROUTER_API_KEY) {
    // Mock streaming response for local development without key
    const mockReply = "## 1. INCIDENT SUMMARY\nThis is a mock summary of the incident response. The situation was handled efficiently.\n\n## 2. RESPONSE TIMELINE ANALYSIS\n- 00:00: Incident reported.\n- 00:02: Units dispatched.\n\n## 3. AI PERFORMANCE REVIEW\nAI triage accurately predicted the required units.\n\n## 4. WHAT WENT WELL\n- Fast response time.\n- Accurate dispatch.\n- Good communication.\n\n## 5. AREAS FOR IMPROVEMENT\n- More details on weather conditions.\n- Better traffic routing.\n- Faster scene clearance.\n\n## 6. RECOMMENDATIONS FOR FUTURE INCIDENTS\nEnsure all units are updated with real-time weather data.\n\n## 7. ESTIMATED LIVES IMPACT\nEstimated 1 life saved.";
    const chunks = mockReply.split(' ');
    
    for (let i = 0; i < chunks.length; i++) {
      res.write(`data: ${JSON.stringify({ type: 'content_block_delta', delta: { text: chunks[i] + ' ' } })}\n\n`);
      await new Promise(r => setTimeout(r, 50)); // simulate delay
    }
    res.write('data: [DONE]\n\n');
    res.end();
    return;
  }

  try {
    const DEBRIEF_SYSTEM_PROMPT = `You are an expert emergency response analyst. Your job is to generate a comprehensive, professional, and data-driven post-incident debrief based on the provided incident data. Format your response strictly in the requested sections using Markdown formatting.`;

    const stream = await openai.chat.completions.create({
      model: "openrouter/auto",
      messages: [
        { role: "system", content: DEBRIEF_SYSTEM_PROMPT },
        { role: "user", content: prompt }
      ],
      stream: true
    });

    for await (const chunk of stream) {
      const content = chunk.choices[0]?.delta?.content;
      if (content) {
        res.write(`data: ${JSON.stringify({ type: 'content_block_delta', delta: { text: content } })}\n\n`);
      }

      const usage = chunk.usage as any;
      if (usage && usage.reasoningTokens) {
        console.log(`[DEBRIEF] Reasoning tokens: ${usage.reasoningTokens}`);
      }
    }
    
    res.write('data: [DONE]\n\n');
    res.end();
  } catch (error) {
    console.error("OpenRouter Debrief Error:", error);
    res.write(`data: ${JSON.stringify({ type: 'error', message: 'Failed to generate debrief via OpenRouter.' })}\n\n`);
    res.end();
  }
};

export const streamTrainingScenario = async (
  prompt: string,
  res: any // Express response object
) => {
  if (!process.env.OPENROUTER_API_KEY) {
    // Mock streaming response
    const mockReply = "## SCENARIO: HIGHWAY PILEUP\n**Time:** 14:30\n**Weather:** Heavy Rain, Low Visibility\n**Location:** I-95 Northbound, Mile Marker 42\n\n**Incoming Report:**\nMultiple 911 calls reporting a multi-vehicle collision involving a commercial semi-truck and at least 3 passenger vehicles. The semi is jackknifed across two lanes. One vehicle is trapped under the trailer. Witnesses report smoke coming from the trapped vehicle. Traffic is backing up rapidly.\n\n**Initial Assessment:**\n- At least 4 vehicles involved.\n- High probability of severe injuries/entrapment.\n- Fire hazard present.\n- Significant traffic disruption creating access challenges for responding units.\n\n**Required Actions:**\n1. Determine initial triage level.\n2. Dispatch appropriate units (ALS, BLS, Fire, Police).\n3. Provide initial instructions to callers.";
    const chunks = mockReply.split(' ');
    
    for (let i = 0; i < chunks.length; i++) {
      res.write(`data: ${JSON.stringify({ type: 'content_block_delta', delta: { text: chunks[i] + ' ' } })}\n\n`);
      await new Promise(r => setTimeout(r, 50)); // simulate delay
    }
    res.write('data: [DONE]\n\n');
    res.end();
    return;
  }

  try {
    const TRAINING_SYSTEM_PROMPT = `You are an emergency training scenario generator. Generate realistic, detailed, and challenging road accident training scenarios for dispatchers based on the provided parameters. Format your response clearly with headings. Make it feel like an urgent, incoming dispatch report.`;

    const stream = await openai.chat.completions.create({
      model: "openrouter/auto",
      messages: [
        { role: "system", content: TRAINING_SYSTEM_PROMPT },
        { role: "user", content: prompt }
      ],
      stream: true
    });

    for await (const chunk of stream) {
      const content = chunk.choices[0]?.delta?.content;
      if (content) {
        res.write(`data: ${JSON.stringify({ type: 'content_block_delta', delta: { text: content } })}\n\n`);
      }
    }
    
    res.write('data: [DONE]\n\n');
    res.end();
  } catch (error) {
    console.error("Training Stream Error:", error);
    res.write(`data: ${JSON.stringify({ type: 'error', message: 'Stream failed' })}\n\n`);
    res.end();
  }
};

export const predictRisk = async (segment: string, weather: string): Promise<RiskForecast> => {
  if (!process.env.OPENROUTER_API_KEY) {
    // Mock risk prediction for local dev
    const score = Math.floor(Math.random() * 40) + 40; // 40-80
    return {
      score,
      level: score > 75 ? 'CRITICAL' : score > 55 ? 'HIGH' : score > 35 ? 'MODERATE' : 'LOW',
      reasoning: `Analysis of ${segment} under ${weather} conditions indicates elevated risk patterns consistent with historical incident data. Visibility and traction are significantly compromised.`,
      recommendations: [
        "Reduce speed by 20% below posted limit",
        "Enable low-beam headlights immediately",
        "Increase following distance to 4 seconds"
      ]
    };
  }

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
    const response = await openai.chat.completions.create({
      model: "openrouter/auto",
      messages: [
        { role: "system", content: "You are a road safety predictive engine that outputs ONLY valid JSON." },
        { role: "user", content: prompt }
      ]
    });

    const content = response.choices[0]?.message?.content || '{}';
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

  if (!process.env.OPENROUTER_API_KEY) {
    return {
      overallScore: 72,
      riskLevel: "MODERATE",
      dangerSegments: [
        { name: "NH-48 Sector 4", km: "342-358", reason: "High-speed heavy vehicle merging", accidents2023: 14 }
      ],
      safestDepartureTime: "05:30 AM",
      avoidanceAdvice: "Avoid night travel through the Krishnagiri bypass segment."
    };
  }

  try {
    const response = await openai.chat.completions.create({
      model: "openrouter/auto",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt }
      ],
      temperature: 0.1
    });

    const content = response.choices[0]?.message?.content || '{}';
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
