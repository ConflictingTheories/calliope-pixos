/*
 * ---------------------------------------------------------------
 *        Pixospritz – Editor – Auto-Tiling System
 * ---------------------------------------------------------------
 * Copyright (c) 2022-2025  Kyle Derby MacInnis
 *
 * Intelligent tile placement system that automatically selects
 * appropriate tile variants based on neighboring tiles.
 * Supports 47-tile (Wang) terrain sets and simpler 16-tile sets.
 */

/**
 * Bitmask values for neighbor positions
 * Used to compute tile variants based on surrounding tiles
 */
const NEIGHBOR_BITS = {
  N:  0b00000001,  // North (top)
  NE: 0b00000010,  // North-East
  E:  0b00000100,  // East (right)
  SE: 0b00001000,  // South-East
  S:  0b00010000,  // South (bottom)
  SW: 0b00100000,  // South-West
  W:  0b01000000,  // West (left)
  NW: 0b10000000,  // North-West
};

/**
 * 4-directional neighbor offsets (for 16-tile sets)
 */
const NEIGHBORS_4 = [
  { dx: 0, dy: -1, bit: NEIGHBOR_BITS.N },  // North
  { dx: 1, dy: 0, bit: NEIGHBOR_BITS.E },   // East
  { dx: 0, dy: 1, bit: NEIGHBOR_BITS.S },   // South
  { dx: -1, dy: 0, bit: NEIGHBOR_BITS.W },  // West
];

/**
 * 8-directional neighbor offsets (for 47-tile sets)
 */
const NEIGHBORS_8 = [
  { dx: 0, dy: -1, bit: NEIGHBOR_BITS.N },   // North
  { dx: 1, dy: -1, bit: NEIGHBOR_BITS.NE },  // North-East
  { dx: 1, dy: 0, bit: NEIGHBOR_BITS.E },    // East
  { dx: 1, dy: 1, bit: NEIGHBOR_BITS.SE },   // South-East
  { dx: 0, dy: 1, bit: NEIGHBOR_BITS.S },    // South
  { dx: -1, dy: 1, bit: NEIGHBOR_BITS.SW },  // South-West
  { dx: -1, dy: 0, bit: NEIGHBOR_BITS.W },   // West
  { dx: -1, dy: -1, bit: NEIGHBOR_BITS.NW }, // North-West
];

/**
 * Standard 16-tile mapping for 4-directional autotile
 * Maps bitmask (N|E|S|W) to tile index in tileset
 */
const AUTOTILE_16 = {
  0b0000: 0,   // Isolated
  0b0001: 1,   // N
  0b0010: 2,   // E
  0b0011: 3,   // N+E
  0b0100: 4,   // S
  0b0101: 5,   // N+S
  0b0110: 6,   // E+S
  0b0111: 7,   // N+E+S
  0b1000: 8,   // W
  0b1001: 9,   // N+W
  0b1010: 10,  // E+W
  0b1011: 11,  // N+E+W
  0b1100: 12,  // S+W
  0b1101: 13,  // N+S+W
  0b1110: 14,  // E+S+W
  0b1111: 15,  // All sides
};

/**
 * AutoTiler - Manages automatic tile variant selection
 */
export default class AutoTiler {
  /**
   * @param {Object} options - AutoTiler configuration
   * @param {Object} options.tilesets - Map of tileset name to tileset config
   * @param {string} options.mode - '4-dir' or '8-dir' for neighbor checking
   */
  constructor(options = {}) {
    this.tilesets = options.tilesets || {};
    this.mode = options.mode || '4-dir';
    this.enabled = true;
  }

  /**
   * Register a tileset for auto-tiling
   * @param {string} name - Tileset identifier
   * @param {Object} config - Tileset configuration
   * @param {number} config.baseTile - Base tile ID for this terrain
   * @param {Array<number>} config.variants - Array of tile IDs for each bitmask
   * @param {Array<string>} config.matchTiles - Tile types that count as "same terrain"
   */
  registerTileset(name, config) {
    this.tilesets[name] = {
      baseTile: config.baseTile,
      variants: config.variants || [],
      matchTiles: config.matchTiles || [name],
      mode: config.mode || this.mode,
    };
  }

  /**
   * Get the appropriate tile variant based on neighbors
   * @param {number} x - X coordinate
   * @param {number} y - Y coordinate
   * @param {string} tileType - Type of tile being placed
   * @param {Object} mapData - Map data with cells
   * @param {Object} options - Additional options
   * @returns {number|string} The tile variant to use
   */
  getTileVariant(x, y, tileType, mapData, options = {}) {
    const tileset = this.tilesets[tileType];
    if (!tileset || !this.enabled) {
      return tileType; // Return original if no autotile config
    }

    const { layer = 0, mapWidth, mapHeight } = options;
    const cells = mapData.cells || mapData.layers?.[layer];
    if (!cells) return tileType;

    const neighbors = tileset.mode === '8-dir' ? NEIGHBORS_8 : NEIGHBORS_4;
    let bitmask = 0;

    for (const neighbor of neighbors) {
      const nx = x + neighbor.dx;
      const ny = y + neighbor.dy;

      // Check bounds
      if (nx < 0 || nx >= mapWidth || ny < 0 || ny >= mapHeight) {
        // Treat out-of-bounds as matching (for seamless edges)
        bitmask |= neighbor.bit;
        continue;
      }

      const neighborTile = cells[ny]?.[nx];
      
      // Check if neighbor matches
      if (this._tilesMatch(neighborTile, tileset.matchTiles)) {
        bitmask |= neighbor.bit;
      }
    }

    // For 8-dir mode, we need to mask out corners that don't have adjacent edges
    if (tileset.mode === '8-dir') {
      bitmask = this._cleanCorners(bitmask);
    }

    // Get variant from tileset or use standard mapping
    if (tileset.variants && tileset.variants[bitmask] !== undefined) {
      return tileset.variants[bitmask];
    }

    // For 4-dir mode, use the standard 16-tile mapping
    if (tileset.mode === '4-dir') {
      const mask4 = bitmask & 0b01010101; // Mask to cardinal directions only
      const normalized = (
        ((mask4 & NEIGHBOR_BITS.N) ? 0b0001 : 0) |
        ((mask4 & NEIGHBOR_BITS.E) ? 0b0010 : 0) |
        ((mask4 & NEIGHBOR_BITS.S) ? 0b0100 : 0) |
        ((mask4 & NEIGHBOR_BITS.W) ? 0b1000 : 0)
      );
      const variantIndex = AUTOTILE_16[normalized] ?? 0;
      
      // If tileset has base tile, offset by variant
      if (tileset.baseTile !== undefined) {
        return tileset.baseTile + variantIndex;
      }
    }

    return tileType;
  }

