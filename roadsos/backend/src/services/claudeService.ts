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
