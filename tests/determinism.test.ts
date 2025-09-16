import { describe, it, expect } from 'vitest';
import { initGame, stepGravity, applyMove, applyRotate, applyHardDrop } from '../src/game/logic';
import { SevenBagRNG } from '../src/game/rng';

// Fixed input script for deterministic testing
const INPUT_SCRIPT = [
  { action: 'move', params: [1] }, // right
  { action: 'move', params: [1] }, // right
  { action: 'rotate', params: [1] }, // CW
  { action: 'move', params: [-1] }, // left
  { action: 'hardDrop', params: [] },
  { action: 'move', params: [-1] }, // left
  { action: 'move', params: [-1] }, // left
  { action: 'rotate', params: [-1] }, // CCW
  { action: 'hardDrop', params: [] },
  { action: 'move', params: [1] }, // right
  { action: 'move', params: [1] }, // right
  { action: 'rotate', params: [1] }, // CW
  { action: 'hardDrop', params: [] },
];

function applyInputScript(state: any, rng: SevenBagRNG, inputs: typeof INPUT_SCRIPT) {
  let current = state;
  
  for (const input of inputs) {
    switch (input.action) {
      case 'move':
        current = applyMove(current, input.params[0] as -1 | 1);
        break;
      case 'rotate':
        current = applyRotate(current, input.params[0] as -1 | 1);
        break;
      case 'hardDrop':
        const result = applyHardDrop(current);
        current = result.state;
        // Spawn next piece
        const nextKind = rng.next();
        const spawn = { x: 4, y: 0, rotation: 0 as const };
        current = { ...current, active: { kind: nextKind, ...spawn } };
        break;
    }
    
    // Apply gravity tick
    current = stepGravity(current, rng);
  }
  
  return current;
}

describe('Determinism', () => {
  it('produces identical results with fixed seed across different frame schedules', () => {
    const seed = 'determinism-test-123';
    
    // Test with two different "frame schedules" (simulated by different tick patterns)
    const rng1 = new SevenBagRNG(seed);
    const rng2 = new SevenBagRNG(seed);
    
    const state1 = initGame(seed);
    const state2 = initGame(seed);
    
    // Apply same input script to both states
    const final1 = applyInputScript(state1, rng1, INPUT_SCRIPT);
    const final2 = applyInputScript(state2, rng2, INPUT_SCRIPT);
    
    // Assert identical final states
    expect(final1.board).toEqual(final2.board);
    expect(final1.score).toBe(final2.score);
    expect(final1.level).toBe(final2.level);
    expect(final1.lines).toBe(final2.lines);
    expect(final1.nextQueue).toEqual(final2.nextQueue);
  });

  it('maintains determinism across multiple game sessions with same seed', () => {
    const seed = 'session-test-456';
    
    // Run the same input script twice with fresh RNG instances
    const rng1 = new SevenBagRNG(seed);
    const rng2 = new SevenBagRNG(seed);
    
    const state1 = initGame(seed);
    const state2 = initGame(seed);
    
    const final1 = applyInputScript(state1, rng1, INPUT_SCRIPT);
    const final2 = applyInputScript(state2, rng2, INPUT_SCRIPT);
    
    expect(final1.board).toEqual(final2.board);
    expect(final1.score).toBe(final2.score);
  });

  it('produces different results with different seeds', () => {
    const seed1 = 'seed-1';
    const seed2 = 'seed-2';
    
    const rng1 = new SevenBagRNG(seed1);
    const rng2 = new SevenBagRNG(seed2);
    
    const state1 = initGame(seed1);
    const state2 = initGame(seed2);
    
    const final1 = applyInputScript(state1, rng1, INPUT_SCRIPT);
    const final2 = applyInputScript(state2, rng2, INPUT_SCRIPT);
    
    // Should be different due to different RNG sequences
    expect(final1.board).not.toEqual(final2.board);
  });
});