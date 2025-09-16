/**
 * Audio manager with user gesture unlock and volume controls
 */

export interface AudioSettings {
  volume: number; // 0.0 to 1.0
  muted: boolean;
}

export class AudioManager {
  private audioContext: AudioContext | null = null;
  private gainNode: GainNode | null = null;
  private isUnlocked = false;
  private settings: AudioSettings = { volume: 0.7, muted: false };

  constructor() {
    this.loadSettings();
  }

  private loadSettings(): void {
    if (typeof window === 'undefined' || !window.localStorage) return;
    
    const stored = window.localStorage.getItem('r3f-tetris-audio');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        this.settings = { ...this.settings, ...parsed };
      } catch (e) {
        // Invalid stored data, use defaults
      }
    }
  }

  private saveSettings(): void {
    if (typeof window === 'undefined' || !window.localStorage) return;
    window.localStorage.setItem('r3f-tetris-audio', JSON.stringify(this.settings));
  }

  async unlock(): Promise<boolean> {
    if (this.isUnlocked) return true;

    try {
      // Create audio context
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      
      // Resume context (required for user gesture)
      if (this.audioContext.state === 'suspended') {
        await this.audioContext.resume();
      }

      // Create gain node for volume control
      this.gainNode = this.audioContext.createGain();
      this.gainNode.connect(this.audioContext.destination);
      this.gainNode.gain.value = this.settings.muted ? 0 : this.settings.volume;

      this.isUnlocked = true;
      return true;
    } catch (error) {
      console.warn('Failed to unlock audio context:', error);
      return false;
    }
  }

  playSound(frequency: number, duration: number = 0.1, type: OscillatorType = 'sine'): void {
    if (!this.isUnlocked || !this.audioContext || !this.gainNode || this.settings.muted) {
      return;
    }

    try {
      const oscillator = this.audioContext.createOscillator();
      const envelope = this.audioContext.createGain();

      oscillator.connect(envelope);
      envelope.connect(this.gainNode);

      oscillator.frequency.value = frequency;
      oscillator.type = type;

      // Simple envelope for click-free sound
      envelope.gain.setValueAtTime(0, this.audioContext.currentTime);
      envelope.gain.linearRampToValueAtTime(0.3, this.audioContext.currentTime + 0.01);
      envelope.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + duration);

      oscillator.start(this.audioContext.currentTime);
      oscillator.stop(this.audioContext.currentTime + duration);
    } catch (error) {
      console.warn('Failed to play sound:', error);
    }
  }

  setVolume(volume: number): void {
    this.settings.volume = Math.max(0, Math.min(1, volume));
    this.saveSettings();
    
    if (this.gainNode && !this.settings.muted) {
      this.gainNode.gain.value = this.settings.volume;
    }
  }

  setMuted(muted: boolean): void {
    this.settings.muted = muted;
    this.saveSettings();
    
    if (this.gainNode) {
      this.gainNode.gain.value = muted ? 0 : this.settings.volume;
    }
  }

  getVolume(): number {
    return this.settings.volume;
  }

  getMuted(): boolean {
    return this.settings.muted;
  }

  isAudioUnlocked(): boolean {
    return this.isUnlocked;
  }

  // Predefined sound effects
  playMove(): void {
    this.playSound(220, 0.05, 'square');
  }

  playRotate(): void {
    this.playSound(330, 0.08, 'sine');
  }

  playDrop(): void {
    this.playSound(440, 0.1, 'triangle');
  }

  playLineClear(lines: number): void {
    // Ascending arpeggio for line clears
    const baseFreq = 220;
    const notes = [baseFreq, baseFreq * 1.25, baseFreq * 1.5, baseFreq * 1.75];
    
    for (let i = 0; i < Math.min(lines, 4); i++) {
      setTimeout(() => {
        this.playSound(notes[i], 0.15, 'sine');
      }, i * 50);
    }
  }

  playTetris(): void {
    // Special sound for 4-line clear (Tetris)
    const melody = [440, 554, 659, 880];
    melody.forEach((freq, i) => {
      setTimeout(() => {
        this.playSound(freq, 0.2, 'sine');
      }, i * 100);
    });
  }

  playGameOver(): void {
    // Descending chromatic scale
    const frequencies = [440, 415, 392, 370, 349, 330, 311, 294];
    frequencies.forEach((freq, i) => {
      setTimeout(() => {
        this.playSound(freq, 0.3, 'sawtooth');
      }, i * 150);
    });
  }

  playPause(): void {
    this.playSound(330, 0.1, 'square');
  }

  playResume(): void {
    this.playSound(440, 0.1, 'square');
  }
}

// Singleton instance
export const audioManager = new AudioManager();