import { GameEntity } from "@/app/types/game"

// Shared color constants
export const ENTITY_COLORS = {
  player: 0x3b82f6,    // Blue
  wall: 0xeab308,      // Yellow
  block: 0x1a472a,     // Dark Green
  beast: 0xef4444,     // Red
  superBeast: 0x9333ea, // Purple
  egg: 0xeab308,       // Yellow
  hatchedBeast: 0xff8800, // Orange
  empty: 0x000000,     // Black
} as const

// Helper to convert hex number to hex string with #
export const hexToColor = (hex: number): string => {
  return '#' + hex.toString(16).padStart(6, '0')
}

// Helper to convert hex string to number
export const colorToHex = (color: string): number => {
  return parseInt(color.replace('#', ''), 16)
}

// Shared interface for rendering options
export interface RenderOptions {
  x: number
  y: number
  size: number
  ctx?: CanvasRenderingContext2D
  graphics?: Phaser.GameObjects.Graphics
  scene?: Phaser.Scene
}

// Function to render an entity using either Canvas 2D or Phaser Graphics
export const renderEntity = (entity: GameEntity, options: RenderOptions) => {
  const { x, y, size, ctx, graphics, scene } = options
  const centerX = x + size / 2
  const centerY = y + size / 2
  const entitySize = size * 0.8

  if (ctx) {
    // Canvas 2D rendering (for LevelPreview)
    switch (entity) {
      case "player":
        ctx.fillStyle = hexToColor(ENTITY_COLORS.player)
        ctx.beginPath()
        // Draw diamond shape
        ctx.moveTo(centerX, centerY - entitySize / 2)
        ctx.lineTo(centerX + entitySize / 2, centerY)
        ctx.lineTo(centerX, centerY + entitySize / 2)
        ctx.lineTo(centerX - entitySize / 2, centerY)
        ctx.closePath()
        ctx.fill()
        break
      case "beast":
        ctx.fillStyle = hexToColor(ENTITY_COLORS.beast)
        ctx.font = `${entitySize * 0.8}px Arial`
        ctx.textAlign = "center"
        ctx.textBaseline = "middle"
        ctx.fillText("H", centerX, centerY)
        break
      case "superBeast":
        ctx.fillStyle = hexToColor(ENTITY_COLORS.superBeast)
        ctx.font = `bold ${entitySize * 0.8}px Arial`
        ctx.textAlign = "center"
        ctx.textBaseline = "middle"
        ctx.fillText("H", centerX, centerY)
        break
      case "egg":
        ctx.fillStyle = hexToColor(ENTITY_COLORS.egg)
        ctx.beginPath()
        ctx.arc(centerX, centerY, entitySize / 2, 0, 2 * Math.PI)
        ctx.fill()
        break
      case "wall":
        ctx.fillStyle = hexToColor(ENTITY_COLORS.wall)
        ctx.fillRect(x, y, size, size)
        break
      case "block":
        // Create a patchy dark green pattern
        const darkGreen = hexToColor(ENTITY_COLORS.block)
        const darkerGreen = "#0f2d1a" // Even darker green for patches

        // Fill base color
        ctx.fillStyle = darkGreen
        ctx.fillRect(x, y, size, size)

        // Add random patches
        const patchSize = Math.max(2, Math.floor(size / 4))
        for (let px = 0; px < size; px += patchSize) {
          for (let py = 0; py < size; py += patchSize) {
            if (Math.random() > 0.5) {
              ctx.fillStyle = darkerGreen
              ctx.fillRect(x + px, y + py, patchSize, patchSize)
            }
          }
        }
        break
    }
  } else if (graphics && scene) {
    // Phaser Graphics rendering (for BeastScene)
    switch (entity) {
      case "player":
        graphics.fillStyle(ENTITY_COLORS.player)
        graphics.beginPath()
        graphics.moveTo(centerX, centerY - entitySize / 2)
        graphics.lineTo(centerX + entitySize / 2, centerY)
        graphics.lineTo(centerX, centerY + entitySize / 2)
        graphics.lineTo(centerX - entitySize / 2, centerY)
        graphics.closePath()
        graphics.fillPath()
        break
      case "beast":
        // Add "H" text with red color
        const beastText = scene.add.text(centerX, centerY, "H", {
          fontSize: `${entitySize * 1.0}px`,
          color: hexToColor(ENTITY_COLORS.beast)
        }).setOrigin(0.5)
        break
      case "superBeast":
        graphics.fillStyle(ENTITY_COLORS.superBeast)
        graphics.fillCircle(centerX, centerY, entitySize / 2)
        // Add "H" text
        const superBeastText = scene.add.text(centerX, centerY, "H", {
          fontSize: `${entitySize * 0.8}px`,
          color: '#ffffff',
          fontStyle: 'bold'
        }).setOrigin(0.5)
        break
      case "hatchedBeast":
        // Draw distinctive orange circle for hatched beast
        graphics.fillStyle(ENTITY_COLORS.hatchedBeast)
        graphics.fillCircle(centerX, centerY, entitySize / 2)
        // Add "H" text with darker color for contrast
        const hatchedBeastText = scene.add.text(centerX, centerY, "H", {
          fontSize: `${entitySize * 0.8}px`,
          color: '#000000',
          fontStyle: 'bold'
        }).setOrigin(0.5)
        break
      case "egg":
        graphics.fillStyle(ENTITY_COLORS.egg)
        graphics.fillCircle(centerX, centerY, entitySize / 2)
        break
      case "wall":
        graphics.fillStyle(ENTITY_COLORS.wall)
        graphics.fillRect(x, y, size, size)
        break
      case "block":
        graphics.fillStyle(ENTITY_COLORS.block)
        graphics.fillRect(x, y, size, size)
        // Add patchy pattern
        const patchSize = Math.max(2, Math.floor(size / 4))
        for (let px = 0; px < size; px += patchSize) {
          for (let py = 0; py < size; py += patchSize) {
            if (Math.random() > 0.5) {
              graphics.fillStyle(0x0f2d1a)
              graphics.fillRect(x + px, y + py, patchSize, patchSize)
            }
          }
        }
        break
    }
  }
}