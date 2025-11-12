/**
 * Output formatter for Mars Rover simulation.
 * 
 * Performance characteristics:
 * - O(n) time complexity where n = number of rovers
 * - Uses efficient array map + join (no intermediate string concatenation)
 */

import type { RoverState } from './types';

/**
 * Formats an array of rover final states into the output string.
 * Each rover is formatted as "x y D" on a separate line.
 * 
 * @param states - Array of final rover states
 * @returns Newline-separated output string (no trailing newline)
 * 
 * @example
 * formatOutput([
 *   { position: { x: 1, y: 3 }, direction: 'N' },
 *   { position: { x: 5, y: 1 }, direction: 'E' }
 * ])
 * // Returns: "1 3 N\n5 1 E"
 */
export function formatOutput(states: RoverState[]): string {
  return states
    .map((state) => `${state.position.x} ${state.position.y} ${state.direction}`)
    .join('\n');
}


