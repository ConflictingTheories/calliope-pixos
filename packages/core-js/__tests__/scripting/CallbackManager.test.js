/**
 * @file CallbackManager Unit Tests
 * Tests for the engine callback/event system
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import CallbackManager from '../../src/engine/scripting/CallbackManager.js';

// Mock engine
const createMockEngine = () => ({
  spritz: {
    world: {}
  }
});

describe('CallbackManager', () => {
  let manager;
  let mockEngine;

  beforeEach(() => {
    mockEngine = createMockEngine();
    manager = new CallbackManager(mockEngine);
  });

  describe('constructor', () => {
    it('should initialize with empty callback maps', () => {
      expect(manager.callbacks.size).toBe(0);
      expect(manager.wildcardCallbacks.size).toBe(0);
    });

    it('should have built-in event types defined', () => {
      expect(manager.builtInEvents).toContain('zone:enter');
      expect(manager.builtInEvents).toContain('sprite:click');
      expect(manager.builtInEvents).toContain('update');
    });
  });

  describe('on', () => {
    it('should register a callback and return an ID', () => {
      const handler = vi.fn();
      const id = manager.on('zone:enter', handler);
      
      expect(id).toMatch(/^cb_\d+$/);
      expect(manager.callbacks.has('zone:enter')).toBe(true);
    });

    it('should register wildcard callbacks separately', () => {
      const handler = vi.fn();
      manager.on('sprite:*', handler);
      
      expect(manager.wildcardCallbacks.has('sprite:*')).toBe(true);
      expect(manager.callbacks.has('sprite:*')).toBe(false);
    });

    it('should sort callbacks by priority', () => {
      const handler1 = vi.fn();
      const handler2 = vi.fn();
      
      manager.on('test', handler1, { priority: 1 });
      manager.on('test', handler2, { priority: 10 });
      
      const callbacks = manager.callbacks.get('test');
      expect(callbacks[0].priority).toBe(10);
      expect(callbacks[1].priority).toBe(1);
    });
  });

  describe('once', () => {
    it('should register a one-time callback', () => {
      const handler = vi.fn();
      manager.once('test', handler);
      
      const callbacks = manager.callbacks.get('test');
      expect(callbacks[0].once).toBe(true);
    });
  });

  describe('off', () => {
    it('should remove a registered callback', () => {
      const handler = vi.fn();
      const id = manager.on('test', handler);
      
      const removed = manager.off(id);
      
      expect(removed).toBe(true);
      expect(manager.callbacks.has('test')).toBe(false);
    });

    it('should return false for non-existent ID', () => {
      const removed = manager.off('nonexistent');
      expect(removed).toBe(false);
    });
  });

  describe('emit', () => {
    it('should invoke registered callbacks', () => {
      const handler = vi.fn();
      manager.on('test', handler);
      
      manager.emit('test', { value: 42 });
      
      expect(handler).toHaveBeenCalled();
      expect(handler.mock.calls[0][0].data.value).toBe(42);
    });

    it('should return event object with timestamp', () => {
      const event = manager.emit('test');
      
      expect(event.type).toBe('test');
      expect(event.timestamp).toBeDefined();
    });

    it('should support preventDefault', () => {
      const handler = (event) => event.preventDefault();
      manager.on('test', handler);
      
      const event = manager.emit('test');
      
      expect(event.defaultPrevented).toBe(true);
    });

    it('should support stopPropagation', () => {
      const handler1 = vi.fn((event) => event.stopPropagation());
      const handler2 = vi.fn();
      
      manager.on('test', handler1, { priority: 10 });
      manager.on('test', handler2, { priority: 1 });
      
      manager.emit('test');
      
      expect(handler1).toHaveBeenCalled();
      expect(handler2).not.toHaveBeenCalled();
    });

    it('should remove once callbacks after invocation', () => {
      const handler = vi.fn();
      manager.once('test', handler);
      
      manager.emit('test');
      manager.emit('test');
      
      expect(handler).toHaveBeenCalledTimes(1);
    });
  });

  describe('wildcard matching', () => {
    it('should match wildcard patterns', () => {
      const handler = vi.fn();
      manager.on('sprite:*', handler);
      
      manager.emit('sprite:click');
      manager.emit('sprite:hover');
      
      expect(handler).toHaveBeenCalledTimes(2);
    });

    it('should match complex patterns', () => {
      const handler = vi.fn();
      manager.on('zone:*:enter', handler);
      
      expect(manager.matchesPattern('zone:forest:enter', 'zone:*:enter')).toBe(true);
      expect(manager.matchesPattern('zone:enter', 'zone:*:enter')).toBe(false);
    });
  });

  describe('filtering', () => {
    it('should filter events by data properties', () => {
      const handler = vi.fn();
      manager.on('test', handler, { filter: { zoneId: 'forest' } });
      
      manager.emit('test', { zoneId: 'forest' });
      manager.emit('test', { zoneId: 'desert' });
      
      expect(handler).toHaveBeenCalledTimes(1);
    });

    it('should support function filters', () => {
      const handler = vi.fn();
      manager.on('test', handler, { 
        filter: { value: (v) => v > 10 } 
      });
      
      manager.emit('test', { value: 5 });
      manager.emit('test', { value: 15 });
      
      expect(handler).toHaveBeenCalledTimes(1);
    });
  });

  describe('deferred mode', () => {
    it('should queue events when deferred', () => {
      const handler = vi.fn();
      manager.on('test', handler);
      
      manager.setDeferredMode(true);
      manager.emit('test');
      
      expect(handler).not.toHaveBeenCalled();
      expect(manager.eventQueue.length).toBe(1);
      
      manager.processQueue();
      expect(handler).toHaveBeenCalled();
    });

    it('should process queue when disabled', () => {
      const handler = vi.fn();
      manager.on('test', handler);
      
      manager.setDeferredMode(true);
      manager.emit('test');
      manager.setDeferredMode(false);
      
      expect(handler).toHaveBeenCalled();
    });
  });

  describe('convenience methods', () => {
    it('should register zone callbacks', () => {
      const callbacks = {
        onEnter: vi.fn(),
        onExit: vi.fn()
      };
      
      const ids = manager.registerZoneCallbacks('forest', callbacks);
      
      expect(ids.length).toBe(2);
    });

    it('should register sprite callbacks', () => {
      const callbacks = {
        onClick: vi.fn()
      };
      
      const ids = manager.registerSpriteCallbacks('player', callbacks);
      
      expect(ids.length).toBe(1);
    });

    it('should register update callback', () => {
      const handler = vi.fn();
      const id = manager.onUpdate(handler);
      
      manager.emit('update', { dt: 16.67, time: 1000 });
      
      expect(handler).toHaveBeenCalledWith(16.67, 1000);
    });
  });

  describe('getLuaBindings', () => {
    it('should return Lua-compatible bindings', () => {
      const bindings = manager.getLuaBindings();
      
      expect(typeof bindings.on).toBe('function');
      expect(typeof bindings.once).toBe('function');
      expect(typeof bindings.off).toBe('function');
      expect(typeof bindings.emit).toBe('function');
      expect(typeof bindings.on_zone_enter).toBe('function');
    });
  });

  describe('clear', () => {
    it('should remove all callbacks', () => {
      manager.on('test1', vi.fn());
      manager.on('test2', vi.fn());
      manager.on('wild:*', vi.fn());
      
      manager.clear();
      
      expect(manager.callbacks.size).toBe(0);
      expect(manager.wildcardCallbacks.size).toBe(0);
    });
  });
});
