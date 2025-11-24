/*
 * ---------------------------------------------------------------
 *                     Pixospritz – Editor App
 * ---------------------------------------------------------------
 * Copyright (c) 2022‑2025  Kyle Derby MacInnis
 *
 * Main application container for the Pixospritz editor.  It
 * orchestrates the zip manager sidebar and renders the various
 * preview/editing panes depending on the file type selected by
 * the user.  New viewers and editors are registered below to
 * support audio, 3D models, maps, tilesets and cutscenes in
 * addition to text and image files.
 */

import React, { useState, useEffect, useCallback } from 'react';

import ZipManager from './zip-manager/index.jsx';
import ScriptEditor from './script-editor/index.jsx';
import ImagePreview from './image-preview/index.jsx';
import AudioPreview from './audio-preview/index.jsx';
import ModelPreview from './model-preview/index.jsx';
import MapEditor3D from './map-editor/MapEditor3D.jsx';
import TilesetEditor from './tileset-editor/index.jsx';
import CutsceneTool from './cutscene-tool/index.jsx';
import GeometryEditor from './geometry-editor/index.jsx';
import GeometryEditor3D from './geometry-editor/GeometryEditor3D.jsx';
import { Reader, Writer } from '@zip.js/zip.js';
import { loadTilesetWithExtends, mergeDeep } from './shared/extends-utils.js';

/**
 * Primary React component that drives the editor UI.
 * Maintains package state, renders the appropriate editor pane, and exposes
 * helpers for asset validation, file management, and content previews.
 * @returns {React.ReactElement}
 */
