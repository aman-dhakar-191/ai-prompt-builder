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
 * @param {number} maxTokens - Maximum tokens for response
 * @returns {Promise<string>} - The response text
 */
async function makeOpenRouterRequest(model, messages, apiKey, maxTokens = 2048) {
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
      max_tokens: maxTokens,
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
  const systemPrompt = `You are an elite prompt engineer specializing in creating system instructions that maximize AI performance and consistency.

CORE PRINCIPLES:
1. Clarity over cleverness - Use direct, unambiguous language
2. Structure over prose - Organize instructions hierarchically
3. Specificity over generality - Provide concrete examples and constraints
4. Testability - Instructions should produce measurable, consistent outputs

INSTRUCTION FRAMEWORK:
Create system instructions following this structure:

**Role & Context:**
- Define WHO the AI is (expertise, perspective, tone)
- Establish WHAT domain/task it operates in
- Set the appropriate knowledge level and communication style

**Core Directives:**
- List PRIMARY objectives (2-4 maximum)
- Define success criteria explicitly
- Specify what to prioritize when objectives conflict

**Output Format:**
- Exact structure required (JSON, markdown, prose, etc.)
- Length constraints (word count, token limits)
- Required and optional elements
- Examples of ideal outputs

**Behavioral Constraints:**
- What the AI MUST do
- What the AI MUST NOT do
- How to handle edge cases and ambiguity
- Fallback behaviors for uncertain situations

**Quality Standards:**
- Accuracy requirements
- Tone and style guidelines
- How to balance competing needs (brevity vs completeness)

BEST PRACTICES:
- Use imperative verbs ("Analyze", "Format", "Prioritize")
- Provide 1-2 concrete examples when helpful
- Include decision trees for complex scenarios
- Specify error handling behavior
- Front-load the most critical instructions
- Use formatting (bold, lists, sections) for scannability
- Test instructions mentally: "Could this be misinterpreted?"

OUTPUT REQUIREMENTS:
Return ONLY the generated system instruction - no preamble, explanation, or meta-commentary. The instruction should be immediately usable as a system prompt.`;

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

  return makeOpenRouterRequest(model, messages, apiKey, 3000);
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
      content: `You are an expert prompt engineer and AI evaluator. Your goal is to provide actionable, specific feedback that will directly improve the system instruction.

EVALUATION FRAMEWORK:

**Instruction Following (Weight: 35%)**
- Did the AI follow the system instruction precisely?
- Were all directives executed?
- Did it ignore or misinterpret any part of the instruction?

**Expected Behavior Match (Weight: 35%)**
- How closely does the output match the expected behavior?
- Are there deviations in tone, format, or content?
- Did it achieve the core objective?

**Quality & Usability (Weight: 20%)**
- Is the output clear, coherent, and useful?
- Are there hallucinations, errors, or inconsistencies?
- Does it handle edge cases appropriately?

**Format Compliance (Weight: 10%)**
- Does it match required structure/format?
- Are length constraints respected?

ANALYSIS OUTPUT FORMAT:

SCORE: [1-10 with decimal, e.g., 7.5]

COMPLIANCE ANALYSIS:
✓ [What the AI did correctly]
✗ [What the AI failed to do or did incorrectly]
⚠ [Ambiguous areas or partial compliance]

INSTRUCTION GAPS:
[Specific missing elements in the system instruction that caused issues]
- "The instruction didn't specify..."
- "There's ambiguity around..."
- "The constraint about X wasn't clear enough..."

CONCRETE IMPROVEMENTS:
[Exact changes to make to the system instruction - be specific]
1. ADD: "[Exact text or directive to add]"
2. CLARIFY: "[Which part needs clarification and how]"
3. REMOVE/MODIFY: "[What to change and why]"
4. EXAMPLE NEEDED: "[Where an example would help]"

ROOT CAUSE:
[One-sentence diagnosis of the primary issue]

REVISED INSTRUCTION SNIPPET:
[Show a specific section of how the instruction should be rewritten]

PRIORITY: [HIGH/MEDIUM/LOW - How critical are these improvements?]

TESTING RECOMMENDATION:
[Suggest additional test prompts to validate the improvements]`
    },
    {
      role: 'user',
      content: `Evaluate this AI system instruction and its performance:

=== SYSTEM INSTRUCTION ===
${systemInstruction}

=== TEST PROMPT ===
${testPrompt}

=== EXPECTED BEHAVIOR ===
${expectedBehavior}

=== ACTUAL RESPONSE ===
${testResponse}

=== YOUR TASK ===
Analyze the response against the expected behavior and provide specific, actionable feedback to improve the system instruction. Focus on what changes to the instruction would prevent the issues observed.`
    }
  ];
  
  const analysis = await makeOpenRouterRequest(model, analysisMessages, apiKey, 2500);
  
  return {
    response: testResponse,
    analysis
  };
}

/**
 * Parse score from analysis text
 * @param {string} analysis - Analysis text
 * @returns {number} - Parsed score
 */
function parseScoreFromAnalysis(analysis) {
  const match = analysis.match(/SCORE:\s*(\d+\.?\d*)/);
  return match ? parseFloat(match[1]) : 0;
}

/**
 * Calculate consistency score from array of scores
 * @param {Array<number>} scores - Array of scores
 * @returns {number} - Consistency score (0-10)
 */
function calculateConsistency(scores) {
  if (scores.length <= 1) return 10;
  
  const mean = scores.reduce((a, b) => a + b, 0) / scores.length;
  const variance = scores.reduce((sum, score) => sum + Math.pow(score - mean, 2), 0) / scores.length;
  return Math.max(0, 10 - Math.sqrt(variance) * 2); // Higher is more consistent
}

/**
 * Validate with multiple test cases for comprehensive evaluation
 * @param {string} systemInstruction - The system instruction to validate
 * @param {Array<{prompt: string, expectedBehavior: string}>} testCases - Array of test cases
 * @param {string} apiKey - OpenRouter API key
 * @param {string} model - Optional model to use for validation
 * @returns {Promise<Object>} - Aggregated validation results
 */
export async function validateWithMultipleTests(systemInstruction, testCases, apiKey, model = VALIDATOR_MODEL) {
  const results = await Promise.all(
    testCases.map(testCase => 
      validateSystemInstructions(
        systemInstruction,
        testCase.prompt,
        testCase.expectedBehavior,
        apiKey,
        model
      )
    )
  );
  
  // Aggregate results
  const scores = results.map(r => parseScoreFromAnalysis(r.analysis));
  const avgScore = scores.reduce((a, b) => a + b, 0) / scores.length;
  
  return {
    individual: results,
    summary: {
      averageScore: avgScore.toFixed(2),
      passRate: ((scores.filter(s => s >= 7).length / scores.length) * 100).toFixed(1) + '%',
      consistencyScore: calculateConsistency(scores).toFixed(2),
      scoreRange: {
        min: Math.min(...scores),
        max: Math.max(...scores)
      }
    }
  };
}
