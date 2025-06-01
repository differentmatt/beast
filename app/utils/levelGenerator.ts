import { LevelConfig, LevelData, GameEntity } from "../types/game"

// Constants for level generation
const MIN_PLAYER_DISTANCE = 5 // Minimum distance between player and enemies

/**
 * Generates a random position within the level boundaries
 */
function getRandomPosition(width: number, height: number): { x: number, y: number } {
  return {
    x: Math.floor(Math.random() * width),
    y: Math.floor(Math.random() * height)
  }
}

/**
 * Calculates the distance between two points
 */
function getDistance(x1: number, y1: number, x2: number, y2: number): number {
  return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2))
}

/**
 * Checks if a position is valid (not too close to other entities)
 */
function isValidPosition(
  x: number,
  y: number,
  entities: { x: number, y: number }[],
  minDistance: number
): boolean {
  return !entities.some(entity => getDistance(x, y, entity.x, entity.y) < minDistance)
}

/**
 * Generates a level from a LevelConfig
 */
export function generateLevelFromConfig(config: LevelConfig): LevelData {
  const { width, height, beasts, superBeasts, eggs, wallPercentage, blockPercentage } = config

  // Initialize empty map
  const map: GameEntity[][] = Array(height).fill(null).map(() =>
    Array(width).fill("empty")
  )

  // Place player
  const playerPos = getRandomPosition(width, height)
  map[playerPos.y][playerPos.x] = "player"

  // Track placed entities for distance checking
  const placedEntities: { x: number, y: number }[] = [playerPos]

  // Place beasts
  for (let i = 0; i < beasts; i++) {
    let attempts = 0
    let placed = false

    while (!placed && attempts < 50) {
      const pos = getRandomPosition(width, height)
      if (isValidPosition(pos.x, pos.y, placedEntities, MIN_PLAYER_DISTANCE)) {
        map[pos.y][pos.x] = "beast"
        placedEntities.push(pos)
        placed = true
      }
      attempts++
    }
  }

  // Place super beasts
  for (let i = 0; i < superBeasts; i++) {
    let attempts = 0
    let placed = false

    while (!placed && attempts < 50) {
      const pos = getRandomPosition(width, height)
      if (isValidPosition(pos.x, pos.y, placedEntities, MIN_PLAYER_DISTANCE)) {
        map[pos.y][pos.x] = "superBeast"
        placedEntities.push(pos)
        placed = true
      }
      attempts++
    }
  }

  // Place eggs
  for (let i = 0; i < eggs; i++) {
    let attempts = 0
    let placed = false

    while (!placed && attempts < 50) {
      const pos = getRandomPosition(width, height)
      if (isValidPosition(pos.x, pos.y, placedEntities, MIN_PLAYER_DISTANCE)) {
        map[pos.y][pos.x] = "egg"
        placedEntities.push(pos)
        placed = true
      }
      attempts++
    }
  }

  // Calculate number of walls and blocks based on percentages
  const totalCells = width * height // Use full dimensions for level data
  const numWalls = Math.floor((totalCells * wallPercentage) / 100)
  const numBlocks = Math.floor((totalCells * blockPercentage) / 100)

  // Place walls
  for (let i = 0; i < numWalls; i++) {
    let attempts = 0
    let placed = false

    while (!placed && attempts < 50) {
      const pos = getRandomPosition(width, height)
      if (map[pos.y][pos.x] === "empty") {
        map[pos.y][pos.x] = "wall"
        placed = true
      }
      attempts++
    }
  }

  // Place blocks
  for (let i = 0; i < numBlocks; i++) {
    let attempts = 0
    let placed = false

    while (!placed && attempts < 50) {
      const pos = getRandomPosition(width, height)
      if (map[pos.y][pos.x] === "empty") {
        map[pos.y][pos.x] = "block"
        placed = true
      }
      attempts++
    }
  }

  // Create the level data
  return {
    id: 0, // This will be set by the backend when saved
    name: config.name,
    beasts: beasts,
    superBeasts: superBeasts,
    eggs: eggs,
    height: height,
    width: width,
    gameSpeed: config.gameSpeed,
    wallPercentage: wallPercentage,
    blockPercentage: blockPercentage,
    map: map,
    completed: false,
    createdDate: new Date().toISOString().split('T')[0]
  }
}