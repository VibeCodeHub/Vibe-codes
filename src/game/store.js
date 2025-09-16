import create from 'zustand';
import { levelToTickMs } from './constants';
import { SevenBagRNG } from './rng';
import { applyHardDrop, applyMove, applyRotate, applySoftDrop, createEmptyBoard, spawnPosition, stepGravity } from './logic';
const DEFAULT_SEED = 'seed';
export const useGameStore = create((set, get) => {
    let rng = new SevenBagRNG(DEFAULT_SEED);
    let softDropping = false;
    let userPaused = false;
    function spawnNext() {
        const state = get();
        const nextKind = state.nextQueue[0] ?? rng.next();
        const nextQueue = state.nextQueue.length > 0 ? state.nextQueue.slice(1).concat(rng.next()) : [rng.next(), rng.next(), rng.next(), rng.next(), rng.next()];
        const spawn = spawnPosition(nextKind);
        set({ active: { kind: nextKind, rotation: spawn.rotation, x: spawn.x, y: spawn.y }, nextQueue, holdUsed: false });
    }
    function start(seed) {
        rng = new SevenBagRNG(seed ?? DEFAULT_SEED);
        const board = createEmptyBoard();
        const nextQueue = [rng.next(), rng.next(), rng.next(), rng.next(), rng.next()];
        const kind = rng.next();
        const spawn = spawnPosition(kind);
        set({
            board,
            active: { kind, rotation: spawn.rotation, x: spawn.x, y: spawn.y },
            hold: null,
            holdUsed: false,
            nextQueue,
            score: 0,
            level: 0,
            lines: 0,
            tickMs: levelToTickMs(0),
            paused: false,
            rngSeed: seed ?? DEFAULT_SEED,
            rngState: 0,
            accumulatorMs: 0,
            quality: getQualityFromUrl() ?? getQualityFromStorage() ?? 'high',
        });
    }
    function tick(dtMs) {
        const state = get();
        if (state.paused)
            return;
        let acc = state.accumulatorMs + dtMs;
        let current = state;
        const tickMs = state.tickMs;
        while (acc >= tickMs) {
            acc -= tickMs;
            // soft drop attempts
            if (softDropping) {
                const res = applySoftDrop(current);
                current = { ...res.state, score: current.score + res.points };
            }
            else {
                current = stepGravity(current, rng);
                if (!current.active) {
                    // spawn next after lock
                    set(current);
                    spawnNext();
                    current = get();
                }
            }
        }
        set({ ...current, accumulatorMs: acc });
    }
    function move(dx) {
        set(applyMove(get(), dx));
    }
    function rotate(dir) {
        set(applyRotate(get(), dir));
    }
    function softDrop(active) {
        softDropping = active;
    }
    function hardDrop() {
        const before = get();
        const res = applyHardDrop(before);
        set({ ...res.state, score: res.state.score + res.points });
        spawnNext();
    }
    function hold() {
        const state = get();
        if (!state.active || state.holdUsed)
            return;
        const currentKind = state.active.kind;
        if (state.hold) {
            const spawn = spawnPosition(state.hold);
            set({ active: { kind: state.hold, rotation: spawn.rotation, x: spawn.x, y: spawn.y }, hold: currentKind, holdUsed: true });
        }
        else {
            set({ hold: currentKind, holdUsed: true });
            spawnNext();
        }
    }
    function pause() {
        userPaused = true;
        set({ paused: true });
    }
    function resume() {
        if (!userPaused)
            set({ paused: false });
    }
    function restart() {
        userPaused = false;
        start(get().rngSeed);
    }
    function setQuality(quality) {
        set({ quality });
        localStorage.setItem('r3f-tetris-quality', quality);
    }
    function getQualityFromUrl() {
        if (typeof window === 'undefined')
            return null;
        const params = new URLSearchParams(window.location.search);
        const q = params.get('quality');
        return q === 'low' || q === 'medium' || q === 'high' ? q : null;
    }
    function getQualityFromStorage() {
        if (typeof window === 'undefined')
            return null;
        const stored = localStorage.getItem('r3f-tetris-quality');
        return stored === 'low' || stored === 'medium' || stored === 'high' ? stored : null;
    }
    // Pause on window blur; do not auto-resume if user paused manually
    if (typeof window !== 'undefined') {
        window.addEventListener('blur', () => set({ paused: true }));
        window.addEventListener('focus', () => {
            if (!userPaused)
                set({ paused: false });
        });
    }
    // Initialize default state
    start(DEFAULT_SEED);
    return {
        ...get(),
        start,
        tick,
        move,
        rotate,
        softDrop,
        hardDrop,
        hold,
        pause,
        resume,
        restart,
        setQuality,
    };
});
