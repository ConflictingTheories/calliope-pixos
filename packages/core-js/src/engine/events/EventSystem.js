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
 * @typedef {object} EventListener
 * @property {string} id - Unique listener ID.
 * @property {string} event - Event pattern (supports wildcards).
 * @property {Function} handler - Event handler function.
 * @property {boolean} capture - Whether this is a capture phase listener.
 * @property {boolean} once - Whether to remove after first invocation.
 * @property {number} priority - Execution priority.
 * @property {object|null} filter - Optional filter criteria.
 */

/**
 * @typedef {object} GameEvent
 * @property {string} type - Event type name.
 * @property {object} data - Event payload data.
 * @property {number} timestamp - When the event was created.
 * @property {string|null} target - Target entity ID.
 * @property {string|null} currentTarget - Current target during propagation.
 * @property {number} phase - 1=capture, 2=target, 3=bubble.
 * @property {string[]} path - Propagation path (target to root).
 * @property {boolean} bubbles - Whether this event bubbles.
 * @property {boolean} cancelable - Whether default can be prevented.
 * @property {boolean} defaultPrevented - Whether default was prevented.
 * @property {boolean} propagationStopped - Whether propagation was stopped.
 * @property {boolean} immediatePropagationStopped - Whether immediate propagation was stopped.
 */

/**
 * EventSystem - Advanced event system with filtering, bubbling, and wildcards.
 * Provides DOM-like event propagation for game entities.
 */
export default class EventSystem {
  /**
   * Creates an instance of EventSystem.
   * @param {import('../core/index.js').default} engine - The engine instance.
   */
  constructor(engine) {
    /** @type {import('../core/index.js').default} */
    this.engine = engine;
    
    /** @type {Map<string, EventListener[]>} Direct event listeners */
    this.listeners = new Map();
    
    /** @type {Map<string, EventListener[]>} Wildcard pattern listeners */
    this.wildcardListeners = new Map();
    
    /** @type {Map<string, Set<string>>} Entity ID -> parent entity ID (for bubbling) */
    this.entityHierarchy = new Map();
    
    /** @type {number} Unique ID counter */
    this.idCounter = 0;
    
    /** @type {boolean} Currently dispatching an event */
    this.isDispatching = false;
    
    /** @type {Set<string>} Listeners to remove after dispatch */
    this.pendingRemovals = new Set();
    
    /** @type {Set<string>} Listeners to add after dispatch */
    this.pendingAdditions = new Set();
    
    /** @type {Map<string, EventListener>} Pending listeners by ID */
    this.pendingListenerMap = new Map();
    
    // Event phases
    /** @type {number} */
    this.CAPTURING_PHASE = 1;
    /** @type {number} */
    this.AT_TARGET = 2;
    /** @type {number} */
    this.BUBBLING_PHASE = 3;
  }

  /**
   * Add an event listener.
   * @param {string} eventType - Event type (supports wildcards like 'sprite:*').
   * @param {Function} handler - Event handler.
   * @param {object} [options={}] - Listener options.
   * @returns {string} Listener ID for removal.
   */
  addEventListener(eventType, handler, options = {}) {
    const id = `evt_${++this.idCounter}`;
    const listener = {
      id,
      event: eventType,
      handler,
      capture: options.capture || false,
      once: options.once || false,
      priority: options.priority || 0,
      filter: options.filter || null
    };
    
    if (this.isDispatching) {
      this.pendingListenerMap.set(id, listener);
      this.pendingAdditions.add(id);
      return id;
    }
    
    this.addListenerInternal(listener);
    return id;
  }

  /**
   * Shorthand for addEventListener.
   */
  on(eventType, handler, options = {}) {
    return this.addEventListener(eventType, handler, options);
  }

  /**
   * Add a one-time event listener.
   */
  once(eventType, handler, options = {}) {
    return this.addEventListener(eventType, handler, { ...options, once: true });
  }

