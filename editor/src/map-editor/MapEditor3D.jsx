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
function MapEditor({ content, onSave, tileset, geometry, tiles, textureAtlas }) {
  // Map state
  const [map, setMap] = useState(null);
  const [cells, setCells] = useState([]);
  const [heights, setHeights] = useState([]);
  
  // UI state
  const [selectedTile, setSelectedTile] = useState('FLOOR');
  const [currentTool, setCurrentTool] = useState('paint'); // 'paint', 'erase', 'pick'
  const [currentHeight, setCurrentHeight] = useState(0);
  const [showGrid, setShowGrid] = useState(true);
  const [error, setError] = useState(null);
  
  // History
  const [history, setHistory] = useState([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  
  // WebGL state
  const glRef = useRef(null);
  const shaderProgramRef = useRef(null);
  const textureRef = useRef(null);
  const [hoveredCell, setHoveredCell] = useState(null);

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
    if (!textureAtlas || !glRef.current) return;
    
    console.log('[MapEditor3D] Loading texture atlas:', textureAtlas.substring(0, 50) + '...');
    const img = new Image();
    img.onload = () => {
      console.log('[MapEditor3D] Texture image loaded:', img.width, 'x', img.height);
      if (glRef.current) {
        textureRef.current = createTextureFromImage(glRef.current, img);
        console.log('[MapEditor3D] WebGL texture created:', textureRef.current);
      }
    };
    img.onerror = (e) => {
      console.error('[MapEditor3D] Failed to load texture:', e);
    };
    img.src = textureAtlas;
  }, [textureAtlas]);

  // Initialize WebGL program
  const handleWebGLInit = useCallback((gl) => {
    glRef.current = gl;
    
    // Create shader program
    const program = createProgram(gl, defaultVertexShader, defaultFragmentShader);
    if (program) {
      shaderProgramRef.current = program;
    }
  }, []);

  // Render callback for WebGL3DCanvas
  const handleRender = useCallback(
    (gl, projectionMatrix, viewMatrix, camera, showGridFlag) => {
      if (!shaderProgramRef.current || !cells.length) return;

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

      // Debug: Log texture state once
      if (!window._textureDebugLogged && textureRef.current) {
        console.log('[MapEditor3D] Rendering with texture:', textureRef.current);
        window._textureDebugLogged = true;
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
            uUseTexture,
            uColor,
            uTexture
          );
        }
      }
    },
    [cells, heights, hoveredCell, tiles, geometry, tileset]
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
    
    // Model matrix for this tile
    const modelMatrix = createMat4();
    identity(modelMatrix);
    translate(modelMatrix, modelMatrix, [x, y, cellHeight]);

    // Combine with view matrix
    const modelViewMatrix = createMat4();
    multiply(modelViewMatrix, viewMatrix, modelMatrix);
    gl.uniformMatrix4fv(uModelViewMatrix, false, modelViewMatrix);

    // Parse tile definition: [geometryName, textureName, heightOffset, ...]
    for (let i = 0; i < tileData.length; i += 3) {
      const geometryName = tileData[i];
      const textureName = tileData[i + 1];
      const heightOffset = tileData[i + 2] || 0;

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
      gl.uniform1i(uUseTexture, 0);
      gl.uniform3f(uColor, 0.5, 0.5, 0.5);
    }

    gl.drawArrays(gl.TRIANGLES, 0, vertices.length / 3);

    // Cleanup
    gl.deleteBuffer(positionBuffer);
    gl.deleteBuffer(texCoordBuffer);
    gl.deleteBuffer(normalBuffer);
  }

  // Handle cell hover for highlighting
  const handleCellHover = useCallback(
    (screenX, screenY, camera) => {
      if (!cells.length) return;

      const cellCoords = screenToCell(screenX, screenY, camera, glRef.current?.canvas);
      setHoveredCell(cellCoords);
    },
    [cells]
  );

  // Handle cell click for editing
  const handleCellClick = useCallback(
    (screenX, screenY, camera, event) => {
      if (!cells.length) return;

      const cellCoords = screenToCell(screenX, screenY, camera, glRef.current.canvas);
      if (!cellCoords) return;

      const { x, y } = cellCoords;

      // Original behavior: Shift+Left-Click = paint, Shift+Right-Click = erase, Click (no shift) = pick
      if (event.shiftKey) {
        if (event.button === 0 || event.type === 'click') {
          // Shift+Left-Click: Paint
          paintCell(x, y);
        } else if (event.button === 2 || event.type === 'contextmenu') {
          // Shift+Right-Click: Erase
          eraseCell(x, y);
        }
      } else if (currentTool === 'pick') {
        // Regular click with pick tool active
        pickCell(x, y);
      }
    },
    [cells, currentTool, selectedTile, currentHeight]
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
    };
    if (onSave) {
      onSave(mapData);
    }
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
    return (
      <div style={{ padding: '1rem', background: '#1e1e1e', color: '#d4d4d4', minHeight: '100vh' }}>
        <div style={{
          background: '#4d3319',
          border: '1px solid #ce9178',
          borderRadius: '3px',
          padding: '10px',
          fontSize: '13px',
          color: '#ce9178',
          marginBottom: '1rem'
        }}>
          ⚠️ Map loaded but tileset data is missing. Please ensure the tileset file exists and is properly referenced in the map.
        </div>
        <div style={{ fontSize: '13px' }}>
          <p style={{ margin: '5px 0' }}>Map file loaded successfully, but cannot render 3D view without tileset data.</p>
          <p style={{ margin: '5px 0' }}>Expected tileset: <strong>{map?.tileset || 'unknown'}</strong></p>
          <p style={{ margin: '5px 0' }}>Cells dimensions: {cells.length} x {cells[0]?.length || 0}</p>
        </div>
      </div>
    );
  }

  if (!geometry || Object.keys(geometry).length === 0) {
    return (
      <div style={{ padding: '1rem', background: '#1e1e1e', color: '#d4d4d4', minHeight: '100vh' }}>
        <div style={{
          background: '#4d3319',
          border: '1px solid #ce9178',
          borderRadius: '3px',
          padding: '10px',
          fontSize: '13px',
          color: '#ce9178'
        }}>
          ⚠️ Tileset loaded but geometry definitions are missing. Cannot render 3D view.
        </div>
      </div>
    );
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
            Tools
          </div>
          <div style={{ padding: '10px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '5px', marginBottom: '15px' }}>
              <button
                style={{
                  background: currentTool === 'paint' ? '#1177bb' : '#0e639c',
                  color: 'white',
                  border: 'none',
                  padding: '8px 16px',
                  borderRadius: '3px',
                  cursor: 'pointer',
                  fontSize: '13px'
                }}
                onClick={() => setCurrentTool('paint')}
                onMouseOver={(e) => e.target.style.background = '#1177bb'}
                onMouseOut={(e) => e.target.style.background = currentTool === 'paint' ? '#1177bb' : '#0e639c'}
              >
                🖌️ Paint (Shift+Click)
              </button>
              <button
                style={{
                  background: currentTool === 'erase' ? '#1177bb' : '#0e639c',
                  color: 'white',
                  border: 'none',
                  padding: '8px 16px',
                  borderRadius: '3px',
                  cursor: 'pointer',
                  fontSize: '13px'
                }}
                onClick={() => setCurrentTool('erase')}
                onMouseOver={(e) => e.target.style.background = '#1177bb'}
                onMouseOut={(e) => e.target.style.background = currentTool === 'erase' ? '#1177bb' : '#0e639c'}
              >
                🗑️ Erase (Shift+Right-Click)
              </button>
              <button
                style={{
                  background: currentTool === 'pick' ? '#1177bb' : '#0e639c',
                  color: 'white',
                  border: 'none',
                  padding: '8px 16px',
                  borderRadius: '3px',
                  cursor: 'pointer',
                  fontSize: '13px'
                }}
                onClick={() => setCurrentTool('pick')}
                onMouseOver={(e) => e.target.style.background = '#1177bb'}
                onMouseOut={(e) => e.target.style.background = currentTool === 'pick' ? '#1177bb' : '#0e639c'}
              >
                🔍 Pick
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
              <input
                type="number"
                value={currentHeight}
                onChange={(e) => setCurrentHeight(parseFloat(e.target.value) || 0)}
                step={0.5}
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

        {/* Map Info */}
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
            Map Info
          </div>
          <div style={{ padding: '10px', fontSize: '11px', color: '#cccccc' }}>
            <p style={{ margin: '5px 0' }}>Expected tileset: <strong style={{ color: '#d4d4d4' }}>{map?.tileset || 'unknown'}</strong></p>
            <p style={{ margin: '5px 0' }}>Cells dimensions: {cells.length} x {cells[0]?.length || 0}</p>
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
            Tool: {currentTool} | Tile: {selectedTile} | Height: {currentHeight.toFixed(1)}
          </span>
          <span>
            {hoveredCell ? `Cell: ${hoveredCell.x}, ${hoveredCell.y}` : 'Ready'}
          </span>
        </div>
      </div>
    </div>
  );
}

export default collect(MapEditor);
