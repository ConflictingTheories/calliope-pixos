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
  generateConfig,
  enhanceContent,
} from './text-generator.js';

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
