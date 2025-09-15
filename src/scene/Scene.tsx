import React, { Suspense, useMemo, useState, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Environment, PerformanceMonitor as Performance, AdaptiveDpr } from '@react-three/drei';
import { EffectComposer, Bloom } from '@react-three/postprocessing';
import { ACESFilmicToneMapping, SRGBColorSpace, Vector3 } from 'three';
import { useGameStore } from '../game/store';

type SceneProps = {
  children?: React.ReactNode;
};

// Frame-time performance monitor for auto quality adjustment
function PerformanceMonitor() {
  const setQuality = useGameStore(s => s.setQuality);
  const quality = useGameStore(s => s.quality);
  const frameTimes = useRef<number[]>([]);
  const lastCheck = useRef(0);
  
  useFrame((state) => {
    const now = performance.now();
    const delta = state.clock.getDelta() * 1000; // ms
    frameTimes.current.push(delta);
    if (frameTimes.current.length > 60) frameTimes.current.shift(); // keep last 60 frames
    
    // Check every 2 seconds
    if (now - lastCheck.current > 2000) {
      lastCheck.current = now;
      const avgFrameTime = frameTimes.current.reduce((a, b) => a + b, 0) / frameTimes.current.length;
      
      // Auto-adjust quality based on frame time
      // Target: 16.67ms (60fps), 33.33ms (30fps)
      if (avgFrameTime > 25 && quality === 'high') {
        setQuality('medium');
      } else if (avgFrameTime > 20 && quality === 'medium') {
        setQuality('low');
      } else if (avgFrameTime < 15 && quality === 'low') {
        setQuality('medium');
      }
    }
  });
  
  return null;
}

export default function Scene(props: SceneProps): React.ReactElement {
  const quality = useGameStore(s => s.quality);
  const cameraPos = useMemo(() => new Vector3(0, 12, 16), []);
  
  // Quality-based settings
  const dpr = quality === 'low' ? [1, 1] : quality === 'medium' ? [1, 1.5] : [1, 2];
  const enableBloom = quality === 'high';
  const enableTransmission = quality !== 'low';
  
  return (
    <Canvas
      camera={{ fov: 35, position: cameraPos.toArray() }}
      dpr={dpr}
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
      {/* Adaptive DPR based on performance */}
      <AdaptiveDpr pixelRatio={[1, 2]} />
      
      {/* Lazy HDRI environment. Transmission needs env for refraction. */}
      <Suspense fallback={null}>
        <Environment preset="city" environmentIntensity={enableTransmission ? 1.0 : 0.5} />
      </Suspense>

      {/* Conditional bloom for glass highlights */}
      {enableBloom && (
        <EffectComposer>
          <Bloom mipmapBlur intensity={0.3} luminanceThreshold={0.85} luminanceSmoothing={0.1} radius={0.4} />
        </EffectComposer>
      )}

      {/* Performance monitoring and auto quality adjustment */}
      <Performance />
      <PerformanceMonitor />

      {props.children}
    </Canvas>
  );
}

