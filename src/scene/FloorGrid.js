import { jsx as _jsx } from "react/jsx-runtime";
import { useMemo } from 'react';
import { GridHelper } from 'three';
import { GRID_W } from '../game/constants';
export default function FloorGrid() {
    const grid = useMemo(() => new GridHelper(GRID_W, GRID_W, 0x444444, 0x222222), []);
    return (_jsx("primitive", { object: grid, position: [0, -0.5, 0], rotation: [-Math.PI / 2, 0, 0] }));
}
