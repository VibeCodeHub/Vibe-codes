import { jsx as _jsx } from "react/jsx-runtime";
import { useMemo, useRef, useLayoutEffect } from 'react';
import { BoxGeometry, MeshPhysicalMaterial, MeshStandardMaterial, Color, Object3D } from 'three';
import { useFrame } from '@react-three/fiber';
import { SHAPES } from '../game/srs';
const temp = new Object3D();
// Subtle per-piece attenuation tints
const COLORS = [
    new Color('#66d9ff'), // I
    new Color('#6a86ff'), // J
    new Color('#ff9d4d'), // L
    new Color('#ffd966'), // O
    new Color('#6bff8a'), // S
    new Color('#d96bff'), // T
    new Color('#ff6b79'), // Z
];
// Material cache per color for low-quality path (MeshStandardMaterial)
const materialCache = new Map();
export default function Tetromino({ piece }) {
    const instRef = useRef(null);
    const quality = useGameStore(s => s.quality);
    const geometry = useMemo(() => new BoxGeometry(1, 1, 1), []);
    const material = useMemo(() => {
        if (quality === 'low') {
            // Low quality: MeshStandardMaterial (no transmission) for better mobile performance
            // Transmission is physically-based and costlier; standard is faster on mobile
            return new MeshStandardMaterial({
                metalness: 0,
                roughness: 0.1,
                color: 0x666666,
            });
        }
        // Medium/High quality: MeshPhysicalMaterial with transmission
        const m = new MeshPhysicalMaterial({
            metalness: 0,
            roughness: 0.07,
            transmission: 1.0,
            ior: 1.5,
            thickness: 0.2,
            attenuationDistance: 2.0,
        });
        // Transmission relies on environment for believable refraction per three.js docs.
        // @Web three.js MeshPhysicalMaterial transmission docs
        return m;
    }, [quality]);
    useLayoutEffect(() => () => {
        geometry.dispose();
        material.dispose();
    }, [geometry, material]);
    useFrame(() => {
        const inst = instRef.current;
        if (!inst)
            return;
        if (!piece) {
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
        // Apply color based on quality
        if (quality === 'low') {
            // Use cached standard material per color
            if (!materialCache.has(colorId)) {
                materialCache.set(colorId, new MeshStandardMaterial({
                    metalness: 0,
                    roughness: 0.1,
                    color: COLORS[colorId].getHex(),
                }));
            }
            inst.material = materialCache.get(colorId);
        }
        else {
            // Physical material with attenuation color
            material.attenuationColor = COLORS[colorId];
        }
        for (let i = 0; i < cells.length; i++) {
            const c = cells[i];
            temp.position.set(piece.x + c.x + 0.5 - 5, -(piece.y + c.y) + 19 - 0.5, 0);
            temp.rotation.set(0, 0, 0);
            temp.updateMatrix();
            inst.setMatrixAt(i, temp.matrix);
        }
        inst.instanceMatrix.needsUpdate = true;
    });
    return (_jsx("instancedMesh", { ref: instRef, args: [geometry, material, 4] }));
}
