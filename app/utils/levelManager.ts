import { generateLevelParams } from './gameUtils';

// Define the Level interface
export interface Level {
  levelNumber: number;
  mapData: string[];
  difficultyRating: number;
  timeLimit: number;
}

// Constants for level generation
const MAP_SIZE = 40;
const WALL_PADDING = 3;
const ROOM_PADDING = 2;
const MIN_BEAST_PLAYER_DISTANCE = 12;
const NEAR_PLAYER_BLOCK_DISTANCE_MIN = 3;
const NEAR_PLAYER_BLOCK_DISTANCE_MAX = 8;

/**
 * Generates a random map for a specific level
 * @param level Level number
 * @returns Generated map as string array
 */
export function generateLevelMap(level: number): string[] {
  const params = generateLevelParams(level);
  const map: string[] = [];

  // Initialize with empty spaces
  for (let i = 0; i < MAP_SIZE; i++) {
    map.push('.'.repeat(MAP_SIZE));
  }

  // Create border walls
  map[0] = '#'.repeat(MAP_SIZE);
  map[MAP_SIZE - 1] = '#'.repeat(MAP_SIZE);
  for (let i = 1; i < MAP_SIZE - 1; i++) {
    map[i] = '#' + map[i].substring(1, MAP_SIZE - 1) + '#';
  }

  // Create some maze-like structures with walls
  const innerCells = (MAP_SIZE - 2) * (MAP_SIZE - 2);
  const wallCount = Math.floor(innerCells * params.wallDensity);

  // Create some wall patterns rather than just random walls
  const numWallSegments = Math.floor(wallCount / 25); // Using 25 as divisor like in original code

  for (let i = 0; i < numWallSegments; i++) {
    const isHorizontal = Math.random() > 0.5;
    const length = 3 + Math.floor(Math.random() * 8); // 3-10 length

    if (isHorizontal) {
      const row = WALL_PADDING + Math.floor(Math.random() * (MAP_SIZE - WALL_PADDING * 2));
      const startCol = WALL_PADDING + Math.floor(Math.random() * (MAP_SIZE - length - WALL_PADDING * 2));

      // Create a horizontal wall with a gap
      const gapPos = Math.floor(Math.random() * length);

      for (let j = 0; j < length; j++) {
        if (j !== gapPos) { // Leave a gap for passage
          map[row] = map[row].substring(0, startCol + j) + '#' + map[row].substring(startCol + j + 1);
        }
      }
    } else {
      const col = WALL_PADDING + Math.floor(Math.random() * (MAP_SIZE - WALL_PADDING * 2));
      const startRow = WALL_PADDING + Math.floor(Math.random() * (MAP_SIZE - length - WALL_PADDING * 2));

      // Create a vertical wall with a gap
      const gapPos = Math.floor(Math.random() * length);

      for (let j = 0; j < length; j++) {
        if (j !== gapPos) { // Leave a gap for passage
          map[startRow + j] = map[startRow + j].substring(0, col) + '#' + map[startRow + j].substring(col + 1);
        }
      }
    }
  }

  // Add some random walls
  for (let i = 0; i < wallCount - (numWallSegments * 5); i++) {
    const row = 1 + Math.floor(Math.random() * (MAP_SIZE - 2));
    const col = 1 + Math.floor(Math.random() * (MAP_SIZE - 2));
    if (map[row][col] !== '#') { // Don't overwrite existing walls
      map[row] = map[row].substring(0, col) + '#' + map[row].substring(col + 1);
    }
  }

  // Add some small rooms (2x2 or 3x3 empty spaces surrounded by walls)
  // Number of rooms increases slightly with level
  const numRooms = Math.min(5, Math.floor(level / 3) + 1);

  for (let i = 0; i < numRooms; i++) {
    const roomSize = 2 + Math.floor(Math.random() * 2); // 2-3 size
    const startRow = ROOM_PADDING + Math.floor(Math.random() * (MAP_SIZE - roomSize - ROOM_PADDING * 2));
    const startCol = ROOM_PADDING + Math.floor(Math.random() * (MAP_SIZE - roomSize - ROOM_PADDING * 2));

    // Create room walls
    for (let r = startRow - 1; r <= startRow + roomSize; r++) {
      for (let c = startCol - 1; c <= startCol + roomSize; c++) {
        if (r === startRow - 1 || r === startRow + roomSize ||
            c === startCol - 1 || c === startCol + roomSize) {
          map[r] = map[r].substring(0, c) + '#' + map[r].substring(c + 1);
        } else {
          // Ensure room interior is empty
          map[r] = map[r].substring(0, c) + '.' + map[r].substring(c + 1);
        }
      }
    }

    // Add a door (gap in the wall)
    const doorSide = Math.floor(Math.random() * 4); // 0=top, 1=right, 2=bottom, 3=left
    let doorRow = startRow - 1, doorCol = startCol - 1;

    switch (doorSide) {
      case 0: // top
        doorRow = startRow - 1;
        doorCol = startCol + Math.floor(Math.random() * roomSize);
        break;
      case 1: // right
        doorRow = startRow + Math.floor(Math.random() * roomSize);
        doorCol = startCol + roomSize;
        break;
      case 2: // bottom
        doorRow = startRow + roomSize;
        doorCol = startCol + Math.floor(Math.random() * roomSize);
        break;
      case 3: // left
        doorRow = startRow + Math.floor(Math.random() * roomSize);
        doorCol = startCol - 1;
        break;
    }

    map[doorRow] = map[doorRow].substring(0, doorCol) + '.' + map[doorRow].substring(doorCol + 1);
  }

  // Add player (ensure it's not on a wall)
  let playerPlaced = false;
  while (!playerPlaced) {
    const row = 1 + Math.floor(Math.random() * (MAP_SIZE - 2));
    const col = 1 + Math.floor(Math.random() * (MAP_SIZE - 2));
    if (map[row][col] === '.') {
      map[row] = map[row].substring(0, col) + 'P' + map[row].substring(col + 1);
      playerPlaced = true;
    }
  }

  // Add beasts
  const beastCount = params.beastCount;
  let beastsPlaced = 0;

  while (beastsPlaced < beastCount) {
    const row = 1 + Math.floor(Math.random() * (MAP_SIZE - 2));
    const col = 1 + Math.floor(Math.random() * (MAP_SIZE - 2));
    if (map[row][col] === '.') {
      // Don't place beasts too close to the player
      const playerPos = map.findIndex(line => line.includes('P'));
      const playerCol = map[playerPos].indexOf('P');

      const distance = Math.sqrt(Math.pow(row - playerPos, 2) + Math.pow(col - playerCol, 2));

      if (distance >= MIN_BEAST_PLAYER_DISTANCE) {
        map[row] = map[row].substring(0, col) + 'H' + map[row].substring(col + 1);
        beastsPlaced++;
      }
    }
  }

  // Add blocks
  const blockCount = Math.floor(innerCells * params.blockDensity);
  let blocksPlaced = 0;

  // Place some blocks near the player for immediate gameplay
  const playerPos = map.findIndex(line => line.includes('P'));
  const playerCol = map[playerPos].indexOf('P');

  // Try to place 3-5 blocks within a reasonable distance from the player
  const nearPlayerBlockCount = 3 + Math.floor(Math.random() * 3); // 3-5 blocks
  let nearPlayerBlocksPlaced = 0;

  while (nearPlayerBlocksPlaced < nearPlayerBlockCount && blocksPlaced < blockCount) {
    // Place blocks at a distance of 3-8 cells from player
    const distance = NEAR_PLAYER_BLOCK_DISTANCE_MIN + Math.floor(Math.random() *
                    (NEAR_PLAYER_BLOCK_DISTANCE_MAX - NEAR_PLAYER_BLOCK_DISTANCE_MIN + 1));
    const angle = Math.random() * 2 * Math.PI; // Random angle

    const row = Math.floor(playerPos + Math.sin(angle) * distance);
    const col = Math.floor(playerCol + Math.cos(angle) * distance);

    // Ensure coordinates are valid
    if (row > 0 && row < MAP_SIZE - 1 && col > 0 && col < MAP_SIZE - 1) {
      if (map[row][col] === '.') {
        map[row] = map[row].substring(0, col) + 'B' + map[row].substring(col + 1);
        blocksPlaced++;
        nearPlayerBlocksPlaced++;
      }
    }
  }

  // Place the rest of the blocks randomly
  while (blocksPlaced < blockCount) {
    const row = 1 + Math.floor(Math.random() * (MAP_SIZE - 2));
    const col = 1 + Math.floor(Math.random() * (MAP_SIZE - 2));
    if (map[row][col] === '.') {
      map[row] = map[row].substring(0, col) + 'B' + map[row].substring(col + 1);
      blocksPlaced++;
    }
  }

  return map;
}

