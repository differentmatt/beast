"use client"

import { useEffect, useImperativeHandle, useRef, forwardRef } from "react"
import * as Phaser from "phaser"
import BeastScene from "@/app/game/BeastScene"
import { LevelData } from "../types/game"

export interface GameCanvasHandles {
  move: (direction: "up" | "down" | "left" | "right") => void
}

interface GameCanvasProps {
  level: LevelData
  score: number
  setScore: (s: number) => void
  onBeastDefeated: () => void
  onPlayerDied: () => void
}

const GameCanvas = forwardRef<GameCanvasHandles, GameCanvasProps>(({ level, score, setScore, onBeastDefeated, onPlayerDied }, ref) => {
  const gameRef = useRef<HTMLDivElement>(null)
  const sceneRef = useRef<BeastScene | null>(null)

  useImperativeHandle(ref, () => ({
    move: (dir) => {
      sceneRef.current?.enqueueMove(dir)
    },
  }))

  useEffect(() => {
    const scene = new BeastScene(level, score, setScore, onBeastDefeated, onPlayerDied)
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