/**
 * ---------------------------------------------------------------
 *                 PixoSpritz – Debug Logger
 * ---------------------------------------------------------------
 * Copyright (c) 2022-2025 Kyle Derby MacInnis
 *
 * Centralized logging utility that can be toggled for production.
 * Usage:
 *   import { debug, debugGroup, debugError } from '../shared/debug-logger';
 *   debug('MapEditor3D', 'Loading texture:', url);
 *   debugGroup('MapEditor3D', 'Initialization');
 *   debugError('MapEditor3D', 'Failed to load:', err);
 */

/* eslint-disable no-console */

// Check for debug mode via localStorage or environment
const isDebugMode = () => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('pixospritz_debug') === 'true' ||
           new URLSearchParams(window.location.search).has('debug');
  }
  return process.env.NODE_ENV === 'development';
};

// Cache the debug state (can be toggled at runtime)
let _debugEnabled = isDebugMode();

/**
 * Enable/disable debug logging at runtime
 * @param {boolean} enabled 
 */
export function setDebugEnabled(enabled) {
  _debugEnabled = enabled;
  if (typeof window !== 'undefined') {
    if (enabled) {
      localStorage.setItem('pixospritz_debug', 'true');
    } else {
      localStorage.removeItem('pixospritz_debug');
    }
  }
}

/**
 * Check if debug mode is enabled
 * @returns {boolean}
 */
export function isDebugEnabled() {
  return _debugEnabled;
}

/**
 * Log a debug message with component prefix
 * @param {string} component - Component name (e.g., 'MapEditor3D')
 * @param  {...any} args - Log arguments
 */
export function debug(component, ...args) {
  if (_debugEnabled) {
    console.log(`[${component}]`, ...args);
  }
}

/**
 * Log a warning with component prefix
 * @param {string} component - Component name
 * @param  {...any} args - Log arguments
 */
export function debugWarn(component, ...args) {
  if (_debugEnabled) {
    console.warn(`[${component}]`, ...args);
  }
}

/**
 * Log an error (always shown, regardless of debug mode)
 * @param {string} component - Component name
 * @param  {...any} args - Log arguments
 */
export function debugError(component, ...args) {
  console.error(`[${component}]`, ...args);
}

/**
 * Start a collapsed console group
 * @param {string} component - Component name
 * @param {string} label - Group label
 */
export function debugGroup(component, label) {
  if (_debugEnabled) {
    console.groupCollapsed(`[${component}] ${label}`);
  }
}

/**
 * End a console group
 */
export function debugGroupEnd() {
  if (_debugEnabled) {
    console.groupEnd();
  }
}

/**
 * Log with timing information
 * @param {string} component - Component name
 * @param {string} label - Timer label
 */
export function debugTime(component, label) {
  if (_debugEnabled) {
    console.time(`[${component}] ${label}`);
  }
}

/**
 * End timing and log result
 * @param {string} component - Component name
 * @param {string} label - Timer label
 */
export function debugTimeEnd(component, label) {
  if (_debugEnabled) {
    console.timeEnd(`[${component}] ${label}`);
  }
}

/**
 * Log a table (useful for arrays/objects)
 * @param {string} component - Component name
 * @param {any} data - Data to display in table
 */
export function debugTable(component, data) {
  if (_debugEnabled) {
    console.log(`[${component}] Data:`);
    console.table(data);
  }
}

// Expose to window for runtime debugging
if (typeof window !== 'undefined') {
  window.pixospritzDebug = {
    enable: () => setDebugEnabled(true),
    disable: () => setDebugEnabled(false),
    isEnabled: isDebugEnabled,
  };
}

export default {
  debug,
  debugWarn,
  debugError,
  debugGroup,
  debugGroupEnd,
  debugTime,
  debugTimeEnd,
  debugTable,
  setDebugEnabled,
  isDebugEnabled,
};
