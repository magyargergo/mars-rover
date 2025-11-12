import { describe, it, expect } from 'vitest';
import { formatOutput } from '../format';
import type { RoverState } from '../types';

describe('Mars Rover Format', () => {
  it('should format a single rover state', () => {
    const states: RoverState[] = [
      { position: { x: 1, y: 3 }, direction: 'N' },
    ];

    const result = formatOutput(states);
    expect(result).toBe('1 3 N');
  });

  it('should format multiple rover states', () => {
    const states: RoverState[] = [
      { position: { x: 1, y: 3 }, direction: 'N' },
      { position: { x: 5, y: 1 }, direction: 'E' },
    ];

    const result = formatOutput(states);
    expect(result).toBe('1 3 N\n5 1 E');
  });

  it('should format all directions correctly', () => {
    const states: RoverState[] = [
      { position: { x: 0, y: 0 }, direction: 'N' },
      { position: { x: 1, y: 1 }, direction: 'E' },
      { position: { x: 2, y: 2 }, direction: 'S' },
      { position: { x: 3, y: 3 }, direction: 'W' },
    ];

    const result = formatOutput(states);
    expect(result).toBe('0 0 N\n1 1 E\n2 2 S\n3 3 W');
  });

  it('should format empty array as empty string', () => {
    const result = formatOutput([]);
    expect(result).toBe('');
  });

  describe('Edge Cases', () => {
    it('should format rover at origin', () => {
      const states: RoverState[] = [
        { position: { x: 0, y: 0 }, direction: 'N' },
      ];

      const result = formatOutput(states);
      expect(result).toBe('0 0 N');
    });

    it('should format rover with large coordinates', () => {
      const states: RoverState[] = [
        { position: { x: 999999, y: 888888 }, direction: 'E' },
      ];

      const result = formatOutput(states);
      expect(result).toBe('999999 888888 E');
    });

    it('should format many rovers correctly', () => {
      const states: RoverState[] = [];
      for (let i = 0; i < 100; i++) {
        states.push({
          position: { x: i, y: i * 2 },
          direction: ['N', 'E', 'S', 'W'][i % 4] as 'N' | 'E' | 'S' | 'W',
        });
      }

      const result = formatOutput(states);
      const lines = result.split('\n');
      
      expect(lines).toHaveLength(100);
      expect(lines[0]).toBe('0 0 N');
      expect(lines[99]).toBe('99 198 W');
    });

    it('should maintain exact spacing format', () => {
      const states: RoverState[] = [
        { position: { x: 1, y: 2 }, direction: 'N' },
      ];

      const result = formatOutput(states);
      
      // Verify format is exactly "x y D" with single spaces
      expect(result).toMatch(/^\d+ \d+ [NESW]$/);
    });

    it('should format multiple rovers with consistent newlines', () => {
      const states: RoverState[] = [
        { position: { x: 1, y: 1 }, direction: 'N' },
        { position: { x: 2, y: 2 }, direction: 'E' },
        { position: { x: 3, y: 3 }, direction: 'S' },
      ];

      const result = formatOutput(states);
      
      // Should have exactly 2 newlines for 3 rovers
      expect(result.split('\n')).toHaveLength(3);
      expect(result.endsWith('\n')).toBe(false);
    });

    it('should format rovers with same position but different directions', () => {
      const states: RoverState[] = [
        { position: { x: 5, y: 5 }, direction: 'N' },
        { position: { x: 5, y: 5 }, direction: 'E' },
        { position: { x: 5, y: 5 }, direction: 'S' },
        { position: { x: 5, y: 5 }, direction: 'W' },
      ];

      const result = formatOutput(states);
      expect(result).toBe('5 5 N\n5 5 E\n5 5 S\n5 5 W');
    });
  });

  describe('Extreme Cases', () => {
    it('should efficiently format hundreds of rovers', () => {
      const states: RoverState[] = [];
      for (let i = 0; i < 500; i++) {
        states.push({
          position: { x: i, y: i },
          direction: 'N',
        });
      }

      const result = formatOutput(states);
      const lines = result.split('\n');
      
      expect(lines).toHaveLength(500);
      expect(lines[0]).toBe('0 0 N');
      expect(lines[499]).toBe('499 499 N');
    });

    it('should format rover at maximum safe integer coordinates', () => {
      const states: RoverState[] = [
        { position: { x: 9007199254740991, y: 9007199254740991 }, direction: 'E' },
      ];

      const result = formatOutput(states);
      expect(result).toBe('9007199254740991 9007199254740991 E');
    });

    it('should not add trailing newline to output', () => {
      const states: RoverState[] = [
        { position: { x: 1, y: 2 }, direction: 'N' },
        { position: { x: 3, y: 4 }, direction: 'E' },
      ];

      const result = formatOutput(states);
      expect(result.endsWith('\n')).toBe(false);
      expect(result).toBe('1 2 N\n3 4 E');
    });
  });
});

