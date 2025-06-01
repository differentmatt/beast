import * as Phaser from "phaser";
import { GameEntity, LevelData, Beast, Egg, Player, Direction, Position, MovementResult } from "@/app/types/game"
import { ENTITY_COLORS, renderEntity } from "@/app/utils/entityRenderer"

export default class BeastScene extends Phaser.Scene {
  gridSize = 20
  cols = 32
  rows = 20
  map: GameEntity[][] = []
  player: Player = { x: 1, y: 1, lastMoveTime: 0 }
  beasts: Beast[] = []
  eggs: Egg[] = []
  cursors!: Phaser.Types.Input.Keyboard.CursorKeys
  wasd!: { [key: string]: Phaser.Input.Keyboard.Key }
  started = false
  gameSpeed = 1.0
  lastUpdateTime = 0
  updateInterval = 200 // Base update interval in ms
  score = 0
  beastsRemaining = 0
  lives = 3
  gameState: "playing" | "paused-died" | "game-over" = "playing"
  initialPlayerPosition: Position = { x: 1, y: 1 }
  messageText: Phaser.GameObjects.Text | null = null

  // Movement deltas for 8-directional movement
  private readonly directions: { [key in Direction]: Position } = {
    "up": { x: 0, y: -1 },
    "down": { x: 0, y: 1 },
    "left": { x: -1, y: 0 },
    "right": { x: 1, y: 0 },
    "up-left": { x: -1, y: -1 },
    "up-right": { x: 1, y: -1 },
    "down-left": { x: -1, y: 1 },
    "down-right": { x: 1, y: 1 }
  }

  constructor(
    private level: LevelData,
    private initialScore: number,
    private setScore: (s: number) => void,
    private onBeastDefeated: () => void,
    private onPlayerDied: () => void,
    private onGameOver?: () => void,
    private onLevelCompleted?: () => void
  ) {
    super("BeastScene")
    this.score = initialScore
    this.gameSpeed = level.gameSpeed
    this.updateInterval = Math.max(50, 200 / this.gameSpeed)
  }

  preload() {
    this.cursors = this.input.keyboard!.createCursorKeys()
    // Add WASD keys for additional movement options
    this.wasd = this.input.keyboard!.addKeys('W,S,A,D') as { [key: string]: Phaser.Input.Keyboard.Key }
  }

  create() {
    this.initLevel(this.level)
    this.renderMap()
    this.input.keyboard!.once('keydown', this.startGame, this)
    this.input.once('pointerdown', this.startGame, this)
  }

  startGame() {
    this.started = true
    this.lastUpdateTime = this.time.now
  }

  // Public method for mobile DPad to trigger movement
  handleDirectMove(direction: Direction) {
    if (!this.started || this.gameState !== "playing") return

    const currentTime = this.time.now
    if (currentTime - this.player.lastMoveTime < this.updateInterval) return

    this.movePlayer(direction)
    this.player.lastMoveTime = currentTime
  }

  // Public method to trigger respawn
  triggerRespawn() {
    if (this.gameState === "paused-died") {
      this.respawnPlayer()
    }
  }

  // Public getters for game state
  getLives(): number {
    return this.lives
  }

  getGameState(): "playing" | "paused-died" | "game-over" {
    return this.gameState
  }

  isLevelCompleted(): boolean {
    return this.beastsRemaining <= 0
  }


  initLevel(level: LevelData) {
    this.map = level.map.map(row => row.map(cell => cell as GameEntity))
    this.cols = level.width
    this.rows = level.height
    this.beasts = []
    this.eggs = []
    this.beastsRemaining = level.beasts + level.superBeasts

    // Find player position and entities from level map
    for (let y = 0; y < this.rows; y++) {
      for (let x = 0; x < this.cols; x++) {
        const entity = level.map[y][x]
        switch (entity) {
          case "player":
            this.player = { x, y, lastMoveTime: 0 }
            this.initialPlayerPosition = { x, y } // Store initial position for respawning
            this.map[y][x] = "empty" // Player position is tracked separately
            break
          case "beast":
            this.beasts.push({
              id: `beast_${x}_${y}`,
              x, y,
              type: "beast",
              lastMoveTime: 0
            })
            this.map[y][x] = "empty"
            break
          case "superBeast":
            this.beasts.push({
              id: `superbeast_${x}_${y}`,
              x, y,
              type: "superBeast",
              lastMoveTime: 0
            })
            this.map[y][x] = "empty"
            break
          case "hatchedBeast":
            this.beasts.push({
              id: `hatchedbeast_${x}_${y}`,
              x, y,
              type: "hatchedBeast",
              lastMoveTime: 0
            })
            this.map[y][x] = "empty"
            break
          case "egg":
            this.eggs.push({
              id: `egg_${x}_${y}`,
              x, y,
              hatchTime: this.time.now,
              hatchDuration: 10000 // 10 seconds
            })
            this.map[y][x] = "empty"
            break
        }
      }
    }
  }

