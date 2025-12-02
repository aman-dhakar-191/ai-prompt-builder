import { useState, useEffect, useCallback } from 'react';
import Header from './components/Header';
import ApiKeyInput from './components/ApiKeyInput';
import PromptGenerator from './components/PromptGenerator';
import SystemInstructionDisplay from './components/SystemInstructionDisplay';
import PromptValidator from './components/PromptValidator';
import ValidationResults from './components/ValidationResults';
import PerformanceScore from './components/PerformanceScore';
import HistoryPanel from './components/HistoryPanel';
import ModelSelector from './components/ModelSelector';
import ScoreDisplay from './components/ScoreDisplay';
import ExportButton from './components/ExportButton';
import PublishButton from './components/PublishButton';
import PromptTester from './components/PromptTester';
import PublicPrompts from './components/PublicPrompts';
import TabNavigation from './components/TabNavigation';
import { generateSystemInstructions, validateSystemInstructions, DEFAULT_GENERATOR_MODEL, DEFAULT_VALIDATOR_MODEL } from './services/openRouterApi';
import { 
  saveApiKey, 
  getApiKey, 
  saveHistoryEntry, 
  getHistory, 
  clearHistory as clearFirebaseHistory,
  isFirebaseAvailable 
} from './services/firebase';

function App() {
  const [apiKey, setApiKey] = useState('');
  const [isApiKeyLoading, setIsApiKeyLoading] = useState(true);

  // Load API key from Firebase or localStorage on mount
  useEffect(() => {
    const loadApiKey = async () => {
      try {
        const key = await getApiKey();
        setApiKey(key);
      } catch (error) {
        console.warn('Failed to load API key:', error);
      } finally {
        setIsApiKeyLoading(false);
      }
    };
    loadApiKey();
  }, []);

  const handleApiKeyChange = async (newKey) => {
    setApiKey(newKey);
    try {
      await saveApiKey(newKey);
    } catch (error) {
      console.warn('Failed to save API key:', error);
    }
  };

  const [systemInstruction, setSystemInstruction] = useState('');
  const [validationResults, setValidationResults] = useState(null);
  const [previousScore, setPreviousScore] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isValidating, setIsValidating] = useState(false);
  const [error, setError] = useState('');
  const [lastGenerationParams, setLastGenerationParams] = useState(null);
  
  // Model selection state
  const [generatorModel, setGeneratorModel] = useState(DEFAULT_GENERATOR_MODEL);
  const [validatorModel, setValidatorModel] = useState(DEFAULT_VALIDATOR_MODEL);
  
  // History state
  const [history, setHistory] = useState([]);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);

  // Tab navigation state
  const [activeTab, setActiveTab] = useState('builder');

  // Load history from Firebase or localStorage on mount
  useEffect(() => {
    const loadHistory = async () => {
      try {
        const loadedHistory = await getHistory();
        setHistory(loadedHistory);
      } catch {
        // Silently fail
      }
    };
    loadHistory();
  }, []);

  const addToHistory = useCallback(async (entry) => {
    try {
      await saveHistoryEntry(entry);
      // Reload history from storage
      const updatedHistory = await getHistory();
      setHistory(updatedHistory);
    } catch (error) {
      console.warn('Failed to save to history:', error);
      // Fallback to local state update
      setHistory(prev => [entry, ...prev].slice(0, 50));
    }
  }, []);

  const handleGenerate = async (desiredOutput, context, feedback = '', currentPrompt = '') => {
    if (!apiKey.trim()) {
      setError('Please enter your OpenRouter API key');
      return;
    }

    setError('');
    setIsGenerating(true);
    
    // Store previous score before clearing validation results
    if (validationResults && validationResults.length > 0) {
      const scores = validationResults
        .map(r => {
          const match = r.analysis?.match(/SCORE:\s*(\d+\.?\d*)/i);
          return match ? parseFloat(match[1]) : 0;
        })
        .filter(s => s > 0);
      if (scores.length > 0) {
        setPreviousScore(scores.reduce((a, b) => a + b, 0) / scores.length);
      }
    }
    
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
      await addToHistory({
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

  const handleClearHistory = async () => {
    try {
      await clearFirebaseHistory();
      setHistory([]);
    } catch (error) {
      console.warn('Failed to clear history:', error);
      setHistory([]);
    }
  };

  // Test prompt handler for PromptTester
  const handleTestPrompt = async (systemInstr, testInput, model) => {
    const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/chat/completions';
    
    const response = await fetch(OPENROUTER_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'HTTP-Referer': window.location.origin,
        'X-Title': 'AI Prompt Builder',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: model || validatorModel,
        messages: [
          { role: 'system', content: systemInstr },
          { role: 'user', content: testInput }
        ],
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
  };

  // Handle using a public prompt
  const handleUsePublicPrompt = (prompt) => {
    setSystemInstruction(prompt.instruction);
    setLastGenerationParams({
      desiredOutput: prompt.desiredOutput || '',
      context: prompt.context || '',
    });
    setValidationResults(null);
    setActiveTab('builder');
  };

  // Handle refining a public prompt
  const handleRefinePublicPrompt = (prompt) => {
    setSystemInstruction(prompt.instruction);
    setLastGenerationParams({
      desiredOutput: prompt.desiredOutput || '',
      context: prompt.context || '',
    });
    setValidationResults(null);
    setActiveTab('builder');
    // Open the builder tab and allow refinement
  };

  // Tab configuration
  const tabs = [
    {
      id: 'builder',
      label: 'Prompt Builder',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      ),
    },
    {
      id: 'test',
      label: 'Test Prompt',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
    },
    {
      id: 'showcase',
      label: 'Public Prompts',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      ),
      badge: isFirebaseAvailable() ? null : '!',
    },
  ];

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

        {/* Loading indicator for API key */}
        {isApiKeyLoading && (
          <div className="bg-violet-50 border border-violet-200 text-violet-700 px-4 py-3 rounded-lg mb-6 flex items-center space-x-2">
            <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <span>Loading your settings...</span>
          </div>
        )}

        <ApiKeyInput apiKey={apiKey} onApiKeyChange={handleApiKeyChange} />
        
        {/* Tab Navigation */}
        <TabNavigation 
          activeTab={activeTab} 
          onTabChange={setActiveTab} 
          tabs={tabs} 
        />

        {/* Builder Tab Content */}
        {activeTab === 'builder' && (
          <>
            {/* Model Selection */}
            <ModelSelector
              generatorModel={generatorModel}
              validatorModel={validatorModel}
              onGeneratorModelChange={setGeneratorModel}
              onValidatorModelChange={setValidatorModel}
              apiKey={apiKey}
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

            {/* Performance Score Section */}
            <PerformanceScore 
              validationResults={validationResults}
              previousScore={previousScore}
            />

            {/* Export and Publish Buttons */}
            {systemInstruction && (
              <div className="mt-6 flex flex-wrap gap-3 justify-end">
                <ExportButton
                  systemInstruction={systemInstruction}
                  validationResults={validationResults}
                  desiredOutput={lastGenerationParams?.desiredOutput}
                  context={lastGenerationParams?.context}
                  model={generatorModel}
                />
                <PublishButton
                  systemInstruction={systemInstruction}
                  validationResults={validationResults}
                  desiredOutput={lastGenerationParams?.desiredOutput}
                  context={lastGenerationParams?.context}
                  model={generatorModel}
                />
              </div>
            )}
          </>
        )}

        {/* Test Tab Content */}
        {activeTab === 'test' && (
          <PromptTester
            systemInstruction={systemInstruction}
            apiKey={apiKey}
            model={validatorModel}
            onTest={handleTestPrompt}
          />
        )}

        {/* Public Prompts Showcase Tab */}
        {activeTab === 'showcase' && (
          <PublicPrompts
            onUsePrompt={handleUsePublicPrompt}
            onRefinePrompt={handleRefinePublicPrompt}
          />
        )}
      </main>

      <footer className={`bg-white border-t border-gray-200 mt-12 transition-all duration-300 ${isHistoryOpen ? 'ml-80' : 'ml-0'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <p className="text-center text-gray-500 text-sm">
            AI Prompt Builder • Powered by OpenRouter
            {isFirebaseAvailable() && (
              <span className="ml-2 text-green-600">
                • Firebase Connected
              </span>
            )}
          </p>
        </div>
      </footer>
    </div>
  );
}

export default App;
