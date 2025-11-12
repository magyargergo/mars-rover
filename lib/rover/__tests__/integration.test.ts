import { describe, it, expect } from 'vitest';
import { parseInput } from '../parser';
import { executeCommands } from '../engine';
import { formatOutput } from '../format';

describe('Mars Rover Integration Tests', () => {
  it('should process the complete sample input correctly', () => {
    const input = `5 5
1 2 N
LMLMLMLMM
3 3 E
MMRMMRMRRM`;

    const parsed = parseInput(input);
    
    const finalStates = parsed.rovers.map((rover) =>
      executeCommands(rover.start, rover.commands, parsed.plateau)
    );

    const output = formatOutput(finalStates);

    expect(output).toBe('1 3 N\n5 1 E');
  });

  it('should process rovers sequentially', () => {
    const input = `5 5
0 0 N
MMRMM
0 0 E
MM`;

    const parsed = parseInput(input);
    
    const finalStates = parsed.rovers.map((rover) =>
      executeCommands(rover.start, rover.commands, parsed.plateau)
    );

    const output = formatOutput(finalStates);

    // First rover: start (0,0,N), MM -> (0,2,N), R -> (0,2,E), MM -> (2,2,E)
    // Second rover: start (0,0,E), MM -> (2,0,E)
    expect(output).toBe('2 2 E\n2 0 E');
  });

  it('should handle rover that hits multiple boundaries', () => {
    const input = `2 2
0 0 N
MMMRMMM`;

    const parsed = parseInput(input);
    
    const finalStates = parsed.rovers.map((rover) =>
      executeCommands(rover.start, rover.commands, parsed.plateau)
    );

    const output = formatOutput(finalStates);

    // Start (0,0,N)
    // MMM: move to (0,1), (0,2), ignore 3rd (would be out of bounds) -> (0,2,N)
    // R: turn to E -> (0,2,E)
    // MMM: move to (1,2), (2,2), ignore 3rd (would be out of bounds) -> (2,2,E)
    expect(output).toBe('2 2 E');
  });

  it('should handle empty command string', () => {
    const input = `5 5
3 3 N
`;

    // This should throw because commands line is missing
    expect(() => parseInput(input)).toThrow();
  });

  it('should handle large plateau', () => {
    const input = `100 100
0 0 N
${'M'.repeat(150)}`;

    const parsed = parseInput(input);
    
    const finalStates = parsed.rovers.map((rover) =>
      executeCommands(rover.start, rover.commands, parsed.plateau)
    );

    const output = formatOutput(finalStates);

    // Should move to (0, 100) and ignore the rest (50 moves would be out of bounds)
    expect(output).toBe('0 100 N');
  });

  it('should handle multiple rovers on same plateau', () => {
    const input = `3 3
0 0 N
MMRMM
1 1 E
MLM
2 2 S
MRM`;

    const parsed = parseInput(input);
    
    const finalStates = parsed.rovers.map((rover) =>
      executeCommands(rover.start, rover.commands, parsed.plateau)
    );

    expect(finalStates).toHaveLength(3);
    
    // Note: rovers don't collide in this kata - they pass through each other
    const output = formatOutput(finalStates);
    
    const lines = output.split('\n');
    expect(lines).toHaveLength(3);
  });

  describe('Edge Cases', () => {
    it('should handle single-cell plateau with stationary rover', () => {
      const input = `0 0
0 0 N
MMMM`;

      const parsed = parseInput(input);
      const finalStates = parsed.rovers.map((rover) =>
        executeCommands(rover.start, rover.commands, parsed.plateau)
      );
      const output = formatOutput(finalStates);

      expect(output).toBe('0 0 N'); // Rover cannot move at all
    });

    it('should handle rover that only rotates without moving', () => {
      const input = `5 5
2 2 N
LLLLRRRR`;

      const parsed = parseInput(input);
      const finalStates = parsed.rovers.map((rover) =>
        executeCommands(rover.start, rover.commands, parsed.plateau)
      );
      const output = formatOutput(finalStates);

      expect(output).toBe('2 2 N'); // Back to original direction
    });

    it('should handle rover making a complete square path', () => {
      const input = `5 5
1 1 N
MMRMMRMMRMM`;

      const parsed = parseInput(input);
      const finalStates = parsed.rovers.map((rover) =>
        executeCommands(rover.start, rover.commands, parsed.plateau)
      );
      const output = formatOutput(finalStates);

      // MM north -> (1,3), R to E, MM east -> (3,3), R to S, MM south -> (3,1), R to W, MM west -> (1,1)
      expect(output).toBe('1 1 W'); // Returns to starting position, facing W
    });

    it('should handle all rovers starting from the same position', () => {
      const input = `5 5
2 2 N
MM
2 2 E
MM
2 2 S
MM
2 2 W
MM`;

      const parsed = parseInput(input);
      const finalStates = parsed.rovers.map((rover) =>
        executeCommands(rover.start, rover.commands, parsed.plateau)
      );
      const output = formatOutput(finalStates);

      expect(output).toBe('2 4 N\n4 2 E\n2 0 S\n0 2 W');
    });

    it('should handle rover on narrow horizontal plateau', () => {
      const input = `10 0
0 0 E
MMMMMMMMMM`;

      const parsed = parseInput(input);
      const finalStates = parsed.rovers.map((rover) =>
        executeCommands(rover.start, rover.commands, parsed.plateau)
      );
      const output = formatOutput(finalStates);

      expect(output).toBe('10 0 E');
    });

    it('should handle rover on narrow vertical plateau', () => {
      const input = `0 10
0 0 N
MMMMMMMMMM`;

      const parsed = parseInput(input);
      const finalStates = parsed.rovers.map((rover) =>
        executeCommands(rover.start, rover.commands, parsed.plateau)
      );
      const output = formatOutput(finalStates);

      expect(output).toBe('0 10 N');
    });

    it('should handle rovers that never move from starting positions', () => {
      const input = `5 5
1 1 N
LLLLRRRR
3 3 E
RRRRLLLL`;

      const parsed = parseInput(input);
      const finalStates = parsed.rovers.map((rover) =>
        executeCommands(rover.start, rover.commands, parsed.plateau)
      );
      const output = formatOutput(finalStates);

      expect(output).toBe('1 1 N\n3 3 E');
    });

    it('should handle all rovers ending at the same final position', () => {
      const input = `5 5
0 0 N
MMRMM
0 2 E
MM
2 2 S
L`;

      const parsed = parseInput(input);
      const finalStates = parsed.rovers.map((rover) =>
        executeCommands(rover.start, rover.commands, parsed.plateau)
      );

      expect(finalStates.every(s => s.position.x === 2 && s.position.y === 2)).toBe(true);
    });
  });

  describe('Extreme Cases', () => {
    it('should handle very long simulation with thousands of commands', () => {
      const longCommands = 'MLRMRLMLRMRLMRLM'.repeat(100);
      const input = `50 50
25 25 N
${longCommands}`;

      const parsed = parseInput(input);
      const finalStates = parsed.rovers.map((rover) =>
        executeCommands(rover.start, rover.commands, parsed.plateau)
      );

      expect(finalStates).toHaveLength(1);
      expect(finalStates[0].position.x).toBeGreaterThanOrEqual(0);
      expect(finalStates[0].position.x).toBeLessThanOrEqual(50);
      expect(finalStates[0].position.y).toBeGreaterThanOrEqual(0);
      expect(finalStates[0].position.y).toBeLessThanOrEqual(50);
    });

    it('should process many rovers sequentially without interference', () => {
      let input = '10 10\n';
      for (let i = 0; i < 25; i++) {
        const x = i % 5;
        const y = Math.floor(i / 5);
        input += `${x} ${y} N\nMRMRMRMR\n`;
      }

      const parsed = parseInput(input);
      const finalStates = parsed.rovers.map((rover) =>
        executeCommands(rover.start, rover.commands, parsed.plateau)
      );

      expect(finalStates).toHaveLength(25);
      
      // All should be processed independently
      finalStates.forEach(state => {
        expect(state.position.x).toBeGreaterThanOrEqual(0);
        expect(state.position.x).toBeLessThanOrEqual(10);
      });
    });

    it('should handle massive plateau with minimal commands', () => {
      const input = `1000000 1000000
500000 500000 N
MMMMM`;

      const parsed = parseInput(input);
      const finalStates = parsed.rovers.map((rover) =>
        executeCommands(rover.start, rover.commands, parsed.plateau)
      );
      const output = formatOutput(finalStates);

      expect(output).toBe('500000 500005 N');
    });

    it('should handle rover attempting to escape from all corners', () => {
      const input = `5 5
0 0 S
MMMRMMM
5 5 N
MMMRMMM
0 5 W
MMMLMMM
5 0 E
MMMLMMM`;

      const parsed = parseInput(input);
      const finalStates = parsed.rovers.map((rover) =>
        executeCommands(rover.start, rover.commands, parsed.plateau)
      );

      // All rovers try to escape but are blocked
      expect(finalStates).toHaveLength(4);
      finalStates.forEach(state => {
        expect(state.position.x).toBeGreaterThanOrEqual(0);
        expect(state.position.x).toBeLessThanOrEqual(5);
        expect(state.position.y).toBeGreaterThanOrEqual(0);
        expect(state.position.y).toBeLessThanOrEqual(5);
      });
    });

    it('should handle zigzag pattern across entire plateau', () => {
      const input = `10 10
0 0 E
MMMMMMMMMMRMMLLMMMMMMMMMMRMMLLMMMMMMMMMMRMMLLMMMMMMMMMMRMMLLMMMMMMMMMMRMMLLMMMMMMMMMMRMMLLMMMMMMMMMMRMMLLMMMMMMMMMMRMMLLMMMMMMMMMMRMMLLMMMMMMMMMMRMM`;

      const parsed = parseInput(input);
      const finalStates = parsed.rovers.map((rover) =>
        executeCommands(rover.start, rover.commands, parsed.plateau)
      );

      expect(finalStates).toHaveLength(1);
      expect(finalStates[0].position.x).toBeLessThanOrEqual(10);
      expect(finalStates[0].position.y).toBeLessThanOrEqual(10);
    });

    it('should maintain correctness with alternating rover behaviors', () => {
      const input = `5 5
0 0 N
MMMMMMMMMM
5 5 S
MMMMMMMMMM
0 5 E
MMMMMMMMMM
5 0 W
MMMMMMMMMM`;

      const parsed = parseInput(input);
      const finalStates = parsed.rovers.map((rover) =>
        executeCommands(rover.start, rover.commands, parsed.plateau)
      );
      const output = formatOutput(finalStates);

      // Each rover hits a boundary and stops
      expect(output).toBe('0 5 N\n5 0 S\n5 5 E\n0 0 W');
    });

    it('should handle simulation with complex interleaved patterns', () => {
      const pattern = 'MLMRMMLRMMRLMLRMRLM';
      let input = '20 20\n';
      
      for (let i = 0; i < 10; i++) {
        input += `${i * 2} ${i * 2} N\n${pattern}\n`;
      }

      const parsed = parseInput(input);
      const finalStates = parsed.rovers.map((rover) =>
        executeCommands(rover.start, rover.commands, parsed.plateau)
      );

      expect(finalStates).toHaveLength(10);
      
      // Verify all stayed within bounds
      finalStates.forEach(state => {
        expect(state.position.x).toBeGreaterThanOrEqual(0);
        expect(state.position.x).toBeLessThanOrEqual(20);
        expect(state.position.y).toBeGreaterThanOrEqual(0);
        expect(state.position.y).toBeLessThanOrEqual(20);
      });
    });
  });
});

