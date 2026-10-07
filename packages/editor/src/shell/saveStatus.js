/*
 * ---------------------------------------------------------------
 *            PixoSpritz – Editor – Save status bus
 * ---------------------------------------------------------------
 * Copyright (c) 2022-2025  Kyle Derby MacInnis
 *
 * (P2-07) Domain save paths report through this bus — never
 * `alert()`.  The shell renders the latest status; the
 * SaveCoordinator (core/project/saveCoordinator.js) is the
 * programmatic counterpart for tools migrated to the new core.
 */

import { useState, useEffect } from 'react';

const listeners = new Set();
let lastStatus = { kind: 'idle', path: null, message: '', at: 0 };

function emit(status) {
  lastStatus = { ...status, at: Date.now() };
  for (const fn of [...listeners]) {
    try {
      fn(lastStatus);
    } catch (err) {
      console.error('[saveStatus] listener threw:', err);
    }
  }
}

/** Report a successful save (replaces alert('...saved successfully!')). */
export function reportSaveOk(path, message) {
  emit({ kind: 'saved', path, message: message || `Saved ${path}` });
}

/** Report a failed save (replaces alert('Failed to save...')). The document stays dirty. */
export function reportSaveError(path, error) {
  const message = error && error.message ? error.message : String(error);
  console.error(`[saveStatus] Save failed for ${path}:`, error);
  emit({ kind: 'error', path, message: `Save failed: ${message}` });
}

/** Report transient save progress (validating / writing / retrying). */
export function reportSaveProgress(path, stage, message) {
  emit({ kind: stage, path, message: message || `${stage}: ${path}` });
}

/** React hook: the latest save status for shell chrome. */
export function useSaveStatus() {
  const [status, setStatus] = useState(lastStatus);
  useEffect(() => {
    listeners.add(setStatus);
    return () => listeners.delete(setStatus);
  }, []);
  return status;
}

export function getLastSaveStatus() {
  return lastStatus;
}
