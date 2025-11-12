'use client';

import { useState, useTransition } from 'react';
import { parseInput } from '@/src/rover/parser';
import { executeCommands } from '@/src/rover/engine';
import { formatOutput } from '@/src/rover/format';

const SAMPLE_INPUT = `5 5
1 2 N
LMLMLMLMM
3 3 E
MMRMMRMRRM`;

export default function MarsRoverPage() {
  const [input, setInput] = useState(SAMPLE_INPUT);
  const [output, setOutput] = useState('');
  const [error, setError] = useState('');
  const [isPending, startTransition] = useTransition();

  const handleRunSimulation = () => {
    startTransition(() => {
      try {
        setError('');
        setOutput('');
        
        const parsed = parseInput(input);
        const finalStates = parsed.rovers.map((rover) =>
          executeCommands(rover.start, rover.commands, parsed.plateau)
        );
        const result = formatOutput(finalStates);
        setOutput(result);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An unknown error occurred');
        setOutput('');
      }
    });
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto">
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Mars Rover Simulation</h1>
          <p className="text-gray-900">
            Enter plateau coordinates and rover commands. Format: plateau size,
            then pairs of (position + heading, commands).
          </p>
        </header>

        <div className="mb-6">
          <label htmlFor="input" className="block font-medium text-gray-900 mb-2">
            Input
          </label>
          <textarea
            id="input"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="w-full h-48 p-3 border border-gray-400 rounded font-mono text-sm text-gray-900 bg-white"
          />
        </div>

        <button
          onClick={handleRunSimulation}
          disabled={isPending}
          className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed text-white font-medium py-3 rounded mb-6 transition-colors"
        >
          {isPending ? 'Running Simulation...' : 'Run Simulation'}
        </button>

        {error && (
          <div className="bg-red-50 border border-red-400 rounded p-4 mb-6">
            <h2 className="font-semibold text-red-900 mb-1">Error</h2>
            <p className="text-sm text-red-800">{error}</p>
          </div>
        )}

        {output && (
          <div className="mb-6">
            <label className="block font-medium text-gray-900 mb-2">Output</label>
            <pre className="p-3 bg-white border border-gray-400 rounded font-mono text-sm text-gray-900">
              {output}
            </pre>
          </div>
        )}

        <div className="bg-blue-50 border border-blue-300 rounded p-4">
          <h2 className="font-semibold text-gray-900 mb-2">Input Format</h2>
          <ul className="text-sm text-gray-900 space-y-1">
            <li>• Line 1: Plateau max coordinates (e.g., &quot;5 5&quot;)</li>
            <li>
              • For each rover:
              <ul className="ml-4 mt-1">
                <li>- Position line: &quot;x y Direction&quot; (e.g., &quot;1 2 N&quot;)</li>
                <li>
                  - Commands line: L (left), R (right), M (move) (e.g.,
                  &quot;LMLMLMLMM&quot;)
                </li>
              </ul>
            </li>
            <li>• Directions: N (north), E (east), S (south), W (west)</li>
            <li>• Out-of-bounds moves are ignored; rover stays in place</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
