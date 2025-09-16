import { jsx as _jsx } from "react/jsx-runtime";
import { useMemo, useRef, useLayoutEffect } from 'react';
import { BoxGeometry, MeshStandardMaterial, Color, Object3D } from 'three';
import { useFrame } from '@react-three/fiber';
import { SHAPES } from '../game/srs';
import { collides } from '../game/logic';
import { useGameStore } from '../game/store';
const temp = new Object3D();
// Ghost piece colors (muted versions)
const GHOST_COLORS = [
    new Color('#66d9ff').multiplyScalar(0.3),
    new Color('#6a86ff').multiplyScalar(0.3),
    new Color('#ff9d4d').multiplyScalar(0.3),
    new Color('#ffd966').multiplyScalar(0.3),
    new Color('#6bff8a').multiplyScalar(0.3),
    new Color('#d96bff').multiplyScalar(0.3),
    new Color('#ff6b79').multiplyScalar(0.3),
];
export default function GhostPiece({ piece }) {
    const instRef = useRef(null);
    const board = useGameStore(s => s.board);
    const geometry = useMemo(() => new BoxGeometry(1, 1, 1), []);
    const material = useMemo(() => new MeshStandardMaterial({
        metalness: 0,
        roughness: 0.1,
        transparent: true,
        opacity: 0.4,
        // No transmission - ghost piece uses standard material for clarity
    }), []);
    useLayoutEffect(() => () => {
        geometry.dispose();
        material.dispose();
    }, [geometry, material]);
    useFrame(() => {
        const inst = instRef.current;
        if (!inst || !piece) {
            if (inst) {
                inst.count = 0;
                inst.instanceMatrix.needsUpdate = true;
            }
            return;
        }
        // Find landing position by dropping the piece
        let ghostY = piece.y;
        while (ghostY < 19) {
            const testPiece = { ...piece, y: ghostY + 1 };
            if (collides(board, testPiece.kind, testPiece.rotation, { x: testPiece.x, y: testPiece.y })) {
                break;
            }
            ghostY++;
        }
        // Don't show ghost if piece is already at landing position
        if (ghostY === piece.y) {
            inst.count = 0;
            inst.instanceMatrix.needsUpdate = true;
            return;
        }
        const cells = SHAPES[piece.kind][piece.rotation];
        inst.count = cells.length;
        const colorId = (() => {
            switch (piece.kind) {
                case 'I': return 0;
                case 'J': return 1;
                case 'L': return 2;
                case 'O': return 3;
                case 'S': return 4;
                case 'T': return 5;
                case 'Z': return 6;
            }
        })();
        material.color = GHOST_COLORS[colorId];
        for (let i = 0; i < cells.length; i++) {
            const c = cells[i];
            temp.position.set(piece.x + c.x + 0.5 - 5, -(ghostY + c.y) + 19 - 0.5, 0);
            temp.rotation.set(0, 0, 0);
            temp.updateMatrix();
            inst.setMatrixAt(i, temp.matrix);
        }
        inst.instanceMatrix.needsUpdate = true;
    });
    return (_jsx("instancedMesh", { ref: instRef, args: [geometry, material, 4] }));
}
