import React from 'react';
import { useGameStore } from '../game/store';

export default function HUD(): React.ReactElement {
  const { score, level, lines, hold, nextQueue, paused, quality, pause, resume, restart, setQuality } = useGameStore(s => ({
    score: s.score,
    level: s.level,
    lines: s.lines,
    hold: s.hold,
    nextQueue: s.nextQueue,
    paused: s.paused,
    quality: s.quality,
    pause: s.pause,
    resume: s.resume,
    restart: s.restart,
    setQuality: s.setQuality,
  }));

  return (
    <div style={{ position: 'absolute', top: 12, left: 12, color: '#e6e9ee', font: '14px/1.2 system-ui, sans-serif' }}>
      <div style={{ display: 'grid', gap: 6 }}>
        <div>Score: <strong>{score}</strong></div>
        <div>Level: <strong>{level}</strong></div>
        <div>Lines: <strong>{lines}</strong></div>
        <div>Hold: <strong>{hold ?? '-'}</strong></div>
        <div>Next: <strong>{nextQueue.slice(0, 5).join(' ')}</strong></div>
        <div style={{ display: 'flex', gap: 8, marginTop: 6 }}>
          <button onClick={() => (paused ? resume() : pause())} style={btnStyle} className="focus-visible">{paused ? 'Resume' : 'Pause'}</button>
          <button onClick={() => restart()} style={btnStyle} className="focus-visible">Restart</button>
        </div>
        <div style={{ display: 'flex', gap: 4, marginTop: 6 }}>
          <button 
            onClick={() => setQuality('low')} 
            style={{...btnStyle, ...(quality === 'low' ? activeBtnStyle : {})}} 
            className="focus-visible"
          >
            Low
          </button>
          <button 
            onClick={() => setQuality('medium')} 
            style={{...btnStyle, ...(quality === 'medium' ? activeBtnStyle : {})}} 
            className="focus-visible"
          >
            Med
          </button>
          <button 
            onClick={() => setQuality('high')} 
            style={{...btnStyle, ...(quality === 'high' ? activeBtnStyle : {})}} 
            className="focus-visible"
          >
            High
          </button>
        </div>
        <div style={{ opacity: 0.8, marginTop: 6 }}>
          ←/→ move, ↓ soft, ↑/Z rotate, Space hard, C hold
        </div>
      </div>
      <style>{`:focus-visible{outline:2px solid #80b5ff; outline-offset:2px}`}</style>
    </div>
  );
}

const btnStyle: React.CSSProperties = {
  background: '#1a222d',
  color: '#e6e9ee',
  border: '1px solid #2c3a4a',
  borderRadius: 6,
  padding: '6px 10px',
  cursor: 'pointer',
};

const activeBtnStyle: React.CSSProperties = {
  background: '#2d3748',
  borderColor: '#4a5568',
};

