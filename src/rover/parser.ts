/**
 * Input parser for Mars Rover simulation.
 * Validates input format and throws descriptive errors on invalid input.
 * 
 * Performance characteristics:
 * - O(n) time complexity where n = number of input lines
 * - Single-pass parsing with eager validation
 * - Minimal allocations: only creates necessary data structures
 */

import type { Direction, Plateau, RoverState, ParsedInput } from './types';

const VALID_DIRECTIONS = new Set<string>(['N', 'E', 'S', 'W']);
const VALID_COMMANDS = /^[LRM]+$/;

/**
 * Parses the complete input string.
 * Format:
 *   - Line 1: plateau max coordinates (e.g., "5 5")
 *   - Then pairs of lines per rover:
 *     - Position line: "x y D" (e.g., "1 2 N")
 *     - Commands line: sequence of L/R/M (e.g., "LMLMLMLMM")
 *
 * @param input - Raw input string with newline-separated commands
 * @returns Parsed plateau and rover data
 * @throws Error with descriptive message on invalid input
 */
export function parseInput(input: string): ParsedInput {
  const lines = input
    .trim()
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line.length > 0);

  if (lines.length < 1) {
    throw new Error('Input is empty or contains no valid lines');
  }

  if (lines.length < 3) {
    throw new Error(
      'Input must contain at least plateau line + one rover (position + commands)'
    );
  }

  if ((lines.length - 1) % 2 !== 0) {
    throw new Error(
      'Invalid input format: each rover must have exactly 2 lines (position + commands)'
    );
  }

  // Parse plateau
  const plateau = parsePlateau(lines[0]);

  // Parse rovers
  const rovers: ParsedInput['rovers'] = [];
  for (let i = 1; i < lines.length; i += 2) {
    const positionLine = lines[i];
    const commandsLine = lines[i + 1];

    const start = parsePosition(positionLine, plateau);
    const commands = parseCommands(commandsLine);

    rovers.push({ start, commands });
  }

  return { plateau, rovers };
}

function parsePlateau(line: string): Plateau {
  const parts = line.split(/\s+/);

  if (parts.length !== 2) {
    throw new Error(
      `Invalid plateau line: expected "maxX maxY", got "${line}"`
    );
  }

  const maxX = parseInteger(parts[0], 'plateau maxX');
  const maxY = parseInteger(parts[1], 'plateau maxY');

  if (maxX < 0 || maxY < 0) {
    throw new Error('Plateau coordinates must be non-negative');
  }

  return { maxX, maxY };
}

function parsePosition(line: string, plateau: Plateau): RoverState {
  const parts = line.split(/\s+/);

  if (parts.length !== 3) {
    throw new Error(
      `Invalid position line: expected "x y D", got "${line}"`
    );
  }

  const x = parseInteger(parts[0], 'x coordinate');
  const y = parseInteger(parts[1], 'y coordinate');
  const direction = parts[2].toUpperCase();

  if (!VALID_DIRECTIONS.has(direction)) {
    throw new Error(
      `Invalid direction "${direction}": must be one of N, E, S, W`
    );
  }

  // Validate starting position is within plateau
  if (x < 0 || x > plateau.maxX || y < 0 || y > plateau.maxY) {
    throw new Error(
      `Starting position (${x}, ${y}) is outside plateau bounds (0-${plateau.maxX}, 0-${plateau.maxY})`
    );
  }

  return {
    position: { x, y },
    direction: direction as Direction,
  };
}

function parseCommands(line: string): string {
  const commands = line.toUpperCase();

  if (!VALID_COMMANDS.test(commands)) {
    throw new Error(
      `Invalid commands "${line}": must only contain L, R, or M`
    );
  }

  return commands;
}

function parseInteger(value: string, fieldName: string): number {
  const num = Number(value);

  if (!Number.isInteger(num) || isNaN(num)) {
    throw new Error(
      `Invalid ${fieldName}: "${value}" is not a valid integer`
    );
  }

  return num;
}


