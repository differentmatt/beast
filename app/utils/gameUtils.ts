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