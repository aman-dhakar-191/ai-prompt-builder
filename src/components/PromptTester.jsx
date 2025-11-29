import { useState } from 'react';

export default function PromptTester({ 
  systemInstruction, 
  apiKey, 
  model,
  onTest 
}) {
  const [testInput, setTestInput] = useState('');
  const [response, setResponse] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [showCode, setShowCode] = useState(false);

  const handleTest = async (e) => {
    e.preventDefault();
    
    if (!testInput.trim()) {
      setError('Please enter a test prompt');
      return;
    }
    
    if (!apiKey) {
      setError('Please enter your OpenRouter API key first');
      return;
    }
    
    if (!systemInstruction) {
      setError('Please generate or enter a system instruction first');
      return;
    }
    
    setError('');
    setIsLoading(true);
    
    try {
      const result = await onTest(systemInstruction, testInput, model);
      setResponse(result);
    } catch (err) {
      setError(err.message || 'Failed to test prompt');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyCode = async () => {
    const code = generateAPICode();
    await navigator.clipboard.writeText(code);
  };

  const generateAPICode = () => {
    return `// OpenRouter API Integration Example
const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer YOUR_API_KEY',
    'HTTP-Referer': window.location.origin,
    'X-Title': 'Your App Name',
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    model: '${model || 'google/gemini-2.0-flash-001'}',
    messages: [
      {
        role: 'system',
        content: \`${systemInstruction?.replace(/`/g, '\\`') || 'Your system instruction here'}\`
      },
      {
        role: 'user',
        content: userMessage
      }
    ],
    temperature: 0.7,
    max_tokens: 2048,
  }),
});

const data = await response.json();
const aiResponse = data.choices[0]?.message?.content;`;
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <div className="bg-gradient-to-r from-cyan-500 to-blue-500 p-2 rounded-lg">
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="text-lg font-semibold text-gray-800">Test Your Prompt</h2>
        </div>
        
        {/* Toggle code view button */}
        <button
          onClick={() => setShowCode(!showCode)}
          className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
            showCode 
              ? 'bg-violet-100 text-violet-700' 
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
          </svg>
          <span>{showCode ? 'Hide Code' : 'Show Code'}</span>
        </button>
      </div>

      {!systemInstruction && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-4">
          <div className="flex items-center space-x-2 text-amber-700">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <span className="text-sm">Generate a system instruction first to test it here.</span>
          </div>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4 flex items-center space-x-2">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span className="text-sm">{error}</span>
        </div>
      )}

      {/* Code Container - Toggleable */}
      {showCode && systemInstruction && (
        <div className="mb-6 relative">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-700">API Integration Code</h3>
            <button
              onClick={handleCopyCode}
              className="flex items-center space-x-1 px-2 py-1 text-xs text-violet-600 hover:bg-violet-50 rounded transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
              <span>Copy</span>
            </button>
          </div>
          <div className="bg-gray-900 rounded-lg p-4 overflow-x-auto">
            <pre className="text-sm text-gray-100 font-mono whitespace-pre-wrap">
              {generateAPICode()}
            </pre>
          </div>
        </div>
      )}

      <form onSubmit={handleTest} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Test Prompt
          </label>
          <textarea
            value={testInput}
            onChange={(e) => setTestInput(e.target.value)}
            placeholder="Enter any prompt to test your system instruction..."
            rows={3}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-colors resize-none"
            disabled={!systemInstruction}
          />
        </div>

        <button
          type="submit"
          disabled={isLoading || !systemInstruction || !testInput.trim()}
          className="w-full bg-gradient-to-r from-cyan-500 to-blue-500 text-white py-3 px-6 rounded-lg font-medium hover:from-cyan-600 hover:to-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center space-x-2"
        >
          {isLoading ? (
            <>
              <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <span>Testing...</span>
            </>
          ) : (
            <>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>Run Test</span>
            </>
          )}
        </button>
      </form>

      {/* Response Display */}
      {response && (
        <div className="mt-6">
          <h3 className="text-sm font-medium text-gray-700 mb-2 flex items-center space-x-2">
            <svg className="w-4 h-4 text-cyan-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
            </svg>
            <span>AI Response</span>
          </h3>
          <div className="bg-cyan-50 rounded-lg p-4 border border-cyan-200">
            <pre className="whitespace-pre-wrap text-sm text-gray-700 font-mono leading-relaxed">
              {response}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
}
