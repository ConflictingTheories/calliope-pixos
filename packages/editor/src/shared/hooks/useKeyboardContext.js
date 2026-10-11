/**
 * ---------------------------------------------------------------
 *                 PixoSpritz – useKeyboardContext Hook
 * ---------------------------------------------------------------
 * Copyright (c) 2022-2025 Kyle Derby MacInnis
 *
 * React hook for integrating with the KeyboardManager service.
 * Provides a clean way to register keyboard shortcut contexts in components.
 */

import { useEffect, useCallback, useRef, useState } from 'react';
import { KeyboardManager, ContextPriority } from '../services/KeyboardManager.js';

/**
 * Hook to register a keyboard shortcut context
 *
 * @param {string} contextId - Unique identifier for this context
 * @param {Object} config - Context configuration
 * @param {number} config.priority - Priority level (use ContextPriority)
 * @param {Object} config.shortcuts - Custom shortcut definitions
 * @param {Object} config.handlers - Handler functions keyed by action name
 * @param {Function} config.canHandle - Optional predicate for conditional handling
 * @param {boolean} config.active - Whether context is initially active (default: true)
 * @param {Array} deps - Dependencies array for re-registration
 *
 * @example
 * useKeyboardContext('map-editor', {
 *   priority: ContextPriority.EDITOR,
 *   handlers: {
 *     save: () => saveMap(),
 *     undo: () => history.undo(),
 *     redo: () => history.redo(),
 *     delete: () => deleteSelection(),
 *   },
 *   active: isMapEditorFocused,
 * }, [isMapEditorFocused]);
 */
export function useKeyboardContext(contextId, config, deps = []) {
  const {
    priority = ContextPriority.EDITOR,
    shortcuts = {},
    handlers = {},
    canHandle,
    active = true,
  } = config;

  // Keep handlers in a ref to avoid re-registration on handler changes
  const handlersRef = useRef(handlers);
  handlersRef.current = handlers;

  // Stable handler wrapper
  const stableHandlers = useCallback(() => {
    const wrapped = {};
    for (const [action] of Object.entries(handlersRef.current)) {
      wrapped[action] = (...args) => handlersRef.current[action]?.(...args);
    }
    return wrapped;
  }, []);

  useEffect(() => {
    // Initialize KeyboardManager if not already
    KeyboardManager.init();

    // Register context
    const unregister = KeyboardManager.registerContext(contextId, {
      priority,
      shortcuts,
      handlers: stableHandlers(),
      canHandle,
    });

    // Activate if config says so
    if (active) {
      KeyboardManager.activateContext(contextId);
    }

    return () => {
      KeyboardManager.deactivateContext(contextId);
      unregister();
    };
    // deps spread intentionally for dynamic dependencies
  }, [contextId, priority, ...deps]);

  // Handle active state changes
  useEffect(() => {
    if (active) {
      KeyboardManager.activateContext(contextId);
    } else {
      KeyboardManager.deactivateContext(contextId);
    }
  }, [contextId, active]);

  // Update handlers when they change
  useEffect(() => {
    const handlers = stableHandlers();
    for (const [action, handler] of Object.entries(handlers)) {
      KeyboardManager.updateHandler(contextId, action, handler);
    }
  }, [contextId, stableHandlers, handlers]);

  return {
    activate: () => KeyboardManager.activateContext(contextId),
    deactivate: () => KeyboardManager.deactivateContext(contextId),
    setEnabled: enabled => KeyboardManager.setContextEnabled(contextId, enabled),
  };
}

/**
 * Hook to access and modify keyboard shortcut configuration
 */
export function useShortcutConfig() {
  const [shortcuts, setShortcuts] = useState(() => KeyboardManager.getAllShortcuts());

  useEffect(() => {
    KeyboardManager.init();

    const unsubscribe = KeyboardManager.subscribe(event => {
      if (
        event === 'shortcutChanged' ||
        event === 'shortcutReset' ||
        event === 'allShortcutsReset'
      ) {
        setShortcuts(KeyboardManager.getAllShortcuts());
      }
    });

    return unsubscribe;
  }, []);

  const setCustomShortcut = useCallback((action, shortcut) => {
    KeyboardManager.setCustomShortcut(action, shortcut);
  }, []);

  const resetShortcut = useCallback(action => {
    KeyboardManager.resetShortcut(action);
  }, []);

  const resetAllShortcuts = useCallback(() => {
    KeyboardManager.resetAllShortcuts();
  }, []);

  const checkConflicts = useCallback(shortcut => {
    return KeyboardManager.checkConflicts(shortcut);
  }, []);

  const getDisplayString = useCallback(action => {
    return KeyboardManager.getShortcutDisplayString(action);
  }, []);

  return {
    shortcuts,
    setCustomShortcut,
    resetShortcut,
    resetAllShortcuts,
    checkConflicts,
    getDisplayString,
  };
}

/**
 * Hook to temporarily disable all keyboard shortcuts
 * Useful for modal dialogs or text input focus
 */
export function useDisableShortcuts(disabled) {
  useEffect(() => {
    if (disabled) {
      KeyboardManager.setEnabled(false);
    } else {
      KeyboardManager.setEnabled(true);
    }

    return () => {
      KeyboardManager.setEnabled(true);
    };
  }, [disabled]);
}

/**
 * Hook to get the current active contexts
 */
export function useActiveContexts() {
  const [contexts, setContexts] = useState([]);

  useEffect(() => {
    KeyboardManager.init();

    const updateContexts = () => {
      setContexts(KeyboardManager.getActiveContextsSorted());
    };

    updateContexts();

    const unsubscribe = KeyboardManager.subscribe(event => {
      if (event.startsWith('context')) {
        updateContexts();
      }
    });

    return unsubscribe;
  }, []);

  return contexts;
}

// Re-export priority constants for convenience
export { ContextPriority };

export default useKeyboardContext;
