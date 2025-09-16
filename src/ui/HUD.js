import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useGameStore } from '../game/store';
export default function HUD() {
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
    return (_jsxs("div", { style: { position: 'absolute', top: 12, left: 12, color: '#e6e9ee', font: '14px/1.2 system-ui, sans-serif' }, children: [_jsxs("div", { style: { display: 'grid', gap: 6 }, children: [_jsxs("div", { children: ["Score: ", _jsx("strong", { children: score })] }), _jsxs("div", { children: ["Level: ", _jsx("strong", { children: level })] }), _jsxs("div", { children: ["Lines: ", _jsx("strong", { children: lines })] }), _jsxs("div", { children: ["Hold: ", _jsx("strong", { children: hold ?? '-' })] }), _jsxs("div", { children: ["Next: ", _jsx("strong", { children: nextQueue.slice(0, 5).join(' ') })] }), _jsxs("div", { style: { display: 'flex', gap: 8, marginTop: 6 }, children: [_jsx("button", { onClick: () => (paused ? resume() : pause()), style: btnStyle, className: "focus-visible", children: paused ? 'Resume' : 'Pause' }), _jsx("button", { onClick: () => restart(), style: btnStyle, className: "focus-visible", children: "Restart" })] }), _jsxs("div", { style: { display: 'flex', gap: 4, marginTop: 6 }, children: [_jsx("button", { onClick: () => setQuality('low'), style: { ...btnStyle, ...(quality === 'low' ? activeBtnStyle : {}) }, className: "focus-visible", children: "Low" }), _jsx("button", { onClick: () => setQuality('medium'), style: { ...btnStyle, ...(quality === 'medium' ? activeBtnStyle : {}) }, className: "focus-visible", children: "Med" }), _jsx("button", { onClick: () => setQuality('high'), style: { ...btnStyle, ...(quality === 'high' ? activeBtnStyle : {}) }, className: "focus-visible", children: "High" })] }), _jsx("div", { style: { opacity: 0.8, marginTop: 6 }, children: "\u2190/\u2192 move, \u2193 soft, \u2191/Z rotate, Space hard, C hold" })] }), _jsx("style", { children: `:focus-visible{outline:2px solid #80b5ff; outline-offset:2px}` })] }));
}
const btnStyle = {
    background: '#1a222d',
    color: '#e6e9ee',
    border: '1px solid #2c3a4a',
    borderRadius: 6,
    padding: '6px 10px',
    cursor: 'pointer',
};
const activeBtnStyle = {
    background: '#2d3748',
    borderColor: '#4a5568',
};
