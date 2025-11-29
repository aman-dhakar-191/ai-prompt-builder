import { useState } from 'react';
import Header from './components/Header';
import ApiKeyInput from './components/ApiKeyInput';
import PromptGenerator from './components/PromptGenerator';
import SystemInstructionDisplay from './components/SystemInstructionDisplay';
import PromptValidator from './components/PromptValidator';
import ValidationResults from './components/ValidationResults';
import HistoryPanel from './components/HistoryPanel';
import ModelSelector from './components/ModelSelector';
import { generateSystemInstructions, validateSystemInstructions, DEFAULT_GENERATOR_MODEL, DEFAULT_VALIDATOR_MODEL } from './services/openRouterApi';

const API_KEY_STORAGE_KEY = 'openRouterApiKey';
const HISTORY_STORAGE_KEY = 'promptHistory';

function App() {
  const [apiKey, setApiKey] = useState(() => {
    try {
      return sessionStorage.getItem(API_KEY_STORAGE_KEY) || '';
    } catch {
      return '';
    }
  });

  const handleApiKeyChange = (newKey) => {
    setApiKey(newKey);
    try {
      sessionStorage.setItem(API_KEY_STORAGE_KEY, newKey);
    } catch {
      // Silently fail if sessionStorage is unavailable
    }
  };

  const [systemInstruction, setSystemInstruction] = useState('');
  const [validationResults, setValidationResults] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isValidating, setIsValidating] = useState(false);
  const [error, setError] = useState('');
  const [lastGenerationParams, setLastGenerationParams] = useState(null);
  
  // Model selection state
  const [generatorModel, setGeneratorModel] = useState(DEFAULT_GENERATOR_MODEL);
  const [validatorModel, setValidatorModel] = useState(DEFAULT_VALIDATOR_MODEL);
  
  // History state
  const [history, setHistory] = useState(() => {
    try {
      const saved = sessionStorage.getItem(HISTORY_STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);

  const addToHistory = (entry) => {
    const newHistory = [entry, ...history].slice(0, 50); // Keep last 50 entries
    setHistory(newHistory);
    try {
      sessionStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(newHistory));
    } catch {
      // Silently fail if sessionStorage is unavailable
    }
  };

  const handleGenerate = async (desiredOutput, context, feedback = '', currentPrompt = '') => {
    if (!apiKey.trim()) {
      setError('Please enter your OpenRouter API key');
      return;
    }

    setError('');
    setIsGenerating(true);
    setValidationResults(null);
    setLastGenerationParams({ desiredOutput, context });

    try {
      const instruction = await generateSystemInstructions(
        desiredOutput, 
        context, 
        apiKey, 
        feedback, 
        currentPrompt,
        generatorModel
      );
      setSystemInstruction(instruction);
      
      // Add to history
      addToHistory({
        id: Date.now(),
        timestamp: new Date().toISOString(),
        desiredOutput,
        context,
        instruction,
        feedback: feedback || null,
        model: generatorModel,
      });
    } catch (err) {
      setError(err.message || 'Failed to generate system instructions');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleValidate = async (testPrompts) => {
    if (!apiKey.trim()) {
      setError('Please enter your OpenRouter API key');
      return;
    }

    setError('');
    setIsValidating(true);

    try {
      // Validate with multiple test prompts
      const results = await Promise.all(
        testPrompts.map(({ testPrompt, expectedBehavior }) =>
          validateSystemInstructions(
            systemInstruction,
            testPrompt,
            expectedBehavior,
            apiKey,
            validatorModel
          ).then(result => ({
            ...result,
            testPrompt,
            expectedBehavior,
          }))
        )
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
    // Pass current system instruction so it can be improved
    await handleGenerate(
      lastGenerationParams.desiredOutput, 
      lastGenerationParams.context, 
      feedback,
      systemInstruction
    );
  };

  const handleSelectHistoryItem = (item) => {
    setSystemInstruction(item.instruction);
    setLastGenerationParams({ 
      desiredOutput: item.desiredOutput, 
      context: item.context 
    });
    setValidationResults(null);
  };

  const handleClearHistory = () => {
    setHistory([]);
    try {
      sessionStorage.removeItem(HISTORY_STORAGE_KEY);
    } catch {
      // Silently fail
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <Header />
      
      {/* History Panel */}
      <HistoryPanel
        history={history}
        isOpen={isHistoryOpen}
        onToggle={() => setIsHistoryOpen(!isHistoryOpen)}
        onSelectItem={handleSelectHistoryItem}
        onClearHistory={handleClearHistory}
      />
      
      <main className={`transition-all duration-300 ${isHistoryOpen ? 'ml-80' : 'ml-0'} max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8`}>
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

        <ApiKeyInput apiKey={apiKey} onApiKeyChange={handleApiKeyChange} />
        
        {/* Model Selection */}
        <ModelSelector
          generatorModel={generatorModel}
          validatorModel={validatorModel}
          onGeneratorModelChange={setGeneratorModel}
          onValidatorModelChange={setValidatorModel}
        />
        
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

      <footer className={`bg-white border-t border-gray-200 mt-12 transition-all duration-300 ${isHistoryOpen ? 'ml-80' : 'ml-0'}`}>
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
