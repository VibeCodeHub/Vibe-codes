// Core gameplay constants for a classic 10x20 field
// Keep logic headless; renderer imports are not allowed here.

export const GRID_W = 10;
export const GRID_H = 20;

// Ticks per second for gravity baseline. Gameplay tick can scale with level.
export const GRAVITY_TPS_BASE = 20; // 20 ticks/sec == 50ms per tick
export const TICK_MS_BASE = Math.floor(1000 / GRAVITY_TPS_BASE);

// Lock delay in ms: simplified immediate lock on grounded at tick end.
// We retain a small allowance for potential future finesse; currently unused.
export const LOCK_DELAY_MS = 0;

// Scoring (classic-inspired). Lines are numbers cleared at once.
export const LINE_CLEAR_SCORES: Record<number, number> = {
  1: 100,
  2: 300,
  3: 500,
  4: 800, // Glass Blocks (4-line clear)
};

// Soft/hard drop points per cell moved.
export const SOFT_DROP_POINT_PER_CELL = 1;
export const HARD_DROP_POINT_PER_CELL = 2;

// Level advances every N lines.
export const LINES_PER_LEVEL = 10;

// Level to gravity curve (approx). Higher level -> faster ticks.
export function levelToTickMs(level: number): number {
  // Simple curve: base / (1 + 0.15 * level), clamped
  const multiplier = 1 + 0.15 * Math.max(0, level);
  const ms = TICK_MS_BASE / multiplier;
  return Math.max(16, Math.floor(ms));
}

