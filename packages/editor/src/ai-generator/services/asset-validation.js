/**
 * ---------------------------------------------------------------
 *                AI Generator - Asset Validation
 * ---------------------------------------------------------------
 * Copyright (c) 2022-2025 Kyle Derby MacInnis
 *
 * Validates generated assets to ensure they are usable.
 * Includes image processing for proper formatting.
 */

import { SPRITESHEET_LAYOUTS, calculateFrameCoordinates } from './dsl-specifications.js';

/**
 * Validate sprite configuration JSON
 * Fixes common issues and ensures frame coordinates are correct
 */
export function validateSpriteConfig(config, layoutName = 'character4') {
  const errors = [];
  const warnings = [];
  const fixes = [];

  // Get expected layout
  const layout = SPRITESHEET_LAYOUTS[layoutName];
  if (!layout) {
    errors.push(`Unknown layout: ${layoutName}`);
    return { valid: false, errors, warnings, fixes, config };
  }

  // Clone config for modifications
  const fixed = { ...config };

  // Validate type
  if (!fixed.type) {
    fixed.type = 'sprite';
    fixes.push('Added missing type: sprite');
  }

  // Validate and fix sheetSize
  const expectedSheetSize = layout.sheetSize;
  if (!fixed.sheetSize || !Array.isArray(fixed.sheetSize) || fixed.sheetSize.length !== 2) {
    fixed.sheetSize = expectedSheetSize;
    fixes.push(`Set sheetSize to ${expectedSheetSize.join('x')}`);
  } else if (fixed.sheetSize[0] !== expectedSheetSize[0] || fixed.sheetSize[1] !== expectedSheetSize[1]) {
    warnings.push(`sheetSize ${fixed.sheetSize.join('x')} doesn't match expected ${expectedSheetSize.join('x')}`);
  }

  // Validate and fix tileSize
  if (!fixed.tileSize || !Array.isArray(fixed.tileSize) || fixed.tileSize.length !== 2) {
    fixed.tileSize = layout.tileSize;
    fixes.push(`Set tileSize to ${layout.tileSize.join('x')}`);
  }

  // CRITICAL: Recalculate frame coordinates to ensure correctness
  const correctFrames = calculateFrameCoordinates(layout);

  // Check if frames are correct
  let framesCorrect = true;
  if (!fixed.frames || typeof fixed.frames !== 'object') {
    framesCorrect = false;
  } else {
    for (const dir of layout.directions) {
      if (!fixed.frames[dir] || !Array.isArray(fixed.frames[dir])) {
        framesCorrect = false;
        break;
      }
      for (let i = 0; i < layout.framesPerDirection; i++) {
        const expected = correctFrames[dir][i];
        const actual = fixed.frames[dir][i];
        if (!actual || actual[0] !== expected[0] || actual[1] !== expected[1]) {
          framesCorrect = false;
          break;
        }
      }
      if (!framesCorrect) break;
    }
  }

  if (!framesCorrect) {
    fixed.frames = correctFrames;
    fixes.push('Recalculated frame coordinates based on layout');
  }

  // Validate drawOffset
  if (!fixed.drawOffset || typeof fixed.drawOffset !== 'object') {
    fixed.drawOffset = {};
    for (const dir of layout.directions) {
      fixed.drawOffset[dir] = [-0.15, -0.15, -1];
    }
    fixes.push('Generated default drawOffset');
  }

  // Validate hotspotOffset
  if (!fixed.hotspotOffset || !Array.isArray(fixed.hotspotOffset) || fixed.hotspotOffset.length !== 3) {
    fixed.hotspotOffset = [0.5, 0.5, 0];
    fixes.push('Set default hotspotOffset');
  }

  // Validate src
  if (!fixed.src) {
    errors.push('Missing src (spritesheet image path)');
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
    fixes,
    config: fixed,
  };
}

/**
 * Validate cutscene script content
 */
export function validateCutscene(content) {
  const errors = [];
  const warnings = [];
  const lines = content.split('\n');

  let hasBackdrop = false;
  let hasCharacters = false;
  let hasDialogue = false;
  let hasEnd = false;

  for (const line of lines) {
    const trimmed = line.trim();

    if (trimmed.startsWith('@backdrop')) hasBackdrop = true;
    if (trimmed.startsWith('@char')) hasCharacters = true;
    if (trimmed.match(/^[A-Z_]+:/)) hasDialogue = true;
    if (trimmed === '@end') hasEnd = true;

    // Check for common issues
    if (trimmed.startsWith('@do ') && !trimmed.includes('[name=')) {
      if (trimmed.includes('playBgm') || trimmed.includes('playSfx')) {
        warnings.push(`Audio command may be missing [name=] parameter: ${trimmed}`);
      }
    }
  }

  if (!hasBackdrop) warnings.push('Missing @backdrop - scene may have no background');
  if (!hasCharacters) warnings.push('No @char definitions found');
  if (!hasDialogue) errors.push('No dialogue found - cutscene appears empty');
  if (!hasEnd) {
    errors.push('Missing @end command');
    // Auto-fix
    content += '\n\n@end';
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
    content,
  };
}

/**
 * Validate PixosScript content
 */
