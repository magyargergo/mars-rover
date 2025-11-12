/**
 * Core type definitions for the Mars Rover simulation.
 */

export type Direction = 'N' | 'E' | 'S' | 'W';
export type Command = 'L' | 'R' | 'M';

export interface Plateau {
  maxX: number;
  maxY: number;
}

export interface Position {
  x: number;
  y: number;
}

export interface RoverState {
  position: Position;
  direction: Direction;
}

export interface RoverInput {
  start: RoverState;
  commands: string;
}

export interface ParsedInput {
  plateau: Plateau;
  rovers: RoverInput[];
}


