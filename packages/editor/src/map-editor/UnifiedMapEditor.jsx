/*
 * ---------------------------------------------------------------
 *        Pixospritz – Editor – Enhanced Map Editor
 * ---------------------------------------------------------------
 * Copyright (c) 2022‑2025  Kyle Derby MacInnis
 *
 * Advanced 3D map editor with WebGL rendering, height map support,
 * and full integration with tileset/geometry system. Features:
 * - 3D WebGL visualization with camera controls
 * - Paint/Erase/Pick tools
 * - Height map support
 * - Multi-layer editing
 * - Grid toggle
 * - Undo/Redo functionality
 */

import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { Button, Input, InputNumber, SelectPicker } from '../ui';
import { useConfirm } from '../shared/hooks/useConfirm.jsx';
import { useToast } from '../shared/components/Toast.jsx';
import { MapToolbar } from './panels/MapToolbar.jsx';
import { MapModeTabs } from './panels/MapModeTabs.jsx';
import { MapCanvas } from './panels/MapCanvas.jsx';
import { ResizablePanel } from '../shell/ResizablePanel.jsx';
import '../shell/ResizablePanel.css';
import './UnifiedMapEditor.css';
import { collect } from 'react-recollect';
import { debug } from '../shared/debug-logger.js';

import WebGL3DCanvas from '../shared/WebGL3DCanvas.jsx';
import {
  createProgram,
  createTextureFromImage,
  defaultVertexShader,
  defaultFragmentShader,
  createMat4,
  identity,
  translate,
  multiply,
} from '../shared/webgl-utils.js';

/**
 * Enhanced MapEditor with 3D rendering
 */
