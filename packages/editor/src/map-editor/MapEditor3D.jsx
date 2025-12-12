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

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { collect } from 'react-recollect';

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
function MapEditor({ content, onSave, tileset, geometry, tiles, textureAtlas, zip }) {
  console.log('[MapEditor3D] Component props:', {
    content: !!content,
    tileset: !!tileset,
    geometry: !!geometry,
    tiles: !!tiles,
    textureAtlas: !!textureAtlas,
    cells: content?.cells?.length,
    mapBounds: content?.bounds
  });
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
  const [animatedTiles, setAnimatedTiles] = useState([]);
  
  // UI state
  const [selectedTile, setSelectedTile] = useState('FLOOR');
  const [currentTool, setCurrentTool] = useState('paint'); // 'paint', 'erase', 'pick', 'rectangle', 'sprite', 'object', 'animatedTile'
  const [currentHeight, setCurrentHeight] = useState(0);
  const [showGrid] = useState(true);
  const [error, setError] = useState(null);
  const [editorMode, setEditorMode] = useState('tiles'); // 'tiles', 'sprites', 'objects', 'triggers', 'lights', 'animatedTiles'
  
  // Painting state
  const [isPainting, setIsPainting] = useState(false);
  const [lastPaintedCell, setLastPaintedCell] = useState(null);

  // Rectangle selection state
  const [isSelectingRectangle, setIsSelectingRectangle] = useState(false);
  const [rectangleStart, setRectangleStart] = useState(null);
  const [rectangleEnd, setRectangleEnd] = useState(null);
  
  // Sprite/Object editing state
  const [selectedSprite, setSelectedSprite] = useState(null);
  const [spriteTypeInput, setSpriteTypeInput] = useState('');
  const [spriteIdInput, setSpriteIdInput] = useState('');
  const [spriteFacing, setSpriteFacing] = useState('Down');
  const [selectedObject, setSelectedObject] = useState(null);
  
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
          const typePath = fullPath
            .replace('sprites/', '')
            .replace('.json', '');
          
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
      if (parsedMap) {
        setTriggers({
          selectTrigger: parsedMap.selectTrigger || '',
          scripts: parsedMap.scripts || []
        });
      }
      
      // Load lights if present
      if (parsedMap?.lights && Array.isArray(parsedMap.lights)) {
        setLights(parsedMap.lights);
      } else {
        setLights([]);
      }
      
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
      
      // Initialize history
      if (parsedCells) {
        pushHistory(parsedCells, currentHeights);
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
      return;
    }
    
    if (!glRef.current) {
      return;
    }
    
    const img = new Image();
    img.onload = () => {
      if (glRef.current) {
        const texture = createTextureFromImage(glRef.current, img);
        textureRef.current = texture;
        
        // Verify texture was created successfully
        if (!texture) {
          console.error('[MapEditor3D] Failed to create WebGL texture object!');
        }
      } else {
        console.error('[MapEditor3D] GL context lost after image load!');
      }
    };
    img.onerror = (e) => {
      console.error('[MapEditor3D] Failed to load texture image:', e);
    };
    img.src = textureAtlas;
  }, [textureAtlas]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'SELECT') return;

      switch(e.key.toLowerCase()) {
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
        setCurrentTool('rectangle');
        break;
      case 'c':
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
  }, [isSelectingRectangle, rectangleStart, rectangleEnd]);

  // Initialize WebGL program
  const handleWebGLInit = useCallback((gl) => {
    console.log('[MapEditor3D] handleWebGLInit called', { gl: !!gl, textureAtlas: !!textureAtlas });
    glRef.current = gl;
    
    // Create shader program
    const program = createProgram(gl, defaultVertexShader, defaultFragmentShader);
    if (program) {
      shaderProgramRef.current = program;
      
      // If we already have a texture atlas, load it now
      if (textureAtlas && !textureRef.current) {
        const img = new Image();
        img.onload = () => {
          const texture = createTextureFromImage(gl, img);
          textureRef.current = texture;
        };
        img.onerror = (e) => {
          console.error('[MapEditor3D] Failed to load texture in init:', e);
        };
        img.src = textureAtlas;
      }
    } else {
      console.error('[MapEditor3D] Failed to create shader program');
    }
  }, [textureAtlas]);

  // Render callback for WebGL3DCanvas
  const handleRender = useCallback(
    (gl, projectionMatrix, viewMatrix, camera, showGridFlag) => {
      console.log('[MapEditor3D] handleRender called', { cellsLength: cells?.length, shaderProgram: !!shaderProgramRef.current });
      if (!shaderProgramRef.current || !cells.length) {
        console.log('[MapEditor3D] Early return - no shader program or no cells');
        return;
      }

      const program = shaderProgramRef.current;
      gl.useProgram(program);

      // Get uniform locations
      const uModelViewMatrix = gl.getUniformLocation(program, 'uModelViewMatrix');
      const uProjectionMatrix = gl.getUniformLocation(program, 'uProjectionMatrix');
      const uUseTexture = gl.getUniformLocation(program, 'uUseTexture');
      const uColor = gl.getUniformLocation(program, 'uColor');
      const uShowGrid = gl.getUniformLocation(program, 'uShowGrid');
      const uTexture = gl.getUniformLocation(program, 'uTexture');
      const uIsHovered = gl.getUniformLocation(program, 'uIsHovered');

      gl.uniformMatrix4fv(uProjectionMatrix, false, projectionMatrix);
      gl.uniform1i(uShowGrid, showGridFlag);

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
          uUseTexture,
          uColor,
          [0.8, 0.8, 0.2] // Yellow for animated tiles
        );
      });
    },
    [cells, heights, hoveredCell, tiles, geometry, tileset, textureRef.current, sprites, objects, animatedTiles]
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

    // Parse tile definition: [geometryName, textureName, heightOffset, ...]
    for (let i = 0; i < tileData.length; i += 3) {
      const geometryName = tileData[i];
      const textureName = tileData[i + 1];
      // Use tile's heightOffset PLUS cellHeight from height map
      const tileHeightOffset = tileData[i + 2] || 0;
      const heightOffset = cellHeight + tileHeightOffset;

      if (!geometry || !geometry[geometryName]) continue;

      const geom = geometry[geometryName];
      renderGeometry(
        gl,
        program,
        geom,
        textureName,
        heightOffset,
        uUseTexture,
        uColor,
        uTexture
      );
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
      const texTri = geom.surfaces?.[i] || [[0, 0], [1, 0], [1, 1]];

      // Calculate normal
      const v1 = [
        tri[1][0] - tri[0][0],
        tri[1][1] - tri[0][1],
        tri[1][2] - tri[0][2],
      ];
      const v2 = [
        tri[2][0] - tri[0][0],
        tri[2][1] - tri[0][1],
        tri[2][2] - tri[0][2],
      ];
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

  // Render a marker (cube) for sprites, objects, or animated tiles
  function renderMarker(
    gl,
    program,
    x,
    y,
    z,
    viewMatrix,
    uModelViewMatrix,
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

    // Create a simple cube
    const vertices = [
      // Front face
      -size, -size,  size,
      size, -size,  size,
      size,  size,  size,
      -size, -size,  size,
      size,  size,  size,
      -size,  size,  size,
      // Back face
      -size, -size, -size,
      -size,  size, -size,
      size,  size, -size,
      -size, -size, -size,
      size,  size, -size,
      size, -size, -size,
      // Top face
      -size,  size, -size,
      -size,  size,  size,
      size,  size,  size,
      -size,  size, -size,
      size,  size,  size,
      size,  size, -size,
      // Bottom face
      -size, -size, -size,
      size, -size, -size,
      size, -size,  size,
      -size, -size, -size,
      size, -size,  size,
      -size, -size,  size,
      // Right face
      size, -size, -size,
      size,  size, -size,
      size,  size,  size,
      size, -size, -size,
      size,  size,  size,
      size, -size,  size,
      // Left face
      -size, -size, -size,
      -size, -size,  size,
      -size,  size,  size,
      -size, -size, -size,
      -size,  size,  size,
      -size,  size, -size,
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
      
      // Drag painting: works in tile mode when painting/erasing
      if (editorMode === 'tiles' && isPainting && cellCoords) {
        const { x, y } = cellCoords;
        // Only paint if we moved to a different cell
        if (!lastPaintedCell || lastPaintedCell.x !== x || lastPaintedCell.y !== y) {
          if (event.buttons === 1 && currentTool === 'paint') {
            // Left button - paint
            paintCell(x, y);
            setLastPaintedCell({ x, y });
          } else if (event.buttons === 2 || (event.buttons === 1 && currentTool === 'erase')) {
            // Right button or left button with erase tool - erase
            eraseCell(x, y);
            setLastPaintedCell({ x, y });
          }
        }
      }

      // Rectangle selection: update end point while dragging
      if (editorMode === 'tiles' && currentTool === 'rectangle' && isSelectingRectangle && cellCoords) {
        setRectangleEnd(cellCoords);
      }
    },
    [cells, isPainting, lastPaintedCell, selectedTile, currentHeight, editorMode, currentTool]
  );

  // Handle cell click for editing
  const handleCellClick = useCallback(
    (screenX, screenY, camera, event) => {
      if (!cells.length) return;

      const cellCoords = screenToCell(screenX, screenY, camera, glRef.current.canvas);
      if (!cellCoords) {
        return;
      }

      const { x, y } = cellCoords;

      // Handle different editor modes - each mode is completely separate
      if (editorMode === 'sprites') {
        if (event.type === 'click' && event.button === 0) {
          addSprite(x, y);
        }
        return; // Don't process any other actions in sprite mode
      } 
      
      if (editorMode === 'objects') {
        if (event.type === 'click' && event.button === 0) {
          addObject(x, y);
        }
        return; // Don't process any other actions in object mode
      } 
      
      if (editorMode === 'animatedTiles') {
        if (event.type === 'click' && event.button === 0) {
          addAnimatedTile(x, y);
        }
        return; // Don't process any other actions in animated tile mode
      }

      // Tile mode - handle paint/erase/pick/rectangle tools
      if (editorMode === 'tiles') {
        if (currentTool === 'paint') {
          // Left-Click or Shift+Left-Click: Paint
          if ((event.type === 'click' || event.type === 'mousedown') && event.button === 0) {
            paintCell(x, y);
            setIsPainting(true);
            setLastPaintedCell({ x, y });
          }
        } else if (currentTool === 'erase') {
          // Left-Click or Right-Click: Erase
          if ((event.type === 'click' && event.button === 0) || event.type === 'contextmenu') {
            eraseCell(x, y);
            setIsPainting(true);
            setLastPaintedCell({ x, y });
          }
        } else if (currentTool === 'pick') {
          // Click: Pick tile
          if (event.type === 'click') {
            pickCell(x, y);
          }
        } else if (currentTool === 'rectangle') {
          // Left-Click: Start rectangle selection
          if (event.type === 'mousedown' && event.button === 0) {
            setIsSelectingRectangle(true);
            setRectangleStart(cellCoords);
            setRectangleEnd(cellCoords);
          }
        }
      }
    },
    [cells, currentTool, selectedTile, currentHeight, editorMode, spriteTypeInput, spriteIdInput, spriteFacing]
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

    const rayDirX =
      viewNormX + rightX * normX * tanFov * aspect + actualUpX * normY * tanFov;
    const rayDirY =
      viewNormY + rightY * normX * tanFov * aspect + actualUpY * normY * tanFov;
    const rayDirZ =
      viewNormZ + rightZ * normX * tanFov * aspect + actualUpZ * normY * tanFov;

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
    setCells(newCells);
    setHeights(newHeights);
    pushHistory(newCells, newHeights);
  }

  // Erase cell
  function eraseCell(x, y) {
    const newCells = cells.map((row, rowIdx) =>
      row.map((cell, colIdx) => (rowIdx === y && colIdx === x ? 'EMPTY' : cell))
    );
    const newHeights = heights.map((row, rowIdx) =>
      row.map((h, colIdx) => (rowIdx === y && colIdx === x ? 0 : h))
    );
    setCells(newCells);
    setHeights(newHeights);
    pushHistory(newCells, newHeights);
  }

  // Pick cell
  function pickCell(x, y) {
    const pickedTile = cells[y]?.[x];
    if (pickedTile && pickedTile !== 'EMPTY') {
      setSelectedTile(pickedTile);
      setCurrentHeight(heights[y]?.[x] || 0);
    }
  }

  // Fill rectangle with selected tile
  function fillRectangle(start, end) {
    if (!start || !end) return;

    const minX = Math.min(start.x, end.x);
    const maxX = Math.max(start.x, end.x);
    const minY = Math.min(start.y, end.y);
    const maxY = Math.max(start.y, end.y);

    const newCells = cells.map((row, y) =>
      row.map((cell, x) => {
        if (x >= minX && x <= maxX && y >= minY && y <= maxY) {
          return selectedTile;
        }
        return cell;
      })
    );

    const newHeights = heights.map((row, y) =>
      row.map((height, x) => {
        if (x >= minX && x <= maxX && y >= minY && y <= maxY) {
          return currentHeight;
        }
        return height;
      })
    );

    setCells(newCells);
    setHeights(newHeights);
    pushHistory(newCells, newHeights);
  }
  
  // Resize map
  function resizeMap(width, height) {
    const newCells = [];
    const newHeights = [];
    
    for (let y = 0; y < height; y++) {
      const row = [];
      const heightRow = [];
      for (let x = 0; x < width; x++) {
        // Copy existing data if within bounds, otherwise use EMPTY
        if (y < cells.length && x < cells[0]?.length) {
          row.push(cells[y][x]);
          heightRow.push(heights[y]?.[x] || 0);
        } else {
          row.push('EMPTY');
          heightRow.push(0);
        }
      }
      newCells.push(row);
      newHeights.push(heightRow);
    }
    
    setCells(newCells);
    setHeights(newHeights);
    pushHistory(newCells, newHeights);
    
    // Update map bounds
    if (map) {
      setMap({ ...map, bounds: [0, 0, width, height] });
    }
  }
  
  // Clear map
  function clearMap() {
    const newCells = cells.map(row => row.map(() => 'EMPTY'));
    const newHeights = heights.map(row => row.map(() => 0));
    setCells(newCells);
    setHeights(newHeights);
    setCurrentHeight(0);
    pushHistory(newCells, newHeights);
  }

  // History management
  function pushHistory(newCells, newHeights) {
    const snapshot = {
      cells: JSON.parse(JSON.stringify(newCells)),
      heights: JSON.parse(JSON.stringify(newHeights)),
    };
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(snapshot);
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  }

  function undo() {
    if (historyIndex > 0) {
      const prevState = history[historyIndex - 1];
      setCells(prevState.cells);
      setHeights(prevState.heights);
      setHistoryIndex(historyIndex - 1);
    }
  }

  function redo() {
    if (historyIndex < history.length - 1) {
      const nextState = history[historyIndex + 1];
      setCells(nextState.cells);
      setHeights(nextState.heights);
      setHistoryIndex(historyIndex + 1);
    }
  }

  // Save
  function handleSave() {
    const mapData = {
      ...map,
      cells,
      heights,
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
      alert('Please enter both Sprite ID and Type');
      return;
    }
    
    const newSprite = {
      id: spriteIdInput,
      type: spriteTypeInput,
      pos: [x, y, currentHeight],
      facing: spriteFacing
    };
    
    setSprites([...sprites, newSprite]);
    alert(`Sprite "${spriteIdInput}" added at [${x}, ${y}, ${currentHeight}]`);
  }
  
  // Remove sprite
  function removeSprite(index) {
    const newSprites = sprites.filter((_, i) => i !== index);
    setSprites(newSprites);
  }
  
  // Update sprite
  function updateSprite(index, updates) {
    const newSprites = [...sprites];
    newSprites[index] = { ...newSprites[index], ...updates };
    setSprites(newSprites);
  }
  
  // Add object to map
  function addObject(x, y) {
    if (!spriteTypeInput || !spriteIdInput) {
      alert('Please enter both Object ID and Type');
      return;
    }
    
    const newObject = {
      id: spriteIdInput,
      type: spriteTypeInput,
      pos: [x, y, currentHeight],
      facing: spriteFacing
    };
    
    setObjects([...objects, newObject]);
    alert(`Object "${spriteIdInput}" added at [${x}, ${y}, ${currentHeight}]`);
  }
  
  // Remove object
  function removeObject(index) {
    const newObjects = objects.filter((_, i) => i !== index);
    setObjects(newObjects);
  }
  
  // Update object
  function updateObject(index, updates) {
    const newObjects = [...objects];
    newObjects[index] = { ...newObjects[index], ...updates };
    setObjects(newObjects);
  }
  
  // Add animated tile
  function addAnimatedTile(x, y) {
    if (!spriteTypeInput) {
      alert('Please enter the Sprite Type for the animated tile');
      return;
    }
    
    const newAnimatedTile = {
      type: spriteTypeInput,
      pos: [x, y, currentHeight]
    };
    
    setAnimatedTiles([...animatedTiles, newAnimatedTile]);
    alert(`Animated tile added at [${x}, ${y}, ${currentHeight}]`);
  }
  
  // Remove animated tile
  function removeAnimatedTile(index) {
    const newTiles = animatedTiles.filter((_, i) => i !== index);
    setAnimatedTiles(newTiles);
  }

  // Get available tiles
  const tileOptions = tiles
    ? Object.keys(tiles)
      .sort()
      .map((key) => ({ label: key, value: key }))
    : [];

  // Show loading/error states
  if (!cells.length) {
    return (
      <div style={{ padding: '1rem', background: '#1e1e1e', color: '#d4d4d4', minHeight: '100vh' }}>
        <div style={{
          background: '#1a3a52',
          border: '1px solid #4fc1ff',
          borderRadius: '3px',
          padding: '10px',
          fontSize: '13px',
          color: '#4fc1ff'
        }}>
          ℹ️ No map data loaded. Please load a map from the package.
        </div>
      </div>
    );
  }

  if (!tiles || Object.keys(tiles).length === 0) {
    setError('Map loaded but tileset data is missing. 3D view will be empty. Expected tileset: ' + (map?.tileset || 'unknown'));
  }

  if (!geometry) {
    geometry = {};
  }

  return (
    <div style={{ 
      display: 'flex', 
      height: '100vh', 
      background: '#1e1e1e',
      color: '#d4d4d4',
      fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif"
    }}>
      {/* Sidebar */}
      <div style={{
        width: '320px',
        background: '#252526',
        borderRight: '1px solid #3e3e42',
        overflowY: 'auto',
        padding: '10px'
      }}>
        {/* Tools Section */}
        <div style={{
          background: '#2d2d30',
          border: '1px solid #3e3e42',
          borderRadius: '4px',
          marginBottom: '20px',
          overflow: 'hidden'
        }}>
          <div style={{
            background: '#37373d',
            padding: '10px',
            fontWeight: 'bold',
            borderBottom: '1px solid #3e3e42'
          }}>
            🎨 Tile Tools {editorMode !== 'tiles' && <span style={{ fontSize: '10px', color: '#888', fontWeight: 'normal' }}>(Tile mode only)</span>}
          </div>
          <div style={{ padding: '10px', opacity: editorMode === 'tiles' ? 1 : 0.5 }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '5px', marginBottom: '15px' }}>
              <button
                disabled={editorMode !== 'tiles'}
                style={{
                  background: currentTool === 'paint' ? '#1177bb' : '#0e639c',
                  color: 'white',
                  border: 'none',
                  padding: '8px 16px',
                  borderRadius: '3px',
                  cursor: editorMode === 'tiles' ? 'pointer' : 'not-allowed',
                  fontSize: '13px'
                }}
                onClick={() => editorMode === 'tiles' && setCurrentTool('paint')}
                onMouseOver={(e) => editorMode === 'tiles' && (e.target.style.background = '#1177bb')}
                onMouseOut={(e) => editorMode === 'tiles' && (e.target.style.background = currentTool === 'paint' ? '#1177bb' : '#0e639c')}
              >
                🖌️ Paint Tool
                <div style={{ fontSize: '10px', opacity: 0.8, marginTop: '2px' }}>Click to paint • Shift+Drag to paint multiple</div>
              </button>
              <button
                disabled={editorMode !== 'tiles'}
                style={{
                  background: currentTool === 'erase' ? '#1177bb' : '#0e639c',
                  color: 'white',
                  border: 'none',
                  padding: '8px 16px',
                  borderRadius: '3px',
                  cursor: editorMode === 'tiles' ? 'pointer' : 'not-allowed',
                  fontSize: '13px'
                }}
                onClick={() => editorMode === 'tiles' && setCurrentTool('erase')}
                onMouseOver={(e) => editorMode === 'tiles' && (e.target.style.background = '#1177bb')}
                onMouseOut={(e) => editorMode === 'tiles' && (e.target.style.background = currentTool === 'erase' ? '#1177bb' : '#0e639c')}
              >
                🗑️ Erase Tool
                <div style={{ fontSize: '10px', opacity: 0.8, marginTop: '2px' }}>Click to erase • Right-click also erases</div>
              </button>
              <button
                disabled={editorMode !== 'tiles'}
                style={{
                  background: currentTool === 'pick' ? '#1177bb' : '#0e639c',
                  color: 'white',
                  border: 'none',
                  padding: '8px 16px',
                  borderRadius: '3px',
                  cursor: editorMode === 'tiles' ? 'pointer' : 'not-allowed',
                  fontSize: '13px'
                }}
                onClick={() => editorMode === 'tiles' && setCurrentTool('pick')}
                onMouseOver={(e) => editorMode === 'tiles' && (e.target.style.background = '#1177bb')}
                onMouseOut={(e) => editorMode === 'tiles' && (e.target.style.background = currentTool === 'pick' ? '#1177bb' : '#0e639c')}
              >
                🔍 Pick Tool
                <div style={{ fontSize: '10px', opacity: 0.8, marginTop: '2px' }}>Click a tile to select it</div>
              </button>
              <button
                disabled={editorMode !== 'tiles'}
                style={{
                  background: currentTool === 'rectangle' ? '#1177bb' : '#0e639c',
                  color: 'white',
                  border: 'none',
                  padding: '8px 16px',
                  borderRadius: '3px',
                  cursor: editorMode === 'tiles' ? 'pointer' : 'not-allowed',
                  fontSize: '13px'
                }}
                onClick={() => editorMode === 'tiles' && setCurrentTool('rectangle')}
                onMouseOver={(e) => editorMode === 'tiles' && (e.target.style.background = '#1177bb')}
                onMouseOut={(e) => editorMode === 'tiles' && (e.target.style.background = currentTool === 'rectangle' ? '#1177bb' : '#0e639c')}
              >
                □ Rectangle Tool
                <div style={{ fontSize: '10px', opacity: 0.8, marginTop: '2px' }}>Click and drag to fill area</div>
              </button>
            </div>

            <div style={{ marginBottom: '12px' }}>
              <label style={{ display: 'block', marginBottom: '5px', fontSize: '12px', color: '#cccccc' }}>
                Selected Tile:
              </label>
              <select
                value={selectedTile}
                onChange={(e) => setSelectedTile(e.target.value)}
                style={{
                  background: '#3c3c3c',
                  color: '#d4d4d4',
                  border: '1px solid #3e3e42',
                  padding: '6px 8px',
                  borderRadius: '3px',
                  fontSize: '13px',
                  width: '100%'
                }}
              >
                {tileOptions.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>

            <div style={{ marginBottom: '12px' }}>
              <label style={{ display: 'block', marginBottom: '5px', fontSize: '12px', color: '#cccccc' }}>
                Height:
              </label>
              <div style={{ display: 'flex', gap: '5px', alignItems: 'center' }}>
                <button
                  onClick={() => {
                    setCurrentHeight(prev => Math.round((prev - 0.5) * 2) / 2);
                  }}
                  style={{
                    background: '#3e3e42',
                    color: 'white',
                    border: 'none',
                    padding: '6px 12px',
                    borderRadius: '3px',
                    cursor: 'pointer',
                    fontSize: '16px'
                  }}
                >
                  −
                </button>
                <input
                  type="number"
                  value={currentHeight}
                  onChange={(e) => setCurrentHeight(parseFloat(e.target.value) || 0)}
                  step={0.5}
                  style={{
                    flex: 1,
                    background: '#3c3c3c',
                    color: '#d4d4d4',
                    border: '1px solid #3e3e42',
                    padding: '6px 8px',
                    borderRadius: '3px',
                    fontSize: '13px',
                    textAlign: 'center'
                  }}
                />
                <button
                  onClick={() => {
                    setCurrentHeight(prev => Math.round((prev + 0.5) * 2) / 2);
                  }}
                  style={{
                    background: '#3e3e42',
                    color: 'white',
                    border: 'none',
                    padding: '6px 12px',
                    borderRadius: '3px',
                    cursor: 'pointer',
                    fontSize: '16px'
                  }}
                >
                  +
                </button>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
              <button
                onClick={handleSave}
                style={{
                  background: '#0e639c',
                  color: 'white',
                  border: 'none',
                  padding: '8px 16px',
                  borderRadius: '3px',
                  cursor: 'pointer',
                  fontSize: '13px'
                }}
                onMouseOver={(e) => e.target.style.background = '#1177bb'}
                onMouseOut={(e) => e.target.style.background = '#0e639c'}
              >
                💾 Save Changes
              </button>
              <button
                onClick={undo}
                disabled={historyIndex <= 0}
                style={{
                  background: historyIndex <= 0 ? '#3e3e42' : '#0e639c',
                  color: historyIndex <= 0 ? '#888' : 'white',
                  border: 'none',
                  padding: '8px 16px',
                  borderRadius: '3px',
                  cursor: historyIndex <= 0 ? 'not-allowed' : 'pointer',
                  fontSize: '13px'
                }}
                onMouseOver={(e) => { if (historyIndex > 0) e.target.style.background = '#1177bb'; }}
                onMouseOut={(e) => { if (historyIndex > 0) e.target.style.background = '#0e639c'; }}
              >
                ↶ Undo
              </button>
              <button
                onClick={redo}
                disabled={historyIndex >= history.length - 1}
                style={{
                  background: historyIndex >= history.length - 1 ? '#3e3e42' : '#0e639c',
                  color: historyIndex >= history.length - 1 ? '#888' : 'white',
                  border: 'none',
                  padding: '8px 16px',
                  borderRadius: '3px',
                  cursor: historyIndex >= history.length - 1 ? 'not-allowed' : 'pointer',
                  fontSize: '13px'
                }}
                onMouseOver={(e) => { if (historyIndex < history.length - 1) e.target.style.background = '#1177bb'; }}
                onMouseOut={(e) => { if (historyIndex < history.length - 1) e.target.style.background = '#0e639c'; }}
              >
                ↷ Redo
              </button>
            </div>
          </div>
        </div>

        {/* Mode Selector */}
        <div style={{
          background: '#2d2d30',
          border: '1px solid #3e3e42',
          borderRadius: '4px',
          marginBottom: '20px',
          overflow: 'hidden'
        }}>
          <div style={{
            background: '#37373d',
            padding: '10px',
            fontWeight: 'bold',
            borderBottom: '1px solid #3e3e42'
          }}>
            🎯 Editor Mode
          </div>
          <div style={{ padding: '10px', display: 'flex', flexDirection: 'column', gap: '5px' }}>
            <button
              style={{
                background: editorMode === 'tiles' ? '#1177bb' : '#3e3e42',
                color: 'white',
                border: 'none',
                padding: '8px 12px',
                borderRadius: '3px',
                cursor: 'pointer',
                fontSize: '12px',
                textAlign: 'left'
              }}
              onClick={() => setEditorMode('tiles')}
            >
              <div>🟦 Tile Mode</div>
              <div style={{ fontSize: '10px', color: '#ccc', marginTop: '2px' }}>Click to paint/erase • {cells.length} x {cells[0]?.length || 0} cells</div>
            </button>
            <button
              style={{
                background: editorMode === 'sprites' ? '#1177bb' : '#3e3e42',
                color: 'white',
                border: 'none',
                padding: '8px 12px',
                borderRadius: '3px',
                cursor: 'pointer',
                fontSize: '12px',
                textAlign: 'left'
              }}
              onClick={() => setEditorMode('sprites')}
            >
              <div>🎭 Sprite Mode</div>
              <div style={{ fontSize: '10px', color: '#ccc', marginTop: '2px' }}>Click to place • {sprites.length} sprites</div>
            </button>
            <button
              style={{
                background: editorMode === 'objects' ? '#1177bb' : '#3e3e42',
                color: 'white',
                border: 'none',
                padding: '8px 12px',
                borderRadius: '3px',
                cursor: 'pointer',
                fontSize: '12px',
                textAlign: 'left'
              }}
              onClick={() => setEditorMode('objects')}
            >
              <div>📦 Object Mode</div>
              <div style={{ fontSize: '10px', color: '#ccc', marginTop: '2px' }}>Click to place • {objects.length} objects</div>
            </button>
            <button
              style={{
                background: editorMode === 'animatedTiles' ? '#1177bb' : '#3e3e42',
                color: 'white',
                border: 'none',
                padding: '8px 12px',
                borderRadius: '3px',
                cursor: 'pointer',
                fontSize: '12px',
                textAlign: 'left'
              }}
              onClick={() => setEditorMode('animatedTiles')}
            >
              <div>✨ Animated Tile Mode</div>
              <div style={{ fontSize: '10px', color: '#ccc', marginTop: '2px' }}>Click to place • {animatedTiles.length} animated tiles</div>
            </button>
            <button
              style={{
                background: editorMode === 'triggers' ? '#1177bb' : '#3e3e42',
                color: 'white',
                border: 'none',
                padding: '8px 12px',
                borderRadius: '3px',
                cursor: 'pointer',
                fontSize: '12px',
                textAlign: 'left'
              }}
              onClick={() => setEditorMode('triggers')}
            >
              ⚡ Triggers & Scripts
            </button>
            <button
              style={{
                background: editorMode === 'lights' ? '#1177bb' : '#3e3e42',
                color: 'white',
                border: 'none',
                padding: '8px 12px',
                borderRadius: '3px',
                cursor: 'pointer',
                fontSize: '12px',
                textAlign: 'left'
              }}
              onClick={() => setEditorMode('lights')}
            >
              💡 Lights ({lights.length})
            </button>
          </div>
        </div>

        {/* Sprites/Objects Editor */}
        {(editorMode === 'sprites' || editorMode === 'objects') && (
          <div style={{
            background: '#2d2d30',
            border: '1px solid #3e3e42',
            borderRadius: '4px',
            marginBottom: '20px',
            overflow: 'hidden'
          }}>
            <div style={{
              background: '#37373d',
              padding: '10px',
              fontWeight: 'bold',
              borderBottom: '1px solid #3e3e42'
            }}>
              {editorMode === 'sprites' ? '🎭 Sprite Placement' : '📦 Object Placement'}
            </div>
            <div style={{ padding: '10px' }}>
              <div style={{ marginBottom: '10px', fontSize: '11px', color: '#4ec9b0', background: '#1e3a32', padding: '8px', borderRadius: '3px', border: '1px solid #2d5a4a' }}>
                <strong>➤ Click on map to place {editorMode === 'sprites' ? 'sprite' : 'object'}</strong><br/>
                <span style={{ fontSize: '10px', color: '#8ec9b0' }}>• Select type and facing below, then click on any tile</span>
              </div>
              
              <div style={{ marginBottom: '10px' }}>
                <label style={{ display: 'block', marginBottom: '5px', fontSize: '12px' }}>ID:</label>
                <input
                  type="text"
                  value={spriteIdInput}
                  onChange={(e) => setSpriteIdInput(e.target.value)}
                  placeholder="e.g., avatar, chest1"
                  style={{
                    width: '100%',
                    background: '#3c3c3c',
                    color: '#d4d4d4',
                    border: '1px solid #3e3e42',
                    padding: '6px 8px',
                    borderRadius: '3px',
                    fontSize: '12px'
                  }}
                />
              </div>
              
              <div style={{ marginBottom: '10px' }}>
                <label style={{ display: 'block', marginBottom: '5px', fontSize: '12px' }}>Type:</label>
                {availableSprites.length > 0 || editorMode === 'objects' && availableObjects.length > 0 ? (
                  <select
                    value={spriteTypeInput}
                    onChange={(e) => setSpriteTypeInput(e.target.value)}
                    style={{
                      width: '100%',
                      background: '#3c3c3c',
                      color: '#d4d4d4',
                      border: '1px solid #3e3e42',
                      padding: '6px 8px',
                      borderRadius: '3px',
                      fontSize: '12px'
                    }}
                  >
                    <option value="">-- Select Type --</option>
                    {(editorMode === 'sprites' ? availableSprites : availableObjects).map(type => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                ) : (
                  <>
                    <input
                      type="text"
                      value={spriteTypeInput}
                      onChange={(e) => setSpriteTypeInput(e.target.value)}
                      placeholder="e.g., characters/male, furniture/chest"
                      style={{
                        width: '100%',
                        background: '#3c3c3c',
                        color: '#d4d4d4',
                        border: '1px solid #3e3e42',
                        padding: '6px 8px',
                        borderRadius: '3px',
                        fontSize: '12px'
                      }}
                    />
                    <div style={{ fontSize: '10px', color: '#888', marginTop: '3px' }}>
                      No {editorMode === 'sprites' ? 'sprites' : 'objects'} found in package. Enter manually.
                    </div>
                  </>
                )}
              </div>
              
              <div style={{ marginBottom: '10px' }}>
                <label style={{ display: 'block', marginBottom: '5px', fontSize: '12px' }}>Facing:</label>
                <select
                  value={spriteFacing}
                  onChange={(e) => setSpriteFacing(e.target.value)}
                  style={{
                    width: '100%',
                    background: '#3c3c3c',
                    color: '#d4d4d4',
                    border: '1px solid #3e3e42',
                    padding: '6px 8px',
                    borderRadius: '3px',
                    fontSize: '12px'
                  }}
                >
                  <option value="Down">Down</option>
                  <option value="Up">Up</option>
                  <option value="Left">Left</option>
                  <option value="Right">Right</option>
                </select>
              </div>
              
              <div style={{ marginTop: '15px', borderTop: '1px solid #3e3e42', paddingTop: '10px' }}>
                <div style={{ fontWeight: 'bold', marginBottom: '8px', fontSize: '12px' }}>
                  Placed {editorMode === 'sprites' ? 'Sprites' : 'Objects'}:
                </div>
                <div style={{ maxHeight: '200px', overflowY: 'auto' }}>
                  {(editorMode === 'sprites' ? sprites : objects).map((item, idx) => (
                    <div key={idx} style={{
                      background: '#1e1e1e',
                      padding: '8px',
                      marginBottom: '5px',
                      borderRadius: '3px',
                      fontSize: '11px'
                    }}>
                      <div style={{ fontWeight: 'bold', marginBottom: '3px' }}>{item.id}</div>
                      <div style={{ color: '#888' }}>Type: {item.type}</div>
                      <div style={{ color: '#888' }}>Pos: [{item.pos.join(', ')}]</div>
                      <div style={{ color: '#888' }}>Facing: {item.facing}</div>
                      <button
                        onClick={() => editorMode === 'sprites' ? removeSprite(idx) : removeObject(idx)}
                        style={{
                          marginTop: '5px',
                          background: '#5a1d1d',
                          color: '#f48771',
                          border: 'none',
                          padding: '4px 8px',
                          borderRadius: '2px',
                          cursor: 'pointer',
                          fontSize: '10px'
                        }}
                      >
                        🗑️ Remove
                      </button>
                    </div>
                  ))}
                  {(editorMode === 'sprites' ? sprites : objects).length === 0 && (
                    <div style={{ color: '#888', fontSize: '11px', fontStyle: 'italic' }}>
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
          <div style={{
            background: '#2d2d30',
            border: '1px solid #3e3e42',
            borderRadius: '4px',
            marginBottom: '20px',
            overflow: 'hidden'
          }}>
            <div style={{
              background: '#37373d',
              padding: '10px',
              fontWeight: 'bold',
              borderBottom: '1px solid #3e3e42'
            }}>
              ✨ Animated Tile Placement
            </div>
            <div style={{ padding: '10px' }}>
              <div style={{ marginBottom: '10px', fontSize: '11px', color: '#ce9178', background: '#3a2a1e', padding: '8px', borderRadius: '3px', border: '1px solid #5a4a3e' }}>
                <strong>➤ Click on map to place animated tile</strong><br/>
                <span style={{ fontSize: '10px', color: '#daa178' }}>• Select sprite type below, then click on any tile</span>
              </div>
              
              <div style={{ marginBottom: '10px' }}>
                <label style={{ display: 'block', marginBottom: '5px', fontSize: '12px' }}>Sprite Type:</label>
                {availableSprites.length > 0 ? (
                  <select
                    value={spriteTypeInput}
                    onChange={(e) => setSpriteTypeInput(e.target.value)}
                    style={{
                      width: '100%',
                      background: '#3c3c3c',
                      color: '#d4d4d4',
                      border: '1px solid #3e3e42',
                      padding: '6px 8px',
                      borderRadius: '3px',
                      fontSize: '12px'
                    }}
                  >
                    <option value="">-- Select Sprite Type --</option>
                    {availableSprites.map(type => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                ) : (
                  <>
                    <input
                      type="text"
                      value={spriteTypeInput}
                      onChange={(e) => setSpriteTypeInput(e.target.value)}
                      placeholder="e.g., effects/spurt, effects/fire"
                      style={{
                        width: '100%',
                        background: '#3c3c3c',
                        color: '#d4d4d4',
                        border: '1px solid #3e3e42',
                        padding: '6px 8px',
                        borderRadius: '3px',
                        fontSize: '12px'
                      }}
                    />
                    <div style={{ fontSize: '10px', color: '#888', marginTop: '3px' }}>
                      No sprites found in package. Enter manually.
                    </div>
                  </>
                )}
              </div>
              
              <div style={{ marginTop: '15px', borderTop: '1px solid #3e3e42', paddingTop: '10px' }}>
                <div style={{ fontWeight: 'bold', marginBottom: '8px', fontSize: '12px' }}>
                  Placed Animated Tiles:
                </div>
                <div style={{ maxHeight: '200px', overflowY: 'auto' }}>
                  {animatedTiles.map((tile, idx) => (
                    <div key={idx} style={{
                      background: '#1e1e1e',
                      padding: '8px',
                      marginBottom: '5px',
                      borderRadius: '3px',
                      fontSize: '11px'
                    }}>
                      <div style={{ fontWeight: 'bold', marginBottom: '3px' }}>Tile #{idx + 1}</div>
                      <div style={{ color: '#888' }}>Type: {tile.type}</div>
                      <div style={{ color: '#888' }}>Pos: [{tile.pos.join(', ')}]</div>
                      <button
                        onClick={() => removeAnimatedTile(idx)}
                        style={{
                          marginTop: '5px',
                          background: '#5a1d1d',
                          color: '#f48771',
                          border: 'none',
                          padding: '4px 8px',
                          borderRadius: '2px',
                          cursor: 'pointer',
                          fontSize: '10px'
                        }}
                      >
                        🗑️ Remove
                      </button>
                    </div>
                  ))}
                  {animatedTiles.length === 0 && (
                    <div style={{ color: '#888', fontSize: '11px', fontStyle: 'italic' }}>
                      No animated tiles placed yet
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Triggers Editor */}
        {editorMode === 'triggers' && (
          <div style={{
            background: '#2d2d30',
            border: '1px solid #3e3e42',
            borderRadius: '4px',
            marginBottom: '20px',
            overflow: 'hidden'
          }}>
            <div style={{
              background: '#37373d',
              padding: '10px',
              fontWeight: 'bold',
              borderBottom: '1px solid #3e3e42'
            }}>
              ⚡ Triggers & Scripts
            </div>
            <div style={{ padding: '10px' }}>
              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', marginBottom: '5px', fontSize: '12px' }}>
                  Select Trigger (tile click):
                </label>
                <input
                  type="text"
                  value={triggers.selectTrigger}
                  onChange={(e) => setTriggers({ ...triggers, selectTrigger: e.target.value })}
                  placeholder="e.g., tile/select_test"
                  style={{
                    width: '100%',
                    background: '#3c3c3c',
                    color: '#d4d4d4',
                    border: '1px solid #3e3e42',
                    padding: '6px 8px',
                    borderRadius: '3px',
                    fontSize: '12px'
                  }}
                />
                <div style={{ fontSize: '10px', color: '#888', marginTop: '3px' }}>
                  Lua script path (relative to triggers/)
                </div>
              </div>
              
              <div style={{ marginTop: '15px', borderTop: '1px solid #3e3e42', paddingTop: '10px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <div style={{ fontWeight: 'bold', fontSize: '12px' }}>Scripts (on load):</div>
                  <button
                    onClick={() => {
                      const newScript = { id: `script-${Date.now()}`, trigger: '' };
                      setTriggers({ ...triggers, scripts: [...triggers.scripts, newScript] });
                    }}
                    style={{
                      background: '#0e639c',
                      color: 'white',
                      border: 'none',
                      padding: '4px 8px',
                      borderRadius: '2px',
                      cursor: 'pointer',
                      fontSize: '10px'
                    }}
                  >
                    + Add
                  </button>
                </div>
                <div style={{ maxHeight: '200px', overflowY: 'auto' }}>
                  {triggers.scripts.map((script, idx) => (
                    <div key={idx} style={{
                      background: '#1e1e1e',
                      padding: '8px',
                      marginBottom: '5px',
                      borderRadius: '3px'
                    }}>
                      <div style={{ marginBottom: '5px' }}>
                        <label style={{ fontSize: '10px', color: '#888' }}>ID:</label>
                        <input
                          type="text"
                          value={script.id}
                          onChange={(e) => {
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
                            marginTop: '2px'
                          }}
                        />
                      </div>
                      <div style={{ marginBottom: '5px' }}>
                        <label style={{ fontSize: '10px', color: '#888' }}>Trigger:</label>
                        <input
                          type="text"
                          value={script.trigger}
                          onChange={(e) => {
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
                            marginTop: '2px'
                          }}
                        />
                      </div>
                      <button
                        onClick={() => {
                          const newScripts = triggers.scripts.filter((_, i) => i !== idx);
                          setTriggers({ ...triggers, scripts: newScripts });
                        }}
                        style={{
                          background: '#5a1d1d',
                          color: '#f48771',
                          border: 'none',
                          padding: '4px 8px',
                          borderRadius: '2px',
                          cursor: 'pointer',
                          fontSize: '10px'
                        }}
                      >
                        🗑️ Remove
                      </button>
                    </div>
                  ))}
                  {triggers.scripts.length === 0 && (
                    <div style={{ color: '#888', fontSize: '11px', fontStyle: 'italic' }}>
                      No scripts configured
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tiles Section */}
        <div style={{
          background: '#2d2d30',
          border: '1px solid #3e3e42',
          borderRadius: '4px',
          marginBottom: '20px',
          overflow: 'hidden'
        }}>
          <div style={{
            background: '#37373d',
            padding: '10px',
            fontWeight: 'bold',
            borderBottom: '1px solid #3e3e42',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <span>🎨 Tiles ({Object.keys(tiles || {}).length})</span>
            <button
              onClick={() => setShowTileEditor(!showTileEditor)}
              style={{
                background: showTileEditor ? '#0e639c' : '#505050',
                border: 'none',
                color: 'white',
                padding: '4px 8px',
                borderRadius: '3px',
                cursor: 'pointer',
                fontSize: '10px'
              }}
              title="Toggle inline tile editor"
            >
              {showTileEditor ? '✕ Close' : '✏️ Edit'}
            </button>
          </div>
          <div style={{ padding: '10px' }}>
            {/* Inline Tile Editor Panel */}
            {showTileEditor && editingTileName && tiles[editingTileName] && (
              <div style={{
                background: '#252526',
                border: '1px solid #0e639c',
                borderRadius: '4px',
                padding: '10px',
                marginBottom: '10px'
              }}>
                <div style={{ 
                  fontWeight: 'bold', 
                  color: '#7dd3fc', 
                  marginBottom: '8px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <span>Editing: {editingTileName}</span>
                  <button
                    onClick={() => setEditingTileName(null)}
                    style={{
                      background: 'transparent',
                      border: 'none',
                      color: '#888',
                      cursor: 'pointer',
                      fontSize: '14px'
                    }}
                  >✕</button>
                </div>
                <div style={{ fontSize: '10px', color: '#888', marginBottom: '8px' }}>
                  Layers: {Math.floor(tiles[editingTileName].length / 3)}
                </div>
                <div style={{ maxHeight: '120px', overflowY: 'auto' }}>
                  {(() => {
                    const arr = tiles[editingTileName];
                    const layers = [];
                    for (let i = 0; i < arr.length; i += 3) {
                      layers.push({ geom: arr[i], tex: arr[i+1], z: arr[i+2] });
                    }
                    return layers.map((layer, idx) => (
                      <div key={idx} style={{
                        display: 'grid',
                        gridTemplateColumns: '60px 60px 40px',
                        gap: '4px',
                        marginBottom: '4px',
                        fontSize: '9px',
                        background: '#2d2d30',
                        padding: '4px',
                        borderRadius: '2px'
                      }}>
                        <span title="Geometry" style={{ color: '#a78bfa', overflow: 'hidden', textOverflow: 'ellipsis' }}>{layer.geom}</span>
                        <span title="Texture" style={{ color: '#7dd3fc', overflow: 'hidden', textOverflow: 'ellipsis' }}>{layer.tex}</span>
                        <span title="Z-Offset" style={{ color: '#fbbf24' }}>z:{layer.z}</span>
                      </div>
                    ));
                  })()}
                </div>
                <div style={{ fontSize: '9px', color: '#ce9178', marginTop: '6px' }}>
                  💡 For full editing, open tiles.json in the sidebar
                </div>
              </div>
            )}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(70px, 1fr))',
              gap: '8px',
              maxHeight: '200px',
              overflowY: 'auto',
              marginBottom: '10px'
            }}>
              {Object.keys(tiles || {}).sort().map(tileName => (
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
                    position: 'relative'
                  }}
                  onMouseOver={(e) => {
                    if (selectedTile !== tileName) {
                      e.currentTarget.style.borderColor = '#0e639c';
                    }
                  }}
                  onMouseOut={(e) => {
                    if (selectedTile !== tileName) {
                      e.currentTarget.style.borderColor = editingTileName === tileName ? '#a78bfa' : '#3e3e42';
                    }
                  }}
                >
                  <div>{tileName}</div>
                  <div style={{ 
                    fontSize: '8px', 
                    color: '#888', 
                    marginTop: '2px'
                  }}>
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
        <div style={{
          background: '#2d2d30',
          border: '1px solid #3e3e42',
          borderRadius: '4px',
          marginBottom: '20px',
          overflow: 'hidden'
        }}>
          <div style={{
            background: '#37373d',
            padding: '10px',
            fontWeight: 'bold',
            borderBottom: '1px solid #3e3e42',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <span>📐 Geometry ({Object.keys(geometry || {}).length})</span>
          </div>
          <div style={{ padding: '10px' }}>
            {/* Inline Geometry Inspector */}
            {editingGeometryName && geometry[editingGeometryName] && (
              <div style={{
                background: '#1e1e2e',
                border: '1px solid #a78bfa',
                borderRadius: '4px',
                padding: '10px',
                marginBottom: '10px'
              }}>
                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center',
                  marginBottom: '10px',
                  borderBottom: '1px solid #3e3e42',
                  paddingBottom: '8px'
                }}>
                  <span style={{ fontWeight: 'bold', color: '#a78bfa' }}>🔍 {editingGeometryName}</span>
                  <button
                    onClick={() => setEditingGeometryName(null)}
                    style={{ background: '#333', border: '1px solid #555', color: '#fff', padding: '2px 8px', borderRadius: '3px', cursor: 'pointer' }}
                  >×</button>
                </div>
                <div style={{ fontSize: '11px', color: '#aaa' }}>
                  Vertices: {geometry[editingGeometryName]?.vertices?.length || 0} | 
                  Surfaces: {geometry[editingGeometryName]?.surfaces?.length || 0} | 
                  Type: {geometry[editingGeometryName]?.type_bitmask || 0}
                </div>
                {geometry[editingGeometryName]?.vertices && (
                  <div style={{ marginTop: '8px', fontSize: '10px', color: '#888' }}>
                    {geometry[editingGeometryName].vertices.slice(0, 6).map((v, i) => (
                      <div key={i} style={{ fontFamily: 'monospace' }}>
                        v{i}: [{v.map(n => n.toFixed(2)).join(', ')}]
                      </div>
                    ))}
                    {geometry[editingGeometryName].vertices.length > 6 && (
                      <div style={{ fontStyle: 'italic' }}>... {geometry[editingGeometryName].vertices.length - 6} more</div>
                    )}
                  </div>
                )}
              </div>
            )}
            <div style={{ maxHeight: '150px', overflowY: 'auto', marginBottom: '10px' }}>
              {Object.keys(geometry || {}).sort().map(geomName => (
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
                    border: `2px solid ${editingGeometryName === geomName ? '#a78bfa' : '#3e3e42'}`
                  }}
                  onMouseOver={(e) => {
                    if (editingGeometryName !== geomName) {
                      e.currentTarget.style.borderColor = '#0e639c';
                    }
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.borderColor = editingGeometryName === geomName ? '#a78bfa' : '#3e3e42';
                  }}
                >
                  <span>{geomName}</span>
                  <span style={{ color: '#888', fontSize: '10px' }}>
                    {geometry[geomName]?.vertices?.length || 0} △
                  </span>
                </div>
              ))}
            </div>
            <div style={{ fontSize: '11px', color: '#888' }}>
              Click to inspect geometry details
            </div>
          </div>
        </div>

        {/* Texture Preview Section */}
        {textureAtlas && (
          <div style={{
            background: '#2d2d30',
            border: '1px solid #3e3e42',
            borderRadius: '4px',
            marginBottom: '20px',
            overflow: 'hidden'
          }}>
            <div style={{
              background: '#37373d',
              padding: '10px',
              fontWeight: 'bold',
              borderBottom: '1px solid #3e3e42'
            }}>
              🖼️ Texture Atlas
            </div>
            <div style={{ padding: '10px' }}>
              <div style={{
                width: '100%',
                height: '150px',
                background: '#1e1e1e',
                border: '1px solid #3e3e42',
                borderRadius: '3px',
                overflow: 'hidden',
                position: 'relative'
              }}>
                <img
                  src={textureAtlas}
                  alt="Texture Atlas"
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'contain',
                    imageRendering: 'pixelated'
                  }}
                />
              </div>
              <div style={{ fontSize: '10px', color: '#888', marginTop: '5px' }}>
                Tile size: {tileset?.tileSize || 16}px | 
                Sheet: {tileset?.sheetSize?.[0] || 512}×{tileset?.sheetSize?.[1] || 512}
              </div>
            </div>
          </div>
        )}

        {/* Map Settings Section */}
        <div style={{
          background: '#2d2d30',
          border: '1px solid #3e3e42',
          borderRadius: '4px',
          marginBottom: '20px',
          overflow: 'hidden'
        }}>
          <div style={{
            background: '#37373d',
            padding: '10px',
            fontWeight: 'bold',
            borderBottom: '1px solid #3e3e42'
          }}>
            ⚙️ Map Settings
          </div>
          <div style={{ padding: '10px' }}>
            <div style={{ marginBottom: '10px' }}>
              <label style={{ display: 'block', marginBottom: '5px', fontSize: '12px', color: '#cccccc' }}>
                Expected Tileset:
              </label>
              <div style={{
                background: '#3c3c3c',
                padding: '6px 8px',
                borderRadius: '3px',
                fontSize: '11px',
                border: '1px solid #3e3e42'
              }}>
                {map?.tileset || 'unknown'}
              </div>
            </div>
            <div style={{ marginBottom: '10px' }}>
              <label style={{ display: 'block', marginBottom: '5px', fontSize: '12px', color: '#cccccc' }}>
                Current Size:
              </label>
              <div style={{
                background: '#3c3c3c',
                padding: '6px 8px',
                borderRadius: '3px',
                fontSize: '11px',
                border: '1px solid #3e3e42'
              }}>
                {cells[0]?.length || 0} × {cells.length} cells
              </div>
            </div>
            <div style={{ marginBottom: '10px' }}>
              <label style={{ display: 'block', marginBottom: '5px', fontSize: '12px', color: '#cccccc' }}>
                Map Width:
              </label>
              <input
                type="number"
                value={newMapWidth}
                onChange={(e) => setNewMapWidth(parseInt(e.target.value) || 1)}
                min="1"
                style={{
                  background: '#3c3c3c',
                  color: '#d4d4d4',
                  border: '1px solid #3e3e42',
                  padding: '6px 8px',
                  borderRadius: '3px',
                  fontSize: '13px',
                  width: '100%'
                }}
              />
            </div>
            <div style={{ marginBottom: '10px' }}>
              <label style={{ display: 'block', marginBottom: '5px', fontSize: '12px', color: '#cccccc' }}>
                Map Height:
              </label>
              <input
                type="number"
                value={newMapHeight}
                onChange={(e) => setNewMapHeight(parseInt(e.target.value) || 1)}
                min="1"
                style={{
                  background: '#3c3c3c',
                  color: '#d4d4d4',
                  border: '1px solid #3e3e42',
                  padding: '6px 8px',
                  borderRadius: '3px',
                  fontSize: '13px',
                  width: '100%'
                }}
              />
            </div>
            <div style={{ display: 'flex', gap: '5px' }}>
              <button
                onClick={() => resizeMap(newMapWidth, newMapHeight)}
                style={{
                  flex: 1,
                  background: '#0e639c',
                  color: 'white',
                  border: 'none',
                  padding: '8px 12px',
                  borderRadius: '3px',
                  cursor: 'pointer',
                  fontSize: '12px'
                }}
                onMouseOver={(e) => e.target.style.background = '#1177bb'}
                onMouseOut={(e) => e.target.style.background = '#0e639c'}
              >
                Resize
              </button>
              <button
                onClick={() => {
                  if (confirm('Clear entire map?')) {
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
                  fontSize: '12px'
                }}
                onMouseOver={(e) => e.target.style.background = '#4e4e52'}
                onMouseOut={(e) => e.target.style.background = '#3e3e42'}
              >
                Clear
              </button>
            </div>
          </div>
        </div>

        {/* Help Section */}
        <div style={{
          background: '#2d2d30',
          border: '1px solid #3e3e42',
          borderRadius: '4px',
          marginBottom: '20px',
          overflow: 'hidden'
        }}>
          <div style={{
            background: '#37373d',
            padding: '10px',
            fontWeight: 'bold',
            borderBottom: '1px solid #3e3e42'
          }}>
            ❓ Help
          </div>
          <div style={{ padding: '10px', fontSize: '11px', lineHeight: '1.6' }}>
            <strong>Keyboard Shortcuts:</strong><br />
            <code style={{ background: '#1e1e1e', padding: '2px 4px', borderRadius: '2px' }}>P</code> - Paint tool<br />
            <code style={{ background: '#1e1e1e', padding: '2px 4px', borderRadius: '2px' }}>E</code> - Erase tool<br />
            <code style={{ background: '#1e1e1e', padding: '2px 4px', borderRadius: '2px' }}>I</code> - Pick tool<br />
            <code style={{ background: '#1e1e1e', padding: '2px 4px', borderRadius: '2px' }}>R</code> - Reset camera<br />
            <br />
            <strong>Visual Markers:</strong><br />
            <span style={{ color: '#4fc14f' }}>🟢 Green cube</span> - Sprite<br />
            <span style={{ color: '#4f9fcf' }}>🔵 Blue cube</span> - Object<br />
            <span style={{ color: '#e5c14f' }}>🟡 Yellow cube</span> - Animated Tile<br />
            <br />
            <strong>Editing:</strong><br />
            • <strong>Shift+Click</strong> - Paint<br />
            • <strong>Shift+Right-Click</strong> - Erase<br />
            • Regular drag rotates camera<br />
            • Middle mouse pans<br />
            • Scroll wheel zooms<br />
            • Rectangle tool: Click and drag to select area, release to fill
          </div>
        </div>
      </div>

      {/* Main content */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        {/* Toolbar */}
        <div style={{
          background: '#2d2d30',
          borderBottom: '1px solid #3e3e42',
          padding: '10px',
          display: 'flex',
          gap: '10px',
          alignItems: 'center'
        }}>
          <span style={{ fontSize: '13px', color: '#cccccc' }}>
            Drag to rotate • Middle mouse to pan • Scroll to zoom
          </span>
        </div>

        {/* Canvas */}
        <div style={{ flex: 1, position: 'relative', background: '#1e1e1e' }}>
          {error && (
            <div style={{
              position: 'absolute',
              top: 10,
              left: 10,
              right: 10,
              background: '#5a1d1d',
              border: '1px solid #be1100',
              borderRadius: '3px',
              padding: '10px',
              zIndex: 100,
              fontSize: '13px',
              color: '#f48771'
            }}>
              {error}
            </div>
          )}
          <WebGL3DCanvas
            onRender={handleRender}
            onInit={handleWebGLInit}
            onCellClick={handleCellClick}
            onCellHover={handleCellHover}
            onMouseUp={() => {
              setIsPainting(false);
              setLastPaintedCell(null);
              // Handle rectangle fill on mouse up
              if (isSelectingRectangle && rectangleStart && rectangleEnd) {
                fillRectangle(rectangleStart, rectangleEnd);
                setIsSelectingRectangle(false);
                setRectangleStart(null);
                setRectangleEnd(null);
              }
            }}
            showControls={false}
            initialCamera={{
              distance: 25,
              angleX: -0.6,
              angleY: 0.5,
              centerX: (cells[0]?.length || 0) / 2,
              centerY: cells.length / 2,
              centerZ: 0,
            }}
          />
        </div>

        {/* Status bar */}
        <div style={{
          background: '#007acc',
          color: 'white',
          padding: '4px 10px',
          fontSize: '12px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <span>
            Mode: {editorMode} | Tool: {currentTool} | Tile: {selectedTile} | Height: {currentHeight.toFixed(1)}
          </span>
          <span>
            {hoveredCell ? `Cell: ${hoveredCell.x}, ${hoveredCell.y}` : 'Ready'} | 
            Sprites: {sprites.length} | Objects: {objects.length} | Animated: {animatedTiles.length}
          </span>
        </div>
      </div>
    </div>
  );
}

export default collect(MapEditor);
