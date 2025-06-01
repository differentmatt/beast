export type GameEntity = "player" | "beast" | "superBeast" | "hatchedBeast" | "egg" | "block" | "wall" | "empty"

export type Direction = "up" | "down" | "left" | "right" | "up-left" | "up-right" | "down-left" | "down-right"

export interface Position {
  x: number
  y: number
}

export interface Beast {
  id: string
  x: number
  y: number
  type: "beast" | "superBeast" | "hatchedBeast"
  lastMoveTime: number
  targetPosition?: Position
}

export interface Egg {
  id: string
  x: number
  y: number
  hatchTime: number
  hatchDuration: number // 10 seconds
}

export interface Player {
  x: number
  y: number
  lastMoveTime: number
}

export interface GameState {
  map: GameEntity[][]
  player: Player
  beasts: Beast[]
  eggs: Egg[]
  score: number
  level: number
  gameSpeed: number
  isGameOver: boolean
  beastsRemaining: number
}

export interface LevelData {
  id: number
  name: string
  beasts: number
  superBeasts: number
  eggs: number
  height: number
  width: number
  gameSpeed: number
  wallPercentage: number
  blockPercentage: number
  map: GameEntity[][]
  completed: boolean
  createdDate: string
  creator?: string
}

export interface MovementResult {
  success: boolean
  blocked?: boolean
  crushed?: Beast[]
  playerDied?: boolean
}

export interface LevelConfig {
  name: string
  beasts: number
  superBeasts: number
  eggs: number
  height: number
  width: number
  gameSpeed: number
  wallPercentage: number
  blockPercentage: number
}