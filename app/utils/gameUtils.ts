/**
 * Formats time in seconds to MM:SS format
 * @param seconds Total seconds to format
 * @returns Formatted time string (MM:SS)
 */
export function formatTime(seconds: number): string {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
}

/**
 * Calculates score based on beasts eliminated, time taken, and level
 * @param beastsEliminated Number of beasts eliminated
 * @param timeElapsed Time taken in seconds
 * @param level Current level
 * @returns Calculated score
 */
export function calculateScore(beastsEliminated: number, timeElapsed: number, level: number): number {
  // Base score: 100 points per beast
  const beastScore = beastsEliminated * 100;

  // Time bonus: faster completion gives higher bonus
  // Maximum time bonus is 500 points at 0 seconds (theoretical)
  // Minimum time bonus is 0 points at 300 seconds (5 minutes) or more
  const timeBonus = Math.max(0, 500 - Math.floor(timeElapsed * (500 / 300)));

  // Level multiplier: higher levels give higher scores
  const levelMultiplier = 1 + (level * 0.1); // 10% increase per level

  // Calculate total score
  const totalScore = Math.floor((beastScore + timeBonus) * levelMultiplier);

  return totalScore;
}

/**
 * Generates level parameters based on level number
 * @param level Level number
 * @returns Level parameters
 */
export function generateLevelParams(level: number) {
  // Base parameters
  const baseParams = {
    beastCount: 16,
    beastSpeed: 600, // ms
    blockDensity: 0.2,
    wallDensity: 0.015,
    timeLimit: 300, // seconds
  };

  // Adjust parameters based on level
  // Higher levels: more beasts, faster beasts, fewer blocks, more walls
  const adjustedParams = {
    beastCount: Math.min(40, Math.floor(baseParams.beastCount + (level - 1) * 2)),
    beastSpeed: Math.max(300, baseParams.beastSpeed - (level - 1) * 20),
    blockDensity: Math.max(0.05, baseParams.blockDensity - (level - 1) * 0.01),
    wallDensity: Math.min(0.03, baseParams.wallDensity + (level - 1) * 0.001),
    timeLimit: Math.max(120, baseParams.timeLimit - (level - 1) * 10),
  };

  return adjustedParams;
}