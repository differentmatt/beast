"use client"

import { useEffect, useImperativeHandle, useRef, forwardRef } from "react"
import * as Phaser from "phaser"
import BeastScene from "@/app/game/BeastScene"
import { LevelData } from "../types/game"

export interface GameCanvasHandles {
  move: (direction: "up" | "down" | "left" | "right" | "up-left" | "up-right" | "down-left" | "down-right") => void
  triggerRespawn: () => void
  getLives: () => number
  getGameState: () => "playing" | "paused-died" | "game-over"
  isLevelCompleted: () => boolean
}

interface GameCanvasProps {
  level: LevelData
  score: number
  setScore: (s: number) => void
  onBeastDefeated: () => void
  onPlayerDied: () => void
  onLevelCompleted?: () => void
}

const GameCanvas = forwardRef<GameCanvasHandles, GameCanvasProps>(({ level, score, setScore, onBeastDefeated, onPlayerDied, onLevelCompleted }, ref) => {
  const gameRef = useRef<HTMLDivElement>(null)
  const sceneRef = useRef<BeastScene | null>(null)

  useImperativeHandle(ref, () => ({
    move: (dir) => {
      // Trigger movement through the input system
      if (sceneRef.current && sceneRef.current.input.keyboard) {
        const keyMap: { [key: string]: string } = {
          "up": "W",
          "down": "S",
          "left": "A",
          "right": "D",
          "up-left": "Q",
          "up-right": "E",
          "down-left": "Z",
          "down-right": "C"
        }
        const key = keyMap[dir]
        if (key) {
          // Manually trigger the direction by simulating input
          sceneRef.current.handleDirectMove(dir as any)
        }
      }
    },
    triggerRespawn: () => {
      if (sceneRef.current) {
        sceneRef.current.triggerRespawn()
      }
    },
    getLives: () => {
      return sceneRef.current ? sceneRef.current.getLives() : 3
    },
    getGameState: () => {
      return sceneRef.current ? sceneRef.current.getGameState() : "playing"
    },
    isLevelCompleted: () => {
      return sceneRef.current ? sceneRef.current.isLevelCompleted() : false
    },
  }))

  useEffect(() => {
    const scene = new BeastScene(level, score, setScore, onBeastDefeated, onPlayerDied, undefined, onLevelCompleted)
    sceneRef.current = scene

    const config: Phaser.Types.Core.GameConfig = {
      type: Phaser.AUTO,
      width: (level.width + 2) * 20,
      height: (level.height + 2) * 20,
      backgroundColor: "#000000",
      parent: gameRef.current!,
      scene: [scene],
      scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH,
      },
    }
    const game = new Phaser.Game(config)
    return () => game.destroy(true)
  }, [])

  return <div ref={gameRef} className="w-full h-full" />
})

GameCanvas.displayName = "GameCanvas"
export default GameCanvas