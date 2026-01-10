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

import { debug } from '../utils/debug-logger.js';

/**
 * @typedef {object} CallbackRegistration
 * @property {string} id - Unique callback ID.
 * @property {string} event - Event name (supports wildcards).
 * @property {Function} handler - Callback function.
 * @property {object} [context] - 'this' context for handler.
 * @property {number} [priority=0] - Execution priority (higher = earlier).
 * @property {boolean} [once=false] - Remove after first invocation.
 * @property {object} [filter] - Optional event data filter.
 */

/**
 * @typedef {object} CallbackEvent
 * @property {string} type - Event type name.
 * @property {object} data - Event payload.
 * @property {number} timestamp - Event timestamp.
 * @property {boolean} defaultPrevented - Whether default was prevented.
 * @property {boolean} propagationStopped - Whether propagation was stopped.
 * @property {string} [target] - Target entity ID.
 * @property {string} [source] - Source entity ID.
 */

/**
 * CallbackManager - Manages engine event callbacks for scripting integration.
 * Supports zone/sprite/trigger events with priority and filtering.
 */
export default class CallbackManager {
  /**
   * Creates an instance of CallbackManager.
   * @param {import('../core/index.js').default} engine - The engine instance.
   */
  constructor(engine) {
    /** @type {import('../core/index.js').default} */
    this.engine = engine;
    
    /** @type {Map<string, CallbackRegistration[]>} Event name -> registrations */
    this.callbacks = new Map();
    
    /** @type {Map<string, CallbackRegistration[]>} Wildcard patterns */
    this.wildcardCallbacks = new Map();
    
    /** @type {number} Unique ID counter */
    this.idCounter = 0;
    
    /** @type {Set<string>} IDs to remove after current emission */
    this.pendingRemovals = new Set();
    
    /** @type {boolean} Currently emitting an event */
    this.isEmitting = false;
    
    /** @type {CallbackEvent[]} Event queue for deferred processing */
    this.eventQueue = [];
    
    /** @type {boolean} Process events immediately or queue them */
    this.deferredMode = false;
    
    // Register built-in event types
    this.builtInEvents = [
      'zone:enter', 'zone:exit', 'zone:load', 'zone:unload',
      'sprite:click', 'sprite:hover', 'sprite:collide', 'sprite:spawn', 'sprite:destroy',
      'trigger:enter', 'trigger:exit', 'trigger:activate',
      'action:start', 'action:complete', 'action:cancel',
      'player:move', 'player:interact', 'player:damage', 'player:heal',
      'game:start', 'game:pause', 'game:resume', 'game:stop',
      'cutscene:start', 'cutscene:end', 'cutscene:skip',
      'menu:open', 'menu:close', 'menu:select',
      'input:key', 'input:gamepad', 'input:mouse',
      'update', 'render', 'physics'
    ];
  }

  /**
   * Register a callback for an event.
   * @param {string} event - Event name (supports wildcards like 'sprite:*').
   * @param {Function} handler - Callback function.
   * @param {object} [options={}] - Registration options.
   * @returns {string} Registration ID for unregistering.
   */
  on(event, handler, options = {}) {
    const id = `cb_${++this.idCounter}`;
    const registration = {
      id,
      event,
      handler,
      context: options.context || null,
      priority: options.priority || 0,
      once: options.once || false,
      filter: options.filter || null
    };
    
    if (event.includes('*')) {
      // Wildcard registration
      if (!this.wildcardCallbacks.has(event)) {
        this.wildcardCallbacks.set(event, []);
      }
      this.wildcardCallbacks.get(event).push(registration);
      this.sortByPriority(this.wildcardCallbacks.get(event));
    } else {
      // Direct registration
      if (!this.callbacks.has(event)) {
        this.callbacks.set(event, []);
      }
      this.callbacks.get(event).push(registration);
      this.sortByPriority(this.callbacks.get(event));
    }
    
    debug('CallbackManager', `Registered callback ${id} for event: ${event}`);
    return id;
  }

  /**
   * Register a one-time callback.
   * @param {string} event - Event name.
   * @param {Function} handler - Callback function.
   * @param {object} [options={}] - Registration options.
   * @returns {string} Registration ID.
   */
  once(event, handler, options = {}) {
    return this.on(event, handler, { ...options, once: true });
  }

  /**
   * Unregister a callback by ID.
   * @param {string} id - Registration ID.
   * @returns {boolean} Whether the callback was found and removed.
   */
  off(id) {
    if (this.isEmitting) {
      // Defer removal until after emission
      this.pendingRemovals.add(id);
      return true;
    }
    
    return this.removeById(id);
  }

