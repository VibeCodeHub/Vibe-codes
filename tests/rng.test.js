import { describe, it, expect } from 'vitest';
import { SevenBagRNG } from '../src/game/rng';
describe('SevenBagRNG', () => {
    it('produces deterministic sequence for same seed', () => {
        const a = new SevenBagRNG('abc');
        const b = new SevenBagRNG('abc');
        const seqA = Array.from({ length: 28 }, () => a.next());
        const seqB = Array.from({ length: 28 }, () => b.next());
        expect(seqA).toEqual(seqB);
    });
    it('generates all 7 unique pieces in each bag', () => {
        const rng = new SevenBagRNG('bag');
        const bag = new Set();
        for (let i = 0; i < 7; i++)
            bag.add(rng.next());
        expect(bag.size).toBe(7);
    });
    it('bags are shuffled (not identical across multiple bags usually)', () => {
        const rng = new SevenBagRNG('bag2');
        const b1 = Array.from({ length: 7 }, () => rng.next()).join('');
        const b2 = Array.from({ length: 7 }, () => rng.next()).join('');
        expect(b1).not.toEqual(b2);
    });
});
