// Super Rotation System (SRS) kick tables
// Origin and reference: Tetris Guideline SRS (see community docs and Tetris Wiki)
// @Web: https://tetris.wiki/Super_Rotation_System

import type { PieceKind, Rotation } from './types';

export type Kick = { x: number; y: number };

// For I piece, SRS uses a distinct kick table
const I_KICKS: Record<`${Rotation}-${Rotation}`, Kick[]> = {
  '0-1': [{ x: 0, y: 0 }, { x: -2, y: 0 }, { x: +1, y: 0 }, { x: -2, y: -1 }, { x: +1, y: +2 }],
  '1-0': [{ x: 0, y: 0 }, { x: +2, y: 0 }, { x: -1, y: 0 }, { x: +2, y: +1 }, { x: -1, y: -2 }],
  '1-2': [{ x: 0, y: 0 }, { x: -1, y: 0 }, { x: +2, y: 0 }, { x: -1, y: +2 }, { x: +2, y: -1 }],
  '2-1': [{ x: 0, y: 0 }, { x: +1, y: 0 }, { x: -2, y: 0 }, { x: +1, y: -2 }, { x: -2, y: +1 }],
  '2-3': [{ x: 0, y: 0 }, { x: +2, y: 0 }, { x: -1, y: 0 }, { x: +2, y: +1 }, { x: -1, y: -2 }],
  '3-2': [{ x: 0, y: 0 }, { x: -2, y: 0 }, { x: +1, y: 0 }, { x: -2, y: -1 }, { x: +1, y: +2 }],
  '3-0': [{ x: 0, y: 0 }, { x: +1, y: 0 }, { x: -2, y: 0 }, { x: +1, y: -2 }, { x: -2, y: +1 }],
  '0-3': [{ x: 0, y: 0 }, { x: -1, y: 0 }, { x: +2, y: 0 }, { x: -1, y: +2 }, { x: +2, y: -1 }],
};

// For J, L, S, T, Z pieces
const JLSTZ_KICKS: Record<`${Rotation}-${Rotation}`, Kick[]> = {
  '0-1': [
    { x: 0, y: 0 },
    { x: -1, y: 0 },
    { x: -1, y: +1 },
    { x: 0, y: -2 },
    { x: -1, y: -2 },
    // Additional permissive try to accommodate our local pivot
    { x: +1, y: 0 },
  ],
  '1-0': [{ x: 0, y: 0 }, { x: +1, y: 0 }, { x: +1, y: -1 }, { x: 0, y: +2 }, { x: +1, y: +2 }],
  '1-2': [{ x: 0, y: 0 }, { x: +1, y: 0 }, { x: +1, y: -1 }, { x: 0, y: +2 }, { x: +1, y: +2 }],
  '2-1': [{ x: 0, y: 0 }, { x: -1, y: 0 }, { x: -1, y: +1 }, { x: 0, y: -2 }, { x: -1, y: -2 }],
  '2-3': [{ x: 0, y: 0 }, { x: +1, y: 0 }, { x: +1, y: +1 }, { x: 0, y: -2 }, { x: +1, y: -2 }],
  '3-2': [{ x: 0, y: 0 }, { x: -1, y: 0 }, { x: -1, y: -1 }, { x: 0, y: +2 }, { x: -1, y: +2 }],
  '3-0': [{ x: 0, y: 0 }, { x: -1, y: 0 }, { x: -1, y: -1 }, { x: 0, y: +2 }, { x: -1, y: +2 }],
  '0-3': [{ x: 0, y: 0 }, { x: +1, y: 0 }, { x: +1, y: +1 }, { x: 0, y: -2 }, { x: +1, y: -2 }],
};

export function getKicks(kind: PieceKind, from: Rotation, to: Rotation): Kick[] {
  if (kind === 'O') return [{ x: 0, y: 0 }]; // O has no kicks in SRS
  const key = `${from}-${to}` as const;
  return kind === 'I' ? I_KICKS[key] : JLSTZ_KICKS[key];
}

// Piece block definitions in 4x4 bounding boxes (rotation states 0..3)
// Coordinates represent local block offsets for each rotation.
export type Shape = { [R in Rotation]: { x: number; y: number }[] };

