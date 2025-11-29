/**
 * Parse score from analysis text
 * @param {string} analysis - Analysis text
 * @returns {number} - Parsed score (0-10)
 */
export function parseScoreFromAnalysis(analysis) {
  if (!analysis) return 0;
  const match = analysis.match(/SCORE:\s*(\d+\.?\d*)/i);
  return match ? parseFloat(match[1]) : 0;
}

/**
 * Get color classes based on score
 * @param {number} score 
 * @returns {Object} - Color classes for Tailwind CSS
 */
export function getScoreColors(score) {
  if (score >= 8) return { bg: 'bg-green-500', text: 'text-green-100', ring: 'ring-green-400' };
  if (score >= 6) return { bg: 'bg-yellow-500', text: 'text-yellow-100', ring: 'ring-yellow-400' };
  if (score >= 4) return { bg: 'bg-orange-500', text: 'text-orange-100', ring: 'ring-orange-400' };
  return { bg: 'bg-red-500', text: 'text-red-100', ring: 'ring-red-400' };
}

/**
 * Get alternate color classes based on score (lighter variant)
 * @param {number} score 
 * @returns {Object} - Color classes for Tailwind CSS
 */
export function getScoreColorsLight(score) {
  if (score >= 8) return { bg: 'bg-green-100', text: 'text-green-700', border: 'border-green-200' };
  if (score >= 6) return { bg: 'bg-yellow-100', text: 'text-yellow-700', border: 'border-yellow-200' };
  if (score >= 4) return { bg: 'bg-orange-100', text: 'text-orange-700', border: 'border-orange-200' };
  return { bg: 'bg-red-100', text: 'text-red-700', border: 'border-red-200' };
}

/**
 * Calculate average score from validation results
 * @param {Array} validationResults - Array of validation result objects
 * @returns {number} - Average score
 */
export function calculateAverageScore(validationResults) {
  if (!validationResults || validationResults.length === 0) return 0;
  
  const scores = validationResults
    .map(r => parseScoreFromAnalysis(r.analysis))
    .filter(s => s > 0);
  
  if (scores.length === 0) return 0;
  return scores.reduce((a, b) => a + b, 0) / scores.length;
}

/**
 * Get trend direction based on current and previous scores
 * @param {number} current 
 * @param {number} previous 
 * @returns {string} - 'up', 'down', or 'same'
 */
export function getScoreTrend(current, previous) {
  if (!previous || previous === 0) return 'same';
  const diff = current - previous;
  if (diff > 0.5) return 'up';
  if (diff < -0.5) return 'down';
  return 'same';
}
