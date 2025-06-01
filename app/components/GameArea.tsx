"use client"

import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { Button } from "@/app/components/ui/button"
import { RefreshCw } from "lucide-react"
import StatusBar from "@/app/components/StatusBar"
import DPad from "@/app/components/DPad"
import GameCanvas from "@/app/components/GameCanvas"
import { LevelData } from "../types/game"
import { getLevelInfo } from "../data/levels"

export default function GameArea() {
  const searchParams = useSearchParams()
  const levelId = searchParams.get("level") || "1"

  const [score, setScore] = useState(0)
  const [level, setLevel] = useState(1)
  const [time, setTime] = useState(0)
  const [isMobile, setIsMobile] = useState(false)
  const [isLandscape, setIsLandscape] = useState(false)
  const [beastsLeft, setBeastsLeft] = useState(5)
  const [lives, setLives] = useState(3)
  const [gameSpeed, setGameSpeed] = useState(1.0)

  // Check device and orientation with improved detection for iOS
  useEffect(() => {
    // Function to check if device is in landscape mode
    const checkOrientation = () => {
      // Use matchMedia for more reliable orientation detection (works better on iOS)
      const landscape = window.matchMedia("(orientation: landscape)").matches
      const mobile = window.innerWidth < 768 || /iPhone|iPad|iPod|Android/i.test(navigator.userAgent)

      setIsMobile(mobile)
      setIsLandscape(mobile && landscape)
    }

    // Initial check
    checkOrientation()

    // Listen for orientation changes and resize events
    window.addEventListener("resize", checkOrientation)
    window.addEventListener("orientationchange", checkOrientation)

    // iOS Safari specific event
    if ("onorientationchange" in window) {
      window.addEventListener("orientationchange", () => {
        // Small delay to ensure iOS has completed the orientation change
        setTimeout(checkOrientation, 100)
      })
    }

    return () => {
      window.removeEventListener("resize", checkOrientation)
      window.removeEventListener("orientationchange", checkOrientation)
      if ("onorientationchange" in window) {
        window.removeEventListener("orientationchange", checkOrientation)
      }
    }
  }, [])

  // Timer simulation
  useEffect(() => {
    const timer = setInterval(() => {
      setTime((prev) => prev + 1)
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  const handleRestart = () => {
    setScore(0)
    setLevel(1)
    setTime(0)
    setBeastsLeft(5)
    setLives(3)
  }

  const handleMove = (direction: string) => {
    // This would connect to your game logic
    console.log(`Move: ${direction}`)
    // Simulate score increase for demo
    setScore((prev) => prev + 1)

    // Level up every 10 points
    if (score > 0 && score % 10 === 0) {
      setLevel((prev) => prev + 1)
      setBeastsLeft(5) // Reset beasts for new level
    }

    // Simulate beast defeat occasionally
    if (score > 0 && score % 3 === 0 && beastsLeft > 0) {
      setBeastsLeft((prev) => prev - 1)
    }
  }

  const levelInfo = getLevelInfo(levelId)

  // Set initial game parameters based on level
  useEffect(() => {
    const levelInfo = getLevelInfo(levelId)
    setBeastsLeft(levelInfo.beasts)
    setGameSpeed(levelInfo.gameSpeed)
  }, [levelId])

  return (
    <div className={`flex flex-col h-full ${isLandscape ? "p-2" : "p-4"}`}>
      <div className={`flex-1 flex ${isLandscape ? "flex-row gap-2" : "flex-col items-center justify-center"}`}>
        <div className={`w-full max-w-3xl mx-auto ${isLandscape ? "flex flex-row gap-2" : ""}`}>
          <div
            className={`relative ${isLandscape ? "flex-1" : "w-full"} ${
              isLandscape
                ? "h-full" // In landscape, take full available height
                : "max-h-[70vh]" // In portrait, just limit height
            } flex items-center justify-center`}
          >
            <GameCanvas
              level={levelInfo}
              score={score}
              setScore={setScore}
              onBeastDefeated={() => setBeastsLeft((b) => Math.max(0, b - 1))}
              onPlayerDied={() => setLives((l) => l - 1)}
            />
          </div>

          {isLandscape && isMobile && (
            <div className="flex items-center justify-center">
              <DPad onMove={handleMove} />
            </div>
          )}
        </div>
      </div>

      <div className={`w-full max-w-3xl mx-auto flex justify-between items-center ${isLandscape ? "mt-1" : "mt-2"}`}>
        <Button variant="outline" size="sm" onClick={handleRestart} className="flex items-center gap-1">
          <RefreshCw className="h-4 w-4" />
          <span>Restart</span>
        </Button>
        <StatusBar beastsLeft={beastsLeft} level={level} time={time} lives={lives} score={score} />
      </div>

      {isMobile && !isLandscape && (
        <div className="flex justify-center mt-2">
          <DPad onMove={handleMove} />
        </div>
      )}
    </div>
  )
}