export const SHAPES: Record<PieceKind, Shape> = {
  I: {
    0: [{ x: -1, y: 0 }, { x: 0, y: 0 }, { x: 1, y: 0 }, { x: 2, y: 0 }],
    1: [{ x: 1, y: -1 }, { x: 1, y: 0 }, { x: 1, y: 1 }, { x: 1, y: 2 }],
    2: [{ x: -1, y: 1 }, { x: 0, y: 1 }, { x: 1, y: 1 }, { x: 2, y: 1 }],
    3: [{ x: 0, y: -1 }, { x: 0, y: 0 }, { x: 0, y: 1 }, { x: 0, y: 2 }],
  },
  J: {
    0: [{ x: -1, y: 0 }, { x: -1, y: 1 }, { x: 0, y: 1 }, { x: 1, y: 1 }],
    1: [{ x: 0, y: -1 }, { x: 0, y: 0 }, { x: 0, y: 1 }, { x: 1, y: -1 }],
    2: [{ x: -1, y: 0 }, { x: 0, y: 0 }, { x: 1, y: 0 }, { x: 1, y: 1 }],
    3: [{ x: -1, y: 1 }, { x: 0, y: -1 }, { x: 0, y: 0 }, { x: 0, y: 1 }],
  },
  L: {
    0: [{ x: 1, y: 0 }, { x: -1, y: 1 }, { x: 0, y: 1 }, { x: 1, y: 1 }],
    1: [{ x: 0, y: -1 }, { x: 0, y: 0 }, { x: 0, y: 1 }, { x: 1, y: 1 }],
    2: [{ x: -1, y: 0 }, { x: 0, y: 0 }, { x: 1, y: 0 }, { x: -1, y: 1 }],
    3: [{ x: -1, y: -1 }, { x: 0, y: -1 }, { x: 0, y: 0 }, { x: 0, y: 1 }],
  },
  O: {
    0: [{ x: 0, y: 0 }, { x: 1, y: 0 }, { x: 0, y: 1 }, { x: 1, y: 1 }],
    1: [{ x: 0, y: 0 }, { x: 1, y: 0 }, { x: 0, y: 1 }, { x: 1, y: 1 }],
    2: [{ x: 0, y: 0 }, { x: 1, y: 0 }, { x: 0, y: 1 }, { x: 1, y: 1 }],
    3: [{ x: 0, y: 0 }, { x: 1, y: 0 }, { x: 0, y: 1 }, { x: 1, y: 1 }],
  },
  S: {
    0: [{ x: 0, y: 0 }, { x: 1, y: 0 }, { x: -1, y: 1 }, { x: 0, y: 1 }],
    1: [{ x: 0, y: -1 }, { x: 0, y: 0 }, { x: 1, y: 0 }, { x: 1, y: 1 }],
    2: [{ x: 0, y: 0 }, { x: 1, y: 0 }, { x: -1, y: 1 }, { x: 0, y: 1 }],
    3: [{ x: -1, y: -1 }, { x: -1, y: 0 }, { x: 0, y: 0 }, { x: 0, y: 1 }],
  },
  T: {
    0: [{ x: 0, y: 0 }, { x: -1, y: 1 }, { x: 0, y: 1 }, { x: 1, y: 1 }],
    1: [{ x: 0, y: -1 }, { x: 0, y: 0 }, { x: 0, y: 1 }, { x: 1, y: 0 }],
    2: [{ x: -1, y: 0 }, { x: 0, y: 0 }, { x: 1, y: 0 }, { x: 0, y: 1 }],
    3: [{ x: -1, y: 0 }, { x: 0, y: -1 }, { x: 0, y: 0 }, { x: 0, y: 1 }],
  },
  Z: {
    0: [{ x: -1, y: 0 }, { x: 0, y: 0 }, { x: 0, y: 1 }, { x: 1, y: 1 }],
    1: [{ x: 1, y: -1 }, { x: 1, y: 0 }, { x: 0, y: 0 }, { x: 0, y: 1 }],
    2: [{ x: -1, y: 0 }, { x: 0, y: 0 }, { x: 0, y: 1 }, { x: 1, y: 1 }],
    3: [{ x: 0, y: -1 }, { x: 0, y: 0 }, { x: -1, y: 0 }, { x: -1, y: 1 }],
  },
};

export function nextRotation(current: Rotation, dir: -1 | 1): Rotation {
  return (((current + (dir === 1 ? 1 : -1)) % 4) + 4) % 4 as Rotation;
}

