/*
 * ---------------------------------------------------------------
 *                 Pixospritz – Editor – Map Builder
 * ---------------------------------------------------------------
 * Copyright (c) 2022‑2025  Kyle Derby MacInnis
 *
 * A very basic map editing interface used to construct or
 * modify the layout for a Pixospritz level.  The editor reads
 * an existing map definition (if available) and displays a
 * clickable grid.  Users can select a tile from a palette and
 * assign it to any cell in the grid.  The final grid state can
 * be exported as JSON via the provided save callback.
 */

import React, { useState, useEffect } from 'react';
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
} from 'rsuite';
import { debug } from '../shared/debug-logger.js';

// Define a simple colour palette corresponding to tile indices.  In a
// more sophisticated editor this palette would be generated from
// tileset definitions and textures stored in the package.
const TILE_COLOURS = [
  '#000000', // 0 – empty / black
  '#7cfc00', // 1 – grass
  '#b5651d', // 2 – dirt
  '#00bfff', // 3 – water
  '#aaaaaa', // 4 – stone
  '#ffd700', // 5 – gold
];

/**
 * MapEditor displays and edits a simple tile grid.  It accepts
 * existing map JSON via the `content` prop.  The editor
 * maintains its own grid state and selected tile value.  When
 * Save Changes is clicked a callback can be invoked with the
 * updated cells matrix (passed through the optional onSave prop).
 */
