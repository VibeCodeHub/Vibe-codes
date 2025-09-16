import { describe, it, expect } from 'vitest';
import { createEmptyBoard, collides, tryRotate, clearLines, scoringForLines, initGame, stepGravity, applyHardDrop } from '../src/game/logic';
import { GRID_W } from '../src/game/constants';
import { SevenBagRNG } from '../src/game/rng';
function makePiece(kind, x, y, rotation = 0) {
    return { kind, x, y, rotation };
}
describe('Logic - collisions and SRS', () => {
    it('detects wall collisions', () => {
        const board = createEmptyBoard();
        const p = makePiece('L', -1, 0, 0);
        expect(collides(board, p.kind, p.rotation, { x: p.x, y: p.y })).toBe(true);
    });
    it('applies SRS kicks near wall to rotate', () => {
        const board = createEmptyBoard();
        // J piece at (1, 0) should be able to rotate with SRS kicks
        const nearLeft = makePiece('J', 1, 0, 0);
        const rotated = tryRotate(board, nearLeft, 1);
        expect(rotated).not.toBeNull();
    });
});
describe('Line clear and scoring', () => {
    it('clears 1..4 lines and awards scores', () => {
        for (let lines = 1; lines <= 4; lines++) {
            const board = createEmptyBoard();
            for (let y = 0; y < lines; y++) {
                for (let x = 0; x < GRID_W; x++)
                    board[19 - y][x] = { colorId: 0 };
            }
            const { board: after, cleared } = clearLines(board);
            expect(cleared).toBe(lines);
            expect(after[19][0]).toBeNull();
            const s = scoringForLines(lines, 0);
            expect(s).toBeGreaterThan(0);
        }
    });
});
describe('Deterministic progression', () => {
    it('same seed leads to identical first locks', () => {
        const a = initGame('seed1');
        const b = initGame('seed1');
        const rngA = new SevenBagRNG('seed1');
        const rngB = new SevenBagRNG('seed1');
        let sa = a, sb = b;
        // Step until first piece locks (20 steps should be enough on empty field)
        for (let i = 0; i < 25; i++) {
            sa = stepGravity(sa, rngA);
            sb = stepGravity(sb, rngB);
        }
        expect(sa.board).toEqual(sb.board);
    });
    it('hard drop awards points deterministically', () => {
        let s = initGame('seed3');
        const beforeScore = s.score;
        const res = applyHardDrop(s);
        expect(res.points).toBeGreaterThan(0);
        expect(res.state.score).toBe(beforeScore + res.points);
    });
});
