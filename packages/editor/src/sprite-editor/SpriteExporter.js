/**
 * ---------------------------------------------------------------
 *                 PixoSpritz – SpriteExporter
 * ---------------------------------------------------------------
 * Copyright (c) 2022-2025 Kyle Derby MacInnis
 *
 * Utility for exporting sprites to various formats:
 * - PNG (single frame or full spritesheet)
 * - Spritesheet (optimized packed layout)
 * - JSON (sprite definition)
 * - GIF (animated)
 */

/**
 * Export sprite as PNG
 * @param {Object} spriteData - Sprite data object
 * @param {HTMLImageElement|ImageData|HTMLCanvasElement} image - Source image
 * @param {Object} options - Export options
 * @param {boolean} [options.fullSheet=true] - Export full spritesheet or single frame
 * @param {string} [options.direction] - Direction to export (if single frame)
 * @param {number} [options.frameIndex] - Frame index to export (if single frame)
 * @returns {Promise<Blob>} PNG blob
 */
export async function exportToPNG(spriteData, image, options = {}) {
  const { fullSheet = true, direction = 'S', frameIndex = 0 } = options;

  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');

  // Get source image
  const sourceImg = await loadImage(image);

  if (fullSheet) {
    // Export full spritesheet
    canvas.width = sourceImg.width;
    canvas.height = sourceImg.height;
    ctx.drawImage(sourceImg, 0, 0);
  } else {
    // Export single frame
    const { tileSize, frames } = spriteData;
    const frameCoords = frames?.[direction]?.[frameIndex] || [0, 0];

    canvas.width = tileSize[0];
    canvas.height = tileSize[1];
    ctx.drawImage(
      sourceImg,
      frameCoords[0],
      frameCoords[1],
      tileSize[0],
      tileSize[1],
      0,
      0,
      tileSize[0],
      tileSize[1]
    );
  }

  return new Promise(resolve => {
    canvas.toBlob(resolve, 'image/png');
  });
}

/**
 * Export sprite as optimized spritesheet
 * @param {Object} spriteData - Sprite data object
 * @param {HTMLImageElement} image - Source image
 * @param {Object} options - Export options
 * @param {number} [options.padding=0] - Padding between frames
 * @param {boolean} [options.powerOfTwo=false] - Force power-of-two dimensions
 * @param {boolean} [options.trim=false] - Trim transparent pixels
 * @returns {Promise<{blob: Blob, data: Object}>} PNG blob and updated sprite data
 */
export async function exportSpritesheet(spriteData, image, options = {}) {
  const { padding = 0, powerOfTwo = false } = options;

  const sourceImg = await loadImage(image);
  const { tileSize, frames } = spriteData;

  // Collect all frames
  const allFrames = [];
  const directions = Object.keys(frames || {});

  for (const dir of directions) {
    const dirFrames = frames[dir] || [];
    for (let i = 0; i < dirFrames.length; i++) {
      allFrames.push({
        direction: dir,
        index: i,
        x: dirFrames[i][0],
        y: dirFrames[i][1],
        width: tileSize[0],
        height: tileSize[1],
      });
    }
  }

  // Calculate optimal layout (simple row-based for now)
  const frameWidth = tileSize[0] + padding * 2;
  const frameHeight = tileSize[1] + padding * 2;
  const framesPerRow = Math.ceil(Math.sqrt(allFrames.length));
  const rows = Math.ceil(allFrames.length / framesPerRow);

  let sheetWidth = framesPerRow * frameWidth;
  let sheetHeight = rows * frameHeight;

  // Power of two adjustment
  if (powerOfTwo) {
    sheetWidth = nextPowerOfTwo(sheetWidth);
    sheetHeight = nextPowerOfTwo(sheetHeight);
  }

  // Create output canvas
  const canvas = document.createElement('canvas');
  canvas.width = sheetWidth;
  canvas.height = sheetHeight;
  const ctx = canvas.getContext('2d');

  // Track new frame positions
  const newFrames = {};

  // Draw frames to new sheet
  allFrames.forEach((frame, i) => {
    const col = i % framesPerRow;
    const row = Math.floor(i / framesPerRow);
    const destX = col * frameWidth + padding;
    const destY = row * frameHeight + padding;

    ctx.drawImage(
      sourceImg,
      frame.x,
      frame.y,
      frame.width,
      frame.height,
      destX,
      destY,
      frame.width,
      frame.height
    );

    // Update frame coordinates
    if (!newFrames[frame.direction]) {
      newFrames[frame.direction] = [];
    }
    newFrames[frame.direction][frame.index] = [destX, destY];
  });

  const blob = await new Promise(resolve => {
    canvas.toBlob(resolve, 'image/png');
  });

  return {
    blob,
    data: {
      ...spriteData,
      sheetSize: [sheetWidth, sheetHeight],
      frames: newFrames,
    },
  };
}

