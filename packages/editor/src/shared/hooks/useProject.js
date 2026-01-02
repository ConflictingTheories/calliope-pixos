/**
 * ---------------------------------------------------------------
 *                 PixoSpritz – useProject Hook
 * ---------------------------------------------------------------
 * Copyright (c) 2022-2025 Kyle Derby MacInnis
 *
 * A hook for accessing the current project context in editors.
 * Provides access to project metadata, assets, and settings.
 * 
 * Usage:
 *   const { project, assets, getAsset, saveAsset, isDirty } = useProject();
 */

import { useState, useCallback, useEffect, createContext, useContext, useMemo } from 'react';

/**
 * @typedef {Object} ProjectAsset
 * @property {string} id - Unique asset ID
 * @property {string} name - Asset name
 * @property {string} type - Asset type (sprite, map, script, etc.)
 * @property {string} path - Asset path within project
 * @property {*} data - Asset data
 * @property {number} [lastModified] - Last modification timestamp
 */

/**
 * @typedef {Object} Project
 * @property {string} id - Project ID
 * @property {string} name - Project name
 * @property {string} [description] - Project description
 * @property {string} [version] - Project version
 * @property {Object} [settings] - Project settings
 * @property {ProjectAsset[]} assets - Project assets
 */

// Project context
const ProjectContext = createContext(null);

/**
 * ProjectProvider - Provides project context to children
 * 
 * @param {Object} props
 * @param {Project} [props.initialProject] - Initial project data
 * @param {function} [props.onSave] - Callback when project is saved
 * @param {function} [props.onLoad] - Callback when project is loaded
 * @param {React.ReactNode} props.children - Child components
 */
export function ProjectProvider({ initialProject, onSave, onLoad, children }) {
  const [project, setProject] = useState(initialProject || createEmptyProject());
  const [isDirty, setIsDirty] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Asset index for quick lookup
  const assetIndex = useMemo(() => {
    const index = new Map();
    (project.assets || []).forEach(asset => {
      index.set(asset.id, asset);
      if (asset.path) {
        index.set(asset.path, asset);
      }
    });
    return index;
  }, [project.assets]);

  // Get asset by ID or path
  const getAsset = useCallback((idOrPath) => {
    return assetIndex.get(idOrPath) || null;
  }, [assetIndex]);

  // Get assets by type
  const getAssetsByType = useCallback((type) => {
    return (project.assets || []).filter(asset => asset.type === type);
  }, [project.assets]);

  // Add or update an asset
  const saveAsset = useCallback((asset) => {
    setProject(prev => {
      const assets = [...(prev.assets || [])];
      const existingIndex = assets.findIndex(a => a.id === asset.id);
      
      const updatedAsset = {
        ...asset,
        lastModified: Date.now()
      };

      if (existingIndex >= 0) {
        assets[existingIndex] = updatedAsset;
      } else {
        assets.push(updatedAsset);
      }

      return { ...prev, assets };
    });
    setIsDirty(true);
  }, []);

  // Delete an asset
  const deleteAsset = useCallback((assetId) => {
    setProject(prev => ({
      ...prev,
      assets: (prev.assets || []).filter(a => a.id !== assetId)
    }));
    setIsDirty(true);
  }, []);

  // Update project metadata
  const updateProject = useCallback((updates) => {
    setProject(prev => ({ ...prev, ...updates }));
    setIsDirty(true);
  }, []);

  // Update project settings
  const updateSettings = useCallback((settings) => {
    setProject(prev => ({
      ...prev,
      settings: { ...prev.settings, ...settings }
    }));
    setIsDirty(true);
  }, []);

  // Save project
  const save = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      await onSave?.(project);
      setIsDirty(false);
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [project, onSave]);

  // Load project
  const load = useCallback(async (projectData) => {
    try {
      setIsLoading(true);
      setError(null);
      const loadedProject = await onLoad?.(projectData) || projectData;
      setProject(loadedProject);
      setIsDirty(false);
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [onLoad]);

  // Create new project
  const createNew = useCallback((name = 'Untitled Project') => {
    setProject(createEmptyProject(name));
    setIsDirty(false);
  }, []);

  // Warn on unsaved changes before unload
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (isDirty) {
        e.preventDefault();
        e.returnValue = '';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [isDirty]);

  const value = {
    project,
    assets: project.assets || [],
    settings: project.settings || {},
    isDirty,
    isLoading,
    error,
    getAsset,
    getAssetsByType,
    saveAsset,
    deleteAsset,
    updateProject,
    updateSettings,
    save,
    load,
    createNew
  };

  return (
    <ProjectContext.Provider value={value}>
      {children}
    </ProjectContext.Provider>
  );
}

/**
 * useProject - Hook to access project context
 */
export function useProject() {
  const context = useContext(ProjectContext);
  if (!context) {
    // Return a minimal stub if not within provider
    return {
      project: createEmptyProject(),
      assets: [],
      settings: {},
      isDirty: false,
      isLoading: false,
      error: null,
      getAsset: () => null,
      getAssetsByType: () => [],
      saveAsset: () => {},
      deleteAsset: () => {},
      updateProject: () => {},
      updateSettings: () => {},
      save: async () => {},
      load: async () => {},
      createNew: () => {}
    };
  }
  return context;
}

/**
 * Create an empty project
 */
function createEmptyProject(name = 'Untitled Project') {
  return {
    id: `project-${Date.now()}`,
    name,
    description: '',
    version: '1.0.0',
    settings: {
      gridSize: 16,
      defaultPalette: null,
      autoSave: true,
      autoSaveInterval: 60000
    },
    assets: []
  };
}

/**
 * Asset type constants
 */
export const AssetTypes = {
  SPRITE: 'sprite',
  MAP: 'map',
  TILESET: 'tileset',
  SCRIPT: 'script',
  CUTSCENE: 'cutscene',
  AUDIO: 'audio',
  MODEL: 'model',
  PALETTE: 'palette'
};

export default useProject;
