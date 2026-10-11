# pixospritz-math

Math utilities for PixoSpritz - vectors, matrices, and geometric operations.

## Features

- 2D, 3D, and 4D vector classes
- 4x4 matrix operations for 3D graphics
- WebGL-compatible data types

## Installation

```bash
npm install pixospritz-math
```

## Usage

```javascript
import { Vec3, Mat4 } from 'pixospritz-math';

// Create vectors
const position = new Vec3(1, 2, 3);
const direction = new Vec3(0, 0, -1);

// Create transformation matrix
const modelMatrix = Mat4.identity();
modelMatrix.translate(position);
modelMatrix.rotateY(Math.PI / 4);

// Get WebGL-compatible array
const uniformData = modelMatrix.toFloat32Array();
```

## API

### Vector Classes

- `Vec2` - 2D vector (x, y)
- `Vec3` - 3D vector (x, y, z)
- `Vec4` - 4D vector (x, y, z, w)

### Matrix Classes

- `Mat4` - 4x4 matrix with common transformations
