import { GRID_W, GRID_H, LINE_CLEAR_SCORES, SOFT_DROP_POINT_PER_CELL, HARD_DROP_POINT_PER_CELL, LINES_PER_LEVEL, levelToTickMs } from './constants';
import type { ActivePiece, Board, GameState, PieceKind, Rotation, Vec2 } from './types';
import { SevenBagRNG } from './rng';
import { SHAPES, getKicks, nextRotation } from './srs';

// Utilities
export function createEmptyBoard(): Board {
  return Array.from({ length: GRID_H }, () => Array.from({ length: GRID_W }, () => null));
}

export function cloneBoard(board: Board): Board {
  return board.map(row => row.slice());
}

export function pieceCells(kind: PieceKind, rotation: Rotation, origin: Vec2): Vec2[] {
  const shape = SHAPES[kind][rotation];
  return shape.map(p => ({ x: origin.x + p.x, y: origin.y + p.y }));
}

export function isInside(x: number, y: number): boolean {
  return x >= 0 && x < GRID_W && y >= 0 && y < GRID_H;
}

export function collides(board: Board, kind: PieceKind, rotation: Rotation, origin: Vec2): boolean {
  const cells = pieceCells(kind, rotation, origin);
  for (const c of cells) {
    if (!isInside(c.x, c.y)) return true;
    if (board[c.y][c.x]) return true;
  }
  return false;
}

export function lockPiece(board: Board, piece: ActivePiece): Board {
  const next = cloneBoard(board);
  const cells = pieceCells(piece.kind, piece.rotation, { x: piece.x, y: piece.y });
  const colorId = kindToColorId(piece.kind);
  for (const c of cells) {
    if (isInside(c.x, c.y)) next[c.y][c.x] = { colorId };
  }
  return next;
}

export function clearLines(board: Board): { board: Board; cleared: number } {
  const remaining: Board = [];
  let cleared = 0;
  for (let y = 0; y < GRID_H; y++) {
    const full = board[y].every(cell => cell !== null);
    if (full) cleared++; else remaining.push(board[y]);
  }
  while (remaining.length < GRID_H) {
    remaining.unshift(Array.from({ length: GRID_W }, () => null));
  }
  return { board: remaining, cleared };
}

export function scoringForLines(lines: number, level: number): number {
  const base = LINE_CLEAR_SCORES[lines] ?? 0;
  return base * (level + 1);
}

export function kindToColorId(kind: PieceKind): number {
  switch (kind) {
    case 'I': return 0;
    case 'J': return 1;
    case 'L': return 2;
    case 'O': return 3;
    case 'S': return 4;
    case 'T': return 5;
    case 'Z': return 6;
  }
}

export function spawnPosition(kind: PieceKind): { x: number; y: number; rotation: Rotation } {
  // Spawn near top; y=0 aligns shapes assuming they include bottom row
  return { x: Math.floor(GRID_W / 2) - 1, y: 0, rotation: 0 };
}

export function tryRotate(board: Board, piece: ActivePiece, dir: -1 | 1): ActivePiece | null {
  const toRot = nextRotation(piece.rotation, dir);
  const kicks = getKicks(piece.kind, piece.rotation, toRot);
  for (const k of kicks) {
    const nx = piece.x + k.x;
    const ny = piece.y + k.y;
    if (!collides(board, piece.kind, toRot, { x: nx, y: ny })) {
      return { ...piece, rotation: toRot, x: nx, y: ny };
    }
  }
  return null;
}

export function tryMove(board: Board, piece: ActivePiece, dx: number, dy: number): ActivePiece | null {
  const nx = piece.x + dx;
  const ny = piece.y + dy;
  return collides(board, piece.kind, piece.rotation, { x: nx, y: ny }) ? null : { ...piece, x: nx, y: ny };
}