  update() {
    if (!this.started) return

    const currentTime = this.time.now

    // Handle input based on game state
    if (this.gameState === "playing") {
      // Handle input with 8-directional movement
      this.handlePlayerInput()

      // Update game state at controlled intervals
      if (currentTime - this.lastUpdateTime >= this.updateInterval) {
        this.updateGameState(currentTime)
        this.lastUpdateTime = currentTime
      }
    }
    // paused-died and game-over states stop updates

    this.renderMap()
  }

  private handlePlayerInput() {
    if (this.gameState !== "playing") return

    const currentTime = this.time.now

    // Prevent too rapid movement
    if (currentTime - this.player.lastMoveTime < this.updateInterval) return

    let direction: Direction | null = null

    // Handle 8-directional movement
    const left = Phaser.Input.Keyboard.JustDown(this.cursors.left!) || Phaser.Input.Keyboard.JustDown(this.wasd.A)
    const right = Phaser.Input.Keyboard.JustDown(this.cursors.right!) || Phaser.Input.Keyboard.JustDown(this.wasd.D)
    const up = Phaser.Input.Keyboard.JustDown(this.cursors.up!) || Phaser.Input.Keyboard.JustDown(this.wasd.W)
    const down = Phaser.Input.Keyboard.JustDown(this.cursors.down!) || Phaser.Input.Keyboard.JustDown(this.wasd.S)

    if (up && left) direction = "up-left"
    else if (up && right) direction = "up-right"
    else if (down && left) direction = "down-left"
    else if (down && right) direction = "down-right"
    else if (up) direction = "up"
    else if (down) direction = "down"
    else if (left) direction = "left"
    else if (right) direction = "right"

    if (direction) {
      this.movePlayer(direction)
      this.player.lastMoveTime = currentTime
    }
  }

  private updateGameState(currentTime: number) {
    // Update eggs - check for hatching
    this.updateEggs(currentTime)

    // Move beasts
    this.moveBeasts(currentTime)

    // Check win/lose conditions
    this.checkGameConditions()
  }

  private updateEggs(currentTime: number) {
    this.eggs = this.eggs.filter(egg => {
      if (currentTime - egg.hatchTime >= egg.hatchDuration) {
        // Hatch egg into beast
        this.beasts.push({
          id: `hatched_${egg.id}`,
          x: egg.x,
          y: egg.y,
          type: "hatchedBeast",
          lastMoveTime: currentTime
        })
        this.beastsRemaining++
        return false // Remove egg
      }
      return true
    })
  }

  private movePlayer(direction: Direction): MovementResult {
    const delta = this.directions[direction]
    const newX = this.player.x + delta.x
    const newY = this.player.y + delta.y

    if (!this.inBounds(newX, newY)) {
      return { success: false, blocked: true }
    }

    const targetEntity = this.map[newY][newX]

    // Check for beasts at target position
    const beastAtTarget = this.beasts.find(b => b.x === newX && b.y === newY)

    switch (targetEntity) {
      case "empty":
        if (beastAtTarget) {
          // Check if beast has backing wall/block for crushing
          const backingX = newX + delta.x
          const backingY = newY + delta.y

          let hasBacking = false
          if (!this.inBounds(backingX, backingY)) {
            hasBacking = true // Map edge acts as backing
          } else {
            const backingEntity = this.map[backingY][backingX]
            hasBacking = (backingEntity === "wall" || backingEntity === "block")
            // Also check for another beast as backing
            const backingBeast = this.beasts.find(b => b.x === backingX && b.y === backingY)
            if (backingBeast) hasBacking = true
          }

          if (hasBacking) {
            // Crush the beast and move here
            this.crushBeasts([beastAtTarget])
            this.player.x = newX
            this.player.y = newY
            return { success: true, crushed: [beastAtTarget] }
          } else {
            // Can't crush, can't move
            return { success: false, blocked: true }
          }
        } else {
          // Empty space, move here
          this.player.x = newX
          this.player.y = newY
          return { success: true }
        }

      case "block":
        // Try to push the block
        return this.pushBlock(newX, newY, direction)

      case "wall":
        return { success: false, blocked: true }

      default:
        return { success: false, blocked: true }
    }
  }

