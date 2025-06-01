import * as Phaser from "phaser";
import { GameEntity, LevelData } from "@/app/types/game"
import { ENTITY_COLORS, renderEntity } from "@/app/utils/entityRenderer"

type Direction = "up" | "down" | "left" | "right"

export default class BeastScene extends Phaser.Scene {
  gridSize = 20
  cols = 32
  rows = 20
  map: GameEntity[][] = []
  player = { x: 1, y: 1 }
  enemies: { x: number; y: number; type: GameEntity }[] = []
  cursors!: Phaser.Types.Input.Keyboard.CursorKeys
  inputQueue: Direction[] = []
  started = false
  private helpText!: Phaser.GameObjects.Text
  private blockPatterns: { [key: string]: boolean[][] } = {}

  constructor(
    private level: LevelData,
    private score: number,
    private setScore: (s: number) => void,
    private onBeastDefeated: () => void,
    private onPlayerDied: () => void
  ) {
    super("BeastScene")
    console.log(this.level)
  }

  enqueueMove(dir: Direction) {
    this.inputQueue.push(dir)
  }

  preload() {
    this.cursors = this.input.keyboard!.createCursorKeys()
  }

  create() {
    this.initMap(this.level)
    this.renderMap()
    this.input.keyboard!.once('keydown', this.startGame, this)
    this.input.once('pointerdown', this.startGame, this)
  }

  startGame() {
    this.started = true
  }

  initMap(level: LevelData) {
    this.map = level.map.map(row => row.map(cell => cell as GameEntity))
    this.cols = level.width
    this.rows = level.height

    // Populate enemies from level map data
    for (let y = 0; y < this.rows; y++) {
      for (let x = 0; x < this.cols; x++) {
        const c = level.map[y][x]
        if (c === "beast" || c === "superBeast" || c === "egg" || c === "hatchedBeast") {
          this.enemies.push({ x, y, type: c })
        } else if (c === "player") {
          this.player = { x, y }
        }
      }
    }
  }

  update() {
    if (!this.started) return

    const move = (dx: number, dy: number) => {
      const { x, y } = this.player
      const nx = x + dx, ny = y + dy
      if (!this.inBounds(nx, ny)) return
      const t = this.map[ny][nx]
      if (t === "empty") {
        this.map[y][x] = "empty"
        this.map[ny][nx] = "player"
        this.player = { x: nx, y: ny }
        this.moveBeasts()
      } else if (t === "block") {
        const bnx = nx + dx, bny = ny + dy
        if (this.inBounds(bnx, bny) && this.map[bny][bnx] === "empty") {
          this.map[bny][bnx] = "block"
          this.map[ny][nx] = "player"
          this.map[y][x] = "empty"
          this.player = { x: nx, y: ny }
          this.moveBeasts()
        }
      }
    }

    if (Phaser.Input.Keyboard.JustDown(this.cursors.left!)) move(-1, 0)
    if (Phaser.Input.Keyboard.JustDown(this.cursors.right!)) move(1, 0)
    if (Phaser.Input.Keyboard.JustDown(this.cursors.up!)) move(0, -1)
    if (Phaser.Input.Keyboard.JustDown(this.cursors.down!)) move(0, 1)

    if (this.inputQueue.length > 0) {
      const dir = this.inputQueue.shift()
      if (dir === "left") move(-1, 0)
      if (dir === "right") move(1, 0)
      if (dir === "up") move(0, -1)
      if (dir === "down") move(0, 1)
    }

    this.renderMap()
  }

  moveBeasts() {
    for (const b of this.enemies) this.map[b.y][b.x] = "empty"
    for (const b of this.enemies) {
      const dx = Math.sign(this.player.x - b.x)
      const dy = Math.sign(this.player.y - b.y)
      const opts = [
        { x: b.x + dx, y: b.y },
        { x: b.x, y: b.y + dy },
      ]
      for (const pos of opts) {
        if (this.inBounds(pos.x, pos.y) && this.map[pos.y][pos.x] === "empty") {
          b.x = pos.x; b.y = pos.y; break
        }
      }
    }
    for (const b of this.enemies) this.map[b.y][b.x] = "beast"
    this.checkCrush()
    this.checkDeath()
  }

  checkCrush() {
    for (const b of [...this.enemies]) {
      const adj = [[1,0],[-1,0],[0,1],[0,-1]]
      for (const [dx, dy] of adj) {
        const ax = b.x + dx, ay = b.y + dy
        const bx = b.x - dx, by = b.y - dy
        if (this.inBounds(ax,ay) && this.inBounds(bx,by) &&
            this.map[ay][ax] === "block" && this.map[by][bx] === "block") {
          this.map[b.y][b.x] = "empty"
          this.enemies = this.enemies.filter(e => e !== b)
          this.setScore(this.score += 100)
          this.onBeastDefeated()
          break
        }
      }
    }
  }

  checkDeath() {
    for (const b of this.enemies) {
      if (b.x === this.player.x && b.y === this.player.y) {
        this.onPlayerDied()
        this.scene.restart()
      }
    }
  }

  inBounds(x: number, y: number) {
    return x >= 0 && x < this.cols && y >= 0 && y < this.rows
  }

  renderMap() {
    this.children.removeAll()
    const graphics = this.add.graphics()

    // Calculate dimensions including border
    const totalWidth = (this.cols + 2) * this.gridSize
    const totalHeight = (this.rows + 2) * this.gridSize

    // Draw background
    graphics.fillStyle(0x000000)
    graphics.fillRect(0, 0, totalWidth, totalHeight)

    // Draw border (one grid cell thick)
    graphics.fillStyle(ENTITY_COLORS.wall)
    // Top border
    graphics.fillRect(0, 0, totalWidth, this.gridSize)
    // Bottom border
    graphics.fillRect(0, totalHeight - this.gridSize, totalWidth, this.gridSize)
    // Left border
    graphics.fillRect(0, 0, this.gridSize, totalHeight)
    // Right border
    graphics.fillRect(totalWidth - this.gridSize, 0, this.gridSize, totalHeight)

    // Draw entities (offset by one grid cell to account for border)
    for (let y = 0; y < this.rows; y++) {
      for (let x = 0; x < this.cols; x++) {
        const entity = this.map[y][x]
        if (entity !== "empty") {
          renderEntity(entity, {
            x: (x + 1) * this.gridSize,
            y: (y + 1) * this.gridSize,
            size: this.gridSize,
            graphics,
            scene: this
          })
        }
      }
    }
  }
}
