/**
 * ---------------------------------------------------------------
 *                 PixoSpritz – useAssetLibrary Hook
 * ---------------------------------------------------------------
 * Copyright (c) 2022-2025 Kyle Derby MacInnis
 *
 * A hook for managing and accessing the asset library.
 * Provides filtering, searching, and asset management.
 * 
 * Usage:
 *   const {
 *     assets,
 *     filteredAssets,
 *     search,
 *     setFilter,
 *     importAsset,
 *     exportAsset
 *   } = useAssetLibrary();
 */

import { useState, useCallback, useMemo, useEffect } from 'react';

/**
 * @typedef {Object} AssetLibraryOptions
 * @property {Array} [initialAssets=[]] - Initial asset list
 * @property {function} [onImport] - Handler for importing assets
 * @property {function} [onExport] - Handler for exporting assets
 * @property {function} [onChange] - Callback when assets change
 */

/**
 * useAssetLibrary - Hook for managing assets
 * 
 * @param {AssetLibraryOptions} [options={}]
 * @returns {{
 *   assets: Array,
 *   filteredAssets: Array,
 *   search: string,
 *   filter: Object,
 *   setSearch: (query: string) => void,
 *   setFilter: (filter: Object) => void,
 *   addAsset: (asset: Object) => void,
 *   updateAsset: (id: string, updates: Object) => void,
 *   removeAsset: (id: string) => void,
 *   importAsset: (file: File) => Promise<Object>,
 *   exportAsset: (id: string) => Promise<Blob>,
 *   getAsset: (id: string) => Object | null,
 *   clear: () => void
 * }}
 */
