import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import { useGameStore } from '../game/store';
export default function DebugHUD() {
    const [show, setShow] = useState(false);
    const [perf, setPerf] = useState(null);
    const quality = useGameStore(s => s.quality);
    useEffect(() => {
        const handleKey = (e) => {
            if (e.key === '`' || e.key === '~') {
                e.preventDefault();
                setShow(prev => !prev);
            }
        };
        window.addEventListener('keydown', handleKey);
        return () => window.removeEventListener('keydown', handleKey);
    }, []);
    useEffect(() => {
        if (!show)
            return;
        const interval = setInterval(() => {
            if (window.__perf__) {
                setPerf(window.__perf__);
            }
        }, 100); // Update 10x per second
        return () => clearInterval(interval);
    }, [show]);
    if (!show || !perf)
        return null;
    return (_jsxs("div", { style: {
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
        }, children: [_jsx("div", { style: { marginBottom: 4, fontWeight: 'bold' }, children: "Debug HUD (`)" }), _jsxs("div", { children: ["FPS: ", perf.fps.toFixed(1)] }), _jsxs("div", { children: ["DPR: ", perf.dpr.toFixed(2)] }), _jsxs("div", { children: ["Calls: ", perf.calls] }), _jsxs("div", { children: ["Quality: ", quality] }), _jsxs("div", { children: ["Bloom: ", quality === 'high' ? 'ON' : 'OFF'] }), _jsxs("div", { style: { marginTop: 8, fontSize: 10, opacity: 0.7 }, children: ["History: ", perf.history.length, " changes"] })] }));
}
