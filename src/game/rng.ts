// Seeded PRNG and 7-bag generator.
// Deterministic across seeds. No external deps.

import type { PieceKind } from './types';

// Mulberry32 PRNG: small, fast, good enough for gameplay determinism.
// https://stackoverflow.com/a/47593316
export function mulberry32(seed: number): () => number {
  let t = seed >>> 0;
  return () => {
    t += 0x6D2B79F5;
    let r = Math.imul(t ^ (t >>> 15), 1 | t);
    r ^= r + Math.imul(r ^ (r >>> 7), 61 | r);
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
  };
}

export function hashSeed(seed: string): number {
  // xfnv1a hash for string -> 32-bit int
  // https://stackoverflow.com/a/52171480
  let h = 2166136261 >>> 0;
  for (let i = 0; i < seed.length; i++) {
    h ^= seed.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

const ALL_PIECES: PieceKind[] = ['I', 'J', 'L', 'O', 'S', 'T', 'Z'];

export class SevenBagRNG {
  private rand: () => number;
  private bag: PieceKind[] = [];

  constructor(seed: string) {
    this.rand = mulberry32(hashSeed(seed));
    this.refill();
  }

  setSeed(seed: string): void {
    this.rand = mulberry32(hashSeed(seed));
    this.bag = [];
    this.refill();
  }

  next(): PieceKind {
    if (this.bag.length === 0) this.refill();
    return this.bag.pop() as PieceKind;
  }

  private refill(): void {
    const bag = [...ALL_PIECES];
    // Fisher–Yates shuffle
    for (let i = bag.length - 1; i > 0; i--) {
      const j = Math.floor(this.rand() * (i + 1));
      const tmp = bag[i];
      bag[i] = bag[j];
      bag[j] = tmp;
    }
    // Use as stack for cheap pop
    this.bag = bag;
  }
}

