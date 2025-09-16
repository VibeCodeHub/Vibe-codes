import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useRef, useEffect } from 'react';
import { useGameStore } from '../game/store';
export default function TouchControls() {
    const { move, rotate, hardDrop, softDrop } = useGameStore(s => ({
        move: s.move,
        rotate: s.rotate,
        hardDrop: s.hardDrop,
        softDrop: s.softDrop,
    }));
    const [showControls, setShowControls] = useState(false);
    const [isSoftDropping, setIsSoftDropping] = useState(false);
    const softDropTimer = useRef(null);
    const touchStartX = useRef(null);
    const touchStartY = useRef(null);
    // Detect touch device
    useEffect(() => {
        const isTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
        setShowControls(isTouch);
    }, []);
    const handleTouchStart = (e) => {
        const touch = e.touches[0];
        touchStartX.current = touch.clientX;
        touchStartY.current = touch.clientY;
    };
    const handleTouchEnd = (e) => {
        if (!touchStartX.current || !touchStartY.current)
            return;
        const touch = e.changedTouches[0];
        const deltaX = touch.clientX - touchStartX.current;
        const deltaY = touch.clientY - touchStartY.current;
        const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
        // Swipe threshold: horizontal move only, with vertical deadzone
        if (distance > 24) {
            const absX = Math.abs(deltaX);
            const absY = Math.abs(deltaY);
            // Only horizontal swipes (vertical deadzone ±18px)
            if (absX > absY && absY < 18) {
                if (deltaX > 0)
                    move(1);
                else
                    move(-1);
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
    if (!showControls)
        return null;
    return (_jsxs("div", { style: {
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            pointerEvents: 'none',
            zIndex: 10,
        }, onTouchStart: handleTouchStart, onTouchEnd: handleTouchEnd, children: [_jsxs("div", { style: {
                    position: 'absolute',
                    left: 20,
                    bottom: 20,
                    display: 'flex',
                    gap: 10,
                    pointerEvents: 'auto',
                }, children: [_jsx("button", { style: touchButtonStyle, onTouchStart: () => move(-1), className: "focus-visible", children: "\u2190" }), _jsx("button", { style: touchButtonStyle, onTouchStart: () => move(1), className: "focus-visible", children: "\u2192" })] }), _jsxs("div", { style: {
                    position: 'absolute',
                    right: 20,
                    bottom: 20,
                    display: 'flex',
                    gap: 10,
                    pointerEvents: 'auto',
                }, children: [_jsx("button", { style: touchButtonStyle, onTouchStart: () => rotate(-1), className: "focus-visible", children: "\u21BA" }), _jsx("button", { style: touchButtonStyle, onTouchStart: () => rotate(1), className: "focus-visible", children: "\u21BB" })] }), _jsx("div", { style: {
                    position: 'absolute',
                    right: 20,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    pointerEvents: 'auto',
                }, children: _jsx("button", { style: touchButtonStyle, onTouchStart: () => hardDrop(), className: "focus-visible", children: "\u2B07" }) }), _jsx("div", { style: {
                    position: 'absolute',
                    left: '50%',
                    bottom: 20,
                    transform: 'translateX(-50%)',
                    pointerEvents: 'auto',
                }, children: _jsx("button", { style: {
                        ...touchButtonStyle,
                        backgroundColor: isSoftDropping ? '#4a5568' : '#2d3748',
                    }, onTouchStart: handleSoftDropLongPress, onTouchEnd: handleSoftDropEnd, className: "focus-visible", children: isSoftDropping ? '⬇⬇' : '⬇' }) })] }));
}
const touchButtonStyle = {
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
