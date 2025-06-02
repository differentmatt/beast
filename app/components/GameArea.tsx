"use client"

import { useState, useEffect, useRef } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { Button } from "@/app/components/ui/button"
import { RefreshCw, Play, ArrowRight, Home } from "lucide-react"
import StatusBar from "@/app/components/StatusBar"
import DPad from "@/app/components/DPad"
import GameCanvas, { GameCanvasHandles } from "@/app/components/GameCanvas"
import { LevelData } from "../types/game"
import { getLevelInfo, campaignLevels, userLevels } from "../data/levels"

export default function GameArea() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const levelId = searchParams.get("level") || "1"
  const gameCanvasRef = useRef<GameCanvasHandles>(null)

  const [score, setScore] = useState(0)
  const [level, setLevel] = useState(1)
  const [time, setTime] = useState(0)
  const [isMobile, setIsMobile] = useState(false)
  const [isLandscape, setIsLandscape] = useState(false)
  const [beastsLeft, setBeastsLeft] = useState(5)
  const [lives, setLives] = useState(3)
  const [gameSpeed, setGameSpeed] = useState(1.0)
  const [gameState, setGameState] = useState<"playing" | "paused-died" | "game-over">("playing")
  const [actualLives, setActualLives] = useState(3)
  const [levelCompleted, setLevelCompleted] = useState(false)

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

  // Poll game state from canvas
  useEffect(() => {
    let intervalId: NodeJS.Timeout | null = null

    const pollGameState = () => {
      if (gameCanvasRef.current) {
        const currentState = gameCanvasRef.current.getGameState()
        const currentLives = gameCanvasRef.current.getLives()
        const isCompleted = gameCanvasRef.current.isLevelCompleted()

        // Only update if values have actually changed to avoid unnecessary re-renders
        setGameState(prevState => prevState !== currentState ? currentState : prevState)
        setActualLives(prevLives => prevLives !== currentLives ? currentLives : prevLives)
        setLevelCompleted(prevCompleted => prevCompleted !== isCompleted ? isCompleted : prevCompleted)
      }
    }

    // Longer delay before starting polling to ensure game is fully initialized
    // This helps prevent false level completion detection when changing levels
    const timeoutId = setTimeout(() => {
      intervalId = setInterval(pollGameState, 200) // Poll every 200ms (less aggressive)
    }, 500) // Increased delay to 500ms

    return () => {
      clearTimeout(timeoutId)
      if (intervalId) clearInterval(intervalId)
    }
  }, [levelId])

  const handleRestart = () => {
    setScore(0)
    setLevel(1)
    setTime(0)
    setBeastsLeft(5)
    setLives(3)
    setGameState("playing")
    setActualLives(3)
    setLevelCompleted(false)
    // Restart will reload the component, resetting the scene
    window.location.reload()
  }

  const handleContinue = () => {
    if (gameCanvasRef.current) {
      gameCanvasRef.current.triggerRespawn()
    }
  }

  const handleMove = (direction: string) => {
    // Forward movement to the game canvas
    if (gameCanvasRef.current) {
      gameCanvasRef.current.move(direction as any)
    }
  }

  const levelInfo = getLevelInfo(levelId)

  // Helper functions to determine level type and navigation
  const isCampaignLevel = (id: string): boolean => {
    return campaignLevels.some(level => level.id.toString() === id)
  }

  const getNextCampaignLevel = (currentId: string): string | null => {
    const currentLevel = campaignLevels.find(level => level.id.toString() === currentId)
    if (!currentLevel) return null

    const nextLevel = campaignLevels.find(level => level.id === currentLevel.id + 1)
    return nextLevel ? nextLevel.id.toString() : null
  }

  const handleLevelCompleted = () => {
    setLevelCompleted(true)
  }

  const handleNextLevel = () => {
    const nextLevelId = getNextCampaignLevel(levelId)
    if (nextLevelId) {
      // Force a full page reload to ensure clean state
      window.location.href = `/play?level=${nextLevelId}`
    }
  }

  const handleBackToLevels = () => {
    if (isCampaignLevel(levelId)) {
      router.push("/")
    } else {
      router.push("/?tab=your-levels")
    }
  }

  // Set initial game parameters based on level
  useEffect(() => {
    const levelInfo = getLevelInfo(levelId)
    setBeastsLeft(levelInfo.beasts)
    setGameSpeed(levelInfo.gameSpeed)
    setLevelCompleted(false) // Reset level completed state when level changes
    setGameState("playing") // Reset game state when level changes
  }, [levelId])

  return (
    <div className={`flex flex-col h-full ${isLandscape ? "p-2" : "p-4"}`}>
      <div className={`flex-1 flex ${isLandscape ? "flex-row gap-2" : "flex-col items-start"}`}>
        <div className={`w-full max-w-3xl mx-auto ${isLandscape ? "flex flex-row gap-2" : ""}`}>
          <div className="flex flex-col w-full">
            <div
              className={`relative ${isLandscape ? "flex-1" : "w-full"} ${
                isLandscape
                  ? "h-full" // In landscape, take full available height
                  : "min-h-[50vh] max-h-[70vh]" // In portrait, set both min and max height
              } flex items-center justify-center transition-all duration-200`}
            >
              <GameCanvas
                ref={gameCanvasRef}
                level={levelInfo}
                score={score}
                setScore={setScore}
                onBeastDefeated={() => setBeastsLeft((b) => Math.max(0, b - 1))}
                onPlayerDied={() => setLives((l) => l - 1)}
                onLevelCompleted={handleLevelCompleted}
              />

              {/* Death/Game Over/Level Complete Overlay */}
              {gameCanvasRef.current && ((gameState === "paused-died" && !levelCompleted) || gameState === "game-over" || levelCompleted) && (
                <div className="absolute inset-0 bg-black/70 flex items-center justify-center z-50">
                  <div className="bg-gray-900/90 border border-gray-600 rounded-lg p-6 text-center max-w-sm mx-4">
                    {levelCompleted ? (
                      <>
                        <h2 className="text-2xl font-bold text-green-400 mb-2">Level Completed!</h2>
                        <p className="text-gray-300 mb-4">Congratulations! You defeated all the beasts.</p>
                        <p className="text-sm text-gray-400 mb-4">Final Score: {score}</p>
                        <div className="flex gap-2 justify-center flex-wrap">
                          <Button variant="outline" size="sm" onClick={handleRestart} className="flex items-center gap-1">
                            <RefreshCw className="h-4 w-4" />
                            <span>Restart</span>
                          </Button>
                          {isCampaignLevel(levelId) && getNextCampaignLevel(levelId) && (
                            <Button variant="default" size="sm" onClick={handleNextLevel} className="flex items-center gap-1">
                              <ArrowRight className="h-4 w-4" />
                              <span>Next Level</span>
                            </Button>
                          )}
                          <Button variant="secondary" size="sm" onClick={handleBackToLevels} className="flex items-center gap-1">
                            <Home className="h-4 w-4" />
                            <span>{isCampaignLevel(levelId) ? "Campaign" : "User Levels"}</span>
                          </Button>
                        </div>
                      </>
                    ) : gameState === "paused-died" ? (
                      <>
                        <h2 className="text-xl font-bold text-red-400 mb-2">You Died!</h2>
                        <p className="text-gray-300 mb-4">Lives remaining: {actualLives}</p>
                        <div className="flex gap-2 justify-center">
                          <Button variant="outline" size="sm" onClick={handleRestart} className="flex items-center gap-1">
                            <RefreshCw className="h-4 w-4" />
                            <span>Restart</span>
                          </Button>
                          <Button variant="default" size="sm" onClick={handleContinue} className="flex items-center gap-1">
                            <Play className="h-4 w-4" />
                            <span>Continue</span>
                          </Button>
                        </div>
                      </>
                    ) : (
                      <>
                        <h2 className="text-2xl font-bold text-red-500 mb-2">Game Over!</h2>
                        <p className="text-gray-300 mb-4">No lives remaining</p>
                        <Button variant="outline" size="sm" onClick={handleRestart} className="flex items-center gap-1">
                          <RefreshCw className="h-4 w-4" />
                          <span>Restart Game</span>
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Status Bar with Restart Button - Now directly below game area */}
            <div className={`w-full flex justify-between items-center ${isLandscape ? "mt-1" : "mt-2"}`}>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={handleRestart} className="flex items-center gap-1">
                  <RefreshCw className="h-4 w-4" />
                  <span>Restart</span>
                </Button>

              </div>
              <StatusBar beastsLeft={beastsLeft} level={level} time={time} lives={actualLives} score={score} />
            </div>
          </div>

          {isLandscape && isMobile && (
            <div className="flex items-center justify-center">
              <DPad onMove={handleMove} />
            </div>
          )}
        </div>
      </div>

      {isMobile && !isLandscape && (
        <div className="flex justify-center mt-2">
          <DPad onMove={handleMove} />
        </div>
      )}
    </div>
  )
}
