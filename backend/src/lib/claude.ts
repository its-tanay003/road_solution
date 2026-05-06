import Anthropic from '@anthropic-ai/sdk';

export const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export async function claudeChat(
  systemPrompt: string,
  userMessage: string,
  maxTokens = 1024
): Promise<string> {
  const response = await anthropic.messages.create({
    model: 'claude-3-5-sonnet-20241022', // Updated to latest stable version
    max_tokens: maxTokens,
    system: systemPrompt,
    messages: [{ role: 'user', content: userMessage }],
  });
  const block = response.content[0];
  return block.type === 'text' ? block.text : '';
}

export async function claudeStream(
  systemPrompt: string,
  userMessage: string,
  onChunk: (text: string) => void
): Promise<void> {
  const stream = anthropic.messages.stream({
    model: 'claude-3-5-sonnet-20241022', // Updated to latest stable version
    max_tokens: 1024,
    system: systemPrompt,
    messages: [{ role: 'user', content: userMessage }],
  });
  for await (const chunk of stream) {
    if (chunk.type === 'content_block_delta' && chunk.delta.type === 'text_delta') {
      onChunk(chunk.delta.text);
    }
  }
}

export async function claudeMultiAgent(
  agents: Array<{ system: string; user: string }>
): Promise<string[]> {
  const results = await Promise.all(
    agents.map(a => claudeChat(a.system, a.user))
  );
  return results;
}
