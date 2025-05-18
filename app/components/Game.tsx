'use client'
import { useState, useEffect, useMemo, useCallback } from 'react';
import StatusBar from './StatusBar';
import { getLevel, initializeLevelManager } from '../utils/levelManager';

interface Coord { row: number; col: number; }

// Game constants
const MAP_SIZE = 40;                    // size of the map (40x40)
const BEAST_MS = 600;                   // beast step cadence (slightly slower for larger map)
const BEAST_SENSING_DISTANCE = 10;      // distance at which beasts can sense player
const BEAST_RANDOM_MOVE_CHANCE = 1/4;   // chance beast will move randomly even when player is in range

// Note: Map generation is now handled by the levelManager

// Key function for coordinates
const key = (r: number, c: number) => `${r},${c}`;

// ────────────── level parsing ──────────────
function parseLevel(map: string[]) {
  let player: Coord = { row: 0, col: 0 };
  const beasts: Coord[] = [];
  const blocks: Coord[] = [];
  const walls = new Set<string>();

  if (map.length === 0) {
    return { player, beasts, blocks, walls };
  }

  map.forEach((line: string, r: number) => {
    [...line].forEach((ch, c) => {
      switch (ch) {
        case 'P': player = { row: r, col: c }; break;
        case 'H': beasts.push({ row: r, col: c }); break;
        case 'B': blocks.push({ row: r, col: c }); break;
        case '#': walls.add(key(r, c)); break;
      }
    });
  });
  return { player, beasts, blocks, walls };
}

// Props interface for the Game component
interface GameProps {
  onLevelChange?: (level: number) => void;
  onReset?: (resetFunction: (advanceLevel?: boolean) => void) => void;
}

