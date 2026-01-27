/*                                                 *\
** ----------------------------------------------- **
**          Calliope - Pixos Game Engine           **
** ----------------------------------------------- **
**  Copyright (c) 2020-2025 - Kyle Derby MacInnis  **
**                                                 **
**    Any unauthorized distribution or transfer    **
**       of this work is strictly prohibited.      **
**                                                 **
**               All Rights Reserved.              **
** ----------------------------------------------- **
\*                                                 */

/**
 * @typedef {object} AtlasEntry
 * @property {string} id - Unique texture identifier.
 * @property {number} x - X position in atlas (pixels).
 * @property {number} y - Y position in atlas (pixels).
 * @property {number} width - Width in atlas (pixels).
 * @property {number} height - Height in atlas (pixels).
 * @property {number} u0 - Left UV coordinate (0-1).
 * @property {number} v0 - Top UV coordinate (0-1).
 * @property {number} u1 - Right UV coordinate (0-1).
 * @property {number} v1 - Bottom UV coordinate (0-1).
 */

/**
 * @typedef {object} BatchEntry
 * @property {Float32Array} vertices - Vertex positions.
 * @property {Float32Array} texCoords - Texture coordinates.
 * @property {Uint16Array} indices - Element indices.
 * @property {string} textureId - Atlas texture ID.
 * @property {string} shaderId - Shader program ID.
 * @property {number} priority - Render priority (z-order).
 */

/**
 * @typedef {object} DrawBatch
 * @property {WebGLTexture} texture - Atlas texture.
 * @property {string} shaderId - Shader to use.
 * @property {Float32Array} vertices - Combined vertex data.
 * @property {Float32Array} texCoords - Combined texture coordinates.
 * @property {Uint16Array} indices - Combined indices.
 * @property {number} count - Number of indices to draw.
 */

/**
 * TextureAtlas - Packs multiple textures into atlas textures for batch rendering.
 * Reduces draw calls by combining sprites that share the same texture atlas.
 */
export default class TextureAtlas {
  /**
   * Creates an instance of TextureAtlas.
   * @param {import('./manager.js').default} renderManager - The render manager instance.
   */
  constructor(renderManager) {
    /** @type {import('./manager.js').default} */
    this.renderManager = renderManager;

    /** @type {Map<string, WebGLTexture>} Atlas name -> GL texture */
    this.atlasTextures = new Map();

    /** @type {Map<string, Map<string, AtlasEntry>>} Atlas name -> (entry ID -> entry) */
    this.atlasEntries = new Map();

    /** @type {Map<string, {width: number, height: number}>} Atlas dimensions */
    this.atlasDimensions = new Map();

    /** @type {BatchEntry[]} Pending batch entries */
    this.batchQueue = [];

    /** @type {Map<string, DrawBatch>} Compiled batches by key */
    this.compiledBatches = new Map();

    /** @type {number} Maximum atlas size (WebGL2 typically supports 16384) */
    this.maxAtlasSize = 4096;

    /** @type {number} Padding between textures to prevent bleeding */
    this.padding = 2;

    /** @type {boolean} Whether batching is enabled */
    this.enabled = true;

    /** @type {number} Statistics: draw calls this frame */
    this.drawCallsThisFrame = 0;

    /** @type {number} Statistics: draw calls saved */
    this.drawCallsSaved = 0;

    // Batch buffers (reusable)
    /** @type {WebGLBuffer|null} */
    this.batchVertexBuffer = null;
    /** @type {WebGLBuffer|null} */
    this.batchTexCoordBuffer = null;
    /** @type {WebGLBuffer|null} */
    this.batchIndexBuffer = null;

    /** @type {number} Maximum sprites per batch */
    this.maxSpritesPerBatch = 10000;

    /** @type {Float32Array} Shared vertex array */
    this.sharedVertices = new Float32Array(this.maxSpritesPerBatch * 12); // 4 verts * 3 components
    /** @type {Float32Array} Shared tex coord array */
    this.sharedTexCoords = new Float32Array(this.maxSpritesPerBatch * 8); // 4 verts * 2 components
    /** @type {Uint16Array} Shared index array */
    this.sharedIndices = new Uint16Array(this.maxSpritesPerBatch * 6); // 2 triangles * 3 indices
  }

