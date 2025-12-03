/**
 * ---------------------------------------------------------------
 *                 PixoSpritz – useHistory Hook
 * ---------------------------------------------------------------
 * Copyright (c) 2022-2025 Kyle Derby MacInnis
 *
 * A reusable undo/redo hook for all editors.
 * Provides a consistent history management pattern across the editor suite.
 * 
 * Usage:
 *   const { current, push, undo, redo, canUndo, canRedo, clear, reset } = useHistory(initialState, options);
 *   
 *   // Push new state
 *   push(newMapState);
 *   
 *   // Undo/Redo
 *   if (canUndo) undo();
 *   if (canRedo) redo();
 *   
 *   // Reset to initial state
 *   reset(newInitialState);
 */

import { useState, useMemo, useCallback } from 'react';

/**
 * @typedef {Object} HistoryOptions
 * @property {number} [maxHistory=100] - Maximum number of history states to keep
 * @property {function} [onChange] - Callback fired when history changes
 * @property {boolean} [enableMerging=false] - Whether to merge consecutive pushes within mergeWindow
 * @property {number} [mergeWindow=500] - Time window in ms for merging consecutive pushes
 */

/**
 * Custom hook for managing undo/redo history
 * 
 * @template T
 * @param {T} initialState - The initial state value
 * @param {HistoryOptions} [options={}] - Configuration options
 * @returns {{
 *   current: T,
 *   push: (state: T) => void,
 *   undo: () => void,
 *   redo: () => void,
 *   canUndo: boolean,
 *   canRedo: boolean,
 *   clear: () => void,
 *   reset: (state?: T) => void,
 *   historyLength: number,
 *   currentIndex: number
 * }}
 */
export function useHistory(initialState, options = {}) {
  const {
    maxHistory = 100,
    onChange = null,
    enableMerging = false,
    mergeWindow = 500
  } = options;

  const [history, setHistory] = useState([initialState]);
  const [index, setIndex] = useState(0);
  const [lastPushTime, setLastPushTime] = useState(0);

  // Current state is the value at the current index
  const current = useMemo(() => history[index], [history, index]);

  // Can undo if there are previous states
  const canUndo = useMemo(() => index > 0, [index]);

  // Can redo if there are future states
  const canRedo = useMemo(() => index < history.length - 1, [index, history.length]);

  /**
   * Push a new state to history
   * Truncates any future states (redo stack) when pushing new state
   */
  const push = useCallback((newState) => {
    const now = Date.now();
    
    setHistory(prev => {
      // If merging is enabled and within the merge window, replace the current state
      if (enableMerging && (now - lastPushTime) < mergeWindow && prev.length > 1) {
        const newHistory = [...prev];
        newHistory[index] = newState;
        return newHistory;
      }
      
      // Normal push: truncate future and add new state
      const newHistory = [...prev.slice(0, index + 1), newState];
      
      // Keep history under maxHistory limit
      if (newHistory.length > maxHistory) {
        return newHistory.slice(newHistory.length - maxHistory);
      }
      
      return newHistory;
    });

    // Update index only if not merging
    if (!enableMerging || (now - lastPushTime) >= mergeWindow) {
      setIndex(i => Math.min(i + 1, maxHistory - 1));
    }
    
    setLastPushTime(now);
    
    if (onChange) {
      onChange({ type: 'push', state: newState });
    }
  }, [index, maxHistory, onChange, enableMerging, mergeWindow, lastPushTime]);

  /**
   * Undo to the previous state
   */
  const undo = useCallback(() => {
    if (!canUndo) return;
    
    setIndex(i => i - 1);
    
    if (onChange) {
      onChange({ type: 'undo', state: history[index - 1] });
    }
  }, [canUndo, history, index, onChange]);

  /**
   * Redo to the next state
   */
  const redo = useCallback(() => {
    if (!canRedo) return;
    
    setIndex(i => i + 1);
    
    if (onChange) {
      onChange({ type: 'redo', state: history[index + 1] });
    }
  }, [canRedo, history, index, onChange]);

  /**
   * Clear all history except the current state
   */
  const clear = useCallback(() => {
    setHistory([current]);
    setIndex(0);
    
    if (onChange) {
      onChange({ type: 'clear', state: current });
    }
  }, [current, onChange]);

  /**
   * Reset history with a new initial state
   * @param {T} [newState] - Optional new initial state (defaults to original initialState)
   */
  const reset = useCallback((newState = initialState) => {
    setHistory([newState]);
    setIndex(0);
    
    if (onChange) {
      onChange({ type: 'reset', state: newState });
    }
  }, [initialState, onChange]);

  /**
   * Go to a specific index in history
   * @param {number} targetIndex - The index to navigate to
   */
  const goTo = useCallback((targetIndex) => {
    if (targetIndex < 0 || targetIndex >= history.length) return;
    
    setIndex(targetIndex);
    
    if (onChange) {
      onChange({ type: 'goto', state: history[targetIndex] });
    }
  }, [history, onChange]);

  return {
    current,
    push,
    undo,
    redo,
    canUndo,
    canRedo,
    clear,
    reset,
    goTo,
    historyLength: history.length,
    currentIndex: index
  };
}

/**
 * Create a keyboard shortcut handler for undo/redo
 * 
 * @param {{undo: function, redo: function, canUndo: boolean, canRedo: boolean}} historyMethods
 * @returns {function} Event handler for keydown events
 */
export function createHistoryKeyHandler({ undo, redo, canUndo, canRedo }) {
  return (event) => {
    // Ctrl+Z / Cmd+Z = Undo
    if ((event.ctrlKey || event.metaKey) && !event.shiftKey && event.key === 'z') {
      event.preventDefault();
      if (canUndo) undo();
      return true;
    }
    
    // Ctrl+Y / Cmd+Shift+Z = Redo
    if ((event.ctrlKey || event.metaKey) && (event.key === 'y' || (event.shiftKey && event.key === 'z'))) {
      event.preventDefault();
      if (canRedo) redo();
      return true;
    }
    
    return false;
  };
}

export default useHistory;
