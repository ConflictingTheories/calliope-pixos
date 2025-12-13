/**
 * ---------------------------------------------------------------
 *                AI Generator - Image Generator
 * ---------------------------------------------------------------
 * Copyright (c) 2022-2025 Kyle Derby MacInnis
 *
 * Handles generation of images including sprites, portraits, and
 * spritesheets. Uses strict prompting for consistent results
 * and post-processing for proper formatting.
 */

import aiService from './ai-service.js';
import { SPRITESHEET_LAYOUTS } from './dsl-specifications.js';
import { processPortraitImage, processSpritesheetImage } from './asset-validation.js';

/**
 * Strict portrait generation prompt builder
 * Ensures clean, usable portraits without extra elements
 */
function buildStrictPortraitPrompt(description, options = {}) {
  const style = options.style || 'pixel art';
  
  return `${style} RPG character portrait, head and shoulders only, ${description}.

CRITICAL REQUIREMENTS:
- Single character ONLY, centered in frame
- Head and upper chest visible
- Simple solid color background (dark blue or dark purple)
- Clean edges, no decorative borders or frames
- No text, no watermarks, no signatures
- No other characters or objects
- Classic JRPG/SNES style portrait
- Forward-facing or 3/4 view
- Expressive face with visible features`;
}

/**
 * Strict spritesheet generation prompt builder
 * Ensures proper grid layout for animation frames
 */
function buildStrictSpritesheetPrompt(description, config) {
  const { tileSize, directions, framesPerDirection, style } = config;
  const [tileWidth, tileHeight] = tileSize;
  
  const directionDesc = directions === 8 
    ? '8 rows for directions: South, Southeast, East, Northeast, North, Northwest, West, Southwest' 
    : '4 rows for directions: South, East, North, West';

  return `${style || 'Pixel art'} game character spritesheet, ${description}.

EXACT LAYOUT REQUIREMENTS:
- Grid of ${framesPerDirection} columns × ${directions} rows
- Each cell is exactly ${tileWidth}×${tileHeight} pixels in proportion
- ${directionDesc}
- ${framesPerDirection} animation frames per row (walking cycle)
- Character must be SAME SIZE in every cell
- Character must be CENTERED in each cell
- Transparent or solid color background
- NO LABELS, NO TEXT, NO BORDERS between cells
- Consistent lighting and style across ALL cells
- Top-down 3/4 perspective (classic RPG style)

ROW ORDER (top to bottom):
${directions === 8 ? 
  '1. South (facing down/toward camera)\n2. Southeast\n3. East (facing right)\n4. Northeast\n5. North (facing away)\n6. Northwest\n7. West (facing left)\n8. Southwest' :
  '1. South (facing down)\n2. East (facing right)\n3. North (facing away)\n4. West (facing left)'}

Each row shows the same walk cycle animation from that viewing angle.`;
}

/**
 * Generate a portrait image with post-processing
 * @param {string} description - Character description
 * @param {object} options - Generation options
 * @returns {Promise<string>} Base64 encoded image data
 */
export async function generatePortrait(description, options = {}) {
  const prompt = buildStrictPortraitPrompt(description, options);
  
  const imageData = await aiService.generateImage(prompt, {
    size: '1024x1024',
    quality: options.quality || 'standard',
    onRetry: options.onRetry,
  });

  // Post-process: center crop to square, focus on face area
  const processed = await processPortraitImage(imageData, options.targetSize || 256);
  
  return processed;
}

/**
 * Generate a spritesheet with proper grid layout
 * @param {string} description - Sprite description
 * @param {object} config - Sprite configuration
 * @returns {Promise<string>} Base64 encoded image data
 */
export async function generateSpritesheet(description, config) {
  const prompt = buildStrictSpritesheetPrompt(description, config);
  
  // Determine optimal DALL-E size based on aspect ratio
  const { sheetSize } = config;
  let genSize = '1024x1024';
  if (sheetSize) {
    const width = sheetSize[0];
    const height = sheetSize[1];
    if (height > width * 1.5) {
      genSize = '1024x1792'; // Tall (8-direction)
    } else if (width > height * 1.5) {
      genSize = '1792x1024'; // Wide
    }
  }
  
  const imageData = await aiService.generateImage(prompt, {
    size: genSize,
    quality: 'hd', // Use HD for spritesheets to preserve detail
    onRetry: config.onRetry,
  });

  // Post-process: resize to exact expected dimensions
  const layoutName = config.layoutName || (config.directions >= 8 ? 'character8' : 'character4');
  const layout = SPRITESHEET_LAYOUTS[layoutName] || {
    sheetSize: config.sheetSize,
    tileSize: config.tileSize,
    directions: config.directions === 8 ? ['S', 'SE', 'E', 'NE', 'N', 'NW', 'W', 'SW'] : ['S', 'E', 'N', 'W'],
    framesPerDirection: config.framesPerDirection,
  };
  
  const processed = await processSpritesheetImage(imageData, layout);
  
  return processed;
}

