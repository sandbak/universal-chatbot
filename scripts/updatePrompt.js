const fs = require('fs');
const path = require('path');

// Read the master prompt from the markdown file
const promptPath = path.join(__dirname, '..', 'src', 'prompts', 'master.md');
const llmPath = path.join(__dirname, '..', 'src', 'services', 'llm.ts');

try {
  // Read the master prompt
  const masterPrompt = fs.readFileSync(promptPath, 'utf-8');
  
  // Read the current llm.ts file
  let llmContent = fs.readFileSync(llmPath, 'utf-8');
  
  // Replace the MASTER_PROMPT content
  llmContent = llmContent.replace(
    /const MASTER_PROMPT = `[^`]*`;/s,
    `const MASTER_PROMPT = \`${masterPrompt}\`;`
  );
  
  // Write the updated content back
  fs.writeFileSync(llmPath, llmContent);
  
  console.log('Successfully updated master prompt in llm.ts');
} catch (error) {
  console.error('Error updating master prompt:', error);
  process.exit(1);
}
