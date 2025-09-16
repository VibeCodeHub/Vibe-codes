/**
 * Replay system for deterministic game recording and playback
 */

export interface ReplayInput {
  t: number; // tick number
  action: 'move' | 'rotate' | 'softDrop' | 'hardDrop' | 'hold' | 'pause' | 'resume';
  data?: number; // for move: dx (-1|1), rotate: dir (-1|1), softDrop: active (0|1)
}

export interface ReplayData {
  seed: string;
  inputs: ReplayInput[];
  version: string;
  timestamp: number;
  score?: number; // final score for verification
  lines?: number; // final lines for verification
}

export class ReplayRecorder {
  private inputs: ReplayInput[] = [];
  private startTick = 0;
  private seed = 'unknown';

  startRecording(seed: string): void {
    this.inputs = [];
    this.startTick = 0;
    this.seed = seed;
  }

  recordInput(tick: number, action: ReplayInput['action'], data?: number): void {
    this.inputs.push({
      t: tick - this.startTick,
      action,
      data,
    });
  }

  export(): ReplayData {
    return {
      seed: this.seed,
      inputs: this.inputs,
      version: '1.0.0',
      timestamp: Date.now(),
    };
  }

  clear(): void {
    this.inputs = [];
    this.startTick = 0;
    this.seed = 'unknown';
  }
}

export class ReplayPlayer {
  private inputs: ReplayInput[] = [];
  private currentIndex = 0;
  private isPlaying = false;
  private startTick = 0;

  loadReplay(data: ReplayData): void {
    this.inputs = data.inputs;
    this.currentIndex = 0;
    this.isPlaying = false;
    this.startTick = 0;
  }

  startPlayback(startTick: number): void {
    this.startTick = startTick;
    this.currentIndex = 0;
    this.isPlaying = true;
  }

  stopPlayback(): void {
    this.isPlaying = false;
    this.currentIndex = 0;
  }

  getNextInput(currentTick: number): ReplayInput | null {
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

  isActive(): boolean {
    return this.isPlaying && this.currentIndex < this.inputs.length;
  }

  getProgress(): { current: number; total: number } {
    return {
      current: this.currentIndex,
      total: this.inputs.length,
    };
  }
}

// Utility functions for import/export
export function exportReplayToJSON(data: ReplayData): string {
  return JSON.stringify(data, null, 2);
}

export function importReplayFromJSON(json: string): ReplayData {
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

export function downloadReplay(data: ReplayData, filename?: string): void {
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

export async function loadReplayFromFile(): Promise<ReplayData> {
  return new Promise((resolve, reject) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) {
        reject(new Error('No file selected'));
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const json = e.target?.result as string;
          const data = importReplayFromJSON(json);
          resolve(data);
        } catch (error) {
          reject(error);
        }
      };
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsText(file);
    };

    input.click();
  });
}

export async function loadReplayFromClipboard(): Promise<ReplayData> {
  try {
    const text = await navigator.clipboard.readText();
    return importReplayFromJSON(text);
  } catch (error) {
    throw new Error('Failed to read from clipboard');
  }
}