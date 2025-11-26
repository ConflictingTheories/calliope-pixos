# @pixospritz/editor

Visual development tools for creating PixoSpritz games.

## Features

- Sprite Editor - Create and edit pixel art sprites
- Tile Editor - Design tilesets with collision data
- Map Editor - Build game maps with layers
- Cutscene Editor - Create scripted cutscenes
- Model Viewer - Preview 3D OBJ models
- Script Editor - Write game scripts with Monaco editor

## Installation

```bash
npm install @pixospritz/editor
```

## Development

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run serve
```

## Package Structure

```
src/
├── app.jsx                # Main application
├── sprite-editor/         # Sprite editing tools
├── tile-editor/           # Tileset editor
├── tileset-editor/        # Tileset management
├── map-editor/            # Map building tools
├── cutscene-tool/         # Cutscene editor
├── geometry-editor/       # Geometry tools
├── script-editor/         # Code editor
├── model-preview/         # 3D model viewer
├── image-preview/         # Image viewer
├── audio-preview/         # Audio player
├── zip-manager/           # Project packaging
└── shared/                # Shared utilities
```

## Dependencies

- `@pixospritz/core` - Core engine
- `@pixospritz/math` - Math utilities
- React 18
- Monaco Editor
- Rsuite UI components