/**
 * Export sprite definition as JSON
 * @param {Object} spriteData - Sprite data object
 * @param {Object} options - Export options
 * @param {boolean} [options.pretty=true] - Pretty print JSON
 * @param {boolean} [options.includeImage=false] - Include base64 image data
 * @returns {string} JSON string
 */
export function exportToJSON(spriteData, options = {}) {
  const { pretty = true, includeImage = false } = options;

  const exportData = { ...spriteData };

  // Remove internal properties
  delete exportData.imageDataUrl;
  delete exportData._dirty;

  // Optionally include image
  if (includeImage && spriteData.imageDataUrl) {
    exportData.embeddedImage = spriteData.imageDataUrl;
  }

  return pretty ? JSON.stringify(exportData, null, 2) : JSON.stringify(exportData);
}

/**
 * Export animation as GIF
 * @param {Object} spriteData - Sprite data object
 * @param {HTMLImageElement} image - Source image
 * @param {Object} options - Export options
 * @param {string} [options.direction='S'] - Direction to export
 * @param {number} [options.delay=100] - Frame delay in ms
 * @param {boolean} [options.loop=true] - Loop animation
 * @returns {Promise<Blob>} GIF blob
 */
export async function exportToGIF(spriteData, image, options = {}) {
  const { direction = 'S' } = options;
  // Note: delay and loop options reserved for future gif.js integration

  // Note: Full GIF encoding requires a library like gif.js
  // This is a placeholder that exports as animated PNG frames
  // For production, integrate gif.js or similar

  const sourceImg = await loadImage(image);
  const { tileSize, frames } = spriteData;
  const dirFrames = frames?.[direction] || [[0, 0]];

  // Create frames array for animation
  const animFrames = [];
  for (const [x, y] of dirFrames) {
    const canvas = document.createElement('canvas');
    canvas.width = tileSize[0];
    canvas.height = tileSize[1];
    const ctx = canvas.getContext('2d');
    ctx.drawImage(sourceImg, x, y, tileSize[0], tileSize[1], 0, 0, tileSize[0], tileSize[1]);
    animFrames.push(canvas);
  }

  // Without gif.js, we'll export as PNG with animation metadata
  // In a full implementation, this would create an actual GIF
  // Note: GIF export requires gif.js library. Exporting first frame as PNG.
  return new Promise(resolve => {
    animFrames[0].toBlob(resolve, 'image/png');
  });
}

/**
 * Download file helper
 * @param {Blob|string} data - Data to download
 * @param {string} filename - Output filename
 * @param {string} [mimeType] - MIME type for string data
 */
export function downloadFile(data, filename, mimeType = 'application/octet-stream') {
  let blob;
  if (typeof data === 'string') {
    blob = new Blob([data], { type: mimeType });
  } else {
    blob = data;
  }

  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// Helper: Load image from various sources
async function loadImage(source) {
  if (source instanceof HTMLImageElement) {
    return source;
  }

  if (source instanceof HTMLCanvasElement) {
    return source;
  }

  if (source instanceof ImageData) {
    const canvas = document.createElement('canvas');
    canvas.width = source.width;
    canvas.height = source.height;
    const ctx = canvas.getContext('2d');
    ctx.putImageData(source, 0, 0);
    return canvas;
  }

  if (typeof source === 'string') {
    // Assume data URL or URL
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.src = source;
    });
  }

  throw new Error('Unsupported image source type');
}

// Helper: Get next power of two
function nextPowerOfTwo(n) {
  return Math.pow(2, Math.ceil(Math.log2(n)));
}

export default {
  exportToPNG,
  exportSpritesheet,
  exportToJSON,
  exportToGIF,
  downloadFile,
};
