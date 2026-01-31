/**
 * High Score System
 * Persists high scores to localStorage
 */

export interface HighScoreEntry {
  name: string
  score: number
  level: number
  date: string
}

const STORAGE_KEY = 'beast_high_scores'
const MAX_SCORES = 10

/**
 * Get all high scores from localStorage
 */
export function getHighScores(): HighScoreEntry[] {
  if (typeof window === 'undefined') return []

  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (!stored) return []
    return JSON.parse(stored) as HighScoreEntry[]
  } catch {
    console.warn('Failed to load high scores')
    return []
  }
}

/**
 * Save a new high score
 * Returns the position (1-based) if it made the leaderboard, or null if not
 */
export function saveHighScore(name: string, score: number, level: number): number | null {
  if (typeof window === 'undefined') return null

  const scores = getHighScores()

  const newEntry: HighScoreEntry = {
    name: name.trim() || 'Anonymous',
    score,
    level,
    date: new Date().toISOString()
  }

  // Add new score and sort by score descending
  scores.push(newEntry)
  scores.sort((a, b) => b.score - a.score)

  // Keep only top scores
  const topScores = scores.slice(0, MAX_SCORES)

  // Save back to localStorage
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(topScores))
  } catch {
    console.warn('Failed to save high scores')
    return null
  }

  // Find position of new score
  const position = topScores.findIndex(
    s => s.score === score && s.name === newEntry.name && s.date === newEntry.date
  )

  return position >= 0 ? position + 1 : null
}

/**
 * Check if a score qualifies for the high score list
 */
export function isHighScore(score: number): boolean {
  const scores = getHighScores()

  // Always qualifies if list isn't full
  if (scores.length < MAX_SCORES) return true

  // Check if score beats the lowest score
  const lowestScore = scores[scores.length - 1]?.score ?? 0
  return score > lowestScore
}

/**
 * Get the current high score (top score)
 */
export function getTopScore(): number {
  const scores = getHighScores()
  return scores[0]?.score ?? 0
}

/**
 * Clear all high scores
 */
export function clearHighScores(): void {
  if (typeof window === 'undefined') return

  try {
    localStorage.removeItem(STORAGE_KEY)
  } catch {
    console.warn('Failed to clear high scores')
  }
}

/**
 * Format a date for display
 */
export function formatScoreDate(dateString: string): string {
  try {
    const date = new Date(dateString)
    return date.toLocaleDateString()
  } catch {
    return 'Unknown'
  }
}
