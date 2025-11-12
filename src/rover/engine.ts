/**
 * Core Mars Rover simulation engine.
 * Uses numerical direction encoding (0=N, 1=E, 2=S, 3=W) for efficient rotation.
 */

import type { Direction, RoverState, Plateau } from './types';

// Direction encoding: 0=N, 1=E, 2=S, 3=W
const DIRECTIONS: readonly Direction[] = ['N', 'E', 'S', 'W'] as const;

// Map direction to numerical encoding
const DIR_TO_NUM: Record<Direction, number> = { N: 0, E: 1, S: 2, W: 3 };

// Movement deltas for each direction: [dx, dy]
const DELTAS: ReadonlyArray<readonly [number, number]> = [
  [0, 1],  // N: +y
  [1, 0],  // E: +x
  [0, -1], // S: -y
  [-1, 0], // W: -x
];

/**
 * Executes a sequence of commands on a rover.
 * Commands are processed in order; invalid moves (out of bounds) are ignored.
 */
export function executeCommands(
  start: RoverState,
  commands: string,
  plateau: Plateau
): RoverState {
  let x = start.position.x;
  let y = start.position.y;
  let dirNum = DIR_TO_NUM[start.direction];

  for (let i = 0; i < commands.length; i++) {
    const cmd = commands[i];

    if (cmd === 'L') {
      // Turn left: decrement direction (mod 4)
      dirNum = (dirNum + 3) % 4;
    } else if (cmd === 'R') {
      // Turn right: increment direction (mod 4)
      dirNum = (dirNum + 1) % 4;
    } else if (cmd === 'M') {
      // Move forward in current direction
      const [dx, dy] = DELTAS[dirNum];
      const newX = x + dx;
      const newY = y + dy;

      // Only move if within plateau bounds
      if (newX >= 0 && newX <= plateau.maxX && newY >= 0 && newY <= plateau.maxY) {
        x = newX;
        y = newY;
      }
      // Otherwise, ignore the move (rover stays in place)
    }
  }

  return {
    position: { x, y },
    direction: DIRECTIONS[dirNum],
  };
}

