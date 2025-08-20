/*
 * ---------------------------------------------------------------
 *              Pixospritz – Editor – Geometry Editor
 * ---------------------------------------------------------------
 * Copyright (c) 2022‑2025  Kyle Derby MacInnis
 *
 * This component provides a simple UI for editing geometry
 * definitions within a Pixospritz package.  Geometry definitions
 * are represented as an array of objects where each object
 * describes a bounding box via dimensions (width, height, depth)
 * and offsets (offsetX, offsetY, offsetZ).  Users can edit
 * numeric fields directly in the table, add new definitions and
 * save the updated array back into the package via the provided
 * onSave callback.
 */

import React, { useState, useEffect } from 'react';
import { collect } from 'react-recollect';
import {
  Container,
  Row,
  Col,
  Panel,
  InputNumber,
  Button,
  Table,
} from 'rsuite';

function GeometryEditor({ content, onSave }) {
  const [geometry, setGeometry] = useState([]);

  // Parse incoming JSON into an array of geometry objects
  useEffect(() => {
    if (content) {
      try {
        const obj = JSON.parse(content);
        if (Array.isArray(obj)) {
          setGeometry(obj);
        } else if (obj && Array.isArray(obj.geometry)) {
          setGeometry(obj.geometry);
        }
      } catch (err) {
        console.warn('Failed to parse geometry JSON', err);
      }
    }
  }, [content]);

  // Update a property on a geometry item
  function updateGeom(index, prop, value) {
    setGeometry((prev) =>
      prev.map((g, i) => (i === index ? { ...g, [prop]: value } : g)),
    );
  }

  function addGeometry() {
    setGeometry((prev) => [
      ...prev,
      {
        id: prev.length,
        width: 1,
        height: 1,
        depth: 1,
        offsetX: 0,
        offsetY: 0,
        offsetZ: 0,
      },
    ]);
  }

  function handleSave() {
    if (onSave) {
      onSave(geometry);
    } else {
      console.log('Geometry saved:', JSON.stringify(geometry, null, 2));
    }
  }

  return (
    <Container style={{ padding: '1rem' }}>
      <Row>
        <Col sm={24} md={24} lg={24}>
          <Panel bordered header={<strong>Geometry Editor</strong>}>
            <div style={{ maxHeight: '60vh', overflow: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid #333' }}>
                    <th style={{ padding: '0.5rem' }}>ID</th>
                    <th>Width</th>
                    <th>Height</th>
                    <th>Depth</th>
                    <th>Offset X</th>
                    <th>Offset Y</th>
                    <th>Offset Z</th>
                  </tr>
                </thead>
                <tbody>
                  {geometry.map((g, idx) => (
                    <tr key={idx} style={{ borderBottom: '1px solid #222' }}>
                      <td style={{ padding: '0.5rem' }}>{g.id ?? idx}</td>
                      <td>
                        <InputNumber
                          value={g.width ?? 1}
                          min={0}
                          onChange={(val) => updateGeom(idx, 'width', val)}
                          style={{ width: '4rem' }}
                        />
                      </td>
                      <td>
                        <InputNumber
                          value={g.height ?? 1}
                          min={0}
                          onChange={(val) => updateGeom(idx, 'height', val)}
                          style={{ width: '4rem' }}
                        />
                      </td>
                      <td>
                        <InputNumber
                          value={g.depth ?? 1}
                          min={0}
                          onChange={(val) => updateGeom(idx, 'depth', val)}
                          style={{ width: '4rem' }}
                        />
                      </td>
                      <td>
                        <InputNumber
                          value={g.offsetX ?? 0}
                          onChange={(val) => updateGeom(idx, 'offsetX', val)}
                          style={{ width: '4rem' }}
                        />
                      </td>
                      <td>
                        <InputNumber
                          value={g.offsetY ?? 0}
                          onChange={(val) => updateGeom(idx, 'offsetY', val)}
                          style={{ width: '4rem' }}
                        />
                      </td>
                      <td>
                        <InputNumber
                          value={g.offsetZ ?? 0}
                          onChange={(val) => updateGeom(idx, 'offsetZ', val)}
                          style={{ width: '4rem' }}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <Row style={{ marginTop: '1rem' }}>
              <Button appearance='primary' onClick={addGeometry}>
                Add Geometry
              </Button>
              <Button
                appearance='primary'
                style={{ marginLeft: '1rem' }}
                onClick={handleSave}
              >
                Save Changes
              </Button>
            </Row>
          </Panel>
        </Col>
      </Row>
    </Container>
  );
}

export default collect(GeometryEditor);