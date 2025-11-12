# Mars Rover Simulation

[![Tests](https://github.com/magyargergo/mars-rover/actions/workflows/test.yml/badge.svg)](https://github.com/magyargergo/mars-rover/actions/workflows/test.yml)
[![Build](https://github.com/magyargergo/mars-rover/actions/workflows/build.yml/badge.svg)](https://github.com/magyargergo/mars-rover/actions/workflows/build.yml)
[![Lint](https://github.com/magyargergo/mars-rover/actions/workflows/lint.yml/badge.svg)](https://github.com/magyargergo/mars-rover/actions/workflows/lint.yml)

A clean, minimal implementation of the classic Mars Rover kata in Next.js with TypeScript.

## Project Structure

```
mars-rover/
├── app/
│   ├── favicon.ico
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx                    # Main UI component
├── lib/
│   └── rover/
│       ├── __tests__/
│       │   ├── engine.test.ts      # Movement and rotation tests
│       │   ├── parser.test.ts      # Input parsing tests
│       │   ├── format.test.ts      # Output formatting tests
│       │   └── integration.test.ts # End-to-end tests
│       ├── types.ts                # Type definitions
│       ├── engine.ts               # Core simulation logic
│       ├── parser.ts               # Input parsing & validation
│       └── format.ts               # Output formatting
├── vitest.config.ts                # Vitest configuration
├── package.json
├── tsconfig.json
└── README.md
```

## Features

- **Pure domain logic**: All rover logic is framework-agnostic and located in `src/rover/`
- **Strict TypeScript**: Full type safety with strict mode enabled
- **Comprehensive tests**: Unit tests for all core functionality plus integration tests
- **Simple UI**: Clean Next.js interface with textarea input and output display
- **Proper error handling**: Descriptive error messages for invalid input

## Problem Description

The Mars Rover kata simulates rovers exploring a rectangular plateau on Mars.

**Input Format:**
```
5 5           # Plateau upper-right coordinates (lower-left is 0,0)
1 2 N         # Rover 1: starting position (x, y) and heading (N/E/S/W)
LMLMLMLMM     # Rover 1: commands (L=turn left, R=turn right, M=move forward)
3 3 E         # Rover 2: starting position and heading
MMRMMRMRRM    # Rover 2: commands
```

**Rules:**
- Rovers are processed sequentially in the order given
- `L` and `R` rotate the rover 90° left or right (in place)
- `M` moves the rover one grid unit forward in its current direction
- If a move would go out of bounds, it's ignored (rover stays in place)
- Plateau bounds: `0 <= x <= maxX`, `0 <= y <= maxY`

**Output Format:**
```
1 3 N         # Rover 1: final position and heading
5 1 E         # Rover 2: final position and heading
```

## Setup Instructions

### 1. Install Dependencies

```bash
pnpm install
```

(If you don't have pnpm, you can use `npm install` or `yarn install`)

### 2. Run Development Server

```bash
pnpm dev
```

The application will be available at [http://localhost:3000](http://localhost:3000)

### 3. Run Tests

Run all tests once:
```bash
pnpm test
```

Run tests in watch mode (re-runs on file changes):
```bash
pnpm test:watch
```

Run tests with UI:
```bash
pnpm dlx vitest --ui
```

Run tests with coverage:
```bash
pnpm test:coverage
```

### 4. Build for Production

```bash
pnpm build
pnpm start
```

## Implementation Details

### Architecture

The solution follows a clean architecture pattern:

1. **Domain Layer** (`src/rover/`):
   - Pure TypeScript with no React dependencies
   - Fully testable in isolation
   - Can be reused in Node.js, browser, or API routes

2. **Presentation Layer** (`app/page.tsx`):
   - React client component
   - Handles user input and displays results
   - Catches and displays errors from domain layer

### Key Design Decisions

1. **Numerical Direction Encoding**: Directions are internally represented as `0=N, 1=E, 2=S, 3=W` for efficient rotation using modulo arithmetic.

2. **Lookup Tables**: Movement deltas and rotations use pre-computed lookup tables for performance.

3. **Fail-Fast Validation**: The parser throws descriptive errors immediately on invalid input, making debugging easier.

4. **Immutable Operations**: The engine returns new state objects rather than mutating input.

5. **Boundary Safety**: Out-of-bounds moves are silently ignored as per the specification, allowing the rover to continue processing subsequent commands.

## Testing

The test suite covers:

- ✅ All rotation combinations (4 left turns, 4 right turns)
- ✅ Movement in all 4 directions
- ✅ Boundary conditions (staying within plateau bounds)
- ✅ Complex command sequences
- ✅ Input parsing with various formats
- ✅ Error handling for invalid input
- ✅ End-to-end sample input/output validation
- ✅ Edge cases (single-cell plateaus, corner scenarios, etc.)
- ✅ Extreme cases (large plateaus, long command strings, many rovers)

Run tests to verify everything works:

```bash
pnpm test
```

Expected output: All 108 tests should pass ✓

## Continuous Integration

This project uses GitHub Actions for automated testing and quality checks:

### Workflows

1. **Tests** (`.github/workflows/test.yml`)
   - Runs on every push and pull request to `main`/`master`
   - Tests against Node.js 18.x and 20.x
   - Generates code coverage reports
   - Badge: Shows test pass/fail status

2. **Build** (`.github/workflows/build.yml`)
   - Verifies the Next.js application builds successfully
   - Uploads build artifacts for review
   - Badge: Shows build status

3. **Lint** (`.github/workflows/lint.yml`)
   - Runs ESLint to check code quality
   - Badge: Shows linting status


## Usage Example

The UI comes pre-filled with the sample input. Click "Run Simulation" to see the output.

You can modify the input to test different scenarios:

```
10 10
0 0 N
MMMMMMMMMMRMMMMMMMMMMRMMMMMMMMMMRMMMMMMMMMM
5 5 E
MMMMM
```

## License

MIT
