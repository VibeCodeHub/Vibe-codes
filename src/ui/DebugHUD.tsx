import React, { useState, useEffect } from 'react';
import { useGameStore } from '../game/store';

export default function DebugHUD(): React.ReactElement | null {
  const [show, setShow] = useState(false);
  const [perf, setPerf] = useState<any>(null);
  const quality = useGameStore(s => s.quality);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === '`' || e.key === '~') {
        e.preventDefault();
        setShow(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, []);

  useEffect(() => {
    if (!show) return;
    
    const interval = setInterval(() => {
      if ((window as any).__perf__) {
        setPerf((window as any).__perf__);
      }
    }, 100); // Update 10x per second
    
    return () => clearInterval(interval);
  }, [show]);

  if (!show || !perf) return null;

  return (
    <div style={{
      position: 'absolute',
      top: 12,
      right: 12,
      background: 'rgba(0,0,0,0.8)',
      color: '#e6e9ee',
      padding: '8px 12px',
      borderRadius: 6,
      font: '12px/1.4 monospace',
      zIndex: 1000,
      minWidth: 200,
    }}>
      <div style={{ marginBottom: 4, fontWeight: 'bold' }}>Debug HUD (`)</div>
      <div>FPS: {perf.fps.toFixed(1)}</div>
      <div>DPR: {perf.dpr.toFixed(2)}</div>
      <div>Calls: {perf.calls}</div>
      <div>Quality: {quality}</div>
      <div>Bloom: {quality === 'high' ? 'ON' : 'OFF'}</div>
      <div style={{ marginTop: 8, fontSize: 10, opacity: 0.7 }}>
        History: {perf.history.length} changes
      </div>
    </div>
  );
}