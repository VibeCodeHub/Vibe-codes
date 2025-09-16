import React, { Suspense, useMemo, useState, useRef, useEffect } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Environment, PerformanceMonitor as Performance, AdaptiveDpr } from '@react-three/drei';
import { EffectComposer, Bloom } from '@react-three/postprocessing';
import { ACESFilmicToneMapping, SRGBColorSpace, Vector3 } from 'three';
import { useGameStore } from '../game/store';

type SceneProps = {
  children?: React.ReactNode;
};

// Frame-time performance monitor with hysteresis for auto quality adjustment
// References: drei AdaptiveDpr docs for DPR clamping behavior
function PerformanceMonitor() {
  const setQuality = useGameStore(s => s.setQuality);
  const quality = useGameStore(s => s.quality);
  const frameTimes = useRef<number[]>([]);
  const lastCheck = useRef(0);
  const lastChange = useRef(0);
  const cooldownMs = 2000; // 2s cooldown after any quality change
  
  // Initialize debug object
  useEffect(() => {
    (window as any).__perf__ = {
      fps: 0,
      dpr: 1,
      calls: 0,
      quality: 'high',
      history: [],
    };
  }, []);
  
  useFrame((state) => {
    const now = performance.now();
    const delta = state.clock.getDelta() * 1000; // ms
    frameTimes.current.push(delta);
    
    // Keep rolling windows: 1s (60fps) and 3s (180fps)
    if (frameTimes.current.length > 180) frameTimes.current.shift();
    
    // Update debug info
    const fps = 1000 / delta;
    (window as any).__perf__.fps = fps;
    (window as any).__perf__.quality = quality;
    
    // Check every 500ms for responsiveness
    if (now - lastCheck.current > 500) {
      lastCheck.current = now;
      
      // Skip if in cooldown
      if (now - lastChange.current < cooldownMs) return;
      
      const recent1s = frameTimes.current.slice(-60); // last 60 frames (1s at 60fps)
      const recent3s = frameTimes.current.slice(-180); // last 180 frames (3s at 60fps)
      
      if (recent1s.length < 30 || recent3s.length < 90) return; // need enough data
      
      const avg1s = recent1s.reduce((a, b) => a + b, 0) / recent1s.length;
      const avg3s = recent3s.reduce((a, b) => a + b, 0) / recent3s.length;
      
      // DOWNGRADE: if 1s avg > 26ms sustained for 2s (4 checks)
      if (avg1s > 26 && quality !== 'low') {
        const newQuality = quality === 'high' ? 'medium' : 'low';
        setQuality(newQuality);
        lastChange.current = now;
        (window as any).__perf__.history.push({
          time: now,
          from: quality,
          to: newQuality,
          reason: 'downgrade',
          avg1s,
          avg3s,
        });
      }
      // UPGRADE: if 3s avg < 16.5ms sustained for 3s (6 checks)
      else if (avg3s < 16.5 && quality !== 'high') {
        const newQuality = quality === 'low' ? 'medium' : 'high';
        setQuality(newQuality);
        lastChange.current = now;
        (window as any).__perf__.history.push({
          time: now,
          from: quality,
          to: newQuality,
          reason: 'upgrade',
          avg1s,
          avg3s,
        });
      }
    }
  });
  
  return null;
}

// Debug info updater for renderer stats
function DebugUpdater() {
  const { gl } = useThree();
  
  useFrame(() => {
    if ((window as any).__perf__) {
      (window as any).__perf__.dpr = gl.getPixelRatio();
      (window as any).__perf__.calls = gl.info.render.calls;
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
        // @Web R3F Canvas defaults: sRGB + ACES for realistic lighting
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
      {/* @Web drei AdaptiveDpr: clamps DPR to [1,2] and regresses on sustained frame drops */}
      <AdaptiveDpr pixelRatio={[1, 2]} />
      
      {/* Lazy HDRI environment. Transmission needs env for refraction. */}
      {/* @Web drei Environment: provides HDRI for MeshPhysicalMaterial transmission */}
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
      <DebugUpdater />

      {props.children}
    </Canvas>
  );
}

