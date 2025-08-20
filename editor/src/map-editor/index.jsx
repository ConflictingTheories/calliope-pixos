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
import { Panel, Container, Row, Col, ButtonGroup, Button } from 'rsuite';

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

  // Parse the provided map content when first mounted.  Fallback
  // to a single 16×16 empty layer if no content is passed in.
  useEffect(() => {
    const defaultSize = 16;
    if (content) {
      try {
        const map = JSON.parse(content);
        if (map && Array.isArray(map.layers)) {
          setLayers(map.layers);
          setCurrentLayer(0);
          return;
        }
        if (map && Array.isArray(map.cells)) {
          setLayers([map.cells]);
          setCurrentLayer(0);
          return;
        }
      } catch (err) {
        console.warn('Failed to parse map JSON', err);
      }
    }
    // Initialise an empty layer if no valid map loaded
    const emptyGrid = Array.from({ length: defaultSize }, () =>
      Array.from({ length: defaultSize }, () => 0),
    );
    setLayers([emptyGrid]);
    setCurrentLayer(0);
  }, [content]);

  // Update a cell within the current layer
  function setCell(x, y) {
    setLayers((prev) =>
      prev.map((grid, layerIdx) => {
        if (layerIdx !== currentLayer) return grid;
        return grid.map((row, j) =>
          row.map((cell, i) => {
            if (j === y && i === x) return selectedTile;
            return cell;
          }),
        );
      }),
    );
  }

  function addLayer() {
    const defaultSize = layers[0] ? layers[0].length : 16;
    const emptyGrid = Array.from({ length: defaultSize }, () =>
      Array.from({ length: defaultSize }, () => 0),
    );
    setLayers((prev) => [...prev, emptyGrid]);
    setCurrentLayer(layers.length);
  }

  // Serialise and dispatch the updated layers via onSave
  function handleSave() {
    const mapObject = layers.length > 1 ? { layers } : { cells: layers[0] };
    if (onSave) {
      onSave(mapObject);
    } else {
      console.log('Map saved:', JSON.stringify(mapObject, null, 2));
    }
  }

  // Build options for layer selector
  const layerOptions = layers.map((_, idx) => ({ label: `Layer ${idx}`, value: idx }));

  return (
    <Container style={{ padding: '1rem' }}>
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
              style={{ borderCollapse: 'collapse', margin: '0 auto' }}
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
      </Row>
    </Container>
  );
}

export default collect(MapEditor);