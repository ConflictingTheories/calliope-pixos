import { useState, useMemo, useCallback } from 'react';

export function useHistory(initialState, options = {}) {
  const [history, setHistory] = useState([initialState]);
  const [index, setIndex] = useState(0);
  const { maxHistory = 100, mergeDelay = 500, onChange } = options;

  const current = useMemo(() => history[index], [history, index]);
  const canUndo = index > 0;
  const canRedo = index < history.length - 1;

  const lastPushTime = useMemo(() => ({ current: 0 }), []);

  const push = useCallback((state, mergeable = false) => {
    const now = Date.now();
    const isRapid = now - lastPushTime.current < mergeDelay;
    lastPushTime.current = now;

    if (mergeable && isRapid) {
      // Replace the current state, discarding any redo history
      const newHistory = [...history.slice(0, index), state];
      setHistory(newHistory);
    } else {
      const newHistory = [...history.slice(0, index + 1), state].slice(-maxHistory);
      setHistory(newHistory);
      setIndex(newHistory.length - 1);
    }
    onChange?.({ type: 'push', state });
  }, [index, history, maxHistory, mergeDelay, onChange, lastPushTime]);

  const undo = useCallback(() => {
    if (canUndo) {
      setIndex(i => i - 1);
      // Pass the new state to the onChange handler
      onChange?.({ type: 'undo', state: history[index - 1] });
    }
  }, [canUndo, onChange, history, index]);

  const redo = useCallback(() => {
    if (canRedo) {
      setIndex(i => i + 1);
      // Pass the new state to the onChange handler
      onChange?.({ type: 'redo', state: history[index + 1] });
    }
  }, [canRedo, onChange, history, index]);

  const reset = useCallback((newState) => {
    setHistory([newState]);
    setIndex(0);
    onChange?.({ type: 'reset' });
  }, [onChange]);

  return { current, push, undo, redo, canUndo, canRedo, reset, history, index };
}

export function createHistoryKeyHandler({ undo, redo, canUndo, canRedo }) {
  return (e) => {
    if (e.ctrlKey || e.metaKey) {
      if (e.key === 'z') {
        e.preventDefault();
        if (e.shiftKey) {
          if (canRedo) redo();
        } else {
          if (canUndo) undo();
        }
      } else if (e.key === 'y') {
        e.preventDefault();
        if (canRedo) redo();
      }
    }
  };
}