"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/app/components/ui/card"
import { Eye } from "lucide-react"
import { useEffect, useRef } from "react"
import type { LevelData } from "@/app/types/game"
import { ENTITY_COLORS, renderEntity } from "@/app/utils/entityRenderer"

interface LevelPreviewProps {
  levelData: LevelData | null
}

export default function LevelPreview({ levelData }: LevelPreviewProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas || !levelData) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Get container dimensions
    const container = containerRef.current
    if (!container) return

    const containerRect = container.getBoundingClientRect()
    const maxWidth = containerRect.width - 32 // Account for padding
    const maxHeight = 400 // Maximum height

    // Calculate canvas dimensions based on level aspect ratio
    const levelRatio = levelData.width / levelData.height

    let canvasWidth, canvasHeight

    if (levelRatio > 1) {
      // Wider than tall
      canvasWidth = Math.min(maxWidth, maxHeight * levelRatio)
      canvasHeight = canvasWidth / levelRatio
    } else {
      // Taller than wide or square
      canvasHeight = Math.min(maxHeight, maxWidth / levelRatio)
      canvasWidth = canvasHeight * levelRatio
    }

    // Add extra space for border
    const borderWidth = canvasWidth / levelData.width
    const borderHeight = canvasHeight / levelData.height
    canvasWidth += borderWidth * 2
    canvasHeight += borderHeight * 2

    // Set canvas dimensions
    canvas.width = canvasWidth
    canvas.height = canvasHeight

    // Calculate cell size
    const cellWidth = (canvasWidth - borderWidth * 2) / levelData.width
    const cellHeight = (canvasHeight - borderHeight * 2) / levelData.height

    // Clear canvas with background color
    ctx.fillStyle = "#f8f9fa"
    ctx.fillRect(0, 0, canvasWidth, canvasHeight)

    // Draw grid background
    ctx.fillStyle = "#ffffff"
    ctx.fillRect(borderWidth, borderHeight, canvasWidth - borderWidth * 2, canvasHeight - borderHeight * 2)

    // Draw wall border
    ctx.fillStyle = "#eab308" // Yellow
    // Top border
    ctx.fillRect(0, 0, canvasWidth, borderHeight)
    // Bottom border
    ctx.fillRect(0, canvasHeight - borderHeight, canvasWidth, borderHeight)
    // Left border
    ctx.fillRect(0, 0, borderWidth, canvasHeight)
    // Right border
    ctx.fillRect(canvasWidth - borderWidth, 0, borderWidth, canvasHeight)

    // Draw grid lines (only if cells are large enough)
    const minCellSize = Math.min(cellWidth, cellHeight)
    if (minCellSize > 2) {
      ctx.strokeStyle = "#e5e7eb"
      ctx.lineWidth = 0.5

      // Vertical lines
      for (let i = 0; i <= levelData.width + 1; i++) {
        const x = borderWidth + i * cellWidth
        ctx.beginPath()
        ctx.moveTo(x, borderHeight)
        ctx.lineTo(x, canvasHeight - borderHeight)
        ctx.stroke()
      }

      // Horizontal lines
      for (let i = 0; i <= levelData.height + 1; i++) {
        const y = borderHeight + i * cellHeight
        ctx.beginPath()
        ctx.moveTo(borderWidth, y)
        ctx.lineTo(canvasWidth - borderWidth, y)
        ctx.stroke()
      }
    }

    // Draw entities from the generated map
    levelData.map.forEach((row, y) => {
      row.forEach((entity, x) => {
        if (entity === "empty") return

        // Position entities in the actual level space
        const posX = borderWidth + x * cellWidth
        const posY = borderHeight + y * cellHeight

        renderEntity(entity, {
          x: posX,
          y: posY,
          size: cellWidth,
          ctx
        })
      })
    })

    // Draw border
    ctx.strokeStyle = "#d1d5db"
    ctx.lineWidth = 2
    ctx.strokeRect(0, 0, canvasWidth, canvasHeight)
  }, [levelData])

  const getSpeedColor = (speed: number) => {
    if (speed < 0.8) return "text-green-600"
    if (speed < 1.2) return "text-blue-600"
    if (speed < 1.8) return "text-orange-600"
    return "text-red-600"
  }

  if (!levelData) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Eye className="h-5 w-5" />
            Level Preview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <p className="text-sm text-muted-foreground">Configure level parameters to see preview</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Eye className="h-5 w-5" />
          Level Preview
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Legend */}
        <div className="space-y-2">
          <h4 className="text-sm font-medium">Legend</h4>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-[#3b82f6] transform rotate-45" />
              <span>Player</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-[#ef4444] flex items-center justify-center text-[8px] font-bold text-white">H</div>
              <span>Beast</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-[#9333ea] flex items-center justify-center text-[8px] font-bold text-white">H</div>
              <span>Super Beast</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-[#eab308] rounded-full" />
              <span>Egg</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-[#eab308]" />
              <span>Wall</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-[#1a472a]" />
              <span>Block</span>
            </div>
          </div>
        </div>

        {/* Canvas Preview */}
        <div className="space-y-2">
          <div ref={containerRef} className="flex justify-center">
            <canvas ref={canvasRef} className="border rounded-lg" style={{ maxWidth: "100%", height: "auto" }} />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