function MapEditor({ content, onSave }) {

  // Support multiple layers: layers is an array of grids (arrays of arrays)
  const [layers, setLayers] = useState([]);
  const [currentLayer, setCurrentLayer] = useState(0);
  const [selectedTile, setSelectedTile] = useState(1);
  const [attributes, setAttributes] = useState([]);
  const [error, setError] = useState(null);
  const [selectedCell, setSelectedCell] = useState({ layer: 0, x: null, y: null });
  const [history, setHistory] = useState([]);
  const [historyIndex, setHistoryIndex] = useState(-1);

  // Camera state for pan/zoom
  const [camera, setCamera] = useState({ x: 0, y: 0, zoom: 1 });
  const cameraRef = React.useRef(camera);
  cameraRef.current = camera;

  // Mouse drag state
  const [dragging, setDragging] = useState(false);
  const dragStart = React.useRef({ x: 0, y: 0 });

  // Camera event handlers
  function handleMouseDown(e) {
    e.stopPropagation();
    e.preventDefault();
    setDragging(true);
    dragStart.current = { x: e.clientX, y: e.clientY };
  }
  function handleMouseUp(e) {
    e.stopPropagation();
    e.preventDefault();
    setDragging(false);
  }
  function handleMouseMove(e) {
    if (!dragging) return;
    e.stopPropagation();
    e.preventDefault();
    const dx = e.clientX - dragStart.current.x;
    const dy = e.clientY - dragStart.current.y;
    dragStart.current = { x: e.clientX, y: e.clientY };
    setCamera((prev) => ({ ...prev, x: prev.x + dx, y: prev.y + dy }));
  }
  function handleWheel(e) {
    e.stopPropagation();
    e.preventDefault();
    let zoom = cameraRef.current.zoom + (e.deltaY < 0 ? 0.1 : -0.1);
    zoom = Math.max(0.5, Math.min(2, zoom));
    setCamera((prev) => ({ ...prev, zoom }));
  }

  // Touch support for pan/zoom
  function handleTouchStart(e) {
    if (e.touches.length === 1) {
      setDragging(true);
      dragStart.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    }
  }
  function handleTouchEnd(e) {
    setDragging(false);
  }
  function handleTouchMove(e) {
    if (!dragging || e.touches.length !== 1) return;
    const dx = e.touches[0].clientX - dragStart.current.x;
    const dy = e.touches[0].clientY - dragStart.current.y;
    dragStart.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    setCamera((prev) => ({ ...prev, x: prev.x + dx, y: prev.y + dy }));
  }

  // Push a snapshot of the current state into the history.  This should
  // be invoked after state updates to record the new state.  It trims
  // any future redo states when pushing.
  function pushHistorySnapshot(newLayers, newAttributes, newCurrentLayer) {
    const snapshot = {
      layers: JSON.parse(JSON.stringify(newLayers)),
      attributes: JSON.parse(JSON.stringify(newAttributes)),
      currentLayer: newCurrentLayer,
    };
    setHistory((prev) => {
      // Drop redo history if the user has undone and then makes a change
      const trimmed = prev.slice(0, historyIndex + 1);
      const updated = [...trimmed, snapshot];
      setHistoryIndex(updated.length - 1);
      return updated;
    });
  }

  // Undo the last action by restoring the previous snapshot
  function undo() {
    if (historyIndex > 0) {
      const prevState = history[historyIndex - 1];
      setLayers(prevState.layers);
      setAttributes(prevState.attributes);
      setCurrentLayer(prevState.currentLayer);
      setSelectedCell({ layer: prevState.currentLayer, x: null, y: null });
      setHistoryIndex(historyIndex - 1);
    }
  }

  // Redo the next action by restoring the next snapshot
  function redo() {
    if (historyIndex < history.length - 1) {
      const nextState = history[historyIndex + 1];
      setLayers(nextState.layers);
      setAttributes(nextState.attributes);
      setCurrentLayer(nextState.currentLayer);
      setSelectedCell({ layer: nextState.currentLayer, x: null, y: null });
      setHistoryIndex(historyIndex + 1);
    }
  }

  // Parse the provided map content when first mounted.  Fallback
  // to a single 16×16 empty layer if no content is passed in.
  useEffect(() => {
    const defaultSize = 16;
    if (content) {
      try {
        const map = JSON.parse(content);
        let newLayers;
        let newAttributes;
        if (map && Array.isArray(map.layers)) {
          newLayers = map.layers;
          newAttributes = Array.isArray(map.attributes)
            ? map.attributes
            : map.layers.map((grid) => grid.map((row) => row.map(() => ({}))));
        } else if (map && Array.isArray(map.cells)) {
          newLayers = [map.cells];
          newAttributes = Array.isArray(map.attributes)
            ? map.attributes
            : [map.cells.map((row) => row.map(() => ({})))];
        }
        if (newLayers) {
          setLayers(newLayers);
          setAttributes(newAttributes);
          setCurrentLayer(0);
          setSelectedCell({ layer: 0, x: null, y: null });
          // Initialize history with the parsed state
          setHistory([{
            layers: JSON.parse(JSON.stringify(newLayers)),
            attributes: JSON.parse(JSON.stringify(newAttributes)),
            currentLayer: 0,
          }]);
          setHistoryIndex(0);
          setError(null);
          return;
        }
      } catch (err) {
        console.warn('Failed to parse map JSON', err);
        setError('Invalid map JSON');
      }
    }
    // Initialise an empty layer if no valid map loaded
    const emptyGrid = Array.from({ length: defaultSize }, () =>
      Array.from({ length: defaultSize }, () => 0),
    );
    const initLayers = [emptyGrid];
    const initAttributes = [
      emptyGrid.map((row) => row.map(() => ({}))),
    ];
    setLayers(initLayers);
    setAttributes(initAttributes);
    setCurrentLayer(0);
    setSelectedCell({ layer: 0, x: null, y: null });
    setHistory([
      {
        layers: JSON.parse(JSON.stringify(initLayers)),
        attributes: JSON.parse(JSON.stringify(initAttributes)),
        currentLayer: 0,
      },
    ]);
    setHistoryIndex(0);
    setError(null);
  }, [content]);

  // Update a cell within the current layer
  function setCell(x, y) {
    // Compute new layers based on current state
    const newLayers = layers.map((grid, layerIdx) => {
      if (layerIdx !== currentLayer) return grid;
      return grid.map((row, j) =>
        row.map((cell, i) => {
          if (j === y && i === x) return selectedTile;
          return cell;
        }),
      );
    });
    setLayers(newLayers);
    // Push the new state into history
    pushHistorySnapshot(newLayers, attributes, currentLayer);
    // Update selected cell to edit attributes
    setSelectedCell({ layer: currentLayer, x, y });
  }

  function addLayer() {
    const defaultSize = layers[0] ? layers[0].length : 16;
    const emptyGrid = Array.from({ length: defaultSize }, () =>
      Array.from({ length: defaultSize }, () => 0),
    );
    const newLayers = [...layers, emptyGrid];
    const newAttributes = [
      ...attributes,
      emptyGrid.map((row) => row.map(() => ({}))),
    ];
    setLayers(newLayers);
    setAttributes(newAttributes);
    const newCurrentLayer = layers.length;
    setCurrentLayer(newCurrentLayer);
    // Reset selected cell
    setSelectedCell({ layer: newCurrentLayer, x: null, y: null });
    // Push history
    pushHistorySnapshot(newLayers, newAttributes, newCurrentLayer);
  }

  // Serialise and dispatch the updated layers via onSave
  function handleSave() {
    // When saving, include both layers and attributes if multiple layers
    const mapObject = layers.length > 1
      ? { layers, attributes }
      : { cells: layers[0], attributes: attributes[0] };
    if (onSave) {
      onSave(mapObject);
    } else {
      debug('MapEditor', 'Map saved:', JSON.stringify(mapObject, null, 2));
    }
  }

  // Build options for layer selector
  const layerOptions = layers.map((_, idx) => ({ label: `Layer ${idx}`, value: idx }));

  return (
    <Container style={{ padding: '1rem' }}>
      {/* Display any JSON parsing errors */}
      {error && (
        <Row style={{ marginBottom: '0.5rem' }}>
          <Col sm={24} md={24} lg={24}>
            <Message type='error' description={error} />
          </Col>
        </Row>
      )}
      <Row>
        <Col sm={18} md={18} lg={18}>
          <Panel
            bordered
            header={<strong>Map Editor</strong>}
            style={{ overflow: 'auto', maxHeight: '75vh' }}
          >
            {/* Layer selection bar */}
            <Row style={{ marginBottom: '0.5rem' }}>
              <Col sm={16} md={16} lg={16}>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <span style={{ marginRight: '0.5rem' }}>Layer:</span>
                  <select
                    value={currentLayer}
                    onChange={(e) => setCurrentLayer(Number(e.target.value))}
                  >
                    {layerOptions.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                  <Button
                    appearance='primary'
                    size='sm'
                    style={{ marginLeft: '1rem' }}
                    onClick={addLayer}
                  >
                    Add Layer
                  </Button>
                </div>
              </Col>
            </Row>
            <table
              style={{
                borderCollapse: 'collapse',
                margin: '0 auto',
                transform: `translate(${camera.x}px, ${camera.y}px) scale(${camera.zoom})`,
                transition: dragging ? 'none' : 'transform 0.1s',
                cursor: dragging ? 'grab' : 'pointer',
                userSelect: 'none',
              }}
              onMouseDown={handleMouseDown}
              onMouseUp={handleMouseUp}
              onMouseMove={handleMouseMove}
              onWheel={handleWheel}
              onTouchStart={handleTouchStart}
              onTouchEnd={handleTouchEnd}
              onTouchMove={handleTouchMove}
            >
              <tbody>
                {layers[currentLayer] &&
                  layers[currentLayer].map((row, y) => (
                    <tr key={y}>
                      {row.map((value, x) => (
                        <td
                          key={x}
                          onClick={() => setCell(x, y)}
                          style={{
                            width: 24,
                            height: 24,
                            backgroundColor: TILE_COLOURS[value] || '#111',
                            border: '1px solid #333',
                            cursor: 'pointer',
                            boxSizing: 'border-box',
                            // Highlight selected cell
                            outline:
                            selectedCell.layer === currentLayer &&
                            selectedCell.x === x &&
                            selectedCell.y === y
                              ? '2px solid #fff'
                              : 'none',
                          }}
                        ></td>
                      ))}
                    </tr>
                  ))}
              </tbody>
            </table>
          </Panel>
        </Col>
        <Col sm={6} md={6} lg={6}>
          <Panel bordered header={<strong>Palette</strong>}>
            <ButtonGroup vertical style={{ width: '100%' }}>
              {TILE_COLOURS.map((colour, idx) => (
                <Button
                  key={idx}
                  style={{
                    backgroundColor: colour,
                    color: '#fff',
                    border: selectedTile === idx ? '2px solid #fff' : 'none',
                  }}
                  onClick={() => setSelectedTile(idx)}
                >
                  {idx}
                </Button>
              ))}
            </ButtonGroup>
          </Panel>
        </Col>
      </Row>
      <Row style={{ paddingTop: '1rem' }}>
        <Button appearance='primary' onClick={handleSave}>
          Save Changes
        </Button>
        {/* Undo / Redo Controls */}
        <Button appearance='default' style={{ marginLeft: '0.5rem' }} onClick={undo} disabled={historyIndex <= 0}>
          Undo
        </Button>
        <Button appearance='default' style={{ marginLeft: '0.5rem' }} onClick={redo} disabled={historyIndex >= history.length - 1}>
          Redo
        </Button>
      </Row>
      {/* Cell attribute editor */}
      {selectedCell.x !== null && selectedCell.y !== null && (
        <Row style={{ marginTop: '1rem' }}>
          <Col sm={24} md={24} lg={24}>
            <Panel bordered header={<strong>Cell Attributes (x:{selectedCell.x}, y:{selectedCell.y}, layer:{selectedCell.layer})</strong>}>
              <Row style={{ marginBottom: '0.5rem' }}>
                <Col sm={12} md={12} lg={12}>
                  <Checkbox
                    checked={!!attributes[selectedCell.layer]?.[selectedCell.y]?.[selectedCell.x]?.walkable}
                    onChange={(checked) => {
                      // Compute new attributes grid
                      const next = attributes.map((layerGrid, l) =>
                        layerGrid.map((row, j) =>
                          row.map((attr, i) => {
                            if (
                              l === selectedCell.layer &&
                              j === selectedCell.y &&
                              i === selectedCell.x
                            ) {
                              return { ...attr, walkable: checked };
                            }
                            return attr;
                          }),
                        ),
                      );
                      setAttributes(next);
                      // Record history snapshot after attribute change
                      pushHistorySnapshot(layers, next, currentLayer);
                    }}
                  >
                    Walkable
                  </Checkbox>
                </Col>
                <Col sm={12} md={12} lg={12}>
                  <Input
                    placeholder='Event identifier'
                    value={
                      attributes[selectedCell.layer]?.[selectedCell.y]?.[selectedCell.x]?.event || ''
                    }
                    onChange={(val) => {
                      const next = attributes.map((layerGrid, l) =>
                        layerGrid.map((row, j) =>
                          row.map((attr, i) => {
                            if (
                              l === selectedCell.layer &&
                              j === selectedCell.y &&
                              i === selectedCell.x
                            ) {
                              return { ...attr, event: val };
                            }
                            return attr;
                          }),
                        ),
                      );
                      setAttributes(next);
                      pushHistorySnapshot(layers, next, currentLayer);
                    }}
                  />
                </Col>
              </Row>
              <Row>
                <Button
                  appearance='default'
                  onClick={() => setSelectedCell({ layer: currentLayer, x: null, y: null })}
                >
                  Done
                </Button>
              </Row>
            </Panel>
          </Col>
        </Row>
      )}
    </Container>
  );
}

export default collect(MapEditor);