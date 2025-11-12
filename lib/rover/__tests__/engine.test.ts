import { describe, it, expect } from 'vitest';
import { executeCommands } from '../engine';
import type { RoverState, Plateau } from '../types';

describe('Mars Rover Engine', () => {
  const plateau: Plateau = { maxX: 5, maxY: 5 };

  describe('Rotation', () => {
    it('should turn left from N to W', () => {
      const start: RoverState = { position: { x: 0, y: 0 }, direction: 'N' };
      const result = executeCommands(start, 'L', plateau);
      expect(result.direction).toBe('W');
      expect(result.position).toEqual({ x: 0, y: 0 });
    });

    it('should turn right from N to E', () => {
      const start: RoverState = { position: { x: 0, y: 0 }, direction: 'N' };
      const result = executeCommands(start, 'R', plateau);
      expect(result.direction).toBe('E');
      expect(result.position).toEqual({ x: 0, y: 0 });
    });

    it('should complete a full left rotation cycle', () => {
      const start: RoverState = { position: { x: 2, y: 2 }, direction: 'N' };
      
      let state = executeCommands(start, 'L', plateau);
      expect(state.direction).toBe('W');
      
      state = executeCommands(state, 'L', plateau);
      expect(state.direction).toBe('S');
      
      state = executeCommands(state, 'L', plateau);
      expect(state.direction).toBe('E');
      
      state = executeCommands(state, 'L', plateau);
      expect(state.direction).toBe('N');
    });

    it('should complete a full right rotation cycle', () => {
      const start: RoverState = { position: { x: 2, y: 2 }, direction: 'N' };
      
      let state = executeCommands(start, 'R', plateau);
      expect(state.direction).toBe('E');
      
      state = executeCommands(state, 'R', plateau);
      expect(state.direction).toBe('S');
      
      state = executeCommands(state, 'R', plateau);
      expect(state.direction).toBe('W');
      
      state = executeCommands(state, 'R', plateau);
      expect(state.direction).toBe('N');
    });

    it('should handle multiple rotations in one command string', () => {
      const start: RoverState = { position: { x: 0, y: 0 }, direction: 'N' };
      const result = executeCommands(start, 'LLLL', plateau);
      expect(result.direction).toBe('N');
    });
  });

  describe('Movement', () => {
    it('should move north (increase y)', () => {
      const start: RoverState = { position: { x: 2, y: 2 }, direction: 'N' };
      const result = executeCommands(start, 'M', plateau);
      expect(result.position).toEqual({ x: 2, y: 3 });
      expect(result.direction).toBe('N');
    });

    it('should move east (increase x)', () => {
      const start: RoverState = { position: { x: 2, y: 2 }, direction: 'E' };
      const result = executeCommands(start, 'M', plateau);
      expect(result.position).toEqual({ x: 3, y: 2 });
      expect(result.direction).toBe('E');
    });

    it('should move south (decrease y)', () => {
      const start: RoverState = { position: { x: 2, y: 2 }, direction: 'S' };
      const result = executeCommands(start, 'M', plateau);
      expect(result.position).toEqual({ x: 2, y: 1 });
      expect(result.direction).toBe('S');
    });

    it('should move west (decrease x)', () => {
      const start: RoverState = { position: { x: 2, y: 2 }, direction: 'W' };
      const result = executeCommands(start, 'M', plateau);
      expect(result.position).toEqual({ x: 1, y: 2 });
      expect(result.direction).toBe('W');
    });

    it('should handle multiple moves', () => {
      const start: RoverState = { position: { x: 0, y: 0 }, direction: 'N' };
      const result = executeCommands(start, 'MMM', plateau);
      expect(result.position).toEqual({ x: 0, y: 3 });
    });
  });

  describe('Boundary Handling', () => {
    it('should ignore move that would exceed maxX', () => {
      const start: RoverState = { position: { x: 5, y: 2 }, direction: 'E' };
      const result = executeCommands(start, 'M', plateau);
      expect(result.position).toEqual({ x: 5, y: 2 }); // Stay in place
    });

    it('should ignore move that would exceed maxY', () => {
      const start: RoverState = { position: { x: 2, y: 5 }, direction: 'N' };
      const result = executeCommands(start, 'M', plateau);
      expect(result.position).toEqual({ x: 2, y: 5 }); // Stay in place
    });

    it('should ignore move that would go below 0 on x-axis', () => {
      const start: RoverState = { position: { x: 0, y: 2 }, direction: 'W' };
      const result = executeCommands(start, 'M', plateau);
      expect(result.position).toEqual({ x: 0, y: 2 }); // Stay in place
    });

    it('should ignore move that would go below 0 on y-axis', () => {
      const start: RoverState = { position: { x: 2, y: 0 }, direction: 'S' };
      const result = executeCommands(start, 'M', plateau);
      expect(result.position).toEqual({ x: 2, y: 0 }); // Stay in place
    });

    it('should continue processing commands after ignored move', () => {
      const start: RoverState = { position: { x: 5, y: 2 }, direction: 'E' };
      const result = executeCommands(start, 'MLMM', plateau);
      // M: ignored (would exceed maxX)
      // L: turn to N
      // MM: move north twice
      expect(result.position).toEqual({ x: 5, y: 4 });
      expect(result.direction).toBe('N');
    });
  });

  describe('Complex Sequences', () => {
    it('should execute the first sample rover correctly', () => {
      const start: RoverState = { position: { x: 1, y: 2 }, direction: 'N' };
      const result = executeCommands(start, 'LMLMLMLMM', plateau);
      expect(result.position).toEqual({ x: 1, y: 3 });
      expect(result.direction).toBe('N');
    });

    it('should execute the second sample rover correctly', () => {
      const start: RoverState = { position: { x: 3, y: 3 }, direction: 'E' };
      const result = executeCommands(start, 'MMRMMRMRRM', plateau);
      expect(result.position).toEqual({ x: 5, y: 1 });
      expect(result.direction).toBe('E');
    });
  });

  describe('Edge Cases', () => {
    it('should handle rover starting at bottom-left corner facing south', () => {
      const start: RoverState = { position: { x: 0, y: 0 }, direction: 'S' };
      const result = executeCommands(start, 'MMM', plateau);
      expect(result.position).toEqual({ x: 0, y: 0 }); // All moves ignored
      expect(result.direction).toBe('S');
    });

    it('should handle rover starting at bottom-left corner facing west', () => {
      const start: RoverState = { position: { x: 0, y: 0 }, direction: 'W' };
      const result = executeCommands(start, 'MMMM', plateau);
      expect(result.position).toEqual({ x: 0, y: 0 }); // All moves ignored
      expect(result.direction).toBe('W');
    });

    it('should handle rover starting at top-right corner', () => {
      const start: RoverState = { position: { x: 5, y: 5 }, direction: 'N' };
      const result = executeCommands(start, 'MRM', plateau);
      // M north: ignored, R to E, M east: ignored
      expect(result.position).toEqual({ x: 5, y: 5 });
      expect(result.direction).toBe('E');
    });

    it('should handle empty command string gracefully', () => {
      const start: RoverState = { position: { x: 2, y: 2 }, direction: 'N' };
      const result = executeCommands(start, '', plateau);
      expect(result.position).toEqual({ x: 2, y: 2 });
      expect(result.direction).toBe('N');
    });

    it('should handle rover on single-cell plateau', () => {
      const tinyPlateau: Plateau = { maxX: 0, maxY: 0 };
      const start: RoverState = { position: { x: 0, y: 0 }, direction: 'N' };
      const result = executeCommands(start, 'MMMM', tinyPlateau);
      expect(result.position).toEqual({ x: 0, y: 0 }); // Cannot move anywhere
    });

    it('should handle only rotation commands without movement', () => {
      const start: RoverState = { position: { x: 2, y: 2 }, direction: 'N' };
      const result = executeCommands(start, 'RRRR', plateau);
      expect(result.position).toEqual({ x: 2, y: 2 });
      expect(result.direction).toBe('N'); // Full rotation
    });

    it('should handle only movement commands without rotation', () => {
      const start: RoverState = { position: { x: 0, y: 0 }, direction: 'E' };
      const result = executeCommands(start, 'MMMMM', plateau);
      expect(result.position).toEqual({ x: 5, y: 0 });
      expect(result.direction).toBe('E');
    });

    it('should handle rover bouncing off all four walls', () => {
      const smallPlateau: Plateau = { maxX: 1, maxY: 1 };
      const start: RoverState = { position: { x: 0, y: 0 }, direction: 'N' };
      const result = executeCommands(start, 'MMRMMRMMRMMR', smallPlateau);
      // M (0,1), M ignored, R to E, M (1,1), M ignored, R to S, M (1,0), M ignored, R to W, M (0,0), M ignored, R to N
      expect(result.position).toEqual({ x: 0, y: 0 });
      expect(result.direction).toBe('N');
    });

    it('should handle alternating left and right turns', () => {
      const start: RoverState = { position: { x: 2, y: 2 }, direction: 'N' };
      const result = executeCommands(start, 'LRLRLRLR', plateau);
      expect(result.position).toEqual({ x: 2, y: 2 });
      expect(result.direction).toBe('N'); // Should return to starting direction
    });

    it('should handle rover stuck in corner trying various moves', () => {
      const start: RoverState = { position: { x: 0, y: 0 }, direction: 'S' };
      const result = executeCommands(start, 'MRMRMRMR', plateau);
      // M ignored (S), R to W, M ignored (W), R to N, M (0,1), R to E, M (1,1), R to S
      expect(result.position).toEqual({ x: 1, y: 1 });
      expect(result.direction).toBe('S');
    });
  });

  describe('Extreme Cases', () => {
    it('should handle very long command string efficiently', () => {
      const start: RoverState = { position: { x: 0, y: 0 }, direction: 'N' };
      const longCommands = 'M'.repeat(10000);
      const result = executeCommands(start, longCommands, plateau);
      expect(result.position).toEqual({ x: 0, y: 5 }); // Can only move 5 times
      expect(result.direction).toBe('N');
    });

    it('should handle many rotations efficiently', () => {
      const start: RoverState = { position: { x: 2, y: 2 }, direction: 'N' };
      const manyRotations = 'R'.repeat(1000);
      const result = executeCommands(start, manyRotations, plateau);
      // 1000 % 4 = 0, so back to N
      expect(result.direction).toBe('N');
      expect(result.position).toEqual({ x: 2, y: 2 });
    });

    it('should handle complex pattern with all command types', () => {
      const start: RoverState = { position: { x: 2, y: 2 }, direction: 'N' };
      const pattern = 'MLRMRLMLRM'.repeat(10);
      const result = executeCommands(start, pattern, plateau);
      // Should execute without errors
      expect(result.position.x).toBeGreaterThanOrEqual(0);
      expect(result.position.x).toBeLessThanOrEqual(plateau.maxX);
      expect(result.position.y).toBeGreaterThanOrEqual(0);
      expect(result.position.y).toBeLessThanOrEqual(plateau.maxY);
    });

    it('should handle rover on very large plateau', () => {
      const hugePlateau: Plateau = { maxX: 1000000, maxY: 1000000 };
      const start: RoverState = { position: { x: 500000, y: 500000 }, direction: 'N' };
      const result = executeCommands(start, 'MMMMM', hugePlateau);
      expect(result.position).toEqual({ x: 500000, y: 500005 });
    });

    it('should handle rover walking the entire perimeter of a small plateau', () => {
      const smallPlateau: Plateau = { maxX: 2, maxY: 2 };
      const start: RoverState = { position: { x: 0, y: 0 }, direction: 'N' };
      // Walk perimeter: up, right, right, down, down, left, left
      const result = executeCommands(start, 'MMRMMRMMRMM', smallPlateau);
      expect(result.position).toEqual({ x: 0, y: 0 }); // Back to start
      expect(result.direction).toBe('W');
    });

    it('should handle mixed valid moves and boundary rejections', () => {
      const start: RoverState = { position: { x: 4, y: 4 }, direction: 'N' };
      const result = executeCommands(start, 'MMMRMMMRMMMRMMM', plateau);
      // M (4,5), MM ignored, R to E, M (5,5), MM ignored, R to S, M (5,4), MM ok -> (5,2), R to W, M (4,2), MM ok -> (2,2)
      expect(result.position).toEqual({ x: 2, y: 2 });
      expect(result.direction).toBe('W');
    });

    it('should handle rover spinning in place many times then moving', () => {
      const start: RoverState = { position: { x: 2, y: 2 }, direction: 'N' };
      const spins = 'RRRR'.repeat(100); // 400 spins = back to N
      const result = executeCommands(start, spins + 'MMM', plateau);
      expect(result.position).toEqual({ x: 2, y: 5 });
      expect(result.direction).toBe('N');
    });

    it('should correctly calculate direction after odd number of left turns', () => {
      const start: RoverState = { position: { x: 2, y: 2 }, direction: 'N' };
      const result = executeCommands(start, 'L'.repeat(999), plateau);
      // 999 % 4 = 3, so 3 left turns from N = E
      expect(result.direction).toBe('E');
    });

    it('should handle narrow plateau where rover can only move in one dimension', () => {
      const narrowPlateau: Plateau = { maxX: 10, maxY: 0 };
      const start: RoverState = { position: { x: 5, y: 0 }, direction: 'E' };
      const result = executeCommands(start, 'MMMMMM', narrowPlateau);
      expect(result.position).toEqual({ x: 10, y: 0 }); // Can move 5 more units east
    });

    it('should handle tall plateau where rover can only move vertically', () => {
      const tallPlateau: Plateau = { maxX: 0, maxY: 10 };
      const start: RoverState = { position: { x: 0, y: 5 }, direction: 'N' };
      const result = executeCommands(start, 'MMMMMM', tallPlateau);
      expect(result.position).toEqual({ x: 0, y: 10 }); // Can move 5 more units north
    });
  });
});

