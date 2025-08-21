/*
 * ---------------------------------------------------------------
 *                Pixospritz – Editor – Tileset Editor
 * ---------------------------------------------------------------
 * Copyright (c) 2022‑2025  Kyle Derby MacInnis
 *
 * The TilesetEditor provides a simple form interface for editing
 * tile and geometry definitions within a Pixospritz package.  It
 * accepts a JSON string describing a tileset and allows the
 * user to modify tile IDs, names, associated geometry indices
 * and texture paths.  Geometry definitions themselves can also
 * be inspected.  When the user clicks Save Changes the updated
 * object will be emitted via the optional onSave callback.
 */

import React, { useState, useEffect } from 'react';
import { collect } from 'react-recollect';
import {
  Panel,
  Container,
  Row,
  Col,
  Input,
  InputNumber,
  Button,
  ButtonGroup,
  SelectPicker,
  Checkbox,
  Message,
} from 'rsuite';

function TilesetEditor({ content, onSave, assets = [] }) {
  const [tileset, setTileset] = useState({ tiles: [], geometry: [] });
  const [error, setError] = useState(null);

  // History management for undo/redo
  const [history, setHistory] = useState([]);
  const [historyIndex, setHistoryIndex] = useState(-1);

  // Push a snapshot of the current tileset into history
  function pushHistorySnapshot(nextTileset) {
    const snapshot = JSON.parse(JSON.stringify(nextTileset));
    setHistory((prev) => {
      const trimmed = prev.slice(0, historyIndex + 1);
      const updated = [...trimmed, snapshot];
      setHistoryIndex(updated.length - 1);
      return updated;
    });
  }

  // Undo last change
  function undo() {
    if (historyIndex > 0) {
      const prevState = history[historyIndex - 1];
      setTileset(prevState);
      setHistoryIndex(historyIndex - 1);
    }
  }

  // Redo next change
  function redo() {
    if (historyIndex < history.length - 1) {
      const nextState = history[historyIndex + 1];
      setTileset(nextState);
      setHistoryIndex(historyIndex + 1);
    }
  }

  // Parse incoming JSON into state
  useEffect(() => {
    if (content) {
      try {
        const obj = JSON.parse(content);
        const { tiles = [], geometry = [] } = obj;
        setTileset({ tiles: [...tiles], geometry: [...geometry] });
        setError(null);
        // Initialize history with parsed tileset
        const initialSnapshot = JSON.parse(JSON.stringify({ tiles: [...tiles], geometry: [...geometry] }));
        setHistory([initialSnapshot]);
        setHistoryIndex(0);
      } catch (err) {
        console.warn('Failed to parse tileset JSON', err);
        setError('Invalid tileset JSON');
      }
    }
  }, [content]);

  // Update a tile property
  function updateTile(index, prop, value) {
    const nextTiles = tileset.tiles.map((t, i) =>
      i === index ? { ...t, [prop]: value } : t,
    );
    const nextTileset = { ...tileset, tiles: nextTiles };
    setTileset(nextTileset);
    pushHistorySnapshot(nextTileset);
  }

  function handleSave() {
    if (onSave) {
      onSave(tileset);
    } else {
      console.log('Tileset saved:', JSON.stringify(tileset, null, 2));
    }
  }

  // Build options for texture selection from assets list
  const textureOptions = [{ label: 'None', value: '' }, ...assets.map((a) => ({ label: a.name, value: a.name }))];

  // Helper to find a data URI for a given texture name
  function getTextureUri(name) {
    const found = assets.find((a) => a.name === name);
    return found ? found.uri : null;
  }

  return (
    <Container style={{ padding: '1rem' }}>
      {error && (
        <Row style={{ marginBottom: '0.5rem' }}>
          <Col sm={24} md={24} lg={24}>
            <Message type='error' description={error} />
          </Col>
        </Row>
      )}
      <Row>
        <Col sm={24} md={24} lg={24}>
          <Panel bordered header={<strong>Tileset Editor</strong>}> 
            <div style={{ maxHeight: '50vh', overflow: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid #333' }}>
                    <th>ID</th>
                    <th>Name</th>
                    <th>Geometry</th>
                    <th>Texture</th>
                    <th>Preview</th>
                    <th>Walkable</th>
                  </tr>
                </thead>
                <tbody>
                  {tileset.tiles.map((tile, idx) => (
                    <tr key={idx}>
                      <td>
                        <InputNumber
                          value={tile.id || idx}
                          onChange={(val) => updateTile(idx, 'id', val)}
                          style={{ width: '4rem' }}
                        />
                      </td>
                      <td>
                        <Input
                          value={tile.name || ''}
                          onChange={(val) => updateTile(idx, 'name', val)}
                        />
                      </td>
                      <td>
                        <InputNumber
                          value={tile.geometry || 0}
                          onChange={(val) => updateTile(idx, 'geometry', val)}
                          style={{ width: '4rem' }}
                        />
                      </td>
                      <td>
                        <SelectPicker
                          data={textureOptions}
                          value={tile.texture || ''}
                          onChange={(val) => updateTile(idx, 'texture', val)}
                          style={{ width: '12rem' }}
                          searchable={false}
                          placeholder='Select texture'
                        />
                      </td>
                      <td>
                        {getTextureUri(tile.texture) ? (
                          <img
                            src={getTextureUri(tile.texture)}
                            alt={tile.texture}
                            style={{ width: '32px', height: '32px', objectFit: 'contain' }}
                          />
                        ) : (
                          <span style={{ color: '#666' }}>—</span>
                        )}
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        <Checkbox
                          checked={!!tile.walkable}
                          onChange={(checked) => updateTile(idx, 'walkable', checked)}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Panel>
        </Col>
      </Row>
      <Row style={{ paddingTop: '1rem' }}>
        <Button appearance='primary' onClick={handleSave}>
          Save Changes
        </Button>
        {/* Undo / Redo buttons */}
        <Button appearance='default' style={{ marginLeft: '0.5rem' }} onClick={undo} disabled={historyIndex <= 0}>
          Undo
        </Button>
        <Button appearance='default' style={{ marginLeft: '0.5rem' }} onClick={redo} disabled={historyIndex >= history.length - 1}>
          Redo
        </Button>
      </Row>
      {tileset.geometry.length > 0 && (
        <Row style={{ marginTop: '2rem' }}>
          <Col sm={24} md={24} lg={24}>
            <Panel bordered header={<strong>Geometry Definitions</strong>}>
              <pre
                style={{ maxHeight: '30vh', overflow: 'auto', whiteSpace: 'pre-wrap' }}
              >
                {JSON.stringify(tileset.geometry, null, 2)}
              </pre>
            </Panel>
          </Col>
        </Row>
      )}
    </Container>
  );
}

export default collect(TilesetEditor);