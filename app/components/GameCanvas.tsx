"use client"

import { useEffect, useImperativeHandle, useRef, forwardRef, useLayoutEffect } from "react"
import * as Phaser from "phaser"
import BeastScene from "@/app/game/BeastScene"
import { LevelData } from "../types/game"

export interface GameCanvasHandles {
  move: (direction: "up" | "down" | "left" | "right" | "up-left" | "up-right" | "down-left" | "down-right") => void
  triggerRespawn: () => void
  getLives: () => number
  getGameState: () => "playing" | "paused-died" | "game-over"
  isLevelCompleted: () => boolean
  started?: boolean
  startGame?: () => void
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
      if (sceneRef.current) {
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
    // Expose the started property
    get started() {
      return sceneRef.current ? sceneRef.current.started : false
    },
    // Expose the startGame method
    startGame: () => {
      if (sceneRef.current) {
        sceneRef.current.startGame()
      }
    }
  }))

  // Use refs to store the latest prop values
  const levelRef = useRef(level)
  const scoreRef = useRef(score)
  const setScoreRef = useRef(setScore)
  const onBeastDefeatedRef = useRef(onBeastDefeated)
  const onPlayerDiedRef = useRef(onPlayerDied)
  const onLevelCompletedRef = useRef(onLevelCompleted)

  // Update refs when props change
  useLayoutEffect(() => {
    levelRef.current = level
    scoreRef.current = score
    setScoreRef.current = setScore
    onBeastDefeatedRef.current = onBeastDefeated
    onPlayerDiedRef.current = onPlayerDied
    onLevelCompletedRef.current = onLevelCompleted
  }, [level, score, setScore, onBeastDefeated, onPlayerDied, onLevelCompleted])

  // Initialize the game only once
  useEffect(() => {
    console.log("GameCanvas useEffect - Creating new game instance with level:", levelRef.current.name)

    // Create a scene that uses the ref values
    const scene = new BeastScene(
      levelRef.current,
      scoreRef.current,
      (newScore: number) => setScoreRef.current(newScore),
      () => onBeastDefeatedRef.current(),
      () => onPlayerDiedRef.current(),
      undefined,
      onLevelCompletedRef.current ? () => onLevelCompletedRef.current!() : undefined
    )

    sceneRef.current = scene

    const config: Phaser.Types.Core.GameConfig = {
      type: Phaser.AUTO,
      width: (levelRef.current.width + 2) * 20,
      height: (levelRef.current.height + 2) * 20,
      backgroundColor: "#000000",
      parent: gameRef.current!,
      scene: [scene],
      scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH,
      },
    }
    const game = new Phaser.Game(config)

    return () => {
      console.log("GameCanvas useEffect - Destroying game instance")
      game.destroy(true)
    }
  }, []) // Empty dependency array means this only runs once

  return <div ref={gameRef} className="w-full h-full flex items-center justify-center" />
})

GameCanvas.displayName = "GameCanvas"
export default GameCanvas