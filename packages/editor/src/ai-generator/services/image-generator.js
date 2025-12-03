/**
 * ---------------------------------------------------------------
 *                AI Generator - Image Generator
 * ---------------------------------------------------------------
 * Copyright (c) 2022-2025 Kyle Derby MacInnis
 *
 * Handles generation of images including sprites, portraits, and
 * spritesheets. Includes post-processing for proper frame alignment
 * and sizing.
 */

import aiService from './ai-service.js';

/**
 * Generate a portrait image
 * @param {string} description - Character description
 * @param {object} options - Generation options
 * @param {function} [options.onRetry] - Callback for retry status
 * @returns {Promise<string>} Base64 encoded image data
 */
export async function generatePortrait(description, options = {}) {
  const prompt = buildPortraitPrompt(description, options);
  
  const imageData = await aiService.generateImage(prompt, {
    size: '1024x1024', // DALL-E 3 only supports 1024x1024, 1024x1792, 1792x1024
    quality: options.quality || 'standard',
    onRetry: options.onRetry,
  });

  return imageData;
}

/**
 * Generate a spritesheet with animated frames
 * @param {string} description - Sprite description
 * @param {object} config - Sprite configuration
 * @param {function} [config.onRetry] - Callback for retry status
 * @returns {Promise<string>} Base64 encoded image data
 */
export async function generateSpritesheet(description, config) {
  const prompt = buildSpritesheetPrompt(description, config);
  
  // Calculate optimal generation size
  const genSize = calculateGenerationSize(config);
  
  const imageData = await aiService.generateImage(prompt, {
    size: genSize,
    quality: 'hd', // Use HD for spritesheets to preserve detail
    onRetry: config.onRetry,
  });

  return imageData;
}

/**
 * Generate a single sprite frame
 * @param {string} description - Sprite description
 * @param {string} direction - Direction (N, E, S, W, etc.)
 * @param {string} action - Action/animation state
 * @param {object} options - Generation options
 * @returns {Promise<string>} Base64 encoded image data
 */
export async function generateSpriteFrame(description, direction, action, options = {}) {
  const directionNames = {
    'N': 'facing away, back view',
    'NE': 'facing away and right, back-right view',
    'E': 'facing right, side view',
    'SE': 'facing front-right, three-quarter view',
    'S': 'facing forward, front view',
    'SW': 'facing front-left, three-quarter view',
    'W': 'facing left, side view',
    'NW': 'facing away and left, back-left view',
  };

  const directionDesc = directionNames[direction] || 'facing forward';
  
  const prompt = `Pixel art game sprite, ${description}, ${directionDesc}, ${action} pose, clean edges, transparent background, centered in frame, game asset style`;

  const imageData = await aiService.generateImage(prompt, {
    size: '1024x1024', // DALL-E 3 only supports 1024x1024, 1024x1792, 1792x1024
    quality: 'standard',
  });

  return imageData;
}

/**
 * Generate a tileset
 * @param {string} description - Tileset theme/description
 * @param {object} config - Tileset configuration
 * @returns {Promise<string>} Base64 encoded image data
 */
export async function generateTileset(description, config = {}) {
  const tileSize = config.tileSize || 16;
  const cols = config.cols || 16;
  const rows = config.rows || 16;

  const prompt = `Seamless tileset for ${description}, ${tileSize}x${tileSize} pixel tiles arranged in ${cols}x${rows} grid, pixel art style, game terrain tiles, consistent lighting, top-down RPG style, includes floor, wall, and decoration tiles`;

  const imageData = await aiService.generateImage(prompt, {
    size: '1024x1024',
    quality: 'hd',
  });

  return imageData;
}

/**
 * Generate an effect/particle sprite
 * @param {string} description - Effect description
 * @param {object} config - Animation configuration
 * @returns {Promise<string>} Base64 encoded image data
 */
export async function generateEffect(description, config = {}) {
  const frames = config.frames || 8;
  
  const prompt = `Pixel art animation sprite sheet for ${description} effect, ${frames} frames horizontal strip, transparent background, game VFX, magical effect, clean edges`;

  const imageData = await aiService.generateImage(prompt, {
    size: '1792x1024', // DALL-E 3 - wide format for horizontal strip
    quality: 'standard',
  });

  return imageData;
}

/**
 * Build a portrait generation prompt
 */
function buildPortraitPrompt(description, options) {
  const style = options.style || 'pixel art';
  const frameStyle = options.frameStyle || 'RPG dialogue portrait';
  
  return `${style} ${frameStyle}, ${description}, expressive face, clean edges, solid background, game asset, character portrait for visual novel or RPG`;
}

/**
 * Build a spritesheet generation prompt
 */
