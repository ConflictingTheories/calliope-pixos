/**
 * @file TextureAtlas Unit Tests
 * Tests for the TextureAtlas batching system
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import TextureAtlas from '../../src/engine/core/render/TextureAtlas.js';

// Mock render manager
const createMockRenderManager = () => ({
  engine: {
    gl: {
      createBuffer: vi.fn(() => ({})),
      bindBuffer: vi.fn(),
      bufferData: vi.fn(),
      createTexture: vi.fn(() => ({})),
      bindTexture: vi.fn(),
      texImage2D: vi.fn(),
      texParameteri: vi.fn(),
      deleteTexture: vi.fn(),
      deleteBuffer: vi.fn(),
      activeTexture: vi.fn(),
      getAttribLocation: vi.fn(() => 0),
      enableVertexAttribArray: vi.fn(),
      vertexAttribPointer: vi.fn(),
      drawElements: vi.fn(),
      ARRAY_BUFFER: 34962,
      ELEMENT_ARRAY_BUFFER: 34963,
      STATIC_DRAW: 35044,
      DYNAMIC_DRAW: 35048,
      TEXTURE_2D: 3553,
      TEXTURE0: 33984,
      RGBA: 6408,
      UNSIGNED_BYTE: 5121,
      TEXTURE_MIN_FILTER: 10241,
      TEXTURE_MAG_FILTER: 10240,
      TEXTURE_WRAP_S: 10242,
      TEXTURE_WRAP_T: 10243,
      NEAREST: 9728,
      CLAMP_TO_EDGE: 33071,
      TRIANGLES: 4,
      UNSIGNED_SHORT: 5123,
      FLOAT: 5126
    }
  }
});

describe('TextureAtlas', () => {
  let atlas;
  let mockRenderManager;

  beforeEach(() => {
    mockRenderManager = createMockRenderManager();
    atlas = new TextureAtlas(mockRenderManager);
  });

  describe('constructor', () => {
    it('should initialize with default values', () => {
      expect(atlas.enabled).toBe(true);
      expect(atlas.maxAtlasSize).toBe(4096);
      expect(atlas.padding).toBe(2);
      expect(atlas.maxSpritesPerBatch).toBe(10000);
    });

    it('should create empty maps for atlas storage', () => {
      expect(atlas.atlasTextures.size).toBe(0);
      expect(atlas.atlasEntries.size).toBe(0);
      expect(atlas.atlasDimensions.size).toBe(0);
    });
  });

  describe('init', () => {
    it('should create WebGL buffers', () => {
      atlas.init();
      
      expect(mockRenderManager.engine.gl.createBuffer).toHaveBeenCalledTimes(3);
      expect(atlas.batchVertexBuffer).toBeDefined();
      expect(atlas.batchTexCoordBuffer).toBeDefined();
      expect(atlas.batchIndexBuffer).toBeDefined();
    });

    it('should pre-generate index pattern', () => {
      atlas.init();
      
      // Check first quad indices (0,1,2,0,2,3)
      expect(atlas.sharedIndices[0]).toBe(0);
      expect(atlas.sharedIndices[1]).toBe(1);
      expect(atlas.sharedIndices[2]).toBe(2);
      expect(atlas.sharedIndices[3]).toBe(0);
      expect(atlas.sharedIndices[4]).toBe(2);
      expect(atlas.sharedIndices[5]).toBe(3);
      
      // Check second quad indices (4,5,6,4,6,7)
      expect(atlas.sharedIndices[6]).toBe(4);
      expect(atlas.sharedIndices[7]).toBe(5);
      expect(atlas.sharedIndices[8]).toBe(6);
    });
  });

  describe('getEntry', () => {
    it('should return null for non-existent atlas', () => {
      const entry = atlas.getEntry('nonexistent', 'test');
      expect(entry).toBeNull();
    });

    it('should return null for non-existent entry', () => {
      atlas.atlasEntries.set('test-atlas', new Map());
      const entry = atlas.getEntry('test-atlas', 'nonexistent');
      expect(entry).toBeNull();
    });

    it('should return entry when it exists', () => {
      const mockEntry = { id: 'test', x: 0, y: 0, width: 32, height: 32 };
      const entryMap = new Map();
      entryMap.set('test-entry', mockEntry);
      atlas.atlasEntries.set('test-atlas', entryMap);
      
      const entry = atlas.getEntry('test-atlas', 'test-entry');
      expect(entry).toEqual(mockEntry);
    });
  });

  describe('queueSprite', () => {
    it('should not queue if entry does not exist', () => {
      atlas.queueSprite('nonexistent', 'test', 0, 0, 0, 32, 32);
      expect(atlas.batchQueue.length).toBe(0);
    });

    it('should add sprite to batch queue', () => {
      const mockEntry = {
        id: 'test',
        u0: 0, v0: 0, u1: 0.5, v1: 0.5
      };
      const entryMap = new Map();
      entryMap.set('sprite1', mockEntry);
      atlas.atlasEntries.set('atlas1', entryMap);
      
      atlas.queueSprite('atlas1', 'sprite1', 100, 100, 0, 32, 32);
      
      expect(atlas.batchQueue.length).toBe(1);
      expect(atlas.batchQueue[0].textureId).toBe('atlas1');
      expect(atlas.batchQueue[0].shaderId).toBe('sprite');
    });
  });

  describe('clearQueue', () => {
    it('should clear batch queue', () => {
      atlas.batchQueue.push({}, {}, {});
      atlas.compiledBatches.set('test', {});
      
      atlas.clearQueue();
      
      expect(atlas.batchQueue.length).toBe(0);
      expect(atlas.compiledBatches.size).toBe(0);
    });
  });

  describe('getStats', () => {
    it('should return statistics object', () => {
      atlas.drawCallsThisFrame = 5;
      atlas.drawCallsSaved = 10;
      atlas.batchQueue.push({}, {}, {});
      
      const stats = atlas.getStats();
      
      expect(stats.drawCalls).toBe(5);
      expect(stats.saved).toBe(10);
      expect(stats.sprites).toBe(3);
    });
  });

  describe('dispose', () => {
    it('should clean up all resources', () => {
      atlas.init();
      atlas.atlasTextures.set('test', {});
      atlas.atlasEntries.set('test', new Map());
      
      atlas.dispose();
      
      expect(atlas.atlasTextures.size).toBe(0);
      expect(atlas.atlasEntries.size).toBe(0);
      expect(mockRenderManager.engine.gl.deleteTexture).toHaveBeenCalled();
      expect(mockRenderManager.engine.gl.deleteBuffer).toHaveBeenCalledTimes(3);
    });
  });
});
