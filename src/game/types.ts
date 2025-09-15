export type Cell = {
  colorId: number; // 0..6 for 7 tetromino types
};

export type Board = (Cell | null)[][]; // [y][x]

export type Rotation = 0 | 1 | 2 | 3; // 0=spawn,1=R,2=2,3=L

export type PieceKind = 'I' | 'J' | 'L' | 'O' | 'S' | 'T' | 'Z';

export interface Piece {
  kind: PieceKind;
  rotation: Rotation;
  x: number; // top-left origin of piece's block map in board coords
  y: number;
}

export interface ActivePiece extends Piece {}

export interface GameState {
  board: Board;
  active: ActivePiece | null;
  hold: PieceKind | null;
  holdUsed: boolean; // can hold only once per drop
  nextQueue: PieceKind[]; // upcoming pieces
  score: number;
  level: number;
  lines: number;
  tickMs: number; // current tick duration in ms
  paused: boolean;
  rngSeed: string;
  rngState: number; // internal PRNG state for determinism
  accumulatorMs: number; // fixed-step accumulator
}

export interface InputActions {
  move: (dx: -1 | 1) => void;
  rotate: (dir: -1 | 1) => void; // -1=CCW, +1=CW
  softDropStart: () => void;
  softDropStop: () => void;
  hardDrop: () => void;
  hold: () => void;
}

export type Vec2 = { x: number; y: number };

