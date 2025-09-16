/**
 * Tests for audio system functionality
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { AudioManager } from '../src/audio/AudioManager';

// Mock Web Audio API
const mockAudioContext = {
  state: 'running',
  createGain: vi.fn(() => ({
    connect: vi.fn(),
    gain: { value: 1 }
  })),
  createOscillator: vi.fn(() => ({
    connect: vi.fn(),
    frequency: { value: 440 },
    type: 'sine',
    start: vi.fn(),
    stop: vi.fn()
  })),
  currentTime: 0,
  resume: vi.fn().mockResolvedValue(undefined),
  destination: {}
};

const mockGainNode = {
  connect: vi.fn(),
  gain: { value: 1 }
};

// Mock localStorage
const mockLocalStorage = {
  getItem: vi.fn(),
  setItem: vi.fn()
};

describe('AudioManager', () => {
  let audioManager: AudioManager;

  beforeEach(() => {
    // Reset mocks
    vi.clearAllMocks();
    
    // Mock global objects
    Object.defineProperty(global, 'window', {
      value: {
        AudioContext: vi.fn(() => mockAudioContext),
        webkitAudioContext: vi.fn(() => mockAudioContext),
        localStorage: mockLocalStorage
      },
      writable: true
    });

    audioManager = new AudioManager();
  });

  it('initializes with default settings', () => {
    expect(audioManager.getVolume()).toBe(0.7);
    expect(audioManager.getMuted()).toBe(false);
    expect(audioManager.isAudioUnlocked()).toBe(false);
  });

  it('loads settings from localStorage', () => {
    mockLocalStorage.getItem.mockReturnValue(JSON.stringify({ volume: 0.5, muted: true }));
    
    const newManager = new AudioManager();
    expect(newManager.getVolume()).toBe(0.5);
    expect(newManager.getMuted()).toBe(true);
  });

  it('handles invalid localStorage data gracefully', () => {
    mockLocalStorage.getItem.mockReturnValue('invalid json');
    
    const newManager = new AudioManager();
    expect(newManager.getVolume()).toBe(0.7); // Default value
    expect(newManager.getMuted()).toBe(false); // Default value
  });

  it('unlocks audio context successfully', async () => {
    const result = await audioManager.unlock();
    
    expect(result).toBe(true);
    expect(audioManager.isAudioUnlocked()).toBe(true);
    // Note: resume is only called if context state is 'suspended'
    // In our mock, state is 'running' so resume won't be called
  });

  it('sets volume correctly', () => {
    audioManager.setVolume(0.5);
    expect(audioManager.getVolume()).toBe(0.5);
    expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
      'r3f-tetris-audio',
      JSON.stringify({ volume: 0.5, muted: false })
    );
  });

  it('clamps volume to valid range', () => {
    audioManager.setVolume(-0.5);
    expect(audioManager.getVolume()).toBe(0);
    
    audioManager.setVolume(1.5);
    expect(audioManager.getVolume()).toBe(1);
  });

  it('sets muted state correctly', () => {
    audioManager.setMuted(true);
    expect(audioManager.getMuted()).toBe(true);
    expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
      'r3f-tetris-audio',
      JSON.stringify({ volume: 0.7, muted: true })
    );
  });

  it('does not play sounds when muted', () => {
    audioManager.setMuted(true);
    audioManager.unlock();
    
    // Should not throw or create oscillators when muted
    expect(() => audioManager.playMove()).not.toThrow();
    expect(mockAudioContext.createOscillator).not.toHaveBeenCalled();
  });

  it('does not play sounds when audio is not unlocked', () => {
    // Should not throw or create oscillators when not unlocked
    expect(() => audioManager.playMove()).not.toThrow();
    expect(mockAudioContext.createOscillator).not.toHaveBeenCalled();
  });

  it('plays sounds when unlocked and not muted', async () => {
    await audioManager.unlock();
    audioManager.setMuted(false);
    
    audioManager.playMove();
    expect(mockAudioContext.createOscillator).toHaveBeenCalled();
  });

  it('has predefined sound effects', async () => {
    await audioManager.unlock();
    audioManager.setMuted(false);
    
    // These should not throw
    expect(() => audioManager.playMove()).not.toThrow();
    expect(() => audioManager.playRotate()).not.toThrow();
    expect(() => audioManager.playDrop()).not.toThrow();
    expect(() => audioManager.playLineClear(2)).not.toThrow();
    expect(() => audioManager.playTetris()).not.toThrow();
    expect(() => audioManager.playGameOver()).not.toThrow();
    expect(() => audioManager.playPause()).not.toThrow();
    expect(() => audioManager.playResume()).not.toThrow();
  });

  it('handles audio context creation errors gracefully', async () => {
    // Mock AudioContext to throw
    Object.defineProperty(global, 'window', {
      value: {
        AudioContext: vi.fn(() => { throw new Error('Audio not supported'); }),
        webkitAudioContext: vi.fn(() => { throw new Error('Audio not supported'); }),
        localStorage: mockLocalStorage
      },
      writable: true
    });
    
    const newManager = new AudioManager();
    const result = await newManager.unlock();
    expect(result).toBe(false);
    expect(newManager.isAudioUnlocked()).toBe(false);
  });
});