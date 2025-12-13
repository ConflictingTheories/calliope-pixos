/**
 * ═══════════════════════════════════════════════════════════════════════════
 *                    PXSL - PixoSpritz Shader Language
 * ═══════════════════════════════════════════════════════════════════════════
 * Copyright (c) 2020-2025 Kyle Derby MacInnis
 *
 * Main entry point for the PXSL shader system.
 * ═══════════════════════════════════════════════════════════════════════════
 */

export { PXSLTranspiler } from './transpiler.js';
export { ShaderManager } from './manager.js';
export { PXSL_BUILTINS, PXSL_TYPE_ALIASES } from './specification.js';
export { SHADER_LIBRARY } from './library.js';

// Re-export everything as default
import { PXSLTranspiler } from './transpiler.js';
import { ShaderManager } from './manager.js';
import { SHADER_LIBRARY } from './library.js';

export default {
  PXSLTranspiler,
  ShaderManager,
  SHADER_LIBRARY,
};