  /**
   * Initialize WebGL buffers.
   */
  init() {
    const gl = this.renderManager.engine.gl;
    if (!gl) return;

    this.batchVertexBuffer = gl.createBuffer();
    this.batchTexCoordBuffer = gl.createBuffer();
    this.batchIndexBuffer = gl.createBuffer();

    // Pre-generate index pattern (0,1,2, 0,2,3 for each quad)
    for (let i = 0; i < this.maxSpritesPerBatch; i++) {
      const base = i * 6;
      const vertBase = i * 4;
      this.sharedIndices[base + 0] = vertBase + 0;
      this.sharedIndices[base + 1] = vertBase + 1;
      this.sharedIndices[base + 2] = vertBase + 2;
      this.sharedIndices[base + 3] = vertBase + 0;
      this.sharedIndices[base + 4] = vertBase + 2;
      this.sharedIndices[base + 5] = vertBase + 3;
    }
  }

  /**
   * Creates a texture atlas from an array of image sources.
   * Uses a shelf-based packing algorithm.
   * @param {string} atlasId - Unique atlas identifier.
   * @param {{id: string, image: HTMLImageElement|ImageData}[]} images - Images to pack.
   * @returns {Map<string, AtlasEntry>} Map of entry IDs to atlas entries.
   */
  createAtlas(atlasId, images) {
    const gl = this.renderManager.engine.gl;
    if (!gl) return new Map();

    // Sort images by height (tallest first) for better packing
    const sorted = [...images].sort((a, b) => {
      const hA = a.image.height || a.image.naturalHeight;
      const hB = b.image.height || b.image.naturalHeight;
      return hB - hA;
    });

    // Calculate total area needed
    let totalArea = 0;
    for (const img of sorted) {
      const w = (img.image.width || img.image.naturalWidth) + this.padding;
      const h = (img.image.height || img.image.naturalHeight) + this.padding;
      totalArea += w * h;
    }

    // Determine atlas size (power of 2, at least sqrt(totalArea))
    let size = 64;
    while (size * size < totalArea * 1.2 && size < this.maxAtlasSize) {
      size *= 2;
    }

    // Create canvas for atlas
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');

    // Shelf packing
    const entries = new Map();
    let shelfY = 0;
    let shelfHeight = 0;
    let cursorX = 0;

    for (const img of sorted) {
      const w = img.image.width || img.image.naturalWidth;
      const h = img.image.height || img.image.naturalHeight;

      // Check if fits on current shelf
      if (cursorX + w + this.padding > size) {
        // Move to next shelf
        shelfY += shelfHeight + this.padding;
        shelfHeight = 0;
        cursorX = 0;
      }

      // Check if fits vertically
      if (shelfY + h + this.padding > size) {
        console.warn(`TextureAtlas: Image ${img.id} doesn't fit in atlas ${atlasId}`);
        continue;
      }

      // Draw image to atlas
      ctx.drawImage(img.image, cursorX, shelfY);

      // Create entry
      const entry = {
        id: img.id,
        x: cursorX,
        y: shelfY,
        width: w,
        height: h,
        u0: cursorX / size,
        v0: shelfY / size,
        u1: (cursorX + w) / size,
        v1: (shelfY + h) / size,
      };
      entries.set(img.id, entry);

      // Update shelf
      cursorX += w + this.padding;
      shelfHeight = Math.max(shelfHeight, h);
    }

    // Create GL texture
    const texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, canvas);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

    // Store atlas
    this.atlasTextures.set(atlasId, texture);
    this.atlasEntries.set(atlasId, entries);
    this.atlasDimensions.set(atlasId, { width: size, height: size });