/**
 * Generates a complete level with all parameters
 * @param levelNumber Level number to generate
 * @returns Complete level object
 */
export function generateLevel(levelNumber: number): Level {
  const params = generateLevelParams(levelNumber);
  const mapData = generateLevelMap(levelNumber);

  // Calculate difficulty rating (1-10 scale)
  const difficultyRating = Math.min(10, 1 + (levelNumber * 0.5));

  return {
    levelNumber,
    mapData,
    difficultyRating,
    timeLimit: params.timeLimit,
  };
}

/**
 * Generates a set of levels
 * @param count Number of levels to generate
 * @returns Array of level objects
 */
export function generateLevels(count: number): Level[] {
  const levels: Level[] = [];

  for (let i = 1; i <= count; i++) {
    levels.push(generateLevel(i));
  }

  return levels;
}

// In-memory storage for levels (in a real app, this would be in a database)
let cachedLevels: Level[] = [];

/**
 * Gets a specific level, generating it if necessary
 * @param levelNumber Level number to get
 * @returns Level object
 */
export function getLevel(levelNumber: number): Level {
  // Check if level exists in cache
  const cachedLevel = cachedLevels.find(level => level.levelNumber === levelNumber);
  if (cachedLevel) {
    return cachedLevel;
  }

  // Generate level if not in cache
  const newLevel = generateLevel(levelNumber);
  cachedLevels.push(newLevel);

  return newLevel;
}

/**
 * Initializes the level manager by pre-generating a set of levels
 * @param count Number of levels to pre-generate
 */
export function initializeLevelManager(count: number = 20): void {
  cachedLevels = generateLevels(count);
}