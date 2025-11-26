# @pixospritz/script

A Lua-inspired scripting language for the PixoSpritz game engine.

## Features

- Lua-compatible syntax parsing
- Custom scope and table implementation
- Operator overloading support
- Built-in library functions

## Installation

```bash
npm install @pixospritz/script
```

## Usage

```javascript
import PixoScript from '@pixospritz/script';

const script = new PixoScript();
const result = script.execute(`
  local x = 10
  local y = 20
  return x + y
`);
```

## Package Structure

```
src/
├── index.ts       # Main entry point
├── parser.ts      # Lua parser
├── Scope.ts       # Variable scope management
├── Table.ts       # Lua table implementation
├── operators.ts   # Operator definitions
├── utils.ts       # Utility functions
└── lib/           # Standard library functions
```
