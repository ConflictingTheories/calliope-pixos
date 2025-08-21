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

import React, { useState, useEffect } from 'react';
import { Container, Header, Sidebar, Content } from 'rsuite';

// Existing modules
import ZipManager from './zip-manager/index.jsx';
import ScriptEditor from './script-editor/index.jsx';
import ImagePreview from './image-preview/index.jsx';

// New modules for extended support
import AudioPreview from './audio-preview/index.jsx';
import ModelPreview from './model-preview/index.jsx';
import MapEditor from './map-editor/index.jsx';
import TilesetEditor from './tileset-editor/index.jsx';
import CutsceneTool from './cutscene-tool/index.jsx';
import GeometryEditor from './geometry-editor/index.jsx';

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
  async function getData(entry) {
    // read file stream from zip entry
    console.log('getData', entry);
    // If this entry originated from JSZip then it will have a
    // `.file` property which exposes an async() API.  Use that
    // directly to obtain the binary string.
    if (entry && entry.file) {
      // JSZip returns text or binary depending on the argument; we use binarystring
      return await entry.file.async('binarystring');
    }
    // Otherwise fall back to the zip.js API.  This expects a
    // TransformStream writer and resolves once data is written.
    let stream = new TransformStream();
    let data = new Response(stream.readable).text();
    await entry.data.getData(stream.writable);
    return await data;
  }

  /**
   * Helper to convert a binary string into a base64 encoded data
   * URI.  The caller must provide the appropriate MIME type.
   */
  function toDataUri(binaryString, mimeType) {
    const bytes = new Uint8Array(binaryString.split('').map((c) => c.charCodeAt(0)));
    let binary = '';
    bytes.forEach((b) => (binary += String.fromCharCode(b)));
    const base64String = btoa(binary);
    return `data:${mimeType};base64,${base64String}`;
  }

  /**
   * Build a list of image assets from the loaded zip.  Each asset
   * includes its filename and a data URI for previewing in the
   * tileset editor.  Supported image types are png, jpg/jpeg, gif
   * and bmp.
   */
  async function buildAssetList(zipObj) {
    if (!zipObj) {
      setAssets([]);
      return;
    }
    const imageExts = ['png', 'jpg', 'jpeg', 'gif', 'bmp'];
    const list = [];
    // zip.js does not support async iteration directly; use forEach with a callback
    const promises = [];
    zipObj.forEach((relativePath, zipEntry) => {
      if (!zipEntry.dir) {
        const ext = zipEntry.name.split('.').pop().toLowerCase();
        if (imageExts.includes(ext)) {
          promises.push(
            zipEntry.async('binarystring').then((bin) => {
              const mime = `image/${ext === 'jpg' ? 'jpeg' : ext}`;
              const uri = toDataUri(bin, mime);
              list.push({ name: zipEntry.name, uri });
            }),
          );
        }
      }
    });
    await Promise.all(promises);
    setAssets(list);
  }

  // Whenever a new zip is loaded, rebuild the asset list
  useEffect(() => {
    if (zip) {
      buildAssetList(zip);
    } else {
      setAssets([]);
    }
  }, [zip]);

  /**
   * Validate the currently loaded package.  Scans JSON files in the zip
   * and checks for cross‑asset references (missing textures, invalid
   * geometry indices, undefined tile IDs, missing portraits, etc.).
   * Errors and warnings are collected into a report object and stored
   * in state.  If no zip is loaded the report is cleared.
   */
  async function validatePackage() {
    if (!zip) {
      setValidationReport(null);
      return;
    }
    const errors = [];
    const warnings = [];
    // Gather asset names for quick lookup
    const assetNames = assets.map((a) => a.name);
    const tilesets = [];
    const mapsList = [];
    const cutscenes = [];
    const geometries = [];
    // Build list of all JSON entries
    const entries = Object.values(zip.files).filter((e) => !e.dir && e.name.toLowerCase().endsWith('.json'));
    await Promise.all(
      entries.map(async (entry) => {
        try {
          const data = await entry.async('string');
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
          } else if (lower.includes('geometry')) {
            const geom = Array.isArray(obj) ? obj : [];
            geometries.push({ name, geometry: geom });
          }
        } catch (err) {
          errors.push(`File ${entry.name} contains invalid JSON`);
        }
      }),
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
        // geometry index check
        if (tile.geometry !== undefined && tile.geometry !== null) {
          const geomIndex = tile.geometry;
          const length = ts.geometry.length;
          if (geomIndex < 0 || geomIndex >= length) {
            errors.push(
              `Tileset ${ts.name}: tile ${idx} has invalid geometry index ${geomIndex}`,
            );
          }
        }
        // texture existence
        if (tile.texture) {
          if (!assetNames.includes(tile.texture)) {
            errors.push(
              `Tileset ${ts.name}: tile ${idx} references missing texture ${tile.texture}`,
            );
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
              errors.push(
                `Map ${m.name}: cell value ${cell} is not defined in any tileset`,
              );
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
            errors.push(
              `Cutscene ${cs.name}: event ${idx + 1} references missing portrait ${ev.portrait}`,
            );
          }
        }
      });
    });
    setValidationReport({ errors, warnings });
  }

  /** Render a script (text) editor for Lua, JSON, text files etc. */
  async function renderScriptEditor(entry, lang) {
    const script = await getData(entry);
    const options = {
      lang,
      type: 'script-only',
      content: script,
      onSave: async (newContent) => {
        // Persist the script back into the zip
        if (zip) {
          zip.file(entry.name, newContent);
        }
      },
    };
    setContents([<ScriptEditor key={Date.now()} {...options} />]);
  }

  /** Render an image preview for PNG, JPEG, GIF and BMP assets. */
  async function renderImagePreview(entry) {
    const imageBytes = await getData(entry);
    const extension = entry.name.split('.').pop().toLowerCase();
    const mime = `image/${extension === 'jpg' ? 'jpeg' : extension}`;
    const dataUri = toDataUri(imageBytes, mime);
    setContents([
      <ImagePreview key={Date.now()} content={dataUri} />,
    ]);
  }

  /** Render an audio preview for MP3, WAV and OGG assets. */
  async function renderAudioPreview(entry) {
    const audioBytes = await getData(entry);
    const extension = entry.name.split('.').pop().toLowerCase();
    const mime = `audio/${extension}`;
    const dataUri = toDataUri(audioBytes, mime);
    setContents([
      <AudioPreview key={Date.now()} content={dataUri} />,
    ]);
  }

  /** Render a 3D model preview for OBJ/GLTF/GLB/MTL assets. */
  async function renderModelPreview(entry) {
    const modelBytes = await getData(entry);
    const extension = entry.name.split('.').pop().toLowerCase();
    // Attempt to infer the mime type; default to application/octet-stream
    const mimeLookup = {
      obj: 'text/plain',
      mtl: 'text/plain',
      gltf: 'model/gltf+json',
      glb: 'model/gltf-binary',
    };
    const mime = mimeLookup[extension] || 'application/octet-stream';
    const dataUri = toDataUri(modelBytes, mime);
    setContents([
      <ModelPreview key={Date.now()} content={dataUri} />,
    ]);
  }

  /** Render the map editor for map definition files (.map.json). */
  async function renderMapEditor(entry) {
    const mapContent = await getData(entry);
    const onSave = async (obj) => {
      if (zip) {
        try {
          const data = JSON.stringify(obj, null, 2);
          zip.file(entry.name, data);
        } catch (err) {
          console.warn('Failed to serialise map', err);
        }
      }
    };
    setContents([
      <MapEditor key={Date.now()} content={mapContent} onSave={onSave} />,
    ]);
  }

  /** Render the tileset editor for tileset configuration files. */
  async function renderTilesetEditor(entry) {
    const tilesetContent = await getData(entry);
    const onSave = async (obj) => {
      if (zip) {
        try {
          const data = JSON.stringify(obj, null, 2);
          zip.file(entry.name, data);
        } catch (err) {
          console.warn('Failed to serialise tileset', err);
        }
      }
    };
    setContents([
      <TilesetEditor key={Date.now()} content={tilesetContent} onSave={onSave} assets={assets} />,
    ]);
  }

  /** Render the geometry editor for geometry definition files (.geometry.json). */
  async function renderGeometryEditor(entry) {
    const geoContent = await getData(entry);
    const onSave = async (obj) => {
      if (zip) {
        try {
          const data = JSON.stringify(obj, null, 2);
          zip.file(entry.name, data);
        } catch (err) {
          console.warn('Failed to serialise geometry', err);
        }
      }
    };
    setContents([
      <GeometryEditor key={Date.now()} content={geoContent} onSave={onSave} />,
    ]);
  }

  /** Render the cutscene tool for narrative scripting (.cutscene.json). */
  async function renderCutsceneTool(entry) {
    const cutsceneContent = await getData(entry);
    const onSave = async (events) => {
      if (zip) {
        try {
          const data = JSON.stringify(events, null, 2);
          zip.file(entry.name, data);
        } catch (err) {
          console.warn('Failed to serialise cutscene', err);
        }
      }
    };
    setContents([
      <CutsceneTool key={Date.now()} content={cutsceneContent} onSave={onSave} assets={assets} />,
    ]);
  }

  /** Determine which module to load based on the selected file from the zip package */
  function openFile(entry) {
    if (!entry) return;
    const name = entry.name.toLowerCase();
    console.log('openFile', name);
    setSelectedEntry(entry);
    // Script and text files
    if (name.endsWith('.lua')) {
      renderScriptEditor(entry, 'lua');
      return;
    }
    if (name.endsWith('.txt')) {
      renderScriptEditor(entry, 'plaintext');
      return;
    }
    if (name.endsWith('.json')) {
      // Distinguish between various JSON types based on filename patterns
      if (name.includes('map')) {
        renderMapEditor(entry);
        return;
      }
      if (name.includes('geometry')) {
        renderGeometryEditor(entry);
        return;
      }
      if (name.includes('tiles') || name.includes('tileset')) {
        renderTilesetEditor(entry);
        return;
      }
      if (name.includes('cutscene')) {
        renderCutsceneTool(entry);
        return;
      }
      // default JSON editor
      renderScriptEditor(entry, 'json');
      return;
    }
    // Images
    if (['.png', '.gif', '.jpg', '.jpeg', '.bmp'].some((ext) => name.endsWith(ext))) {
      renderImagePreview(entry);
      return;
    }
    // Audio
    if (['.mp3', '.wav', '.ogg'].some((ext) => name.endsWith(ext))) {
      renderAudioPreview(entry);
      return;
    }
    // 3D Models
    if (['.obj', '.mtl', '.gltf', '.glb'].some((ext) => name.endsWith(ext))) {
      renderModelPreview(entry);
      return;
    }
    // Unknown file types fallback
    console.warn('No registered viewer for', name);
  }

  return (
    <Container style={{ display: 'flex', flexDirection: 'row', flexGrow: 1 }}>
      {/* Sidebar containing the zip manager */}
      <Sidebar style={{ display: 'flex', flexDirection: 'column', marginBottom: '30px' }} width={420} collapsible>
        <ZipManager
          openFile={openFile}
          onZipLoaded={(zipObj) => setZip(zipObj)}
          onValidatePackage={validatePackage}
          validationReport={validationReport}
        />
      </Sidebar>
      {/* Main content area displays whichever viewer/editor is active */}
      <Container style={{ display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
        <Header className='page-header'></Header>
        <Content style={{ flexGrow: true, marginTop: '20px', marginBottom: '88px' }}>
          {contents.map((component) => component)}
        </Content>
      </Container>
    </Container>
  );
};

export default App;