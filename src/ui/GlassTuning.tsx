import React, { useState, useEffect } from 'react';
import { useGameStore } from '../game/store';

type TuningParams = {
  ior: number;
  thickness: number;
  roughness: number;
  attenuationDistance: number;
  tintIntensity: number;
  useDreiMaterial: boolean;
};

export default function GlassTuning(): React.ReactElement | null {
  const [show, setShow] = useState(false);
  const [params, setParams] = useState<TuningParams>({
    ior: 1.5,
    thickness: 0.2,
    roughness: 0.07,
    attenuationDistance: 2.0,
    tintIntensity: 1.0,
    useDreiMaterial: false,
  });

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'F1') {
        e.preventDefault();
        setShow(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, []);

  if (!show) return null;

  return (
    <div style={{
      position: 'absolute',
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%)',
      background: 'rgba(0,0,0,0.9)',
      color: '#e6e9ee',
      padding: '20px',
      borderRadius: 8,
      font: '14px/1.4 monospace',
      zIndex: 1000,
      minWidth: 300,
    }}>
      <div style={{ marginBottom: 16, fontWeight: 'bold' }}>Glass Tuning (F1)</div>
      
      <div style={{ marginBottom: 12 }}>
        <label style={{ display: 'block', marginBottom: 4 }}>IOR: {params.ior.toFixed(2)}</label>
        <input
          type="range"
          min="1.48"
          max="1.52"
          step="0.01"
          value={params.ior}
          onChange={(e) => setParams(prev => ({ ...prev, ior: parseFloat(e.target.value) }))}
          style={{ width: '100%' }}
        />
      </div>

      <div style={{ marginBottom: 12 }}>
        <label style={{ display: 'block', marginBottom: 4 }}>Thickness: {params.thickness.toFixed(2)}</label>
        <input
          type="range"
          min="0.16"
          max="0.28"
          step="0.01"
          value={params.thickness}
          onChange={(e) => setParams(prev => ({ ...prev, thickness: parseFloat(e.target.value) }))}
          style={{ width: '100%' }}
        />
      </div>

      <div style={{ marginBottom: 12 }}>
        <label style={{ display: 'block', marginBottom: 4 }}>Roughness: {params.roughness.toFixed(2)}</label>
        <input
          type="range"
          min="0.05"
          max="0.12"
          step="0.01"
          value={params.roughness}
          onChange={(e) => setParams(prev => ({ ...prev, roughness: parseFloat(e.target.value) }))}
          style={{ width: '100%' }}
        />
      </div>

      <div style={{ marginBottom: 12 }}>
        <label style={{ display: 'block', marginBottom: 4 }}>Attenuation Distance: {params.attenuationDistance.toFixed(1)}</label>
        <input
          type="range"
          min="1.5"
          max="2.5"
          step="0.1"
          value={params.attenuationDistance}
          onChange={(e) => setParams(prev => ({ ...prev, attenuationDistance: parseFloat(e.target.value) }))}
          style={{ width: '100%' }}
        />
      </div>

      <div style={{ marginBottom: 12 }}>
        <label style={{ display: 'block', marginBottom: 4 }}>Tint Intensity: {params.tintIntensity.toFixed(1)}</label>
        <input
          type="range"
          min="0.5"
          max="2.0"
          step="0.1"
          value={params.tintIntensity}
          onChange={(e) => setParams(prev => ({ ...prev, tintIntensity: parseFloat(e.target.value) }))}
          style={{ width: '100%' }}
        />
      </div>

      <div style={{ marginBottom: 16 }}>
        <label style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <input
            type="checkbox"
            checked={params.useDreiMaterial}
            onChange={(e) => setParams(prev => ({ ...prev, useDreiMaterial: e.target.checked }))}
          />
          Use drei MeshTransmissionMaterial
        </label>
        <div style={{ fontSize: 12, opacity: 0.7, marginTop: 4 }}>
          Trade-offs: drei is simpler but less customizable; MeshPhysicalMaterial is more flexible but complex
        </div>
      </div>

      <div style={{ display: 'flex', gap: 8 }}>
        <button
          onClick={() => {
            // Apply tuning parameters (would need to be wired to material updates)
            console.log('Applied tuning:', params);
          }}
          style={{
            background: '#2d3748',
            color: '#e6e9ee',
            border: '1px solid #4a5568',
            borderRadius: 4,
            padding: '8px 16px',
            cursor: 'pointer',
          }}
        >
          Apply
        </button>
        <button
          onClick={() => setShow(false)}
          style={{
            background: '#2d3748',
            color: '#e6e9ee',
            border: '1px solid #4a5568',
            borderRadius: 4,
            padding: '8px 16px',
            cursor: 'pointer',
          }}
        >
          Close
        </button>
      </div>
    </div>
  );
}