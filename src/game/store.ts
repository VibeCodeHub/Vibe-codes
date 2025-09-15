import create from 'zustand';
import { GRID_W, GRID_H, levelToTickMs, TICK_MS_BASE } from './constants';
import type { GameState } from './types';
import { SevenBagRNG } from './rng';
import { applyHardDrop, applyMove, applyRotate, applySoftDrop, createEmptyBoard, spawnPosition, stepGravity } from './logic';

type Store = GameState & {
  start: (seed?: string) => void;
  tick: (dtMs: number) => void;
  move: (dx: -1 | 1) => void;
  rotate: (dir: -1 | 1) => void;
  softDrop: (active: boolean) => void;
  hardDrop: () => void;
  hold: () => void;
  pause: () => void;
  resume: () => void;
  restart: () => void;
};

const DEFAULT_SEED = 'seed';

export const useGameStore = create<Store>((set, get) => {
  let rng = new SevenBagRNG(DEFAULT_SEED);
  let softDropping = false;
  let userPaused = false;

  function spawnNext(): void {
    const state = get();
    const nextKind = state.nextQueue[0] ?? rng.next();
    const nextQueue = state.nextQueue.length > 0 ? state.nextQueue.slice(1).concat(rng.next()) : [rng.next(), rng.next(), rng.next(), rng.next(), rng.next()];
    const spawn = spawnPosition(nextKind);
    set({ active: { kind: nextKind, rotation: spawn.rotation, x: spawn.x, y: spawn.y }, nextQueue, holdUsed: false });
  }

  function start(seed?: string): void {
    rng = new SevenBagRNG(seed ?? DEFAULT_SEED);
    const board = createEmptyBoard();
    const nextQueue = [rng.next(), rng.next(), rng.next(), rng.next(), rng.next()];
    const kind = rng.next();
    const spawn = spawnPosition(kind);
    set({
      board,
      active: { kind, rotation: spawn.rotation, x: spawn.x, y: spawn.y },
      hold: null,
      holdUsed: false,
      nextQueue,
      score: 0,
      level: 0,
      lines: 0,
      tickMs: levelToTickMs(0),
      paused: false,
      rngSeed: seed ?? DEFAULT_SEED,
      rngState: 0,
      accumulatorMs: 0,
    });
  }

  function tick(dtMs: number): void {
    const state = get();
    if (state.paused) return;
    let acc = state.accumulatorMs + dtMs;
    let current = state;
    const tickMs = state.tickMs;
    while (acc >= tickMs) {
      acc -= tickMs;
      // soft drop attempts
      if (softDropping) {
        const res = applySoftDrop(current);
        current = { ...res.state, score: current.score + res.points };
      } else {
        current = stepGravity(current, rng);
        if (!current.active) {
          // spawn next after lock
          set(current);
          spawnNext();
          current = get();
        }
      }
    }
    set({ ...current, accumulatorMs: acc });
  }

  function move(dx: -1 | 1): void {
    set(applyMove(get(), dx));
  }

  function rotate(dir: -1 | 1): void {
    set(applyRotate(get(), dir));
  }

  function softDrop(active: boolean): void {
    softDropping = active;
  }

  function hardDrop(): void {
    const before = get();
    const res = applyHardDrop(before);
    set({ ...res.state, score: res.state.score + res.points });
    spawnNext();
  }

  function hold(): void {
    const state = get();
    if (!state.active || state.holdUsed) return;
    const currentKind = state.active.kind;
    if (state.hold) {
      const spawn = spawnPosition(state.hold);
      set({ active: { kind: state.hold, rotation: spawn.rotation, x: spawn.x, y: spawn.y }, hold: currentKind, holdUsed: true });
    } else {
      set({ hold: currentKind, holdUsed: true });
      spawnNext();
    }
  }

  function pause(): void {
    userPaused = true;
    set({ paused: true });
  }

  function resume(): void {
    if (!userPaused) set({ paused: false });
  }

  function restart(): void {
    userPaused = false;
    start(get().rngSeed);
  }

  // Pause on window blur; do not auto-resume if user paused manually
  if (typeof window !== 'undefined') {
    window.addEventListener('blur', () => set({ paused: true }));
    window.addEventListener('focus', () => {
      if (!userPaused) set({ paused: false });
    });
  }

  // Initialize default state
  start(DEFAULT_SEED);

  return {
    ...get(),
    start,
    tick,
    move,
    rotate,
    softDrop,
    hardDrop,
    hold,
    pause,
    resume,
    restart,
  };
});