function buildSpritesheetPrompt(description, config) {
  const { tileSize, directions, framesPerDirection, style, actions } = config;
  
  const directionDesc = directions === 8 
    ? '8 directions (N, NE, E, SE, S, SW, W, NW)' 
    : directions === 4 
      ? '4 directions (N, E, S, W)' 
      : `${directions} direction(s)`;

  const actionLabel = actions && actions.length > 0 
    ? actions.join(', ') + ' animations'
    : 'walk cycle animation';

  return `${style || 'Pixel art'} game character spritesheet, ${description}, ${directionDesc}, ${framesPerDirection} frames per direction, ${actionLabel}, ${tileSize[0]}x${tileSize[1]} pixels per frame, organized grid layout, consistent style across all frames, transparent background, RPG character sheet, clean edges, suitable for 2D game`;
}

/**
 * Calculate optimal generation size for a spritesheet
 * DALL-E 3 only supports: 1024x1024, 1024x1792, 1792x1024
 */
function calculateGenerationSize(config) {
  const { sheetSize } = config;
  
  if (!sheetSize) return '1024x1024';
  
  const width = sheetSize[0];
  const height = sheetSize[1];
  
  // DALL-E 3 only supports these sizes
  if (width > height) return '1792x1024';
  if (height > width) return '1024x1792';
  return '1024x1024';
}

/**
 * Convert base64 image to a Blob
 * @param {string} base64 - Base64 encoded image data
 * @param {string} mimeType - MIME type of the image
 * @returns {Blob}
 */
export function base64ToBlob(base64, mimeType = 'image/png') {
  const byteCharacters = atob(base64);
  const byteNumbers = new Array(byteCharacters.length);
  
  for (let i = 0; i < byteCharacters.length; i++) {
    byteNumbers[i] = byteCharacters.charCodeAt(i);
  }
  
  const byteArray = new Uint8Array(byteNumbers);
  return new Blob([byteArray], { type: mimeType });
}

/**
 * Resize an image to target dimensions using canvas
 * @param {string} base64 - Base64 encoded source image
 * @param {number} targetWidth - Target width
 * @param {number} targetHeight - Target height
 * @returns {Promise<string>} Base64 encoded resized image
 */
export async function resizeImage(base64, targetWidth, targetHeight) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = targetWidth;
      canvas.height = targetHeight;
      
      const ctx = canvas.getContext('2d');
      // Use nearest-neighbor scaling for pixel art
      ctx.imageSmoothingEnabled = false;
      ctx.drawImage(img, 0, 0, targetWidth, targetHeight);
      
      const resized = canvas.toDataURL('image/png').split(',')[1];
      resolve(resized);
    };
    img.onerror = reject;
    img.src = `data:image/png;base64,${base64}`;
  });
}

/**
 * Extract a region from an image
 * @param {string} base64 - Base64 encoded source image
 * @param {number} x - X offset
 * @param {number} y - Y offset
 * @param {number} width - Region width
 * @param {number} height - Region height
 * @returns {Promise<string>} Base64 encoded extracted region
 */
export async function extractRegion(base64, x, y, width, height) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      
      const ctx = canvas.getContext('2d');
      ctx.imageSmoothingEnabled = false;
      ctx.drawImage(img, x, y, width, height, 0, 0, width, height);
      
      const extracted = canvas.toDataURL('image/png').split(',')[1];
      resolve(extracted);
    };
    img.onerror = reject;
    img.src = `data:image/png;base64,${base64}`;
  });
}

/**
 * Create a properly formatted spritesheet from generated frames
 * @param {string[]} frames - Array of base64 encoded frame images
 * @param {object} config - Spritesheet configuration
 * @returns {Promise<string>} Base64 encoded spritesheet
 */
export async function composeSpritesheet(frames, config) {
  const { tileSize, framesPerDirection, directions } = config;
  const [tileWidth, tileHeight] = tileSize;
  
  const cols = framesPerDirection;
  const rows = directions;
  
  const canvas = document.createElement('canvas');
  canvas.width = cols * tileWidth;
  canvas.height = rows * tileHeight;
  
  const ctx = canvas.getContext('2d');
  ctx.imageSmoothingEnabled = false;

  // Load and place each frame
  for (let i = 0; i < frames.length; i++) {
    const row = Math.floor(i / cols);
    const col = i % cols;
    
    await new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        ctx.drawImage(img, col * tileWidth, row * tileHeight, tileWidth, tileHeight);
        resolve();
      };
      img.onerror = reject;
      img.src = `data:image/png;base64,${frames[i]}`;
    });
  }

  return canvas.toDataURL('image/png').split(',')[1];
}

export default {
  generatePortrait,
  generateSpritesheet,
  generateSpriteFrame,
  generateTileset,
  generateEffect,
  base64ToBlob,
  resizeImage,
  extractRegion,
  composeSpritesheet,
};
