import { jsx as _jsx } from "react/jsx-runtime";
import { useMemo } from 'react';
import { BoxGeometry, MeshStandardMaterial } from 'three';
import { GRID_W, GRID_H } from '../game/constants';
export default function BoardFrame() {
    const frameGeometry = useMemo(() => new BoxGeometry(GRID_W + 0.2, GRID_H + 0.2, 0.1), []);
    const frameMaterial = useMemo(() => new MeshStandardMaterial({
        color: 0x2a2a2a,
        metalness: 0.1,
        roughness: 0.8,
    }), []);
    return (_jsx("mesh", { position: [0, 9.5, -0.1], geometry: frameGeometry, material: frameMaterial }));
}