function UnifiedMapEditor({
  content,
  onSave,
  tileset,
  geometry,
  tiles,
  textureAtlas,
  zip,
  entryName,
}) {
  const { confirm, ConfirmDialog } = useConfirm();
  const toast = useToast();
  // Map state
  const [map, setMap] = useState(null);
  const [cells, setCells] = useState([]);
  const [heights, setHeights] = useState([]);

  // Available sprite/object types from package
  const [availableSprites, setAvailableSprites] = useState([]);
  const [availableObjects, setAvailableObjects] = useState([]);

  // New: Sprites, Objects, Triggers state
  const [sprites, setSprites] = useState([]);
  const [objects, setObjects] = useState([]);
  const [triggers, setTriggers] = useState({ selectTrigger: '', scripts: [] });
  const [lights, setLights] = useState([]);
  const [lightsEnabled, setLightsEnabled] = useState(true); // Preview lighting toggle (default ON)
  const [animatedTiles, setAnimatedTiles] = useState([]);

  // UI state
  const [selectedTile, setSelectedTile] = useState('FLOOR');
  const [currentTool, setCurrentTool] = useState('paint'); // 'paint', 'erase', 'pick', 'sprite', 'object', 'animatedTile'
  const [currentHeight, setCurrentHeight] = useState(0);
  const [showGrid, setShowGrid] = useState(true);
  const [error, setError] = useState(null);
  const [editorMode, setEditorMode] = useState('tiles'); // 'tiles', 'sprites', 'objects', 'triggers', 'lights', 'animatedTiles', 'attributes'
  const [viewMode, setViewMode] = useState('3D'); // '2D' or '3D'
  const [attributes, setAttributes] = useState([]);
  const [selectedCell, setSelectedCell] = useState(null);

  // Painting state
  const [isPainting, setIsPainting] = useState(false);
  const [lastPaintedCell, setLastPaintedCell] = useState(null);

  // Sprite/Object editing state
  const [selectedSprite, setSelectedSprite] = useState(null);
  const [spriteTypeInput, setSpriteTypeInput] = useState('');
  const [spriteIdInput, setSpriteIdInput] = useState('');
  const [spriteFacing, setSpriteFacing] = useState('Down');
  const [selectedObject, setSelectedObject] = useState(null);
  const [selectedLight, setSelectedLight] = useState(null);

  // Dialog state
  const [showTileEditor, setShowTileEditor] = useState(false);
  const [showGeometryEditor, setShowGeometryEditor] = useState(false);
  const [editingTileName, setEditingTileName] = useState(null);
  const [editingGeometryName, setEditingGeometryName] = useState(null);
  const [showMapSettings, setShowMapSettings] = useState(false);
  const [newMapWidth, setNewMapWidth] = useState(17);
  const [newMapHeight, setNewMapHeight] = useState(19);

  // History
  const [history, setHistory] = useState([]);
  const [historyIndex, setHistoryIndex] = useState(-1);

  // WebGL state
  const glRef = useRef(null);

  // (P3-07) Stable camera seed for the memoized canvas.
  const cameraSeed = useMemo(
    () => ({
      distance: 25,
      angleX: -0.6,
      angleY: 0.5,
      centerX: (cells[0]?.length || 16) / 2,
      centerY: (cells.length || 16) / 2,
      centerZ: 0,
    }),
    // Re-seed only when the map dimensions change.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [cells.length, cells[0]?.length]
  );
  const shaderProgramRef = useRef(null);
  const textureRef = useRef(null);
  const [hoveredCell, setHoveredCell] = useState(null);

  // Discover available sprite and object types from the package
  useEffect(() => {
    if (!zip) return;

    const spriteTypes = new Set();
    const objectTypes = new Set();

    try {
      // Get all entries from zip
      let entries = [];
      if (typeof zip.entries === 'function') {
        entries = Array.from(zip.entries());
      } else if (zip.root) {
        // Build entry list from root
        const buildList = (node, path = '', list = []) => {
          if (node.children) {
            node.children.forEach(child => {
              const fullPath = path ? `${path}/${child.name}` : child.name;
              if (!child.directory) {
                list.push({ name: child.name, fullName: fullPath });
              }
              buildList(child, fullPath, list);
            });
          }
          return list;
        };
        entries = buildList(zip.root);
      }

      // Filter sprite and object JSON files
      entries.forEach(entry => {
        const fullPath = entry.fullName || entry.name;

        // Skip macOS metadata
        if (fullPath.includes('__MACOSX') || fullPath.includes('/.')) return;

        if (fullPath.startsWith('sprites/') && fullPath.endsWith('.json')) {
          // Extract type path (e.g., "sprites/characters/male.json" -> "characters/male")
          const typePath = fullPath.replace('sprites/', '').replace('.json', '');

          // Categorize as object or sprite based on path
          if (typePath.startsWith('objects/') || typePath.startsWith('furniture/')) {
            objectTypes.add(typePath);
          } else {
            spriteTypes.add(typePath);
          }
        }
      });

      setAvailableSprites(Array.from(spriteTypes).sort());
      setAvailableObjects(Array.from(objectTypes).sort());

      debug('MapEditor3D', ' Discovered sprite types:', spriteTypes.size);
      debug('MapEditor3D', ' Discovered object types:', objectTypes.size);
    } catch (err) {
      console.error('[MapEditor3D] Failed to discover sprite/object types:', err);
    }
  }, [zip]);

  // Parse incoming map data
  useEffect(() => {
    if (!content) return;

    try {
      let parsedMap, parsedCells;

      if (typeof content === 'string') {
        const data = JSON.parse(content);
        if (data.cells) {
          parsedCells = data.cells;
          parsedMap = data;
        } else if (Array.isArray(data)) {
          parsedCells = data;
          parsedMap = { bounds: [0, 0, data[0]?.length || 0, data.length || 0] };
        }
      } else if (content.cells) {
        parsedCells = content.cells;
        parsedMap = content;
      } else if (Array.isArray(content)) {
        parsedCells = content;
        parsedMap = { bounds: [0, 0, content[0]?.length || 0, content.length || 0] };
      }

      setMap(parsedMap);
      setCells(parsedCells || []);

      // Load sprites if present
      if (parsedMap?.sprites && Array.isArray(parsedMap.sprites)) {
        setSprites(parsedMap.sprites);
      } else {
        setSprites([]);
      }

      // Load objects if present
      if (parsedMap?.objects && Array.isArray(parsedMap.objects)) {
        setObjects(parsedMap.objects);
      } else {
        setObjects([]);
      }

      // Load triggers if present
      const loadedTriggers = {
        selectTrigger: parsedMap?.selectTrigger || '',
        scripts: parsedMap?.scripts || [],
      };
      if (parsedMap) {
        setTriggers(loadedTriggers);
      }

      // Load lights if present (normalized so the lights panel always has the
      // fields it edits; extras the engine understands are preserved)
      const loadedLights = (
        parsedMap?.lights && Array.isArray(parsedMap.lights) ? parsedMap.lights : []
      ).map((light, idx) => normalizeLight(light, idx));
      setLights(loadedLights);

      // Load animated tiles if present
      if (parsedMap?.animatedTiles && Array.isArray(parsedMap.animatedTiles)) {
        setAnimatedTiles(parsedMap.animatedTiles);
      } else {
        setAnimatedTiles([]);
      }

      // Set map dimensions for resize dialog
      if (parsedCells && parsedCells.length > 0) {
        setNewMapWidth(parsedCells[0]?.length || 17);
        setNewMapHeight(parsedCells.length || 19);
      }

      // Initialize or load heights
      let currentHeights;
      if (parsedMap?.heights) {
        currentHeights = parsedMap.heights;
        setHeights(parsedMap.heights);
      } else if (parsedCells && parsedCells.length > 0) {
        // Create empty height map
        currentHeights = parsedCells.map(row => row.map(() => 0));
        setHeights(currentHeights);
      } else {
        currentHeights = [];
        setHeights([]);
      }

      // Initialize or load attributes
      let currentAttributes;
      if (parsedMap?.attributes) {
        currentAttributes = parsedMap.attributes;
        setAttributes(parsedMap.attributes);
      } else if (parsedCells && parsedCells.length > 0) {
        // Create empty attributes map
        currentAttributes = parsedCells.map(row => row.map(() => ({})));
        setAttributes(currentAttributes);
      } else {
        currentAttributes = [];
        setAttributes([]);
      }

      // Initialize history (snapshot placements explicitly: the state vars in
      // this closure may still hold the previous map's values on first load)
      if (parsedCells) {
        pushHistory(parsedCells, currentHeights, currentAttributes, {
          sprites: parsedMap?.sprites ?? [],
          objects: parsedMap?.objects ?? [],
          animatedTiles: parsedMap?.animatedTiles ?? [],
          lights: loadedLights,
          triggers: loadedTriggers,
        });
      }
      setError(null);
    } catch (err) {
      console.error('Failed to parse map data:', err);
      setError('Invalid map JSON');
    }
  }, [content]);

  // Load texture atlas
  useEffect(() => {
    if (!textureAtlas) {
      debug('MapEditor3D', ' No texture atlas provided');
      return;
    }

    if (!glRef.current) {
      debug('MapEditor3D', ' GL context not ready, waiting...');
      return;
    }

    debug('MapEditor3D', ' Loading texture atlas:', textureAtlas.substring(0, 50) + '...');
    const img = new Image();
    img.onload = () => {
      debug('MapEditor3D', ' Texture image loaded:', img.width, 'x', img.height);
      if (glRef.current) {
        const texture = createTextureFromImage(glRef.current, img);
        textureRef.current = texture;
        debug('MapEditor3D', ' WebGL texture created:', texture);

        // Verify texture was created successfully
        if (!texture) {
          console.error('[MapEditor3D] Failed to create WebGL texture object!');
        } else {
          debug('MapEditor3D', ' Texture successfully bound to textureRef');
        }
      } else {
        console.error('[MapEditor3D] GL context lost after image load!');
      }
    };
    img.onerror = e => {
      console.error('[MapEditor3D] Failed to load texture image:', e);
    };
    img.src = textureAtlas;
  }, [textureAtlas]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = e => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'SELECT') return;

      switch (e.key.toLowerCase()) {
        case 'p':
          setCurrentTool('paint');
          break;
        case 'e':
          setCurrentTool('erase');
          break;
        case 'i':
          setCurrentTool('pick');
          break;
        case 'r':
          // Reset camera - would need to expose this from WebGL3DCanvas
          break;
        default:
          break;
      }
    };

    const handleMouseUp = () => {
      setIsPainting(false);
      setLastPaintedCell(null);
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, []);

  // Initialize WebGL program
  const handleWebGLInit = useCallback(
    gl => {
      debug('MapEditor3D', ' WebGL initialized');
      glRef.current = gl;

      // Create shader program
      const program = createProgram(gl, defaultVertexShader, defaultFragmentShader);
      if (program) {
        shaderProgramRef.current = program;
        debug('MapEditor3D', ' Shader program created');

        // If we already have a texture atlas, load it now
        if (textureAtlas && !textureRef.current) {
          debug('MapEditor3D', ' Texture atlas available, loading now...');
          const img = new Image();
          img.onload = () => {
            debug('MapEditor3D', ' Texture image loaded in init:', img.width, 'x', img.height);
            const texture = createTextureFromImage(gl, img);
            textureRef.current = texture;
            debug('MapEditor3D', ' WebGL texture created in init:', texture);
          };
          img.onerror = e => {
            console.error('[MapEditor3D] Failed to load texture in init:', e);
          };
          img.src = textureAtlas;
        }
      } else {
        console.error('[MapEditor3D] Failed to create shader program');
      }
    },
    [textureAtlas]
  );

  // Max map lights forwarded to the preview shader (matches uLights[16] in webgl-utils)
  const PREVIEW_MAX_LIGHTS = 16;

  // Render callback for WebGL3DCanvas
  const handleRender = useCallback(
    (gl, projectionMatrix, viewMatrix, camera, showGridFlag, cameraPos) => {
      if (!shaderProgramRef.current || !cells.length) return;

      const program = shaderProgramRef.current;
      gl.useProgram(program);

      // Get uniform locations
      const uModelViewMatrix = gl.getUniformLocation(program, 'uModelViewMatrix');
      const uProjectionMatrix = gl.getUniformLocation(program, 'uProjectionMatrix');
      const uModelMatrix = gl.getUniformLocation(program, 'uModelMatrix');
      const uUseTexture = gl.getUniformLocation(program, 'uUseTexture');
      const uColor = gl.getUniformLocation(program, 'uColor');
      const uShowGrid = gl.getUniformLocation(program, 'uShowGrid');
      const uTexture = gl.getUniformLocation(program, 'uTexture');
      const uIsHovered = gl.getUniformLocation(program, 'uIsHovered');
      const uUseLights = gl.getUniformLocation(program, 'uUseLights');
      const uCameraPos = gl.getUniformLocation(program, 'uCameraPos');
      // Per-light struct uniforms (engine convention: uLights[i].enabled/.position/.color/.density)
      const uLightStructs = [];
      for (let i = 0; i < PREVIEW_MAX_LIGHTS; i++) {
        uLightStructs.push({
          enabled: gl.getUniformLocation(program, `uLights[${i}].enabled`),
          position: gl.getUniformLocation(program, `uLights[${i}].position`),
          color: gl.getUniformLocation(program, `uLights[${i}].color`),
          density: gl.getUniformLocation(program, `uLights[${i}].density`),
        });
      }

      gl.uniformMatrix4fv(uProjectionMatrix, false, projectionMatrix);
      gl.uniform1i(uShowGrid, showGridFlag);
      gl.uniform1i(uUseLights, lightsEnabled ? 1 : 0);
      if (cameraPos) {
        gl.uniform3f(uCameraPos, cameraPos[0], cameraPos[1], cameraPos[2]);
      }

      // Forward map lights to the shader (colors normalized 0..1; respect per-light enabled)
      for (let i = 0; i < PREVIEW_MAX_LIGHTS; i++) {
        const light = lights[i];
        const loc = uLightStructs[i];
        if (light) {
          const pos = Array.isArray(light.pos) ? light.pos : [0, 0, 0];
          const color = Array.isArray(light.color) ? light.color : [255, 255, 255];
          gl.uniform1f(loc.enabled, light.enabled !== false ? 1 : 0);
          gl.uniform3f(loc.position, pos[0] ?? 0, pos[1] ?? 0, pos[2] ?? 0);
          gl.uniform3f(loc.color, (color[0] ?? 255) / 255, (color[1] ?? 255) / 255, (color[2] ?? 255) / 255);
          gl.uniform1f(loc.density, typeof light.density === 'number' ? light.density : 1);
        } else {
          // No light in this slot: must stay disabled (uniforms persist across frames)
          gl.uniform1f(loc.enabled, 0);
        }
      }

      // Debug: Log texture and uniform state once
      if (!window._renderDebugLogged) {
        debug('MapEditor3D', ' Render state:', {
          hasTexture: !!textureRef.current,
          textureObject: textureRef.current,
          uniformLocations: {
            uModelViewMatrix,
            uProjectionMatrix,
            uUseTexture,
            uColor,
            uShowGrid,
            uTexture,
            uIsHovered,
          },
          tilesetInfo: {
            hasTileset: !!tileset,
            hasTextures: !!tileset?.textures,
            textureCount: Object.keys(tileset?.textures || {}).length,
            tileSize: tileset?.tileSize,
            sheetSize: tileset?.sheetSize,
          },
        });
        window._renderDebugLogged = true;
      }

      // Render each cell
      for (let y = 0; y < cells.length; y++) {
        for (let x = 0; x < cells[y].length; x++) {
          const tileType = cells[y][x];
          if (!tileType || tileType === 'EMPTY') continue;

          const isHovered = hoveredCell && hoveredCell.x === x && hoveredCell.y === y;
          gl.uniform1i(uIsHovered, isHovered);

          const cellHeight = heights[y]?.[x] || 0;

          renderTile(
            gl,
            program,
            x,
            y,
            tileType,
            cellHeight,
            viewMatrix,
            uModelViewMatrix,
            uModelMatrix,
            uUseTexture,
            uColor,
            uTexture
          );
        }
      }

      // Render sprites as visual markers
      sprites.forEach((sprite, idx) => {
        renderMarker(
          gl,
          program,
          sprite.pos[0],
          sprite.pos[1],
          sprite.pos[2],
          viewMatrix,
          uModelViewMatrix,
          uModelMatrix,
          uUseTexture,
          uColor,
          [0.2, 0.8, 0.2] // Green for sprites
        );
      });

      // Render objects as visual markers
      objects.forEach((obj, idx) => {
        renderMarker(
          gl,
          program,
          obj.pos[0],
          obj.pos[1],
          obj.pos[2],
          viewMatrix,
          uModelViewMatrix,
          uModelMatrix,
          uUseTexture,
          uColor,
          [0.2, 0.2, 0.8] // Blue for objects
        );
      });

      // Render animated tiles as visual markers
      animatedTiles.forEach((tile, idx) => {
        renderMarker(
          gl,
          program,
          tile.pos[0],
          tile.pos[1],
          tile.pos[2],
          viewMatrix,
          uModelViewMatrix,
          uModelMatrix,
          uUseTexture,
          uColor,
          [0.8, 0.8, 0.2] // Yellow for animated tiles
        );
      });

      // Render lights as visual markers (warm when on, gray when disabled)
      lights.forEach(light => {
        const pos = Array.isArray(light.pos) ? light.pos : [0, 0, 0];
        renderMarker(
          gl,
          program,
          pos[0] ?? 0,
          pos[1] ?? 0,
          pos[2] ?? 0,
          viewMatrix,
          uModelViewMatrix,
          uModelMatrix,
          uUseTexture,
          uColor,
          light.enabled !== false ? [1.0, 0.9, 0.5] : [0.35, 0.35, 0.35]
        );
      });
    },
    [
      cells,
      heights,
      hoveredCell,
      tiles,
      geometry,
      tileset,
      textureRef.current,
      sprites,
      objects,
      animatedTiles,
      lights,
      lightsEnabled,
    ]
  );

  // Render a tile at given position
  function renderTile(
    gl,
    program,
    x,
    y,
    tileType,
    cellHeight,
    viewMatrix,
    uModelViewMatrix,
    uModelMatrix,
    uUseTexture,
    uColor,
    uTexture
  ) {
    if (!tiles || !tiles[tileType]) return;

    const tileData = tiles[tileType];

    // Model matrix for this tile - use cellHeight as base Z offset
    const modelMatrix = createMat4();
    identity(modelMatrix);
    translate(modelMatrix, modelMatrix, [x, y, 0]); // Don't apply cellHeight here

    // Combine with view matrix
    const modelViewMatrix = createMat4();
    multiply(modelViewMatrix, viewMatrix, modelMatrix);
    gl.uniformMatrix4fv(uModelViewMatrix, false, modelViewMatrix);
    gl.uniformMatrix4fv(uModelMatrix, false, modelMatrix);

    // Parse tile definition: [geometryName, textureName, heightOffset, ...]
    for (let i = 0; i < tileData.length; i += 3) {
      const geometryName = tileData[i];
      const textureName = tileData[i + 1];
      // Use tile's heightOffset PLUS cellHeight from height map
      const tileHeightOffset = tileData[i + 2] || 0;
      const heightOffset = cellHeight + tileHeightOffset;

      if (!geometry || !geometry[geometryName]) continue;

      const geom = geometry[geometryName];
      renderGeometry(gl, program, geom, textureName, heightOffset, uUseTexture, uColor, uTexture);
    }
  }

  // Render geometry
  function renderGeometry(
    gl,
    program,
    geom,
    textureName,
    heightOffset,
    uUseTexture,
    uColor,
    uTexture
  ) {
    if (!geom.vertices || !geom.vertices.length) return;

    const vertices = [];
    const texCoords = [];
    const normals = [];

    for (let i = 0; i < geom.vertices.length; i++) {
      const tri = geom.vertices[i];
      const texTri = geom.surfaces?.[i] || [
        [0, 0],
        [1, 0],
        [1, 1],
      ];

      // Calculate normal
      const v1 = [tri[1][0] - tri[0][0], tri[1][1] - tri[0][1], tri[1][2] - tri[0][2]];
      const v2 = [tri[2][0] - tri[0][0], tri[2][1] - tri[0][1], tri[2][2] - tri[0][2]];
      const normal = [
        v1[1] * v2[2] - v1[2] * v2[1],
        v1[2] * v2[0] - v1[0] * v2[2],
        v1[0] * v2[1] - v1[1] * v2[0],
      ];
      const len = Math.sqrt(normal[0] ** 2 + normal[1] ** 2 + normal[2] ** 2);
      if (len > 0) {
        normal[0] /= len;
        normal[1] /= len;
        normal[2] /= len;
      }

      for (let j = 0; j < 3; j++) {
        vertices.push(tri[j][0], tri[j][1], tri[j][2] + heightOffset);
        normals.push(normal[0], normal[1], normal[2]);

        // Texture coordinates
        if (textureName && tileset?.textures?.[textureName]) {
          const texPos = tileset.textures[textureName];
          const tileSize = tileset.tileSize || 16;
          const sheetSize = tileset.sheetSize || [512, 512];
          const u = (texPos[0] * tileSize + texTri[j][0] * tileSize) / sheetSize[0];
          const v = (texPos[1] * tileSize + texTri[j][1] * tileSize) / sheetSize[1];
          texCoords.push(u, v);
        } else {
          texCoords.push(texTri[j][0], texTri[j][1]);
        }
      }
    }

    // Create buffers
    const positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
    const aPosition = gl.getAttribLocation(program, 'aPosition');
    gl.enableVertexAttribArray(aPosition);
    gl.vertexAttribPointer(aPosition, 3, gl.FLOAT, false, 0, 0);

    const texCoordBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, texCoordBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(texCoords), gl.STATIC_DRAW);
    const aTexCoord = gl.getAttribLocation(program, 'aTexCoord');
    gl.enableVertexAttribArray(aTexCoord);
    gl.vertexAttribPointer(aTexCoord, 2, gl.FLOAT, false, 0, 0);

    const normalBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, normalBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(normals), gl.STATIC_DRAW);
    const aNormal = gl.getAttribLocation(program, 'aNormal');
    gl.enableVertexAttribArray(aNormal);
    gl.vertexAttribPointer(aNormal, 3, gl.FLOAT, false, 0, 0);

    // Set texture or color
    if (textureName && textureRef.current) {
      // Debug: log texture usage once per texture name
      if (!window._textureDebugNames) window._textureDebugNames = new Set();
      if (!window._textureDebugNames.has(textureName)) {
        debug('MapEditor3D', ' Using texture:', textureName, {
          textureObject: textureRef.current,
          tilesetHasTexture: !!tileset?.textures?.[textureName],
          texturePos: tileset?.textures?.[textureName],
          tileSize: tileset?.tileSize,
          sheetSize: tileset?.sheetSize,
          firstTexCoords: texCoords.slice(0, 6),
        });
        window._textureDebugNames.add(textureName);
      }
      gl.uniform1i(uUseTexture, 1);
      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, textureRef.current);
      gl.uniform1i(uTexture, 0);
    } else {
      if (textureName && !textureRef.current) {
        console.warn('[MapEditor3D] Texture requested but not loaded:', textureName);
      }
      gl.uniform1i(uUseTexture, 0);
      gl.uniform3f(uColor, 0.5, 0.5, 0.5);
    }

    gl.drawArrays(gl.TRIANGLES, 0, vertices.length / 3);

    // Cleanup
    gl.deleteBuffer(positionBuffer);
    gl.deleteBuffer(texCoordBuffer);
    gl.deleteBuffer(normalBuffer);
  }

  // Render a marker (cube) for sprites, objects, animated tiles, or lights
  function renderMarker(
    gl,
    program,
    x,
    y,
    z,
    viewMatrix,
    uModelViewMatrix,
    uModelMatrix,
    uUseTexture,
    uColor,
    color
  ) {
    const size = 0.3; // Marker size
    const height = 0.6; // Marker height

    // Model matrix for marker
    const modelMatrix = createMat4();
    identity(modelMatrix);
    translate(modelMatrix, modelMatrix, [x + 0.5, y + 0.5, z + height / 2]);

    // Combine with view matrix
    const modelViewMatrix = createMat4();
    multiply(modelViewMatrix, viewMatrix, modelMatrix);
    gl.uniformMatrix4fv(uModelViewMatrix, false, modelViewMatrix);
    gl.uniformMatrix4fv(uModelMatrix, false, modelMatrix);

    // Create a simple cube
    const vertices = [
      // Front face
      -size,
      -size,
      size,
      size,
      -size,
      size,
      size,
      size,
      size,
      -size,
      -size,
      size,
      size,
      size,
      size,
      -size,
      size,
      size,
      // Back face
      -size,
      -size,
      -size,
      -size,
      size,
      -size,
      size,
      size,
      -size,
      -size,
      -size,
      -size,
      size,
      size,
      -size,
      size,
      -size,
      -size,
      // Top face
      -size,
      size,
      -size,
      -size,
      size,
      size,
      size,
      size,
      size,
      -size,
      size,
      -size,
      size,
      size,
      size,
      size,
      size,
      -size,
      // Bottom face
      -size,
      -size,
      -size,
      size,
      -size,
      -size,
      size,
      -size,
      size,
      -size,
      -size,
      -size,
      size,
      -size,
      size,
      -size,
      -size,
      size,
      // Right face
      size,
      -size,
      -size,
      size,
      size,
      -size,
      size,
      size,
      size,
      size,
      -size,
      -size,
      size,
      size,
      size,
      size,
      -size,
      size,
      // Left face
      -size,
      -size,
      -size,
      -size,
      -size,
      size,
      -size,
      size,
      size,
      -size,
      -size,
      -size,
      -size,
      size,
      size,
      -size,
      size,
      -size,
    ];

    const normals = [];
    for (let i = 0; i < vertices.length / 3; i++) {
      normals.push(0, 0, 1); // Simple normals
    }

    const texCoords = [];
    for (let i = 0; i < vertices.length / 3; i++) {
      texCoords.push(0, 0); // Dummy tex coords
    }

    // Create buffers
    const positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
    const aPosition = gl.getAttribLocation(program, 'aPosition');
    gl.enableVertexAttribArray(aPosition);
    gl.vertexAttribPointer(aPosition, 3, gl.FLOAT, false, 0, 0);

    const texCoordBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, texCoordBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(texCoords), gl.STATIC_DRAW);
    const aTexCoord = gl.getAttribLocation(program, 'aTexCoord');
    gl.enableVertexAttribArray(aTexCoord);
    gl.vertexAttribPointer(aTexCoord, 2, gl.FLOAT, false, 0, 0);

    const normalBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, normalBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(normals), gl.STATIC_DRAW);
    const aNormal = gl.getAttribLocation(program, 'aNormal');
    gl.enableVertexAttribArray(aNormal);
    gl.vertexAttribPointer(aNormal, 3, gl.FLOAT, false, 0, 0);

    // Use solid color for marker
    gl.uniform1i(uUseTexture, 0);
    gl.uniform3f(uColor, color[0], color[1], color[2]);

    gl.drawArrays(gl.TRIANGLES, 0, vertices.length / 3);

    // Cleanup
    gl.deleteBuffer(positionBuffer);
    gl.deleteBuffer(texCoordBuffer);
    gl.deleteBuffer(normalBuffer);
  }

  // Handle cell hover for highlighting
  const handleCellHover = useCallback(
    (screenX, screenY, camera, event) => {
      if (!cells.length) return;

      const cellCoords = screenToCell(screenX, screenY, camera, glRef.current?.canvas);
      setHoveredCell(cellCoords);

      // Drag painting: only works in tile mode with shift key held and mouse down
      if (editorMode === 'tiles' && event?.shiftKey && isPainting && cellCoords) {
        const { x, y } = cellCoords;
        // Only paint if we moved to a different cell
        if (!lastPaintedCell || lastPaintedCell.x !== x || lastPaintedCell.y !== y) {
          if (event.buttons === 1 && currentTool === 'paint') {
            // Left button - paint with line interpolation for smooth strokes
            if (lastPaintedCell) {
              paintLine(lastPaintedCell.x, lastPaintedCell.y, x, y);
            } else {
              paintCell(x, y);
            }
            setLastPaintedCell({ x, y });
          } else if (event.buttons === 2 || (event.buttons === 1 && currentTool === 'erase')) {
            // Right button or left button with erase tool - erase
            eraseCell(x, y);
            setLastPaintedCell({ x, y });
          }
        }
      }
    },
    [cells, isPainting, lastPaintedCell, selectedTile, currentHeight, editorMode, currentTool]
  );

  // Handle cell click for editing
  const handleCellClick = useCallback(
    (screenX, screenY, camera, event) => {
      if (!cells.length) return;

      debug('MapEditor3D', ' Cell click:', {
        shiftKey: event.shiftKey,
        button: event.button,
        type: event.type,
        currentTool,
        editorMode,
      });

      const cellCoords = screenToCell(screenX, screenY, camera, glRef.current.canvas);
      if (!cellCoords) {
        debug('MapEditor3D', ' No cell coords found');
        return;
      }

      const { x, y } = cellCoords;
      debug(
        'MapEditor3D',
        ' Cell coords:',
        x,
        y,
        'tile:',
        cells[y]?.[x],
        'editorMode:',
        editorMode
      );

      // Handle different editor modes - each mode is completely separate
      if (editorMode === 'sprites') {
        if (event.type === 'click' && event.button === 0) {
          debug('MapEditor3D', ' Placing sprite at:', x, y);
          addSprite(x, y);
        }
        return; // Don't process any other actions in sprite mode
      }

      if (editorMode === 'objects') {
        if (event.type === 'click' && event.button === 0) {
          debug('MapEditor3D', ' Placing object at:', x, y);
          addObject(x, y);
        }
        return; // Don't process any other actions in object mode
      }

      if (editorMode === 'animatedTiles') {
        if (event.type === 'click' && event.button === 0) {
          debug('MapEditor3D', ' Placing animated tile at:', x, y);
          addAnimatedTile(x, y);
        }
        return; // Don't process any other actions in animated tile mode
      }

      // Attributes mode - select the clicked cell so its attributes can be
      // edited in the Cell Attributes panel
      if (editorMode === 'attributes') {
        if (event.type === 'click' && event.button === 0) {
          debug('MapEditor3D', ' Selecting cell for attributes:', x, y);
          setSelectedCell({ x, y });
        }
        return; // Don't process any other actions in attributes mode
      }

      // Lights mode - place a new light at the clicked cell
      if (editorMode === 'lights') {
        if (event.type === 'click' && event.button === 0) {
          debug('MapEditor3D', ' Placing light at:', x, y);
          addLight(x, y);
        }
        return; // Don't process any other actions in lights mode
      }

      // Tile mode - handle paint/erase/pick tools
      if (editorMode === 'tiles') {
        if (currentTool === 'paint') {
          // Left-Click or Shift+Left-Click: Paint
          if ((event.type === 'click' || event.type === 'mousedown') && event.button === 0) {
            debug('MapEditor3D', ' Painting cell:', x, y, 'with', selectedTile);
            paintCell(x, y);
            setIsPainting(true);
            setLastPaintedCell({ x, y });
          }
        } else if (currentTool === 'erase') {
          // Left-Click or Right-Click: Erase
          if ((event.type === 'click' && event.button === 0) || event.type === 'contextmenu') {
            debug('MapEditor3D', ' Erasing cell:', x, y);
            eraseCell(x, y);
            setIsPainting(true);
            setLastPaintedCell({ x, y });
          }
        } else if (currentTool === 'pick') {
          // Click: Pick tile
          if (event.type === 'click') {
            debug('MapEditor3D', ' Picking cell:', x, y);
            pickCell(x, y);
          }
        }
      }
    },
    [
      cells,
      currentTool,
      selectedTile,
      currentHeight,
      editorMode,
      spriteTypeInput,
      spriteIdInput,
      spriteFacing,
    ]
  );

  // Convert screen coordinates to cell coordinates
  function screenToCell(screenX, screenY, camera, canvas) {
    if (!cells || cells.length === 0) return null;

    // Convert screen to NDC
    const normX = (screenX / canvas.width) * 2 - 1;
    const normY = -((screenY / canvas.height) * 2 - 1);

    // Calculate camera position
    const camX =
      camera.centerX + camera.distance * Math.cos(camera.angleX) * Math.cos(camera.angleY);
    const camY =
      camera.centerY + camera.distance * Math.cos(camera.angleX) * Math.sin(camera.angleY);
    const camZ = camera.centerZ + camera.distance * Math.sin(camera.angleX);

    // View direction
    const viewDirX = camera.centerX - camX;
    const viewDirY = camera.centerY - camY;
    const viewDirZ = camera.centerZ - camZ;
    const viewLen = Math.sqrt(viewDirX ** 2 + viewDirY ** 2 + viewDirZ ** 2);
    const viewNormX = viewDirX / viewLen;
    const viewNormY = viewDirY / viewLen;
    const viewNormZ = viewDirZ / viewLen;

    // Right vector
    const upX = 0,
      upY = 0,
      upZ = 1;
    let rightX = viewNormY * upZ - viewNormZ * upY;
    let rightY = viewNormZ * upX - viewNormX * upZ;
    let rightZ = viewNormX * upY - viewNormY * upX;
    const rightLen = Math.sqrt(rightX ** 2 + rightY ** 2 + rightZ ** 2);
    rightX /= rightLen;
    rightY /= rightLen;
    rightZ /= rightLen;

    // Actual up vector
    let actualUpX = rightY * viewNormZ - rightZ * viewNormY;
    let actualUpY = rightZ * viewNormX - rightX * viewNormZ;
    let actualUpZ = rightX * viewNormY - rightY * viewNormX;

    // Ray direction
    const aspect = canvas.width / canvas.height;
    const fov = Math.PI / 4;
    const tanFov = Math.tan(fov / 2);

    const rayDirX = viewNormX + rightX * normX * tanFov * aspect + actualUpX * normY * tanFov;
    const rayDirY = viewNormY + rightY * normX * tanFov * aspect + actualUpY * normY * tanFov;
    const rayDirZ = viewNormZ + rightZ * normX * tanFov * aspect + actualUpZ * normY * tanFov;

    const rayLen = Math.sqrt(rayDirX ** 2 + rayDirY ** 2 + rayDirZ ** 2);
    const rayNormX = rayDirX / rayLen;
    const rayNormY = rayDirY / rayLen;
    const rayNormZ = rayDirZ / rayLen;

    // Intersect with z=0 plane
    if (Math.abs(rayNormZ) < 0.0001) return null;

    const t = -camZ / rayNormZ;
    if (t < 0) return null;

    const hitX = camX + t * rayNormX;
    const hitY = camY + t * rayNormY;

    const cellX = Math.floor(hitX);
    const cellY = Math.floor(hitY);

    if (cellX >= 0 && cellX < cells[0].length && cellY >= 0 && cellY < cells.length) {
      return { x: cellX, y: cellY };
    }

    return null;
  }

  // Paint cell
  function paintCell(x, y) {
    const newCells = cells.map((row, rowIdx) =>
      row.map((cell, colIdx) => (rowIdx === y && colIdx === x ? selectedTile : cell))
    );
    const newHeights = heights.map((row, rowIdx) =>
      row.map((h, colIdx) => (rowIdx === y && colIdx === x ? currentHeight : h))
    );
    const newAttributes = attributes.map((row, rowIdx) =>
      row.map((attr, colIdx) => (rowIdx === y && colIdx === x ? {} : attr))
    );
    setCells(newCells);
    setHeights(newHeights);
    setAttributes(newAttributes);
    pushHistory(newCells, newHeights, newAttributes);
  }

  // Bresenham line interpolation for smooth drag painting
  function paintLine(x0, y0, x1, y1) {
    const cellsToPaint = [];
    let dx = Math.abs(x1 - x0);
    let dy = Math.abs(y1 - y0);
    const sx = x0 < x1 ? 1 : -1;
    const sy = y0 < y1 ? 1 : -1;
    let err = dx - dy;
    let x = x0, y = y0;
    while (true) {
      cellsToPaint.push([x, y]);
      if (x === x1 && y === y1) break;
      const e2 = 2 * err;
      if (e2 > -dy) { err -= dy; x += sx; }
      if (e2 < dx) { err += dx; y += sy; }
    }
    // Batch paint all cells in the line
    const newCells = cells.map(row => [...row]);
    const newHeights = heights.map(row => [...row]);
    const newAttributes = attributes.map(row => row.map(a => ({ ...a })));
    cellsToPaint.forEach(([cx, cy]) => {
      if (cy >= 0 && cy < newCells.length && cx >= 0 && cx < newCells[0].length) {
        newCells[cy][cx] = selectedTile;
        newHeights[cy][cx] = currentHeight;
        newAttributes[cy][cx] = {};
      }
    });
    setCells(newCells);
    setHeights(newHeights);
    setAttributes(newAttributes);
    pushHistory(newCells, newHeights, newAttributes);
  }

  // Erase cell
  function eraseCell(x, y) {
    const newCells = cells.map((row, rowIdx) =>
      row.map((cell, colIdx) => (rowIdx === y && colIdx === x ? 'EMPTY' : cell))
    );
    const newHeights = heights.map((row, rowIdx) =>
      row.map((h, colIdx) => (rowIdx === y && colIdx === x ? 0 : h))
    );
    const newAttributes = attributes.map((row, rowIdx) =>
      row.map((attr, colIdx) => (rowIdx === y && colIdx === x ? {} : attr))
    );
    setCells(newCells);
    setHeights(newHeights);
    setAttributes(newAttributes);
    pushHistory(newCells, newHeights, newAttributes);
  }

  // Pick cell
  function pickCell(x, y) {
    const pickedTile = cells[y]?.[x];
    if (pickedTile && pickedTile !== 'EMPTY') {
      setSelectedTile(pickedTile);
      setCurrentHeight(heights[y]?.[x] || 0);
      setSelectedCell({ x, y });
    }
  }

  // Resize map
  function resizeMap(width, height) {
    const newCells = [];
    const newHeights = [];
    const newAttributes = [];

    for (let y = 0; y < height; y++) {
      const row = [];
      const heightRow = [];
      const attrRow = [];
      for (let x = 0; x < width; x++) {
        // Copy existing data if within bounds, otherwise use EMPTY
        if (y < cells.length && x < (cells[0]?.length || 0)) {
          row.push(cells[y][x]);
          heightRow.push(heights[y]?.[x] || 0);
          attrRow.push(attributes[y]?.[x] || {});
        } else {
          row.push('EMPTY');
          heightRow.push(0);
          attrRow.push({});
        }
      }
      newCells.push(row);
      newHeights.push(heightRow);
      newAttributes.push(attrRow);
    }

    setCells(newCells);
    setHeights(newHeights);
    setAttributes(newAttributes);
    pushHistory(newCells, newHeights, newAttributes);

    // Update map bounds
    if (map) {
      setMap({ ...map, bounds: [0, 0, width, height] });
    }
  }

  // Clear map
  function clearMap() {
    const newCells = cells.map(row => row.map(() => 'EMPTY'));
    const newHeights = heights.map(row => row.map(() => 0));
    const newAttributes = attributes.map(row => row.map(() => ({})));
    setCells(newCells);
    setHeights(newHeights);
    setAttributes(newAttributes);
    setCurrentHeight(0);
    pushHistory(newCells, newHeights, newAttributes);
  }

  // History management
  // Optional `extras` snapshots placement state (sprites, objects, animated
  // tiles, triggers, lights). When omitted, the current state is used, so
  // tile-only call sites keep working unchanged.
  function pushHistory(newCells, newHeights, newAttributes, extras = {}) {
    const snapshot = {
      cells: JSON.parse(JSON.stringify(newCells)),
      heights: JSON.parse(JSON.stringify(newHeights)),
      attributes: JSON.parse(JSON.stringify(newAttributes)),
      sprites: JSON.parse(JSON.stringify(extras.sprites ?? sprites)),
      objects: JSON.parse(JSON.stringify(extras.objects ?? objects)),
      animatedTiles: JSON.parse(JSON.stringify(extras.animatedTiles ?? animatedTiles)),
      triggers: JSON.parse(JSON.stringify(extras.triggers ?? triggers)),
      lights: JSON.parse(JSON.stringify(extras.lights ?? lights)),
    };
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(snapshot);
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  }

  // Snapshots taken before placements were tracked may lack those fields;
  // keep the current placement state for anything a snapshot does not carry.
  function restoreSnapshot(state) {
    setCells(state.cells);
    setHeights(state.heights);
    setAttributes(state.attributes);
    if (state.sprites) setSprites(state.sprites);
    if (state.objects) setObjects(state.objects);
    if (state.animatedTiles) setAnimatedTiles(state.animatedTiles);
    if (state.triggers) setTriggers(state.triggers);
    if (state.lights) setLights(state.lights);
  }

  function undo() {
    if (historyIndex > 0) {
      restoreSnapshot(history[historyIndex - 1]);
      setHistoryIndex(historyIndex - 1);
    }
  }

  function redo() {
    if (historyIndex < history.length - 1) {
      restoreSnapshot(history[historyIndex + 1]);
      setHistoryIndex(historyIndex + 1);
    }
  }

  // Save
  function handleSave() {
    const mapData = {
      ...map,
      cells,
      heights,
      attributes,
      sprites,
      objects,
      lights,
      animatedTiles,
      selectTrigger: triggers.selectTrigger || undefined,
      scripts: triggers.scripts.length > 0 ? triggers.scripts : undefined,
    };

    // Clean up undefined values
    Object.keys(mapData).forEach(key => {
      if (mapData[key] === undefined) {
        delete mapData[key];
      }
    });

    if (onSave) {
      onSave(mapData);
    }
  }

  // Add sprite to map
  function addSprite(x, y) {
    if (!spriteTypeInput || !spriteIdInput) {
      toast.warning('Please enter both Sprite ID and Type', { title: 'Missing fields' });
      return;
    }

    const newSprite = {
      id: spriteIdInput,
      type: spriteTypeInput,
      pos: [x, y, currentHeight],
      facing: spriteFacing,
    };

    const newSprites = [...sprites, newSprite];
    setSprites(newSprites);
    pushHistory(cells, heights, attributes, { sprites: newSprites });
    toast.success(`Sprite "${spriteIdInput}" added at [${x}, ${y}, ${currentHeight}]`);
  }

  // Remove sprite
  function removeSprite(index) {
    const newSprites = sprites.filter((_, i) => i !== index);
    setSprites(newSprites);
    setSelectedSprite(null);
    pushHistory(cells, heights, attributes, { sprites: newSprites });
  }

  // Update sprite
  function updateSprite(index, updates) {
    const newSprites = [...sprites];
    newSprites[index] = { ...newSprites[index], ...updates };
    setSprites(newSprites);
    pushHistory(cells, heights, attributes, { sprites: newSprites });
  }

  // Add object to map
  function addObject(x, y) {
    if (!spriteTypeInput || !spriteIdInput) {
      toast.warning('Please enter both Object ID and Type', { title: 'Missing fields' });
      return;
    }

    const newObject = {
      id: spriteIdInput,
      type: spriteTypeInput,
      pos: [x, y, currentHeight],
      facing: spriteFacing,
    };

    const newObjects = [...objects, newObject];
    setObjects(newObjects);
    pushHistory(cells, heights, attributes, { objects: newObjects });
    toast.success(`Object "${spriteIdInput}" added at [${x}, ${y}, ${currentHeight}]`);
  }

  // Remove object
  function removeObject(index) {
    const newObjects = objects.filter((_, i) => i !== index);
    setObjects(newObjects);
    setSelectedObject(null);
    pushHistory(cells, heights, attributes, { objects: newObjects });
  }

  // Update object
  function updateObject(index, updates) {
    const newObjects = [...objects];
    newObjects[index] = { ...newObjects[index], ...updates };
    setObjects(newObjects);
    pushHistory(cells, heights, attributes, { objects: newObjects });
  }

  // Add animated tile
  function addAnimatedTile(x, y) {
    if (!spriteTypeInput) {
      toast.warning('Please enter the Sprite Type for the animated tile', {
        title: 'Missing fields',
      });
      return;
    }

    const newAnimatedTile = {
      type: spriteTypeInput,
      pos: [x, y, currentHeight],
    };

    const newTiles = [...animatedTiles, newAnimatedTile];
    setAnimatedTiles(newTiles);
    pushHistory(cells, heights, attributes, { animatedTiles: newTiles });
    toast.success(`Animated tile added at [${x}, ${y}, ${currentHeight}]`);
  }

  // Remove animated tile
  function removeAnimatedTile(index) {
    const newTiles = animatedTiles.filter((_, i) => i !== index);
    setAnimatedTiles(newTiles);
    pushHistory(cells, heights, attributes, { animatedTiles: newTiles });
  }

  // Normalize a light loaded from map JSON so the lights panel always has the
  // fields it edits. Matches the engine light model (see zone.js): id, pos,
  // color [r,g,b], density (intensity), enabled. Unknown extra fields are
  // preserved.
  function normalizeLight(light, idx) {
    const source = light && typeof light === 'object' ? light : {};
    const pos = Array.isArray(source.pos) ? source.pos : [];
    const color = Array.isArray(source.color) ? source.color : [];
    return {
      enabled: true,
      ...source,
      id: source.id || `light-${idx + 1}`,
      pos: [pos[0] ?? 0, pos[1] ?? 0, pos[2] ?? 0],
      color: [color[0] ?? 255, color[1] ?? 255, color[2] ?? 255],
      density: typeof source.density === 'number' ? source.density : 1,
    };
  }

  // [r,g,b] (0-255) <-> #rrggbb for the native color picker
  function rgbToHex(rgb) {
    const clamp = v => Math.max(0, Math.min(255, Math.round(v ?? 0)));
    const [r = 255, g = 255, b = 255] = Array.isArray(rgb) ? rgb : [];
    return (
      '#' +
      [clamp(r), clamp(g), clamp(b)].map(v => v.toString(16).padStart(2, '0')).join('')
    );
  }

  function hexToRgb(hex) {
    const m = /^#?([0-9a-f]{6})$/i.exec(hex || '');
    if (!m) return [255, 255, 255];
    const n = parseInt(m[1], 16);
    return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
  }

  // Add light to map at the given cell
  function addLight(x, y) {
    const newLight = normalizeLight(
      {
        id: `light-${lights.length + 1}`,
        pos: [x, y, currentHeight],
        color: [255, 255, 255],
        density: 1,
        enabled: true,
      },
      lights.length
    );
    const newLights = [...lights, newLight];
    setLights(newLights);
    setSelectedLight(newLights.length - 1);
    pushHistory(cells, heights, attributes, { lights: newLights });
    toast.success(`Light "${newLight.id}" added at [${x}, ${y}, ${currentHeight}]`);
  }

  // Remove light
  function removeLight(index) {
    const newLights = lights.filter((_, i) => i !== index);
    setLights(newLights);
    setSelectedLight(null);
    pushHistory(cells, heights, attributes, { lights: newLights });
  }

  // Update light
  function updateLight(index, updates) {
    const newLights = [...lights];
    newLights[index] = { ...newLights[index], ...updates };
    setLights(newLights);
    pushHistory(cells, heights, attributes, { lights: newLights });
  }

  // Inline edit form for a placed sprite or object. `updateFn` is updateSprite
  // or updateObject; edits go through it so undo history stays in sync.
  function renderPlacementEditor(item, idx, updateFn) {
    const pos = Array.isArray(item.pos) ? item.pos : [0, 0, 0];
    const setPosAxis = (axis, value) => {
      const nextPos = [...pos];
      nextPos[axis] = value;
      updateFn(idx, { pos: nextPos });
    };
    const fieldStyle = {
      width: '100%',
      background: '#3c3c3c',
      color: '#d4d4d4',
      border: '1px solid #3e3e42',
      padding: '4px 6px',
      borderRadius: '2px',
      fontSize: '11px',
      marginTop: '2px',
    };
    return (
      <div
        style={{
          marginTop: '8px',
          paddingTop: '8px',
          borderTop: '1px solid #3e3e42',
        }}
      >
        <div className="map-editor__field">
          <label className="map-editor__label">ID:</label>
          <Input
            value={item.id || ''}
            onChange={e => updateFn(idx, { id: e.target.value })}
            style={fieldStyle}
          />
        </div>
        <div className="map-editor__field">
          <label className="map-editor__label">Type:</label>
          <Input
            value={item.type || ''}
            onChange={e => updateFn(idx, { type: e.target.value })}
            style={fieldStyle}
          />
        </div>
        <div className="map-editor__field">
          <label className="map-editor__label">Facing:</label>
          <SelectPicker
            data={[
              { value: 'Down', label: 'Down' },
              { value: 'Up', label: 'Up' },
              { value: 'Left', label: 'Left' },
              { value: 'Right', label: 'Right' },
            ]}
            value={item.facing || 'Down'}
            onChange={v => updateFn(idx, { facing: v })}
            cleanable={false}
            block
          />
        </div>
        <div className="map-editor__field">
          <label className="map-editor__label">Position (X / Y / Z):</label>
          <div style={{ display: 'flex', gap: '6px' }}>
            {[0, 1, 2].map(axis => (
              <InputNumber
                key={axis}
                value={pos[axis] ?? 0}
                onChange={v => setPosAxis(axis, v)}
                style={{ width: '100%' }}
              />
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Get available tiles
  const tileOptions = tiles
    ? Object.keys(tiles)
        .sort()
        .map(key => ({ label: key, value: key }))
    : [];

  // Show loading/error states
  if (!cells.length) {
    return (
      <div className="map-editor__empty">
        <div className="map-editor__empty-card">
          ℹ️ No map data loaded. Please load a map from the package.
        </div>
      </div>
    );
  }

  if (!tiles || Object.keys(tiles).length === 0) {
    return (
      <div className="map-editor__empty">
        <div className="map-editor__empty-card">
          ⚠️ Map loaded but tileset data is missing. Please ensure the tileset file exists and is
          properly referenced in the map.
        </div>
        <div style={{ fontSize: '13px' }}>
          <p style={{ margin: '5px 0' }}>
            Map file loaded successfully, but cannot render 3D view without tileset data.
          </p>
          <p style={{ margin: '5px 0' }}>
            Expected tileset: <strong>{map?.tileset || 'unknown'}</strong>
          </p>
          <p style={{ margin: '5px 0' }}>
            Cells dimensions: {cells.length} x {cells[0]?.length || 0}
          </p>
        </div>
      </div>
    );
  }

  if (!geometry) {
    geometry = {};
  }

  return (
    <div className="map-editor">
      <ConfirmDialog />
      {/* Sidebar (resizable) */}
      <ResizablePanel
        id="map-editor-sidebar"
        initialWidth={320}
        minWidth={240}
        maxWidth={560}
        handleSide="right"
      >
      <div className="map-editor__sidebar">
        {/* Tools Section (P3-07: extracted panel) */}
        <MapToolbar
          editorMode={editorMode}
          currentTool={currentTool}
          onSelectTool={setCurrentTool}
          selectedTile={selectedTile}
          onSelectTile={setSelectedTile}
          tileOptions={tileOptions}
          currentHeight={currentHeight}
          onHeightChange={setCurrentHeight}
          onUndo={undo}
          onRedo={redo}
          canUndo={historyIndex > 0}
          canRedo={historyIndex < history.length - 1}
          historyIndex={historyIndex}
          historyLength={history.length}
          viewMode={viewMode}
          onViewModeChange={setViewMode}
          onSave={handleSave}
        />
        {/* Mode Selector (P3-07: extracted panel) */}
        <MapModeTabs
          editorMode={editorMode}
          onSelectMode={setEditorMode}
          cells={cells}
          sprites={sprites}
          objects={objects}
          animatedTiles={animatedTiles}
          lights={lights}
        />
        {/* Sprites/Objects Editor */}
        {(editorMode === 'sprites' || editorMode === 'objects') && (
          <div className="map-editor__panel">
            <div className="map-editor__panel-header">
              {editorMode === 'sprites' ? '🎭 Sprite Placement' : '📦 Object Placement'}
            </div>
            <div className="map-editor__panel-body">
              <div className="map-editor__info-banner">
                <strong>
                  ➤ Click on map to place {editorMode === 'sprites' ? 'sprite' : 'object'}
                </strong>
                <br />
                <span className="map-editor__info-banner-hint">
                  • Select type and facing below, then click on any tile
                </span>
              </div>

              <div className="map-editor__field">
                <label className="map-editor__label">
                  ID:
                </label>
                <Input
                  value={spriteIdInput}
                  onChange={e => setSpriteIdInput(e.target.value)}
                  placeholder="e.g., avatar, chest1"

                />
              </div>

              <div className="map-editor__field">
                <label className="map-editor__label">
                  Type:
                </label>
                {availableSprites.length > 0 ||
                (editorMode === 'objects' && availableObjects.length > 0) ? (
                  <SelectPicker
                    data={[
                      { value: '', label: '-- Select Type --' },
                      ...(editorMode === 'sprites' ? availableSprites : availableObjects).map(
                        type => ({ value: type, label: type })
                      ),
                    ]}
                    value={spriteTypeInput}
                    onChange={v => setSpriteTypeInput(v)}
                    cleanable={false}
                    block
                  />
                ) : (
                  <>
                    <Input
                      value={spriteTypeInput}
                      onChange={e => setSpriteTypeInput(e.target.value)}
                      placeholder="e.g., characters/male, furniture/chest"
                      style={{
                        width: '100%',
                        background: '#3c3c3c',
                        color: '#d4d4d4',
                        border: '1px solid #3e3e42',
                        padding: '6px 8px',
                        borderRadius: '3px',
                        fontSize: '12px',
                      }}
                    />
                    <div className="map-editor__hint">
                      No {editorMode === 'sprites' ? 'sprites' : 'objects'} found in package. Enter
                      manually.
                    </div>
                  </>
                )}
              </div>

              <div className="map-editor__field">
                <label className="map-editor__label">
                  Facing:
                </label>
                <SelectPicker
                  data={[
                    { value: 'Down', label: 'Down' },
                    { value: 'Up', label: 'Up' },
                    { value: 'Left', label: 'Left' },
                    { value: 'Right', label: 'Right' },
                  ]}
                  value={spriteFacing}
                  onChange={v => setSpriteFacing(v)}
                  cleanable={false}
                  block
                />
              </div>

              <div
                className="map-editor__divider"
              >
                <div className="map-editor__section-title">
                  Placed {editorMode === 'sprites' ? 'Sprites' : 'Objects'}:
                </div>
                <div className="map-editor__scroll-list">
                  {(editorMode === 'sprites' ? sprites : objects).map((item, idx) => (
                    <div
                      key={idx}
                      style={{
                        background: '#1e1e1e',
                        padding: '8px',
                        marginBottom: '5px',
                        borderRadius: '3px',
                        fontSize: '11px',
                      }}
                    >
                      <div className="map-editor__list-item-title">{item.id}</div>
                      <div className="map-editor__list-item-meta">Type: {item.type}</div>
                      <div className="map-editor__list-item-meta">Pos: [{item.pos.join(', ')}]</div>
                      <div className="map-editor__list-item-meta">Facing: {item.facing}</div>
                      <div style={{ display: 'flex', gap: '6px', marginTop: '5px' }}>
                        <Button
                          size="sm"
                          appearance="default"
                          onClick={() => {
                            if (editorMode === 'sprites') {
                              setSelectedSprite(selectedSprite === idx ? null : idx);
                            } else {
                              setSelectedObject(selectedObject === idx ? null : idx);
                            }
                          }}
                          style={{
                            background: '#0e639c',
                            color: 'white',
                            border: 'none',
                            padding: '4px 8px',
                            borderRadius: '2px',
                            cursor: 'pointer',
                            fontSize: '10px',
                          }}
                        >
                          {(editorMode === 'sprites' ? selectedSprite : selectedObject) === idx
                            ? '✕ Close'
                            : '✏️ Edit'}
                        </Button>
                        <Button
                          size="sm"
                          appearance="default"
                          color="red"
                          onClick={() =>
                            editorMode === 'sprites' ? removeSprite(idx) : removeObject(idx)
                          }
                          style={{
                            background: '#5a1d1d',
                            color: '#f48771',
                            border: 'none',
                            padding: '4px 8px',
                            borderRadius: '2px',
                            cursor: 'pointer',
                            fontSize: '10px',
                          }}
                        >
                          🗑️ Remove
                        </Button>
                      </div>
                      {(editorMode === 'sprites' ? selectedSprite : selectedObject) === idx &&
                        renderPlacementEditor(
                          item,
                          idx,
                          editorMode === 'sprites' ? updateSprite : updateObject
                        )}
                    </div>
                  ))}
                  {(editorMode === 'sprites' ? sprites : objects).length === 0 && (
                    <div className="map-editor__list-item-meta">
                      No {editorMode === 'sprites' ? 'sprites' : 'objects'} placed yet
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Animated Tiles Editor */}
        {editorMode === 'animatedTiles' && (
          <div
            className="map-editor__panel"
          >
            <div
              className="map-editor__panel-header"
            >
              ✨ Animated Tile Placement
            </div>
            <div className="map-editor__panel-body">
              <div className="map-editor__warning-banner">
                <strong>➤ Click on map to place animated tile</strong>
                <br />
                <span className="map-editor__info-banner-hint">
                  • Select sprite type below, then click on any tile
                </span>
              </div>

              <div className="map-editor__field">
                <label className="map-editor__label">
                  Sprite Type:
                </label>
                {availableSprites.length > 0 ? (
                  <SelectPicker
                    data={[
                      { value: '', label: '-- Select Sprite Type --' },
                      ...availableSprites.map(type => ({ value: type, label: type })),
                    ]}
                    value={spriteTypeInput}
                    onChange={v => setSpriteTypeInput(v)}
                    cleanable={false}
                    block
                  />
                ) : (
                  <>
                    <Input
                      value={spriteTypeInput}
                      onChange={e => setSpriteTypeInput(e.target.value)}
                      placeholder="e.g., effects/spurt, effects/fire"
                      style={{
                        width: '100%',
                        background: '#3c3c3c',
                        color: '#d4d4d4',
                        border: '1px solid #3e3e42',
                        padding: '6px 8px',
                        borderRadius: '3px',
                        fontSize: '12px',
                      }}
                    />
                    <div className="map-editor__hint">
                      No sprites found in package. Enter manually.
                    </div>
                  </>
                )}
              </div>

              <div
                className="map-editor__divider"
              >
                <div className="map-editor__section-title">
                  Placed Animated Tiles:
                </div>
                <div className="map-editor__scroll-list">
                  {animatedTiles.map((tile, idx) => (
                    <div
                      key={idx}
                      style={{
                        background: '#1e1e1e',
                        padding: '8px',
                        marginBottom: '5px',
                        borderRadius: '3px',
                        fontSize: '11px',
                      }}
                    >
                      <div className="map-editor__list-item-title">Tile #{idx + 1}</div>
                      <div className="map-editor__list-item-meta">Type: {tile.type}</div>
                      <div className="map-editor__list-item-meta">Pos: [{tile.pos.join(', ')}]</div>
                      <Button
                        size="sm"
                        appearance="default"
                        color="red"
                        onClick={() => removeAnimatedTile(idx)}
                        style={{
                          marginTop: '5px',
                          background: '#5a1d1d',
                          color: '#f48771',
                          border: 'none',
                          padding: '4px 8px',
                          borderRadius: '2px',
                          cursor: 'pointer',
                          fontSize: '10px',
                        }}
                      >
                        🗑️ Remove
                      </Button>
                    </div>
                  ))}
                  {animatedTiles.length === 0 && (
                    <div className="map-editor__list-item-meta">
                      No animated tiles placed yet
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Attribute Editor */}
        {editorMode === 'attributes' && (
          <div
            className="map-editor__panel"
          >
            <div
              className="map-editor__panel-header"
            >
              📝 Cell Attributes
            </div>
            <div className="map-editor__panel-body">
              {!selectedCell ? (
                <div style={{ fontSize: '11px', color: '#888', fontStyle: 'italic' }}>
                  Click a cell on the map to edit its attributes.
                </div>
              ) : (
                <>
                  <div style={{ marginBottom: '10px', fontSize: '11px', color: '#4ec9b0' }}>
                    <strong>Selected:</strong> x:{selectedCell.x}, y:{selectedCell.y}
                  </div>

                  <div className="map-editor__field">
                    <label
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        cursor: 'pointer',
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={!!attributes[selectedCell.y]?.[selectedCell.x]?.walkable}
                        onChange={e => {
                          const next = attributes.map((row, j) =>
                            row.map((attr, i) => {
                              if (j === selectedCell.y && i === selectedCell.x) {
                                return { ...attr, walkable: e.target.checked };
                              }
                              return attr;
                            })
                          );
                          setAttributes(next);
                          pushHistory(cells, heights, next);
                        }}
                      />
                      <span style={{ fontSize: '12px' }}>Walkable</span>
                    </label>
                  </div>

                  <div style={{ marginBottom: '15px' }}>
                    <label className="map-editor__label">
                      Event / Script:
                    </label>
                    <Input
                      value={attributes[selectedCell.y]?.[selectedCell.x]?.event || ''}
                      onChange={e => {
                        const val = e.target.value;
                        const next = attributes.map((row, j) =>
                          row.map((attr, i) => {
                            if (j === selectedCell.y && i === selectedCell.x) {
                              return { ...attr, event: val };
                            }
                            return attr;
                          })
                        );
                        setAttributes(next);
                        pushHistory(cells, heights, next);
                      }}
                      placeholder="e.g., door_open, trigger_cutscene"
                      style={{
                        width: '100%',
                        background: '#3c3c3c',
                        color: '#d4d4d4',
                        border: '1px solid #3e3e42',
                        padding: '6px 8px',
                        borderRadius: '3px',
                        fontSize: '12px',
                      }}
                    />
                    <div className="map-editor__hint">
                      Triggered when player enters or interacts
                    </div>
                  </div>

                  <Button
                    block
                    size="sm"
                    appearance="default"
                    onClick={() => setSelectedCell(null)}
                    style={{
                      width: '100%',
                      background: '#3e3e42',
                      color: 'white',
                      border: 'none',
                      padding: '8px',
                      borderRadius: '3px',
                      cursor: 'pointer',
                      fontSize: '11px',
                    }}
                  >
                    Done
                  </Button>
                </>
              )}
            </div>
          </div>
        )}

        {/* Triggers Editor */}
        {editorMode === 'triggers' && (
          <div
            className="map-editor__panel"
          >
            <div
              className="map-editor__panel-header"
            >
              ⚡ Triggers & Scripts
            </div>
            <div className="map-editor__panel-body">
              <div style={{ marginBottom: '15px' }}>
                <label className="map-editor__label">
                  Select Trigger (tile click):
                </label>
                <Input
                  value={triggers.selectTrigger}
                  onChange={e => setTriggers({ ...triggers, selectTrigger: e.target.value })}
                  placeholder="e.g., tile/select_test"

                />
                <div className="map-editor__hint">
                  Lua script path (relative to triggers/)
                </div>
              </div>

              <div
                className="map-editor__divider"
              >
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '8px',
                  }}
                >
                  <div style={{ fontWeight: 'bold', fontSize: '12px' }}>Scripts (on load):</div>
                  <Button
                    size="sm"
                    appearance="primary"
                    onClick={() => {
                      const newScript = { id: `script-${Date.now()}`, trigger: '' };
                      const next = { ...triggers, scripts: [...triggers.scripts, newScript] };
                      setTriggers(next);
                      pushHistory(cells, heights, attributes, { triggers: next });
                    }}
                    style={{
                      background: '#0e639c',
                      color: 'white',
                      border: 'none',
                      padding: '4px 8px',
                      borderRadius: '2px',
                      cursor: 'pointer',
                      fontSize: '10px',
                    }}
                  >
                    + Add
                  </Button>
                </div>
                <div className="map-editor__scroll-list">
                  {triggers.scripts.map((script, idx) => (
                    <div
                      key={idx}
                      style={{
                        background: '#1e1e1e',
                        padding: '8px',
                        marginBottom: '5px',
                        borderRadius: '3px',
                      }}
                    >
                      <div style={{ marginBottom: '5px' }}>
                        <label style={{ fontSize: '10px', color: '#888' }}>ID:</label>
                        <Input
                          value={script.id}
                          onChange={e => {
                            const newScripts = [...triggers.scripts];
                            newScripts[idx].id = e.target.value;
                            setTriggers({ ...triggers, scripts: newScripts });
                          }}
                          style={{
                            width: '100%',
                            background: '#3c3c3c',
                            color: '#d4d4d4',
                            border: '1px solid #3e3e42',
                            padding: '4px 6px',
                            borderRadius: '2px',
                            fontSize: '11px',
                            marginTop: '2px',
                          }}
                        />
                      </div>
                      <div style={{ marginBottom: '5px' }}>
                        <label style={{ fontSize: '10px', color: '#888' }}>Trigger:</label>
                        <Input
                          value={script.trigger}
                          onChange={e => {
                            const newScripts = [...triggers.scripts];
                            newScripts[idx].trigger = e.target.value;
                            setTriggers({ ...triggers, scripts: newScripts });
                          }}
                          placeholder="e.g., zone/room_clear_path"
                          style={{
                            width: '100%',
                            background: '#3c3c3c',
                            color: '#d4d4d4',
                            border: '1px solid #3e3e42',
                            padding: '4px 6px',
                            borderRadius: '2px',
                            fontSize: '11px',
                            marginTop: '2px',
                          }}
                        />
                      </div>
                      <Button
                        size="sm"
                        appearance="default"
                        color="red"
                        onClick={() => {
                          const newScripts = triggers.scripts.filter((_, i) => i !== idx);
                          const next = { ...triggers, scripts: newScripts };
                          setTriggers(next);
                          pushHistory(cells, heights, attributes, { triggers: next });
                        }}
                        style={{
                          background: '#5a1d1d',
                          color: '#f48771',
                          border: 'none',
                          padding: '4px 8px',
                          borderRadius: '2px',
                          cursor: 'pointer',
                          fontSize: '10px',
                        }}
                      >
                        🗑️ Remove
                      </Button>
                    </div>
                  ))}
                  {triggers.scripts.length === 0 && (
                    <div className="map-editor__list-item-meta">
                      No scripts configured
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Lights Editor */}
        {editorMode === 'lights' && (
          <div className="map-editor__panel">
            <div className="map-editor__panel-header">
              💡 Lights Editor
            </div>
            <div className="map-editor__panel-body">
              <div className="map-editor__info-banner">
                <strong>
                  ➤ Click on map to place a light
                </strong>
                <br />
                <span className="map-editor__info-banner-hint">
                  • Edit position, color and intensity below
                </span>
              </div>
              <Button
                size="sm"
                appearance="primary"
                block
                onClick={() => {
                  const cx = cells[0]?.length ? Math.floor(cells[0].length / 2) : 0;
                  const cy = cells.length ? Math.floor(cells.length / 2) : 0;
                  addLight(cx, cy);
                }}
                style={{
                  background: '#0e639c',
                  color: 'white',
                  border: 'none',
                  padding: '6px 12px',
                  borderRadius: '3px',
                  cursor: 'pointer',
                  fontSize: '11px',
                }}
              >
                ➕ Add Light at Map Center
              </Button>

              <div
                className="map-editor__divider"
              >
                <div className="map-editor__section-title">
                  Lights ({lights.length}):
                </div>
                <div className="map-editor__scroll-list">
                  {lights.map((light, idx) => (
                    <div
                      key={idx}
                      style={{
                        background: '#1e1e1e',
                        padding: '8px',
                        marginBottom: '5px',
                        borderRadius: '3px',
                        fontSize: '11px',
                      }}
                    >
                      <div className="map-editor__list-item-title">{light.id}</div>
                      <div className="map-editor__list-item-meta">
                        Pos: [{light.pos.join(', ')}] • Intensity: {light.density ?? 1}
                      </div>
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                          margin: '4px 0',
                        }}
                      >
                        <span
                          title="Light color"
                          style={{
                            width: '16px',
                            height: '16px',
                            borderRadius: '3px',
                            background: rgbToHex(light.color),
                            border: '1px solid #3e3e42',
                            display: 'inline-block',
                          }}
                        />
                        <label
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px',
                            cursor: 'pointer',
                          }}
                        >
                          <input
                            type="checkbox"
                            checked={light.enabled !== false}
                            onChange={e => updateLight(idx, { enabled: e.target.checked })}
                          />
                          <span style={{ fontSize: '11px' }}>Enabled</span>
                        </label>
                      </div>
                      <div style={{ display: 'flex', gap: '6px', marginTop: '5px' }}>
                        <Button
                          size="sm"
                          appearance="default"
                          onClick={() => setSelectedLight(selectedLight === idx ? null : idx)}
                          style={{
                            background: '#0e639c',
                            color: 'white',
                            border: 'none',
                            padding: '4px 8px',
                            borderRadius: '2px',
                            cursor: 'pointer',
                            fontSize: '10px',
                          }}
                        >
                          {selectedLight === idx ? '✕ Close' : '✏️ Edit'}
                        </Button>
                        <Button
                          size="sm"
                          appearance="default"
                          color="red"
                          onClick={() => removeLight(idx)}
                          style={{
                            background: '#5a1d1d',
                            color: '#f48771',
                            border: 'none',
                            padding: '4px 8px',
                            borderRadius: '2px',
                            cursor: 'pointer',
                            fontSize: '10px',
                          }}
                        >
                          🗑️ Remove
                        </Button>
                      </div>
                      {selectedLight === idx && (
                        <div
                          style={{
                            marginTop: '8px',
                            paddingTop: '8px',
                            borderTop: '1px solid #3e3e42',
                          }}
                        >
                          <div className="map-editor__field">
                            <label className="map-editor__label">ID:</label>
                            <Input
                              value={light.id}
                              onChange={e => updateLight(idx, { id: e.target.value })}
                              style={{
                                width: '100%',
                                background: '#3c3c3c',
                                color: '#d4d4d4',
                                border: '1px solid #3e3e42',
                                padding: '4px 6px',
                                borderRadius: '2px',
                                fontSize: '11px',
                                marginTop: '2px',
                              }}
                            />
                          </div>
                          <div className="map-editor__field">
                            <label className="map-editor__label">Position (X / Y / Z):</label>
                            <div style={{ display: 'flex', gap: '6px' }}>
                              {[0, 1, 2].map(axis => (
                                <InputNumber
                                  key={axis}
                                  value={light.pos[axis] ?? 0}
                                  onChange={v => {
                                    const nextPos = [...light.pos];
                                    nextPos[axis] = v;
                                    updateLight(idx, { pos: nextPos });
                                  }}
                                  style={{ width: '100%' }}
                                />
                              ))}
                            </div>
                          </div>
                          <div className="map-editor__field">
                            <label className="map-editor__label">Color:</label>
                            <input
                              type="color"
                              value={rgbToHex(light.color)}
                              onChange={e => updateLight(idx, { color: hexToRgb(e.target.value) })}
                              style={{
                                width: '100%',
                                height: '32px',
                                background: '#3c3c3c',
                                border: '1px solid #3e3e42',
                                borderRadius: '2px',
                                cursor: 'pointer',
                                marginTop: '2px',
                              }}
                            />
                          </div>
                          <div className="map-editor__field">
                            <label className="map-editor__label">Intensity:</label>
                            <InputNumber
                              min={0}
                              step={0.1}
                              value={light.density ?? 1}
                              onChange={v => updateLight(idx, { density: v })}
                              style={{ width: '100%' }}
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                  {lights.length === 0 && (
                    <div className="map-editor__list-item-meta">
                      No lights placed yet
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tiles Section */}
        <div
          className="map-editor__panel"
        >
          <div
            style={{
              background: '#37373d',
              padding: '10px',
              fontWeight: 'bold',
              borderBottom: '1px solid #3e3e42',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <span>🎨 Tiles ({Object.keys(tiles || {}).length})</span>
            <Button
              size="sm"
              appearance="default"
              active={showTileEditor}
              onClick={() => setShowTileEditor(!showTileEditor)}
              style={{
                background: showTileEditor ? '#0e639c' : '#505050',
                border: 'none',
                color: 'white',
                padding: '4px 8px',
                borderRadius: '3px',
                cursor: 'pointer',
                fontSize: '10px',
              }}
              title="Toggle inline tile editor"
            >
              {showTileEditor ? '✕ Close' : '✏️ Edit'}
            </Button>
          </div>
          <div className="map-editor__panel-body">
            {/* Inline Tile Editor Panel */}
            {showTileEditor && editingTileName && tiles[editingTileName] && (
              <div
                style={{
                  background: '#252526',
                  border: '1px solid #0e639c',
                  borderRadius: '4px',
                  padding: '10px',
                  marginBottom: '10px',
                }}
              >
                <div
                  style={{
                    fontWeight: 'bold',
                    color: '#7dd3fc',
                    marginBottom: '8px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}
                >
                  <span>Editing: {editingTileName}</span>
                  <Button
                    size="sm"
                    appearance="ghost"
                    onClick={() => setEditingTileName(null)}
                    style={{
                      background: 'transparent',
                      border: 'none',
                      color: '#888',
                      cursor: 'pointer',
                      fontSize: '14px',
                    }}
                  >
                    ✕
                  </Button>
                </div>
                <div style={{ fontSize: '10px', color: '#888', marginBottom: '8px' }}>
                  Layers: {Math.floor(tiles[editingTileName].length / 3)}
                </div>
                <div style={{ maxHeight: '120px', overflowY: 'auto' }}>
                  {(() => {
                    const arr = tiles[editingTileName];
                    const layers = [];
                    for (let i = 0; i < arr.length; i += 3) {
                      layers.push({ geom: arr[i], tex: arr[i + 1], z: arr[i + 2] });
                    }
                    return layers.map((layer, idx) => (
                      <div
                        key={idx}
                        style={{
                          display: 'grid',
                          gridTemplateColumns: '60px 60px 40px',
                          gap: '4px',
                          marginBottom: '4px',
                          fontSize: '9px',
                          background: '#2d2d30',
                          padding: '4px',
                          borderRadius: '2px',
                        }}
                      >
                        <span
                          title="Geometry"
                          style={{ color: '#a78bfa', overflow: 'hidden', textOverflow: 'ellipsis' }}
                        >
                          {layer.geom}
                        </span>
                        <span
                          title="Texture"
                          style={{ color: '#7dd3fc', overflow: 'hidden', textOverflow: 'ellipsis' }}
                        >
                          {layer.tex}
                        </span>
                        <span title="Z-Offset" style={{ color: '#fbbf24' }}>
                          z:{layer.z}
                        </span>
                      </div>
                    ));
                  })()}
                </div>
                <div style={{ fontSize: '9px', color: '#ce9178', marginTop: '6px' }}>
                  💡 For full editing, open tiles.json in the sidebar
                </div>
              </div>
            )}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(70px, 1fr))',
                gap: '8px',
                maxHeight: '200px',
                overflowY: 'auto',
                marginBottom: '10px',
              }}
            >
              {Object.keys(tiles || {})
                .sort()
                .map(tileName => (
                  <div
                    key={tileName}
                    onClick={() => setSelectedTile(tileName)}
                    onDoubleClick={() => {
                      setShowTileEditor(true);
                      setEditingTileName(tileName);
                    }}
                    style={{
                      background: selectedTile === tileName ? '#0e639c' : '#3c3c3c',
                      border: `2px solid ${selectedTile === tileName ? '#1177bb' : editingTileName === tileName ? '#a78bfa' : '#3e3e42'}`,
                      padding: '6px',
                      textAlign: 'center',
                      cursor: 'pointer',
                      borderRadius: '3px',
                      fontSize: '9px',
                      wordWrap: 'break-word',
                      transition: 'all 0.2s',
                      position: 'relative',
                    }}
                    onMouseOver={e => {
                      if (selectedTile !== tileName) {
                        e.currentTarget.style.borderColor = '#0e639c';
                      }
                    }}
                    onMouseOut={e => {
                      if (selectedTile !== tileName) {
                        e.currentTarget.style.borderColor =
                          editingTileName === tileName ? '#a78bfa' : '#3e3e42';
                      }
                    }}
                  >
                    <div>{tileName}</div>
                    <div
                      style={{
                        fontSize: '8px',
                        color: '#888',
                        marginTop: '2px',
                      }}
                    >
                      {Math.floor(tiles[tileName].length / 3)} parts
                    </div>
                  </div>
                ))}
            </div>
            <div style={{ fontSize: '11px', color: '#888', marginBottom: '10px' }}>
              Click to select • Double-click to inspect layers
            </div>
          </div>
        </div>

        {/* Geometry Section */}
        <div
          className="map-editor__panel"
        >
          <div
            style={{
              background: '#37373d',
              padding: '10px',
              fontWeight: 'bold',
              borderBottom: '1px solid #3e3e42',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <span>📐 Geometry ({Object.keys(geometry || {}).length})</span>
          </div>
          <div className="map-editor__panel-body">
            {/* Inline Geometry Inspector */}
            {editingGeometryName && geometry[editingGeometryName] && (
              <div
                style={{
                  background: '#1e1e2e',
                  border: '1px solid #a78bfa',
                  borderRadius: '4px',
                  padding: '10px',
                  marginBottom: '10px',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '10px',
                    borderBottom: '1px solid #3e3e42',
                    paddingBottom: '8px',
                  }}
                >
                  <span style={{ fontWeight: 'bold', color: '#a78bfa' }}>
                    🔍 {editingGeometryName}
                  </span>
                  <Button
                    size="sm"
                    appearance="ghost"
                    onClick={() => setEditingGeometryName(null)}
                    style={{
                      background: '#333',
                      border: '1px solid #555',
                      color: '#fff',
                      padding: '2px 8px',
                      borderRadius: '3px',
                      cursor: 'pointer',
                    }}
                  >
                    ×
                  </Button>
                </div>
                <div style={{ fontSize: '11px', color: '#aaa' }}>
                  Vertices: {geometry[editingGeometryName]?.vertices?.length || 0} | Surfaces:{' '}
                  {geometry[editingGeometryName]?.surfaces?.length || 0} | Type:{' '}
                  {geometry[editingGeometryName]?.type_bitmask || 0}
                </div>
                {geometry[editingGeometryName]?.vertices && (
                  <div style={{ marginTop: '8px', fontSize: '10px', color: '#888' }}>
                    {geometry[editingGeometryName].vertices.slice(0, 6).map((v, i) => (
                      <div key={i} style={{ fontFamily: 'monospace' }}>
                        v{i}: [{v.map(n => n.toFixed(2)).join(', ')}]
                      </div>
                    ))}
                    {geometry[editingGeometryName].vertices.length > 6 && (
                      <div style={{ fontStyle: 'italic' }}>
                        ... {geometry[editingGeometryName].vertices.length - 6} more
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
            <div style={{ maxHeight: '150px', overflowY: 'auto', marginBottom: '10px' }}>
              {Object.keys(geometry || {})
                .sort()
                .map(geomName => (
                  <div
                    key={geomName}
                    onClick={() => setEditingGeometryName(geomName)}
                    style={{
                      background: '#3c3c3c',
                      padding: '6px 8px',
                      marginBottom: '5px',
                      borderRadius: '3px',
                      fontSize: '11px',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      cursor: 'pointer',
                      border: `2px solid ${editingGeometryName === geomName ? '#a78bfa' : '#3e3e42'}`,
                    }}
                    onMouseOver={e => {
                      if (editingGeometryName !== geomName) {
                        e.currentTarget.style.borderColor = '#0e639c';
                      }
                    }}
                    onMouseOut={e => {
                      e.currentTarget.style.borderColor =
                        editingGeometryName === geomName ? '#a78bfa' : '#3e3e42';
                    }}
                  >
                    <span>{geomName}</span>
                    <span style={{ color: '#888', fontSize: '10px' }}>
                      {geometry[geomName]?.vertices?.length || 0} △
                    </span>
                  </div>
                ))}
            </div>
            <div style={{ fontSize: '11px', color: '#888' }}>Click to inspect geometry details</div>
          </div>
        </div>

        {/* Texture Preview Section */}
        {textureAtlas && (
          <div
            className="map-editor__panel"
          >
            <div
              className="map-editor__panel-header"
            >
              🖼️ Texture Atlas
            </div>
            <div className="map-editor__panel-body">
              <div
                style={{
                  width: '100%',
                  height: '150px',
                  background: '#1e1e1e',
                  border: '1px solid #3e3e42',
                  borderRadius: '3px',
                  overflow: 'hidden',
                  position: 'relative',
                }}
              >
                <img
                  src={textureAtlas}
                  alt="Texture Atlas"
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'contain',
                    imageRendering: 'pixelated',
                  }}
                />
              </div>
              <div style={{ fontSize: '10px', color: '#888', marginTop: '5px' }}>
                Tile size: {tileset?.tileSize || 16}px | Sheet: {tileset?.sheetSize?.[0] || 512}×
                {tileset?.sheetSize?.[1] || 512}
              </div>
            </div>
          </div>
        )}

        {/* Map Settings Section */}
        <div
          className="map-editor__panel"
        >
          <div
            className="map-editor__panel-header"
          >
            ⚙️ Map Settings
          </div>
          <div className="map-editor__panel-body">
            <div className="map-editor__field">
              <label
                style={{
                  display: 'block',
                  marginBottom: '5px',
                  fontSize: '12px',
                  color: '#cccccc',
                }}
              >
                Expected Tileset:
              </label>
              <div
                style={{
                  background: '#3c3c3c',
                  padding: '6px 8px',
                  borderRadius: '3px',
                  fontSize: '11px',
                  border: '1px solid #3e3e42',
                }}
              >
                {map?.tileset || 'unknown'}
              </div>
            </div>
            <div className="map-editor__field">
              <label
                style={{
                  display: 'block',
                  marginBottom: '5px',
                  fontSize: '12px',
                  color: '#cccccc',
                }}
              >
                Current Size:
              </label>
              <div
                style={{
                  background: '#3c3c3c',
                  padding: '6px 8px',
                  borderRadius: '3px',
                  fontSize: '11px',
                  border: '1px solid #3e3e42',
                }}
              >
                {cells[0]?.length || 0} × {cells.length} cells
              </div>
            </div>
            <div className="map-editor__field">
              <label
                style={{
                  display: 'block',
                  marginBottom: '5px',
                  fontSize: '12px',
                  color: '#cccccc',
                }}
              >
                Map Width:
              </label>
              <InputNumber
                min={1}
                value={newMapWidth}
                onChange={v => setNewMapWidth(v)}
              />
            </div>
            <div className="map-editor__field">
              <label
                style={{
                  display: 'block',
                  marginBottom: '5px',
                  fontSize: '12px',
                  color: '#cccccc',
                }}
              >
                Map Height:
              </label>
              <InputNumber
                min={1}
                value={newMapHeight}
                onChange={v => setNewMapHeight(v)}
              />
            </div>
            <div className="map-editor__row">
              <Button
                size="sm"
                appearance="primary"
                onClick={() => resizeMap(newMapWidth, newMapHeight)}
                style={{
                  flex: 1,
                  background: '#0e639c',
                  color: 'white',
                  border: 'none',
                  padding: '8px 12px',
                  borderRadius: '3px',
                  cursor: 'pointer',
                  fontSize: '12px',
                }}
                onMouseOver={e => (e.target.style.background = '#1177bb')}
                onMouseOut={e => (e.target.style.background = '#0e639c')}
              >
                Resize
              </Button>
              <Button
                size="sm"
                appearance="default"
                color="red"
                onClick={async () => {
                  if (await confirm('Clear entire map? This cannot be undone.')) {
                    clearMap();
                  }
                }}
                style={{
                  flex: 1,
                  background: '#3e3e42',
                  color: 'white',
                  border: 'none',
                  padding: '8px 12px',
                  borderRadius: '3px',
                  cursor: 'pointer',
                  fontSize: '12px',
                }}
                onMouseOver={e => (e.target.style.background = '#4e4e52')}
                onMouseOut={e => (e.target.style.background = '#3e3e42')}
              >
                Clear
              </Button>
            </div>
          </div>
        </div>

        {/* Help Section */}
        <div
          className="map-editor__panel"
        >
          <div
            className="map-editor__panel-header"
          >
            ❓ Help
          </div>
          <div style={{ padding: '10px', fontSize: '11px', lineHeight: '1.6' }}>
            <strong>Keyboard Shortcuts:</strong>
            <br />
            <code style={{ background: '#1e1e1e', padding: '2px 4px', borderRadius: '2px' }}>
              P
            </code>{' '}
            - Paint tool
            <br />
            <code style={{ background: '#1e1e1e', padding: '2px 4px', borderRadius: '2px' }}>
              E
            </code>{' '}
            - Erase tool
            <br />
            <code style={{ background: '#1e1e1e', padding: '2px 4px', borderRadius: '2px' }}>
              I
            </code>{' '}
            - Pick tool
            <br />
            <code style={{ background: '#1e1e1e', padding: '2px 4px', borderRadius: '2px' }}>
              R
            </code>{' '}
            - Reset camera
            <br />
            <br />
            <strong>Visual Markers:</strong>
            <br />
            <span style={{ color: '#4fc14f' }}>🟢 Green cube</span> - Sprite
            <br />
            <span style={{ color: '#4f9fcf' }}>🔵 Blue cube</span> - Object
            <br />
            <span style={{ color: '#e5c14f' }}>🟡 Yellow cube</span> - Animated Tile
            <br />
            <br />
            <strong>Editing:</strong>
            <br />• <strong>Shift+Click</strong> - Paint
            <br />• <strong>Shift+Right-Click</strong> - Erase
            <br />
            • Regular drag rotates camera
            <br />
            • Middle mouse pans
            <br />• Scroll wheel zooms
          </div>
        </div>
      </div>
      </ResizablePanel>

      {/* Main content */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        {/* Toolbar */}
        <div className="map-editor__toolbar-strip">
          <span>
            Drag to rotate • Middle mouse to pan • Scroll to zoom
          </span>
          <label
            className="map-editor__toolbar-toggle"
            style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', marginLeft: '12px' }}
          >
            <input
              type="checkbox"
              checked={lightsEnabled}
              onChange={e => setLightsEnabled(e.target.checked)}
            />
            💡 Lights
          </label>
        </div>

        {/* Canvas (P3-07: memoized; panel state changes do not rerender it) */}
        <MapCanvas
          onRender={handleRender}
          onInit={handleWebGLInit}
          onCellClick={handleCellClick}
          onCellHover={handleCellHover}
          viewMode={viewMode}
          error={error}
          cells={cells}
          heights={heights}
          cameraSeed={cameraSeed}
        />

        {/* Status bar */}
        <div
          style={{
            background: '#007acc',
            color: 'white',
            padding: '4px 10px',
            fontSize: '12px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <span>
            Mode: {editorMode} | Tool: {currentTool} | Tile: {selectedTile} | Height:{' '}
            {currentHeight.toFixed(1)}
          </span>
          <span>
            {hoveredCell ? `Cell: ${hoveredCell.x}, ${hoveredCell.y}` : 'Ready'} | Sprites:{' '}
            {sprites.length} | Objects: {objects.length} | Animated: {animatedTiles.length}
          </span>
        </div>
      </div>
    </div>
  );
}

export default collect(UnifiedMapEditor);
