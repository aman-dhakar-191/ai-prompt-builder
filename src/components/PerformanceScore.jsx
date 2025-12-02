import { useMemo } from 'react';
import { parseScoreFromAnalysis, getScoreColors, getScoreTrend } from '../utils/scoreUtils';

export default function PerformanceScore({ validationResults, previousScore }) {
  const scoreData = useMemo(() => {
    if (!validationResults || validationResults.length === 0) {
      return null;
    }
    
    // Calculate average score from all validation results
    const scores = validationResults.map(r => parseScoreFromAnalysis(r.analysis));
    const validScores = scores.filter(s => s > 0);
    
    if (validScores.length === 0) {
      return null;
    }
    
    const avg = validScores.reduce((a, b) => a + b, 0) / validScores.length;
    const roundedAvg = Math.round(avg * 10) / 10;
    const minScore = Math.min(...validScores);
    const maxScore = Math.max(...validScores);
    
    // Calculate variance for consistency
    // Consistency score: measures how similar scores are across tests
    // Lower variance = higher consistency (more predictable behavior)
    // Formula: 10 - (sqrt(variance) * 2) caps consistency at 10 and scales it appropriately
    // A standard deviation of 5 would result in consistency score of 0
    const variance = validScores.reduce((sum, score) => sum + Math.pow(score - avg, 2), 0) / validScores.length;
    const consistency = Math.max(0, 10 - Math.sqrt(variance) * 2);
    
    return {
      averageScore: roundedAvg,
      minScore,
      maxScore,
      consistency: Math.round(consistency * 10) / 10,
      trend: getScoreTrend(roundedAvg, previousScore),
      colors: getScoreColors(roundedAvg),
      previousScore,
      improvement: previousScore ? roundedAvg - previousScore : null,
      passRate: (validScores.filter(s => s >= 7).length / validScores.length) * 100,
    };
  }, [validationResults, previousScore]);
  
  if (!scoreData) {
    return null;
  }
  
  const { averageScore, minScore, maxScore, consistency, trend, colors, previousScore: prevScore, improvement, passRate } = scoreData;
  
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mt-6">
      <div className="flex items-center space-x-2 mb-6">
        <div className="bg-indigo-100 p-2 rounded-lg">
          <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
        </div>
        <h2 className="text-lg font-semibold text-gray-800">Performance Score</h2>
      </div>

      {/* Main Score Display */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {/* Average Score */}
        <div className={`rounded-lg p-4 ${colors.bg} border-2 ${colors.ring}`}>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-gray-600">Average Score</span>
            {trend !== 'same' && (
              <div className="flex items-center space-x-1">
                {trend === 'up' ? (
                  <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
                  </svg>
                ) : (
                  <svg className="w-4 h-4 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                  </svg>
                )}
              </div>
            )}
          </div>
          <div className="flex items-baseline space-x-1">
            <span className={`text-4xl font-bold ${colors.text}`}>{averageScore}</span>
            <span className={`text-lg ${colors.text} opacity-70`}>/10</span>
          </div>
          {improvement !== null && improvement !== 0 && (
            <div className="mt-2 text-xs">
              <span className={improvement > 0 ? 'text-green-600' : 'text-red-600'}>
                {improvement > 0 ? '+' : ''}{improvement.toFixed(1)} from previous
              </span>
            </div>
          )}
        </div>

        {/* Score Range */}
        <div className="rounded-lg p-4 bg-gray-50 border border-gray-200">
          <div className="text-xs font-medium text-gray-600 mb-2">Score Range</div>
          <div className="flex items-center justify-between">
            <div className="text-center">
              <div className="text-xs text-gray-500 mb-1">Min</div>
              <div className="text-2xl font-bold text-gray-700">{minScore}</div>
            </div>
            <div className="flex-1 mx-3">
              <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                {/* Visual representation of score distribution - full width shows the range exists */}
                <div 
                  className="h-full bg-gradient-to-r from-red-400 via-yellow-400 to-green-400"
                  style={{ 
                    width: maxScore > minScore ? '100%' : '50%',
                    opacity: maxScore > minScore ? 1 : 0.5 
                  }}
                ></div>
              </div>
              <div className="text-xs text-gray-500 text-center mt-1">
                Spread: {(maxScore - minScore).toFixed(1)} pts
              </div>
            </div>
            <div className="text-center">
              <div className="text-xs text-gray-500 mb-1">Max</div>
              <div className="text-2xl font-bold text-gray-700">{maxScore}</div>
            </div>
          </div>
        </div>

        {/* Consistency Score */}
        <div className="rounded-lg p-4 bg-blue-50 border border-blue-200">
          <div className="text-xs font-medium text-gray-600 mb-2">Consistency</div>
          <div className="flex items-baseline space-x-1">
            <span className="text-3xl font-bold text-blue-600">{consistency}</span>
            <span className="text-lg text-blue-600 opacity-70">/10</span>
          </div>
          <div className="mt-2 text-xs text-gray-600">
            {consistency >= 8 ? 'Highly consistent' : consistency >= 6 ? 'Moderately consistent' : 'Needs improvement'}
          </div>
        </div>

        {/* Pass Rate */}
        <div className="rounded-lg p-4 bg-green-50 border border-green-200">
          <div className="text-xs font-medium text-gray-600 mb-2">Pass Rate (≥7)</div>
          <div className="flex items-baseline space-x-1">
            <span className="text-3xl font-bold text-green-600">{Math.round(passRate)}</span>
            <span className="text-lg text-green-600 opacity-70">%</span>
          </div>
          <div className="mt-2 text-xs text-gray-600">
            {passRate >= 80 ? 'Excellent!' : passRate >= 60 ? 'Good' : 'Needs work'}
          </div>
        </div>
      </div>

      {/* Score Explanation */}
      <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg p-4 border border-indigo-200">
        <h3 className="text-sm font-semibold text-indigo-900 mb-2">Understanding Your Score</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs text-gray-700">
          <div className="flex items-start space-x-2">
            <svg className="w-4 h-4 text-indigo-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span><strong>8-10:</strong> Excellent - Minor tweaks may help</span>
          </div>
          <div className="flex items-start space-x-2">
            <svg className="w-4 h-4 text-yellow-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <span><strong>6-7.9:</strong> Good - Some improvements needed</span>
          </div>
          <div className="flex items-start space-x-2">
            <svg className="w-4 h-4 text-orange-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span><strong>4-5.9:</strong> Needs work - Review analysis carefully</span>
          </div>
          <div className="flex items-start space-x-2">
            <svg className="w-4 h-4 text-red-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span><strong>Below 4:</strong> Major revision required</span>
          </div>
        </div>
      </div>

      {/* Previous Score Comparison */}
      {prevScore && (
        <div className="mt-4 bg-gray-50 rounded-lg p-3 border border-gray-200">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">Previous Score:</span>
            <span className="font-medium text-gray-700">{prevScore.toFixed(1)}/10</span>
          </div>
          <div className="mt-2 flex items-center justify-between text-sm">
            <span className="text-gray-600">Current Score:</span>
            <span className="font-medium text-gray-700">{averageScore}/10</span>
          </div>
          <div className="mt-2 pt-2 border-t border-gray-300 flex items-center justify-between">
            <span className="text-gray-600 font-medium">Net Change:</span>
            <span className={`font-bold ${improvement > 0 ? 'text-green-600' : improvement < 0 ? 'text-red-600' : 'text-gray-600'}`}>
              {improvement > 0 ? '+' : ''}{improvement.toFixed(1)} points
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