  /**
   * Remove a callback by ID from all maps.
   * @param {string} id - Registration ID.
   * @returns {boolean} Whether found and removed.
   */
  removeById(id) {
    for (const [event, registrations] of this.callbacks) {
      const idx = registrations.findIndex(r => r.id === id);
      if (idx >= 0) {
        registrations.splice(idx, 1);
        if (registrations.length === 0) this.callbacks.delete(event);
        debug('CallbackManager', `Removed callback ${id}`);
        return true;
      }
    }
    
    for (const [pattern, registrations] of this.wildcardCallbacks) {
      const idx = registrations.findIndex(r => r.id === id);
      if (idx >= 0) {
        registrations.splice(idx, 1);
        if (registrations.length === 0) this.wildcardCallbacks.delete(pattern);
        return true;
      }
    }
    
    return false;
  }

  /**
   * Remove all callbacks for an event.
   * @param {string} event - Event name.
   */
  offAll(event) {
    this.callbacks.delete(event);
    this.wildcardCallbacks.delete(event);
  }

  /**
   * Emit an event to all registered callbacks.
   * @param {string} event - Event name.
   * @param {object} [data={}] - Event data payload.
   * @returns {CallbackEvent} The event object (check defaultPrevented).
   */
  emit(event, data = {}) {
    const callbackEvent = {
      type: event,
      data,
      timestamp: Date.now(),
      defaultPrevented: false,
      propagationStopped: false,
      target: data.target || null,
      source: data.source || null,
      
      preventDefault() {
        this.defaultPrevented = true;
      },
      
      stopPropagation() {
        this.propagationStopped = true;
      }
    };
    
    if (this.deferredMode) {
      this.eventQueue.push(callbackEvent);
      return callbackEvent;
    }
    
    this.processEvent(callbackEvent);
    return callbackEvent;
  }

  /**
   * Process a single event.
   * @param {CallbackEvent} event - Event to process.
   */
  processEvent(event) {
    this.isEmitting = true;
    const toRemove = [];
    
    // Get direct callbacks
    const directCallbacks = this.callbacks.get(event.type) || [];
    
    // Get wildcard callbacks
    const wildcardMatches = this.getWildcardMatches(event.type);
    
    // Combine and sort by priority
    const allCallbacks = [...directCallbacks, ...wildcardMatches];
    this.sortByPriority(allCallbacks);
    
    for (const registration of allCallbacks) {
      if (event.propagationStopped) break;
      
      // Check filter
      if (registration.filter && !this.matchesFilter(event.data, registration.filter)) {
        continue;
      }
      
      try {
        if (registration.context) {
          registration.handler.call(registration.context, event);
        } else {
          registration.handler(event);
        }
        
        if (registration.once) {
          toRemove.push(registration.id);
        }
      } catch (error) {
        console.error(`CallbackManager: Error in callback for ${event.type}:`, error);
      }
    }
    
    this.isEmitting = false;
    
    // Clean up once callbacks and pending removals
    for (const id of toRemove) {
      this.removeById(id);
    }
    
    for (const id of this.pendingRemovals) {
      this.removeById(id);
    }
    this.pendingRemovals.clear();
  }

  /**
   * Get all wildcard registrations matching an event.
   * @param {string} event - Event name.
   * @returns {CallbackRegistration[]} Matching registrations.
   */
  getWildcardMatches(event) {
    const matches = [];
    
    for (const [pattern, registrations] of this.wildcardCallbacks) {
      if (this.matchesPattern(event, pattern)) {
        matches.push(...registrations);
      }
    }
    
    return matches;
  }

  /**
   * Check if an event matches a wildcard pattern.
   * @param {string} event - Event name.
   * @param {string} pattern - Pattern with wildcards.
   * @returns {boolean} Whether it matches.
   */
  matchesPattern(event, pattern) {
    // Convert pattern to regex
    const regexStr = '^' + pattern
      .replace(/[.+?^${}()|[\]\\]/g, '\\$&')
      .replace(/\*/g, '.*')
      .replace(/\?/g, '.') + '$';
    
    return new RegExp(regexStr).test(event);
  }

  /**
   * Check if event data matches a filter.
   * @param {object} data - Event data.
   * @param {object} filter - Filter criteria.
   * @returns {boolean} Whether data matches filter.
   */
  matchesFilter(data, filter) {
    for (const [key, value] of Object.entries(filter)) {
      if (typeof value === 'function') {
        if (!value(data[key])) return false;
      } else if (data[key] !== value) {
        return false;
      }
    }
    return true;
  }

  /**
   * Sort registrations by priority (descending).
   * @param {CallbackRegistration[]} registrations - Array to sort.
   */
  sortByPriority(registrations) {
    registrations.sort((a, b) => b.priority - a.priority);
  }

  /**
   * Process all queued events (when in deferred mode).
   */
  processQueue() {
    while (this.eventQueue.length > 0) {
      const event = this.eventQueue.shift();
      this.processEvent(event);
    }
  }

