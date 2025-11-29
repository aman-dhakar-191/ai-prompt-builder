import { useState, useEffect } from 'react';
import { subscribeToPublicPrompts, isFirebaseAvailable, updatePublicPrompt } from '../services/firebase';
import { parseScoreFromAnalysis, getScoreColorsLight } from '../utils/scoreUtils';

function formatDate(timestamp) {
  if (!timestamp) return '';
  const date = new Date(timestamp);
  return date.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export default function PublicPrompts({ onUsePrompt, onRefinePrompt }) {
  const [prompts, setPrompts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [expandedId, setExpandedId] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('score'); // 'score', 'date', 'refinements'

  useEffect(() => {
    if (!isFirebaseAvailable()) {
      // Use a microtask to avoid synchronous setState in effect body
      queueMicrotask(() => setIsLoading(false));
      return;
    }

    const unsubscribe = subscribeToPublicPrompts((fetchedPrompts) => {
      setPrompts(fetchedPrompts);
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleView = async (promptId) => {
    if (expandedId === promptId) {
      setExpandedId(null);
    } else {
      setExpandedId(promptId);
      // Increment view count
      try {
        const prompt = prompts.find(p => p.id === promptId);
        if (prompt) {
          await updatePublicPrompt(promptId, { views: (prompt.views || 0) + 1 });
        }
      } catch {
        // Silently fail for view count
      }
    }
  };

  const handleCopy = async (text) => {
    await navigator.clipboard.writeText(text);
  };

  // Filter and sort prompts
  const filteredPrompts = prompts
    .filter(prompt => {
      if (!searchQuery) return true;
      const query = searchQuery.toLowerCase();
      return (
        prompt.instruction?.toLowerCase().includes(query) ||
        prompt.desiredOutput?.toLowerCase().includes(query) ||
        prompt.context?.toLowerCase().includes(query)
      );
    })
    .sort((a, b) => {
      if (sortBy === 'score') return (b.score || 0) - (a.score || 0);
      if (sortBy === 'date') return new Date(b.publishedAt) - new Date(a.publishedAt);
      if (sortBy === 'refinements') return (b.refinements || 0) - (a.refinements || 0);
      return 0;
    });

  if (!isFirebaseAvailable()) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="text-center py-8">
          <svg className="w-16 h-16 mx-auto text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
          </svg>
          <h3 className="text-lg font-medium text-gray-700 mb-2">Firebase Not Configured</h3>
          <p className="text-gray-500 text-sm">
            Public prompts require Firebase configuration. Add your Firebase credentials to enable this feature.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-2">
          <div className="bg-gradient-to-r from-purple-500 to-pink-500 p-2 rounded-lg">
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-800">Public Prompts</h2>
            <p className="text-xs text-gray-500">Community-shared prompts with quality scores</p>
          </div>
        </div>
        <span className="text-sm text-gray-500">{filteredPrompts.length} prompts</span>
      </div>

      {/* Search and Sort */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="flex-1 relative">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search prompts..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-sm"
          />
        </div>
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-sm bg-white"
        >
          <option value="score">Sort by Score</option>
          <option value="date">Sort by Date</option>
          <option value="refinements">Sort by Refinements</option>
        </select>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="flex items-center justify-center py-12">
          <svg className="animate-spin h-8 w-8 text-purple-600" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        </div>
      )}

      {/* Empty State */}
      {!isLoading && filteredPrompts.length === 0 && (
        <div className="text-center py-12">
          <svg className="w-16 h-16 mx-auto text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <h3 className="text-lg font-medium text-gray-700 mb-2">No Public Prompts Yet</h3>
          <p className="text-gray-500 text-sm">
            {searchQuery 
              ? 'No prompts match your search. Try a different query.'
              : 'Be the first to share a prompt with the community!'}
          </p>
        </div>
      )}

      {/* Prompts List */}
      {!isLoading && filteredPrompts.length > 0 && (
        <div className="space-y-4 max-h-[600px] overflow-y-auto pr-1">
          {filteredPrompts.map((prompt) => {
            const score = prompt.score || parseScoreFromAnalysis(prompt.validationResults?.[0]?.analysis);
            const scoreColors = getScoreColorsLight(score);
            const isExpanded = expandedId === prompt.id;

            return (
              <div 
                key={prompt.id}
                className={`border rounded-lg overflow-hidden transition-all duration-200 ${
                  isExpanded ? 'border-purple-300 shadow-md' : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                {/* Header */}
                <button
                  onClick={() => handleView(prompt.id)}
                  className="w-full px-4 py-3 flex items-start justify-between bg-gray-50 hover:bg-gray-100 transition-colors text-left"
                >
                  <div className="flex-1 min-w-0 mr-4">
                    <p className="text-sm font-medium text-gray-800 line-clamp-2">
                      {prompt.desiredOutput || prompt.instruction?.substring(0, 100) + '...'}
                    </p>
                    <div className="flex items-center space-x-3 mt-2 text-xs text-gray-500">
                      <span>{formatDate(prompt.publishedAt)}</span>
                      <span className="flex items-center space-x-1">
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                        <span>{prompt.views || 0}</span>
                      </span>
                      {prompt.refinements > 0 && (
                        <span className="flex items-center space-x-1">
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                          </svg>
                          <span>{prompt.refinements}</span>
                        </span>
                      )}
                      {prompt.isRefinement && (
                        <span className="bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded text-xs">
                          Refinement
                        </span>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    {score > 0 && (
                      <span className={`px-2 py-1 rounded text-sm font-medium ${scoreColors.bg} ${scoreColors.text} ${scoreColors.border} border`}>
                        {score.toFixed(1)}/10
                      </span>
                    )}
                    <svg 
                      className={`w-5 h-5 text-gray-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                      fill="none" 
                      stroke="currentColor" 
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </button>

                {/* Expanded Content */}
                {isExpanded && (
                  <div className="p-4 bg-white border-t border-gray-200">
                    {/* System Instruction */}
                    <div className="mb-4">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="text-sm font-medium text-gray-700">System Instruction</h4>
                        <button
                          onClick={() => handleCopy(prompt.instruction)}
                          className="text-xs text-purple-600 hover:text-purple-800 flex items-center space-x-1"
                        >
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                          </svg>
                          <span>Copy</span>
                        </button>
                      </div>
                      <div className="bg-gray-50 rounded-lg p-3 border border-gray-200 max-h-48 overflow-y-auto">
                        <pre className="text-sm text-gray-700 font-mono whitespace-pre-wrap">
                          {prompt.instruction}
                        </pre>
                      </div>
                    </div>

                    {/* Context if available */}
                    {prompt.context && (
                      <div className="mb-4">
                        <h4 className="text-sm font-medium text-gray-700 mb-2">Context</h4>
                        <p className="text-sm text-gray-600 bg-gray-50 rounded-lg p-3 border border-gray-200">
                          {prompt.context}
                        </p>
                      </div>
                    )}

                    {/* Test Results Summary */}
                    {prompt.validationResults && prompt.validationResults.length > 0 && (
                      <div className="mb-4">
                        <h4 className="text-sm font-medium text-gray-700 mb-2">
                          Test Results ({prompt.validationResults.length} tests)
                        </h4>
                        <div className="bg-gray-50 rounded-lg p-3 border border-gray-200 text-sm text-gray-600">
                          {prompt.validationResults.slice(0, 2).map((result, idx) => (
                            <div key={idx} className={idx > 0 ? 'mt-2 pt-2 border-t border-gray-200' : ''}>
                              <p className="font-medium text-gray-700">Test {idx + 1}: {result.testPrompt?.substring(0, 50)}...</p>
                              <p className="text-xs text-gray-500 mt-1">
                                Score: {parseScoreFromAnalysis(result.analysis).toFixed(1)}/10
                              </p>
                            </div>
                          ))}
                          {prompt.validationResults.length > 2 && (
                            <p className="text-xs text-gray-400 mt-2">
                              +{prompt.validationResults.length - 2} more tests
                            </p>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex flex-col sm:flex-row gap-2">
                      {onUsePrompt && (
                        <button
                          onClick={() => onUsePrompt(prompt)}
                          className="flex-1 bg-purple-600 text-white py-2 px-4 rounded-lg text-sm font-medium hover:bg-purple-700 transition-colors flex items-center justify-center space-x-2"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" />
                          </svg>
                          <span>Use This Prompt</span>
                        </button>
                      )}
                      {onRefinePrompt && (
                        <button
                          onClick={() => onRefinePrompt(prompt)}
                          className="flex-1 bg-gradient-to-r from-green-500 to-teal-500 text-white py-2 px-4 rounded-lg text-sm font-medium hover:from-green-600 hover:to-teal-600 transition-colors flex items-center justify-center space-x-2"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                          </svg>
                          <span>Refine Further</span>
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
