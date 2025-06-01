export type GameEntity = "player" | "beast" | "superBeast" | "hatchedBeast" | "egg" | "block" | "wall" | "empty"

export interface GameState {
  map: GameEntity[][]
  player: { x: number; y: number }
  enemies: { x: number; y: number }[]
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