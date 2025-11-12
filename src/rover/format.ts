/**
 * Output formatter for Mars Rover simulation.
 */

import type { RoverState } from './types';

/**
 * Formats an array of rover final states into the output string.
 * Each rover is formatted as "x y D" on a separate line.
 */
export function formatOutput(states: RoverState[]): string {
  return states
    .map((state) => `${state.position.x} ${state.position.y} ${state.direction}`)
    .join('\n');
}


