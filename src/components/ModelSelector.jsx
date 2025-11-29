import { useState, useEffect, useCallback } from 'react';
import { fetchAvailableModels, FALLBACK_MODELS } from '../services/openRouterApi';

export default function ModelSelector({ 
  generatorModel, 
  validatorModel, 
  onGeneratorModelChange, 
  onValidatorModelChange,
  apiKey 
}) {
  const [models, setModels] = useState(FALLBACK_MODELS);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [hasFetchedSuccessfully, setHasFetchedSuccessfully] = useState(false);
  const [lastFetchedWithKey, setLastFetchedWithKey] = useState('');

  const loadModels = useCallback(async () => {
    if (!apiKey) {
      setModels(FALLBACK_MODELS);
      setError('');
      setHasFetchedSuccessfully(false);
      return;
    }

    // Don't refetch if we already fetched successfully with this key
    if (lastFetchedWithKey === apiKey && hasFetchedSuccessfully) {
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const fetchedModels = await fetchAvailableModels(apiKey);
      setModels(fetchedModels);
      setLastFetchedWithKey(apiKey);
      setHasFetchedSuccessfully(true);
    } catch (err) {
      setError(err.message || 'Failed to fetch models');
      setModels(FALLBACK_MODELS);
      setHasFetchedSuccessfully(false);
    } finally {
      setIsLoading(false);
    }
  }, [apiKey, lastFetchedWithKey, hasFetchedSuccessfully]);

  useEffect(() => {
    if (apiKey) {
      loadModels();
    }
  }, [apiKey, loadModels]);

  const handleRefresh = () => {
    setLastFetchedWithKey(''); // Reset to force refetch
    setHasFetchedSuccessfully(false);
    loadModels();
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <svg className="w-5 h-5 text-violet-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
          <h2 className="text-lg font-semibold text-gray-800">Model Selection</h2>
          {isLoading && (
            <svg className="w-4 h-4 animate-spin text-violet-600" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          )}
        </div>
        <div className="flex items-center space-x-2">
          <span className="text-xs text-gray-500">{models.length} models available</span>
          <button
            onClick={handleRefresh}
            disabled={isLoading || !apiKey}
            className="p-1.5 text-gray-500 hover:text-violet-600 hover:bg-violet-50 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            title="Refresh models list"
          >
            <svg className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-4 text-sm text-amber-600 bg-amber-50 px-3 py-2 rounded-lg flex items-center space-x-2">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <span>Using fallback models: {error}</span>
        </div>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="generatorModel" className="block text-sm font-medium text-gray-700 mb-2">
            Generator Model
          </label>
          <select
            id="generatorModel"
            value={generatorModel}
            onChange={(e) => onGeneratorModelChange(e.target.value)}
            disabled={isLoading}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-violet-500 transition-colors bg-white disabled:bg-gray-100 disabled:cursor-wait"
          >
            {models.map((model) => (
              <option key={model.id} value={model.id}>
                {model.name}
              </option>
            ))}
          </select>
          <p className="mt-1 text-xs text-gray-500">Used for generating system instructions</p>
        </div>
        
        <div>
          <label htmlFor="validatorModel" className="block text-sm font-medium text-gray-700 mb-2">
            Validator Model
          </label>
          <select
            id="validatorModel"
            value={validatorModel}
            onChange={(e) => onValidatorModelChange(e.target.value)}
            disabled={isLoading}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-colors bg-white disabled:bg-gray-100 disabled:cursor-wait"
          >
            {models.map((model) => (
              <option key={model.id} value={model.id}>
                {model.name}
              </option>
            ))}
          </select>
          <p className="mt-1 text-xs text-gray-500">Used for validating with test prompts</p>
        </div>
      </div>
    </div>
  );
}
