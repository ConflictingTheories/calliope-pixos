/**
 * ---------------------------------------------------------------
 *                 PixoSpritz – Keyboard Manager
 * ---------------------------------------------------------------
 * Copyright (c) 2022-2025 Kyle Derby MacInnis
 *
 * Centralized keyboard shortcut management service.
 * Coordinates shortcuts across all editor contexts with priority handling.
 */

import { DEFAULT_SHORTCUTS, getShortcutDisplay } from '../hooks/useKeyboardShortcuts.js';

/**
 * Shortcut context priorities (higher = handled first)
 */
export const ContextPriority = {
  MODAL: 100,        // Modal dialogs (highest priority)
  OVERLAY: 80,       // Overlays, dropdowns, context menus
  EDITOR: 60,        // Active editor (map, sprite, script, cutscene)
  PANEL: 40,         // Side panels
  GLOBAL: 20,        // Global shortcuts
  DEFAULT: 0,        // Fallback
};

/**
 * Singleton keyboard manager for coordinating shortcuts
 */
class KeyboardManagerClass {
  constructor() {
    this.contexts = new Map();
    this.activeContexts = new Set();
    this.customShortcuts = {};
    this.enabled = true;
    this.listeners = new Set();
    this._initialized = false;
  }

  /**
   * Initialize the keyboard manager (call once at app start)
   */
  init() {
    if (this._initialized) return;
    
    window.addEventListener('keydown', this._handleKeyDown.bind(this), true);
    this._initialized = true;
    
    // Load custom shortcuts from localStorage
    this._loadCustomShortcuts();
  }

  /**
   * Destroy the keyboard manager
   */
  destroy() {
    if (!this._initialized) return;
    
    window.removeEventListener('keydown', this._handleKeyDown.bind(this), true);
    this.contexts.clear();
    this.activeContexts.clear();
    this._initialized = false;
  }

  /**
   * Register a shortcut context
   * @param {string} id - Unique context identifier
   * @param {Object} config - Context configuration
   * @param {number} config.priority - Priority level (use ContextPriority)
   * @param {Object} config.shortcuts - Shortcut definitions
   * @param {Object} config.handlers - Handler functions keyed by action
   * @param {Function} config.canHandle - Optional function to determine if context can handle
   */
  registerContext(id, config) {
    const context = {
      id,
      priority: config.priority || ContextPriority.DEFAULT,
      shortcuts: { ...DEFAULT_SHORTCUTS, ...config.shortcuts },
      handlers: config.handlers || {},
      canHandle: config.canHandle || (() => true),
      enabled: true,
    };
    
    this.contexts.set(id, context);
    this._notifyListeners('contextRegistered', { id, context });
    
    return () => this.unregisterContext(id);
  }

  /**
   * Unregister a shortcut context
   */
  unregisterContext(id) {
    this.contexts.delete(id);
    this.activeContexts.delete(id);
    this._notifyListeners('contextUnregistered', { id });
  }

  /**
   * Activate a context (make it eligible for handling shortcuts)
   */
  activateContext(id) {
    if (this.contexts.has(id)) {
      this.activeContexts.add(id);
      this._notifyListeners('contextActivated', { id });
    }
  }

  /**
   * Deactivate a context
   */
  deactivateContext(id) {
    this.activeContexts.delete(id);
    this._notifyListeners('contextDeactivated', { id });
  }

  /**
   * Enable/disable a specific context
   */
  setContextEnabled(id, enabled) {
    const context = this.contexts.get(id);
    if (context) {
      context.enabled = enabled;
      this._notifyListeners('contextEnabledChanged', { id, enabled });
    }
  }

  /**
   * Enable/disable all keyboard shortcuts
   */
  setEnabled(enabled) {
    this.enabled = enabled;
    this._notifyListeners('enabledChanged', { enabled });
  }

  /**
   * Update handler for a specific action in a context
   */
  updateHandler(contextId, action, handler) {
    const context = this.contexts.get(contextId);
    if (context) {
      context.handlers[action] = handler;
    }
  }

  /**
   * Set custom shortcut override
   */
  setCustomShortcut(action, shortcut) {
    this.customShortcuts[action] = shortcut;
    this._saveCustomShortcuts();
    this._notifyListeners('shortcutChanged', { action, shortcut });
  }

  /**
   * Reset shortcut to default
   */
  resetShortcut(action) {
    delete this.customShortcuts[action];
    this._saveCustomShortcuts();
    this._notifyListeners('shortcutReset', { action });
  }

  /**
   * Reset all shortcuts to defaults
   */
  resetAllShortcuts() {
    this.customShortcuts = {};
    this._saveCustomShortcuts();
    this._notifyListeners('allShortcutsReset', {});
  }

  /**
   * Get effective shortcut for an action
   */
  getShortcut(action) {
    return this.customShortcuts[action] || DEFAULT_SHORTCUTS[action];
  }