export function validateScript(content) {
  const errors = [];
  const warnings = [];

  // Check for common API usage
  const hasLocalVars = content.includes('local ');
  const usesPixosApi = content.includes('pixos.');
  const hasReturn = content.includes('return');

  if (!hasLocalVars) {
    warnings.push('No local variables found - may pollute global scope');
  }

  if (!usesPixosApi) {
    warnings.push('No pixos API calls found - script may not interact with game');
  }

  // Check for async operations without sync
  if (content.includes('pixos.play_pxc_cutscene') || content.includes('pixos.sprite_dialogue')) {
    if (!content.includes('pixos.sync')) {
      warnings.push('Async operations detected without pixos.sync() - may cause timing issues');
    }
  }

  // Check for common syntax errors
  if (content.includes('function(') && !content.includes('function (')) {
    // This is fine, but let's check for other issues
  }

  // Check for trigger return
  if (content.includes('triggers/') || content.includes('trigger')) {
    if (!hasReturn) {
      warnings.push('Trigger scripts should end with "return nil"');
      content += '\n\nreturn nil';
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
    content,
  };
}

/**
 * Validate manifest.json
 */
export function validateManifest(manifest) {
  const errors = [];
  const warnings = [];

  if (!manifest.initialZones || !Array.isArray(manifest.initialZones) || manifest.initialZones.length === 0) {
    errors.push('initialZones is required and must contain at least one zone');
  }

  // Check that referenced assets exist in declarations
  if (manifest.initialZones && manifest.maps) {
    for (const zone of manifest.initialZones) {
      if (!manifest.maps.includes(zone)) {
        warnings.push(`initialZone "${zone}" not listed in maps array`);
      }
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
    manifest,
  };
}

/**
 * Post-process portrait image to ensure clean result
 * - Center crop to square
 * - Remove any extra elements outside the portrait area
 */
export async function processPortraitImage(base64, targetSize = 256) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = targetSize;
      canvas.height = targetSize;

      const ctx = canvas.getContext('2d');
      ctx.imageSmoothingEnabled = false;

      // Calculate center crop
      const srcSize = Math.min(img.width, img.height);
      const srcX = (img.width - srcSize) / 2;
      const srcY = (img.height - srcSize) / 2;

      // For portraits, we want to focus on the upper portion (face area)
      // Adjust srcY to capture more of the top
      const adjustedSrcY = Math.max(0, srcY * 0.3);

      ctx.drawImage(
        img,
        srcX, adjustedSrcY, srcSize, srcSize,
        0, 0, targetSize, targetSize
      );

      const result = canvas.toDataURL('image/png').split(',')[1];
      resolve(result);
    };
    img.onerror = () => reject(new Error('Failed to load portrait image'));
    img.src = `data:image/png;base64,${base64}`;
  });
}

/**
 * Process spritesheet to ensure proper grid alignment
 * - Resize to exact expected dimensions
 * - Apply pixel-perfect scaling
 */
export async function processSpritesheetImage(base64, layout) {
  const { sheetSize } = layout;
  const [expectedWidth, expectedHeight] = sheetSize;

  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = expectedWidth;
      canvas.height = expectedHeight;

      const ctx = canvas.getContext('2d');
      ctx.imageSmoothingEnabled = false;

      // Scale image to fit expected dimensions
      ctx.drawImage(img, 0, 0, expectedWidth, expectedHeight);

      const result = canvas.toDataURL('image/png').split(',')[1];
      resolve(result);
    };
    img.onerror = () => reject(new Error('Failed to load spritesheet image'));
    img.src = `data:image/png;base64,${base64}`;
  });
}

/**
 * Analyze generated spritesheet for quality issues
 */
export async function analyzeSpritesheet(base64, layout) {
  const issues = [];

  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;

      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0);

      const { tileSize, directions, framesPerDirection } = layout;
      const [tileWidth, tileHeight] = tileSize;

      // Check each frame for content
      for (let row = 0; row < directions.length; row++) {
        for (let col = 0; col < framesPerDirection; col++) {
          const x = col * tileWidth;
          const y = row * tileHeight;

          try {
            const frameData = ctx.getImageData(x, y, tileWidth, tileHeight);
            const pixels = frameData.data;

            // Check if frame has any content (non-transparent pixels)
            let hasContent = false;
            for (let i = 3; i < pixels.length; i += 4) {
              if (pixels[i] > 10) { // Alpha > 10
                hasContent = true;
                break;
              }
            }

            if (!hasContent) {
              issues.push(`Frame [${col}, ${row}] (${directions[row]}) appears empty`);
            }
          } catch (e) {
            issues.push(`Cannot analyze frame [${col}, ${row}]: ${e.message}`);
          }
        }
      }

      resolve({
        width: img.width,
        height: img.height,
        expectedWidth: layout.sheetSize[0],
        expectedHeight: layout.sheetSize[1],
        sizeMatch: img.width === layout.sheetSize[0] && img.height === layout.sheetSize[1],
        issues,
      });
    };
    img.onerror = () => reject(new Error('Failed to load image for analysis'));
    img.src = `data:image/png;base64,${base64}`;
  });
}

export default {
  validateSpriteConfig,
  validateCutscene,
  validateScript,
  validateManifest,
  processPortraitImage,
  processSpritesheetImage,
  analyzeSpritesheet,
};
