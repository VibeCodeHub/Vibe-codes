import React, { useMemo } from 'react';
import { BoxGeometry, MeshStandardMaterial } from 'three';
import { GRID_W, GRID_H } from '../game/constants';

export default function BoardFrame(): React.ReactElement {
  // Slightly wider frame for better visual proportion
  const frameGeometry = useMemo(() => new BoxGeometry(GRID_W + 0.4, GRID_H + 0.2, 0.15), []);
  const frameMaterial = useMemo(() => new MeshStandardMaterial({
    color: 0x1a1a2e, // Darker blue-gray base
    metalness: 0.3,
    roughness: 0.6,
  }), []);

  // Add accent border
  const accentGeometry = useMemo(() => new BoxGeometry(GRID_W + 0.6, GRID_H + 0.4, 0.05), []);
  const accentMaterial = useMemo(() => new MeshStandardMaterial({
    color: 0x4a9eff, // Glass blue accent
    metalness: 0.8,
    roughness: 0.2,
  }), []);

  return (
    <group>
      <mesh position={[0, 9.5, -0.1]} geometry={frameGeometry} material={frameMaterial} />
      <mesh position={[0, 9.5, -0.2]} geometry={accentGeometry} material={accentMaterial} />
    </group>
  );
}