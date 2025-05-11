'use client'
import { useState, useEffect, useMemo } from 'react';

interface Coord { row: number; col: number; }

const BEAST_MS = 500;                   // beast step cadence
const levelMap = [
  '############',
  '#..H......H#',
  '#..B...BB..#',
  '#..PB..#...#',
  '#..........#',
  '############',
];

const rows = levelMap.length;
const cols = levelMap[0].length;
const key = (r: number, c: number) => `${r},${c}`;

// ────────────── static level parsing ──────────────
function parseLevel() {
  let player: Coord = { row: 0, col: 0 };
  const beasts: Coord[] = [];
  const blocks: Coord[] = [];
  const walls = new Set<string>();

  levelMap.forEach((line, r) => {
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
  /* initial state (fresh copy each time) */
  const { player: p0, beasts: b0, blocks: bl0, walls } = useMemo(parseLevel, []);
  const [player, setPlayer]   = useState<Coord>(p0);
  const [beasts, setBeasts]   = useState<Coord[]>(b0);
  const [blocks, setBlocks]   = useState<Coord[]>(bl0);
  const [gameOver, setOver]   = useState(false);
  const [gameWon,  setWon]    = useState(false);

  /* helpers */
  const beastIdx = (r:number,c:number) => beasts.findIndex(b => b.row===r && b.col===c);
  const blockIdx = (r:number,c:number) => blocks.findIndex(b => b.row===r && b.col===c);
  const hasBlock = (r:number,c:number) => blockIdx(r,c) !== -1;

  /* restart */
  const reset = () => {
    const { player, beasts, blocks } = parseLevel();
    setPlayer(player); setBeasts(beasts); setBlocks(blocks);
    setOver(false); setWon(false);
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

        // Decide whether to move randomly (1/3 chance) or toward player
        const moveRandomly = Math.random() < 1/3;

        if (moveRandomly && possibleMoves.length > 0) {
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
  const rowsJSX = [];
  for (let r = 0; r < rows; r++) {
    const cells = [];
    for (let c = 0; c < cols; c++) {
      let ch = '\u00A0', cls='empty';
      if (player.row===r && player.col===c) { ch='▲'; cls='player'; }
      else if (beastIdx(r,c)!==-1)          { ch='H'; cls='beast';  }
      else if (hasBlock(r,c))               { ch='█'; cls='block';  }
      else if (walls.has(key(r,c)))         { ch='█'; cls='wall';   }
      cells.push(<span key={c} className={cls}>{ch}</span>);
    }
    rowsJSX.push(<div key={r} className="row">{cells}</div>);
  }

  return (
    <div className="board">
      {rowsJSX}
      {gameOver && <div className="status">Game Over — press R to restart</div>}
      {gameWon  && <div className="status">You win! — press R to play again</div>}
    </div>
  );
}