  private pushBlock(blockX: number, blockY: number, direction: Direction): MovementResult {
    const delta = this.directions[direction]

    // Find the chain of blocks that can be pushed
    const blockChain = this.findBlockChain(blockX, blockY, direction)

    if (blockChain.canPush) {
      // Move all blocks in the chain
      this.moveBlockChain(blockChain.blocks, direction)

      // Move player to the first block's position
      this.player.x = blockX
      this.player.y = blockY

      // Check for crushing at the end of the chain
      const lastBlock = blockChain.blocks[blockChain.blocks.length - 1]
      const finalX = lastBlock.x + delta.x
      const finalY = lastBlock.y + delta.y
      const crushedBeasts = this.checkCrushing(finalX, finalY)

      return { success: true, crushed: crushedBeasts }
    }

    // Check if we're crushing something at the obstruction point
    const blockedX = blockX + delta.x
    const blockedY = blockY + delta.y

    if (this.inBounds(blockedX, blockedY)) {
      // Check for beasts that would be crushed by pushing against the obstruction
      const beastToCrush = this.beasts.find(b => b.x === blockedX && b.y === blockedY)
      if (beastToCrush) {
        // Verify there's something to crush against behind the beast
        const crushBackX = blockedX + delta.x
        const crushBackY = blockedY + delta.y

        let canCrush = false
        if (!this.inBounds(crushBackX, crushBackY)) {
          canCrush = true // Map edge
        } else {
          const backEntity = this.map[crushBackY][crushBackX]
          canCrush = (backEntity === "wall" || backEntity === "block")
        }

        if (canCrush) {
          this.crushBeasts([beastToCrush])
          this.player.x = blockX
          this.player.y = blockY
          return { success: true, crushed: [beastToCrush] }
        }
      }

      // Check for player crushing
      if (this.player.x === blockedX && this.player.y === blockedY) {
        const crushBackX = blockedX + delta.x
        const crushBackY = blockedY + delta.y

        let canCrush = false
        if (!this.inBounds(crushBackX, crushBackY)) {
          canCrush = true // Map edge
        } else {
          const backEntity = this.map[crushBackY][crushBackX]
          canCrush = (backEntity === "wall" || backEntity === "block")
        }

        if (canCrush) {
          this.handlePlayerDeath()
          return { success: false, playerDied: true }
        }
      }
    }

    return { success: false, blocked: true }
  }

  private findBlockChain(startX: number, startY: number, direction: Direction): { canPush: boolean, blocks: {x: number, y: number}[] } {
    const delta = this.directions[direction]
    const blocks: {x: number, y: number}[] = []
    let currentX = startX
    let currentY = startY

    // Collect all consecutive blocks in the push direction
    while (this.inBounds(currentX, currentY) && this.map[currentY][currentX] === "block") {
      blocks.push({ x: currentX, y: currentY })
      currentX += delta.x
      currentY += delta.y
    }

    // Check if the space after the last block is available
    if (!this.inBounds(currentX, currentY)) {
      // Cannot push blocks off the edge - perimeter acts like a wall
      return { canPush: false, blocks: [] }
    }

    const finalEntity = this.map[currentY][currentX]

    // Check if there's a beast or player at the final position
    const beastAtPosition = this.beasts.find(b => b.x === currentX && b.y === currentY)
    const playerAtPosition = (this.player.x === currentX && this.player.y === currentY)

    // If there's a beast or player, check if they can be crushed
    if (beastAtPosition || playerAtPosition) {
      // Check if there's something behind to crush against
      const behindX = currentX + delta.x
      const behindY = currentY + delta.y

      let hasBacking = false
      if (!this.inBounds(behindX, behindY)) {
        hasBacking = true // Edge of map acts like a wall
      } else {
        const behindEntity = this.map[behindY][behindX]
        hasBacking = (behindEntity === "wall" || behindEntity === "block")
        // Also check for another beast as backing
        const backingBeast = this.beasts.find(b => b.x === behindX && b.y === behindY)
        if (backingBeast) hasBacking = true
      }

      if (hasBacking) {
        return { canPush: true, blocks } // Can crush the beast/player
      } else {
        return { canPush: false, blocks: [] } // Beast/player acts as wall - can't crush
      }
    }

    // Can push if the final position is empty
    if (finalEntity === "empty") {
      return { canPush: true, blocks }
    }

    // Cannot push into walls or other blocks
    if (finalEntity === "wall" || finalEntity === "block") {
      return { canPush: false, blocks: [] }
    }

    return { canPush: false, blocks: [] }
  }

