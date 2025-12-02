import { useState, useMemo } from 'react';

export default function ValidationResults({ results, onRegenerateWithFeedback, isRegenerating }) {
  const [showFeedbackForm, setShowFeedbackForm] = useState(false);
  const [customFeedback, setCustomFeedback] = useState('');
  const [expandedResults, setExpandedResults] = useState({});
  const [showValidationCode, setShowValidationCode] = useState(false);

  // Handle both array (multiple results) and single object (legacy)
  const resultArray = useMemo(() => {
    if (!results || results.length === 0) return [];
    return Array.isArray(results) ? results : [results];
  }, [results]);

  // Calculate cumulative analysis
  const cumulativeAnalysis = useMemo(() => {
    if (resultArray.length === 0) return null;

    // Extract scores
    const scores = resultArray.map(r => {
      const match = r.analysis?.match(/SCORE:\s*(\d+\.?\d*)/i);
      return match ? parseFloat(match[1]) : 0;
    }).filter(s => s > 0);

    if (scores.length === 0) return null;

    const avgScore = scores.reduce((a, b) => a + b, 0) / scores.length;
    const minScore = Math.min(...scores);
    const maxScore = Math.max(...scores);
    const variance = scores.reduce((sum, score) => sum + Math.pow(score - avgScore, 2), 0) / scores.length;
    const consistency = Math.max(0, 10 - Math.sqrt(variance) * 2);

    // Collect common themes
    const allImprovements = resultArray
      .map(r => r.analysis)
      .join('\n')
      .toLowerCase();

    const commonThemes = [];
    if (allImprovements.includes('format') || allImprovements.includes('structure')) {
      commonThemes.push('Format & Structure');
    }
    if (allImprovements.includes('clarity') || allImprovements.includes('clear')) {
      commonThemes.push('Clarity');
    }
    if (allImprovements.includes('specific') || allImprovements.includes('detail')) {
      commonThemes.push('Specificity');
    }
    if (allImprovements.includes('tone') || allImprovements.includes('style')) {
      commonThemes.push('Tone & Style');
    }
    if (allImprovements.includes('example')) {
      commonThemes.push('Examples Needed');
    }

    return {
      avgScore: Math.round(avgScore * 10) / 10,
      minScore,
      maxScore,
      consistency: Math.round(consistency * 10) / 10,
      totalTests: resultArray.length,
      passRate: Math.round((scores.filter(s => s >= 7).length / scores.length) * 100),
      commonThemes
    };
  }, [resultArray]);

  if (!results || results.length === 0) return null;

  const toggleResultExpand = (index) => {
    setExpandedResults(prev => ({
      ...prev,
      [index]: !prev[index]
    }));
  };

  const handleRegenerateWithAnalysis = () => {
    // Combine all analyses as feedback
    const combinedFeedback = resultArray
      .map((r, i) => `Test ${i + 1} (Prompt: "${r.testPrompt?.substring(0, 50)}..."):\n${r.analysis}`)
      .join('\n\n---\n\n');
    onRegenerateWithFeedback(combinedFeedback);
  };

  const handleRegenerateWithCustomFeedback = (e) => {
    e.preventDefault();
    if (customFeedback.trim()) {
      onRegenerateWithFeedback(customFeedback);
      setCustomFeedback('');
      setShowFeedbackForm(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mt-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-2">
          <div className="bg-blue-100 p-2 rounded-lg">
            <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h2 className="text-lg font-semibold text-gray-800">
            Validation Results {resultArray.length > 1 && `(${resultArray.length} tests)`}
          </h2>
        </div>
        
        {/* Toggle for showing validation code */}
        <button
          onClick={() => setShowValidationCode(!showValidationCode)}
          className="flex items-center space-x-2 px-3 py-1.5 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
          </svg>
          <span>{showValidationCode ? 'Hide' : 'Show'} Validation Code</span>
        </button>
      </div>

      {/* Cumulative Analysis Section - Always visible when multiple tests */}
      {cumulativeAnalysis && resultArray.length > 1 && (
        <div className="mb-6 bg-gradient-to-r from-purple-50 to-indigo-50 rounded-lg p-5 border border-purple-200">
          <div className="flex items-center space-x-2 mb-4">
            <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            <h3 className="text-md font-semibold text-purple-800">Cumulative Analysis</h3>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
            <div className="bg-white rounded-lg p-3 shadow-sm">
              <div className="text-xs text-gray-500 mb-1">Average Score</div>
              <div className="text-2xl font-bold text-purple-600">{cumulativeAnalysis.avgScore}<span className="text-sm text-gray-500">/10</span></div>
            </div>
            <div className="bg-white rounded-lg p-3 shadow-sm">
              <div className="text-xs text-gray-500 mb-1">Score Range</div>
              <div className="text-lg font-semibold text-purple-600">{cumulativeAnalysis.minScore} - {cumulativeAnalysis.maxScore}</div>
            </div>
            <div className="bg-white rounded-lg p-3 shadow-sm">
              <div className="text-xs text-gray-500 mb-1">Consistency</div>
              <div className="text-2xl font-bold text-purple-600">{cumulativeAnalysis.consistency}<span className="text-sm text-gray-500">/10</span></div>
            </div>
            <div className="bg-white rounded-lg p-3 shadow-sm">
              <div className="text-xs text-gray-500 mb-1">Pass Rate</div>
              <div className="text-2xl font-bold text-purple-600">{cumulativeAnalysis.passRate}<span className="text-sm text-gray-500">%</span></div>
            </div>
          </div>

          {cumulativeAnalysis.commonThemes.length > 0 && (
            <div className="bg-white rounded-lg p-3 shadow-sm">
              <div className="text-xs text-gray-500 mb-2">Common Improvement Areas</div>
              <div className="flex flex-wrap gap-2">
                {cumulativeAnalysis.commonThemes.map((theme, idx) => (
                  <span key={idx} className="px-2 py-1 bg-purple-100 text-purple-700 text-xs font-medium rounded-full">
                    {theme}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      <div className="space-y-4">
        {resultArray.map((result, index) => (
          <div key={index} className="border border-gray-200 rounded-lg overflow-hidden">
            {/* Header - clickable to expand/collapse */}
            <button
              onClick={() => toggleResultExpand(index)}
              className="w-full px-4 py-3 bg-gray-50 flex items-center justify-between hover:bg-gray-100 transition-colors"
            >
              <div className="flex items-center space-x-2">
                <span className="flex items-center justify-center w-6 h-6 rounded-full bg-blue-100 text-blue-600 text-sm font-medium">
                  {index + 1}
                </span>
                <span className="text-sm font-medium text-gray-700 text-left">
                  {result.testPrompt ? (
                    result.testPrompt.length > 60 
                      ? result.testPrompt.substring(0, 60) + '...'
                      : result.testPrompt
                  ) : 'Test Prompt'}
                </span>
              </div>
              <svg 
                className={`w-5 h-5 text-gray-400 transition-transform ${expandedResults[index] ? 'rotate-180' : ''}`} 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {/* Expanded content */}
            <div className={`${expandedResults[index] === true || (expandedResults[index] === undefined && resultArray.length === 1) ? 'block' : 'hidden'} p-4 space-y-4`}>
              {/* Test Prompt & Expected Behavior - Only shown if validation code is visible */}
              {showValidationCode && result.testPrompt && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="text-xs font-medium text-gray-500 mb-1">Test Prompt</h4>
                    <p className="text-sm text-gray-700 bg-gray-50 p-2 rounded">{result.testPrompt}</p>
                  </div>
                  {result.expectedBehavior && (
                    <div>
                      <h4 className="text-xs font-medium text-gray-500 mb-1">Expected Behavior</h4>
                      <p className="text-sm text-gray-700 bg-gray-50 p-2 rounded">{result.expectedBehavior}</p>
                    </div>
                  )}
                </div>
              )}

              {/* AI Response - Only shown if validation code is visible */}
              {showValidationCode && (
                <div>
                  <h3 className="text-sm font-medium text-gray-700 mb-2 flex items-center space-x-2">
                    <svg className="w-4 h-4 text-violet-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                    </svg>
                    <span>AI Response</span>
                  </h3>
                  <div className="bg-violet-50 rounded-lg p-4 border border-violet-200">
                    <pre className="whitespace-pre-wrap text-sm text-gray-700 font-mono leading-relaxed">
                      {result.response}
                    </pre>
                  </div>
                </div>
              )}

              {/* Analysis - Always shown by default */}
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-2 flex items-center space-x-2">
                  <svg className="w-4 h-4 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                  </svg>
                  <span>Validation Analysis</span>
                </h3>
                <div className="bg-amber-50 rounded-lg p-4 border border-amber-200">
                  <pre className="whitespace-pre-wrap text-sm text-gray-700 font-mono leading-relaxed">
                    {result.analysis}
                  </pre>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Regenerate with Feedback Section */}
      <div className="border-t border-gray-200 pt-6 mt-6">
        <div className="flex items-center space-x-2 mb-4">
          <div className="bg-gradient-to-r from-green-500 to-teal-500 p-2 rounded-lg">
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-800">Improve System Instructions</h3>
        </div>
        
        <p className="text-sm text-gray-600 mb-4">
          Based on the validation analysis, you can regenerate improved system instructions using the feedback above.
        </p>

        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={handleRegenerateWithAnalysis}
            disabled={isRegenerating}
            className="flex-1 bg-gradient-to-r from-green-500 to-teal-500 text-white py-3 px-6 rounded-lg font-medium hover:from-green-600 hover:to-teal-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center space-x-2"
          >
            {isRegenerating ? (
              <>
                <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span>Regenerating...</span>
              </>
            ) : (
              <>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                <span>Regenerate with Analysis Feedback</span>
              </>
            )}
          </button>
          
          <button
            onClick={() => setShowFeedbackForm(!showFeedbackForm)}
            disabled={isRegenerating}
            className="px-6 py-3 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
            <span>{showFeedbackForm ? 'Hide' : 'Add Custom Feedback'}</span>
          </button>
        </div>

        {showFeedbackForm && (
          <form onSubmit={handleRegenerateWithCustomFeedback} className="mt-4 space-y-3">
            <textarea
              value={customFeedback}
              onChange={(e) => setCustomFeedback(e.target.value)}
              placeholder="Enter your custom feedback or additional improvements you want to apply..."
              rows={3}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors resize-none"
              required
            />
            <button
              type="submit"
              disabled={isRegenerating || !customFeedback.trim()}
              className="w-full bg-gradient-to-r from-green-500 to-teal-500 text-white py-3 px-6 rounded-lg font-medium hover:from-green-600 hover:to-teal-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center space-x-2"
            >
              {isRegenerating ? (
                <>
                  <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span>Regenerating...</span>
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  <span>Regenerate with Custom Feedback</span>
                </>
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
