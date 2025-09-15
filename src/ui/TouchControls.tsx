import React, { useState, useRef, useEffect } from 'react';
import { useGameStore } from '../game/store';

export default function TouchControls(): React.ReactElement | null {
  const { move, rotate, hardDrop, softDrop } = useGameStore(s => ({
    move: s.move,
    rotate: s.rotate,
    hardDrop: s.hardDrop,
    softDrop: s.softDrop,
  }));

  const [showControls, setShowControls] = useState(false);
  const [isSoftDropping, setIsSoftDropping] = useState(false);
  const softDropTimer = useRef<number | null>(null);
  const touchStartX = useRef<number | null>(null);
  const touchStartY = useRef<number | null>(null);

  // Detect touch device
  useEffect(() => {
    const isTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    setShowControls(isTouch);
  }, []);

  const handleTouchStart = (e: React.TouchEvent) => {
    const touch = e.touches[0];
    touchStartX.current = touch.clientX;
    touchStartY.current = touch.clientY;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!touchStartX.current || !touchStartY.current) return;
    
    const touch = e.changedTouches[0];
    const deltaX = touch.clientX - touchStartX.current;
    const deltaY = touch.clientY - touchStartY.current;
    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
    
    // Swipe threshold
    if (distance > 30) {
      if (Math.abs(deltaX) > Math.abs(deltaY)) {
        // Horizontal swipe
        if (deltaX > 0) move(1);
        else move(-1);
      } else {
        // Vertical swipe
        if (deltaY < 0) rotate(1); // swipe up = rotate CW
        else rotate(-1); // swipe down = rotate CCW
      }
    }
    
    touchStartX.current = null;
    touchStartY.current = null;
  };

  const handleSoftDropStart = () => {
    setIsSoftDropping(true);
    softDrop(true);
  };

  const handleSoftDropEnd = () => {
    setIsSoftDropping(false);
    softDrop(false);
    if (softDropTimer.current) {
      clearTimeout(softDropTimer.current);
      softDropTimer.current = null;
    }
  };

  const handleSoftDropLongPress = () => {
    softDropTimer.current = window.setTimeout(() => {
      handleSoftDropStart();
    }, 500); // 500ms long press
  };

  if (!showControls) return null;

  return (
    <div
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        pointerEvents: 'none',
        zIndex: 10,
      }}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* Left/Right buttons */}
      <div
        style={{
          position: 'absolute',
          left: 20,
          bottom: 20,
          display: 'flex',
          gap: 10,
          pointerEvents: 'auto',
        }}
      >
        <button
          style={touchButtonStyle}
          onTouchStart={() => move(-1)}
          className="focus-visible"
        >
          ←
        </button>
        <button
          style={touchButtonStyle}
          onTouchStart={() => move(1)}
          className="focus-visible"
        >
          →
        </button>
      </div>

      {/* Rotate buttons */}
      <div
        style={{
          position: 'absolute',
          right: 20,
          bottom: 20,
          display: 'flex',
          gap: 10,
          pointerEvents: 'auto',
        }}
      >
        <button
          style={touchButtonStyle}
          onTouchStart={() => rotate(-1)}
          className="focus-visible"
        >
          ↺
        </button>
        <button
          style={touchButtonStyle}
          onTouchStart={() => rotate(1)}
          className="focus-visible"
        >
          ↻
        </button>
      </div>

      {/* Hard drop button */}
      <div
        style={{
          position: 'absolute',
          right: 20,
          top: '50%',
          transform: 'translateY(-50%)',
          pointerEvents: 'auto',
        }}
      >
        <button
          style={touchButtonStyle}
          onTouchStart={() => hardDrop()}
          className="focus-visible"
        >
          ⬇
        </button>
      </div>

      {/* Soft drop (long press) */}
      <div
        style={{
          position: 'absolute',
          left: '50%',
          bottom: 20,
          transform: 'translateX(-50%)',
          pointerEvents: 'auto',
        }}
      >
        <button
          style={{
            ...touchButtonStyle,
            backgroundColor: isSoftDropping ? '#4a5568' : '#2d3748',
          }}
          onTouchStart={handleSoftDropLongPress}
          onTouchEnd={handleSoftDropEnd}
          className="focus-visible"
        >
          {isSoftDropping ? '⬇⬇' : '⬇'}
        </button>
      </div>
    </div>
  );
}

const touchButtonStyle: React.CSSProperties = {
  width: 60,
  height: 60,
  borderRadius: 30,
  background: '#2d3748',
  color: '#e6e9ee',
  border: '2px solid #4a5568',
  fontSize: '24px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  cursor: 'pointer',
  userSelect: 'none',
  touchAction: 'manipulation',
};