  private moveBlockChain(blocks: {x: number, y: number}[], direction: Direction) {
    const delta = this.directions[direction]

    // Move blocks from the end to avoid overwriting
    for (let i = blocks.length - 1; i >= 0; i--) {
      const block = blocks[i]
      const newX = block.x + delta.x
      const newY = block.y + delta.y

      // Clear old position
      this.map[block.y][block.x] = "empty"

      // Set new position - should always be within bounds since we checked in findBlockChain
      if (this.inBounds(newX, newY)) {
        this.map[newY][newX] = "block"
      }
    }
  }

  private moveBeasts(currentTime: number) {
    for (const beast of this.beasts) {
      if (currentTime - beast.lastMoveTime >= this.updateInterval * (0.8 + Math.random() * 0.4)) {
        this.moveBeast(beast, currentTime)
        beast.lastMoveTime = currentTime
      }
    }
  }

  private moveBeast(beast: Beast, currentTime: number) {
    const distanceToPlayer = Math.abs(beast.x - this.player.x) + Math.abs(beast.y - this.player.y)
    const isCloseToPlayer = distanceToPlayer <= 5 // Within 5 tiles

    let direction: Direction

    if (isCloseToPlayer && Math.random() < 0.7) {
      // Move toward player with some randomness
      direction = this.getDirectionTowardsPlayer(beast)

      // Add some randomness to make movement less predictable
      if (Math.random() < 0.3) {
        direction = this.getRandomDirection()
      }
    } else {
      // Random movement
      direction = this.getRandomDirection()
    }

    // Only hatched beasts get multi-block movement
    if (beast.type === "hatchedBeast") {
      this.moveBeastMultiBlock(beast, direction)
    } else {
      // Regular beasts move one block at a time
      const delta = this.directions[direction]
      const newX = beast.x + delta.x
      const newY = beast.y + delta.y

      if (this.inBounds(newX, newY)) {
        const targetEntity = this.map[newY][newX]

        if (targetEntity === "empty") {
          // Check if player is at target position
          if (this.player.x === newX && this.player.y === newY) {
            // Check if player can squash this beast first
            if (this.canPlayerSquashBeast(beast, newX, newY)) {
              // Player squashes the beast
              this.crushBeasts([beast])
              return
            } else {
              // Beast collides with player - player dies
              this.handlePlayerDeath()
              return
            }
          }

          // Check if another beast is at target position
          const otherBeast = this.beasts.find(b => b.id !== beast.id && b.x === newX && b.y === newY)
          if (!otherBeast) {
            beast.x = newX
            beast.y = newY
          }
        }
        // Regular beasts and super beasts cannot push blocks - they just stop
        // Only movement into empty spaces is allowed
      }
    }
  }