// Game loop core
export function initGame(seed: string): GameState {
  const rng = new SevenBagRNG(seed);
  const board = createEmptyBoard();
  const nextQueue = [rng.next(), rng.next(), rng.next(), rng.next(), rng.next()];
  const first = rng.next();
  const spawn = spawnPosition(first);
  const active: ActivePiece = { kind: first, rotation: spawn.rotation, x: spawn.x, y: spawn.y };
  const state: GameState = {
    board,
    active,
    hold: null,
    holdUsed: false,
    nextQueue,
    score: 0,
    level: 0,
    lines: 0,
    tickMs: levelToTickMs(0),
    paused: false,
    rngSeed: seed,
    rngState: 0,
    accumulatorMs: 0,
  };
  return state;
}

export function stepGravity(state: GameState, rng: SevenBagRNG): GameState {
  if (!state.active) return state;
  const moved = tryMove(state.board, state.active, 0, 1);
  if (moved) {
    return { ...state, active: moved };
  }
  // Lock
  let board = lockPiece(state.board, state.active);
  const { board: after, cleared } = clearLines(board);
  board = after;
  let score = state.score;
  let lines = state.lines;
  let level = state.level;
  if (cleared > 0) {
    score += scoringForLines(cleared, level);
    lines += cleared;
    const newLevel = Math.floor(lines / LINES_PER_LEVEL);
    if (newLevel !== level) {
      level = newLevel;
    }
  }
  // Spawn next
  const nextKind = state.nextQueue.length > 0 ? state.nextQueue[0] : rng.next();
  const nextQueue = state.nextQueue.length > 0 ? state.nextQueue.slice(1).concat(rng.next()) : [rng.next(), rng.next(), rng.next(), rng.next(), rng.next()];
  const spawn = spawnPosition(nextKind);
  const newActive: ActivePiece = { kind: nextKind, rotation: spawn.rotation, x: spawn.x, y: spawn.y };
  // Game over check: if collides on spawn, treat as paused (could add gameOver flag later)
  if (collides(board, newActive.kind, newActive.rotation, { x: newActive.x, y: newActive.y })) {
    return { ...state, board, active: null, nextQueue, score, lines, level, tickMs: levelToTickMs(level) };
  }
  return { ...state, board, active: newActive, holdUsed: false, nextQueue, score, lines, level, tickMs: levelToTickMs(level) };
}

export function applyMove(state: GameState, dx: -1 | 1): GameState {
  if (!state.active) return state;
  const moved = tryMove(state.board, state.active, dx, 0);
  return moved ? { ...state, active: moved } : state;
}

export function applyRotate(state: GameState, dir: -1 | 1): GameState {
  if (!state.active) return state;
  const rotated = tryRotate(state.board, state.active, dir);
  return rotated ? { ...state, active: rotated } : state;
}

export function applySoftDrop(state: GameState): { state: GameState; points: number } {
  if (!state.active) return { state, points: 0 };
  const moved = tryMove(state.board, state.active, 0, 1);
  if (moved) {
    return { state: { ...state, active: moved }, points: SOFT_DROP_POINT_PER_CELL };
  }
  return { state, points: 0 };
}

export function applyHardDrop(state: GameState): { state: GameState; points: number } {
  if (!state.active) return { state, points: 0 };
  let piece = state.active;
  let cells = 0;
  while (true) {
    const moved = tryMove(state.board, piece, 0, 1);
    if (!moved) break;
    piece = moved;
    cells++;
  }
  // Lock
  let board = lockPiece(state.board, piece);
  const { board: after, cleared } = clearLines(board);
  board = after;
  let score = state.score + cells * HARD_DROP_POINT_PER_CELL;
  let lines = state.lines;
  let level = state.level;
  if (cleared > 0) {
    score += scoringForLines(cleared, level);
    lines += cleared;
    const newLevel = Math.floor(lines / LINES_PER_LEVEL);
    if (newLevel !== level) level = newLevel;
  }
  // Spawn next placeholder (actual next decided by caller with RNG)
  return { state: { ...state, board, active: null, score, lines, level, tickMs: levelToTickMs(level) }, points: cells * HARD_DROP_POINT_PER_CELL };
}

