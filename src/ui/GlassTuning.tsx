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

type DevicePreset = {
  name: string;
  ior: number;
  thickness: number;
  roughness: number;
  attenuationDistance: number;
  tintIntensity: number;
  useDreiMaterial: boolean;
};

const DEVICE_PRESETS: DevicePreset[] = [
  {
    name: 'Laptop / Pro iPhone',
    ior: 1.52,
    thickness: 0.22,
    roughness: 0.06,
    attenuationDistance: 2.0,
    tintIntensity: 1.0,
    useDreiMaterial: false,
  },
  {
    name: 'Mid-range Phone',
    ior: 1.5,
    thickness: 0.20,
    roughness: 0.08,
    attenuationDistance: 2.0,
    tintIntensity: 1.0,
    useDreiMaterial: false,
  },
  {
    name: 'Low (Standard Material)',
    ior: 1.0,
    thickness: 0.0,
    roughness: 0.1,
    attenuationDistance: 0.0,
    tintIntensity: 0.0,
    useDreiMaterial: false,
  },
];

function getDeviceId(): string {
  // Simple device fingerprinting based on screen size and user agent
  const screen = `${window.screen.width}x${window.screen.height}`;
  const isMobile = /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  const isHighDPI = window.devicePixelRatio > 1.5;
  return `${isMobile ? 'mobile' : 'desktop'}-${isHighDPI ? 'high' : 'normal'}-${screen}`;
}

function getStoredPreset(deviceId: string): string | null {
  return localStorage.getItem(`glass-tuning-preset-${deviceId}`);
}

function setStoredPreset(deviceId: string, presetName: string): void {
  localStorage.setItem(`glass-tuning-preset-${deviceId}`, presetName);
}

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
  const [selectedPreset, setSelectedPreset] = useState<string>('');
  const [deviceId] = useState(() => getDeviceId());

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

  // Load saved preset on mount
  useEffect(() => {
    const savedPreset = getStoredPreset(deviceId);
    if (savedPreset) {
      const preset = DEVICE_PRESETS.find(p => p.name === savedPreset);
      if (preset) {
        setParams(preset);
        setSelectedPreset(savedPreset);
      }
    }
  }, [deviceId]);

  const applyPreset = (presetName: string) => {
    const preset = DEVICE_PRESETS.find(p => p.name === presetName);
    if (preset) {
      setParams(preset);
      setSelectedPreset(presetName);
      setStoredPreset(deviceId, presetName);
    }
  };

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
      minWidth: 350,
    }}>
      <div style={{ marginBottom: 16, fontWeight: 'bold' }}>Glass Tuning (F1)</div>
      
      {/* Device Presets */}
      <div style={{ marginBottom: 16 }}>
        <div style={{ marginBottom: 8, fontWeight: 'bold' }}>Device Presets:</div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {DEVICE_PRESETS.map((preset) => (
            <button
              key={preset.name}
              onClick={() => applyPreset(preset.name)}
              style={{
                background: selectedPreset === preset.name ? '#4a5568' : '#2d3748',
                color: '#e6e9ee',
                border: '1px solid #4a5568',
                borderRadius: 4,
                padding: '6px 12px',
                cursor: 'pointer',
                fontSize: '12px',
              }}
            >
              {preset.name}
            </button>
          ))}
        </div>
      </div>
      
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
            setStoredPreset(deviceId, 'Custom');
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
          Apply Custom
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
      
      <div style={{ marginTop: 12, fontSize: 12, opacity: 0.7 }}>
        Device: {deviceId} | Last preset: {selectedPreset || 'None'}
      </div>
    </div>
  );
}