  private moveBeastMultiBlock(beast: Beast, direction: Direction) {
    const delta = this.directions[direction]
    let currentX = beast.x
    let currentY = beast.y
    let moveCount = 0
    const maxMoves = Math.max(this.cols, this.rows) // Prevent infinite loops

    // Keep moving until we hit an obstruction
    while (moveCount < maxMoves) {
      const newX = currentX + delta.x
      const newY = currentY + delta.y

      if (!this.inBounds(newX, newY)) {
        break // Hit boundary
      }

      const targetEntity = this.map[newY][newX]

      // Check if player is at target position
      if (this.player.x === newX && this.player.y === newY) {
        // Check if player can squash this beast first
        if (this.canPlayerSquashBeast(beast, newX, newY)) {
          // Player squashes the beast
          this.crushBeasts([beast])
          return
        } else {
          // Player can't squash beast, so beast kills player
          this.handlePlayerDeath()
          return
        }
      }

      // Check for other beasts at target position
      const otherBeast = this.beasts.find(b => b.id !== beast.id && b.x === newX && b.y === newY)

      switch (targetEntity) {
        case "empty":
          if (otherBeast) {
            // Check if other beast has backing wall/block for crushing
            const backingX = newX + delta.x
            const backingY = newY + delta.y

            let hasBacking = false
            if (!this.inBounds(backingX, backingY)) {
              hasBacking = true // Map edge acts as backing
            } else {
              const backingEntity = this.map[backingY][backingX]
              hasBacking = (backingEntity === "wall" || backingEntity === "block")
              // Also check for another beast as backing
              const backingBeast = this.beasts.find(b => b.x === backingX && b.y === backingY)
              if (backingBeast) hasBacking = true
            }

            if (hasBacking) {
              // Crush the other beast and stop here
              this.crushBeasts([otherBeast])
              beast.x = newX
              beast.y = newY
              return
            } else {
              // Can't crush, stop movement
              break
            }
          } else {
            // Empty space, continue moving
            currentX = newX
            currentY = newY
            moveCount++
          }
          break

        case "block":
          // Try to push the block
          const pushResult = this.beastPushBlock(beast, newX, newY, direction)
          if (pushResult) {
            // Move to where the block was and stop (block pushing ends movement)
            beast.x = newX
            beast.y = newY
            return
          } else {
            // Can't push, stop movement
            break
          }

        case "wall":
          // Hit wall, stop movement
          break

        default:
          // Hit unknown entity, stop movement
          break
      }
    }

    // Update beast position if we moved at all
    if (moveCount > 0) {
      beast.x = currentX
      beast.y = currentY
    }
  }

  private beastPushBlock(beast: Beast, blockX: number, blockY: number, direction: Direction): boolean {
    // Find the chain of blocks that can be pushed
    const blockChain = this.findBlockChain(blockX, blockY, direction)

    if (blockChain.canPush) {
      // Move all blocks in the chain
      this.moveBlockChain(blockChain.blocks, direction)

      // Check for crushing at the end of the chain
      const delta = this.directions[direction]
      const lastBlock = blockChain.blocks[blockChain.blocks.length - 1]
      const finalX = lastBlock.x + delta.x
      const finalY = lastBlock.y + delta.y
      this.checkCrushing(finalX, finalY)

      return true
    }

    return false
  }

  private getDirectionTowardsPlayer(beast: Beast): Direction {
    const dx = this.player.x - beast.x
    const dy = this.player.y - beast.y

    // Choose direction based on largest difference
    if (Math.abs(dx) > Math.abs(dy)) {
      if (dx > 0) {
        return dy > 0 ? "down-right" : dy < 0 ? "up-right" : "right"
      } else {
        return dy > 0 ? "down-left" : dy < 0 ? "up-left" : "left"
      }
    } else {
      if (dy > 0) {
        return dx > 0 ? "down-right" : dx < 0 ? "down-left" : "down"
      } else {
        return dx > 0 ? "up-right" : dx < 0 ? "up-left" : "up"
      }
    }
  }

  private getRandomDirection(): Direction {
    const directions: Direction[] = ["up", "down", "left", "right", "up-left", "up-right", "down-left", "down-right"]
    return directions[Math.floor(Math.random() * directions.length)]
  }

  private checkCrushing(finalX: number, finalY: number): Beast[] {
    // This method should only crush beasts that are at the final position where blocks ended up
    // after being pushed, and only if there's backing behind them
    const crushedBeasts: Beast[] = []

    // Check if there's a beast at the final position
    const beastAtFinal = this.beasts.find(b => b.x === finalX && b.y === finalY)
    if (beastAtFinal) {
      crushedBeasts.push(beastAtFinal)
    }

    this.crushBeasts(crushedBeasts)
    return crushedBeasts
  }

