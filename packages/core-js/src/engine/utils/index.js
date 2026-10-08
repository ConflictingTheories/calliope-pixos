import { Vector, Vector4 } from './math/vector.js';

/**
 * Clamps a value between a minimum and maximum value.
 * @param {number} value - The value to clamp.
 * @param {number} min - The minimum allowed value.
 * @param {number} max - The maximum allowed value.
 * @returns {number} The clamped value.
 */
export const clamp = (value, min, max) => {
  return Math.max(min, Math.min(value, max));
};

/**
 * Utility functions and common exports for the Pixos Game Engine.
 */
export default {
  Vector,
  Vector4,
  clamp,
};
