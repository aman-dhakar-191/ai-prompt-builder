import { useState } from 'react';

export default function PromptGenerator({ onGenerate, isLoading }) {
  const [desiredOutput, setDesiredOutput] = useState('');
  const [context, setContext] = useState('');
  const [useCustomSystemPrompt, setUseCustomSystemPrompt] = useState(false);
  const [customSystemPrompt, setCustomSystemPrompt] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (desiredOutput.trim()) {
      // Pass parameters: desiredOutput, context, feedback (empty), currentPrompt (custom prompt if enabled)
      onGenerate(desiredOutput, context, '', useCustomSystemPrompt ? customSystemPrompt : '');
    }
  };

  // Computed validation for submit button
  const isSubmitDisabled = isLoading || !desiredOutput.trim() || (useCustomSystemPrompt && !customSystemPrompt.trim());

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="flex items-center space-x-2 mb-4">
        <div className="bg-gradient-to-r from-violet-500 to-indigo-500 p-2 rounded-lg">
          <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
        </div>
        <h2 className="text-lg font-semibold text-gray-800">Step 1: Generate System Instructions</h2>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="desiredOutput" className="block text-sm font-medium text-gray-700 mb-2">
            Desired Output Description *
          </label>
          <textarea
            id="desiredOutput"
            value={desiredOutput}
            onChange={(e) => setDesiredOutput(e.target.value)}
            placeholder="Describe what kind of output you want the AI to generate. Be specific about tone, format, length, and style..."
            rows={4}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-violet-500 transition-colors resize-none"
            required
          />
        </div>
        
        <div>
          <label htmlFor="context" className="block text-sm font-medium text-gray-700 mb-2">
            Additional Context (Optional)
          </label>
          <textarea
            id="context"
            value={context}
            onChange={(e) => setContext(e.target.value)}
            placeholder="Provide any additional context, constraints, or examples..."
            rows={3}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-violet-500 transition-colors resize-none"
          />
        </div>

        {/* Toggle for custom system prompt */}
        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200">
          <label htmlFor="useCustomSystemPrompt" className="flex items-center space-x-2 cursor-pointer">
            <input
              type="checkbox"
              id="useCustomSystemPrompt"
              checked={useCustomSystemPrompt}
              onChange={(e) => setUseCustomSystemPrompt(e.target.checked)}
              className="w-4 h-4 text-violet-600 border-gray-300 rounded focus:ring-violet-500"
            />
            <span className="text-sm font-medium text-gray-700">Start with my own system prompt</span>
          </label>
          {useCustomSystemPrompt && (
            <span className="text-xs text-gray-500">Custom base prompt enabled</span>
          )}
        </div>

        {/* Custom system prompt textarea */}
        {useCustomSystemPrompt && (
          <div>
            <label htmlFor="customSystemPrompt" className="block text-sm font-medium text-gray-700 mb-2">
              Initial System Prompt *
            </label>
            <textarea
              id="customSystemPrompt"
              value={customSystemPrompt}
              onChange={(e) => setCustomSystemPrompt(e.target.value)}
              placeholder="Enter your initial system prompt here. It will be refined based on your desired output description above..."
              rows={6}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-violet-500 transition-colors resize-none font-mono text-sm"
              required={useCustomSystemPrompt}
            />
            <p className="mt-1 text-xs text-gray-500">
              Your system prompt will be used as a starting point and refined based on the desired output and context above.
            </p>
          </div>
        )}
        
        <button
          type="submit"
          disabled={isSubmitDisabled}
          className="w-full bg-gradient-to-r from-violet-600 to-indigo-600 text-white py-3 px-6 rounded-lg font-medium hover:from-violet-700 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center space-x-2"
        >
          {isLoading ? (
            <>
              <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <span>Generating...</span>
            </>
          ) : (
            <>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              <span>Generate System Instructions</span>
            </>
          )}
        </button>
      </form>
    </div>
  );
}
