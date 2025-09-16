import React, { useState } from 'react';
import { useGameStore } from '../game/store';
import { downloadReplay, loadReplayFromFile, loadReplayFromClipboard } from '../game/replay';

export default function HUD(): React.ReactElement {
  const { 
    score, level, lines, hold, nextQueue, paused, quality, 
    isReplaying, replayProgress,
    pause, resume, restart, setQuality,
    startRecording, stopRecording, exportReplay, loadReplay, startReplay, stopReplay
  } = useGameStore(s => ({
    score: s.score,
    level: s.level,
    lines: s.lines,
    hold: s.hold,
    nextQueue: s.nextQueue,
    paused: s.paused,
    quality: s.quality,
    isReplaying: s.isReplaying,
    replayProgress: s.replayProgress,
    pause: s.pause,
    resume: s.resume,
    restart: s.restart,
    setQuality: s.setQuality,
    startRecording: s.startRecording,
    stopRecording: s.stopRecording,
    exportReplay: s.exportReplay,
    loadReplay: s.loadReplay,
    startReplay: s.startReplay,
    stopReplay: s.stopReplay,
  }));

  const [isRecording, setIsRecording] = useState(false);
  const [showReplayMenu, setShowReplayMenu] = useState(false);

  const handleExportReplay = () => {
    const data = exportReplay();
    if (data) {
      downloadReplay(data);
    }
  };

  const handleImportFile = async () => {
    try {
      const data = await loadReplayFromFile();
      loadReplay(data);
      setShowReplayMenu(false);
    } catch (error) {
      alert('Failed to load replay: ' + (error as Error).message);
    }
  };

  const handleImportClipboard = async () => {
    try {
      const data = await loadReplayFromClipboard();
      loadReplay(data);
      setShowReplayMenu(false);
    } catch (error) {
      alert('Failed to load replay from clipboard: ' + (error as Error).message);
    }
  };

  const handleStartRecording = () => {
    startRecording();
    setIsRecording(true);
  };

  const handleStopRecording = () => {
    stopRecording();
    setIsRecording(false);
  };

  return (
    <div style={{ position: 'absolute', top: 12, left: 12, color: '#e6e9ee', font: '14px/1.2 system-ui, sans-serif' }}>
      <div style={{ display: 'grid', gap: 6 }}>
        <div>Score: <strong>{score}</strong></div>
        <div>Level: <strong>{level}</strong></div>
        <div>Lines: <strong>{lines}</strong></div>
        <div>Hold: <strong>{hold ?? '-'}</strong></div>
        <div>Next: <strong>{nextQueue.slice(0, 5).join(' ')}</strong></div>
        
        {/* Replay status */}
        {isReplaying && (
          <div style={{ color: '#80b5ff', fontSize: '12px' }}>
            Replaying: {replayProgress.current}/{replayProgress.total}
          </div>
        )}
        {isRecording && (
          <div style={{ color: '#ff6b6b', fontSize: '12px' }}>
            Recording...
          </div>
        )}

        <div style={{ display: 'flex', gap: 8, marginTop: 6 }}>
          <button onClick={() => (paused ? resume() : pause())} style={btnStyle} className="focus-visible">{paused ? 'Resume' : 'Pause'}</button>
          <button onClick={() => restart()} style={btnStyle} className="focus-visible">Restart</button>
        </div>

        {/* Replay controls */}
        <div style={{ display: 'flex', gap: 4, marginTop: 6 }}>
          {!isReplaying ? (
            <>
              <button 
                onClick={isRecording ? handleStopRecording : handleStartRecording} 
                style={{...btnStyle, ...(isRecording ? activeBtnStyle : {})}} 
                className="focus-visible"
              >
                {isRecording ? 'Stop Rec' : 'Record'}
              </button>
              <button onClick={handleExportReplay} style={btnStyle} className="focus-visible">Export</button>
              <button onClick={() => setShowReplayMenu(!showReplayMenu)} style={btnStyle} className="focus-visible">Import</button>
            </>
          ) : (
            <>
              <button onClick={startReplay} style={btnStyle} className="focus-visible">Play</button>
              <button onClick={stopReplay} style={btnStyle} className="focus-visible">Stop</button>
            </>
          )}
        </div>

        {/* Import menu */}
        {showReplayMenu && (
          <div style={{ display: 'flex', gap: 4, marginTop: 4 }}>
            <button onClick={handleImportFile} style={btnStyle} className="focus-visible">File</button>
            <button onClick={handleImportClipboard} style={btnStyle} className="focus-visible">Clipboard</button>
          </div>
        )}

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

