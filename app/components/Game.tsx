'use client'
import { useState, useEffect, useMemo } from 'react';

interface Coord { row: number; col: number; }

// Game constants
const BEAST_MS = 600;                   // beast step cadence (slightly slower for larger map)
const MAP_SIZE = 40;                    // size of the map (40x40)

// Map generation constants
const WALL_DENSITY_MIN = 0.01;          // minimum percentage of inner cells that are walls (3%)
const WALL_DENSITY_MAX = 0.02;          // maximum percentage of inner cells that are walls (5%)
const WALL_SEGMENTS_DIVISOR = 25;       // divisor to determine number of wall segments
const WALL_LENGTH_MIN = 3;              // minimum length of wall segments
const WALL_LENGTH_MAX = 10;             // maximum length of wall segments
const WALL_PADDING = 3;                 // padding from edge for wall placement

const ROOM_COUNT_MIN = 0;               // minimum number of rooms
const ROOM_COUNT_MAX = 2;               // maximum number of rooms
const ROOM_SIZE_MIN = 2;                // minimum room size (2x2)
const ROOM_SIZE_MAX = 3;                // maximum room size (3x3)
const ROOM_PADDING = 2;                 // padding from edge for room placement

const BEAST_COUNT_MIN = 16;              // minimum number of beasts
const BEAST_COUNT_MAX = 30;             // maximum number of beasts
const MIN_BEAST_PLAYER_DISTANCE = 12;   // minimum distance between beast and player
const BEAST_SENSING_DISTANCE = 10;      // distance at which beasts can sense player
const BEAST_RANDOM_MOVE_CHANCE = 1/4;   // chance beast will move randomly even when player is in range

const BLOCK_DENSITY_MIN = 0.1;         // minimum percentage of inner cells that are blocks (5%)
const BLOCK_DENSITY_MAX = 0.3;          // maximum percentage of inner cells that are blocks (10%)
const NEAR_PLAYER_BLOCKS_MIN = 3;       // minimum number of blocks near player
const NEAR_PLAYER_BLOCKS_MAX = 5;       // maximum number of blocks near player
const NEAR_PLAYER_BLOCK_DISTANCE_MIN = 3; // minimum distance for near-player blocks
const NEAR_PLAYER_BLOCK_DISTANCE_MAX = 8; // maximum distance for near-player blocks

