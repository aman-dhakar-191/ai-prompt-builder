import { useState } from 'react';

export default function ApiKeyInput({ apiKey, onApiKeyChange }) {
  const [showKey, setShowKey] = useState(false);

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
      <div className="flex items-center space-x-2 mb-4">
        <svg className="w-5 h-5 text-violet-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
        </svg>
        <h2 className="text-lg font-semibold text-gray-800">OpenRouter API Key</h2>
      </div>
      <div className="relative">
        <input
          type={showKey ? 'text' : 'password'}
          value={apiKey}
          onChange={(e) => onApiKeyChange(e.target.value)}
          placeholder="Enter your OpenRouter API key..."
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-violet-500 transition-colors pr-24"
        />
        <button
          type="button"
          onClick={() => setShowKey(!showKey)}
          className="absolute right-2 top-1/2 -translate-y-1/2 px-3 py-1.5 text-sm text-gray-600 hover:text-violet-600 transition-colors"
        >
          {showKey ? 'Hide' : 'Show'}
        </button>
      </div>
      <p className="mt-2 text-sm text-gray-500">
        Get your API key from{' '}
        <a href="https://openrouter.ai/keys" target="_blank" rel="noopener noreferrer" className="text-violet-600 hover:underline">
          openrouter.ai/keys
        </a>
        {' '}and configure your{' '}
        <a href="https://openrouter.ai/settings/privacy" target="_blank" rel="noopener noreferrer" className="text-violet-600 hover:underline">
          privacy settings
        </a>
        {' '}if needed.
      </p>
    </div>
  );
}
