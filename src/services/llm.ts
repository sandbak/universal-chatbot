import Anthropic from '@anthropic-ai/sdk';

// Debug environment variables
const apiKey = process.env.REACT_APP_ANTHROPIC_API_KEY;
console.log('Environment variables:', {
  REACT_APP_ANTHROPIC_API_KEY: apiKey ? `${apiKey.substring(0, 10)}...` : 'undefined',
  NODE_ENV: process.env.NODE_ENV
});

if (!apiKey) {
  throw new Error('REACT_APP_ANTHROPIC_API_KEY is not set in environment variables');
}

const anthropic = new Anthropic({
  apiKey: apiKey,
  dangerouslyAllowBrowser: true // Note: In production, you should proxy requests through your backend
});

console.log('Anthropic API Key:', process.env.REACT_APP_ANTHROPIC_API_KEY?.substring(0, 10) + '...');

// Import the master prompt content
const MASTER_PROMPT = `
You are a helpful AI assistant. You aim to provide accurate, helpful, and concise responses to users' questions. You should:

1. Be friendly and professional
2. Keep responses clear and to the point
3. Ask for clarification if a question is unclear
4. Admit when you don't know something
5. Avoid any harmful or inappropriate content

Remember to:
- Provide specific examples when explaining concepts
- Use appropriate formatting for code or technical terms
- Break down complex explanations into digestible parts
- Stay focused on the user's current question or task
`;

// Extract initial message from the prompt
export const getInitialMessage = (): string => {
  const match = MASTER_PROMPT.match(/Initial: "([^"]+)"/);
  return match ? match[1] : '';
};

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const MAX_RETRIES = 3;
const INITIAL_RETRY_DELAY = 2000; // 2 seconds

export const generateResponse = async (
  messages: { content: string; role: 'user' | 'assistant' }[]
): Promise<string> => {
  let retries = 0;
  let lastError: Error | null = null;

  while (retries < MAX_RETRIES) {
    try {
      console.log(`Attempt ${retries + 1} of ${MAX_RETRIES}`);
      
      const completion = await anthropic.messages.create({
        messages: messages.map(msg => ({
          role: msg.role,
          content: msg.content,
        })),
        system: MASTER_PROMPT,
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 1024,
      });

      console.log('Anthropic response:', completion);
      return completion.content[0]?.type === 'text' 
        ? completion.content[0].text
        : 'I apologize, but I was unable to generate a response.';
    } catch (error) {
      lastError = error as Error;
      console.error(`Error on attempt ${retries + 1}:`, error);

      if (error instanceof Error) {
        // Check if it's a rate limit error
        if (error.message.toLowerCase().includes('rate limit') || 
            error.message.toLowerCase().includes('resource_exhausted')) {
          const waitTime = INITIAL_RETRY_DELAY * Math.pow(2, retries);
          console.log(`Rate limited. Waiting ${waitTime}ms before retry...`);
          await delay(waitTime);
          retries++;
          continue;
        }
      }
      
      throw error;
    }
  }

  throw lastError || new Error('Max retries exceeded');
};
