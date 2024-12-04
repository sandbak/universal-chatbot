import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.REACT_APP_LLM_API_KEY,
  dangerouslyAllowBrowser: true // Note: In production, you should proxy requests through your backend
});

console.log('OpenAI API Key:', process.env.REACT_APP_LLM_API_KEY?.substring(0, 10) + '...');

// Import the master prompt content
const MASTER_PROMPT = `ACTIVE PROMPT:
# Medical Specialist Patient Intake Guide

Purpose: Information gathering only. No diagnosis or treatment recommendations.

Initial: "Welcome! I'm here to understand what brings you in today."

1. Nature
   - "What's your main concern?"
   - If acute: "When/how did this happen?"
   - If chronic: "When did it start? What were you doing?"

2. Symptoms
   - Location/character
   - Severity (1-10)
   - Pattern and triggers
   - Duration/persistence

3. Impact
   - Effect on specific activities
   - Pattern of limitations

4. History
   - Previous similar issues
   - Relevant conditions

5. Closure
   - "Thank you for providing this information. We have stored it and look forward to seeing you at your appointment time."

```markdown
### Patient Presentation Summary

**Primary Concern**: [Main complaint + onset]

**Symptom Details**:
- Location/character
- Severity
- Pattern/triggers
- Duration

**Functional Impact**: [Activity limitations]

**History**: [Relevant conditions]
```


DISABLED VERSION:
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
      
      const completion = await openai.chat.completions.create({
        messages: [
          { role: 'system', content: MASTER_PROMPT },
          ...messages
        ],
        model: 'gpt-3.5-turbo',
      });

      console.log('OpenAI response:', completion);
      return completion.choices[0]?.message?.content || 'I apologize, but I was unable to generate a response.';
    } catch (error) {
      lastError = error as Error;
      console.error(`Error on attempt ${retries + 1}:`, error);

      if (error instanceof Error) {
        // Check if it's a rate limit error
        if (error.message.toLowerCase().includes('rate limit') || 
            error.message.toLowerCase().includes('resource_exhausted')) {
          const waitTime = INITIAL_RETRY_DELAY * Math.pow(2, retries);
          console.log(`Rate limit hit. Waiting ${waitTime}ms before retry...`);
          await delay(waitTime);
          retries++;
          continue;
        }

        // If it's not a rate limit error, throw immediately
        throw new Error(`Failed to generate response: ${error.message}`);
      }
    }
    retries++;
  }

  // If we've exhausted all retries
  if (lastError) {
    throw new Error(
      lastError.message.toLowerCase().includes('rate limit') ?
      'Rate limit exceeded. Please try again in a few minutes.' :
      `Failed to generate response after ${MAX_RETRIES} attempts: ${lastError.message}`
    );
  }

  throw new Error('Failed to generate response. Please try again.');
};
