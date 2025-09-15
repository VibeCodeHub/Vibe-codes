import React, { useMemo, useRef } from 'react';
import { InstancedMesh, BoxGeometry, MeshPhysicalMaterial, Color, Object3D } from 'three';
import { useFrame } from '@react-three/fiber';
import type { Board } from '../game/types';

type BoardProps = { board: Board };

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

export default function BoardMesh({ board }: BoardProps): React.ReactElement {
  const instRef = useRef<InstancedMesh | null>(null);
  const geometry = useMemo(() => new BoxGeometry(1, 1, 1), []);
  const material = useMemo(() => new MeshPhysicalMaterial({
    metalness: 0,
    roughness: 0.08,
    transmission: 1.0,
    ior: 1.5,
    thickness: 0.22,
    attenuationDistance: 2.0,
  }), []);

  useFrame(() => {
    const inst = instRef.current;
    if (!inst) return;
    let idx = 0;
    for (let y = 0; y < board.length; y++) {
      for (let x = 0; x < board[y].length; x++) {
        const cell = board[y][x];
        if (!cell) continue;
        (material as MeshPhysicalMaterial).attenuationColor = COLORS[cell.colorId];
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
  return <instancedMesh ref={instRef} args={[geometry, material, maxInstances]} />;
}