const App = () => {
  const [contents, setContents] = useState([]);
  // Keep track of the loaded package filesystem and the selected entry
  const [zip, setZip] = useState(null);
  const [selectedEntry, setSelectedEntry] = useState(null);
  // Keep a list of image assets (name and data URI) for use in the tileset editor
  const [assets, setAssets] = useState([]);

  // Validation report state.  When set, contains an object with `errors` and `warnings`
  const [validationReport, setValidationReport] = useState(null);

  /**
   * Read a file entry from the package filesystem and return its text
   * representation or raw bytes when requested.
   * @param {object} entry - Zip.js entry describing the file.
   * @param {boolean} [asText=false] - Whether to resolve the content as text.
   * @returns {Promise<string|Uint8Array|null>}
   */
  const getData = useCallback(async (entry, asText = false) => {
    if (!entry) return null;
    
    // Handle newly created files that have Blob data directly
    if (entry.data instanceof Blob) {
      console.log('[getData] Entry has Blob data directly, reading...');
      if (asText) {
        return await entry.data.text();
      } else {
        const arrayBuffer = await entry.data.arrayBuffer();
        return new Uint8Array(arrayBuffer);
      }
    }
    
    // Check if entry has the data.getData method (zip.js filesystem structure for original files)
    if (!entry.data || typeof entry.data.getData !== 'function') {
      console.error('[getData] Entry missing data.getData and is not a Blob:', entry);
      return null;
    }
    
    if (asText) {
      let stream = new TransformStream();
      let dataPromise = new Response(stream.readable).text();
      await entry.data.getData(stream.writable);
      return await dataPromise;
    }
    // For binary data
    let stream = new TransformStream();
    let dataPromise = new Response(stream.readable).arrayBuffer();
    await entry.data.getData(stream.writable);
    const arrayBuffer = await dataPromise;
    return new Uint8Array(arrayBuffer);
  }, []);

  /**
   * Convert binary bytes to a base64 data URI with the provided MIME type.
   * @param {Uint8Array|string} binaryString - Raw bytes or string to encode.
   * @param {string} mimeType - MIME type of the binary payload.
   * @returns {string}
   */
  const toDataUri = useCallback((binaryString, mimeType) => {
    if (!binaryString) return '';
    const bytes = typeof binaryString !== 'string' ? binaryString : new Uint8Array([...binaryString].map((c) => c.charCodeAt(0)));
    let binary = '';
    bytes.forEach((b) => (binary += String.fromCharCode(b)));
    const base64String = btoa(binary);
    return `data:${mimeType};base64,${base64String}`;
  }, []);

  /**
   * Write or replace text content at the given path in the loaded package.
   * @param {string} filePath - Full path of the file inside the package.
   * @param {string} textContent - UTF-8 text to save.
   * @returns {Promise<void>}
   */
  const writeFile = useCallback(async (filePath, textContent) => {
    if (!zip) {
      throw new Error('Package filesystem not available');
    }
    
    console.log('[writeFile] Saving file:', filePath);
    
    // Helper to find a file in the tree
    const findFile = (node, path = '', targetPath) => {
      if (node.children) {
        for (const child of node.children) {
          const fullPath = path ? `${path}/${child.name}` : child.name;
          if (!child.directory && fullPath === targetPath) {
            return child;
          }
          if (child.directory) {
            const found = findFile(child, fullPath, targetPath);
            if (found) return found;
          }
        }
      }
      return null;
    };
    
    // Helper to find a directory in the tree
    const findDirectory = (node, path = '', targetPath) => {
      const currentPath = path || (node === zip.root ? '' : node.name);
      if (currentPath === targetPath) {
        return node;
      }
      if (node.children) {
        for (const child of node.children) {
          if (child.directory) {
            const childPath = path ? `${path}/${child.name}` : child.name;
            const found = findDirectory(child, childPath, targetPath);
            if (found) return found;
          }
        }
      }
      return null;
    };
    
    const existingFile = findFile(zip.root, '', filePath);
    const fileName = filePath.split('/').pop();
    const dirPath = filePath.substring(0, filePath.lastIndexOf('/'));
    
    console.log('[writeFile] File name:', fileName);
    console.log('[writeFile] Directory path:', dirPath);
    console.log('[writeFile] Existing file:', existingFile ? 'found' : 'not found');
    
    let parentFolder;
    
    if (existingFile) {
      // File exists - update it
      console.log('[writeFile] Found existing file:', existingFile.name);
      parentFolder = existingFile.parent;
      
      if (!parentFolder) {
        throw new Error(`Cannot find parent folder for: ${filePath}`);
      }
      
      console.log('[writeFile] Removing old file...');
      await zip.remove(existingFile);
      console.log('[writeFile] Old file removed');
    } else {
      // File doesn't exist - create it in the appropriate directory
      console.log('[writeFile] File does not exist, creating new file:', fileName, 'in directory:', dirPath);
      
      // Find the parent directory
      parentFolder = dirPath ? findDirectory(zip.root, '', dirPath) : zip.root;
      
      if (!parentFolder) {
        throw new Error(`Cannot find directory: ${dirPath}`);
      }
      
      console.log('[writeFile] Creating new file in:', parentFolder.name || 'root');
    }
    
    // Add the file with content
    console.log('[writeFile] Adding file:', fileName, 'to', parentFolder.name || 'root');
    const blob = new Blob([textContent], { type: 'text/plain' });
    await parentFolder.addBlob(fileName, blob);
    console.log('[writeFile] File saved successfully');
  }, [zip]);

  /**
   * Get the full path of a zip entry by traversing up to the root parent.
   * @param {object} entry - Zip.js entry whose path is resolved.
   * @returns {string}
   */
  const getEntryFullPath = useCallback((entry) => {
    if (entry.fullName) {
      console.log('[getEntryFullPath] Using entry.fullName:', entry.fullName);
      return entry.fullName;
    }
    
    const parts = [];
    let current = entry;
    while (current && current.name) {
      parts.unshift(current.name);
      current = current.parent;
      // Safety check to avoid infinite loop
      if (parts.length > 20) {
        console.error('[getEntryFullPath] Loop detected, breaking');
        break;
      }
    }
    const fullPath = parts.join('/');
    console.log('[getEntryFullPath] Constructed path:', fullPath, 'from parts:', parts);
    return fullPath;
  }, []);

  /**
   * Build a list of image assets with URIs so the tileset editor can
   * render them.  Supports png, jpg/jpeg, gif, and bmp files.
   * @param {object} zipFs - Zip.js filesystem for the loaded package.
   * @returns {Promise<void>}
   */
  const buildAssetList = useCallback(async (zipFs) => {
    if (!zipFs || typeof zipFs.entries !== 'function') {
      setAssets([]);
      return;
    }
    const imageExts = ['png', 'jpg', 'jpeg', 'gif', 'bmp'];
    const list = [];
    const promises = [];
    for (const entry of zipFs.entries()) {
      if (entry.directory) continue;
      const ext = entry.name.split('.').pop().toLowerCase();
      if (imageExts.includes(ext)) {
        promises.push(
          getData(entry, false).then((bin) => {
            const mime = `image/${ext === 'jpg' ? 'jpeg' : ext}`;
            const uri = toDataUri(bin, mime);
            list.push({ name: entry.name, uri });
          })
        );
      }
    }
    await Promise.all(promises);
    setAssets(list);
  }, [getData, toDataUri]);

  // Whenever a new zip is loaded, rebuild the asset list
  // Rebuild asset list when zip changes
  useEffect(() => {
    if (zip) {
      buildAssetList(zip);
    } else {
      setAssets([]);
    }
  }, [zip, buildAssetList]);

  /**
   * Validate the currently loaded package by scanning JSON assets and
   * collecting cross-reference errors/warnings.
   * @returns {Promise<void>}
   */
  const validatePackage = useCallback(async () => {
    if (!zip) {
      setValidationReport(null);
      return;
    }
    const errors = [];
    const warnings = [];
    const assetNames = assets.map((a) => a.name);
    const tilesets = [];
    const mapsList = [];
    const cutscenes = [];
    const entries = zip.files ? Object.values(zip.files).filter((e) => !e.dir && e.name.toLowerCase().endsWith('.json')) : [];
    await Promise.all(
      entries.map(async (entry) => {
        try {
          const data = entry.async ? await entry.async('string') : await getData(entry);
          const obj = JSON.parse(data);
          const name = entry.name;
          const lower = name.toLowerCase();
          if (lower.includes('tileset') || lower.includes('tiles')) {
            const tiles = Array.isArray(obj.tiles) ? obj.tiles : [];
            const geom = Array.isArray(obj.geometry) ? obj.geometry : [];
            tilesets.push({ name, tiles, geometry: geom });
          } else if (lower.includes('map')) {
            const layers = Array.isArray(obj.layers)
              ? obj.layers
              : obj.cells
                ? [obj.cells]
                : [];
            const attributes = Array.isArray(obj.attributes)
              ? obj.attributes
              : [];
            mapsList.push({ name, layers, attributes });
          } else if (lower.includes('cutscene')) {
            const events = Array.isArray(obj) ? obj : [];
            cutscenes.push({ name, events });
          }
        } catch (err) {
          errors.push(`File ${entry.name} contains invalid JSON`);
        }
      })
    );
    // Build a set of all tile IDs defined across all tilesets
    const tileIdSet = new Set();
    tilesets.forEach((ts) => {
      ts.tiles.forEach((tile) => {
        if (typeof tile.id === 'number') tileIdSet.add(tile.id);
      });
    });
    // Validate tilesets
    tilesets.forEach((ts) => {
      ts.tiles.forEach((tile, idx) => {
        if (tile.geometry !== undefined && tile.geometry !== null) {
          const geomIndex = tile.geometry;
          const length = ts.geometry.length;
          if (geomIndex < 0 || geomIndex >= length) {
            errors.push(`Tileset ${ts.name}: tile ${idx} has invalid geometry index ${geomIndex}`);
          }
        }
        if (tile.texture) {
          if (!assetNames.includes(tile.texture)) {
            errors.push(`Tileset ${ts.name}: tile ${idx} references missing texture ${tile.texture}`);
          }
        }
      });
    });
    // Validate maps
    mapsList.forEach((m) => {
      m.layers.forEach((layer) => {
        layer.forEach((row) => {
          row.forEach((cell) => {
            if (cell !== 0 && !tileIdSet.has(cell)) {
              errors.push(`Map ${m.name}: cell value ${cell} is not a valid tile id`);
            }
          });
        });
      });
    });
    // Validate cutscenes
    cutscenes.forEach((cs) => {
      cs.events.forEach((ev, idx) => {
        if (ev.type === 'dialogue' && ev.portrait) {
          if (!assetNames.includes(ev.portrait)) {
            errors.push(`Cutscene ${cs.name}: event ${idx + 1} references missing portrait ${ev.portrait}`);
          }
        }
      });
    });
    setValidationReport({ errors, warnings });
  }, [zip, assets, getData]);

  // Editor/viewer renderers
  const renderScriptEditor = useCallback(async (entry, lang) => {
    const script = await getData(entry, true);
    setContents([
      <ScriptEditor
        key={Date.now()}
        lang={lang}
        type="script-only"
        content={script}
        onSave={async (newContent) => {
          try {
            const fullPath = getEntryFullPath(entry);
            await writeFile(fullPath, newContent);
            console.log('[ScriptEditor] File saved:', fullPath);
            alert('File saved successfully!');
          } catch (err) {
            console.error('[ScriptEditor] Save failed:', err);
            alert('Failed to save: ' + err.message);
          }
        }}
      />
    ]);
  }, [getData, zip]);

  const renderImagePreview = useCallback(async (entry) => {
    const imageBytes = await getData(entry, false);
    const extension = entry.name.split('.').pop().toLowerCase();
    const mime = `image/${extension === 'jpg' ? 'jpeg' : extension}`;
    const dataUri = toDataUri(imageBytes, mime);
    setContents([
      <ImagePreview key={Date.now()} content={dataUri} />
    ]);
  }, [getData, toDataUri]);

  const renderAudioPreview = useCallback(async (entry) => {
    const audioBytes = await getData(entry, false);
    const extension = entry.name.split('.').pop().toLowerCase();
    const mime = `audio/${extension}`;
    const dataUri = toDataUri(audioBytes, mime);
    setContents([
      <AudioPreview key={Date.now()} content={dataUri} />
    ]);
  }, [getData, toDataUri]);

  const renderModelPreview = useCallback(async (entry) => {
    const modelBytes = await getData(entry, false);
    const extension = entry.name.split('.').pop().toLowerCase();
    const mimeLookup = {
      obj: 'text/plain',
      mtl: 'text/plain',
      gltf: 'model/gltf+json',
      glb: 'model/gltf-binary',
    };
    const mime = mimeLookup[extension] || 'application/octet-stream';
    const dataUri = toDataUri(modelBytes, mime);
    setContents([
      <ModelPreview key={Date.now()} content={dataUri} />
    ]);
  }, [getData, toDataUri]);

  const renderMapEditor = useCallback(async (entry) => {
    console.log('Loading map editor for:', entry.name);
    console.log('Zip object:', zip);
    console.log('Zip type:', typeof zip);
    console.log('Zip methods:', zip ? Object.keys(zip) : 'no zip');
    
    // Helper to get full path of an entry
    const getEntryFullPath = (ent) => {
      // If entry already has fullName, use it
      if (ent.fullName) return ent.fullName;
      
      // Otherwise, traverse up the parent chain to build the path
      const pathParts = [];
      let current = ent;
      while (current) {
        if (current.name) {
          pathParts.unshift(current.name);
        }
        current = current.parent;
      }
      return pathParts.join('/');
    };
    
    const entryFullPath = getEntryFullPath(entry);
    
    // Get all entries from zip filesystem - try multiple approaches
    let allEntries = [];
    if (zip) {
      if (typeof zip.entries === 'function') {
        allEntries = Array.from(zip.entries());
        console.log('Got entries from zip.entries():', allEntries.length);
      } else if (zip.root) {
        // Build a map of full paths to actual entry objects
        const buildEntryMap = (node, path = '', map = new Map()) => {
          if (node.children) {
            node.children.forEach(child => {
              const fullPath = path ? `${path}/${child.name}` : child.name;
              // Skip macOS metadata
              if (fullPath.includes('__MACOSX') || child.name.startsWith('._')) {
                return;
              }
              if (!child.directory) {
                map.set(fullPath, child); // Store actual entry object
              }
              buildEntryMap(child, fullPath, map);
            });
          }
          return map;
        };
        
        const entryMap = buildEntryMap(zip.root);
        allEntries = Array.from(entryMap.entries()).map(([fullPath, entry]) => ({
          ...entry,
          fullName: fullPath
        }));
        console.log('Got entries from root:', allEntries.length);
      }
    }
    console.log('Available files in package:', allEntries.map(e => e.fullName || e.name));
    
    // Filter out macOS metadata files
    allEntries = allEntries.filter(e => {
      const fullPath = e.fullName || e.name;
      return !fullPath.includes('__MACOSX') && !fullPath.split('/').some(part => part.startsWith('._'));
    });
    console.log('Filtered files (no macOS junk):', allEntries.length);
    
    // Load map.json
    const mapContent = await getData(entry, true);
    let mapData = null;
    let cellsData = null;
    let tilesetName = null;
    
    try {
      mapData = JSON.parse(mapContent);
      tilesetName = mapData.tileset;
      console.log('Map data loaded, tileset:', tilesetName);
      console.log('Full map data:', mapData);
    } catch (err) {
      console.error('Failed to parse map.json:', err);
    }
    
    // Load cells.json and heights.json from the same directory
    let heightsData = null;
    if (allEntries.length > 0) {
      try {
        // Extract the directory from the map file path
        const mapDir = entryFullPath.substring(0, entryFullPath.lastIndexOf('/') + 1);
        const cellsFileName = 'cells.json';
        const heightsFileName = 'heights.json';
        
        console.log('Map file path:', entryFullPath);
        console.log('Searching for cells.json and heights.json in directory:', mapDir);
        
        // Find cells.json in the same directory as map.json
        const cellsFile = allEntries.find(e => {
          const fullPath = e.fullName || e.name;
          const exactMatch = fullPath === `${mapDir}${cellsFileName}`;
          if (exactMatch) {
            console.log('Found exact match for cells.json:', fullPath);
          }
          return exactMatch;
        });
        
        if (cellsFile) {
          console.log('Found cells.json at:', cellsFile.fullName || cellsFile.name);
          try {
            const cellsContent = await getData(cellsFile, true);
            console.log('Cells content type:', typeof cellsContent, 'length:', cellsContent?.length);
            console.log('Cells content preview:', cellsContent?.substring(0, 100));
            if (cellsContent) {
              const parsedCells = JSON.parse(cellsContent);
              console.log('Parsed cells data type:', Array.isArray(parsedCells) ? 'array' : typeof parsedCells);
              console.log('Cells data:', parsedCells);
              
              // Check if cells.json has extends
              if (parsedCells.extends && Array.isArray(parsedCells.extends)) {
                console.log('[Cells] Found extends:', parsedCells.extends);
                
                // Load and merge extended cells
                let mergedCells = parsedCells.cells || [];
                
                for (const extendMapName of parsedCells.extends) {
                  try {
                    console.log('[Cells] Loading extended map:', extendMapName);
                    const extendCellsPath = `maps/${extendMapName}/cells.json`;
                    const extendCellsFile = allEntries.find(e => (e.fullName || e.name) === extendCellsPath);
                    
                    if (extendCellsFile) {
                      const extendCellsContent = await getData(extendCellsFile, true);
                      const extendCellsData = JSON.parse(extendCellsContent);
                      
                      // Get the cells array (handle both array format and object format)
                      const extendCells = Array.isArray(extendCellsData) ? extendCellsData : extendCellsData.cells;
                      
                      if (extendCells && Array.isArray(extendCells)) {
                        console.log('[Cells] Extending with cells from', extendMapName, ':', extendCells.length, 'rows');
                        
                        // Append extended cells (note: this is append-style like you mentioned)
                        mergedCells = [...mergedCells, ...extendCells];
                      }
                    } else {
                      console.warn('[Cells] Extended map cells not found:', extendCellsPath);
                    }
                  } catch (extErr) {
                    console.error('[Cells] Failed to load extended map:', extendMapName, extErr);
                  }
                }
                
                cellsData = mergedCells;
                console.log('[Cells] Final merged cells:', cellsData.length, 'rows');
              } else if (Array.isArray(parsedCells)) {
                // Simple array format
                cellsData = parsedCells;
                console.log('Cells data loaded:', cellsData.length, 'x', cellsData[0]?.length);
              } else if (parsedCells.cells && Array.isArray(parsedCells.cells)) {
                // Object format with cells property
                cellsData = parsedCells.cells;
                console.log('Cells data loaded from .cells property:', cellsData.length, 'x', cellsData[0]?.length);
              } else {
                console.error('ERROR: cells.json format not recognized!', parsedCells);
                cellsData = null;
              }
            } else {
              console.error('cells.json getData returned null');
            }
          } catch (parseErr) {
            console.error('Failed to parse cells.json:', parseErr);
          }
        } else {
          console.warn('cells.json not found in directory:', mapDir);
          console.warn('Available files:', allEntries.map(e => e.fullName || e.name));
        }
        
        // Find heights.json in the same directory as map.json
        const heightsFile = allEntries.find(e => {
          const fullPath = e.fullName || e.name;
          const exactMatch = fullPath === `${mapDir}${heightsFileName}`;
          return exactMatch;
        });
        
        if (heightsFile) {
          console.log('Found heights.json at:', heightsFile.fullName || heightsFile.name);
          try {
            const heightsContent = await getData(heightsFile, true);
            console.log('Heights content type:', typeof heightsContent, 'length:', heightsContent?.length);
            if (heightsContent) {
              heightsData = JSON.parse(heightsContent);
              console.log('Heights data loaded:', heightsData.length, 'x', heightsData[0]?.length);
            } else {
              console.warn('heights.json getData returned null');
            }
          } catch (parseErr) {
            console.error('Failed to parse heights.json:', parseErr);
          }
        } else {
          console.log('heights.json not found in directory:', mapDir, '(this is OK for maps without custom heights)');
        }
      } catch (err) {
        console.error('Failed to load cells.json/heights.json:', err);
      }
    }
    
    // Combine map, cells, and heights data
    const combinedContent = {
      ...mapData,
      cells: cellsData || mapData?.cells || [],
      heights: heightsData || mapData?.heights || null
    };
    
    console.log('Combined content - cells:', Array.isArray(combinedContent.cells) ? `${combinedContent.cells.length} rows` : typeof combinedContent.cells, 'heights:', combinedContent.heights ? 'present' : 'none');
    console.log('Final cells dimensions:', combinedContent.cells?.length, 'x', combinedContent.cells?.[0]?.length);
    
    // Load tileset and its dependencies
    let tileset = null;
    let geometry = null;
    let tiles = null;
    let textureAtlas = null;
    
    if (tilesetName && allEntries.length > 0) {
      try {
        console.log('Loading tileset:', tilesetName);
        console.log('Available tileset files:', allEntries
          .filter(e => (e.fullName || e.name).includes('tileset'))
          .map(e => e.fullName || e.name)
        );
        
        // Use extends-aware tileset loader
        try {
          const resolvedTileset = await loadTilesetWithExtends(zip, tilesetName, getData);
          console.log('Tileset loaded with extends support:', resolvedTileset);
          tileset = resolvedTileset;
          geometry = resolvedTileset.geometry || {};
          tiles = resolvedTileset.tiles || {};
          console.log('Tileset loaded - geometry:', Object.keys(geometry).length, 'tiles:', Object.keys(tiles).length);
          
          // Load texture atlas
          if (resolvedTileset.src) {
            console.log('Loading texture:', resolvedTileset.src);
            const textureName = resolvedTileset.src;
            
            // Search for texture file - check multiple locations
            let textureFile = allEntries.find(e => {
              const fullPath = e.fullName || e.name;
              // Try exact match first
              return fullPath.endsWith(textureName);
            });
            
            // If not found, try broader search
            if (!textureFile) {
              const baseName = textureName.split('/').pop(); // Get just the filename
              textureFile = allEntries.find(e => {
                const fullPath = e.fullName || e.name;
                return fullPath.endsWith(baseName) && fullPath.match(/\.(png|jpg|jpeg|gif)$/i);
              });
            }
            
            if (textureFile) {
              console.log('Found texture at:', textureFile.fullName || textureFile.name);
              const textureBytes = await getData(textureFile, false);
              if (textureBytes) {
                const ext = resolvedTileset.src.split('.').pop().toLowerCase();
                const mime = `image/${ext === 'jpg' ? 'jpeg' : ext}`;
                textureAtlas = toDataUri(textureBytes, mime);
                console.log('Texture atlas loaded, size:', textureBytes.length, 'bytes', 'mime:', mime);
              } else {
                console.error('Failed to get texture bytes for:', textureFile.fullName || textureFile.name);
              }
            } else {
              console.warn('Texture not found:', textureName);
              console.warn('Searched for basename:', textureName.split('/').pop());
              console.warn('Available texture files:', allEntries.filter(e => {
                const fullPath = e.fullName || e.name;
                return fullPath.match(/\.(png|jpg|jpeg|gif)$/i);
              }).map(e => e.fullName || e.name));
            }
          }
        } catch (extendsErr) {
          console.error('Failed to load tileset with extends:', extendsErr);
          console.error('Error details:', extendsErr.message);
          
          // Fallback: try loading without extends support
          // Search more broadly for the tileset file
          let tilesetFile = allEntries.find(e => {
            const fullPath = e.fullName || e.name;
            return fullPath.includes(`tilesets/${tilesetName}`) && fullPath.endsWith('tileset.json');
          });
          
          // Try fuzzy match if exact not found
          if (!tilesetFile) {
            tilesetFile = allEntries.find(e => {
              const fullPath = e.fullName || e.name;
              return fullPath.includes(tilesetName) && fullPath.endsWith('tileset.json');
            });
          }
          
          if (tilesetFile) {
            console.log('Found tileset (fallback):', tilesetFile.fullName || tilesetFile.name);
            const tilesetContent = await getData(tilesetFile, true);
            if (tilesetContent && typeof tilesetContent === 'string') {
              const tilesetData = JSON.parse(tilesetContent);
              console.log('Tileset loaded (fallback without extends)');
              tileset = tilesetData;
              geometry = tilesetData.geometry || {};
              tiles = tilesetData.tiles || {};
            }
          }
        }
      } catch (err) {
        console.error('Failed to load tileset dependencies:', err);
      }
    }
    
    console.log('Rendering MapEditor3D with:', {
      hasTileset: !!tileset,
      hasGeometry: !!geometry,
      hasTiles: !!tiles,
      hasTexture: !!textureAtlas,
      cellsSize: combinedContent.cells?.length
    });
    
    setContents([
      <MapEditor3D
        key={Date.now()}
        content={combinedContent}
        tileset={tileset}
        geometry={geometry}
        tiles={tiles}
        textureAtlas={textureAtlas}
        zip={zip}
        entryName={entry.name}
        onSave={async (obj) => {
          try {
            console.log('[MapEditor] Saving map data:', obj);
            console.log('[MapEditor] Entry:', entry);
            
            // Get full path of the entry
            const fullPath = getEntryFullPath(entry);
            console.log('[MapEditor] Full path:', fullPath);
            
            // Extract cells and heights from the saved data
            const { cells, heights, ...mapOnlyData } = obj;
            
            // Save map.json (metadata only, no cells/heights)
            const mapJsonData = JSON.stringify(mapOnlyData, null, 2);
            await writeFile(fullPath, mapJsonData);
            console.log('[MapEditor] Saved map.json:', fullPath);
            
            // Save cells.json
            const cellsPath = fullPath.replace('map.json', 'cells.json');
            const cellsJsonData = JSON.stringify(cells, null, 2);
            await writeFile(cellsPath, cellsJsonData);
            console.log('[MapEditor] Saved cells.json:', cellsPath);
            
            // Save heights.json if it exists
            console.log('[MapEditor] Heights data:', heights ? `${heights.length} rows` : 'null', heights);
            if (heights && heights.length > 0) {
              const heightsPath = fullPath.replace('map.json', 'heights.json');
              const heightsJsonData = JSON.stringify(heights, null, 2);
              await writeFile(heightsPath, heightsJsonData);
              console.log('[MapEditor] Saved heights.json:', heightsPath, 'with', heights.length, 'rows');
            } else {
              console.warn('[MapEditor] No heights data to save');
            }
            
            console.log('[MapEditor] All map files saved successfully');
            alert('Map saved successfully! Note: You may need to close and reopen the map to see the changes reflected in the editor.');
          } catch (err) {
            console.error('[MapEditor] Save failed:', err);
            console.error('[MapEditor] Error stack:', err.stack);
            alert('Failed to save map: ' + err.message);
          }
        }}
      />
    ]);
  }, [getData, zip, toDataUri]);

  const renderTilesetEditor = useCallback(async (entry) => {
    const tilesetContent = await getData(entry, true);
    console.log(tilesetContent);
    setContents([
      <TilesetEditor
        key={Date.now()}
        content={tilesetContent}
        onSave={async (obj) => {
          try {
            const fullPath = getEntryFullPath(entry);
            const data = JSON.stringify(obj, null, 2);
            await writeFile(fullPath, data);
            console.log('[TilesetEditor] Saved:', fullPath);
            alert('Tileset saved successfully!');
          } catch (err) {
            console.error('[TilesetEditor] Save failed:', err);
            alert('Failed to save tileset: ' + err.message);
          }
        }}
        assets={assets}
      />
    ]);
  }, [getData, zip, assets]);

  const renderGeometryEditor = useCallback(async (entry) => {
    const geoContent = await getData(entry, true);
    
    // Try to parse to determine if it has the new format (with vertices/surfaces)
    let useEnhanced = false;
    try {
      const parsed = JSON.parse(geoContent);
      const geomObj = parsed.geometry || parsed;
      
      // Check if any geometry has vertices (new format)
      if (typeof geomObj === 'object') {
        for (const key in geomObj) {
          if (geomObj[key].vertices && Array.isArray(geomObj[key].vertices)) {
            useEnhanced = true;
            break;
          }
        }
      }
    } catch (err) {
      console.warn('Failed to parse geometry', err);
    }
    
    const EditorComponent = useEnhanced ? GeometryEditor3D : GeometryEditor;
    
    setContents([
      <EditorComponent
        key={Date.now()}
        content={geoContent}
        onSave={async (obj) => {
          try {
            const fullPath = getEntryFullPath(entry);
            const data = JSON.stringify(obj, null, 2);
            await writeFile(fullPath, data);
            console.log('[GeometryEditor] Saved:', fullPath);
            alert('Geometry saved successfully!');
          } catch (err) {
            console.error('[GeometryEditor] Save failed:', err);
            alert('Failed to save geometry: ' + err.message);
          }
        }}
      />
    ]);
  }, [getData, zip]);

  const renderCutsceneTool = useCallback(async (entry) => {
    const cutsceneContent = await getData(entry, true);
    const fileExtension = entry.name.match(/\\.\\w+$/)?.[0] || '.pxc';
    
    // Asset loader function that loads from ZIP with proper MIME types
    const assetLoader = async (path) => {
      try {
        console.log('[assetLoader] Loading asset:', path);
        // Clean the path
        let cleanPath = path.replace(/^data:/, '').replace(/^assets\//, '');
        console.log('[assetLoader] Clean path:', cleanPath);
        
        // Helper to find asset by name in ZIP recursively
        const findAsset = (node, targetName) => {
          if (node.children) {
            for (const child of node.children) {
              if (!child.directory && (child.name === targetName || child.name.includes(targetName))) {
                return child;
              }
              if (child.directory) {
                const found = findAsset(child, targetName);
                if (found) return found;
              }
            }
          }
          return null;
        };
        
        // First try direct match
        let assetEntry = findAsset(zip, cleanPath);
        
        // If not found, try common prefix and extension fixes for sprites and audio
        if (!assetEntry) {
          // For sprite assets like "characters/male"
          if (cleanPath.startsWith('characters/') || cleanPath.startsWith('npc/') || cleanPath.startsWith('sprites/')) {
            // Try prefixing with "sprites/" or various extensions
            const trialPaths = [
              cleanPath.startsWith('sprites/') ? cleanPath : 'sprites/' + cleanPath,
              cleanPath.startsWith('sprites/') ? cleanPath + '.json' : 'sprites/' + cleanPath + '.json',
              cleanPath.startsWith('sprites/') ? cleanPath + '.gif' : 'sprites/' + cleanPath + '.gif',
              cleanPath.startsWith('sprites/') ? cleanPath + '.png' : 'sprites/' + cleanPath + '.png',
              cleanPath + '.json',
              cleanPath + '.gif',
              cleanPath + '.png'
            ];
            for (const trial of trialPaths) {
              assetEntry = findAsset(zip, trial);
              if (assetEntry) {
                console.log('[assetLoader] Found sprite at:', trial);
                break;
              }
            }
          }
          
          // For texture/backdrop files
          if (!assetEntry && cleanPath.startsWith('textures/')) {
            const trialTexturePaths = [
              cleanPath,
              cleanPath + '.png',
              cleanPath + '.gif',
              cleanPath + '.jpg',
              cleanPath + '.jpeg'
            ];
            for (const trial of trialTexturePaths) {
              assetEntry = findAsset(zip, trial);
              if (assetEntry) break;
            }
          }
          
          // For audio files, try prefixing with "audio/"
          if (!assetEntry && cleanPath.match(/\.mp3$|\.wav$|\.ogg$/)) {
            const trialAudioPath = 'audio/' + cleanPath.replace(/^audio\//, '');
            assetEntry = findAsset(zip, trialAudioPath);
          }
          
          // For direct portrait references (like fire_portrait, water_portrait)
          if (!assetEntry && cleanPath.match(/_portrait$/)) {
            const trialPortraitPaths = [
              'textures/' + cleanPath + '.gif',
              'textures/' + cleanPath + '.png',
              cleanPath + '.gif',
              cleanPath + '.png'
            ];
            for (const trial of trialPortraitPaths) {
              assetEntry = findAsset(zip, trial);
              if (assetEntry) break;
            }
          }
          
          // Last resort: try without any prefix if it has an extension
          if (!assetEntry && cleanPath.match(/\.\w+$/)) {
            assetEntry = findAsset(zip, cleanPath.split('/').pop());
          }
        }
        
        if (!assetEntry) {
          // Only warn if it's not an intermediate search path
          // (e.g., don't warn for .json when looking for .gif)
          if (!path.match(/\.(json|gif|png)$/)) {
            console.warn(`Asset not found in ZIP: ${path}`);
          }
          return null;
        }
        
        // Get the data and convert to data URI
        const data = await getData(assetEntry, false);
        const ext = assetEntry.name.split('.').pop().toLowerCase();
        const mimeMap = {
          'png': 'image/png',
          'jpg': 'image/jpeg',
          'jpeg': 'image/jpeg',
          'gif': 'image/gif',
          'webp': 'image/webp',
          'svg': 'image/svg+xml',
          'mp3': 'audio/mpeg',
          'wav': 'audio/wav',
          'ogg': 'audio/ogg',
          'json': 'application/json',
        };
        const mimeType = mimeMap[ext] || 'application/octet-stream';
        console.log('[assetLoader] Returning data URI with MIME type:', mimeType);
        return toDataUri(data, mimeType);
      } catch (err) {
        console.error(`Failed to load asset ${path}:`, err);
        return null;
      }
    };
    
    setContents([
      <CutsceneTool
        key={Date.now()}
        content={cutsceneContent}
        fileExtension={fileExtension}
        assetLoader={assetLoader}
        onSave={async (data) => {
          try {
            const fullPath = getEntryFullPath(entry);
            // Save as-is if it's a string (DSL), or stringify if it's an object (JSON)
            const saveData = typeof data === 'string' ? data : JSON.stringify({ events: data }, null, 2);
            await writeFile(fullPath, saveData);
            console.log('[CutsceneTool] Saved:', fullPath);
            alert('Cutscene saved successfully!');
          } catch (err) {
            console.error('[CutsceneTool] Save failed:', err);
            alert('Failed to save cutscene: ' + err.message);
          }
        }}
        assets={assets}
      />
    ]);
  }, [getData, zip, assets, toDataUri]);

  // Open file and route to correct editor/viewer
  const openFile = useCallback(async (entry) => {
    if (!entry) return;
    
    // If it's a directory, check if it's a map directory and auto-load map.json
    if (entry.directory) {
      console.log('[App] Directory selected:', entry.name);
      
      // Check if this looks like a map directory (maps/* pattern)
      const isMapDir = entry.name.includes('/maps/') || entry.name.endsWith('/maps');
      
      if (isMapDir && zip) {
        try {
          // Try to find map.json in this directory
          const allEntries = await zip.entries();
          const mapJsonPath = entry.name.endsWith('/') ? `${entry.name}map.json` : `${entry.name}/map.json`;
          
          const mapJsonEntry = allEntries.find(e => {
            const fullPath = e.fullName || e.name;
            return fullPath === mapJsonPath;
          });
          
          if (mapJsonEntry) {
            console.log('[App] Auto-loading map.json from directory:', mapJsonPath);
            renderMapEditor(mapJsonEntry);
            return;
          } else {
            console.warn('[App] No map.json found in directory:', entry.name);
            setContents([<div key="nomap" style={{padding: '2rem', color: '#d4d4d4'}}>No map.json found in this directory</div>]);
            return;
          }
        } catch (err) {
          console.error('[App] Failed to auto-load map from directory:', err);
        }
      }
      
      // Not a map directory or failed to load - show message
      setContents([<div key="dir" style={{padding: '2rem', color: '#d4d4d4'}}>Directory selected. Double-click to enter or select a file.</div>]);
      return;
    }
    
    const name = entry.name.toLowerCase();
    setSelectedEntry(entry);
    if (name.endsWith('.pxs')) {
      renderScriptEditor(entry, 'pixoscript');
      return;
    }
    if (name.endsWith('.pxc')) {
      renderCutsceneTool(entry);
      return;
    }
    if (name.endsWith('.txt')) {
      renderScriptEditor(entry, 'plaintext');
      return;
    }
    if (name.endsWith('.json')) {
      if (name.includes('map')) {
        renderMapEditor(entry);
        return;
      }
      if (name.includes('geometry')) {
        renderGeometryEditor(entry);
        return;
      }
      if (name.includes('tileset')) {
        renderTilesetEditor(entry);
        return;
      }
      if (name.includes('cutscene')) {
        renderCutsceneTool(entry);
        return;
      }
      renderScriptEditor(entry, 'json');
      return;
    }
    if (['.png', '.gif', '.jpg', '.jpeg', '.bmp'].some((ext) => name.endsWith(ext))) {
      renderImagePreview(entry);
      return;
    }
    if (['.mp3', '.wav', '.ogg'].some((ext) => name.endsWith(ext))) {
      renderAudioPreview(entry);
      return;
    }
    if (['.obj', '.mtl', '.gltf', '.glb'].some((ext) => name.endsWith(ext))) {
      renderModelPreview(entry);
      return;
    }
    // Unknown file types fallback
    setContents([<div key="unknown">No registered viewer for {name}</div>]);
  }, [renderScriptEditor, renderMapEditor, renderGeometryEditor, renderTilesetEditor, renderCutsceneTool, renderImagePreview, renderAudioPreview, renderModelPreview, zip]);

  const hasContent = contents.length > 0;
  const errorCount = validationReport?.errors?.length ?? 0;
  const warningCount = validationReport?.warnings?.length ?? 0;
  const selectedEntryLabel = selectedEntry?.name || 'Choose an asset from the sidebar';

  return (
    <div className="editor-shell">
      <section className="editor-hero">
        <h1>Pixospritz Creator Studio</h1>
        <p>Manage packages, preview assets, and edit scripts inside an interface inspired by pixospritz.com.</p>
      </section>
      <div className="editor-stage">
        <ResizableSidebar
          openFile={openFile}
          onZipLoaded={setZip}
          onValidatePackage={validatePackage}
          validationReport={validationReport}
        />
        <section className="editor-main">
          <header className="editor-main-header">
            <div className="editor-main-title">
              <span>Active file</span>
              <strong>{selectedEntryLabel}</strong>
            </div>
            {validationReport && (
              <div className="editor-pill">
                <span>{errorCount} errors</span>
                <span>{warningCount} warnings</span>
              </div>
            )}
          </header>
          <div className="editor-main-content">
            {hasContent ? (
              contents.map((component) => component)
            ) : (
              <div className="editor-empty-state">
                <h3>Welcome to Pixospritz IDE</h3>
                <p>Load a project or drop a .zip file into the sidebar to begin.</p>
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
};

// Resizable and Collapsible Sidebar Component
function ResizableSidebar({ openFile, onZipLoaded, onValidatePackage, validationReport }) {
  const [width, setWidth] = useState(420);
  const [collapsed, setCollapsed] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const minWidth = 200;
  const maxWidth = 600;
  const collapsedWidth = 40;

  const sidebarClasses = [
    'editor-sidebar-panel',
    'editor-scrollbar',
    collapsed ? 'is-collapsed' : '',
  ]
    .filter(Boolean)
    .join(' ');

  const handleMouseDown = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  useEffect(() => {
    if (!isDragging) return;

    const handleMouseMove = (e) => {
      const newWidth = Math.min(Math.max(e.clientX, minWidth), maxWidth);
      setWidth(newWidth);
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging]);

  return (
    <aside
      className={sidebarClasses}
      style={{
        width: collapsed ? collapsedWidth : width,
        minWidth: collapsed ? collapsedWidth : minWidth,
        maxWidth: collapsed ? collapsedWidth : maxWidth,
        transition: collapsed ? 'width 0.3s ease' : 'none',
      }}
    >
      <button
        className="editor-sidebar-toggle"
        onClick={() => setCollapsed((prev) => !prev)}
        title={collapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
      >
        {collapsed ? '›' : '‹'}
      </button>

      <div className={collapsed ? 'editor-sidebar-body is-hidden' : 'editor-sidebar-body'}>
        <ZipManager
          openFile={openFile}
          onZipLoaded={onZipLoaded}
          onValidatePackage={onValidatePackage}
          validationReport={validationReport}
        />
      </div>

      {!collapsed && (
        <div
          className={`editor-sidebar-resizer ${isDragging ? 'is-dragging' : ''}`}
          onMouseDown={handleMouseDown}
        />
      )}
    </aside>
  );
}

export default App;