/**
 * Generate a single sprite frame (for frame-by-frame generation)
 * @param {string} description - Sprite description
 * @param {string} direction - Direction (N, E, S, W, etc.)
 * @param {string} action - Action/animation state
 * @param {object} options - Generation options
 * @returns {Promise<string>} Base64 encoded image data
 */
export async function generateSpriteFrame(description, direction, action, options = {}) {
  const directionNames = {
    'N': 'from behind, back view, walking away',
    'NE': 'from behind-right angle, walking away and right',
    'E': 'from the right side, profile view, walking right',
    'SE': 'front-right 3/4 view, walking toward and right',
    'S': 'from the front, facing the viewer, walking toward',
    'SW': 'front-left 3/4 view, walking toward and left',
    'W': 'from the left side, profile view, walking left',
    'NW': 'from behind-left angle, walking away and left',
  };

  const directionDesc = directionNames[direction] || 'facing forward';
  
  const prompt = `Pixel art game sprite, single character, ${description}, ${directionDesc}, ${action} pose.

REQUIREMENTS:
- Single frame only
- Character centered
- Transparent background
- Clean pixel art edges
- Consistent with JRPG/SNES style
- No text or labels`;

  const imageData = await aiService.generateImage(prompt, {
    size: '1024x1024',
    quality: 'standard',
    onRetry: options.onRetry,
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

  const prompt = `Seamless tileset for ${description}, pixel art style.

EXACT LAYOUT:
- Grid of ${cols}×${rows} tiles
- Each tile ${tileSize}×${tileSize} pixels in proportion
- Top-down RPG perspective
- Consistent lighting (light from top-left)

TILE CATEGORIES (organize by rows):
- Row 1-2: Floor variations (stone, wood, grass)
- Row 3-4: Wall variations (top, bottom, sides, corners)
- Row 5-6: Water/liquid tiles
- Row 7-8: Decoration tiles (plants, rocks)
- Remaining: Special tiles (doors, stairs, etc.)

NO TEXT, NO LABELS, NO BORDERS between tiles.
Tiles must connect seamlessly when placed adjacent.`;

  const imageData = await aiService.generateImage(prompt, {
    size: '1024x1024',
    quality: 'hd',
    onRetry: config.onRetry,
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
  
  const prompt = `Pixel art effect animation spritesheet, ${description}.

EXACT LAYOUT:
- Horizontal strip of ${frames} frames
- Each frame shows progression of the effect
- Frame 1: Effect start/small
- Frame ${Math.floor(frames/2)}: Effect peak/largest
- Frame ${frames}: Effect fade/end
- Transparent background
- Glowing/magical appearance
- NO TEXT, NO BORDERS between frames`;

  const imageData = await aiService.generateImage(prompt, {
    size: '1792x1024', // Wide format for horizontal strip
    quality: 'standard',
    onRetry: config.onRetry,
  });

  return imageData;
}

/**
 * Generate a background/backdrop image
 * @param {string} description - Scene description
 * @param {object} options - Generation options
 * @returns {Promise<string>} Base64 encoded image data
 */
export async function generateBackdrop(description, options = {}) {
  const style = options.style || 'pixel art';
  
  const prompt = `${style} game background scene, ${description}.

REQUIREMENTS:
- Wide scene composition (16:9 aspect feel)
- Atmospheric and detailed
- No characters or text
- Suitable for dialogue scene backdrop
- ${options.mood || 'neutral'} mood lighting
- JRPG/visual novel style`;

  const imageData = await aiService.generateImage(prompt, {
    size: '1792x1024',
    quality: options.quality || 'standard',
    onRetry: options.onRetry,
  });

  return imageData;
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
 * Create a properly formatted spritesheet from individual frames
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
  generateBackdrop,
  base64ToBlob,
  resizeImage,
  extractRegion,
  composeSpritesheet,
};