    return entries;
  }

  /**
   * Get UV coordinates for a texture in an atlas.
   * @param {string} atlasId - Atlas identifier.
   * @param {string} entryId - Entry identifier.
   * @returns {AtlasEntry|null} The atlas entry or null.
   */
  getEntry(atlasId, entryId) {
    const entries = this.atlasEntries.get(atlasId);
    return entries ? entries.get(entryId) || null : null;
  }

  /**
   * Queue a sprite for batched rendering.
   * @param {string} atlasId - Atlas containing the texture.
   * @param {string} entryId - Entry in the atlas.
   * @param {number} x - World X position.
   * @param {number} y - World Y position.
   * @param {number} z - World Z position.
   * @param {number} width - Sprite width.
   * @param {number} height - Sprite height.
   * @param {string} [shaderId='sprite'] - Shader to use.
   * @param {number} [priority=0] - Render priority.
   */
  queueSprite(atlasId, entryId, x, y, z, width, height, shaderId = 'sprite', priority = 0) {
    const entry = this.getEntry(atlasId, entryId);
    if (!entry) return;

    // Generate quad vertices
    const halfW = width / 2;
    const halfH = height / 2;

    const vertices = new Float32Array([
      x - halfW,
      y - halfH,
      z,
      x + halfW,
      y - halfH,
      z,
      x + halfW,
      y + halfH,
      z,
      x - halfW,
      y + halfH,
      z,
    ]);

    const texCoords = new Float32Array([
      entry.u0,
      entry.v1,
      entry.u1,
      entry.v1,
      entry.u1,
      entry.v0,
      entry.u0,
      entry.v0,
    ]);

    const indices = new Uint16Array([0, 1, 2, 0, 2, 3]);

    this.batchQueue.push({
      vertices,
      texCoords,
      indices,
      textureId: atlasId,
      shaderId,
      priority,
    });
  }

  /**
   * Compile queued sprites into optimized batches.
   * Groups by texture and shader, sorts by priority.
   */
  compileBatches() {
    if (this.batchQueue.length === 0) return;

    // Sort by priority, then by texture+shader
    this.batchQueue.sort((a, b) => {
      if (a.priority !== b.priority) return a.priority - b.priority;
      if (a.textureId !== b.textureId) return a.textureId.localeCompare(b.textureId);
      return a.shaderId.localeCompare(b.shaderId);
    });

    // Group into batches
    this.compiledBatches.clear();
    let currentKey = '';
    let currentBatch = null;
    let vertexOffset = 0;
    let indexOffset = 0;
    let baseVertex = 0;

    for (const entry of this.batchQueue) {
      const key = `${entry.textureId}|${entry.shaderId}`;

      if (key !== currentKey || baseVertex + 4 > 65535) {
        // Start new batch
        if (currentBatch) {
          this.finalizeBatch(currentBatch, vertexOffset, indexOffset);
        }

        currentKey = key;
        currentBatch = {
          texture: this.atlasTextures.get(entry.textureId),
          shaderId: entry.shaderId,
          vertices: this.sharedVertices,
          texCoords: this.sharedTexCoords,
          indices: this.sharedIndices,
          count: 0,
        };
        vertexOffset = 0;
        indexOffset = 0;
        baseVertex = 0;
      }

      // Copy vertices
      for (let i = 0; i < entry.vertices.length; i++) {
        this.sharedVertices[vertexOffset * 3 + i] = entry.vertices[i];
      }

      // Copy tex coords
      for (let i = 0; i < entry.texCoords.length; i++) {
        this.sharedTexCoords[vertexOffset * 2 + i] = entry.texCoords[i];
      }

      // Adjust and copy indices
      for (let i = 0; i < entry.indices.length; i++) {
        this.sharedIndices[indexOffset + i] = entry.indices[i] + baseVertex;
      }

      vertexOffset += 4;
      indexOffset += 6;
      baseVertex += 4;
      currentBatch.count += 6;
    }

    // Finalize last batch
    if (currentBatch) {
      this.finalizeBatch(currentBatch, vertexOffset, indexOffset);
      this.compiledBatches.set(currentKey, currentBatch);
    }

    this.drawCallsSaved = this.batchQueue.length - this.compiledBatches.size;
  }

  /**
   * Finalize a batch by trimming arrays.
   * @param {DrawBatch} batch - Batch to finalize.
   * @param {number} vertexCount - Number of vertices.
   * @param {number} indexCount - Number of indices.
   */
  finalizeBatch(batch, vertexCount, indexCount) {
    batch.vertices = new Float32Array(this.sharedVertices.buffer, 0, vertexCount * 3);
    batch.texCoords = new Float32Array(this.sharedTexCoords.buffer, 0, vertexCount * 2);
    batch.indices = new Uint16Array(this.sharedIndices.buffer, 0, indexCount);
  }

  /**
   * Render all compiled batches.
   * @param {WebGLProgram} program - Shader program to use.
   */
  renderBatches(program) {
    const gl = this.renderManager.engine.gl;
    if (!gl || this.compiledBatches.size === 0) return;

    this.drawCallsThisFrame = 0;

    for (const [key, batch] of this.compiledBatches) {
      if (!batch.texture || batch.count === 0) continue;

      // Bind texture
      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, batch.texture);

      // Upload vertex data
      gl.bindBuffer(gl.ARRAY_BUFFER, this.batchVertexBuffer);
      gl.bufferData(gl.ARRAY_BUFFER, batch.vertices, gl.DYNAMIC_DRAW);

      const posLoc = gl.getAttribLocation(program, 'aVertexPosition');
      if (posLoc >= 0) {
        gl.enableVertexAttribArray(posLoc);
        gl.vertexAttribPointer(posLoc, 3, gl.FLOAT, false, 0, 0);
      }

      // Upload tex coord data
      gl.bindBuffer(gl.ARRAY_BUFFER, this.batchTexCoordBuffer);
      gl.bufferData(gl.ARRAY_BUFFER, batch.texCoords, gl.DYNAMIC_DRAW);

      const texLoc = gl.getAttribLocation(program, 'aTextureCoord');
      if (texLoc >= 0) {
        gl.enableVertexAttribArray(texLoc);
        gl.vertexAttribPointer(texLoc, 2, gl.FLOAT, false, 0, 0);
      }

      // Upload indices and draw
      gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.batchIndexBuffer);
      gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, batch.indices, gl.DYNAMIC_DRAW);

      gl.drawElements(gl.TRIANGLES, batch.count, gl.UNSIGNED_SHORT, 0);
      this.drawCallsThisFrame++;
    }
  }

  /**
   * Clear the batch queue for next frame.
   */
  clearQueue() {
    this.batchQueue.length = 0;
    this.compiledBatches.clear();
  }

  /**
   * Get rendering statistics.
   * @returns {{drawCalls: number, saved: number, batches: number, sprites: number}}
   */
  getStats() {
    return {
      drawCalls: this.drawCallsThisFrame,
      saved: this.drawCallsSaved,
      batches: this.compiledBatches.size,
      sprites: this.batchQueue.length,
    };
  }

  /**
   * Dispose of all atlas textures.
   */
  dispose() {
    const gl = this.renderManager.engine.gl;
    if (!gl) return;

    for (const texture of this.atlasTextures.values()) {
      gl.deleteTexture(texture);
    }

    this.atlasTextures.clear();
    this.atlasEntries.clear();
    this.atlasDimensions.clear();
    this.clearQueue();

    if (this.batchVertexBuffer) gl.deleteBuffer(this.batchVertexBuffer);
    if (this.batchTexCoordBuffer) gl.deleteBuffer(this.batchTexCoordBuffer);
    if (this.batchIndexBuffer) gl.deleteBuffer(this.batchIndexBuffer);
  }
}