  /**
   * Add listener to internal maps.
   * @param {EventListener} listener - Listener to add.
   */
  addListenerInternal(listener) {
    const isWildcard = listener.event.includes('*') || listener.event.includes('?');
    const map = isWildcard ? this.wildcardListeners : this.listeners;
    
    if (!map.has(listener.event)) {
      map.set(listener.event, []);
    }
    
    const list = map.get(listener.event);
    list.push(listener);
    
    // Sort by priority (higher first) and capture phase (capture first)
    list.sort((a, b) => {
      if (a.capture !== b.capture) return a.capture ? -1 : 1;
      return b.priority - a.priority;
    });
    
    debug('EventSystem', `Added listener ${listener.id} for: ${listener.event}`);
  }

  /**
   * Remove an event listener by ID.
   * @param {string} id - Listener ID.
   * @returns {boolean} Whether listener was found and removed.
   */
  removeEventListener(id) {
    if (this.isDispatching) {
      this.pendingRemovals.add(id);
      return true;
    }
    
    return this.removeListenerInternal(id);
  }

  /**
   * Shorthand for removeEventListener.
   */
  off(id) {
    return this.removeEventListener(id);
  }

  /**
   * Internal listener removal.
   * @param {string} id - Listener ID.
   * @returns {boolean} Whether found and removed.
   */
  removeListenerInternal(id) {
    for (const [event, list] of this.listeners) {
      const idx = list.findIndex(l => l.id === id);
      if (idx >= 0) {
        list.splice(idx, 1);
        if (list.length === 0) this.listeners.delete(event);
        return true;
      }
    }
    
    for (const [pattern, list] of this.wildcardListeners) {
      const idx = list.findIndex(l => l.id === id);
      if (idx >= 0) {
        list.splice(idx, 1);
        if (list.length === 0) this.wildcardListeners.delete(pattern);
        return true;
      }
    }
    
    return false;
  }

  /**
   * Dispatch an event to listeners.
   * @param {string} eventType - Event type name.
   * @param {object} [data={}] - Event data.
   * @param {object} [eventOptions={}] - Event configuration.
   * @returns {GameEvent} The dispatched event.
   */
  dispatchEvent(eventType, data = {}, eventOptions = {}) {
    const event = this.createEvent(eventType, data, eventOptions);
    
    this.isDispatching = true;
    
    try {
      if (event.bubbles && event.target) {
        // Full propagation path
        this.dispatchWithPropagation(event);
      } else {
        // Simple dispatch
        this.dispatchSimple(event);
      }
    } finally {
      this.isDispatching = false;
      this.processPendingChanges();
    }
    
    return event;
  }

  /**
   * Shorthand for dispatchEvent.
   */
  emit(eventType, data = {}, options = {}) {
    return this.dispatchEvent(eventType, data, options);
  }

  /**
   * Create an event object.
   * @param {string} type - Event type.
   * @param {object} data - Event data.
   * @param {object} options - Event options.
   * @returns {GameEvent} Event object.
   */
  createEvent(type, data, options) {
    const event = {
      type,
      data,
      timestamp: Date.now(),
      target: options.target || data.target || null,
      currentTarget: null,
      phase: this.AT_TARGET,
      path: [],
      bubbles: options.bubbles !== false,
      cancelable: options.cancelable !== false,
      defaultPrevented: false,
      propagationStopped: false,
      immediatePropagationStopped: false,
      
      preventDefault() {
        if (this.cancelable) {
          this.defaultPrevented = true;
        }
      },
      
      stopPropagation() {
        this.propagationStopped = true;
      },
      
      stopImmediatePropagation() {
        this.propagationStopped = true;
        this.immediatePropagationStopped = true;
      }
    };
    
    // Build propagation path if target exists
    if (event.target && event.bubbles) {
      event.path = this.buildEventPath(event.target);
    }
    
    return event;
  }

  /**
   * Build the propagation path from target to root.
   * @param {string} targetId - Starting entity ID.
   * @returns {string[]} Path from target to root.
   */
  buildEventPath(targetId) {
    const path = [targetId];
    let current = targetId;
    
    while (this.entityHierarchy.has(current)) {
      const parents = this.entityHierarchy.get(current);
      if (parents.size > 0) {
        // Take first parent (single inheritance model)
        const parent = parents.values().next().value;
        path.push(parent);
        current = parent;
      } else {
        break;
      }
    }
    
    return path;
  }

