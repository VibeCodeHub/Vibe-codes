import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect } from 'react';
import Scene from './scene/Scene';
import BoardMesh from './scene/Board';
import Tetromino from './scene/Tetromino';
import GhostPiece from './scene/GhostPiece';
import BoardFrame from './scene/BoardFrame';
import FloorGrid from './scene/FloorGrid';
import { useGameStore } from './game/store';
import HUD from './ui/HUD';
import TouchControls from './ui/TouchControls';
import DebugHUD from './ui/DebugHUD';
import GlassTuning from './ui/GlassTuning';
function App() {
    const { board, active, tick, move, rotate, softDrop, hardDrop, hold, pause } = useGameStore(s => ({
        board: s.board,
        active: s.active,
        tick: s.tick,
        move: s.move,
        rotate: s.rotate,
        softDrop: s.softDrop,
        hardDrop: s.hardDrop,
        hold: s.hold,
        pause: s.pause,
    }));
    useEffect(() => {
        let raf = 0;
        let last = performance.now();
        const loop = () => {
            const now = performance.now();
            const dt = now - last;
            last = now;
            tick(dt);
            raf = requestAnimationFrame(loop);
        };
        raf = requestAnimationFrame(loop);
        return () => cancelAnimationFrame(raf);
    }, [tick]);
    useEffect(() => {
        const onKey = (e) => {
            if (e.repeat)
                return;
            switch (e.key) {
                case 'ArrowLeft':
                    move(-1);
                    break;
                case 'ArrowRight':
                    move(1);
                    break;
                case 'ArrowUp':
                    rotate(1);
                    break; // CW
                case 'z':
                case 'Z':
                    rotate(-1);
                    break; // CCW
                case ' ':
                    e.preventDefault();
                    hardDrop();
                    break;
                case 'c':
                case 'C':
                    hold();
                    break;
                case 'ArrowDown':
                    softDrop(true);
                    break;
                case 'Escape':
                    pause();
                    break;
            }
        };
        const onKeyUp = (e) => {
            if (e.key === 'ArrowDown')
                softDrop(false);
        };
        window.addEventListener('keydown', onKey);
        window.addEventListener('keyup', onKeyUp);
        return () => {
            window.removeEventListener('keydown', onKey);
            window.removeEventListener('keyup', onKeyUp);
        };
    }, [move, rotate, softDrop, hardDrop, hold, pause]);
    return (_jsxs("div", { style: {
            width: '100vw',
            height: '100vh',
            background: '#0b0e11',
            color: '#e6e9ee',
            overscrollBehavior: 'contain',
            touchAction: 'manipulation',
        }, onTouchMove: (e) => {
            // Prevent iOS page scroll during game interaction
            e.preventDefault();
        }, children: [_jsxs(Scene, { children: [_jsx(FloorGrid, {}), _jsx(BoardFrame, {}), _jsx(BoardMesh, { board: board }), _jsx(Tetromino, { piece: active }), _jsx(GhostPiece, { piece: active })] }), _jsx(HUD, {}), _jsx(TouchControls, {}), _jsx(DebugHUD, {}), _jsx(GlassTuning, {})] }));
}
export default App;
