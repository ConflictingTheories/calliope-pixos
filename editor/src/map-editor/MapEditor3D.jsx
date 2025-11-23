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
import {
  Panel,
  Container,
  Row,
  Col,
  ButtonGroup,
  Button,
  Message,
  Input,
  Checkbox,
  SelectPicker,
  InputNumber,
} from 'rsuite';

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
    
    const img = new Image();
    img.onload = () => {
      if (glRef.current) {
        textureRef.current = createTextureFromImage(glRef.current, img);
      }
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

  // Handle cell click for editing
  const handleCellClick = useCallback(
    (screenX, screenY, camera) => {
      if (!cells.length) return;

      const cellCoords = screenToCell(screenX, screenY, camera, glRef.current.canvas);
      if (!cellCoords) return;

      const { x, y } = cellCoords;

      if (currentTool === 'paint') {
        paintCell(x, y);
      } else if (currentTool === 'erase') {
        eraseCell(x, y);
      } else if (currentTool === 'pick') {
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
      <Container style={{ padding: '1rem' }}>
        <Message type="info" description="No map data loaded. Please load a map from the package." />
      </Container>
    );
  }

  if (!tiles || Object.keys(tiles).length === 0) {
    return (
      <Container style={{ padding: '1rem' }}>
        <Message 
          type="warning" 
          description="Map loaded but tileset data is missing. Please ensure the tileset file exists and is properly referenced in the map." 
        />
        <div style={{ marginTop: '1rem' }}>
          <p>Map file loaded successfully, but cannot render 3D view without tileset data.</p>
          <p>Expected tileset: <strong>{map?.tileset || 'unknown'}</strong></p>
          <p>Cells dimensions: {cells.length} x {cells[0]?.length || 0}</p>
        </div>
      </Container>
    );
  }

  if (!geometry || Object.keys(geometry).length === 0) {
    return (
      <Container style={{ padding: '1rem' }}>
        <Message 
          type="warning" 
          description="Tileset loaded but geometry definitions are missing. Cannot render 3D view." 
        />
      </Container>
    );
  }

  return (
    <Container style={{ padding: '1rem' }}>
      {error && (
        <Row style={{ marginBottom: '0.5rem' }}>
          <Col sm={24}>
            <Message type="error" description={error} />
          </Col>
        </Row>
      )}
      
      <Row>
        <Col sm={18}>
          <Panel bordered header={<strong>3D Map View</strong>}>
            <div style={{ height: '70vh', position: 'relative' }}>
              <WebGL3DCanvas
                onRender={handleRender}
                onInit={handleWebGLInit}
                onCellClick={handleCellClick}
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
          </Panel>
        </Col>

        <Col sm={6}>
          <Panel bordered header={<strong>Tools</strong>}>
            <ButtonGroup vertical style={{ width: '100%', marginBottom: '1rem' }}>
              <Button
                appearance={currentTool === 'paint' ? 'primary' : 'default'}
                onClick={() => setCurrentTool('paint')}
              >
                🖌️ Paint
              </Button>
              <Button
                appearance={currentTool === 'erase' ? 'primary' : 'default'}
                onClick={() => setCurrentTool('erase')}
              >
                🗑️ Erase
              </Button>
              <Button
                appearance={currentTool === 'pick' ? 'primary' : 'default'}
                onClick={() => setCurrentTool('pick')}
              >
                🔍 Pick
              </Button>
            </ButtonGroup>

            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem' }}>Selected Tile:</label>
              <SelectPicker
                data={tileOptions}
                value={selectedTile}
                onChange={setSelectedTile}
                style={{ width: '100%' }}
                searchable
                placeholder="Select tile"
              />
            </div>

            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem' }}>Height:</label>
              <InputNumber
                value={currentHeight}
                onChange={setCurrentHeight}
                step={0.5}
                style={{ width: '100%' }}
              />
            </div>

            <ButtonGroup vertical style={{ width: '100%' }}>
              <Button onClick={handleSave} appearance="primary">
                💾 Save Changes
              </Button>
              <Button onClick={undo} disabled={historyIndex <= 0}>
                ↶ Undo
              </Button>
              <Button onClick={redo} disabled={historyIndex >= history.length - 1}>
                ↷ Redo
              </Button>
            </ButtonGroup>
          </Panel>
        </Col>
      </Row>
    </Container>
  );
}

export default collect(MapEditor);
