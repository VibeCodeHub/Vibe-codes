import React, { useState, useEffect } from 'react';
import { useGameStore } from '../game/store';
import { downloadReplay, loadReplayFromFile, loadReplayFromClipboard } from '../game/replay';
import { audioManager } from '../audio/AudioManager';

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
  const [audioUnlocked, setAudioUnlocked] = useState(false);
  const [volume, setVolume] = useState(audioManager.getVolume());
  const [muted, setMuted] = useState(audioManager.getMuted());

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

  // Audio unlock on first user interaction
  useEffect(() => {
    const unlockAudio = async () => {
      if (!audioUnlocked) {
        const success = await audioManager.unlock();
        setAudioUnlocked(success);
      }
    };

    // Unlock on any user interaction
    const events = ['click', 'keydown', 'touchstart'];
    const handler = () => {
      unlockAudio();
      events.forEach(event => document.removeEventListener(event, handler));
    };

    events.forEach(event => document.addEventListener(event, handler, { once: true }));

    return () => {
      events.forEach(event => document.removeEventListener(event, handler));
    };
  }, [audioUnlocked]);

  const handleVolumeChange = (newVolume: number) => {
    setVolume(newVolume);
    audioManager.setVolume(newVolume);
  };

  const handleMuteToggle = () => {
    const newMuted = !muted;
    setMuted(newMuted);
    audioManager.setMuted(newMuted);
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
          <button 
            onClick={() => (paused ? resume() : pause())} 
            style={btnStyle} 
            className="focus-visible"
            aria-label={paused ? 'Resume game' : 'Pause game'}
            tabIndex={0}
          >
            {paused ? 'Resume' : 'Pause'}
          </button>
          <button 
            onClick={() => restart()} 
            style={btnStyle} 
            className="focus-visible"
            aria-label="Restart game"
            tabIndex={0}
          >
            Restart
          </button>
        </div>

        {/* Replay controls */}
        <div style={{ display: 'flex', gap: 4, marginTop: 6 }}>
          {!isReplaying ? (
            <>
              <button 
                onClick={isRecording ? handleStopRecording : handleStartRecording} 
                style={{...btnStyle, ...(isRecording ? activeBtnStyle : {})}} 
                className="focus-visible"
                aria-label={isRecording ? 'Stop recording' : 'Start recording'}
                tabIndex={0}
              >
                {isRecording ? 'Stop Rec' : 'Record'}
              </button>
              <button 
                onClick={handleExportReplay} 
                style={btnStyle} 
                className="focus-visible"
                aria-label="Export replay"
                tabIndex={0}
              >
                Export
              </button>
              <button 
                onClick={() => setShowReplayMenu(!showReplayMenu)} 
                style={btnStyle} 
                className="focus-visible"
                aria-label="Import replay"
                tabIndex={0}
              >
                Import
              </button>
            </>
          ) : (
            <>
              <button 
                onClick={startReplay} 
                style={btnStyle} 
                className="focus-visible"
                aria-label="Play replay"
                tabIndex={0}
              >
                Play
              </button>
              <button 
                onClick={stopReplay} 
                style={btnStyle} 
                className="focus-visible"
                aria-label="Stop replay"
                tabIndex={0}
              >
                Stop
              </button>
            </>
          )}
        </div>

        {/* Import menu */}
        {showReplayMenu && (
          <div style={{ display: 'flex', gap: 4, marginTop: 4 }}>
            <button 
              onClick={handleImportFile} 
              style={btnStyle} 
              className="focus-visible"
              aria-label="Import replay from file"
              tabIndex={0}
            >
              File
            </button>
            <button 
              onClick={handleImportClipboard} 
              style={btnStyle} 
              className="focus-visible"
              aria-label="Import replay from clipboard"
              tabIndex={0}
            >
              Clipboard
            </button>
          </div>
        )}

        <div style={{ display: 'flex', gap: 4, marginTop: 6 }}>
          <button 
            onClick={() => setQuality('low')} 
            style={{...btnStyle, ...(quality === 'low' ? activeBtnStyle : {})}} 
            className="focus-visible"
            aria-label="Set quality to low"
            tabIndex={0}
          >
            Low
          </button>
          <button 
            onClick={() => setQuality('medium')} 
            style={{...btnStyle, ...(quality === 'medium' ? activeBtnStyle : {})}} 
            className="focus-visible"
            aria-label="Set quality to medium"
            tabIndex={0}
          >
            Med
          </button>
          <button 
            onClick={() => setQuality('high')} 
            style={{...btnStyle, ...(quality === 'high' ? activeBtnStyle : {})}} 
            className="focus-visible"
            aria-label="Set quality to high"
            tabIndex={0}
          >
            High
          </button>
        </div>

        {/* Audio Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 6 }}>
          <button
            onClick={handleMuteToggle}
            style={{...btnStyle, ...(muted ? activeBtnStyle : {})}}
            className="focus-visible"
            aria-label={muted ? 'Unmute audio' : 'Mute audio'}
            tabIndex={0}
          >
            {muted ? '🔇' : '🔊'}
          </button>
          <label htmlFor="volume-slider" style={{ fontSize: '12px', minWidth: '40px' }}>
            Vol: {Math.round(volume * 100)}%
          </label>
          <input
            id="volume-slider"
            type="range"
            min="0"
            max="1"
            step="0.1"
            value={volume}
            onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
            style={{
              width: '80px',
              height: '20px',
              background: '#1a1a2e',
              outline: 'none',
              borderRadius: '10px',
              appearance: 'none',
            }}
            className="focus-visible"
            aria-label="Volume control"
            tabIndex={0}
          />
          {!audioUnlocked && (
            <span style={{ fontSize: '10px', color: '#888', fontStyle: 'italic' }}>
              Click to enable audio
            </span>
          )}
        </div>
        <div style={{ opacity: 0.8, marginTop: 6 }}>
          ←/→ move, ↓ soft, ↑/Z rotate, Space hard, C hold
        </div>
      </div>
      <style>{`
        :focus-visible {
          outline: 2px solid #4a9eff;
          outline-offset: 2px;
        }
        
        #volume-slider::-webkit-slider-thumb {
          appearance: none;
          width: 16px;
          height: 16px;
          border-radius: 50%;
          background: #4a9eff;
          cursor: pointer;
          border: 2px solid #1a1a2e;
        }
        
        #volume-slider::-moz-range-thumb {
          width: 16px;
          height: 16px;
          border-radius: 50%;
          background: #4a9eff;
          cursor: pointer;
          border: 2px solid #1a1a2e;
        }
        
        #volume-slider::-webkit-slider-track {
          height: 4px;
          background: #2a4a6e;
          border-radius: 2px;
        }
        
        #volume-slider::-moz-range-track {
          height: 4px;
          background: #2a4a6e;
          border-radius: 2px;
          border: none;
        }
        
        button:focus-visible,
        input:focus-visible {
          outline: 2px solid #4a9eff;
          outline-offset: 2px;
        }
      `}</style>
    </div>
  );
}

const btnStyle: React.CSSProperties = {
  background: '#1a1a2e',
  color: '#e6e9ee',
  border: '1px solid #2a4a6e',
  borderRadius: 6,
  padding: '6px 10px',
  cursor: 'pointer',
};

const activeBtnStyle: React.CSSProperties = {
  background: '#2a2a4e',
  borderColor: '#4a9eff',
};

