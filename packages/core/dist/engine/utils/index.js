"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = exports.clamp = void 0;
var _vector = require("./math/vector.js");
/**
 * Clamps a value between a minimum and maximum value.
 * @param {number} value - The value to clamp.
 * @param {number} min - The minimum allowed value.
 * @param {number} max - The maximum allowed value.
 * @returns {number} The clamped value.
 */
var clamp = exports.clamp = function clamp(value, min, max) {
  return Math.max(min, Math.min(value, max));
};

/**
 * Utility functions and common exports for the Pixos Game Engine.
 */
var _default = exports["default"] = {
  Vector: _vector.Vector,
  Vector4: _vector.Vector4,
  clamp: clamp
};