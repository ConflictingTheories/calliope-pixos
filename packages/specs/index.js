/**
 * PixoSpritz Shared Specifications
 *
 * This package provides shared specifications, schemas, and constants
 * that are used by both the JavaScript (WebGL) and C (OpenGL) engines.
 *
 * This ensures consistency across:
 * - Math operations (vector, matrix, camera)
 * - File formats (saves, sprites, maps, manifests)
 * - Game constants (directions, events, shader types)
 * - Shader code fragments (lighting, transforms)
 */

// Math specifications
import vectorSpec from './math/vector.spec.json' assert { type: 'json' };
import matrixSpec from './math/matrix.spec.json' assert { type: 'json' };
import cameraSpec from './math/camera.spec.json' assert { type: 'json' };

// Format schemas
import saveSchema from './formats/save.schema.json' assert { type: 'json' };
import spriteSchema from './formats/sprite.schema.json' assert { type: 'json' };
import mapSchema from './formats/map.schema.json' assert { type: 'json' };
import manifestSchema from './formats/manifest.schema.json' assert { type: 'json' };

// Constants
import directions from './constants/directions.json' assert { type: 'json' };
import events from './constants/events.json' assert { type: 'json' };
import shaderTypes from './constants/shader-types.json' assert { type: 'json' };

// Export all specifications
export const math = {
  vector: vectorSpec,
  matrix: matrixSpec,
  camera: cameraSpec,
};

export const formats = {
  save: saveSchema,
  sprite: spriteSchema,
  map: mapSchema,
  manifest: manifestSchema,
};

export const constants = {
  directions,
  events,
  shaderTypes,
};

// Validation helpers — P1-03: compiled schema validators with structured
// issue codes ({ code, path, message, severity }). Re-exported here for
// backwards compatibility; prefer importing from './src/validator.js'.
export {
  validateSave,
  validateSprite,
  validateMap,
  validateManifest,
  schemas,
  ISSUE_CODES,
} from './src/validator.js';

export default {
  math,
  formats,
  constants,
  validateSave,
  validateSprite,
  validateMap,
  validateManifest,
};