  /**
   * Get all shortcuts with their current bindings
   */
  getAllShortcuts() {
    const all = { ...DEFAULT_SHORTCUTS };
    for (const [action, shortcut] of Object.entries(this.customShortcuts)) {
      all[action] = shortcut;
    }
    return all;
  }

  /**
   * Get display string for an action's shortcut
   */
  getShortcutDisplayString(action) {
    const shortcut = this.getShortcut(action);
    return shortcut ? getShortcutDisplay(shortcut) : '';
  }

  /**
   * Check for shortcut conflicts
   */
  checkConflicts(shortcut) {
    const conflicts = [];
    const all = this.getAllShortcuts();
    
    for (const [action, existing] of Object.entries(all)) {
      if (this._shortcutsMatch(shortcut, existing)) {
        conflicts.push({ action, shortcut: existing });
      }
    }
    
    return conflicts;
  }

  /**
   * Subscribe to keyboard manager events
   */
  subscribe(listener) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  /**
   * Get list of all registered contexts
   */
  getContexts() {
    return Array.from(this.contexts.values());
  }

  /**
   * Get active contexts sorted by priority
   */
  getActiveContextsSorted() {
    return Array.from(this.activeContexts)
      .map(id => this.contexts.get(id))
      .filter(Boolean)
      .filter(ctx => ctx.enabled)
      .sort((a, b) => b.priority - a.priority);
  }

  // === Private Methods ===

  _handleKeyDown(event) {
    if (!this.enabled) return;
    
    // Skip if in input field (unless Escape)
    if (this._isInputElement(event.target) && event.key !== 'Escape') {
      return;
    }

    // Get active contexts sorted by priority
    const activeContexts = this.getActiveContextsSorted();
    
    // Try each context in priority order
    for (const context of activeContexts) {
      if (!context.canHandle(event)) continue;
      
      // Check context's shortcuts
      const shortcuts = { ...context.shortcuts, ...this.customShortcuts };
      
      for (const [action, shortcut] of Object.entries(shortcuts)) {
        if (this._matchesShortcut(event, shortcut) && context.handlers[action]) {
          event.preventDefault();
          event.stopPropagation();
          context.handlers[action](event);
          this._notifyListeners('shortcutHandled', { 
            action, 
            contextId: context.id,
            event 
          });
          return;
        }
      }
    }
  }

  _matchesShortcut(event, shortcut) {
    if (!shortcut) return false;
    
    const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
    
    // Check key (case insensitive)
    if (event.key.toLowerCase() !== shortcut.key.toLowerCase() && 
        event.key !== shortcut.key) {
      return false;
    }
    
    // Check modifiers
    const requiresCtrl = shortcut.ctrl || false;
    const requiresMeta = shortcut.meta || false;
    const requiresShift = shortcut.shift || false;
    const requiresAlt = shortcut.alt || false;
    
    const modifierPressed = isMac 
      ? (requiresMeta || requiresCtrl) ? event.metaKey : !event.metaKey && !event.ctrlKey
      : (requiresCtrl || requiresMeta) ? event.ctrlKey : !event.ctrlKey && !event.metaKey;
    
    if ((requiresCtrl || requiresMeta) && !modifierPressed) return false;
    if (requiresShift !== event.shiftKey) return false;
    if (requiresAlt !== event.altKey) return false;
    
    return true;
  }

  _shortcutsMatch(a, b) {
    if (!a || !b) return false;
    return (
      a.key?.toLowerCase() === b.key?.toLowerCase() &&
      !!a.ctrl === !!b.ctrl &&
      !!a.meta === !!b.meta &&
      !!a.shift === !!b.shift &&
      !!a.alt === !!b.alt
    );
  }

  _isInputElement(target) {
    if (!target) return false;
    const tagName = target.tagName?.toLowerCase();
    return (
      tagName === 'input' ||
      tagName === 'textarea' ||
      tagName === 'select' ||
      target.isContentEditable
    );
  }

  _loadCustomShortcuts() {
    try {
      const stored = localStorage.getItem('pixospritz-custom-shortcuts');
      if (stored) {
        this.customShortcuts = JSON.parse(stored);
      }
    } catch {
      // Ignore errors, use defaults
    }
  }

  _saveCustomShortcuts() {
    try {
      localStorage.setItem(
        'pixospritz-custom-shortcuts', 
        JSON.stringify(this.customShortcuts)
      );
    } catch {
      // Ignore storage errors
    }
  }

  _notifyListeners(event, data) {
    for (const listener of this.listeners) {
      try {
        listener(event, data);
      } catch {
        // Listener error silently ignored
      }
    }
  }
}

// Export singleton instance
export const KeyboardManager = new KeyboardManagerClass();

// Export helper hooks for React integration
export { getShortcutDisplay };

export default KeyboardManager;
