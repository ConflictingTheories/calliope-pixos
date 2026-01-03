/*
 * ---------------------------------------------------------------
 *        Pixospritz – Editor – Base Tool Class
 * ---------------------------------------------------------------
 * Copyright (c) 2022-2025  Kyle Derby MacInnis
 *
 * Abstract base class for all map editing tools.
 * Provides common interface and utility methods.
 */

/**
 * Base class for map editing tools
 * All tools should extend this class
 */
export default class BaseTool {
  /**
   * @param {Object} options - Tool configuration
   * @param {string} options.name - Tool name
   * @param {string} options.icon - Tool icon (emoji or icon class)
   * @param {string} options.cursor - CSS cursor style
   * @param {string} options.shortcut - Keyboard shortcut
   */
  constructor(options = {}) {
    this.name = options.name || 'base';
    this.icon = options.icon || '🔧';
    this.cursor = options.cursor || 'default';
    this.shortcut = options.shortcut || null;
    this.active = false;
    this.brushSize = options.brushSize || 1;
    this.previewCells = [];
  }

  /**
   * Called when the tool becomes active
   * @param {Object} context - Editor context
   */
  activate(context) {
    this.active = true;
    this.context = context;
  }

  /**
   * Called when the tool becomes inactive
   */
  deactivate() {
    this.active = false;
    this.previewCells = [];
    this.context = null;
  }

  /**
   * Handle mouse/touch down event
   * @param {number} x - Grid X coordinate
   * @param {number} y - Grid Y coordinate
   * @param {Object} mapData - Current map data
   * @param {Object} options - Additional options (layer, selectedTile, etc.)
   * @returns {Object|null} Changes to apply { cells: [...], heights: [...] }
   */
  onStart(x, y, mapData, options) {
    return null;
  }

  /**
   * Handle mouse/touch move event (while pressed)
   * @param {number} x - Grid X coordinate
   * @param {number} y - Grid Y coordinate
   * @param {Object} mapData - Current map data
   * @param {Object} options - Additional options
   * @returns {Object|null} Changes to apply
   */
  onMove(x, y, mapData, options) {
    return null;
  }

  /**
   * Handle mouse/touch up event
   * @param {number} x - Grid X coordinate
   * @param {number} y - Grid Y coordinate
   * @param {Object} mapData - Current map data
   * @param {Object} options - Additional options
   * @returns {Object|null} Final changes to apply
   */
  onEnd(x, y, mapData, options) {
    return null;
  }

  /**
   * Get cells for preview rendering
   * @param {number} x - Current grid X
   * @param {number} y - Current grid Y
   * @param {Object} options - Tool options
   * @returns {Array<{x: number, y: number, tile: any}>} Preview cells
   */
  getPreview(x, y, options) {
    return this.previewCells;
  }

  /**
   * Get cells affected by brush at position
   * @param {number} centerX - Center X coordinate
   * @param {number} centerY - Center Y coordinate
   * @param {number} width - Map width
   * @param {number} height - Map height
   * @returns {Array<{x: number, y: number}>} Affected cell coordinates
   */
  getBrushCells(centerX, centerY, width, height) {
    const cells = [];
    const halfSize = Math.floor(this.brushSize / 2);
    
    for (let dy = -halfSize; dy <= halfSize; dy++) {
      for (let dx = -halfSize; dx <= halfSize; dx++) {
        const x = centerX + dx;
        const y = centerY + dy;
        
        // Check bounds
        if (x >= 0 && x < width && y >= 0 && y < height) {
          // For circular brush, check distance
          if (this.brushSize > 1) {
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist <= halfSize + 0.5) {
              cells.push({ x, y });
            }
          } else {
            cells.push({ x, y });
          }
        }
      }
    }
    
    return cells;
  }

  /**
   * Check if coordinates are within map bounds
   * @param {number} x - X coordinate
   * @param {number} y - Y coordinate
   * @param {number} width - Map width
   * @param {number} height - Map height
   * @returns {boolean} True if within bounds
   */
  isInBounds(x, y, width, height) {
    return x >= 0 && x < width && y >= 0 && y < height;
  }

  /**
   * Set brush size
   * @param {number} size - New brush size (1-10)
   */
  setBrushSize(size) {
    this.brushSize = Math.max(1, Math.min(10, size));
  }
}
