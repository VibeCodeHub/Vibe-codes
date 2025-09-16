/**
 * Replay system for deterministic game recording and playback
 */
export class ReplayRecorder {
    constructor() {
        Object.defineProperty(this, "inputs", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: []
        });
        Object.defineProperty(this, "startTick", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: 0
        });
        Object.defineProperty(this, "seed", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: 'unknown'
        });
    }
    startRecording(seed) {
        this.inputs = [];
        this.startTick = 0;
        this.seed = seed;
    }
    recordInput(tick, action, data) {
        this.inputs.push({
            t: tick - this.startTick,
            action,
            data,
        });
    }
    export() {
        return {
            seed: this.seed,
            inputs: this.inputs,
            version: '1.0.0',
            timestamp: Date.now(),
        };
    }
    clear() {
        this.inputs = [];
        this.startTick = 0;
        this.seed = 'unknown';
    }
}
export class ReplayPlayer {
    constructor() {
        Object.defineProperty(this, "inputs", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: []
        });
        Object.defineProperty(this, "currentIndex", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: 0
        });
        Object.defineProperty(this, "isPlaying", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: false
        });
        Object.defineProperty(this, "startTick", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: 0
        });
    }
    loadReplay(data) {
        this.inputs = data.inputs;
        this.currentIndex = 0;
        this.isPlaying = false;
        this.startTick = 0;
    }
    startPlayback(startTick) {
        this.startTick = startTick;
        this.currentIndex = 0;
        this.isPlaying = true;
    }
    stopPlayback() {
        this.isPlaying = false;
        this.currentIndex = 0;
    }
    getNextInput(currentTick) {
        if (!this.isPlaying || this.currentIndex >= this.inputs.length) {
            return null;
        }
        const relativeTick = currentTick - this.startTick;
        const nextInput = this.inputs[this.currentIndex];
        if (nextInput.t <= relativeTick) {
            this.currentIndex++;
            return nextInput;
        }
        return null;
    }
    isActive() {
        return this.isPlaying && this.currentIndex < this.inputs.length;
    }
    getProgress() {
        return {
            current: this.currentIndex,
            total: this.inputs.length,
        };
    }
}
// Utility functions for import/export
export function exportReplayToJSON(data) {
    return JSON.stringify(data, null, 2);
}
export function importReplayFromJSON(json) {
    const data = JSON.parse(json);
    // Validate structure
    if (!data.seed || !Array.isArray(data.inputs) || !data.version) {
        throw new Error('Invalid replay data format');
    }
    // Validate inputs
    for (const input of data.inputs) {
        if (typeof input.t !== 'number' || !input.action) {
            throw new Error('Invalid input format');
        }
        // Validate action type
        const validActions = ['move', 'rotate', 'softDrop', 'hardDrop', 'hold', 'pause', 'resume'];
        if (!validActions.includes(input.action)) {
            throw new Error('Invalid input format');
        }
    }
    return data;
}
export function downloadReplay(data, filename) {
    const json = exportReplayToJSON(data);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename || `tetris-replay-${data.timestamp}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}
export async function loadReplayFromFile() {
    return new Promise((resolve, reject) => {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.json';
        input.onchange = (e) => {
            const file = e.target.files?.[0];
            if (!file) {
                reject(new Error('No file selected'));
                return;
            }
            const reader = new FileReader();
            reader.onload = (e) => {
                try {
                    const json = e.target?.result;
                    const data = importReplayFromJSON(json);
                    resolve(data);
                }
                catch (error) {
                    reject(error);
                }
            };
            reader.onerror = () => reject(new Error('Failed to read file'));
            reader.readAsText(file);
        };
        input.click();
    });
}
export async function loadReplayFromClipboard() {
    try {
        const text = await navigator.clipboard.readText();
        return importReplayFromJSON(text);
    }
    catch (error) {
        throw new Error('Failed to read from clipboard');
    }
}
