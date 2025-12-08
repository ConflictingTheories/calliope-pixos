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
  
  // Find tileset.json file - try multiple path patterns
  const possiblePaths = [
    `tilesets/${tilesetName}/tileset.json`,
    `${tilesetName}/tileset.json`,
    `tilesets/${tilesetName}.json`,
  ];
  
  let tilesetEntry = null;
  let allEntries = [];
  
  if (zip.files) {
    // JSZip format
    for (const path of possiblePaths) {
      if (zip.files[path]) {
        tilesetEntry = zip.files[path];
        break;
      }
    }
  } else {
    // zip.js filesystem format - collect all entries by traversing the tree
    const entries = [];
    
    if (zip.root) {
      // Build entry list with full paths from the directory tree
      const buildEntryList = (node, path = '', list = []) => {
        if (node.children) {
          node.children.forEach(child => {
            const fullPath = path ? `${path}/${child.name}` : child.name;
            if (!child.directory) {
              list.push({ entry: child, fullPath });
            }
            buildEntryList(child, fullPath, list);
          });
        }
        return list;
      };
      
      entries.push(...buildEntryList(zip.root));
    } else if (Array.isArray(zip.entries)) {
      // Fallback: try using entries array directly
      zip.entries.forEach(entry => {
        const fullPath = entry.fullName || entry.name;
        if (fullPath) {
          entries.push({ entry, fullPath });
        }
      });
    }
    
    for (const { entry, fullPath } of entries) {
      allEntries.push(fullPath);
      
      // Try exact matches first
      for (const path of possiblePaths) {
        if (fullPath === path) {
          tilesetEntry = entry;
          break;
        }
      }
      
      if (tilesetEntry) break;
      
      // Try fuzzy match: ends with the tileset name and tileset.json
      if (fullPath.includes(`${tilesetName}/tileset.json`) || 
          fullPath.endsWith(`/${tilesetName}/tileset.json`)) {
        tilesetEntry = entry;
        break;
      }
    }
  }
  
  if (!tilesetEntry) {
    console.error('[extends-utils] Tileset not found. Tried paths:', possiblePaths);
    console.error('[extends-utils] Available entries:', allEntries.filter(p => p.includes('tileset')));
    throw new Error(`Tileset not found: ${tilesetName}`);
  }
  
  const tilesetJson = JSON.parse(await getData(tilesetEntry, true));
  
  // Loader function for extends
  const loader = async (extendName) => {
    
    const possibleExtendPaths = [
      `tilesets/${extendName}/tileset.json`,
      `${extendName}/tileset.json`,
      `tilesets/${extendName}.json`,
    ];
    
    let extendEntry = null;
    
    if (zip.files) {
      for (const path of possibleExtendPaths) {
        if (zip.files[path]) {
          extendEntry = zip.files[path];
          break;
        }
      }
    } else {
      // zip.js filesystem format - build entry list with full paths
      const entries = [];
      
      if (zip.root) {
        const buildEntryList = (node, path = '', list = []) => {
          if (node.children) {
            node.children.forEach(child => {
              const fullPath = path ? `${path}/${child.name}` : child.name;
              if (!child.directory) {
                list.push({ entry: child, fullPath });
              }
              buildEntryList(child, fullPath, list);
            });
          }
          return list;
        };
        entries.push(...buildEntryList(zip.root));
      } else if (Array.isArray(zip.entries)) {
        zip.entries.forEach(entry => {
          const fullPath = entry.fullName || entry.name;
          if (fullPath) {
            entries.push({ entry, fullPath });
          }
        });
      }
      
      for (const { entry, fullPath } of entries) {
        // Try exact matches
        for (const path of possibleExtendPaths) {
          if (fullPath === path) {
            extendEntry = entry;
            break;
          }
        }
        
        if (extendEntry) break;
        
        // Try fuzzy match
        if (fullPath.includes(`${extendName}/tileset.json`) ||
            fullPath.endsWith(`/${extendName}/tileset.json`)) {
          extendEntry = entry;
          break;
        }
      }
    }
    
    if (!extendEntry) {
      console.error('[extends-utils] Extended tileset not found:', extendName);
      console.error('[extends-utils] Tried paths:', possibleExtendPaths);
      throw new Error(`Extended tileset not found: ${extendName}`);
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
    // Build entry list with full paths
    const entries = [];
    if (zip.root) {
      const buildEntryList = (node, path = '', list = []) => {
        if (node.children) {
          node.children.forEach(child => {
            const fp = path ? `${path}/${child.name}` : child.name;
            if (!child.directory) {
              list.push({ entry: child, fullPath: fp });
            }
            buildEntryList(child, fp, list);
          });
        }
        return list;
      };
      entries.push(...buildEntryList(zip.root));
    }
    
    for (const { entry, fullPath: fp } of entries) {
      if (fp === fullPath) {
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
      // Build entry list with full paths
      const entries = [];
      if (zip.root) {
        const buildEntryList = (node, path = '', list = []) => {
          if (node.children) {
            node.children.forEach(child => {
              const fp = path ? `${path}/${child.name}` : child.name;
              if (!child.directory) {
                list.push({ entry: child, fullPath: fp });
              }
              buildEntryList(child, fp, list);
            });
          }
          return list;
        };
        entries.push(...buildEntryList(zip.root));
      }
      
      for (const { entry, fullPath: fp } of entries) {
        if (fp === extendFullPath) {
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