  /**
   * Dispatch with full capture/target/bubble phases.
   * @param {GameEvent} event - Event to dispatch.
   */
  dispatchWithPropagation(event) {
    const path = event.path;
    if (path.length === 0) {
      this.dispatchSimple(event);
      return;
    }
    
    // Capture phase (root to target, excluding target)
    event.phase = this.CAPTURING_PHASE;
    for (let i = path.length - 1; i > 0; i--) {
      if (event.propagationStopped) break;
      event.currentTarget = path[i];
      this.invokeListeners(event, true);
    }
    
    // Target phase
    if (!event.propagationStopped) {
      event.phase = this.AT_TARGET;
      event.currentTarget = path[0];
      this.invokeListeners(event, false); // Both capture and bubble listeners
    }
    
    // Bubble phase (target to root, excluding target)
    if (!event.propagationStopped && event.bubbles) {
      event.phase = this.BUBBLING_PHASE;
      for (let i = 1; i < path.length; i++) {
        if (event.propagationStopped) break;
        event.currentTarget = path[i];
        this.invokeListeners(event, false);
      }
    }
  }

  /**
   * Simple dispatch without propagation.
   * @param {GameEvent} event - Event to dispatch.
   */
  dispatchSimple(event) {
    event.phase = this.AT_TARGET;
    event.currentTarget = event.target;
    this.invokeListeners(event, false);
  }

  /**
   * Invoke matching listeners for current target.
   * @param {GameEvent} event - Current event.
   * @param {boolean} captureOnly - Only invoke capture listeners.
   */
  invokeListeners(event, captureOnly) {
    // Get direct listeners
    const directListeners = this.listeners.get(event.type) || [];
    
    // Get wildcard matches
    const wildcardListeners = this.getWildcardMatches(event.type);
    
    // Combine and filter by phase
    const allListeners = [...directListeners, ...wildcardListeners].filter(l => {
      if (captureOnly && !l.capture) return false;
      if (!captureOnly && event.phase === this.BUBBLING_PHASE && l.capture) return false;
      return true;
    });
    
    // Sort by priority
    allListeners.sort((a, b) => b.priority - a.priority);
    
    const toRemove = [];
    
    for (const listener of allListeners) {
      if (event.immediatePropagationStopped) break;
      
      // Check filter
      if (listener.filter && !this.matchesFilter(event, listener.filter)) {
        continue;
      }
      
      try {
        listener.handler(event);
        
        if (listener.once) {
          toRemove.push(listener.id);
        }
      } catch (error) {
        console.error(`EventSystem: Error in listener for ${event.type}:`, error);
      }
    }
    
    // Mark for removal
    for (const id of toRemove) {
      this.pendingRemovals.add(id);
    }
  }

  /**
   * Get wildcard listeners matching an event type.
   * @param {string} eventType - Event type.
   * @returns {EventListener[]} Matching listeners.
   */
  getWildcardMatches(eventType) {
    const matches = [];
    
    for (const [pattern, listeners] of this.wildcardListeners) {
      if (this.matchesPattern(eventType, pattern)) {
        matches.push(...listeners);
      }
    }
    
    return matches;
  }

  /**
   * Check if event type matches a pattern.
   * @param {string} type - Event type.
   * @param {string} pattern - Pattern with wildcards.
   * @returns {boolean} Whether it matches.
   */
  matchesPattern(type, pattern) {
    // Support * (any chars) and ? (single char)
    const regexStr = '^' + pattern
      .replace(/[.+^${}()|[\]\\]/g, '\\$&')
      .replace(/\*/g, '.*')
      .replace(/\?/g, '.') + '$';
    
    return new RegExp(regexStr).test(type);
  }

