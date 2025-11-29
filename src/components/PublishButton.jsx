import { useState } from 'react';
import { publishPrompt, isFirebaseAvailable } from '../services/firebase';

/**
 * Parse score from analysis text
 * @param {string} analysis - Analysis text
 * @returns {number} - Parsed score (0-10)
 */
function parseScoreFromAnalysis(analysis) {
  if (!analysis) return 0;
  const match = analysis.match(/SCORE:\s*(\d+\.?\d*)/i);
  return match ? parseFloat(match[1]) : 0;
}

export default function PublishButton({ 
  systemInstruction, 
  validationResults, 
  desiredOutput, 
  context, 
  model 
}) {
  const [isPublishing, setIsPublishing] = useState(false);
  const [published, setPublished] = useState(false);
  const [error, setError] = useState('');
  const [showConfirm, setShowConfirm] = useState(false);

  const canPublish = systemInstruction && isFirebaseAvailable();

  // Calculate average score
  const getAverageScore = () => {
    if (!validationResults || validationResults.length === 0) return 0;
    const scores = validationResults
      .map(r => parseScoreFromAnalysis(r.analysis))
      .filter(s => s > 0);
    if (scores.length === 0) return 0;
    return scores.reduce((a, b) => a + b, 0) / scores.length;
  };

  const handlePublish = async () => {
    setIsPublishing(true);
    setError('');

    try {
      const promptData = {
        instruction: systemInstruction,
        desiredOutput,
        context,
        model,
        validationResults,
        score: getAverageScore(),
        timestamp: new Date().toISOString(),
      };

      await publishPrompt(promptData);
      setPublished(true);
      setShowConfirm(false);
      setTimeout(() => setPublished(false), 3000);
    } catch (err) {
      setError(err.message || 'Failed to publish prompt');
    } finally {
      setIsPublishing(false);
    }
  };

  if (!canPublish) {
    return null;
  }

  return (
    <div className="relative">
      {published ? (
        <div className="flex items-center space-x-2 px-4 py-2 bg-green-500 text-white rounded-lg">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          <span>Published!</span>
        </div>
      ) : (
        <button
          onClick={() => setShowConfirm(true)}
          className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg font-medium hover:from-purple-600 hover:to-pink-600 transition-all duration-200"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
          </svg>
          <span>Share Publicly</span>
        </button>
      )}

      {/* Confirmation Modal */}
      {showConfirm && (
        <>
          <div 
            className="fixed inset-0 bg-black/50 z-40"
            onClick={() => setShowConfirm(false)}
          />
          <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-xl shadow-xl border border-gray-200 p-6 z-50 w-full max-w-md">
            <div className="flex items-center space-x-3 mb-4">
              <div className="bg-purple-100 p-2 rounded-lg">
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-800">Share Prompt Publicly</h3>
            </div>

            <p className="text-sm text-gray-600 mb-4">
              This will share your system prompt with the community. Others will be able to view, use, and refine it.
            </p>

            {/* Preview */}
            <div className="bg-gray-50 rounded-lg p-3 mb-4 text-sm">
              <p className="font-medium text-gray-700 mb-1">Prompt Preview:</p>
              <p className="text-gray-600 line-clamp-3">{systemInstruction}</p>
              {getAverageScore() > 0 && (
                <p className="mt-2 text-xs text-gray-500">
                  Score: {getAverageScore().toFixed(1)}/10
                </p>
              )}
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded-lg mb-4 text-sm">
                {error}
              </div>
            )}

            <div className="flex space-x-3">
              <button
                onClick={() => setShowConfirm(false)}
                className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium transition-colors"
                disabled={isPublishing}
              >
                Cancel
              </button>
              <button
                onClick={handlePublish}
                disabled={isPublishing}
                className="flex-1 px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg font-medium hover:from-purple-600 hover:to-pink-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center space-x-2"
              >
                {isPublishing ? (
                  <>
                    <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span>Publishing...</span>
                  </>
                ) : (
                  <span>Publish</span>
                )}
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
