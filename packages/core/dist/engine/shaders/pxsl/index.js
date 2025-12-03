"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
Object.defineProperty(exports, "PXSLTranspiler", {
  enumerable: true,
  get: function get() {
    return _transpiler.PXSLTranspiler;
  }
});
Object.defineProperty(exports, "PXSL_BUILTINS", {
  enumerable: true,
  get: function get() {
    return _specification.PXSL_BUILTINS;
  }
});
Object.defineProperty(exports, "PXSL_TYPE_ALIASES", {
  enumerable: true,
  get: function get() {
    return _specification.PXSL_TYPE_ALIASES;
  }
});
Object.defineProperty(exports, "SHADER_LIBRARY", {
  enumerable: true,
  get: function get() {
    return _library.SHADER_LIBRARY;
  }
});
Object.defineProperty(exports, "ShaderManager", {
  enumerable: true,
  get: function get() {
    return _manager.ShaderManager;
  }
});
exports["default"] = void 0;
var _transpiler = require("./transpiler.js");
var _manager = require("./manager.js");
var _specification = require("./specification.js");
var _library = require("./library.js");
/**
 * ═══════════════════════════════════════════════════════════════════════════
 *                    PXSL - PixoSpritz Shader Language
 * ═══════════════════════════════════════════════════════════════════════════
 * Copyright (c) 2020-2025 Kyle Derby MacInnis
 *
 * Main entry point for the PXSL shader system.
 * ═══════════════════════════════════════════════════════════════════════════
 */
// Re-export everything as default
var _default = exports["default"] = {
  PXSLTranspiler: _transpiler.PXSLTranspiler,
  ShaderManager: _manager.ShaderManager,
  SHADER_LIBRARY: _library.SHADER_LIBRARY
};