  /**
   * Check if event matches filter criteria.
   * @param {GameEvent} event - Event to check.
   * @param {object} filter - Filter criteria.
   * @returns {boolean} Whether event matches filter.
   */
  matchesFilter(event, filter) {
    for (const [key, value] of Object.entries(filter)) {
      // Check event properties
      if (key in event) {
        if (typeof value === 'function') {
          if (!value(event[key])) return false;
        } else if (event[key] !== value) {
          return false;
        }
        continue;
      }
      
      // Check event data
      if (event.data && key in event.data) {
        if (typeof value === 'function') {
          if (!value(event.data[key])) return false;
        } else if (event.data[key] !== value) {
          return false;
        }
        continue;
      }
      
      // Key not found
      return false;
    }
    
    return true;
  }

  /**
   * Process pending additions and removals.
   */
  processPendingChanges() {
    // Process removals
    for (const id of this.pendingRemovals) {
      this.removeListenerInternal(id);
    }
    this.pendingRemovals.clear();
    
    // Process additions
    for (const id of this.pendingAdditions) {
      const listener = this.pendingListenerMap.get(id);
      if (listener) {
        this.addListenerInternal(listener);
      }
    }
    this.pendingAdditions.clear();
    this.pendingListenerMap.clear();
  }

  /**
   * Set parent-child relationship for event bubbling.
   * @param {string} childId - Child entity ID.
   * @param {string} parentId - Parent entity ID.
   */
  setParent(childId, parentId) {
    if (!this.entityHierarchy.has(childId)) {
      this.entityHierarchy.set(childId, new Set());
    }
    this.entityHierarchy.get(childId).add(parentId);
  }

  /**
   * Remove parent-child relationship.
   * @param {string} childId - Child entity ID.
   * @param {string} parentId - Parent entity ID (or null for all).
   */
  removeParent(childId, parentId = null) {
    if (!this.entityHierarchy.has(childId)) return;
    
    if (parentId) {
      this.entityHierarchy.get(childId).delete(parentId);
    } else {
      this.entityHierarchy.delete(childId);
    }
  }

  /**
   * Remove all listeners for a specific event type.
   * @param {string} eventType - Event type.
   */
  removeAllListeners(eventType) {
    this.listeners.delete(eventType);
    
    // Also remove from wildcards if it's a pattern
    this.wildcardListeners.delete(eventType);
  }

  /**
   * Get listener count for an event.
   * @param {string} eventType - Event type.
   * @returns {number} Number of listeners.
   */
  listenerCount(eventType) {
    const direct = this.listeners.get(eventType)?.length || 0;
    const wildcard = this.getWildcardMatches(eventType).length;
    return direct + wildcard;
  }

  /**
   * Get all event types with listeners.
   * @returns {string[]} Event types.
   */
  eventTypes() {
    return [
      ...this.listeners.keys(),
      ...this.wildcardListeners.keys()
    ];
  }

  /**
   * Clear all listeners and hierarchy.
   */
  clear() {
    this.listeners.clear();
    this.wildcardListeners.clear();
    this.entityHierarchy.clear();
    this.pendingRemovals.clear();
    this.pendingAdditions.clear();
    this.pendingListenerMap.clear();
  }

  /**
   * Create delegate listener (listen on parent for child events).
   * @param {string} parentId - Parent entity ID.
   * @param {string} eventType - Event type.
   * @param {string} childSelector - Child ID or pattern to match.
   * @param {Function} handler - Event handler.
   * @returns {string} Listener ID.
   */
  delegate(parentId, eventType, childSelector, handler) {
    return this.addEventListener(eventType, (event) => {
      // Check if target matches selector
      if (this.matchesSelector(event.target, childSelector)) {
        handler(event);
      }
    }, {
      filter: { currentTarget: parentId }
    });
  }

  /**
   * Check if entity ID matches a selector.
   * @param {string} entityId - Entity ID.
   * @param {string} selector - Selector pattern.
   * @returns {boolean} Whether it matches.
   */
  matchesSelector(entityId, selector) {
    if (!entityId) return false;
    
    // Exact match
    if (entityId === selector) return true;
    
    // Wildcard match
    if (selector.includes('*') || selector.includes('?')) {
      return this.matchesPattern(entityId, selector);
    }
    
    // Prefix match (e.g., "sprite:" matches "sprite:player")
    if (selector.endsWith(':')) {
      return entityId.startsWith(selector);
    }
    
    return false;
  }
}
