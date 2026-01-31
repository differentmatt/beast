"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/app/components/ui/card"
import { Eye } from "lucide-react"
import { useEffect, useRef } from "react"
import type { LevelData } from "@/app/types/game"
import { CGA_COLORS, hexToColor, renderEntity } from "@/app/utils/entityRenderer"

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

    // Clear canvas with black background (CGA style)
    ctx.fillStyle = hexToColor(CGA_COLORS.black)
    ctx.fillRect(0, 0, canvasWidth, canvasHeight)

    // Draw grid background (black)
    ctx.fillStyle = hexToColor(CGA_COLORS.black)
    ctx.fillRect(borderWidth, borderHeight, canvasWidth - borderWidth * 2, canvasHeight - borderHeight * 2)

    // Draw wall border (CGA brown)
    ctx.fillStyle = hexToColor(CGA_COLORS.brown)
    // Top border
    ctx.fillRect(0, 0, canvasWidth, borderHeight)
    // Bottom border
    ctx.fillRect(0, canvasHeight - borderHeight, canvasWidth, borderHeight)
    // Left border
    ctx.fillRect(0, 0, borderWidth, canvasHeight)
    // Right border
    ctx.fillRect(canvasWidth - borderWidth, 0, borderWidth, canvasHeight)

    // Draw subtle grid lines (only if cells are large enough)
    const minCellSize = Math.min(cellWidth, cellHeight)
    if (minCellSize > 4) {
      ctx.strokeStyle = hexToColor(CGA_COLORS.darkGray)
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
    ctx.strokeStyle = hexToColor(CGA_COLORS.brown)
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
        {/* Legend - Using CGA colors */}
        <div className="space-y-2">
          <h4 className="text-sm font-medium font-dos">Legend</h4>
          <div className="grid grid-cols-2 gap-2 text-xs font-dos">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-black flex items-center justify-center text-[#55FFFF]">&#x263A;</div>
              <span>Player</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-black flex items-center justify-center text-[#FF5555] font-bold">H</div>
              <span>Beast</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-black flex items-center justify-center text-[#FF55FF] font-bold">H</div>
              <span>Super Beast</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-black flex items-center justify-center text-[#FFFF55]">&#x25CB;</div>
              <span>Egg</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-black flex items-center justify-center text-[#AA5500]">&#x2588;</div>
              <span>Wall</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-black flex items-center justify-center text-[#00AA00]">&#x2593;</div>
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
