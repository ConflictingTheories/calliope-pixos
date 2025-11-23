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
import { Container, Header, Sidebar, Content } from 'rsuite';

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

/**
 * Primary React component that drives the editor UI.
 */
const App = () => {
  const [contents, setContents] = useState([]);
  // Keep track of the loaded zip filesystem and the selected entry
  const [zip, setZip] = useState(null);
  const [selectedEntry, setSelectedEntry] = useState(null);
  // Keep a list of image assets (name and data URI) for use in the tileset editor
  const [assets, setAssets] = useState([]);

  // Validation report state.  When set, contains an object with `errors` and `warnings`
  const [validationReport, setValidationReport] = useState(null);

  /**
   * Read a file entry from the zip filesystem and return its text
   * representation.  For binary assets this will still return a
   * string containing the raw bytes which can later be converted
   * into a data URI.
   */
  // Helper to get file data from zip.js FS entry
  const getData = useCallback(async (entry, asText = false) => {
    if (!entry || typeof entry.getData !== 'function') return null;
    if (asText) {
      let stream = new TransformStream();
      let data = new Response(stream.readable).text();
      await entry.data.getData(stream.writable);
      return await data;
    }
    // For binary data, use a different approach since text-based streams won't work directly
    let arrayBuffer = [];
    let stream = new TransformStream();
    let data = new Response(stream.readable).bytes();
    await entry.data.getData(stream.writable);
    return await data; // Convert the ArrayBuffer to a Uint8Array for binary data handling
  }, []);

  /**
   * Helper to convert a binary string into a base64 encoded data
   * URI.  The caller must provide the appropriate MIME type.
   */
  // Convert binary string to base64 data URI
  const toDataUri = useCallback((binaryString, mimeType) => {
    if (!binaryString) return '';
    const bytes = typeof binaryString !== 'string' ? binaryString : new Uint8Array([...binaryString].map((c) => c.charCodeAt(0)));
    let binary = '';
    bytes.forEach((b) => (binary += String.fromCharCode(b)));
    const base64String = btoa(binary);
    return `data:${mimeType};base64,${base64String}`;
  }, []);

  /**
   * Build a list of image assets from the loaded zip.  Each asset
   * includes its filename and a data URI for previewing in the
   * tileset editor.  Supported image types are png, jpg/jpeg, gif
   * and bmp.
   */
  // Build asset list (images) from zip
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
   * Validate the currently loaded package.  Scans JSON files in the zip
   * and checks for cross‑asset references (missing textures, invalid
   * geometry indices, undefined tile IDs, missing portraits, etc.).
   * Errors and warnings are collected into a report object and stored
   * in state.  If no zip is loaded the report is cleared.
   */
  // Validate package (spritz zip)
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
          if (zip && typeof zip.write === 'function') await zip.write(entry.name, newContent);
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
    
    // Get all entries from zip filesystem - try multiple approaches
    let allEntries = [];
    if (zip) {
      if (typeof zip.entries === 'function') {
        allEntries = Array.from(zip.entries());
        console.log('Got entries from zip.entries():', allEntries.length);
      } else if (zip.children) {
        // Try to get children recursively
        const getChildren = (node) => {
          let results = [];
          if (node.children) {
            node.children.forEach(child => {
              if (!child.directory) {
                results.push(child);
              }
              results = results.concat(getChildren(child));
            });
          }
          return results;
        };
        allEntries = getChildren(zip);
        console.log('Got entries from children:', allEntries.length);
      } else if (zip.root && zip.root.children) {
        const getChildren = (node) => {
          let results = [];
          if (node.children) {
            node.children.forEach(child => {
              if (!child.directory) {
                results.push(child);
              }
              results = results.concat(getChildren(child));
            });
          }
          return results;
        };
        allEntries = getChildren(zip.root);
        console.log('Got entries from root.children:', allEntries.length);
      }
    }
    console.log('Available files in zip:', allEntries.map(e => e.name));
    
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
    
    // Load cells.json from the same directory
    if (allEntries.length > 0) {
      try {
        // Extract the directory from the map file path
        const mapDir = entry.name.substring(0, entry.name.lastIndexOf('/') + 1);
        const cellsFileName = 'cells.json';
        
        console.log('Searching for cells.json in directory:', mapDir);
        
        // Find cells.json in the same directory as map.json
        const cellsFile = allEntries.find(e => 
          e.name === `${mapDir}${cellsFileName}` || 
          e.name.endsWith(`/${cellsFileName}`) && e.name.includes(mapDir.split('/').filter(Boolean)[0])
        );
        
        if (cellsFile) {
          console.log('Found cells.json at:', cellsFile.name);
          const cellsContent = await getData(cellsFile, true);
          cellsData = JSON.parse(cellsContent);
          console.log('Cells data loaded:', cellsData.length, 'x', cellsData[0]?.length);
        } else {
          console.warn('cells.json not found in directory:', mapDir);
          console.warn('Available files:', allEntries.map(e => e.name));
        }
      } catch (err) {
        console.error('Failed to load cells.json:', err);
      }
    }
    
    // Combine map and cells data
    const combinedContent = {
      ...mapData,
      cells: cellsData || mapData?.cells || []
    };
    
    // Load tileset and its dependencies
    let tileset = null;
    let geometry = null;
    let tiles = null;
    let textureAtlas = null;
    
    if (tilesetName && allEntries.length > 0) {
      try {
        console.log('Loading tileset:', tilesetName);
        console.log('All zip files:', allEntries.map(e => e.name));
        
        // Find tileset.json - search for file in tilesets directory
        const tilesetFile = allEntries.find(e => 
          e.name.includes(`tilesets/${tilesetName}`) && e.name.endsWith('tileset.json')
        );
        
        if (tilesetFile) {
          console.log('Found tileset at:', tilesetFile.name);
          const tilesetContent = await getData(tilesetFile, true);
          const tilesetData = JSON.parse(tilesetContent);
          console.log('Tileset data:', tilesetData);
          tileset = tilesetData;
          geometry = tilesetData.geometry || {};
          tiles = tilesetData.tiles || {};
          console.log('Tileset loaded - geometry:', Object.keys(geometry).length, 'tiles:', Object.keys(tiles).length);
          
          // Load texture atlas
          if (tilesetData.src) {
            console.log('Loading texture:', tilesetData.src);
            const textureName = tilesetData.src;
            
            // Search for texture file - check both tilesets and textures directories
            const textureFile = allEntries.find(e => 
              (e.name.includes(`tilesets/${tilesetName}`) || e.name.includes('textures/')) && 
              e.name.endsWith(textureName)
            );
            
            if (textureFile) {
              console.log('Found texture at:', textureFile.name);
              const textureBytes = await getData(textureFile, false);
              const ext = tilesetData.src.split('.').pop().toLowerCase();
              const mime = `image/${ext === 'jpg' ? 'jpeg' : ext}`;
              textureAtlas = toDataUri(textureBytes, mime);
              console.log('Texture atlas loaded, size:', textureBytes.length, 'bytes');
            } else {
              console.warn('Texture not found:', textureName);
              console.warn('Available image files:', allEntries.filter(e => 
                e.name.endsWith('.png') || e.name.endsWith('.jpg') || e.name.endsWith('.jpeg')
              ).map(e => e.name));
            }
          }
        } else {
          console.warn('Tileset not found for:', tilesetName);
          console.warn('Available tileset files:', allEntries.filter(e => 
            e.name.includes('tileset') && e.name.endsWith('.json')
          ).map(e => e.name));
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
        onSave={async (obj) => {
          if (zip && typeof zip.write === 'function') {
            try {
              // Save map.json (without cells)
              const { cells, ...mapOnlyData } = obj;
              const mapJsonData = JSON.stringify(mapOnlyData, null, 2);
              const cellsJsonData = JSON.stringify(cells, null, 2);
              
              // Write both files
              await zip.write(entry.name, mapJsonData);
              const cellsPath = entry.name.replace('map.json', 'cells.json');
              await zip.write(cellsPath, cellsJsonData);
              
              console.log('Map saved successfully');
            } catch (err) {
              console.error('Failed to save map:', err);
            }
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
          if (zip && typeof zip.write === 'function') {
            try {
              const data = JSON.stringify(obj, null, 2);
              await zip.write(entry.name, data);
            } catch (err) {
              console.warn('Failed to serialise tileset', err);
            }
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
          if (zip && typeof zip.write === 'function') {
            try {
              const data = JSON.stringify(obj, null, 2);
              await zip.write(entry.name, data);
            } catch (err) {
              console.warn('Failed to serialise geometry', err);
            }
          }
        }}
      />
    ]);
  }, [getData, zip]);

  const renderCutsceneTool = useCallback(async (entry) => {
    const cutsceneContent = await getData(entry, true);
    setContents([
      <CutsceneTool
        key={Date.now()}
        content={cutsceneContent}
        onSave={async (events) => {
          if (zip && typeof zip.write === 'function') {
            try {
              const data = JSON.stringify(events, null, 2);
              await zip.write(entry.name, data);
            } catch (err) {
              console.warn('Failed to serialise cutscene', err);
            }
          }
        }}
        assets={assets}
      />
    ]);
  }, [getData, zip, assets]);

  // Open file and route to correct editor/viewer
  const openFile = useCallback((entry) => {
    if (!entry) return;
    const name = entry.name.toLowerCase();
    setSelectedEntry(entry);
    if (name.endsWith('.pxs')) {
      renderScriptEditor(entry, 'pixoscript');
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
  }, [renderScriptEditor, renderMapEditor, renderGeometryEditor, renderTilesetEditor, renderCutsceneTool, renderImagePreview, renderAudioPreview, renderModelPreview]);

  return (
    <Container style={{ display: 'flex', flexDirection: 'row', flexGrow: 1 }}>
      <Sidebar style={{ display: 'flex', flexDirection: 'column', marginBottom: '30px' }} width={420} collapsible>
        <ZipManager
          openFile={openFile}
          onZipLoaded={setZip}
          onValidatePackage={validatePackage}
          validationReport={validationReport}
        />
      </Sidebar>
      <Container style={{ display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
        <Header className='page-header'></Header>
        <Content style={{ flexGrow: 1, marginTop: '20px', marginBottom: '88px' }}>
          {contents.map((component) => component)}
        </Content>
      </Container>
    </Container>
  );
};

export default App;