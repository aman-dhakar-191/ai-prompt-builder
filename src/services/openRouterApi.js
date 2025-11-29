const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/chat/completions';

// Model for generating system instructions
const GENERATOR_MODEL = 'google/gemini-2.0-flash-001';
// Model for validating prompts
const VALIDATOR_MODEL = 'google/gemini-2.0-flash-001';

// Available models for selection
export const AVAILABLE_MODELS = [
  { id: 'google/gemini-2.0-flash-001', name: 'Google Gemini 2.0 Flash' },
  { id: 'google/gemini-2.5-flash-preview', name: 'Google Gemini 2.5 Flash Preview' },
  { id: 'google/gemini-2.5-pro-preview', name: 'Google Gemini 2.5 Pro Preview' },
  { id: 'openai/gpt-4o-mini', name: 'OpenAI GPT-4o Mini' },
  { id: 'openai/gpt-4o', name: 'OpenAI GPT-4o' },
  { id: 'anthropic/claude-3.5-sonnet', name: 'Anthropic Claude 3.5 Sonnet' },
  { id: 'anthropic/claude-3-haiku', name: 'Anthropic Claude 3 Haiku' },
  { id: 'meta-llama/llama-3.1-70b-instruct', name: 'Meta Llama 3.1 70B' },
  { id: 'meta-llama/llama-3.1-8b-instruct', name: 'Meta Llama 3.1 8B' },
];

export const DEFAULT_GENERATOR_MODEL = GENERATOR_MODEL;
export const DEFAULT_VALIDATOR_MODEL = VALIDATOR_MODEL;

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
 * @param {string} feedback - Optional feedback from validation to improve the instruction
 * @param {string} currentSystemPrompt - Optional current system prompt to improve upon
 * @param {string} model - Optional model to use for generation
 * @returns {Promise<string>} - Generated system instructions
 */
export async function generateSystemInstructions(desiredOutput, context, apiKey, feedback = '', currentSystemPrompt = '', model = GENERATOR_MODEL) {
  const systemPrompt = `You are an expert prompt engineer. Your task is to create clear, effective system instructions that will guide an AI to produce the desired output. 

When creating system instructions:
1. Be specific and clear about the expected behavior
2. Define the role and persona of the AI
3. Specify output format if needed
4. Include constraints and guidelines
5. Add examples if helpful

Return ONLY the system instruction, without any explanation or metadata.`;

  let userPrompt = `Create a system instruction for an AI assistant that will produce the following output:

Desired Output: ${desiredOutput}

${context ? `Additional Context: ${context}` : ''}`;

  if (feedback && currentSystemPrompt) {
    userPrompt += `

CURRENT SYSTEM PROMPT (to be improved):
${currentSystemPrompt}

IMPORTANT - Validation Feedback:
The above system instruction was validated and received the following feedback. Please improve the existing prompt by incorporating these suggestions:

${feedback}

Generate an improved version of the current system instruction that addresses the feedback while preserving what works well.`;
  } else if (feedback) {
    userPrompt += `

IMPORTANT - Previous Validation Feedback:
The previous system instruction was validated and received the following feedback. Please incorporate these improvements:

${feedback}

Generate an improved system instruction that addresses the feedback above while still producing the desired output.`;
  } else {
    userPrompt += `

Generate a comprehensive system instruction that will guide the AI to consistently produce this type of output.`;
  }

  const messages = [
    {
      role: 'system',
      content: systemPrompt
    },
    {
      role: 'user',
      content: userPrompt
    }
  ];

  return makeOpenRouterRequest(model, messages, apiKey);
}

/**
 * Validate system instructions with test prompts
 * @param {string} systemInstruction - The system instruction to validate
 * @param {string} testPrompt - Test prompt to use
 * @param {string} expectedBehavior - Expected behavior description
 * @param {string} apiKey - OpenRouter API key
 * @param {string} model - Optional model to use for validation
 * @returns {Promise<Object>} - Validation result with response and analysis
 */
export async function validateSystemInstructions(systemInstruction, testPrompt, expectedBehavior, apiKey, model = VALIDATOR_MODEL) {
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

  const testResponse = await makeOpenRouterRequest(model, testMessages, apiKey);

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

  const analysis = await makeOpenRouterRequest(model, analysisMessages, apiKey);

  return {
    response: testResponse,
    analysis
  };
}
