/**
 * ---------------------------------------------------------------
 *                 PixoSpritz – useSettings Hook
 * ---------------------------------------------------------------
 * Copyright (c) 2022-2025 Kyle Derby MacInnis
 *
 * A hook for managing editor preferences and settings.
 * Persists to localStorage with defaults.
 *
 * Usage:
 *   const { settings, setSetting, resetSettings } = useSettings();
 *   const gridSize = settings.gridSize;
 *   setSetting('gridSize', 32);
 */

import { useState, useCallback, useEffect, useMemo, createContext, useContext } from 'react';

// Default editor settings
const DEFAULT_SETTINGS = {
  // General
  theme: 'dark',
  language: 'en',

  // Editor
  gridSize: 16,
  gridVisible: true,
  gridSnap: true,
  showRulers: true,

  // Appearance
  fontSize: 14,
  fontFamily: 'Inter',
  uiScale: 1.0,

  // Canvas
  canvasBackground: '#0a0a14',
  checkerboardBackground: true,
  showCrosshair: false,

  // Performance
  hardwareAcceleration: true,
  antialias: false,
  maxUndoSteps: 100,

  // Auto-save
  autoSave: true,
  autoSaveInterval: 60000, // 1 minute

  // Tools
  defaultTool: 'pencil',
  brushSize: 1,
  eraserSize: 1,

  // Panels
  panelPositions: {},
  collapsedPanels: [],

  // Recent files
  recentFiles: [],
  maxRecentFiles: 10,

  // Keyboard
  keyboardShortcuts: {},

  // Debug
  debugMode: false,
  showFPS: false,
};

const STORAGE_KEY = 'pixospritz-editor-settings';

// Settings context
const SettingsContext = createContext(null);

/**
 * SettingsProvider - Provides settings context to children
 */
export function SettingsProvider({ children, defaults = {} }) {
  const [settings, setSettings] = useState(() => {
    // Load from localStorage
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        return { ...DEFAULT_SETTINGS, ...defaults, ...JSON.parse(stored) };
      }
    } catch {
      // Ignore parse errors
    }
    return { ...DEFAULT_SETTINGS, ...defaults };
  });

  // Persist to localStorage when settings change
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    } catch {
      // Ignore storage errors
    }
  }, [settings]);

  // Set a single setting
  const setSetting = useCallback((key, value) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  }, []);

  // Set multiple settings at once
  const setMultiple = useCallback(updates => {
    setSettings(prev => ({ ...prev, ...updates }));
  }, []);

  // Reset a setting to default
  const resetSetting = useCallback(key => {
    const defaultValue = DEFAULT_SETTINGS[key];
    setSettings(prev => ({ ...prev, [key]: defaultValue }));
  }, []);

  // Reset all settings to defaults
  const resetAll = useCallback(() => {
    setSettings({ ...DEFAULT_SETTINGS, ...defaults });
  }, [defaults]);

  // Toggle a boolean setting
  const toggle = useCallback(key => {
    setSettings(prev => ({ ...prev, [key]: !prev[key] }));
  }, []);

  const value = {
    settings,
    setSetting,
    setMultiple,
    resetSetting,
    resetAll,
    toggle,
    defaults: { ...DEFAULT_SETTINGS, ...defaults },
  };

  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>;
}

/**
 * useSettings - Hook to access settings context
 */
export function useSettings() {
  const context = useContext(SettingsContext);

  if (context) {
    return context;
  }

  // Standalone usage without provider
  const [settings, setSettings] = useState(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        return { ...DEFAULT_SETTINGS, ...JSON.parse(stored) };
      }
    } catch {
      // Ignore
    }
    return DEFAULT_SETTINGS;
  });

  const setSetting = useCallback((key, value) => {
    setSettings(prev => {
      const updated = { ...prev, [key]: value };
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      } catch {
        // Ignore
      }
      return updated;
    });
  }, []);

  const toggle = useCallback(key => {
    setSettings(prev => {
      const updated = { ...prev, [key]: !prev[key] };
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      } catch {
        // Ignore
      }
      return updated;
    });
  }, []);

  const resetAll = useCallback(() => {
    setSettings(DEFAULT_SETTINGS);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_SETTINGS));
    } catch {
      // Ignore
    }
  }, []);

  return {
    settings,
    setSetting,
    setMultiple: updates =>
      setSettings(prev => {
        const updated = { ...prev, ...updates };
        try {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
        } catch {
          // Ignore
        }
        return updated;
      }),
    resetSetting: key => setSetting(key, DEFAULT_SETTINGS[key]),
    resetAll,
    toggle,
    defaults: DEFAULT_SETTINGS,
  };
}

/**
 * useSetting - Hook to access a single setting
 *
 * @param {string} key - Setting key
 * @param {*} [defaultValue] - Default value if not set
 */
export function useSetting(key, defaultValue) {
  const { settings, setSetting } = useSettings();

  const value = useMemo(() => {
    return settings[key] ?? defaultValue ?? DEFAULT_SETTINGS[key];
  }, [settings, key, defaultValue]);

  const setValue = useCallback(
    newValue => {
      setSetting(key, newValue);
    },
    [key, setSetting]
  );

  return [value, setValue];
}

/**
 * Setting categories for UI organization
 */
export const SettingCategories = {
  GENERAL: {
    label: 'General',
    keys: ['theme', 'language', 'uiScale'],
  },
  EDITOR: {
    label: 'Editor',
    keys: ['gridSize', 'gridVisible', 'gridSnap', 'showRulers', 'defaultTool'],
  },
  APPEARANCE: {
    label: 'Appearance',
    keys: ['fontSize', 'fontFamily', 'canvasBackground', 'checkerboardBackground'],
  },
  PERFORMANCE: {
    label: 'Performance',
    keys: ['hardwareAcceleration', 'antialias', 'maxUndoSteps'],
  },
  AUTOSAVE: {
    label: 'Auto-save',
    keys: ['autoSave', 'autoSaveInterval'],
  },
  DEBUG: {
    label: 'Debug',
    keys: ['debugMode', 'showFPS'],
  },
};

export { DEFAULT_SETTINGS };
export default useSettings;
