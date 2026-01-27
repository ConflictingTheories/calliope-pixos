/*                                                 *\
** ----------------------------------------------- **
**          Calliope - Pixos Game Engine   	       **
** ----------------------------------------------- **
**  Copyright (c) 2020-2025 - Kyle Derby MacInnis  **
**                                                 **
**    Any unauthorized distribution or transfer    **
**       of this work is strictly prohibited.      **
**                                                 **
**               All Rights Reserved.              **
** ----------------------------------------------- **
\*                                                 */

/**
 * Debug Logger - Centralized logging utility for the core engine
 *
 * Usage:
 *   import { debug, debugWarn, debugError } from '../utils/debug-logger.js';
 *   debug('ZoneLoader', 'Loading zone:', zoneName);
 *   debugWarn('Sprite', 'Missing texture:', texturePath);
 *   debugError('Engine', 'Critical failure:', error);
 */

/* eslint-disable no-console */

// Check for debug mode via global variable or environment
const isDebugMode = () => {
  if (typeof window !== 'undefined') {
    return (
      window.PIXOS_DEBUG === true ||
      (typeof localStorage !== 'undefined' && localStorage.getItem('pixos_debug') === 'true')
    );
  }
  return typeof process !== 'undefined' && process.env && process.env.NODE_ENV === 'development';
};

// Cache the debug state
let _debugEnabled = isDebugMode();

/**
 * Enable/disable debug logging at runtime
 * @param {boolean} enabled
 */
export function setDebugEnabled(enabled) {
  _debugEnabled = enabled;
  if (typeof window !== 'undefined') {
    window.PIXOS_DEBUG = enabled;
    if (typeof localStorage !== 'undefined') {
      if (enabled) {
        localStorage.setItem('pixos_debug', 'true');
      } else {
        localStorage.removeItem('pixos_debug');
      }
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

// Listeners for log events (e.g. for Editor Console)
const listeners = [];

/**
 * Add a log listener
 * @param {function} callback
 */
export function addLogListener(callback) {
  if (!listeners.includes(callback)) {
    listeners.push(callback);
  }
}

/**
 * Remove a log listener
 * @param {function} callback
 */
export function removeLogListener(callback) {
  const idx = listeners.indexOf(callback);
  if (idx >= 0) {
    listeners.splice(idx, 1);
  }
}

function notifyListeners(level, component, args) {
  if (listeners.length > 0) {
    const message = {
      level,
      component,
      args,
      timestamp: Date.now(),
      text: args.map(a => (typeof a === 'object' ? JSON.stringify(a) : String(a))).join(' '),
    };
    listeners.forEach(fn => fn(message));
  }
}

/**
 * Log a debug message with component prefix
 * @param {string} component - Component name (e.g., 'Zone', 'Sprite')
 * @param  {...any} args - Log arguments
 */
export function debug(component, ...args) {
  if (_debugEnabled) {
    console.log(`[${component}]`, ...args);
  }
  notifyListeners('debug', component, args);
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
  notifyListeners('warn', component, args);
}

/**
 * Log an error (always shown, regardless of debug mode)
 * @param {string} component - Component name
 * @param  {...any} args - Log arguments
 */
export function debugError(component, ...args) {
  console.error(`[${component}]`, ...args);
  notifyListeners('error', component, args);
}

// Expose to window for runtime debugging
if (typeof window !== 'undefined') {
  window.pixosDebug = {
    enable: () => setDebugEnabled(true),
    disable: () => setDebugEnabled(false),
    isEnabled: isDebugEnabled,
  };
}

export default {
  debug,
  debugWarn,
  debugError,
  setDebugEnabled,
  isDebugEnabled,
  addLogListener,
  removeLogListener,
};
