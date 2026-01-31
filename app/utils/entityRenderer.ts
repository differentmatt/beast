import { GameEntity } from "@/app/types/game"

// CGA Color Palette - Authentic DOS colors
export const CGA_COLORS = {
  black: 0x000000,
  blue: 0x0000AA,
  green: 0x00AA00,
  cyan: 0x00AAAA,
  red: 0xAA0000,
  magenta: 0xAA00AA,
  brown: 0xAA5500,
  lightGray: 0xAAAAAA,
  darkGray: 0x555555,
  lightBlue: 0x5555FF,
  lightGreen: 0x55FF55,
  lightCyan: 0x55FFFF,
  lightRed: 0xFF5555,
  lightMagenta: 0xFF55FF,
  yellow: 0xFFFF55,
  white: 0xFFFFFF,
} as const

// Entity colors using CGA palette
export const ENTITY_COLORS = {
  player: CGA_COLORS.lightCyan,
  wall: CGA_COLORS.brown,
  block: CGA_COLORS.green,
  beast: CGA_COLORS.lightRed,
  superBeast: CGA_COLORS.lightMagenta,
  egg: CGA_COLORS.yellow,
  hatchedBeast: CGA_COLORS.lightRed,
  empty: CGA_COLORS.black,
} as const

// DOS Box-drawing and special characters
export const DOS_CHARS = {
  wall: '\u2588',        // █ Full block
  block: '\u2593',       // ▓ Dark shade
  player: '\u263A',      // ☺ Smiley face (classic DOS player)
  beast: 'H',            // H - the iconic beast
  superBeast: 'H',       // H - same but different color
  hatchedBeast: 'H',     // H - same but different color
  egg: '\u25CB',         // ○ Circle
  empty: ' ',            // Space
} as const

// The DOS font family to use (VT323 from Google Fonts, with fallbacks)
export const DOS_FONT = 'VT323, "Courier New", "Consolas", monospace'

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
// Now renders DOS-style characters instead of shapes
export const renderEntity = (entity: GameEntity, options: RenderOptions) => {
  const { x, y, size, ctx, graphics, scene } = options
  const centerX = x + size / 2
  const centerY = y + size / 2

  if (ctx) {
    // Canvas 2D rendering (for LevelPreview)
    renderEntityCanvas(entity, ctx, x, y, size, centerX, centerY)
  } else if (graphics && scene) {
    // Phaser Graphics rendering (for BeastScene)
    renderEntityPhaser(entity, graphics, scene, x, y, size, centerX, centerY)
  }
}

// Canvas 2D rendering for level preview
function renderEntityCanvas(
  entity: GameEntity,
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number,
  centerX: number,
  centerY: number
) {
  // Fill background with black first
  ctx.fillStyle = hexToColor(CGA_COLORS.black)
  ctx.fillRect(x, y, size, size)

  const fontSize = size * 0.9
  ctx.font = `${fontSize}px ${DOS_FONT}`
  ctx.textAlign = "center"
  ctx.textBaseline = "middle"

  switch (entity) {
    case "player":
      ctx.fillStyle = hexToColor(ENTITY_COLORS.player)
      ctx.fillText(DOS_CHARS.player, centerX, centerY)
      break
    case "beast":
      ctx.fillStyle = hexToColor(ENTITY_COLORS.beast)
      ctx.fillText(DOS_CHARS.beast, centerX, centerY)
      break
    case "superBeast":
      ctx.fillStyle = hexToColor(ENTITY_COLORS.superBeast)
      ctx.fillText(DOS_CHARS.superBeast, centerX, centerY)
      break
    case "hatchedBeast":
      ctx.fillStyle = hexToColor(ENTITY_COLORS.hatchedBeast)
      // Hatched beasts blink/flash - use slightly different rendering
      ctx.font = `bold ${fontSize}px ${DOS_FONT}`
      ctx.fillText(DOS_CHARS.hatchedBeast, centerX, centerY)
      break
    case "egg":
      ctx.fillStyle = hexToColor(ENTITY_COLORS.egg)
      ctx.fillText(DOS_CHARS.egg, centerX, centerY)
      break
    case "wall":
      ctx.fillStyle = hexToColor(ENTITY_COLORS.wall)
      ctx.fillText(DOS_CHARS.wall, centerX, centerY)
      break
    case "block":
      ctx.fillStyle = hexToColor(ENTITY_COLORS.block)
      ctx.fillText(DOS_CHARS.block, centerX, centerY)
      break
  }
}

// Phaser rendering for game scene
function renderEntityPhaser(
  entity: GameEntity,
  graphics: Phaser.GameObjects.Graphics,
  scene: Phaser.Scene,
  x: number,
  y: number,
  size: number,
  centerX: number,
  centerY: number
) {
  // Fill background with black
  graphics.fillStyle(CGA_COLORS.black)
  graphics.fillRect(x, y, size, size)

  const fontSize = Math.floor(size * 0.9)

  switch (entity) {
    case "player":
      scene.add.text(centerX, centerY, DOS_CHARS.player, {
        fontSize: `${fontSize}px`,
        fontFamily: DOS_FONT,
        color: hexToColor(ENTITY_COLORS.player),
      }).setOrigin(0.5)
      break
    case "beast":
      scene.add.text(centerX, centerY, DOS_CHARS.beast, {
        fontSize: `${fontSize}px`,
        fontFamily: DOS_FONT,
        color: hexToColor(ENTITY_COLORS.beast),
      }).setOrigin(0.5)
      break
    case "superBeast":
      scene.add.text(centerX, centerY, DOS_CHARS.superBeast, {
        fontSize: `${fontSize}px`,
        fontFamily: DOS_FONT,
        color: hexToColor(ENTITY_COLORS.superBeast),
      }).setOrigin(0.5)
      break
    case "hatchedBeast":
      scene.add.text(centerX, centerY, DOS_CHARS.hatchedBeast, {
        fontSize: `${fontSize}px`,
        fontFamily: DOS_FONT,
        color: hexToColor(ENTITY_COLORS.hatchedBeast),
        fontStyle: 'bold',
      }).setOrigin(0.5)
      break
    case "egg":
      scene.add.text(centerX, centerY, DOS_CHARS.egg, {
        fontSize: `${fontSize}px`,
        fontFamily: DOS_FONT,
        color: hexToColor(ENTITY_COLORS.egg),
      }).setOrigin(0.5)
      break
    case "wall":
      scene.add.text(centerX, centerY, DOS_CHARS.wall, {
        fontSize: `${fontSize}px`,
        fontFamily: DOS_FONT,
        color: hexToColor(ENTITY_COLORS.wall),
      }).setOrigin(0.5)
      break
    case "block":
      scene.add.text(centerX, centerY, DOS_CHARS.block, {
        fontSize: `${fontSize}px`,
        fontFamily: DOS_FONT,
        color: hexToColor(ENTITY_COLORS.block),
      }).setOrigin(0.5)
      break
  }
}

// Legacy color exports for backwards compatibility with border rendering
export const LEGACY_COLORS = {
  wall: CGA_COLORS.brown,
}