  private getCrushedBeasts(fromX: number, fromY: number, toX: number, toY: number): Beast[] {
    return this.beasts.filter(beast => beast.x === fromX && beast.y === fromY)
  }

  private crushBeasts(beasts: Beast[]) {
    for (const beast of beasts) {
      // Super beasts can only be crushed against walls
      if (beast.type === "superBeast") {
        const crushedAgainstWall = this.checkSuperBeastCrushing(beast)
        if (!crushedAgainstWall) continue
      }

      this.beasts = this.beasts.filter(b => b.id !== beast.id)
      this.score += beast.type === "superBeast" ? 200 : 100
      this.setScore(this.score)
      this.onBeastDefeated()
      this.beastsRemaining--
    }
  }

  private checkSuperBeastCrushing(beast: Beast): boolean {
    const cardinalDirections = [
      { x: 0, y: -1 }, { x: 0, y: 1 }, { x: -1, y: 0 }, { x: 1, y: 0 }
    ]

    for (const dir of cardinalDirections) {
      const adjacentX = beast.x + dir.x
      const adjacentY = beast.y + dir.y
      const oppositeX = beast.x - dir.x
      const oppositeY = beast.y - dir.y

      if (this.inBounds(adjacentX, adjacentY) && this.inBounds(oppositeX, oppositeY)) {
        const adjacentEntity = this.map[adjacentY][adjacentX]
        const oppositeEntity = this.map[oppositeY][oppositeX]

        // Super beast must be crushed between block and wall (or two walls)
        if ((adjacentEntity === "block" && oppositeEntity === "wall") ||
            (adjacentEntity === "wall" && oppositeEntity === "block") ||
            (adjacentEntity === "wall" && oppositeEntity === "wall")) {
          return true
        }
      }
    }
    return false
  }

  private canPlayerSquashBeast(beast: Beast, beastX: number, beastY: number): boolean {
    // The beast is trying to move to beastX, beastY (where player currently is)
    // Check if the player can squash the beast by having backing behind the player
    // in the direction opposite to where the beast is coming from

    // Calculate the direction the beast is moving
    const dirX = beastX - beast.x
    const dirY = beastY - beast.y

    // Check if there's backing behind the player (where the beast is pushing toward)
    const backingX = beastX + dirX
    const backingY = beastY + dirY

    let hasBacking = false

    if (!this.inBounds(backingX, backingY)) {
      hasBacking = true // Map edge acts as backing
    } else {
      const backingEntity = this.map[backingY][backingX]
      hasBacking = (backingEntity === "wall" || backingEntity === "block")
      // Also check for another beast as backing
      const backingBeast = this.beasts.find(b => b.x === backingX && b.y === backingY)
      if (backingBeast) hasBacking = true
    }

    return hasBacking
  }

  private checkCollisions() {
    // Check if player collides with any beast
    for (const beast of this.beasts) {
      if (beast.x === this.player.x && beast.y === this.player.y) {
        this.handlePlayerDeath()
        return
      }
    }
  }

  private handlePlayerDeath() {
    this.lives--

    if (this.lives > 0) {
      // Player has lives remaining - pause game
      this.gameState = "paused-died"
    } else {
      // Game over
      this.gameState = "game-over"
      if (this.onGameOver) {
        this.onGameOver()
      }
    }

    // Still call the original callback for any external handling
    this.onPlayerDied()
  }

  private checkGameConditions() {
    if (this.beastsRemaining <= 0) {
      // Player wins - level completed
      this.gameState = "paused-died" // Reuse this state to pause the game
      this.started = false
      this.showMessage("Level Completed!")
      if (this.onLevelCompleted) {
        this.onLevelCompleted()
      }
    }
  }

