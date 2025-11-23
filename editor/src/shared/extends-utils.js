/*
 * ---------------------------------------------------------------
 *         Pixospritz – Editor – Extends Utilities
 * ---------------------------------------------------------------
 * Copyright (c) 2022‑2025  Kyle Derby MacInnis
 *
 * Utilities for handling the "extends" feature in tilesets,
 * sprites, maps, and other configurations. Implements deep
 * merging similar to the engine's behavior.
 */

/**
 * Deep merge two objects. Arrays are concatenated, objects are merged recursively.
 * Based on the engine's mergeDeep implementation.
 * @param {Object} target - Target object
 * @param {Object} source - Source object to merge in
 * @returns {Object} Merged object
 */
export function mergeDeep(target, source) {
  const output = { ...target };
  
  if (isObject(target) && isObject(source)) {
    Object.keys(source).forEach(key => {
      if (isObject(source[key])) {
        if (!(key in target)) {
          Object.assign(output, { [key]: source[key] });
        } else {
          output[key] = mergeDeep(target[key], source[key]);
        }
      } else if (Array.isArray(source[key])) {
        // For arrays, we replace rather than concat (engine behavior)
        output[key] = source[key];
      } else {
        Object.assign(output, { [key]: source[key] });
      }
    });
  }
  
  return output;
}

/**
 * Check if value is an object (not array, not null)
 * @param {*} item - Value to check
 * @returns {boolean}
 */
function isObject(item) {
  return item && typeof item === 'object' && !Array.isArray(item);
}

/**
 * Resolve extends for a configuration object
 * @param {Object} config - Configuration with potential extends property
 * @param {Function} loader - Async function that loads a referenced config by name
 * @returns {Promise<Object>} Resolved configuration
 */
export async function resolveExtends(config, loader) {
  if (!config.extends || !Array.isArray(config.extends)) {
    return config;
  }
  
  let resolved = { ...config };
  
  // Load all extended configs
  for (const extendPath of config.extends) {
    try {
      const extendedConfig = await loader(extendPath);
      
      // Recursively resolve the extended config's extends
      const fullyResolved = await resolveExtends(extendedConfig, loader);
      
      // Merge the extended config into current
      resolved = mergeDeep(resolved, fullyResolved);
    } catch (error) {
      console.warn(`Failed to load extends: ${extendPath}`, error);
    }
  }
  
  // Remove extends property after resolution
  delete resolved.extends;
  
  return resolved;
}

/**
 * Load and resolve a tileset with extends
 * @param {Object} zip - Zip filesystem
 * @param {string} tilesetName - Name of the tileset
 * @param {Function} getData - Function to get data from zip entry
 * @returns {Promise<Object>} Resolved tileset configuration
 */
export async function loadTilesetWithExtends(zip, tilesetName, getData) {
  // Find tileset.json file
  const tilesetPath = `tilesets/${tilesetName}/tileset.json`;
  
  let tilesetEntry = null;
  if (zip.files) {
    // JSZip format
    tilesetEntry = zip.files[tilesetPath];
  } else {
    // zip.js filesystem format
    for (const entry of zip.entries()) {
      if (entry.name === tilesetPath || entry.fullName === tilesetPath) {
        tilesetEntry = entry;
        break;
      }
    }
  }
  
  if (!tilesetEntry) {
    throw new Error(`Tileset not found: ${tilesetPath}`);
  }
  
  const tilesetJson = JSON.parse(await getData(tilesetEntry, true));
  
  // Loader function for extends
  const loader = async (extendName) => {
    const extendPath = `tilesets/${extendName}/tileset.json`;
    let extendEntry = null;
    
    if (zip.files) {
      extendEntry = zip.files[extendPath];
    } else {
      for (const entry of zip.entries()) {
        if (entry.name === extendPath || entry.fullName === extendPath) {
          extendEntry = entry;
          break;
        }
      }
    }
    
    if (!extendEntry) {
      throw new Error(`Extended tileset not found: ${extendPath}`);
    }
    
    return JSON.parse(await getData(extendEntry, true));
  };
  
  return await resolveExtends(tilesetJson, loader);
}

/**
 * Load and resolve a sprite with extends
 * @param {Object} zip - Zip filesystem
 * @param {string} spritePath - Path to sprite (relative to sprites/ folder)
 * @param {Function} getData - Function to get data from zip entry
 * @returns {Promise<Object>} Resolved sprite configuration
 */
export async function loadSpriteWithExtends(zip, spritePath, getData) {
  const fullPath = spritePath.startsWith('sprites/') 
    ? spritePath 
    : `sprites/${spritePath}.json`;
  
  let spriteEntry = null;
  if (zip.files) {
    spriteEntry = zip.files[fullPath];
  } else {
    for (const entry of zip.entries()) {
      if (entry.name === fullPath || entry.fullName === fullPath) {
        spriteEntry = entry;
        break;
      }
    }
  }
  
  if (!spriteEntry) {
    throw new Error(`Sprite not found: ${fullPath}`);
  }
  
  const spriteJson = JSON.parse(await getData(spriteEntry, true));
  
  // Loader function for extends
  const loader = async (extendPath) => {
    const extendFullPath = extendPath.startsWith('sprites/')
      ? extendPath
      : `sprites/${extendPath}.json`;
    
    let extendEntry = null;
    if (zip.files) {
      extendEntry = zip.files[extendFullPath];
    } else {
      for (const entry of zip.entries()) {
        if (entry.name === extendFullPath || entry.fullName === extendFullPath) {
          extendEntry = entry;
          break;
        }
      }
    }
    
    if (!extendEntry) {
      throw new Error(`Extended sprite not found: ${extendFullPath}`);
    }
    
    return JSON.parse(await getData(extendEntry, true));
  };
  
  return await resolveExtends(spriteJson, loader);
}
