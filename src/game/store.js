import create from 'zustand';
import { levelToTickMs } from './constants';
import { SevenBagRNG } from './rng';
import { applyHardDrop, applyMove, applyRotate, applySoftDrop, createEmptyBoard, spawnPosition, stepGravity } from './logic';
import { ReplayRecorder, ReplayPlayer } from './replay';
const DEFAULT_SEED = 'seed';
export const useGameStore = create((set, get) => {
    let rng = new SevenBagRNG(DEFAULT_SEED);
    let softDropping = false;
    let userPaused = false;
    let replayRecorder = new ReplayRecorder();
    let replayPlayer = new ReplayPlayer();
    let currentTick = 0;
    let isRecording = false;
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
        // Handle replay playback
        if (state.isReplaying) {
            const nextInput = replayPlayer.getNextInput(currentTick);
            if (nextInput) {
                executeReplayInput(nextInput);
            }
            // Update replay progress
            const progress = replayPlayer.getProgress();
            set({ replayProgress: progress });
            // Stop replay if finished
            if (!replayPlayer.isActive()) {
                set({ isReplaying: false, paused: true });
                return;
            }
        }
        let acc = state.accumulatorMs + dtMs;
        let current = state;
        const tickMs = state.tickMs;
        while (acc >= tickMs) {
            acc -= tickMs;
            currentTick++;
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
    function executeReplayInput(input) {
        switch (input.action) {
            case 'move':
                if (input.data === -1 || input.data === 1) {
                    set(applyMove(get(), input.data));
                }
                break;
            case 'rotate':
                if (input.data === -1 || input.data === 1) {
                    set(applyRotate(get(), input.data));
                }
                break;
            case 'softDrop':
                softDropping = input.data === 1;
                break;
            case 'hardDrop':
                const before = get();
                const res = applyHardDrop(before);
                set({ ...res.state, score: res.state.score + res.points });
                spawnNext();
                break;
            case 'hold':
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
                break;
            case 'pause':
                set({ paused: true });
                break;
            case 'resume':
                set({ paused: false });
                break;
        }
    }
    function recordInput(action, data) {
        if (isRecording && !get().isReplaying) {
            replayRecorder.recordInput(currentTick, action, data);
        }
    }
    function move(dx) {
        if (get().isReplaying)
            return; // Block input during replay
        recordInput('move', dx);
        set(applyMove(get(), dx));
    }
    function rotate(dir) {
        if (get().isReplaying)
            return; // Block input during replay
        recordInput('rotate', dir);
        set(applyRotate(get(), dir));
    }
    function softDrop(active) {
        if (get().isReplaying)
            return; // Block input during replay
        recordInput('softDrop', active ? 1 : 0);
        softDropping = active;
    }
    function hardDrop() {
        if (get().isReplaying)
            return; // Block input during replay
        recordInput('hardDrop');
        const before = get();
        const res = applyHardDrop(before);
        set({ ...res.state, score: res.state.score + res.points });
        spawnNext();
    }
    function hold() {
        if (get().isReplaying)
            return; // Block input during replay
        recordInput('hold');
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
        if (get().isReplaying)
            return; // Block input during replay
        recordInput('pause');
        userPaused = true;
        set({ paused: true });
    }
    function resume() {
        if (get().isReplaying)
            return; // Block input during replay
        recordInput('resume');
        if (!userPaused)
            set({ paused: false });
    }
    function restart() {
        userPaused = false;
        currentTick = 0;
        replayRecorder.clear();
        replayPlayer.stopPlayback();
        set({ isReplaying: false, replayProgress: { current: 0, total: 0 } });
        start(get().rngSeed);
    }
    // Replay control functions
    function startRecording() {
        if (get().isReplaying)
            return;
        isRecording = true;
        currentTick = 0;
        replayRecorder.startRecording(get().rngSeed);
    }
    function stopRecording() {
        isRecording = false;
    }
    function exportReplay() {
        if (!isRecording && replayRecorder.export().inputs.length === 0) {
            return null;
        }
        const data = replayRecorder.export();
        data.score = get().score;
        data.lines = get().lines;
        return data;
    }
    function loadReplay(data) {
        replayPlayer.loadReplay(data);
        // Reset game state to match replay
        rng = new SevenBagRNG(data.seed);
        start(data.seed);
        currentTick = 0;
    }
    function startReplay() {
        if (!replayPlayer.isActive())
            return;
        replayPlayer.startPlayback(currentTick);
        set({ isReplaying: true, paused: false });
    }
    function stopReplay() {
        replayPlayer.stopPlayback();
        set({ isReplaying: false, paused: true });
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
        // Replay state
        isReplaying: false,
        replayProgress: { current: 0, total: 0 },
        // Replay functions
        startRecording,
        stopRecording,
        exportReplay,
        loadReplay,
        startReplay,
        stopReplay,
    };
});
