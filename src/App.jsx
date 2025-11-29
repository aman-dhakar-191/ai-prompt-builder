import { useState } from 'react';
import Header from './components/Header';
import ApiKeyInput from './components/ApiKeyInput';
import PromptGenerator from './components/PromptGenerator';
import SystemInstructionDisplay from './components/SystemInstructionDisplay';
import PromptValidator from './components/PromptValidator';
import ValidationResults from './components/ValidationResults';
import { generateSystemInstructions, validateSystemInstructions } from './services/openRouterApi';

function App() {
  const [apiKey, setApiKey] = useState('');
  const [systemInstruction, setSystemInstruction] = useState('');
  const [validationResults, setValidationResults] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isValidating, setIsValidating] = useState(false);
  const [error, setError] = useState('');
  const [lastGenerationParams, setLastGenerationParams] = useState(null);

  const handleGenerate = async (desiredOutput, context, feedback = '') => {
    if (!apiKey.trim()) {
      setError('Please enter your OpenRouter API key');
      return;
    }

    setError('');
    setIsGenerating(true);
    setValidationResults(null);
    setLastGenerationParams({ desiredOutput, context });

    try {
      const instruction = await generateSystemInstructions(desiredOutput, context, apiKey, feedback);
      setSystemInstruction(instruction);
    } catch (err) {
      setError(err.message || 'Failed to generate system instructions');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleValidate = async (testPrompt, expectedBehavior) => {
    if (!apiKey.trim()) {
      setError('Please enter your OpenRouter API key');
      return;
    }

    setError('');
    setIsValidating(true);

    try {
      const results = await validateSystemInstructions(
        systemInstruction,
        testPrompt,
        expectedBehavior,
        apiKey
      );
      setValidationResults(results);
    } catch (err) {
      setError(err.message || 'Failed to validate system instructions');
    } finally {
      setIsValidating(false);
    }
  };

  const handleEditInstruction = (newInstruction) => {
    setSystemInstruction(newInstruction);
    setValidationResults(null);
  };

  const handleRegenerateWithFeedback = async (feedback) => {
    if (!lastGenerationParams) {
      setError('No previous generation found. Please generate instructions first.');
      return;
    }
    await handleGenerate(lastGenerationParams.desiredOutput, lastGenerationParams.context, feedback);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6 flex items-center space-x-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>{error}</span>
            <button 
              onClick={() => setError('')} 
              className="ml-auto text-red-500 hover:text-red-700"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        )}

        <ApiKeyInput apiKey={apiKey} onApiKeyChange={setApiKey} />
        
        <PromptGenerator 
          onGenerate={handleGenerate} 
          isLoading={isGenerating} 
        />
        
        {/* Side-by-side layout for Step 1 and Step 2 */}
        {systemInstruction && (
          <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
            <SystemInstructionDisplay 
              instruction={systemInstruction} 
              onEdit={handleEditInstruction}
            />
            
            <PromptValidator 
              onValidate={handleValidate}
              isLoading={isValidating}
            />
          </div>
        )}
        
        <ValidationResults 
          results={validationResults}
          onRegenerateWithFeedback={handleRegenerateWithFeedback}
          isRegenerating={isGenerating}
        />
      </main>

      <footer className="bg-white border-t border-gray-200 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <p className="text-center text-gray-500 text-sm">
            AI Prompt Builder • Powered by OpenRouter
          </p>
        </div>
      </footer>
    </div>
  );
}

export default App;
