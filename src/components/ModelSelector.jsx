import { AVAILABLE_MODELS } from '../services/openRouterApi';

export default function ModelSelector({ 
  generatorModel, 
  validatorModel, 
  onGeneratorModelChange, 
  onValidatorModelChange 
}) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
      <div className="flex items-center space-x-2 mb-4">
        <svg className="w-5 h-5 text-violet-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
        <h2 className="text-lg font-semibold text-gray-800">Model Selection</h2>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="generatorModel" className="block text-sm font-medium text-gray-700 mb-2">
            Generator Model
          </label>
          <select
            id="generatorModel"
            value={generatorModel}
            onChange={(e) => onGeneratorModelChange(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-violet-500 transition-colors bg-white"
          >
            {AVAILABLE_MODELS.map((model) => (
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
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-colors bg-white"
          >
            {AVAILABLE_MODELS.map((model) => (
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