// Function to generate a random map
function generateRandomMap() {
  const map: string[] = [];

  // Initialize with empty spaces
  for (let i = 0; i < MAP_SIZE; i++) {
    map.push('.'.repeat(MAP_SIZE));
  }

  // Create border walls
  map[0] = '#'.repeat(MAP_SIZE);
  map[MAP_SIZE - 1] = '#'.repeat(MAP_SIZE);
  for (let i = 1; i < MAP_SIZE - 1; i++) {
    map[i] = '#' + map[i].substring(1, MAP_SIZE - 1) + '#';
  }

  // Create some maze-like structures with walls
  // Add random internal walls (reduced from 8-12% to 3-5% of inner cells)
  const innerCells = (MAP_SIZE - 2) * (MAP_SIZE - 2);
  const wallCount = Math.floor(innerCells * (WALL_DENSITY_MIN + Math.random() * (WALL_DENSITY_MAX - WALL_DENSITY_MIN)));

  // Create some wall patterns rather than just random walls
  // Add some horizontal and vertical wall segments
  const numWallSegments = Math.floor(wallCount / WALL_SEGMENTS_DIVISOR);

  for (let i = 0; i < numWallSegments; i++) {
    const isHorizontal = Math.random() > 0.5;
    const length = WALL_LENGTH_MIN + Math.floor(Math.random() * (WALL_LENGTH_MAX - WALL_LENGTH_MIN + 1));

    if (isHorizontal) {
      const row = WALL_PADDING + Math.floor(Math.random() * (MAP_SIZE - WALL_PADDING * 2));
      const startCol = WALL_PADDING + Math.floor(Math.random() * (MAP_SIZE - length - WALL_PADDING * 2));

      // Create a horizontal wall with a gap
      const gapPos = Math.floor(Math.random() * length);

      for (let j = 0; j < length; j++) {
        if (j !== gapPos) { // Leave a gap for passage
          map[row] = map[row].substring(0, startCol + j) + '#' + map[row].substring(startCol + j + 1);
        }
      }
    } else {
      const col = WALL_PADDING + Math.floor(Math.random() * (MAP_SIZE - WALL_PADDING * 2));
      const startRow = WALL_PADDING + Math.floor(Math.random() * (MAP_SIZE - length - WALL_PADDING * 2));

      // Create a vertical wall with a gap
      const gapPos = Math.floor(Math.random() * length);

      for (let j = 0; j < length; j++) {
        if (j !== gapPos) { // Leave a gap for passage
          map[startRow + j] = map[startRow + j].substring(0, col) + '#' + map[startRow + j].substring(col + 1);
        }
      }
    }
  }

  // Add some random walls
  for (let i = 0; i < wallCount - (numWallSegments * 5); i++) {
    const row = 1 + Math.floor(Math.random() * (MAP_SIZE - 2));
    const col = 1 + Math.floor(Math.random() * (MAP_SIZE - 2));
    if (map[row][col] !== '#') { // Don't overwrite existing walls
      map[row] = map[row].substring(0, col) + '#' + map[row].substring(col + 1);
    }
  }

  // Add some small rooms (2x2 or 3x3 empty spaces surrounded by walls)
  const numRooms = ROOM_COUNT_MIN + Math.floor(Math.random() * (ROOM_COUNT_MAX - ROOM_COUNT_MIN + 1));

  for (let i = 0; i < numRooms; i++) {
    const roomSize = ROOM_SIZE_MIN + Math.floor(Math.random() * (ROOM_SIZE_MAX - ROOM_SIZE_MIN + 1));
    const startRow = ROOM_PADDING + Math.floor(Math.random() * (MAP_SIZE - roomSize - ROOM_PADDING * 2));
    const startCol = ROOM_PADDING + Math.floor(Math.random() * (MAP_SIZE - roomSize - ROOM_PADDING * 2));

    // Create room walls
    for (let r = startRow - 1; r <= startRow + roomSize; r++) {
      for (let c = startCol - 1; c <= startCol + roomSize; c++) {
        if (r === startRow - 1 || r === startRow + roomSize ||
            c === startCol - 1 || c === startCol + roomSize) {
          map[r] = map[r].substring(0, c) + '#' + map[r].substring(c + 1);
        } else {
          // Ensure room interior is empty
          map[r] = map[r].substring(0, c) + '.' + map[r].substring(c + 1);
        }
      }
    }

    // Add a door (gap in the wall)
    const doorSide = Math.floor(Math.random() * 4); // 0=top, 1=right, 2=bottom, 3=left
    let doorRow = startRow - 1, doorCol = startCol - 1;

    switch (doorSide) {
      case 0: // top
        doorRow = startRow - 1;
        doorCol = startCol + Math.floor(Math.random() * roomSize);
        break;
      case 1: // right
        doorRow = startRow + Math.floor(Math.random() * roomSize);
        doorCol = startCol + roomSize;
        break;
      case 2: // bottom
        doorRow = startRow + roomSize;
        doorCol = startCol + Math.floor(Math.random() * roomSize);
        break;
      case 3: // left
        doorRow = startRow + Math.floor(Math.random() * roomSize);
        doorCol = startCol - 1;
        break;
    }

    map[doorRow] = map[doorRow].substring(0, doorCol) + '.' + map[doorRow].substring(doorCol + 1);
  }

  // Add player (ensure it's not on a wall)
  let playerPlaced = false;
  while (!playerPlaced) {
    const row = 1 + Math.floor(Math.random() * (MAP_SIZE - 2));
    const col = 1 + Math.floor(Math.random() * (MAP_SIZE - 2));
    if (map[row][col] === '.') {
      map[row] = map[row].substring(0, col) + 'P' + map[row].substring(col + 1);
      playerPlaced = true;
    }
  }

  // Add beasts (6-10 beasts for larger map - balanced for difficulty)
  const beastCount = BEAST_COUNT_MIN + Math.floor(Math.random() * (BEAST_COUNT_MAX - BEAST_COUNT_MIN + 1));
  let beastsPlaced = 0;

  while (beastsPlaced < beastCount) {
    const row = 1 + Math.floor(Math.random() * (MAP_SIZE - 2));
    const col = 1 + Math.floor(Math.random() * (MAP_SIZE - 2));
    if (map[row][col] === '.') {
      // Don't place beasts too close to the player (minimum distance of 12 cells)
      const playerPos = map.findIndex(line => line.includes('P'));
      const playerCol = map[playerPos].indexOf('P');

      const distance = Math.sqrt(Math.pow(row - playerPos, 2) + Math.pow(col - playerCol, 2));

      if (distance >= MIN_BEAST_PLAYER_DISTANCE) {
        map[row] = map[row].substring(0, col) + 'H' + map[row].substring(col + 1);
        beastsPlaced++;
      }
    }
  }

  // Add blocks (35-50 blocks for larger map - balanced for gameplay)
  // const blockCount = BLOCK_COUNT_MIN + Math.floor(Math.random() * (BLOCK_COUNT_MAX - BLOCK_COUNT_MIN + 1));
  const blockCount = Math.floor(innerCells * (BLOCK_DENSITY_MIN + Math.random() * (BLOCK_DENSITY_MAX - BLOCK_DENSITY_MIN)));

  let blocksPlaced = 0;

  // Place some blocks near the player for immediate gameplay
  const playerPos = map.findIndex(line => line.includes('P'));
  const playerCol = map[playerPos].indexOf('P');

  // Try to place 3-5 blocks within a reasonable distance from the player
  const nearPlayerBlockCount = NEAR_PLAYER_BLOCKS_MIN + Math.floor(Math.random() * (NEAR_PLAYER_BLOCKS_MAX - NEAR_PLAYER_BLOCKS_MIN + 1));
  let nearPlayerBlocksPlaced = 0;

  while (nearPlayerBlocksPlaced < nearPlayerBlockCount && blocksPlaced < blockCount) {
    // Place blocks at a distance of 3-8 cells from player
    const distance = NEAR_PLAYER_BLOCK_DISTANCE_MIN + Math.floor(Math.random() *
                    (NEAR_PLAYER_BLOCK_DISTANCE_MAX - NEAR_PLAYER_BLOCK_DISTANCE_MIN + 1));
    const angle = Math.random() * 2 * Math.PI; // Random angle

    const row = Math.floor(playerPos + Math.sin(angle) * distance);
    const col = Math.floor(playerCol + Math.cos(angle) * distance);

    // Ensure coordinates are valid
    if (row > 0 && row < MAP_SIZE - 1 && col > 0 && col < MAP_SIZE - 1) {
      if (map[row][col] === '.') {
        map[row] = map[row].substring(0, col) + 'B' + map[row].substring(col + 1);
        blocksPlaced++;
        nearPlayerBlocksPlaced++;
      }
    }
  }

  // Place the rest of the blocks randomly
  while (blocksPlaced < blockCount) {
    const row = 1 + Math.floor(Math.random() * (MAP_SIZE - 2));
    const col = 1 + Math.floor(Math.random() * (MAP_SIZE - 2));
    if (map[row][col] === '.') {
      map[row] = map[row].substring(0, col) + 'B' + map[row].substring(col + 1);
      blocksPlaced++;
    }
  }

  return map;
}

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

