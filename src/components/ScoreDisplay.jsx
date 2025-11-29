import { useMemo } from 'react';
import { parseScoreFromAnalysis, getScoreColors, getScoreTrend } from '../utils/scoreUtils';

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
      trend: getScoreTrend(roundedAvg, previousScore),
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
