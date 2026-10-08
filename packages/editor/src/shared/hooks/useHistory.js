/**
 * ---------------------------------------------------------------
 *                 PixoSpritz – useHistory Hook
 * ---------------------------------------------------------------
 * Copyright (c) 2022-2025 Kyle Derby MacInnis
 *
 * (P2-05) React binding over CommandHistory (core/commands/history.js).
 * Undo/redo now runs operation-specific inverses instead of full
 * state snapshots.  The public API is unchanged for existing callers.
 *
 * Usage:
 *   const { current, push, undo, redo, canUndo, canRedo, clear, reset } = useHistory(initialState, options);
 */

import { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import { CommandHistory } from '../../core/commands/history.js';

/**
 * @typedef {Object} HistoryOptions
 * @property {number} [byteCap] - Maximum history size in bytes
 * @property {number} [coalesceWindowMs] - Time window for stroke coalescing
 * @property {string} [coalesceKey] - Key enabling coalescing for push()
 * @property {function} [onChange] - Callback fired when history changes
 */

export function useHistory(initialState, options = {}) {
  const { byteCap, coalesceWindowMs, coalesceKey = null, onChange = null } = options;

  const historyRef = useRef(null);
  if (!historyRef.current) {
    historyRef.current = new CommandHistory({ byteCap, coalesceWindowMs });
  }
  const history = historyRef.current;

  const [current, setCurrent] = useState(initialState);
  const currentRef = useRef(initialState);
  const [, force] = useState(0);

  useEffect(() => history.onChange(() => force(n => n + 1)), [history]);

  const push = useCallback(
    (newState, pushOptions = {}) => {
      const prevState = currentRef.current;
      const key = pushOptions.coalesceKey ?? coalesceKey;
      history.push(
        {
          label: pushOptions.label || 'state change',
          snapshot: null,
          bytes: pushOptions.bytes,
          coalesceKey: key,
          coalesce:
            key != null
              ? (prev, next) => ({
                  label: next.label,
                  coalesceKey: key,
                  coalesce: prev.coalesce,
                  // Undo restores the ORIGINAL state before the stroke.
                  redo: next.redo,
                  undo: prev.undo,
                  bytes: (prev.bytes || 0) + (next.bytes || 0),
                })
              : undefined,
          redo: () => {
            currentRef.current = newState;
            setCurrent(newState);
          },
          undo: () => {
            currentRef.current = prevState;
            setCurrent(prevState);
          },
        },
        { apply: true }
      );
      if (onChange) onChange({ type: 'push', state: newState });
    },
    [history, coalesceKey, onChange]
  );

  const undo = useCallback(() => {
    if (!history.canUndo) return;
    history.undo();
    if (onChange) onChange({ type: 'undo', state: currentRef.current });
  }, [history, onChange]);

  const redo = useCallback(() => {
    if (!history.canRedo) return;
    history.redo();
    if (onChange) onChange({ type: 'redo', state: currentRef.current });
  }, [history, onChange]);

  const clear = useCallback(() => {
    history.clear();
    if (onChange) onChange({ type: 'clear', state: currentRef.current });
  }, [history, onChange]);

  const reset = useCallback(
    (newState = initialState) => {
      history.clear();
      currentRef.current = newState;
      setCurrent(newState);
      if (onChange) onChange({ type: 'reset', state: newState });
    },
    [history, initialState, onChange]
  );

  const goTo = useCallback(
    targetDepth => {
      // Step-wise undo/redo to reach the requested depth.
      const clamped = Math.max(0, Math.min(targetDepth, history.depth + history.redoStack.length));
      while (history.depth > clamped && history.undo()) {}
      while (history.depth < clamped && history.redo()) {}
    },
    [history]
  );

  return useMemo(
    () => ({
      current,
      push,
      undo,
      redo,
      canUndo: history.canUndo,
      canRedo: history.canRedo,
      clear,
      reset,
      goTo,
      historyLength: history.depth,
      currentIndex: history.depth - 1,
      history,
    }),
    [current, push, undo, redo, clear, reset, goTo, history]
  );
}

/**
 * Create a keyboard shortcut handler for undo/redo
 */
export function createHistoryKeyHandler({ undo, redo, canUndo, canRedo }) {
  return event => {
    if ((event.ctrlKey || event.metaKey) && !event.shiftKey && event.key === 'z') {
      event.preventDefault();
      if (canUndo) undo();
      return true;
    }
    if (
      (event.ctrlKey || event.metaKey) &&
      (event.key === 'y' || (event.shiftKey && event.key === 'z'))
    ) {
      event.preventDefault();
      if (canRedo) redo();
      return true;
    }
    return false;
  };
}

export default useHistory;
