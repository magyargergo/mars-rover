import { describe, it, expect } from 'vitest';
import { parseInput } from '../parser';

describe('Mars Rover Parser', () => {
  describe('Valid Input', () => {
    it('should parse the sample input correctly', () => {
      const input = `5 5
1 2 N
LMLMLMLMM
3 3 E
MMRMMRMRRM`;

      const result = parseInput(input);

      expect(result.plateau).toEqual({ maxX: 5, maxY: 5 });
      expect(result.rovers).toHaveLength(2);

      expect(result.rovers[0].start).toEqual({
        position: { x: 1, y: 2 },
        direction: 'N',
      });
      expect(result.rovers[0].commands).toBe('LMLMLMLMM');

      expect(result.rovers[1].start).toEqual({
        position: { x: 3, y: 3 },
        direction: 'E',
      });
      expect(result.rovers[1].commands).toBe('MMRMMRMRRM');
    });

    it('should handle extra whitespace', () => {
      const input = `  5   5  
  1  2  N  
  LMLMLMLMM  `;

      const result = parseInput(input);

      expect(result.plateau).toEqual({ maxX: 5, maxY: 5 });
      expect(result.rovers).toHaveLength(1);
      expect(result.rovers[0].start.position).toEqual({ x: 1, y: 2 });
    });

    it('should handle lowercase directions and commands', () => {
      const input = `5 5
1 2 n
lmlm`;

      const result = parseInput(input);

      expect(result.rovers[0].start.direction).toBe('N');
      expect(result.rovers[0].commands).toBe('LMLM');
    });

    it('should parse single rover', () => {
      const input = `10 10
0 0 N
M`;

      const result = parseInput(input);

      expect(result.plateau).toEqual({ maxX: 10, maxY: 10 });
      expect(result.rovers).toHaveLength(1);
      expect(result.rovers[0].commands).toBe('M');
    });
  });

  describe('Invalid Plateau', () => {
    it('should throw on missing plateau line', () => {
      const input = ``;
      expect(() => parseInput(input)).toThrow('empty');
    });

    it('should throw on invalid plateau format', () => {
      const input = `5
1 2 N
M`;
      expect(() => parseInput(input)).toThrow('Invalid plateau line');
    });

    it('should throw on non-integer plateau coordinates', () => {
      const input = `5.5 5
1 2 N
M`;
      expect(() => parseInput(input)).toThrow('not a valid integer');
    });

    it('should throw on negative plateau coordinates', () => {
      const input = `-1 5
1 2 N
M`;
      expect(() => parseInput(input)).toThrow('non-negative');
    });

    it('should throw on non-numeric plateau values', () => {
      const input = `five five
1 2 N
M`;
      expect(() => parseInput(input)).toThrow('not a valid integer');
    });
  });

  describe('Invalid Rover Position', () => {
    it('should throw on invalid position format', () => {
      const input = `5 5
1 2
M`;
      expect(() => parseInput(input)).toThrow('Invalid position line');
    });

    it('should throw on non-integer coordinates', () => {
      const input = `5 5
1.5 2 N
M`;
      expect(() => parseInput(input)).toThrow('not a valid integer');
    });

    it('should throw on invalid direction', () => {
      const input = `5 5
1 2 X
M`;
      expect(() => parseInput(input)).toThrow('Invalid direction');
    });

    it('should throw on position outside plateau (x too large)', () => {
      const input = `5 5
6 2 N
M`;
      expect(() => parseInput(input)).toThrow('outside plateau bounds');
    });

    it('should throw on position outside plateau (y too large)', () => {
      const input = `5 5
2 6 N
M`;
      expect(() => parseInput(input)).toThrow('outside plateau bounds');
    });

    it('should throw on negative starting position', () => {
      const input = `5 5
-1 2 N
M`;
      expect(() => parseInput(input)).toThrow('outside plateau bounds');
    });
  });

  describe('Invalid Commands', () => {
    it('should throw on invalid command characters', () => {
      const input = `5 5
1 2 N
LMXRM`;
      expect(() => parseInput(input)).toThrow('Invalid commands');
    });

    it('should throw on commands with spaces', () => {
      const input = `5 5
1 2 N
L M R M`;
      expect(() => parseInput(input)).toThrow('Invalid commands');
    });

    it('should throw on commands with numbers', () => {
      const input = `5 5
1 2 N
LM3RM`;
      expect(() => parseInput(input)).toThrow('Invalid commands');
    });
  });

  describe('Invalid Format', () => {
    it('should throw on missing rover commands', () => {
      const input = `5 5
1 2 N`;
      expect(() => parseInput(input)).toThrow('at least plateau line');
    });

    it('should throw on odd number of rover lines', () => {
      const input = `5 5
1 2 N
LMLM
3 3 E`;
      expect(() => parseInput(input)).toThrow('exactly 2 lines');
    });
  });

  describe('Edge Cases', () => {
    it('should accept a single-cell plateau (0 0)', () => {
      const input = `0 0
0 0 N
L`;

      const result = parseInput(input);

      expect(result.plateau).toEqual({ maxX: 0, maxY: 0 });
      expect(result.rovers[0].start.position).toEqual({ x: 0, y: 0 });
    });

    it('should accept a one-by-one plateau (1 1)', () => {
      const input = `1 1
0 0 N
M`;

      const result = parseInput(input);

      expect(result.plateau).toEqual({ maxX: 1, maxY: 1 });
    });

    it('should accept rover starting at maximum plateau coordinates', () => {
      const input = `5 5
5 5 N
L`;

      const result = parseInput(input);

      expect(result.rovers[0].start.position).toEqual({ x: 5, y: 5 });
    });

    it('should accept rover starting at top-right corner', () => {
      const input = `10 10
10 10 S
M`;

      const result = parseInput(input);

      expect(result.rovers[0].start.position).toEqual({ x: 10, y: 10 });
      expect(result.rovers[0].start.direction).toBe('S');
    });

    it('should handle input with blank lines between rover data', () => {
      const input = `5 5

1 2 N

LMLM

3 3 E

M`;

      const result = parseInput(input);

      expect(result.rovers).toHaveLength(2);
      expect(result.rovers[0].start.position).toEqual({ x: 1, y: 2 });
      expect(result.rovers[1].start.position).toEqual({ x: 3, y: 3 });
    });

    it('should handle very long command strings', () => {
      const commands = 'L'.repeat(1000);
      const input = `5 5
2 2 N
${commands}`;

      const result = parseInput(input);

      expect(result.rovers[0].commands).toHaveLength(1000);
    });

    it('should handle many rovers on the same plateau', () => {
      let input = '10 10\n';
      for (let i = 0; i < 50; i++) {
        input += `${i % 10} ${Math.floor(i / 10)} N\nM\n`;
      }

      const result = parseInput(input);

      expect(result.rovers).toHaveLength(50);
    });

    it('should accept mixed case commands correctly', () => {
      const input = `5 5
1 2 N
LmRmL`;

      const result = parseInput(input);

      expect(result.rovers[0].commands).toBe('LMRML');
    });
  });

  describe('Extreme Cases', () => {
    it('should handle very large plateau dimensions', () => {
      const input = `999999 999999
0 0 N
M`;

      const result = parseInput(input);

      expect(result.plateau).toEqual({ maxX: 999999, maxY: 999999 });
    });

    it('should handle rover with single command', () => {
      const input = `5 5
2 2 N
L`;

      const result = parseInput(input);

      expect(result.rovers[0].commands).toBe('L');
    });

    it('should throw on whitespace-only command line', () => {
      const input = `5 5
1 2 N
   `;

      expect(() => parseInput(input)).toThrow();
    });

    it('should throw on plateau with only one coordinate', () => {
      const input = `5
1 2 N
M`;

      expect(() => parseInput(input)).toThrow('Invalid plateau line');
    });

    it('should throw on position with extra fields', () => {
      const input = `5 5
1 2 N EXTRA
M`;

      expect(() => parseInput(input)).toThrow('Invalid position line');
    });

    it('should accept decimal-looking integers for rover position', () => {
      const input = `5 5
2.0 2.0 N
M`;

      // JavaScript's Number() converts "2.0" to the integer 2
      // Number.isInteger(2.0) returns true
      const result = parseInput(input);
      
      expect(result.rovers[0].start.position).toEqual({ x: 2, y: 2 });
    });

    it('should handle tab-separated plateau coordinates', () => {
      const input = "5\t5\n1 2 N\nM";

      const result = parseInput(input);

      expect(result.plateau).toEqual({ maxX: 5, maxY: 5 });
    });

    it('should throw on infinity as coordinate', () => {
      const input = `Infinity 5
0 0 N
M`;

      expect(() => parseInput(input)).toThrow('not a valid integer');
    });

    it('should throw on NaN as coordinate', () => {
      const input = `NaN 5
0 0 N
M`;

      expect(() => parseInput(input)).toThrow('not a valid integer');
    });
  });
});

