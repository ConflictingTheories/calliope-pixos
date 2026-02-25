# pixospritz-console

Web player for running PixoSpritz games.

## Features

- Play PixoSpritz games in the browser
- Load game packages from URLs or local files
- Support for keyboard, mouse, touch, and gamepad input
- Fullscreen mode

## Installation

```bash
npm install pixospritz-console
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

- `pixospritz-core` - Core engine
- `pixoscript` - Scripting engine
- React 17

## Game Loading Modes

The console supports two ways to load games:

1. **Manifest Mode (Default)**: Loads a specific game configuration from a URL.
   - Configure via URL parameter: `?network=true` (loads `manifest.network.json`) or default (loads `manifest.local.json`).
   - The manifest JSON specifies the initial zones and assets to load.
   - Core engine fetches assets relative to the manifest URL.

2. **Zip Mode (Legacy/Development)**: Allows uploading a single `.zip` file containing all game assets.
   - Used when no manifest is provided or when triggering "Load Game File" from the internal menu.
   - The zip must contain a `manifest.json` at root.
