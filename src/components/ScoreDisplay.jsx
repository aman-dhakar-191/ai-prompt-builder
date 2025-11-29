import { useMemo } from 'react';

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

/**
 * Get color class based on score
 * @param {number} score 
 * @returns {Object} - Tailwind color classes
 */
function getScoreColors(score) {
  if (score >= 8) return { bg: 'bg-green-500', text: 'text-green-100', ring: 'ring-green-400' };
  if (score >= 6) return { bg: 'bg-yellow-500', text: 'text-yellow-100', ring: 'ring-yellow-400' };
  if (score >= 4) return { bg: 'bg-orange-500', text: 'text-orange-100', ring: 'ring-orange-400' };
  return { bg: 'bg-red-500', text: 'text-red-100', ring: 'ring-red-400' };
}

/**
 * Get trend indicator
 * @param {number} current 
 * @param {number} previous 
 * @returns {string} - 'up', 'down', or 'same'
 */
function getTrend(current, previous) {
  if (!previous || previous === 0) return 'same';
  const diff = current - previous;
  if (diff > 0.5) return 'up';
  if (diff < -0.5) return 'down';
  return 'same';
}

export default function ScoreDisplay({ validationResults, previousScore }) {
  const { averageScore, trend, colors } = useMemo(() => {
    if (!validationResults || validationResults.length === 0) {
      return { averageScore: null, trend: 'same', colors: null };
    }
    
    // Calculate average score from all validation results
    const scores = validationResults.map(r => parseScoreFromAnalysis(r.analysis));
    const validScores = scores.filter(s => s > 0);
    
    if (validScores.length === 0) {
      return { averageScore: null, trend: 'same', colors: null };
    }
    
    const avg = validScores.reduce((a, b) => a + b, 0) / validScores.length;
    const roundedAvg = Math.round(avg * 10) / 10;
    
    return {
      averageScore: roundedAvg,
      trend: getTrend(roundedAvg, previousScore),
      colors: getScoreColors(roundedAvg),
    };
  }, [validationResults, previousScore]);
  
  if (averageScore === null) {
    return null;
  }
  
  return (
    <div className="flex items-center space-x-2">
      <div className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg ${colors.bg} ring-2 ${colors.ring} shadow-sm`}>
        <span className={`text-sm font-medium ${colors.text}`}>Score:</span>
        <span className={`text-lg font-bold ${colors.text}`}>{averageScore}</span>
        <span className={`text-xs ${colors.text} opacity-80`}>/10</span>
        
        {/* Trend indicator */}
        {trend === 'up' && (
          <svg className={`w-4 h-4 ${colors.text}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
          </svg>
        )}
        {trend === 'down' && (
          <svg className={`w-4 h-4 ${colors.text}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
          </svg>
        )}
        {trend === 'same' && validationResults && validationResults.length > 0 && (
          <svg className={`w-4 h-4 ${colors.text}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14" />
          </svg>
        )}
      </div>
      
      {/* Improvement badge */}
      {trend === 'up' && previousScore && (
        <span className="text-xs text-green-300 bg-green-600/30 px-2 py-0.5 rounded-full">
          +{(averageScore - previousScore).toFixed(1)}
        </span>
      )}
      {trend === 'down' && previousScore && (
        <span className="text-xs text-red-300 bg-red-600/30 px-2 py-0.5 rounded-full">
          {(averageScore - previousScore).toFixed(1)}
        </span>
      )}
    </div>
  );
}
