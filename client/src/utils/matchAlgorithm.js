/**
 * Client-side Matching Helpers
 */

export const getMatchSeverity = (score) => {
  if (score >= 80) return 'High Suspect Overlay';
  if (score >= 60) return 'Moderate Similarity';
  return 'Low Suspect Match';
};

export const getScoreRiskColor = (score) => {
  if (score >= 80) return '#ef4444'; // Red
  if (score >= 60) return '#f59e0b'; // Amber
  return '#10b981'; // Green
};
