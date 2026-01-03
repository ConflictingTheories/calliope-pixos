/**
 * ---------------------------------------------------------------
 *                 PixoSpritz – SpriteImporter
 * ---------------------------------------------------------------
 * Copyright (c) 2022-2025 Kyle Derby MacInnis
 *
 * Utility for importing sprites from various formats:
 * - PNG (single frame or spritesheet)
 * - GIF (animated, extracts frames)
 * - JSON (sprite definition)
 */

/**
 * Import a PNG file as sprite data
 * @param {File} file - PNG file to import
 * @param {Object} options - Import options
 * @param {number} [options.frameWidth] - Width of each frame (for spritesheets)
 * @param {number} [options.frameHeight] - Height of each frame
 * @param {boolean} [options.autoDetectFrames] - Try to auto-detect frame boundaries
 * @returns {Promise<Object>} Sprite data object
 */
export async function importFromPNG(file, options = {}) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = async (e) => {
      const dataUrl = e.target.result;
      const img = new Image();
      
      img.onload = () => {
        const { frameWidth, frameHeight, autoDetectFrames } = options;
        
        // If frame dimensions provided, calculate frame grid
        let frames = { S: [[0, 0]] };
        let tileSize = [img.width, img.height];
        let sheetSize = [img.width, img.height];
        
        if (frameWidth && frameHeight) {
          const cols = Math.floor(img.width / frameWidth);
          const rows = Math.floor(img.height / frameHeight);
          tileSize = [frameWidth, frameHeight];
          frames = generateFrameGrid(cols, rows, frameWidth, frameHeight);
        } else if (autoDetectFrames) {
          const detected = detectSpriteFrames(img);
          if (detected) {
            tileSize = detected.tileSize;
            frames = detected.frames;
          }
        }
        
        resolve({
          type: 'sprite',
          src: file.name,
          imageDataUrl: dataUrl,
          sheetSize,
          tileSize,
          frames,
          state: 'idle',
          gender: '',
          drawOffset: {}
        });
      };
      
      img.onerror = () => reject(new Error('Failed to load image'));
      img.src = dataUrl;
    };
    
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsDataURL(file);
  });
}

/**
 * Import a GIF file as animated sprite
 * @param {File} file - GIF file to import
 * @returns {Promise<Object>} Sprite data with extracted frames
 */
export async function importFromGIF(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = async (e) => {
      try {
        const arrayBuffer = e.target.result;
        const frames = await extractGIFFrames(arrayBuffer);
        
        if (frames.length === 0) {
          throw new Error('No frames found in GIF');
        }
        
        // Create a spritesheet from GIF frames
        const firstFrame = frames[0];
        const frameWidth = firstFrame.width;
        const frameHeight = firstFrame.height;
        
        // Create horizontal spritesheet
        const canvas = document.createElement('canvas');
        canvas.width = frameWidth * frames.length;
        canvas.height = frameHeight;
        const ctx = canvas.getContext('2d');
        
        const frameCoords = [];
        frames.forEach((frame, index) => {
          ctx.putImageData(frame.imageData, index * frameWidth, 0);
          frameCoords.push([index * frameWidth, 0]);
        });
        
        resolve({
          type: 'sprite',
          src: file.name.replace('.gif', '.png'),
          imageDataUrl: canvas.toDataURL('image/png'),
          sheetSize: [canvas.width, canvas.height],
          tileSize: [frameWidth, frameHeight],
          frames: { S: frameCoords },
          state: 'idle',
          gender: '',
          drawOffset: {},
          animation: {
            frameCount: frames.length,
            frameDuration: frames[0].delay || 100
          }
        });
      } catch (err) {
        reject(err);
      }
    };
    
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsArrayBuffer(file);
  });
}

/**
 * Import sprite definition from JSON
 * @param {File} file - JSON file
 * @returns {Promise<Object>} Sprite data
 */
