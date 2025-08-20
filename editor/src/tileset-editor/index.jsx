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
} from 'rsuite';

function TilesetEditor({ content, onSave, assets = [] }) {
  const [tileset, setTileset] = useState({ tiles: [], geometry: [] });

  // Parse incoming JSON into state
  useEffect(() => {
    if (content) {
      try {
        const obj = JSON.parse(content);
        const { tiles = [], geometry = [] } = obj;
        setTileset({ tiles: [...tiles], geometry: [...geometry] });
      } catch (err) {
        console.warn('Failed to parse tileset JSON', err);
      }
    }
  }, [content]);

  // Update a tile property
  function updateTile(index, prop, value) {
    setTileset((prev) => {
      const nextTiles = prev.tiles.map((t, i) =>
        i === index ? { ...t, [prop]: value } : t,
      );
      return { ...prev, tiles: nextTiles };
    });
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