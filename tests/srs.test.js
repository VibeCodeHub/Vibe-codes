import { describe, it, expect } from 'vitest';
import { getKicks, SHAPES } from '../src/game/srs';
import { collides } from '../src/game/logic';
import { createEmptyBoard } from '../src/game/logic';
// Canonical SRS kick tables from Tetris Guideline
// Reference: https://tetris.wiki/Super_Rotation_System
const CANONICAL_I_KICKS = {
    '0-1': [{ x: 0, y: 0 }, { x: -2, y: 0 }, { x: +1, y: 0 }, { x: -2, y: -1 }, { x: +1, y: +2 }],
    '1-0': [{ x: 0, y: 0 }, { x: +2, y: 0 }, { x: -1, y: 0 }, { x: +2, y: +1 }, { x: -1, y: -2 }],
    '1-2': [{ x: 0, y: 0 }, { x: -1, y: 0 }, { x: +2, y: 0 }, { x: -1, y: +2 }, { x: +2, y: -1 }],
    '2-1': [{ x: 0, y: 0 }, { x: +1, y: 0 }, { x: -2, y: 0 }, { x: +1, y: -2 }, { x: -2, y: +1 }],
    '2-3': [{ x: 0, y: 0 }, { x: +2, y: 0 }, { x: -1, y: 0 }, { x: +2, y: +1 }, { x: -1, y: -2 }],
    '3-2': [{ x: 0, y: 0 }, { x: -2, y: 0 }, { x: +1, y: 0 }, { x: -2, y: -1 }, { x: +1, y: +2 }],
    '3-0': [{ x: 0, y: 0 }, { x: +1, y: 0 }, { x: -2, y: 0 }, { x: +1, y: -2 }, { x: -2, y: +1 }],
    '0-3': [{ x: 0, y: 0 }, { x: -1, y: 0 }, { x: +2, y: 0 }, { x: -1, y: +2 }, { x: +2, y: -1 }],
};
const CANONICAL_T_KICKS = {
    '0-1': [{ x: 0, y: 0 }, { x: -1, y: 0 }, { x: -1, y: +1 }, { x: 0, y: -2 }, { x: -1, y: -2 }],
    '1-0': [{ x: 0, y: 0 }, { x: +1, y: 0 }, { x: +1, y: -1 }, { x: 0, y: +2 }, { x: +1, y: +2 }],
    '1-2': [{ x: 0, y: 0 }, { x: +1, y: 0 }, { x: +1, y: -1 }, { x: 0, y: +2 }, { x: +1, y: +2 }],
    '2-1': [{ x: 0, y: 0 }, { x: -1, y: 0 }, { x: -1, y: +1 }, { x: 0, y: -2 }, { x: -1, y: -2 }],
    '2-3': [{ x: 0, y: 0 }, { x: +1, y: 0 }, { x: +1, y: +1 }, { x: 0, y: -2 }, { x: +1, y: -2 }],
    '3-2': [{ x: 0, y: 0 }, { x: -1, y: 0 }, { x: -1, y: -1 }, { x: 0, y: +2 }, { x: -1, y: +2 }],
    '3-0': [{ x: 0, y: 0 }, { x: -1, y: 0 }, { x: -1, y: -1 }, { x: 0, y: +2 }, { x: -1, y: +2 }],
    '0-3': [{ x: 0, y: 0 }, { x: +1, y: 0 }, { x: +1, y: +1 }, { x: 0, y: -2 }, { x: +1, y: -2 }],
};
function testKickTable(kind, from, to, canonical) {
    const ourKicks = getKicks(kind, from, to);
    expect(ourKicks).toEqual(canonical);
}
function testRotationNearWall(kind, x, y, from, to, dir) {
    const board = createEmptyBoard();
    const piece = { kind, x, y, rotation: from };
    // Test that rotation works near wall
    const kicks = getKicks(kind, from, to);
    let success = false;
    for (const kick of kicks) {
        const newX = x + kick.x;
        const newY = y + kick.y;
        if (!collides(board, kind, to, { x: newX, y: newY })) {
            success = true;
            break;
        }
    }
    expect(success).toBe(true);
}
describe('SRS Conformance Tests', () => {
    describe('I piece kick tables', () => {
        it('matches canonical 0→1 kicks', () => {
            testKickTable('I', 0, 1, CANONICAL_I_KICKS['0-1']);
        });
        it('matches canonical 1→0 kicks', () => {
            testKickTable('I', 1, 0, CANONICAL_I_KICKS['1-0']);
        });
        it('matches canonical 1→2 kicks', () => {
            testKickTable('I', 1, 2, CANONICAL_I_KICKS['1-2']);
        });
        it('matches canonical 2→1 kicks', () => {
            testKickTable('I', 2, 1, CANONICAL_I_KICKS['2-1']);
        });
        it('matches canonical 2→3 kicks', () => {
            testKickTable('I', 2, 3, CANONICAL_I_KICKS['2-3']);
        });
        it('matches canonical 3→2 kicks', () => {
            testKickTable('I', 3, 2, CANONICAL_I_KICKS['3-2']);
        });
        it('matches canonical 3→0 kicks', () => {
            testKickTable('I', 3, 0, CANONICAL_I_KICKS['3-0']);
        });
        it('matches canonical 0→3 kicks', () => {
            testKickTable('I', 0, 3, CANONICAL_I_KICKS['0-3']);
        });
    });
    describe('T piece kick tables', () => {
        it('matches canonical 0→1 kicks', () => {
            testKickTable('T', 0, 1, CANONICAL_T_KICKS['0-1']);
        });
        it('matches canonical 1→0 kicks', () => {
            testKickTable('T', 1, 0, CANONICAL_T_KICKS['1-0']);
        });
        it('matches canonical 1→2 kicks', () => {
            testKickTable('T', 1, 2, CANONICAL_T_KICKS['1-2']);
        });
        it('matches canonical 2→1 kicks', () => {
            testKickTable('T', 2, 1, CANONICAL_T_KICKS['2-1']);
        });
        it('matches canonical 2→3 kicks', () => {
            testKickTable('T', 2, 3, CANONICAL_T_KICKS['2-3']);
        });
        it('matches canonical 3→2 kicks', () => {
            testKickTable('T', 3, 2, CANONICAL_T_KICKS['3-2']);
        });
        it('matches canonical 3→0 kicks', () => {
            testKickTable('T', 3, 0, CANONICAL_T_KICKS['3-0']);
        });
        it('matches canonical 0→3 kicks', () => {
            testKickTable('T', 0, 3, CANONICAL_T_KICKS['0-3']);
        });
    });
    describe('Wall/corner rotation tests', () => {
        it('I piece rotates near left wall', () => {
            testRotationNearWall('I', 0, 10, 0, 1, 1);
        });
        it('I piece rotates near right wall', () => {
            testRotationNearWall('I', 7, 10, 0, 1, 1);
        });
        it('I piece cannot rotate in left corner (correct SRS behavior)', () => {
            // I piece at (0, 18) in rotation 0 cannot rotate to rotation 1
            // This is correct SRS behavior - no kicks allow the rotation
            const board = createEmptyBoard();
            const piece = { kind: 'I', x: 0, y: 18, rotation: 0 };
            const kicks = getKicks('I', 0, 1);
            let success = false;
            for (const kick of kicks) {
                const newX = piece.x + kick.x;
                const newY = piece.y + kick.y;
                if (!collides(board, 'I', 1, { x: newX, y: newY })) {
                    success = true;
                    break;
                }
            }
            // This should fail - I piece cannot rotate in left corner
            expect(success).toBe(false);
        });
        it('I piece rotates in right corner', () => {
            testRotationNearWall('I', 7, 18, 0, 1, 1);
        });
        it('T piece rotates near left wall', () => {
            testRotationNearWall('T', 0, 10, 0, 1, 1);
        });
        it('T piece rotates near right wall', () => {
            testRotationNearWall('T', 8, 10, 0, 1, 1);
        });
        it('T piece rotates in left corner', () => {
            testRotationNearWall('T', 0, 18, 0, 1, 1);
        });
        it('T piece rotates in right corner', () => {
            testRotationNearWall('T', 8, 18, 0, 1, 1);
        });
    });
    describe('Shape definitions', () => {
        it('I piece has correct spawn shape', () => {
            const shape = SHAPES['I'][0];
            expect(shape).toEqual([
                { x: -1, y: 0 }, { x: 0, y: 0 }, { x: 1, y: 0 }, { x: 2, y: 0 }
            ]);
        });
        it('T piece has correct spawn shape', () => {
            const shape = SHAPES['T'][0];
            expect(shape).toEqual([
                { x: 0, y: 0 }, { x: -1, y: 1 }, { x: 0, y: 1 }, { x: 1, y: 1 }
            ]);
        });
    });
});
