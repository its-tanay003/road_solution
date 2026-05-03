import Anthropic from '@anthropic-ai/sdk';
import { OpenRouter } from "@openrouter/sdk";
import dotenv from 'dotenv';

dotenv.config();

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || 'mock_key',
});

const openrouter = new OpenRouter({
  apiKey: process.env.OPENROUTER_API_KEY || ''
});

const SYSTEM_PROMPT = `You are ROADSoS Emergency Assistant. Your job is to quickly 
understand a road accident situation and recommend the right emergency services.
Ask 2-3 concise questions to understand: injury severity, number of people affected,
type of vehicle, special needs. Then provide a prioritised list of services needed.
After triage, always provide relevant first-aid guidance.
IMPORTANT: Consider meteorological conditions (e.g., Heavy Rain, Fog, Ice) if mentioned or detected. 
Adjust safety protocols for secondary collision risks or environmental hazards.
Respond in the user's language. Keep responses SHORT (under 50 words each turn).
Always end with actionable recommendations. Never delay emergency action.`;

export const streamClaudeResponse = async (
  messages: any[],
  res: any, // Express response object
  panicScore?: number
) => {
  if (!process.env.OPENROUTER_API_KEY) {
    // Mock streaming response for local development without key
    const mockReply = "This is a mock response. Please seek immediate medical attention if injured. We recommend calling an ambulance (108) and police (112).";
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
    const dynamicSystemPrompt = panicScore 
      ? `${SYSTEM_PROMPT}\n\nCaller panic score: ${panicScore}/100 — adjust triage urgency to ${panicScore > 65 ? 'CRITICAL' : panicScore > 30 ? 'HIGH' : 'NORMAL'}.`
      : SYSTEM_PROMPT;

    // Use OpenRouter with Gemma-4 for advanced reasoning
    const stream = await (openrouter.chat.send as any)({
      model: "google/gemma-4-31b-it:free",
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
}

export interface TriageResult {
  severity: 'CRITICAL' | 'HIGH' | 'MODERATE' | 'LOW';
  injuryType: string;
  recommendedActions: string[];
  requiredServices: ('ambulance' | 'police' | 'fire' | 'towing')[];
  confidenceScore: number;
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
