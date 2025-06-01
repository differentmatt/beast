"use client"

import { ArrowUp, ArrowDown, ArrowLeft, ArrowRight, MoveUpLeft, MoveUpRight, MoveDownLeft, MoveDownRight } from "lucide-react"
import { Button } from "@/app/components/ui/button"
import { useEffect, useState } from "react"

interface DPadProps {
  onMove: (direction: string) => void
}

export default function DPad({ onMove }: DPadProps) {
  const [isLandscape, setIsLandscape] = useState(false)

  useEffect(() => {
    const checkOrientation = () => {
      // Use matchMedia for more reliable orientation detection
      const landscape = window.matchMedia("(orientation: landscape)").matches
      setIsLandscape(landscape)
    }

    checkOrientation()
    window.addEventListener("resize", checkOrientation)
    window.addEventListener("orientationchange", checkOrientation)

    // iOS Safari specific handling
    if ("onorientationchange" in window) {
      window.addEventListener("orientationchange", () => {
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

  return (
    <div className={`grid grid-cols-3 gap-1 ${isLandscape ? "w-36 h-36" : "w-52"}`}>
      {/* Top row with diagonal movement */}
      <div className="col-start-1 row-start-1">
        <Button
          variant="outline"
          size="icon"
          className={`w-full ${isLandscape ? "h-9" : "h-11"} text-xs`}
          onClick={() => onMove("up-left")}
        >
          <MoveUpLeft className={`${isLandscape ? "h-4 w-4" : "h-5 w-5"}`} />
          <span className="sr-only">Up-Left</span>
        </Button>
      </div>
      <div className="col-start-2 row-start-1">
        <Button
          variant="secondary"
          size="icon"
          className={`w-full ${isLandscape ? "h-9" : "h-11"}`}
          onClick={() => onMove("up")}
        >
          <ArrowUp className={`${isLandscape ? "h-5 w-5" : "h-6 w-6"}`} />
          <span className="sr-only">Up</span>
        </Button>
      </div>
      <div className="col-start-3 row-start-1">
        <Button
          variant="outline"
          size="icon"
          className={`w-full ${isLandscape ? "h-9" : "h-11"} text-xs`}
          onClick={() => onMove("up-right")}
        >
          <MoveUpRight className={`${isLandscape ? "h-4 w-4" : "h-5 w-5"}`} />
          <span className="sr-only">Up-Right</span>
        </Button>
      </div>

      {/* Middle row */}
      <div className="col-start-1 row-start-2">
        <Button
          variant="secondary"
          size="icon"
          className={`w-full ${isLandscape ? "h-9" : "h-11"}`}
          onClick={() => onMove("left")}
        >
          <ArrowLeft className={`${isLandscape ? "h-5 w-5" : "h-6 w-6"}`} />
          <span className="sr-only">Left</span>
        </Button>
      </div>
      <div className="col-start-2 row-start-2">
        <div className={`w-full ${isLandscape ? "h-9" : "h-11"} flex items-center justify-center`}>
          <div className="w-3 h-3 rounded-full bg-muted-foreground"></div>
        </div>
      </div>
      <div className="col-start-3 row-start-2">
        <Button
          variant="secondary"
          size="icon"
          className={`w-full ${isLandscape ? "h-9" : "h-11"}`}
          onClick={() => onMove("right")}
        >
          <ArrowRight className={`${isLandscape ? "h-5 w-5" : "h-6 w-6"}`} />
          <span className="sr-only">Right</span>
        </Button>
      </div>

      {/* Bottom row with diagonal movement */}
      <div className="col-start-1 row-start-3">
        <Button
          variant="outline"
          size="icon"
          className={`w-full ${isLandscape ? "h-9" : "h-11"} text-xs`}
          onClick={() => onMove("down-left")}
        >
          <MoveDownLeft className={`${isLandscape ? "h-4 w-4" : "h-5 w-5"}`} />
          <span className="sr-only">Down-Left</span>
        </Button>
      </div>
      <div className="col-start-2 row-start-3">
        <Button
          variant="secondary"
          size="icon"
          className={`w-full ${isLandscape ? "h-9" : "h-11"}`}
          onClick={() => onMove("down")}
        >
          <ArrowDown className={`${isLandscape ? "h-5 w-5" : "h-6 w-6"}`} />
          <span className="sr-only">Down</span>
        </Button>
      </div>
      <div className="col-start-3 row-start-3">
        <Button
          variant="outline"
          size="icon"
          className={`w-full ${isLandscape ? "h-9" : "h-11"} text-xs`}
          onClick={() => onMove("down-right")}
        >
          <MoveDownRight className={`${isLandscape ? "h-4 w-4" : "h-5 w-5"}`} />
          <span className="sr-only">Down-Right</span>
        </Button>
      </div>
    </div>
  )
}
