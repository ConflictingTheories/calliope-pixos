# @pixospritz/console

Web player for running PixoSpritz games.

## Features

- Play PixoSpritz games in the browser
- Load game packages from URLs or local files
- Support for keyboard, mouse, touch, and gamepad input
- Fullscreen mode

## Installation

```bash
npm install @pixospritz/console
```

## Development

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Run tests
npm run test
```

## Package Structure

```
src/
├── App.js         # Main React application
├── index.js       # Entry point
└── ...
public/
├── index.html     # HTML template
└── pixospritz/    # Sample game content
```

## Dependencies

- `@pixospritz/core` - Core engine
- `@pixospritz/script` - Scripting engine
- React 17
