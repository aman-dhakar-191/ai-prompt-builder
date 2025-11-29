const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/chat/completions';

// Model for generating system instructions
const GENERATOR_MODEL = 'google/gemini-2.0-flash-001';
// Model for validating prompts
const VALIDATOR_MODEL = 'google/gemini-2.0-flash-001';

/**
 * Make a request to OpenRouter API
 * @param {string} model - The model to use
 * @param {Array} messages - Array of message objects
 * @param {string} apiKey - OpenRouter API key
 * @returns {Promise<string>} - The response text
 */
async function makeOpenRouterRequest(model, messages, apiKey) {
  const response = await fetch(OPENROUTER_API_URL, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'HTTP-Referer': window.location.origin,
      'X-Title': 'AI Prompt Builder',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model,
      messages,
      temperature: 0.7,
      max_tokens: 2048,
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error?.message || 'API request failed');
  }

  const data = await response.json();
  return data.choices[0]?.message?.content || '';
}

/**
 * Generate system instructions based on desired output
 * @param {string} desiredOutput - Description of desired output
 * @param {string} context - Additional context
 * @param {string} apiKey - OpenRouter API key
 * @returns {Promise<string>} - Generated system instructions
 */
export async function generateSystemInstructions(desiredOutput, context, apiKey) {
  const messages = [
    {
      role: 'system',
      content: `You are an expert prompt engineer. Your task is to create clear, effective system instructions that will guide an AI to produce the desired output. 

When creating system instructions:
1. Be specific and clear about the expected behavior
2. Define the role and persona of the AI
3. Specify output format if needed
4. Include constraints and guidelines
5. Add examples if helpful

Return ONLY the system instruction, without any explanation or metadata.`
    },
    {
      role: 'user',
      content: `Create a system instruction for an AI assistant that will produce the following output:

Desired Output: ${desiredOutput}

${context ? `Additional Context: ${context}` : ''}

Generate a comprehensive system instruction that will guide the AI to consistently produce this type of output.`
    }
  ];

  return makeOpenRouterRequest(GENERATOR_MODEL, messages, apiKey);
}

/**
 * Validate system instructions with test prompts
 * @param {string} systemInstruction - The system instruction to validate
 * @param {string} testPrompt - Test prompt to use
 * @param {string} expectedBehavior - Expected behavior description
 * @param {string} apiKey - OpenRouter API key
 * @returns {Promise<Object>} - Validation result with response and analysis
 */
export async function validateSystemInstructions(systemInstruction, testPrompt, expectedBehavior, apiKey) {
  // First, generate a response using the system instruction
  const testMessages = [
    {
      role: 'system',
      content: systemInstruction
    },
    {
      role: 'user',
      content: testPrompt
    }
  ];

  const testResponse = await makeOpenRouterRequest(VALIDATOR_MODEL, testMessages, apiKey);

  // Then, analyze if the response matches the expected behavior
  const analysisMessages = [
    {
      role: 'system',
      content: `You are an expert at evaluating AI outputs. Analyze if the generated response matches the expected behavior and provide constructive feedback.

Return your analysis in the following format:
SCORE: [1-10]
STRENGTHS: [List of what works well]
IMPROVEMENTS: [List of suggested improvements]
OVERALL: [Brief summary of the evaluation]`
    },
    {
      role: 'user',
      content: `Evaluate the following AI response:

SYSTEM INSTRUCTION USED:
${systemInstruction}

TEST PROMPT:
${testPrompt}

EXPECTED BEHAVIOR:
${expectedBehavior}

ACTUAL RESPONSE:
${testResponse}

Analyze how well the response matches the expected behavior.`
    }
  ];

  const analysis = await makeOpenRouterRequest(VALIDATOR_MODEL, analysisMessages, apiKey);

  return {
    response: testResponse,
    analysis
  };
}