export function useAssetLibrary(options = {}) {
  const {
    initialAssets = [],
    onImport = null,
    onExport = null,
    onChange = null
  } = options;

  const [assets, setAssets] = useState(initialAssets);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState({
    type: null,      // Asset type filter
    tags: [],        // Tags filter
    sortBy: 'name',  // Sort field
    sortDir: 'asc'   // Sort direction
  });

  // Notify on changes
  useEffect(() => {
    onChange?.(assets);
  }, [assets, onChange]);

  // Filter and search assets
  const filteredAssets = useMemo(() => {
    let result = [...assets];

    // Apply type filter
    if (filter.type) {
      result = result.filter(asset => asset.type === filter.type);
    }

    // Apply tags filter
    if (filter.tags && filter.tags.length > 0) {
      result = result.filter(asset => 
        filter.tags.some(tag => (asset.tags || []).includes(tag))
      );
    }

    // Apply search
    if (search.trim()) {
      const query = search.toLowerCase();
      result = result.filter(asset => 
        asset.name?.toLowerCase().includes(query) ||
        asset.description?.toLowerCase().includes(query) ||
        (asset.tags || []).some(tag => tag.toLowerCase().includes(query))
      );
    }

    // Apply sorting
    result.sort((a, b) => {
      let aVal = a[filter.sortBy] ?? '';
      let bVal = b[filter.sortBy] ?? '';

      if (typeof aVal === 'string') aVal = aVal.toLowerCase();
      if (typeof bVal === 'string') bVal = bVal.toLowerCase();

      if (aVal < bVal) return filter.sortDir === 'asc' ? -1 : 1;
      if (aVal > bVal) return filter.sortDir === 'asc' ? 1 : -1;
      return 0;
    });

    return result;
  }, [assets, search, filter]);

  // Get asset by ID
  const getAsset = useCallback((id) => {
    return assets.find(asset => asset.id === id) || null;
  }, [assets]);

  // Add new asset
  const addAsset = useCallback((asset) => {
    const newAsset = {
      id: `asset-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      tags: [],
      ...asset
    };

    setAssets(prev => [...prev, newAsset]);
    return newAsset;
  }, []);

  // Update existing asset
  const updateAsset = useCallback((id, updates) => {
    setAssets(prev => prev.map(asset => 
      asset.id === id 
        ? { ...asset, ...updates, updatedAt: Date.now() }
        : asset
    ));
  }, []);

  // Remove asset
  const removeAsset = useCallback((id) => {
    setAssets(prev => prev.filter(asset => asset.id !== id));
  }, []);

  // Import asset from file
  const importAsset = useCallback(async (file) => {
    if (onImport) {
      const imported = await onImport(file);
      if (imported) {
        return addAsset(imported);
      }
      return null;
    }

    // Default file import handling
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (e) => {
        try {
          const assetType = getAssetTypeFromFile(file);
          const asset = addAsset({
            name: file.name.replace(/\.[^/.]+$/, ''),
            type: assetType,
            fileName: file.name,
            mimeType: file.type,
            size: file.size,
            data: e.target.result
          });
          resolve(asset);
        } catch (err) {
          reject(err);
        }
      };

      reader.onerror = () => reject(reader.error);

      // Read as appropriate format
      if (file.type.startsWith('image/')) {
        reader.readAsDataURL(file);
      } else if (file.type.startsWith('audio/')) {
        reader.readAsArrayBuffer(file);
      } else {
        reader.readAsText(file);
      }
    });
  }, [onImport, addAsset]);

  // Export asset
  const exportAsset = useCallback(async (id) => {
    const asset = getAsset(id);
    if (!asset) return null;

    if (onExport) {
      return onExport(asset);
    }

    // Default export handling
    const data = asset.data;
    const mimeType = asset.mimeType || 'application/octet-stream';
    
    if (typeof data === 'string' && data.startsWith('data:')) {
      // Data URL - extract blob
      const response = await fetch(data);
      return response.blob();
    } else if (data instanceof ArrayBuffer) {
      return new Blob([data], { type: mimeType });
    } else if (typeof data === 'object') {
      return new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    } else {
      return new Blob([String(data)], { type: 'text/plain' });
    }
  }, [getAsset, onExport]);

  // Import multiple files
  const importMultiple = useCallback(async (files) => {
    const imported = [];
    for (const file of files) {
      try {
        const asset = await importAsset(file);
        if (asset) imported.push(asset);
      } catch {
        // Continue with other files
      }
    }
    return imported;
  }, [importAsset]);

  // Clear all assets
  const clear = useCallback(() => {
    setAssets([]);
    setSearch('');
  }, []);

  // Get unique tags
  const allTags = useMemo(() => {
    const tagSet = new Set();
    assets.forEach(asset => {
      (asset.tags || []).forEach(tag => tagSet.add(tag));
    });
    return Array.from(tagSet).sort();
  }, [assets]);

  // Get asset counts by type
  const assetCounts = useMemo(() => {
    const counts = {};
    assets.forEach(asset => {
      counts[asset.type] = (counts[asset.type] || 0) + 1;
    });
    return counts;
  }, [assets]);

  return {
    // Data
    assets,
    filteredAssets,
    search,
    filter,
    allTags,
    assetCounts,

    // Search & Filter
    setSearch,
    setFilter,
    
    // CRUD operations
    getAsset,
    addAsset,
    updateAsset,
    removeAsset,
    
    // Import/Export
    importAsset,
    importMultiple,
    exportAsset,
    
    // Utilities
    clear
  };
}

/**
 * Determine asset type from file
 */
function getAssetTypeFromFile(file) {
  const ext = file.name.split('.').pop()?.toLowerCase();
  const type = file.type;

  if (type.startsWith('image/') || ['png', 'jpg', 'jpeg', 'gif', 'webp'].includes(ext)) {
    return 'sprite';
  }
  if (type.startsWith('audio/') || ['mp3', 'wav', 'ogg', 'flac'].includes(ext)) {
    return 'audio';
  }
  if (['obj', 'gltf', 'glb', 'fbx'].includes(ext)) {
    return 'model';
  }
  if (['lua', 'pxs', 'pixoscript'].includes(ext)) {
    return 'script';
  }
  if (['json', 'map'].includes(ext)) {
    return 'map';
  }
  return 'unknown';
}

export default useAssetLibrary;
