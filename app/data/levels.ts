import { LevelData } from "../types/game"
import { generateLevelFromConfig } from "../utils/levelGenerator"

export const campaignLevels: LevelData[] = [
  {
    id: 1,
    name: "Level 1",
    beasts: 3,
    superBeasts: 0,
    eggs: 0,
    height: 25,
    width: 40,
    gameSpeed: 1.0,
    wallPercentage: 2,
    blockPercentage: 40,
    map: Array(25).fill(Array(40).fill("empty")),
    completed: true,
    createdDate: "2024-01-01"
  },
  {
    id: 2,
    name: "Level 2",
    beasts: 6,
    superBeasts: 0,
    eggs: 0,
    height: 25,
    width: 40,
    gameSpeed: 1.0,
    wallPercentage: 2,
    blockPercentage: 40,
    map: Array(25).fill(Array(40).fill("empty")),
    completed: true,
    createdDate: "2024-01-01"
  },
  {
    id: 3,
    name: "Level 3",
    beasts: 12,
    superBeasts: 2,
    eggs: 0,
    height: 25,
    width: 40,
    gameSpeed: 1.0,
    wallPercentage: 2,
    blockPercentage: 40,
    map: Array(25).fill(Array(40).fill("empty")),
    completed: false,
    createdDate: "2024-01-01"
  },
  {
    id: 4,
    name: "Level 4",
    beasts: 24,
    superBeasts: 2,
    eggs: 3,
    height: 25,
    width: 40,
    gameSpeed: 1.0,
    wallPercentage: 2,
    blockPercentage: 40,
    map: Array(25).fill(Array(40).fill("empty")),
    completed: false,
    createdDate: "2024-01-01"
  }
]

export const userLevels: LevelData[] = [
  {
    id: 101,
    name: "Speed Arena",
    beasts: 12,
    superBeasts: 2,
    eggs: 4,
    height: 20,
    width: 30,
    gameSpeed: 1.3,
    wallPercentage: 1,
    blockPercentage: 20,
    map: Array(20).fill(Array(30).fill("empty")),
    createdDate: "2024-01-15",
    completed: false
  },
  {
    id: 102,
    name: "Maze Challenge",
    beasts: 18,
    superBeasts: 3,
    eggs: 5,
    height: 25,
    width: 35,
    gameSpeed: 0.9,
    wallPercentage: 3,
    blockPercentage: 35,
    map: Array(25).fill(Array(35).fill("empty")),
    createdDate: "2024-01-10",
    completed: false
  },
  {
    id: 103,
    name: "Peaceful Garden",
    beasts: 8,
    superBeasts: 1,
    eggs: 3,
    height: 20,
    width: 25,
    gameSpeed: 0.7,
    wallPercentage: 1,
    blockPercentage: 15,
    map: Array(20).fill(Array(25).fill("empty")),
    createdDate: "2024-01-08",
    completed: false
  }
]

const generateMapFromLevel = (level: LevelData): LevelData => {
  const config = {
    name: level.name,
    width: level.width,
    height: level.height,
    beasts: level.beasts,
    superBeasts: level.superBeasts,
    eggs: level.eggs,
    wallPercentage: level.wallPercentage,
    blockPercentage: level.blockPercentage,
    gameSpeed: level.gameSpeed
  }
  const generatedLevel = generateLevelFromConfig(config)
  return { ...level, map: generatedLevel.map }
}

export const getLevelInfo = (id: string): LevelData => {
  const campaignLevel = campaignLevels.find(level => level.id.toString() === id)
  if (campaignLevel) return generateMapFromLevel(campaignLevel)

  const userLevel = userLevels.find(level => level.id.toString() === id)
  if (userLevel) return generateMapFromLevel(userLevel)

  // Default level if not found
  const defaultLevel: LevelData = {
    id: 0,
    name: "Unknown Level",
    beasts: 5,
    superBeasts: 0,
    eggs: 0,
    height: 25,
    width: 40,
    gameSpeed: 1.0,
    wallPercentage: 2,
    blockPercentage: 40,
    map: [],
    completed: false,
    createdDate: new Date().toISOString().split('T')[0]
  }
  return generateMapFromLevel(defaultLevel)
}