  /**
   * Enable or disable deferred event processing.
   * @param {boolean} enabled - Whether to defer events.
   */
  setDeferredMode(enabled) {
    this.deferredMode = enabled;
    if (!enabled) {
      this.processQueue();
    }
  }

  /**
   * Create callback hooks for zone events.
   * @param {string} zoneId - Zone identifier.
   * @param {object} callbacks - Callback definitions.
   * @returns {string[]} Registration IDs.
   */
  registerZoneCallbacks(zoneId, callbacks) {
    const ids = [];
    
    if (callbacks.onEnter) {
      ids.push(this.on('zone:enter', callbacks.onEnter, {
        filter: { zoneId }
      }));
    }
    
    if (callbacks.onExit) {
      ids.push(this.on('zone:exit', callbacks.onExit, {
        filter: { zoneId }
      }));
    }
    
    if (callbacks.onLoad) {
      ids.push(this.on('zone:load', callbacks.onLoad, {
        filter: { zoneId }
      }));
    }
    
    return ids;
  }

  /**
   * Create callback hooks for sprite events.
   * @param {string} spriteId - Sprite identifier.
   * @param {object} callbacks - Callback definitions.
   * @returns {string[]} Registration IDs.
   */
  registerSpriteCallbacks(spriteId, callbacks) {
    const ids = [];
    
    if (callbacks.onClick) {
      ids.push(this.on('sprite:click', callbacks.onClick, {
        filter: { spriteId }
      }));
    }
    
    if (callbacks.onHover) {
      ids.push(this.on('sprite:hover', callbacks.onHover, {
        filter: { spriteId }
      }));
    }
    
    if (callbacks.onCollide) {
      ids.push(this.on('sprite:collide', callbacks.onCollide, {
        filter: { spriteId }
      }));
    }
    
    return ids;
  }

  /**
   * Create callback hooks for trigger events.
   * @param {string} triggerId - Trigger identifier.
   * @param {object} callbacks - Callback definitions.
   * @returns {string[]} Registration IDs.
   */
  registerTriggerCallbacks(triggerId, callbacks) {
    const ids = [];
    
    if (callbacks.onEnter) {
      ids.push(this.on('trigger:enter', callbacks.onEnter, {
        filter: { triggerId }
      }));
    }
    
    if (callbacks.onExit) {
      ids.push(this.on('trigger:exit', callbacks.onExit, {
        filter: { triggerId }
      }));
    }
    
    if (callbacks.onActivate) {
      ids.push(this.on('trigger:activate', callbacks.onActivate, {
        filter: { triggerId }
      }));
    }
    
    return ids;
  }

  /**
   * Register an update callback (called every frame).
   * @param {Function} handler - Update function receiving delta time.
   * @param {number} [priority=0] - Priority.
   * @returns {string} Registration ID.
   */
  onUpdate(handler, priority = 0) {
    return this.on('update', (event) => {
      handler(event.data.dt, event.data.time);
    }, { priority });
  }

  /**
   * Get all registered event names.
   * @returns {string[]} List of event names.
   */
  getRegisteredEvents() {
    return [
      ...this.callbacks.keys(),
      ...this.wildcardCallbacks.keys()
    ];
  }

  /**
   * Get count of registrations for an event.
   * @param {string} event - Event name.
   * @returns {number} Count.
   */
  getListenerCount(event) {
    const direct = this.callbacks.get(event)?.length || 0;
    const wildcard = this.getWildcardMatches(event).length;
    return direct + wildcard;
  }

  /**
   * Clear all callbacks.
   */
  clear() {
    this.callbacks.clear();
    this.wildcardCallbacks.clear();
    this.eventQueue.length = 0;
    this.pendingRemovals.clear();
  }

  /**
   * Create a Lua-compatible callback table for PixoScript.
   * @returns {object} Lua table with callback functions.
   */
  getLuaBindings() {
    const manager = this;
    
    return {
      on: (event, handler) => manager.on(event, handler),
      once: (event, handler) => manager.once(event, handler),
      off: (id) => manager.off(id),
      emit: (event, data) => manager.emit(event, data?.toObject?.() || data),
      
      // Convenience methods
      on_zone_enter: (zoneId, handler) => manager.on('zone:enter', handler, { filter: { zoneId } }),
      on_zone_exit: (zoneId, handler) => manager.on('zone:exit', handler, { filter: { zoneId } }),
      on_sprite_click: (spriteId, handler) => manager.on('sprite:click', handler, { filter: { spriteId } }),
      on_trigger_enter: (triggerId, handler) => manager.on('trigger:enter', handler, { filter: { triggerId } }),
      on_action_start: (handler) => manager.on('action:start', handler),
      on_action_complete: (handler) => manager.on('action:complete', handler),
      on_update: (handler) => manager.onUpdate(handler),
      on_event: (pattern, handler) => manager.on(pattern, handler)
    };
  }
}
