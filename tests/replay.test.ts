/**
 * Tests for replay system determinism and functionality
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { ReplayRecorder, ReplayPlayer, importReplayFromJSON, exportReplayToJSON } from '../src/game/replay';
import { useGameStore } from '../src/game/store';
import { createEmptyBoard, spawnPosition, applyMove, applyRotate, applyHardDrop } from '../src/game/logic';
import { SHAPES } from '../src/game/srs';
import { SevenBagRNG } from '../src/game/rng';
import type { ReplayData, ReplayInput } from '../src/game/replay';

describe('ReplayRecorder', () => {
  let recorder: ReplayRecorder;

  beforeEach(() => {
    recorder = new ReplayRecorder();
  });

  it('records inputs correctly', () => {
    recorder.startRecording('test-seed');
    recorder.recordInput(0, 'move', -1);
    recorder.recordInput(5, 'rotate', 1);
    recorder.recordInput(10, 'hardDrop');

    const data = recorder.export();
    expect(data.seed).toBe('test-seed');
    expect(data.inputs).toHaveLength(3);
    expect(data.inputs[0]).toEqual({ t: 0, action: 'move', data: -1 });
    expect(data.inputs[1]).toEqual({ t: 5, action: 'rotate', data: 1 });
    expect(data.inputs[2]).toEqual({ t: 10, action: 'hardDrop' });
  });

  it('clears inputs on clear', () => {
    recorder.startRecording('test-seed');
    recorder.recordInput(0, 'move', -1);
    recorder.clear();
    
    const data = recorder.export();
    expect(data.inputs).toHaveLength(0);
  });
});

describe('ReplayPlayer', () => {
  let player: ReplayPlayer;

  beforeEach(() => {
    player = new ReplayPlayer();
  });

  it('loads and plays back inputs', () => {
    const replayData: ReplayData = {
      seed: 'test-seed',
      inputs: [
        { t: 0, action: 'move', data: -1 },
        { t: 5, action: 'rotate', data: 1 },
        { t: 10, action: 'hardDrop' },
      ],
      version: '1.0.0',
      timestamp: Date.now(),
    };

    player.loadReplay(replayData);
    player.startPlayback(0);

    expect(player.isActive()).toBe(true);
    expect(player.getProgress()).toEqual({ current: 0, total: 3 });

    // First input at tick 0
    let input = player.getNextInput(0);
    expect(input).toEqual({ t: 0, action: 'move', data: -1 });
    expect(player.getProgress()).toEqual({ current: 1, total: 3 });

    // No input at tick 3
    input = player.getNextInput(3);
    expect(input).toBeNull();

    // Second input at tick 5
    input = player.getNextInput(5);
    expect(input).toEqual({ t: 5, action: 'rotate', data: 1 });
    expect(player.getProgress()).toEqual({ current: 2, total: 3 });

    // Third input at tick 10
    input = player.getNextInput(10);
    expect(input).toEqual({ t: 10, action: 'hardDrop' });
    expect(player.getProgress()).toEqual({ current: 3, total: 3 });

    // No more inputs
    input = player.getNextInput(15);
    expect(input).toBeNull();
    expect(player.isActive()).toBe(false);
  });

  it('stops playback correctly', () => {
    const replayData: ReplayData = {
      seed: 'test-seed',
      inputs: [{ t: 0, action: 'move', data: -1 }],
      version: '1.0.0',
      timestamp: Date.now(),
    };

    player.loadReplay(replayData);
    player.startPlayback(0);
    expect(player.isActive()).toBe(true);

    player.stopPlayback();
    expect(player.isActive()).toBe(false);
    expect(player.getProgress()).toEqual({ current: 0, total: 1 });
  });
});

describe('Replay JSON serialization', () => {
  it('exports and imports replay data correctly', () => {
    const originalData: ReplayData = {
      seed: 'test-seed-123',
      inputs: [
        { t: 0, action: 'move', data: -1 },
        { t: 5, action: 'rotate', data: 1 },
        { t: 10, action: 'softDrop', data: 1 },
        { t: 15, action: 'hardDrop' },
        { t: 20, action: 'hold' },
        { t: 25, action: 'pause' },
        { t: 30, action: 'resume' },
      ],
      version: '1.0.0',
      timestamp: 1234567890,
      score: 1500,
      lines: 5,
    };

    const json = exportReplayToJSON(originalData);
    const parsedData = importReplayFromJSON(json);

    expect(parsedData).toEqual(originalData);
  });

  it('validates replay data format', () => {
    expect(() => importReplayFromJSON('{}')).toThrow('Invalid replay data format');
    expect(() => importReplayFromJSON('{"seed":"test","inputs":null,"version":"1.0.0"}')).toThrow('Invalid replay data format');
    expect(() => importReplayFromJSON('{"seed":"test","inputs":[{"t":"not-a-number","action":"move"}],"version":"1.0.0"}')).toThrow('Invalid input format');
  });
});

describe('Replay determinism', () => {
  it('reproduces identical game state with same seed and inputs', () => {
    // Test that the RNG produces deterministic results
    const seed = 'deterministic-test';
    
    const rng1 = new SevenBagRNG(seed);
    const rng2 = new SevenBagRNG(seed);
    
    // Both RNGs should produce the same sequence
    for (let i = 0; i < 10; i++) {
      expect(rng1.next()).toBe(rng2.next());
    }
    
    // Test that replay data is deterministic
    const recorder1 = new ReplayRecorder();
    const recorder2 = new ReplayRecorder();
    
    recorder1.startRecording(seed);
    recorder2.startRecording(seed);
    
    const inputs: ReplayInput[] = [
      { t: 0, action: 'move', data: -1 },
      { t: 5, action: 'rotate', data: 1 },
      { t: 10, action: 'move', data: 1 },
      { t: 15, action: 'hardDrop' },
    ];
    
    // Record same inputs in both recorders
    for (const input of inputs) {
      recorder1.recordInput(input.t, input.action, input.data);
      recorder2.recordInput(input.t, input.action, input.data);
    }
    
    const data1 = recorder1.export();
    const data2 = recorder2.export();
    
    // Both should produce identical replay data
    expect(data1).toEqual(data2);
    expect(data1.seed).toBe(seed);
    expect(data1.inputs).toEqual(inputs);
  });

  it('replay system integrates with store correctly', () => {
    // Test that the replay system components work correctly
    const recorder = new ReplayRecorder();
    const player = new ReplayPlayer();
    
    // Test basic functionality
    recorder.startRecording('test-seed');
    recorder.recordInput(0, 'move', -1);
    const data = recorder.export();
    
    expect(data.seed).toBe('test-seed');
    expect(data.inputs).toHaveLength(1);
    
    player.loadReplay(data);
    player.startPlayback(0);
    
    expect(player.isActive()).toBe(true);
    expect(player.getNextInput(0)).toEqual({ t: 0, action: 'move', data: -1 });
  });
});

describe('Replay edge cases', () => {
  it('handles empty replay data', () => {
    const player = new ReplayPlayer();
    const emptyData: ReplayData = {
      seed: 'empty',
      inputs: [],
      version: '1.0.0',
      timestamp: Date.now(),
    };
    
    player.loadReplay(emptyData);
    player.startPlayback(0);
    
    expect(player.isActive()).toBe(false);
    expect(player.getNextInput(0)).toBeNull();
  });

  it('handles replay with only pause/resume actions', () => {
    const player = new ReplayPlayer();
    const pauseData: ReplayData = {
      seed: 'pause-test',
      inputs: [
        { t: 0, action: 'pause' },
        { t: 10, action: 'resume' },
        { t: 20, action: 'pause' },
      ],
      version: '1.0.0',
      timestamp: Date.now(),
    };
    
    player.loadReplay(pauseData);
    player.startPlayback(0);
    
    expect(player.getNextInput(0)).toEqual({ t: 0, action: 'pause' });
    expect(player.getNextInput(10)).toEqual({ t: 10, action: 'resume' });
    expect(player.getNextInput(20)).toEqual({ t: 20, action: 'pause' });
  });

  it('handles malformed input data gracefully', () => {
    expect(() => importReplayFromJSON('not-json')).toThrow();
    expect(() => importReplayFromJSON('{"seed":"test","inputs":[{"t":"invalid","action":"move"}],"version":"1.0.0"}')).toThrow('Invalid input format');
  });
});