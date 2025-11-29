export default function Header({ validationResults, previousScore }) {
  return (
    <header className="bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="bg-white/20 p-2 rounded-lg">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
            </div>
            <div>
              <h1 className="text-2xl font-bold">AI Prompt Builder</h1>
              <p className="text-violet-200 text-sm">Generate & Validate System Instructions</p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            {/* Score Display in Header */}
            {validationResults && validationResults.length > 0 && (
              <ScoreDisplayHeader validationResults={validationResults} previousScore={previousScore} />
            )}
            <div className="hidden sm:flex items-center space-x-2 text-violet-200 text-sm">
              <span>Powered by</span>
              <span className="bg-white/20 px-2 py-1 rounded font-medium">OpenRouter</span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}

// Inline score display for header
function ScoreDisplayHeader({ validationResults, previousScore }) {
  // Calculate average score
  const scores = validationResults
    .map(r => {
      const match = r.analysis?.match(/SCORE:\s*(\d+\.?\d*)/i);
      return match ? parseFloat(match[1]) : 0;
    })
    .filter(s => s > 0);
  
  if (scores.length === 0) return null;
  
  const avgScore = scores.reduce((a, b) => a + b, 0) / scores.length;
  const roundedAvg = Math.round(avgScore * 10) / 10;
  
  // Determine trend
  let trend = 'same';
  if (previousScore && previousScore > 0) {
    const diff = roundedAvg - previousScore;
    if (diff > 0.5) trend = 'up';
    else if (diff < -0.5) trend = 'down';
  }
  
  // Get color based on score
  const getColors = (score) => {
    if (score >= 8) return 'bg-green-500 ring-green-400';
    if (score >= 6) return 'bg-yellow-500 ring-yellow-400';
    if (score >= 4) return 'bg-orange-500 ring-orange-400';
    return 'bg-red-500 ring-red-400';
  };
  
  return (
    <div className="flex items-center space-x-2">
      <div className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg ${getColors(roundedAvg)} ring-2 shadow-sm`}>
        <span className="text-sm font-medium text-white">Score:</span>
        <span className="text-lg font-bold text-white">{roundedAvg}</span>
        <span className="text-xs text-white opacity-80">/10</span>
        
        {trend === 'up' && (
          <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
          </svg>
        )}
        {trend === 'down' && (
          <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
          </svg>
        )}
      </div>
      
      {trend === 'up' && previousScore && (
        <span className="text-xs text-green-200 bg-green-600/40 px-2 py-0.5 rounded-full">
          +{(roundedAvg - previousScore).toFixed(1)}
        </span>
      )}
      {trend === 'down' && previousScore && (
        <span className="text-xs text-red-200 bg-red-600/40 px-2 py-0.5 rounded-full">
          {(roundedAvg - previousScore).toFixed(1)}
        </span>
      )}
    </div>
  );
}
