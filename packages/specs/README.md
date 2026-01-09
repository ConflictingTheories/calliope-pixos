# PixoSpritz Shared Specifications

This package contains shared specifications, schemas, and constants used by both the JavaScript (WebGL) and C (OpenGL) engines to ensure consistency across the entire PixoSpritz ecosystem.

## Purpose

- **Single Source of Truth**: Define math operations, file formats, and constants in one place
- **Cross-Engine Parity**: Guarantee identical behavior between JS and C implementations
- **Validation**: Provide JSON schemas for validating game assets and save files
- **Code Generation**: Specs can be used to generate C headers and TypeScript types

## Directory Structure

```
packages/specs/
├── index.js              # Main entry point with exports and validators
├── package.json          # Package configuration
├── README.md             # This file
├── math/                 # Math operation specifications
│   ├── vector.spec.json  # Vector operations (Vec2, Vec3, Vec4)
│   ├── matrix.spec.json  # Matrix operations (Mat4, Mat3)
│   └── camera.spec.json  # Camera system parameters and operations
├── formats/              # File format schemas
│   ├── save.schema.json  # .pxsave save file format
│   ├── sprite.schema.json # Sprite definition format
│   ├── map.schema.json   # Map/zone definition format
│   └── manifest.schema.json # Game package manifest format
├── constants/            # Shared constant values
│   ├── directions.json   # 8-directional movement constants
│   ├── events.json       # Event type identifiers
│   └── shader-types.json # Shader type configurations
└── shaders/              # Shared GLSL code
    └── common/
        ├── lighting.glsl # Lighting calculations
        └── transforms.glsl # Vertex transformations
```

## Usage

### JavaScript (Core Engine)

```javascript
import { math, formats, constants, validateSave } from 'pixospritz-specs';

// Access specifications
const vectorOps = math.vector.operations.Vector3;
const saveSchema = formats.save;
const directions = constants.directions;

// Validate data
const result = validateSave(saveData);
if (!result.valid) {
  console.error('Invalid save:', result.errors);
}
```

### Direct JSON Import

```javascript
// Import specific schema
import saveSchema from 'pixospritz-specs/formats/save.schema.json';

// Import constants
import directions from 'pixospritz-specs/constants/directions.json';
```

### C Engine

The specifications can be used to generate C headers:

```c
// Generated from vector.spec.json
#include "pixospritz_vector.h"

vec3 vec3_add(vec3 a, vec3 b);
vec3 vec3_sub(vec3 a, vec3 b);
vec3 vec3_scale(vec3 v, float s);
float vec3_dot(vec3 a, vec3 b);
vec3 vec3_cross(vec3 a, vec3 b);
float vec3_length(vec3 v);
vec3 vec3_normalize(vec3 v);
```

## Math Specifications

### Vector Operations

| Operation | Signature | Description |
|-----------|-----------|-------------|
| `add` | `(a, b) -> Vector3` | Component-wise addition |
| `sub` | `(a, b) -> Vector3` | Component-wise subtraction |
| `scale` | `(v, s) -> Vector3` | Scalar multiplication |
| `dot` | `(a, b) -> number` | Dot product |
| `cross` | `(a, b) -> Vector3` | Cross product |
| `length` | `(v) -> number` | Vector magnitude |
| `normalize` | `(v) -> Vector3` | Unit vector |
| `distance` | `(a, b) -> number` | Euclidean distance |
| `lerp` | `(a, b, t) -> Vector3` | Linear interpolation |

### Matrix Operations

| Operation | Signature | Description |
|-----------|-----------|-------------|
| `identity` | `() -> Matrix4` | Identity matrix |
| `multiply` | `(a, b) -> Matrix4` | Matrix multiplication |
| `translate` | `(m, v) -> Matrix4` | Apply translation |
| `rotate` | `(m, angle, axis) -> Matrix4` | Rotation around axis |
| `scale` | `(m, v) -> Matrix4` | Apply scaling |
| `perspective` | `(fov, aspect, near, far) -> Matrix4` | Perspective projection |
| `lookAt` | `(eye, target, up) -> Matrix4` | View matrix |

### Camera System

- Orbital camera with `yaw`, `pitch`, `distance`
- Automatic position calculation from angles
- Pitch clamping to prevent gimbal lock
- Follow, pan, and zoom operations

## File Format Schemas

### Save File (.pxsave)

```json
{
  "version": "1.0.0",
  "format": "pxsave",
  "gameId": "my-game",
  "timestamp": "2026-01-08T12:00:00Z",
  "player": {
    "zone": "village",
    "position": [8.5, 0, 12.3],
    "inventory": [{ "id": "sword", "quantity": 1 }]
  },
  "flags": {
    "quest_started": true
  },
  "portable": {
    "items": [],
    "compatibleGames": ["sequel-game"]
  }
}
```

### Sprite Definition

```json
{
  "type": "avatar",
  "src": "hero.png",
  "sheetSize": [96, 192],
  "tileSize": [24, 48],
  "frames": {
    "N": [[0, 0], [24, 0]],
    "S": [[0, 48], [24, 48]]
  },
  "billboard": true
}
```

### Map Definition

```json
{
  "tileset": "village",
  "bounds": [0, 0, 20, 20],
  "layers": [
    { "id": "ground", "type": "tile" },
    { "id": "objects", "type": "object" }
  ],
  "lights": [
    { "id": "sun", "type": "directional", "pos": [0, 10, 0] }
  ]
}
```

## Constants

### Directions

8-directional movement with indices, angles, and vectors:

```javascript
{
  "N":  { "index": 0, "angle": 0,      "vector": [0, -1] },
  "NE": { "index": 1, "angle": 0.7854, "vector": [1, -1] },
  "E":  { "index": 2, "angle": 1.5708, "vector": [1, 0] },
  // ...
}
```

### Events

Categorized event types for the event system:

- `engine`: Lifecycle events (init, start, stop, pause)
- `input`: User input (keyboard, mouse, touch, gamepad)
- `scene`: Zone/world management
- `entity`: Entity lifecycle and interactions
- `audio`: Audio playback events
- `network`: Multiplayer events
- `ui`: Menu, dialog, HUD events
- `save`: Persistence events

### Shader Types

Shader configurations by category:

- `core`: Sprite, tile, model, billboard
- `effect`: Blur, bloom, CRT, vignette
- `transition`: Fade, dissolve, wipe, iris
- `skybox`: Gradient, stars, cosmic, neon
- `particle`: Point, quad, additive, trail

## Shared GLSL

### Lighting (`shaders/common/lighting.glsl`)

- Point, directional, spot light support
- Attenuation calculations
- Diffuse (Lambert) and specular (Blinn-Phong)
- Fresnel rim lighting
- Ambient occlusion approximation

### Transforms (`shaders/common/transforms.glsl`)

- Billboard matrix generation
- Isometric projection
- Screen-to-world raycasting
- UV transformations for sprite sheets
- Parallax offset

## Validation

The package includes simple validators for all format schemas:

```javascript
import { validateSave, validateSprite, validateMap, validateManifest } from 'pixospritz-specs';

// Returns { valid: boolean, errors: string[] }
const result = validateSave(mySaveData);
```

## Integration

### Adding to package.json

```json
{
  "dependencies": {
    "pixospritz-specs": "*"
  }
}
```

### Updating Specifications

When modifying specifications:

1. Update the JSON schema/spec file
2. Update both JS and C implementations to match
3. Add/update tests to verify parity
4. Update this README if needed

## License

MIT
