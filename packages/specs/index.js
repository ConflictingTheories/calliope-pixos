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
  camera: cameraSpec
};

export const formats = {
  save: saveSchema,
  sprite: spriteSchema,
  map: mapSchema,
  manifest: manifestSchema
};

export const constants = {
  directions,
  events,
  shaderTypes
};

// Validation helpers
export function validateSave(data) {
  return validateAgainstSchema(data, saveSchema);
}

export function validateSprite(data) {
  return validateAgainstSchema(data, spriteSchema);
}

export function validateMap(data) {
  return validateAgainstSchema(data, mapSchema);
}

export function validateManifest(data) {
  return validateAgainstSchema(data, manifestSchema);
}

/**
 * Simple JSON Schema validator
 * For production, consider using ajv or similar
 */
function validateAgainstSchema(data, schema) {
  const errors = [];
  
  // Check required fields
  if (schema.required) {
    for (const field of schema.required) {
      if (!(field in data)) {
        errors.push(`Missing required field: ${field}`);
      }
    }
  }
  
  // Check property types
  if (schema.properties) {
    for (const [key, prop] of Object.entries(schema.properties)) {
      if (key in data) {
        const value = data[key];
        const expectedType = prop.type;
        
        if (expectedType === 'array' && !Array.isArray(value)) {
          errors.push(`Field ${key} should be an array`);
        } else if (expectedType === 'object' && (typeof value !== 'object' || Array.isArray(value))) {
          errors.push(`Field ${key} should be an object`);
        } else if (expectedType === 'string' && typeof value !== 'string') {
          errors.push(`Field ${key} should be a string`);
        } else if (expectedType === 'number' && typeof value !== 'number') {
          errors.push(`Field ${key} should be a number`);
        } else if (expectedType === 'integer' && (!Number.isInteger(value))) {
          errors.push(`Field ${key} should be an integer`);
        } else if (expectedType === 'boolean' && typeof value !== 'boolean') {
          errors.push(`Field ${key} should be a boolean`);
        }
      }
    }
  }
  
  return {
    valid: errors.length === 0,
    errors
  };
}

export default {
  math,
  formats,
  constants,
  validateSave,
  validateSprite,
  validateMap,
  validateManifest
};