  /**
   * Update tiles around a position after a change
   * @param {number} x - X coordinate of changed tile
   * @param {number} y - Y coordinate of changed tile
   * @param {Object} mapData - Map data
   * @param {Object} options - Options including layer, mapWidth, mapHeight
   * @returns {Array} List of tiles to update
   */
  getAffectedTiles(x, y, mapData, options = {}) {
    const { layer = 0, mapWidth, mapHeight } = options;
    const cells = mapData.cells || mapData.layers?.[layer];
    if (!cells) return [];

    const updates = [];
    const neighbors = this.mode === '8-dir' ? NEIGHBORS_8 : NEIGHBORS_4;

    // Check all neighbors
    for (const neighbor of neighbors) {
      const nx = x + neighbor.dx;
      const ny = y + neighbor.dy;

      if (nx >= 0 && nx < mapWidth && ny >= 0 && ny < mapHeight) {
        const neighborTile = cells[ny]?.[nx];
        const tileset = this._getTilesetForTile(neighborTile);
        
        if (tileset) {
          const newVariant = this.getTileVariant(nx, ny, neighborTile, mapData, options);
          if (newVariant !== neighborTile) {
            updates.push({ x: nx, y: ny, layer, tile: newVariant });
          }
        }
      }
    }

    return updates;
  }

  /**
   * Process a tile placement and return all needed changes
   * @param {number} x - X coordinate
   * @param {number} y - Y coordinate
   * @param {string|number} tileType - Tile being placed
   * @param {Object} mapData - Map data
   * @param {Object} options - Options
   * @returns {Array} All tile changes to apply
   */
  processTilePlacement(x, y, tileType, mapData, options = {}) {
    if (!this.enabled) {
      return [{ x, y, layer: options.layer || 0, tile: tileType }];
    }

    const changes = [];
    const { layer = 0 } = options;

    // Get the correct variant for the placed tile
    const variant = this.getTileVariant(x, y, tileType, mapData, options);
    changes.push({ x, y, layer, tile: variant });

    // Update surrounding tiles
    const affectedTiles = this.getAffectedTiles(x, y, mapData, options);
    changes.push(...affectedTiles);

    return changes;
  }

  /**
   * Clean corner bits that don't have adjacent cardinal neighbors
   * (A corner only counts if both adjacent edges are present)
   */
  _cleanCorners(bitmask) {
    let cleaned = bitmask;
    
    // NE corner requires N and E
    if ((bitmask & NEIGHBOR_BITS.NE) && 
        !((bitmask & NEIGHBOR_BITS.N) && (bitmask & NEIGHBOR_BITS.E))) {
      cleaned &= ~NEIGHBOR_BITS.NE;
    }
    // SE corner requires S and E
    if ((bitmask & NEIGHBOR_BITS.SE) && 
        !((bitmask & NEIGHBOR_BITS.S) && (bitmask & NEIGHBOR_BITS.E))) {
      cleaned &= ~NEIGHBOR_BITS.SE;
    }
    // SW corner requires S and W
    if ((bitmask & NEIGHBOR_BITS.SW) && 
        !((bitmask & NEIGHBOR_BITS.S) && (bitmask & NEIGHBOR_BITS.W))) {
      cleaned &= ~NEIGHBOR_BITS.SW;
    }
    // NW corner requires N and W
    if ((bitmask & NEIGHBOR_BITS.NW) && 
        !((bitmask & NEIGHBOR_BITS.N) && (bitmask & NEIGHBOR_BITS.W))) {
      cleaned &= ~NEIGHBOR_BITS.NW;
    }

    return cleaned;
  }

  /**
   * Check if a tile matches any in the list
   */
  _tilesMatch(tile, matchList) {
    if (tile === null || tile === undefined) return false;
    return matchList.includes(tile) || matchList.includes(String(tile));
  }

  /**
   * Find tileset configuration for a given tile
   */
  _getTilesetForTile(tile) {
    for (const [name, config] of Object.entries(this.tilesets)) {
      if (config.matchTiles.includes(tile) || 
          config.matchTiles.includes(String(tile)) ||
          tile === name) {
        return config;
      }
    }
    return null;
  }

  /**
   * Enable/disable auto-tiling
   * @param {boolean} enabled
   */
  setEnabled(enabled) {
    this.enabled = enabled;
  }

  /**
   * Set the neighbor checking mode
   * @param {'4-dir'|'8-dir'} mode
   */
  setMode(mode) {
    this.mode = mode;
  }
}

export { NEIGHBOR_BITS, NEIGHBORS_4, NEIGHBORS_8, AUTOTILE_16 };
