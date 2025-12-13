/**
 * ---------------------------------------------------------------
 *                AI Generator - Services Index
 * ---------------------------------------------------------------
 * Copyright (c) 2022-2025 Kyle Derby MacInnis
 *
 * Central export point for all AI generator services.
 */

// Core AI service
export { AIService, aiService, AI_PROVIDERS } from './ai-service.js';

// Prompt analysis
export {
  analyzePrompt,
  ASSET_TYPES,
  DIRECTIONS,
  SPRITE_PRESETS
} from './prompt-analyzer.js';

// Image generation
export {
  generatePortrait,
  generateSpritesheet,
  generateSpriteFrame,
  generateTileset,
  generateEffect,
  generateBackdrop,
  base64ToBlob,
  resizeImage,
  extractRegion,
  composeSpritesheet,
} from './image-generator.js';

// Audio generation
export {
  VOICES,
  AUDIO_FORMATS,
  generateSpeech,
  generateDialogueAudio,
  generateDialogueCollection,
  arrayBufferToBase64,
  base64ToArrayBuffer,
  createAudioBlob,
  createAudioDataUri,
  estimateSpeechDuration,
  generateSilentAudio,
} from './audio-generator.js';

// Text generation
export {
  generateSpriteConfig,
  generateCutscene,
  generateScript,
  generateNPCStates,
  generateDialogueLines,
  generateMapConfig,
  generateManifest,
} from './text-generator.js';

// DSL Specifications
export {
  PIXOSCRIPT_SPEC,
  PIXOCUT_SPEC,
  SPRITE_CONFIG_SPEC,
  MANIFEST_SPEC,
  MAP_SPEC,
  TILESET_SPEC,
  PACKAGE_STRUCTURE,
  getSystemPrompt,
  SPRITESHEET_LAYOUTS,
  calculateFrameCoordinates,
  generateSpriteConfigFromLayout,
} from './dsl-specifications.js';

// Asset Validation
export {
  validateSpriteConfig,
  validateCutscene,
  validateScript,
  validateManifest,
  processPortraitImage,
  processSpritesheetImage,
  analyzeSpritesheet,
} from './asset-validation.js';

// Game Package Orchestrator (Full Game Generation)
export {
  GamePackageOrchestrator,
  GameConcept,
  createGamePackageOrchestrator,
} from './game-package-orchestrator.js';

// Asset orchestration
export {
  AssetOrchestrator,
  createOrchestrator,
  GenerationStatus,
} from './asset-orchestrator.js';

// Schemas
export {
  SPRITE_CONFIG_SCHEMA,
  NPC_STATES_SCHEMA,
  CUTSCENE_SCHEMA,
  SCRIPT_SCHEMA,
  TILESET_SCHEMA,
  MAP_SCHEMA,
  AUDIO_SCHEMA,
  DIALOGUE_LINES_SCHEMA,
  GENERATION_PLAN_SCHEMA,
} from './schemas.js';

// Game Templates (Pre-built demos)
export {
  GAME_TEMPLATES,
  TEMPLATE_CATEGORIES,
  COMPLEXITY,
  getTemplateById,
  getTemplatesByCategory,
  getTemplatesByComplexity,
  getFeaturedTemplates,
  getStarterTemplates,
  searchTemplatesByTag,
  getAllTags,
} from './game-templates.js';