export default function Game() {
  // Generate map on client-side only
  const [levelMap, setLevelMap] = useState<string[]>([]);
  const [rows, setRows] = useState(MAP_SIZE);
  const [cols, setCols] = useState(MAP_SIZE);

  // Initialize the game on client-side only
  useEffect(() => {
    const newMap = generateRandomMap();
    setLevelMap(newMap);
    setRows(newMap.length);
    setCols(newMap[0].length);
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
    }
  }, [levelData, p0, b0, bl0]);

  /* helpers */
  const beastIdx = (r:number,c:number) => beasts.findIndex(b => b.row===r && b.col===c);
  const blockIdx = (r:number,c:number) => blocks.findIndex(b => b.row===r && b.col===c);
  const hasBlock = (r:number,c:number) => blockIdx(r,c) !== -1;

  /* restart */
  const reset = () => {
    const newMap = generateRandomMap();
    setLevelMap(newMap);
    setRows(newMap.length);
    setCols(newMap[0].length);

    const { player, beasts, blocks } = parseLevel(newMap);
    setPlayer(player);
    setBeasts(beasts);
    setBlocks(blocks);
    setOver(false);
    setWon(false);
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
      if (e.key === 'r' || e.key === 'R') { e.preventDefault(); reset(); return; }
      const dir = dirMap[e.key];
      if (!dir || gameOver || gameWon) return;
      e.preventDefault();
      movePlayer(dir);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [player, blocks, beasts, gameOver, gameWon]);

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
    <div className="board" style={{ gridTemplateColumns: `repeat(${cols}, 16px)`, gridTemplateRows: `repeat(${rows}, 16px)` }}>
      {cellsJSX}
      {gameOver && <div className="status" style={{ gridColumn: '1 / -1', gridRow: rows + 1 }}>Game Over — press R to restart</div>}
      {gameWon && <div className="status" style={{ gridColumn: '1 / -1', gridRow: rows + 1 }}>You win! — press R to play again</div>}
    </div>
  );
}
