import Anthropic from '@anthropic-ai/sdk';
import dotenv from 'dotenv';

dotenv.config();

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || 'mock_key',
});

const SYSTEM_PROMPT = `You are ROADSoS Emergency Assistant. Your job is to quickly 
understand a road accident situation and recommend the right emergency services.
Ask 2-3 concise questions to understand: injury severity, number of people affected,
type of vehicle, special needs. Then provide a prioritised list of services needed.
After triage, always provide relevant first-aid guidance.
Respond in the user's language. Keep responses SHORT (under 50 words each turn).
Always end with actionable recommendations. Never delay emergency action.`;

export const streamClaudeResponse = async (
  messages: Anthropic.MessageParam[],
  res: any, // Express response object
) => {
  if (process.env.ANTHROPIC_API_KEY === 'mock_key' || !process.env.ANTHROPIC_API_KEY) {
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
    const stream = await anthropic.messages.create({
      model: 'claude-3-sonnet-20240229', // Using standard sonnet version string for SDK compatibility
      max_tokens: 500,
      system: SYSTEM_PROMPT,
      messages: messages,
      stream: true,
    });

    for await (const chunk of stream) {
      res.write(`data: ${JSON.stringify(chunk)}\n\n`);
    }
    
    res.write('data: [DONE]\n\n');
    res.end();
  } catch (error) {
    console.error("Claude API Error:", error);
    res.write(`data: ${JSON.stringify({ type: 'error', message: 'Failed to contact triage assistant.' })}\n\n`);
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