export async function importFromJSON(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target.result);
        // Validate required fields
        if (!data.type || !data.tileSize) {
          throw new Error('Invalid sprite JSON: missing required fields');
        }
        resolve(data);
      } catch (err) {
        reject(err);
      }
    };
    
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsText(file);
  });
}

/**
 * Auto-import based on file extension
 * @param {File} file - File to import
 * @param {Object} options - Import options
 * @returns {Promise<Object>} Sprite data
 */
export async function importSprite(file, options = {}) {
  const ext = file.name.split('.').pop().toLowerCase();
  
  switch (ext) {
  case 'png':
  case 'jpg':
  case 'jpeg':
  case 'webp':
    return importFromPNG(file, options);
  case 'gif':
    return importFromGIF(file);
  case 'json':
    return importFromJSON(file);
  default:
    throw new Error(`Unsupported file format: ${ext}`);
  }
}

// Helper: Generate frame grid coordinates
function generateFrameGrid(cols, rows, frameWidth, frameHeight) {
  const directions = ['S', 'SW', 'W', 'NW', 'N', 'NE', 'E', 'SE'];
  const frames = {};
  
  // Single direction mode (horizontal strip)
  if (rows === 1) {
    frames.S = [];
    for (let col = 0; col < cols; col++) {
      frames.S.push([col * frameWidth, 0]);
    }
    return frames;
  }
  
  // Multi-direction mode (8-direction)
  for (let row = 0; row < Math.min(rows, 8); row++) {
    const dir = directions[row];
    frames[dir] = [];
    for (let col = 0; col < cols; col++) {
      frames[dir].push([col * frameWidth, row * frameHeight]);
    }
  }
  
  return frames;
}

// Helper: Try to detect sprite frames from image
function detectSpriteFrames(img) {
  // Simple heuristic: check for common sprite sizes
  const commonSizes = [8, 16, 24, 32, 48, 64];
  
  for (const size of commonSizes) {
    if (img.width % size === 0 && img.height % size === 0) {
      const cols = img.width / size;
      const rows = img.height / size;
      if (cols >= 1 && rows >= 1 && cols <= 16 && rows <= 16) {
        return {
          tileSize: [size, size],
          frames: generateFrameGrid(cols, rows, size, size)
        };
      }
    }
  }
  
  // Try non-square common sizes
  const aspectRatios = [
    { w: 32, h: 48 },
    { w: 24, h: 32 },
    { w: 16, h: 24 }
  ];
  
  for (const { w, h } of aspectRatios) {
    if (img.width % w === 0 && img.height % h === 0) {
      const cols = img.width / w;
      const rows = img.height / h;
      if (cols >= 1 && rows >= 1) {
        return {
          tileSize: [w, h],
          frames: generateFrameGrid(cols, rows, w, h)
        };
      }
    }
  }
  
  return null;
}

// Helper: Extract frames from GIF (simplified - for full support use a GIF parsing library)
async function extractGIFFrames(arrayBuffer) {
  // This is a simplified GIF parser
  // For production, consider using gifuct-js or similar library
  const frames = [];
  const view = new DataView(arrayBuffer);
  
  // Check GIF signature
  const sig = String.fromCharCode(view.getUint8(0), view.getUint8(1), view.getUint8(2));
  if (sig !== 'GIF') {
    throw new Error('Invalid GIF file');
  }
  
  // Get canvas dimensions from logical screen descriptor
  // const width = view.getUint16(6, true);
  // const height = view.getUint16(8, true);
  
  // For now, load the entire GIF as a single image and use browser's decoding
  // A full implementation would parse the GIF format properly
  const blob = new Blob([arrayBuffer], { type: 'image/gif' });
  const url = URL.createObjectURL(blob);
  
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      // Create a single frame from the first frame of the GIF
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0);
      
      frames.push({
        width: img.width,
        height: img.height,
        imageData: ctx.getImageData(0, 0, img.width, img.height),
        delay: 100
      });
      
      URL.revokeObjectURL(url);
      resolve(frames);
    };
    img.src = url;
  });
}

export default {
  importFromPNG,
  importFromGIF,
  importFromJSON,
  importSprite
};