export default function Game({ onLevelChange, onReset }: GameProps = {}) {
  // Level progression state
  const [currentLevel, setCurrentLevel] = useState(1);
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [initialBeastCount, setInitialBeastCount] = useState(0);

  // Generate map on client-side only
  const [levelMap, setLevelMap] = useState<string[]>([]);
  const [rows, setRows] = useState(MAP_SIZE);
  const [cols, setCols] = useState(MAP_SIZE);

  // Initialize the game on client-side only
  useEffect(() => {
    // Initialize level manager
    initializeLevelManager(20); // Pre-generate 20 levels

    // Load the first level
    loadLevel(currentLevel);

    // Start the timer
    const timer = setInterval(() => {
      setTimeElapsed(prev => prev + 1);
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Expose the reset function to the parent component
  useEffect(() => {
    if (onReset) {
      onReset(reset);
    }
  }, [onReset]);

  // Load a specific level
  const loadLevel = useCallback((levelNumber: number) => {
    const level = getLevel(levelNumber);
    setLevelMap(level.mapData);
    setRows(level.mapData.length);
    setCols(level.mapData[0].length);
    setTimeElapsed(0);
  }, []);

  // Parse level data from the map
  const levelData = useMemo(() => {
    if (levelMap.length === 0) {
      return { player: { row: 0, col: 0 }, beasts: [], blocks: [], walls: new Set<string>() };
    }
    return parseLevel(levelMap);
  }, [levelMap]);

  /* initial state (fresh copy each time) */
  const { player: p0, beasts: b0, blocks: bl0, walls } = levelData;
  const [player, setPlayer]   = useState<Coord>(p0);
  const [beasts, setBeasts]   = useState<Coord[]>(b0);
  const [blocks, setBlocks]   = useState<Coord[]>(bl0);
  const [gameOver, setOver]   = useState(false);
  const [gameWon,  setWon]    = useState(false);

  // Update state when level data changes
  useEffect(() => {
    if (levelMap.length > 0) {
      setPlayer(p0);
      setBeasts(b0);
      setBlocks(bl0);
      setOver(false);
      setWon(false);

      // Track initial beast count for scoring
      setInitialBeastCount(b0.length);
    }
  }, [levelData, p0, b0, bl0]);

  /* helpers */
  const beastIdx = (r:number,c:number) => beasts.findIndex(b => b.row===r && b.col===c);
  const blockIdx = (r:number,c:number) => blocks.findIndex(b => b.row===r && b.col===c);
  const hasBlock = (r:number,c:number) => blockIdx(r,c) !== -1;

  /* restart or advance to next level */
  const reset = (advanceLevel = false) => {
    let newLevel = currentLevel;

    if (advanceLevel) {
      // Advance to next level
      newLevel = currentLevel + 1;
      setCurrentLevel(newLevel);
      loadLevel(newLevel);

    } else if (gameOver) {
      // Game over - restart from level 1
      newLevel = 1;
      setCurrentLevel(newLevel);
      loadLevel(newLevel);
    } else {
      // Manual restart - restart from level 1
      newLevel = 1;
      setCurrentLevel(newLevel);
      loadLevel(newLevel);
    }

    // Notify parent component of level change
    if (onLevelChange && newLevel !== currentLevel) {
      onLevelChange(newLevel);
    }

    setOver(false);
    setWon(false);
    setTimeElapsed(0);
  };

  /* ───────────── beast timer ─────────────*/
  useEffect(() => {
    const id = setInterval(() => {
      if (gameOver || gameWon) return;
      stepBeasts();
    }, BEAST_MS);
    return () => clearInterval(id);
  }, [blocks, beasts, gameOver, gameWon]); // Removed player from dependencies

  /* ───────────── keyboard listener ─────────────*/
  useEffect(() => {
    const dirMap: Record<string, Coord> = {
      ArrowUp: { row: -1, col:  0 }, w: { row: -1, col: 0 },
      ArrowDown:{ row: 1, col:  0 }, s:{ row:  1, col: 0 },
      ArrowLeft:{ row: 0, col: -1 }, a:{ row:  0, col:-1 },
      ArrowRight:{row: 0, col:  1 }, d:{ row:  0, col: 1 },
    };

    const onKey = (e: KeyboardEvent) => {
      // R key shortcut removed

      // For testing - advance to next level with 'n' key
      if (e.key === 'n' || e.key === 'N') {
        e.preventDefault();
        reset(true);
        return;
      }

      // Handle game over state
      if (gameOver) {
        if (e.key === ' ' || e.key === 'Enter') {
          e.preventDefault();
          reset();
        }
        return;
      }

      // Handle game won state
      if (gameWon) {
        if (e.key === ' ' || e.key === 'Enter') {
          e.preventDefault();
          reset(true); // Advance to next level
        }
        return;
      }

      // Handle movement
      const dir = dirMap[e.key];
      if (!dir) return;

      e.preventDefault();
      movePlayer(dir);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [player, blocks, beasts, gameOver, gameWon, currentLevel]);

  /* ───────────── movement logic ─────────────*/
  function movePlayer({ row: dR, col: dC }: Coord) {
    const trgR = player.row + dR, trgC = player.col + dC;
    if (walls.has(key(trgR,trgC))) return;               // wall
    if (beastIdx(trgR,trgC) !== -1) { setOver(true); return; }

    const bIdx = blockIdx(trgR,trgC);
    if (bIdx === -1) {
      setPlayer({ row: trgR, col: trgC });
    } else {
      /* attempt push (handle chain) */
      const chain: number[] = [];
      let curR = trgR, curC = trgC;
      while (blockIdx(curR,curC) !== -1) {
        chain.push(blockIdx(curR,curC));
        curR += dR; curC += dC;
        if (walls.has(key(curR,curC)) || curR<0||curR>=rows||curC<0||curC>=cols) return;
      }
      const beastHere = beastIdx(curR,curC);
      if (beastHere !== -1) {
        // Check if the beast is trapped (no empty space beyond it in the push direction)
        const beyondR = curR + dR;
        const beyondC = curC + dC;

        // Check if there's a wall, block, or edge beyond the beast
        const isTrapped =
          walls.has(key(beyondR, beyondC)) ||
          hasBlock(beyondR, beyondC) ||
          beyondR < 0 || beyondR >= rows ||
          beyondC < 0 || beyondC >= cols;

        // Only remove the beast if it's trapped
        if (isTrapped) {
          setBeasts(b => { const nb=[...b]; nb.splice(beastHere,1); return nb;});
        } else {
          // Beast survives, so we can't push the block here
          return;
        }
      } else if (hasBlock(curR,curC)) return;            // another chain blocked
      /* push blocks (from tail) */
      setBlocks(b => {
        const nb=[...b];
        for (let i=chain.length-1;i>=0;i--){
          const idx=chain[i];
          nb[idx]={ row: nb[idx].row+dR, col: nb[idx].col+dC };
        }
        return nb;
      });
      setPlayer({ row: trgR, col: trgC });
    }
  }

  function stepBeasts() {
    setBeasts(prev => {
      const next: Coord[] = [];
      const occupied = new Set<string>();
      let caught = false;

      prev.forEach(b => {
        const { row: br, col: bc } = b;
        /* choose dir toward player */
        const dR = Math.sign(player.row - br);
        const dC = Math.sign(player.col - bc);

        const tryMove = (r:number,c:number) =>
          !walls.has(key(r,c)) && !hasBlock(r,c) && !occupied.has(key(r,c)) &&
          // Check if another beast is already at this position
          beastIdx(r,c) === -1;

        // Get all possible moves (adjacent cells)
        const possibleMoves: Coord[] = [];
        const directions = [
          {row: -1, col: 0},  // up
          {row: 1, col: 0},   // down
          {row: 0, col: -1},  // left
          {row: 0, col: 1},   // right
        ];

        for (const dir of directions) {
          const r = br + dir.row;
          const c = bc + dir.col;
          if (tryMove(r, c)) {
            possibleMoves.push({row: r, col: c});
          }
        }

        let newR = br, newC = bc;

        // Calculate distance between beast and player
        const distance = Math.sqrt(Math.pow(player.row - br, 2) + Math.pow(player.col - bc, 2));

        // Only move towards player if within 10 blocks
        const shouldMoveTowardsPlayer = distance <= BEAST_SENSING_DISTANCE && Math.random() >= BEAST_RANDOM_MOVE_CHANCE;

        if (!shouldMoveTowardsPlayer && possibleMoves.length > 0) {
          // Move randomly
          const randomMove = possibleMoves[Math.floor(Math.random() * possibleMoves.length)];
          newR = randomMove.row;
          newC = randomMove.col;
        } else if (possibleMoves.length > 0) {
          // Try to move toward player
          let moved = false;

          if (Math.abs(player.col - bc) > Math.abs(player.row - br)) {
            if (dC && tryMove(br, bc + dC)) {
              newC += dC;
              moved = true;
            } else if (dR && tryMove(br + dR, bc)) {
              newR += dR;
              moved = true;
            }
          } else {
            if (dR && tryMove(br + dR, bc)) {
              newR += dR;
              moved = true;
            } else if (dC && tryMove(br, bc + dC)) {
              newC += dC;
              moved = true;
            }
          }

          // If couldn't move toward player, move randomly
          if (!moved && possibleMoves.length > 0) {
            const randomMove = possibleMoves[Math.floor(Math.random() * possibleMoves.length)];
            newR = randomMove.row;
            newC = randomMove.col;
          }
        }

        if (newR === player.row && newC === player.col) caught = true;
        occupied.add(key(newR,newC));
        next.push({ row: newR, col: newC });
      });

      if (caught) setOver(true);
      if (!caught && next.length === 0) setWon(true);
      return next;
    });
  }

  /* ───────────── render grid ─────────────*/
  const cellsJSX = [];
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      let ch = '', cls = 'cell empty';
      if (player.row === r && player.col === c) { ch = '▲'; cls = 'cell player'; }
      else if (beastIdx(r, c) !== -1)          { ch = 'H'; cls = 'cell beast'; }
      else if (hasBlock(r, c))                 { ch = ''; cls = 'cell block'; }
      else if (walls.has(key(r, c)))           { ch = ''; cls = 'cell wall'; }

      cellsJSX.push(
        <div
          key={`${r}-${c}`}
          className={cls}
          style={{ gridRow: r + 1, gridColumn: c + 1 }}
        >
          {ch}
        </div>
      );
    }
  }

  return (
    <div className="game-container w-full">
      <StatusBar
        currentLevel={currentLevel}
        beastsLeft={beasts.length}
        totalBeasts={initialBeastCount}
        timeElapsed={timeElapsed}
      />
      <div className="board" style={{ gridTemplateColumns: `repeat(${cols}, 16px)`, gridTemplateRows: `repeat(${rows}, 16px)` }}>
        {cellsJSX}

        <div className="game-controls" style={{ gridColumn: '1 / -1', gridRow: rows + 1, marginTop: '10px' }}>
          <button onClick={() => reset(true)} className="game-button">
            Next Level
          </button>
          <button onClick={() => reset(false)} className="game-button">
            Restart
          </button>
        </div>
        {gameOver && (
          <div className="status" style={{ gridColumn: '1 / -1', gridRow: rows + 2 }}>
            Game Over
          </div>
        )}
        {gameWon && (
          <div className="status" style={{ gridColumn: '1 / -1', gridRow: rows + 2 }}>
            Level {currentLevel} Complete!
          </div>
        )}

      </div>
    </div>
  );
}
