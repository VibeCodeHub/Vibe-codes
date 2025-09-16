import { jsx as _jsx } from "react/jsx-runtime";
import { useMemo, useRef } from 'react';
import { BoxGeometry, MeshPhysicalMaterial, MeshStandardMaterial, Color, Object3D } from 'three';
import { useFrame } from '@react-three/fiber';
import { useGameStore } from '../game/store';
const temp = new Object3D();
const COLORS = [
    new Color('#66d9ff'),
    new Color('#6a86ff'),
    new Color('#ff9d4d'),
    new Color('#ffd966'),
    new Color('#6bff8a'),
    new Color('#d96bff'),
    new Color('#ff6b79'),
];
// Material cache per color for low-quality path
const boardMaterialCache = new Map();
export default function BoardMesh({ board }) {
    const instRef = useRef(null);
    const quality = useGameStore(s => s.quality);
    const geometry = useMemo(() => new BoxGeometry(1, 1, 1), []);
    const material = useMemo(() => {
        if (quality === 'low') {
            // Low quality: MeshStandardMaterial for better mobile performance
            return new MeshStandardMaterial({
                metalness: 0,
                roughness: 0.1,
                color: 0x666666,
            });
        }
        // Medium/High quality: MeshPhysicalMaterial with transmission
        return new MeshPhysicalMaterial({
            metalness: 0,
            roughness: 0.08,
            transmission: 1.0,
            ior: 1.5,
            thickness: 0.22,
            attenuationDistance: 2.0,
        });
    }, [quality]);
    useFrame(() => {
        const inst = instRef.current;
        if (!inst)
            return;
        let idx = 0;
        for (let y = 0; y < board.length; y++) {
            for (let x = 0; x < board[y].length; x++) {
                const cell = board[y][x];
                if (!cell)
                    continue;
                // Apply color based on quality
                if (quality === 'low') {
                    // Use cached standard material per color
                    if (!boardMaterialCache.has(cell.colorId)) {
                        boardMaterialCache.set(cell.colorId, new MeshStandardMaterial({
                            metalness: 0,
                            roughness: 0.1,
                            color: COLORS[cell.colorId].getHex(),
                        }));
                    }
                    // Note: We can't change material per instance, so we'll use the base material
                    // and set color via attenuationColor for physical materials
                }
                else {
                    material.attenuationColor = COLORS[cell.colorId];
                }
                temp.position.set(x + 0.5 - 5, -(y) + 19 - 0.5, 0);
                temp.rotation.set(0, 0, 0);
                temp.updateMatrix();
                inst.setMatrixAt(idx++, temp.matrix);
            }
        }
        inst.count = idx;
        inst.instanceMatrix.needsUpdate = true;
    });
    // Max instances = grid cells
    const maxInstances = 10 * 20;
    return _jsx("instancedMesh", { ref: instRef, args: [geometry, material, maxInstances] });
}
