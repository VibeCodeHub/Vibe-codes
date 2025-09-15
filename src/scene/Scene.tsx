import React, { Suspense, useMemo } from 'react';
import { Canvas } from '@react-three/fiber';
import { Environment, PerformanceMonitor as Performance } from '@react-three/drei';
import { EffectComposer, Bloom } from '@react-three/postprocessing';
import { ACESFilmicToneMapping, SRGBColorSpace, Vector3 } from 'three';

type SceneProps = {
  children?: React.ReactNode;
};

export default function Scene(props: SceneProps): React.ReactElement {
  const cameraPos = useMemo(() => new Vector3(0, 12, 16), []);
  return (
    <Canvas
      camera={{ fov: 35, position: cameraPos.toArray() }}
      dpr={[1, 2]}
      gl={{ antialias: true }}
      onCreated={({ gl, scene, camera }) => {
        // Renderer configuration: sRGB output, ACES tone mapping.
        gl.outputColorSpace = SRGBColorSpace;
        gl.toneMapping = ACESFilmicToneMapping;
        gl.toneMappingExposure = 1.1;
        gl.shadowMap.enabled = false; // performance, glass doesn't need hard shadows
        // three >= r150 uses physically-based lighting by default (legacy off)
        camera.lookAt(0, 10, 0);
        scene.background = null;
      }}
    >
      {/* Lazy HDRI environment. Transmission needs env for refraction. */}
      <Suspense fallback={null}>
        <Environment preset="city" environmentIntensity={1.0} />
      </Suspense>

      {/* Subtle bloom for glass highlights */}
      <EffectComposer>
        <Bloom mipmapBlur intensity={0.3} luminanceThreshold={0.85} luminanceSmoothing={0.1} radius={0.4} />
      </EffectComposer>

      {/* Stabilize FPS on laptops by adapting DPR when performance drops */}
      <Performance />

      {props.children}
    </Canvas>
  );
}