  inBounds(x: number, y: number): boolean {
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

    // Draw border
    graphics.fillStyle(ENTITY_COLORS.wall)
    graphics.fillRect(0, 0, totalWidth, this.gridSize)
    graphics.fillRect(0, totalHeight - this.gridSize, totalWidth, this.gridSize)
    graphics.fillRect(0, 0, this.gridSize, totalHeight)
    graphics.fillRect(totalWidth - this.gridSize, 0, this.gridSize, totalHeight)

    // Draw map entities
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

    // Draw player
    renderEntity("player", {
      x: (this.player.x + 1) * this.gridSize,
      y: (this.player.y + 1) * this.gridSize,
      size: this.gridSize,
      graphics,
      scene: this
    })

    // Draw beasts
    for (const beast of this.beasts) {
      renderEntity(beast.type, {
        x: (beast.x + 1) * this.gridSize,
        y: (beast.y + 1) * this.gridSize,
        size: this.gridSize,
        graphics,
        scene: this
      })
    }

    // Draw eggs
    for (const egg of this.eggs) {
      renderEntity("egg", {
        x: (egg.x + 1) * this.gridSize,
        y: (egg.y + 1) * this.gridSize,
        size: this.gridSize,
        graphics,
        scene: this
      })
    }
  }

  private showMessage(text: string) {
    // Remove existing message if any
    if (this.messageText) {
      this.messageText.destroy()
    }

    // Create semi-transparent background
    const bg = this.add.graphics()
    bg.fillStyle(0x000000, 0.8)
    bg.fillRect(0, 0, (this.cols + 2) * this.gridSize, (this.rows + 2) * this.gridSize)

    // Create message text
    this.messageText = this.add.text(
      ((this.cols + 2) * this.gridSize) / 2,
      ((this.rows + 2) * this.gridSize) / 2,
      text,
      {
        fontSize: '24px',
        color: '#ffffff',
        align: 'center',
        wordWrap: { width: (this.cols + 2) * this.gridSize - 40 }
      }
    )
    this.messageText.setOrigin(0.5, 0.5)

    // Make sure message appears on top
    this.messageText.setDepth(1000)
    bg.setDepth(999)
  }

  private hideMessage() {
    if (this.messageText) {
      this.messageText.destroy()
      this.messageText = null
    }
  }

  private findSafeRespawnPosition(): Position {
    // Try original position first
    if (this.isPositionSafe(this.initialPlayerPosition.x, this.initialPlayerPosition.y)) {
      return this.initialPlayerPosition
    }

    // Search for a safe position in expanding circles from initial position
    for (let radius = 1; radius < Math.max(this.cols, this.rows); radius++) {
      for (let dx = -radius; dx <= radius; dx++) {
        for (let dy = -radius; dy <= radius; dy++) {
          // Only check positions on the edge of the current radius
          if (Math.abs(dx) !== radius && Math.abs(dy) !== radius) continue

          const x = this.initialPlayerPosition.x + dx
          const y = this.initialPlayerPosition.y + dy

          if (this.isPositionSafe(x, y)) {
            return { x, y }
          }
        }
      }
    }

    // Fallback: use initial position even if not safe
    return this.initialPlayerPosition
  }

  private isPositionSafe(x: number, y: number): boolean {
    // Check bounds
    if (!this.inBounds(x, y)) return false

    // Check if position is empty
    if (this.map[y][x] !== "empty") return false

    // Check if any beast is at this position
    const beastAtPosition = this.beasts.find(b => b.x === x && b.y === y)
    if (beastAtPosition) return false

    // Check if any beast is adjacent (gives player a chance)
    const adjacentPositions = [
      { x: x - 1, y }, { x: x + 1, y },
      { x, y: y - 1 }, { x, y: y + 1 }
    ]

    const adjacentBeasts = adjacentPositions.filter(pos =>
      this.inBounds(pos.x, pos.y) &&
      this.beasts.some(b => b.x === pos.x && b.y === pos.y)
    ).length

    // Position is safe if there are fewer than 2 adjacent beasts
    return adjacentBeasts < 2
  }

  private respawnPlayer() {
    // Find safe position
    const safePosition = this.findSafeRespawnPosition()

    // Move player to safe position
    this.player.x = safePosition.x
    this.player.y = safePosition.y
    this.player.lastMoveTime = this.time.now

    // Resume game
    this.gameState = "playing"
    this.hideMessage()
  }

  // Mock server functions for future network features
  private mockSaveGameState() {
    // Placeholder for saving game state to server
    console.log("Mock: Saving game state to server")
  }

  private mockSendPlayerMove(direction: Direction) {
    // Placeholder for sending player move to server
    console.log(`Mock: Sending player move ${direction} to server`)
  }

  private mockReceiveGameUpdate() {
    // Placeholder for receiving game updates from server
    console.log("Mock: Receiving game update from server")
  }
}