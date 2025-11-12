import { describe, it, expect } from 'vitest';
import { executeCommands } from '../engine';
import type { RoverState, Plateau } from '../types';

/**
 * Performance benchmark tests for the Mars Rover engine.
 * These tests ensure the engine performs efficiently with large inputs.
 */
describe('Mars Rover Performance', () => {
  const largePlateau: Plateau = { maxX: 1000000, maxY: 1000000 };

  it('should handle 100k commands in reasonable time', () => {
    const start: RoverState = { position: { x: 500, y: 500 }, direction: 'N' };

    // Create a pattern that exercises all command types
    const pattern = 'MLRMRLMLRMRLMRLM'; // 16 commands
    const commands = pattern.repeat(6250); // 100,000 commands

    const startTime = performance.now();
    const result = executeCommands(start, commands, largePlateau);
    const endTime = performance.now();

    const duration = endTime - startTime;

    // Should complete in under 100ms on modern hardware
    // This is a reasonable sanity check, not a hard requirement
    expect(duration).toBeLessThan(100);

    // Pattern breakdown per iteration: MLRMRLMLRMRLMRLM (16 commands)
    // Starting at (500, 500, N):
    // M → (500, 501, N)
    // L → (500, 501, W), R → (500, 501, N)
    // M → (500, 502, N)
    // R → (500, 502, E), L → (500, 502, N)
    // M → (500, 503, N)
    // L → (500, 503, W), R → (500, 503, N)
    // M → (500, 504, N)
    // R → (500, 504, E), L → (500, 504, N)
    // M → (500, 505, N)
    // R → (500, 505, E), L → (500, 505, N)
    // M → (500, 506, N)
    // Net per iteration: Δx = 0, Δy = +6, ends facing N
    // After 6250 iterations: y = 500 + 6250 * 6 = 38,000
    expect(result.position).toEqual({ x: 500, y: 38000 });
    expect(result.direction).toBe('N');
  });

  it('should handle 1M rotations efficiently', () => {
    const start: RoverState = { position: { x: 500, y: 500 }, direction: 'N' };
    const commands = 'R'.repeat(1000000);

    const startTime = performance.now();
    const result = executeCommands(start, commands, largePlateau);
    const endTime = performance.now();

    const duration = endTime - startTime;

    // 1M rotations should be very fast (under 150ms)
    expect(duration).toBeLessThan(150);

    // 1,000,000 % 4 = 0, so we end back at N
    expect(result.direction).toBe('N');
    expect(result.position).toEqual({ x: 500, y: 500 });
  });

  it('should handle 1M movement attempts efficiently', () => {
    const start: RoverState = { position: { x: 0, y: 0 }, direction: 'N' };
    const smallPlateau: Plateau = { maxX: 5, maxY: 5 };
    const commands = 'M'.repeat(1000000);

    const startTime = performance.now();
    const result = executeCommands(start, commands, smallPlateau);
    const endTime = performance.now();

    const duration = endTime - startTime;

    // Even with 1M commands, should be fast
    expect(duration).toBeLessThan(150);

    // We march north until y = 5, then all further moves are rejected
    expect(result.position).toEqual({ x: 0, y: 5 });
    expect(result.direction).toBe('N');
  });

  it('should handle mixed commands on large plateau efficiently', () => {
    const start: RoverState = { position: { x: 0, y: 0 }, direction: 'N' };
    const plateau: Plateau = { maxX: 10000, maxY: 10000 };

    // Create a complex pattern with all command types
    const pattern = 'MMMMMRMMMMMLMMMMMLMMMMRMMMMMRMMMMM';
    const commands = pattern.repeat(3000); // 34 * 3000 ~ 102k commands

    const startTime = performance.now();
    const result = executeCommands(start, commands, plateau);
    const endTime = performance.now();

    const duration = endTime - startTime;

    // Should complete efficiently
    expect(duration).toBeLessThan(100);

    // Pattern breakdown: MMMMMRMMMMMLMMMMMLMMMMRMMMMMRMMMMM (34 commands)
    // One iteration starting at (0, 0, N):
    // MMMMM → (0, 5, N)    [move north 5 times]
    // R     → (0, 5, E)    [turn right to East]
    // MMMMM → (5, 5, E)    [move east 5 times]
    // L     → (5, 5, N)    [turn left to North]
    // MMMMM → (5, 10, N)   [move north 5 times]
    // L     → (5, 10, W)   [turn left to West]
    // MMMMM → (0, 10, W)   [move west 5 times]
    // R     → (0, 10, N)   [turn right to North]
    // MMMMM → (0, 15, N)   [move north 5 times]
    // R     → (0, 15, E)   [turn right to East]
    // MMMMM → (5, 15, E)   [move east 5 times]
    // This creates a complex spiral pattern. Over 3000 iterations with boundary
    // enforcement, the rover repeatedly traces paths near the origin, occasionally
    // attempting moves below y=0 (which are rejected). The final stable position
    // after 3000 complete iterations is (0, 6, N).
    expect(result.position).toEqual({ x: 0, y: 6 });
    expect(result.direction).toBe('N');
  });

  it('should handle boundary-checking overhead efficiently', () => {
    const start: RoverState = { position: { x: 0, y: 0 }, direction: 'N' };
    const tinyPlateau: Plateau = { maxX: 1, maxY: 1 };

    // Try to move out of bounds constantly
    const commands = 'MMMMRMMMMRMMMMRMMMM'.repeat(5000); // 19 * 5000 ~ 95k commands

    const startTime = performance.now();
    const result = executeCommands(start, commands, tinyPlateau);
    const endTime = performance.now();

    const duration = endTime - startTime;

    // Boundary checks should be fast
    expect(duration).toBeLessThan(100);

    // Pattern breakdown: MMMMRMMMMRMMMMRMMMM (19 commands) on 1×1 plateau
    // This creates a 4-iteration cycle where the rover traces a square:
    //
    // Iteration 1 from (0,0,N):
    //   M    → (0,1,N)     [move north]
    //   MMM  → (0,1,N)     [rejected - can't exceed y=1]
    //   R    → (0,1,E)     [turn to East]
    //   M    → (1,1,E)     [move east]
    //   MMM  → (1,1,E)     [rejected - can't exceed x=1]
    //   R    → (1,1,S)     [turn to South]
    //   M    → (1,0,S)     [move south]
    //   MMM  → (1,0,S)     [rejected - can't go below y=0]
    //   R    → (1,0,W)     [turn to West]
    //   M    → (0,0,W)     [move west]
    //   MMM  → (0,0,W)     [rejected - can't go below x=0]
    //   Result: (0,0,W)
    //
    // The 4-iteration cycle:
    //   Iteration 1 → (0,0,W)
    //   Iteration 2 → (1,0,S)
    //   Iteration 3 → (1,1,E)
    //   Iteration 4 → (0,1,N) ← cycle repeats here
    //
    // 5000 iterations: 5000 % 4 = 0, so we land on cycle position 4: (0,1,N)
    expect(result.position).toEqual({ x: 0, y: 1 });
    expect(result.direction).toBe('N');
  });

  it('should scale linearly with input size', () => {
    const start: RoverState = { position: { x: 500, y: 500 }, direction: 'N' };
    const pattern = 'MLRMRLMLRMRLMRLM'; // 16 commands, net Δy = +6, ends N

    // Test with 10k commands
    const commands10k = pattern.repeat(625); // 16 * 625 = 10,000 commands
    const startTime10k = performance.now();
    const result10k = executeCommands(start, commands10k, largePlateau);
    const duration10k = performance.now() - startTime10k;

    // Test with 100k commands
    const commands100k = pattern.repeat(6250); // 16 * 6250 = 100,000 commands
    const startTime100k = performance.now();
    const result100k = executeCommands(start, commands100k, largePlateau);
    const duration100k = performance.now() - startTime100k;

    // 100k should take roughly 10x as long (with some tolerance for variance)
    // Allow generous range to avoid flakiness
    const ratio = duration100k / duration10k;
    expect(ratio).toBeGreaterThan(5);
    expect(ratio).toBeLessThan(20);

    // Verify exact positions:
    // 10k commands -> 625 iterations -> y = 500 + 625 * 6 = 4250
    expect(result10k.position).toEqual({ x: 500, y: 500 + 625 * 6 });
    expect(result10k.direction).toBe('N');
    // 100k commands -> 6250 iterations -> y = 500 + 6250 * 6 = 38000
    expect(result100k.position).toEqual({ x: 500, y: 500 + 6250 * 6 });
    expect(result100k.direction).toBe('N');
  });

  it('should handle worst-case direction changes efficiently', () => {
    const start: RoverState = { position: { x: 500, y: 500 }, direction: 'N' };

    // Alternate between all commands rapidly
    const commands = 'LRMMLRLMRMLRLMLRMMLRLM'.repeat(5000); // 22 * 5000 ~ 110k commands

    const startTime = performance.now();
    const result = executeCommands(start, commands, largePlateau);
    const endTime = performance.now();

    const duration = endTime - startTime;

    expect(duration).toBeLessThan(100);

    // Pattern breakdown: LRMMLRLMRMLRLMLRMMLRLM (22 commands)
    // This pattern forms a palindromic 2-iteration cycle:
    //
    // Iteration 1 from (500,500,N):
    //   L    → (500,500,W)
    //   R    → (500,500,N)   [cancel out]
    //   MM   → (500,502,N)   [move north twice]
    //   L    → (500,502,W)
    //   R    → (500,502,N)
    //   L    → (500,502,W)   [net: facing West]
    //   M    → (499,502,W)   [move west]
    //   R    → (499,502,N)   [turn to North]
    //   M    → (499,503,N)   [move north]
    //   L    → (499,503,W)
    //   R    → (499,503,N)
    //   L    → (499,503,W)   [net: facing West]
    //   M    → (498,503,W)   [move west]
    //   L    → (498,503,S)   [turn to South]
    //   R    → (498,503,W)   [turn back to West]
    //   MM   → (496,503,W)   [move west twice]
    //   L    → (496,503,S)   [turn to South]
    //   R    → (496,503,W)   [turn back to West]
    //   L    → (496,503,S)   [turn to South]
    //   M    → (496,502,S)   [move south]
    //   Result: (496,502,S) → Net: Δx=-4, Δy=+2, facing S
    //
    // Iteration 2 from (496,502,S):
    //   The pattern reverses the path and returns to (500,500,N)
    //
    // This is a period-2 cycle: every 2 iterations we return to start.
    // 5000 iterations: 5000 % 2 = 0, so we end at (500,500,N)
    expect(result.position).toEqual({ x: 500, y: 500 });
    expect(result.direction).toBe('N');
  });
});
