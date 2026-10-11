/*
 * ---------------------------------------------------------------
 *       Pixospritz – Editor – Enhanced Geometry Editor
 * ---------------------------------------------------------------
 * Copyright (c) 2022‑2025  Kyle Derby MacInnis
 *
 * Advanced geometry editor with 3D preview. Allows editing of
 * triangle-based geometry definitions with visual feedback.
 * Features:
 * - 3D WebGL preview with camera controls
 * - Triangle list with vertex editing
 * - Wireframe toggle
 * - Real-time preview updates
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { collect } from 'react-recollect';
import {
  Container,
  Row,
  Col,
  Panel,
  InputNumber,
  Button,
  Message,
  Input,
  Checkbox,
  ButtonGroup,
  SelectPicker,
  Modal,
} from '../ui';

import WebGL3DCanvas from '../shared/WebGL3DCanvas.jsx';
import { useConfirm } from '../shared/hooks/useConfirm.jsx';
import { CommandHistory } from '../core/commands/history.js';
import {
  createProgram,
  defaultVertexShader,
  defaultFragmentShader,
  createMat4,
  identity,
} from '../shared/webgl-utils.js';

function GeometryEditor3D({ content, onSave }) {
  // Geometry data structure:
  // { name: { vertices: [[[x,y,z],[x,y,z],[x,y,z]], ...], surfaces: [[[u,v],[u,v],[u,v]], ...], type: number } }
  const [geometryData, setGeometryData] = useState({});
  const [selectedGeometry, setSelectedGeometry] = useState(null);
  const [selectedTriangle, setSelectedTriangle] = useState(-1);
  const [showWireframe, setShowWireframe] = useState(true);
  const [error, setError] = useState(null);
  // "New geometry" dialog state (was a native browser dialog before).
  const [showNewDialog, setShowNewDialog] = useState(false);
  const [newGeometryName, setNewGeometryName] = useState('');
  const [nameError, setNameError] = useState(null);

  const { confirm, ConfirmDialog } = useConfirm();

  // Undo/redo for geometry operations (add/delete geometry, add/remove
  // triangle, vertex/UV/type edits), built on the shared CommandHistory:
  // byte-capped, and rapid successive field edits coalesce into one entry.
  const historyRef = useRef(null);
  if (!historyRef.current) historyRef.current = new CommandHistory();
  const [, forceHistory] = useState(0);
  useEffect(() => historyRef.current.onChange(() => forceHistory(n => n + 1)), []);

  // Refs mirror state so undo entries capture exact before/after snapshots
  // without stale closures.
  const dataRef = useRef(geometryData);
  dataRef.current = geometryData;
  const selRef = useRef(selectedGeometry);
  selRef.current = selectedGeometry;

  // Apply new geometry data (and selection) as one undoable operation.
  function commit(newData, newSelected, label, coalesceKey) {
    const prevData = dataRef.current;
    const prevSelected = selRef.current;
    historyRef.current.push(
      {
        label,
        bytes: JSON.stringify(newData).length,
        coalesceKey,
        coalesce: coalesceKey
          ? (prev, next) => ({
              label: next.label,
              bytes: next.bytes,
              coalesceKey,
              coalesce: next.coalesce,
              redo: next.redo, // latest state wins
              undo: prev.undo, // undo restores the earliest state
            })
          : undefined,
        redo: () => {
          setGeometryData(newData);
          setSelectedGeometry(newSelected);
        },
        undo: () => {
          setGeometryData(prevData);
          setSelectedGeometry(prevSelected);
        },
      },
      { apply: false }
    );
    setGeometryData(newData);
    setSelectedGeometry(newSelected);
  }

  function handleUndo() {
    historyRef.current.undo();
  }

  function handleRedo() {
    historyRef.current.redo();
  }

  // WebGL state
  const glRef = useRef(null);
  const shaderProgramRef = useRef(null);

  // Parse incoming JSON
  useEffect(() => {
    if (!content) return;

    try {
      const obj = JSON.parse(content);

      // Handle different formats
      if (obj.geometry && typeof obj.geometry === 'object') {
        historyRef.current.clear();
        setGeometryData(obj.geometry);
      } else if (typeof obj === 'object' && !Array.isArray(obj)) {
        historyRef.current.clear();
        setGeometryData(obj);
      } else {
        setError('Invalid geometry format');
        return;
      }

      // Select first geometry if available
      const keys = Object.keys(geometryData);
      if (keys.length > 0 && !selectedGeometry) {
        setSelectedGeometry(keys[0]);
      }

      setError(null);
    } catch (err) {
      console.error('Failed to parse geometry:', err);
      setError('Invalid geometry JSON');
    }
  }, [content]);

  // Initialize WebGL
  const handleWebGLInit = useCallback(gl => {
    glRef.current = gl;
    const program = createProgram(gl, defaultVertexShader, defaultFragmentShader);
    if (program) {
      shaderProgramRef.current = program;
    }
  }, []);

  // Render callback
  const handleRender = useCallback(
    (gl, projectionMatrix, viewMatrix, camera, showGridFlag) => {
      if (!shaderProgramRef.current || !selectedGeometry || !geometryData[selectedGeometry]) {
        return;
      }

      const program = shaderProgramRef.current;
      gl.useProgram(program);

      const uModelViewMatrix = gl.getUniformLocation(program, 'uModelViewMatrix');
      const uProjectionMatrix = gl.getUniformLocation(program, 'uProjectionMatrix');
      const uUseTexture = gl.getUniformLocation(program, 'uUseTexture');
      const uColor = gl.getUniformLocation(program, 'uColor');
      const uShowGrid = gl.getUniformLocation(program, 'uShowGrid');
      const uIsHovered = gl.getUniformLocation(program, 'uIsHovered');

      gl.uniformMatrix4fv(uProjectionMatrix, false, projectionMatrix);
      gl.uniform1i(uShowGrid, false);
      gl.uniform1i(uUseTexture, 0);

      // Model matrix (centered)
      const modelMatrix = createMat4();
      identity(modelMatrix);

      // Combine with view
      const modelViewMatrix = createMat4();
      for (let i = 0; i < 16; i++) {
        modelViewMatrix[i] = 0;
        for (let j = 0; j < 4; j++) {
          modelViewMatrix[i] +=
            viewMatrix[Math.floor(i / 4) * 4 + j] * modelMatrix[j * 4 + (i % 4)];
        }
      }

      gl.uniformMatrix4fv(uModelViewMatrix, false, modelViewMatrix);

      // Render geometry
      renderGeometry(gl, program, geometryData[selectedGeometry], uColor, uIsHovered);
    },
    [selectedGeometry, geometryData, selectedTriangle, showWireframe]
  );

  // Render geometry triangles
  function renderGeometry(gl, program, geom, uColor, uIsHovered) {
    if (!geom.vertices || !geom.vertices.length) return;

    geom.vertices.forEach((tri, idx) => {
      const isSelected = idx === selectedTriangle;
      gl.uniform1i(uIsHovered, isSelected);
      gl.uniform3f(uColor, isSelected ? 1.0 : 0.6, isSelected ? 0.8 : 0.6, isSelected ? 0.3 : 0.6);

      const vertices = [];
      const normals = [];

      tri.forEach(v => {
        vertices.push(v[0], v[1], v[2]);
      });

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
      normals.push(...normal, ...normal, ...normal);

      const posBuffer = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, posBuffer);
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
      const aPosition = gl.getAttribLocation(program, 'aPosition');
      gl.enableVertexAttribArray(aPosition);
      gl.vertexAttribPointer(aPosition, 3, gl.FLOAT, false, 0, 0);

      const texBuffer = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, texBuffer);
      // Use the geometry's UV surfaces when present so UV edits show in the preview
      const uv = (geom.surfaces && geom.surfaces[idx]) || [
        [0, 0],
        [1, 0],
        [1, 1],
      ];
      const texCoords = [
        uv[0]?.[0] ?? 0,
        uv[0]?.[1] ?? 0,
        uv[1]?.[0] ?? 1,
        uv[1]?.[1] ?? 0,
        uv[2]?.[0] ?? 1,
        uv[2]?.[1] ?? 1,
      ];
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(texCoords), gl.STATIC_DRAW);
      const aTexCoord = gl.getAttribLocation(program, 'aTexCoord');
      gl.enableVertexAttribArray(aTexCoord);
      gl.vertexAttribPointer(aTexCoord, 2, gl.FLOAT, false, 0, 0);

      const normBuffer = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, normBuffer);
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(normals), gl.STATIC_DRAW);
      const aNormal = gl.getAttribLocation(program, 'aNormal');
      gl.enableVertexAttribArray(aNormal);
      gl.vertexAttribPointer(aNormal, 3, gl.FLOAT, false, 0, 0);

      gl.drawArrays(gl.TRIANGLES, 0, 3);

      // Wireframe
      if (showWireframe) {
        gl.uniform3f(uColor, 0, 1, 0);
        gl.drawArrays(gl.LINE_LOOP, 0, 3);
      }

      gl.deleteBuffer(posBuffer);
      gl.deleteBuffer(texBuffer);
      gl.deleteBuffer(normBuffer);
    });
  }

  // Open the "New geometry" dialog (was a native browser dialog before).
  function openNewGeometryDialog() {
    setNewGeometryName('');
    setNameError(null);
    setShowNewDialog(true);
  }

  function closeNewGeometryDialog() {
    setShowNewDialog(false);
    setNewGeometryName('');
    setNameError(null);
  }

  // Create the new geometry from the dialog's name input. Empty /
  // whitespace-only names and duplicate names show inline validation in
  // the dialog instead of creating anything.
  function createGeometryFromName() {
    const name = newGeometryName.trim();
    if (!name) {
      setNameError('Enter a name for the new geometry.');
      return;
    }
    if (geometryData[name]) {
      setNameError(`Geometry "${name}" already exists.`);
      return;
    }

    const newGeometry = {
      vertices: [
        [
          [0, 0, 0],
          [1, 0, 0],
          [1, 1, 0],
        ],
        [
          [0, 0, 0],
          [1, 1, 0],
          [0, 1, 0],
        ],
      ],
      surfaces: [
        [
          [0, 0],
          [1, 0],
          [1, 1],
        ],
        [
          [0, 0],
          [1, 1],
          [0, 1],
        ],
      ],
      type: 15,
    };

    setGeometryData({ ...geometryData, [name]: newGeometry });
    setSelectedGeometry(name);
    closeNewGeometryDialog();
  }

  // Delete the selected geometry (with confirmation; undoable). The 3D
  // editor previously had no way to delete a geometry at all.
  async function deleteGeometry() {
    const key = selRef.current;
    if (!key) return;
    if (!(await confirm(`Delete geometry "${key}"?`))) return;
    const data = dataRef.current;
    const { [key]: _, ...rest } = data;
    const keys = Object.keys(rest);
    commit(rest, keys.length > 0 ? keys[0] : null, `Delete geometry ${key}`);
    setSelectedTriangle(-1);
  }

  // Add triangle to current geometry
  function addTriangle() {
    if (!selectedGeometry) return;

    const geom = geometryData[selectedGeometry];
    const newVertices = [
      ...geom.vertices,
      [
        [0, 0, 0],
        [1, 0, 0],
        [0.5, 1, 0],
      ],
    ];
    const newSurfaces = [
      ...(geom.surfaces || []),
      [
        [0, 0],
        [1, 0],
        [0.5, 1],
      ],
    ];

    commit(
      {
        ...geometryData,
        [selectedGeometry]: { ...geom, vertices: newVertices, surfaces: newSurfaces },
      },
      selectedGeometry,
      `Add triangle to ${selectedGeometry}`
    );
  }

  // Remove triangle
  function removeTriangle(idx) {
    if (!selectedGeometry) return;

    const geom = geometryData[selectedGeometry];
    const newVertices = geom.vertices.filter((_, i) => i !== idx);
    const newSurfaces = (geom.surfaces || []).filter((_, i) => i !== idx);

    commit(
      {
        ...geometryData,
        [selectedGeometry]: { ...geom, vertices: newVertices, surfaces: newSurfaces },
      },
      selectedGeometry,
      `Remove triangle ${idx} from ${selectedGeometry}`
    );

    if (selectedTriangle === idx) {
      setSelectedTriangle(-1);
    }
  }

  // Update vertex
  function updateVertex(triIdx, vertIdx, coord, value) {
    if (!selectedGeometry) return;

    const geom = geometryData[selectedGeometry];
    const newVertices = geom.vertices.map((tri, tIdx) => {
      if (tIdx !== triIdx) return tri;
      return tri.map((vert, vIdx) => {
        if (vIdx !== vertIdx) return vert;
        const newVert = [...vert];
        newVert[coord] = value;
        return newVert;
      });
    });

    // Rapid successive vertex edits coalesce into a single undo entry.
    commit(
      { ...geometryData, [selectedGeometry]: { ...geom, vertices: newVertices } },
      selectedGeometry,
      `Edit vertices in ${selectedGeometry}`,
      `geom3d:${selectedGeometry}:vertices`
    );
  }

  // Update a UV coordinate of a triangle's surface entry.
  // Rapid successive edits coalesce into a single undo entry.
  function updateUV(triIdx, uvIdx, coord, value) {
    const key = selRef.current;
    if (!key) return;

    const data = dataRef.current;
    const geom = data[key];
    const newSurfaces = JSON.parse(JSON.stringify(geom.surfaces || []));
    if (!newSurfaces[triIdx])
      newSurfaces[triIdx] = [
        [0, 0],
        [0, 0],
        [0, 0],
      ];
    if (!newSurfaces[triIdx][uvIdx]) newSurfaces[triIdx][uvIdx] = [0, 0];
    newSurfaces[triIdx][uvIdx][coord] = value;

    commit(
      { ...data, [key]: { ...geom, surfaces: newSurfaces } },
      key,
      `Edit UVs in ${key}`,
      `geom3d:${key}:surfaces`
    );
  }

  // Update the collision type bitmask of the selected geometry.
  // Rapid successive edits coalesce into a single undo entry.
  function updateType(value) {
    const key = selRef.current;
    if (!key) return;

    const data = dataRef.current;
    commit(
      { ...data, [key]: { ...data[key], type: value } },
      key,
      `Edit type of ${key}`,
      `geom3d:${key}:type`
    );
  }

  // Save
  function handleSave() {
    if (onSave) {
      onSave(geometryData);
    }
  }

  const geometryKeys = Object.keys(geometryData);

  return (
    <Container style={{ padding: '1rem', height: '100%', overflow: 'auto' }}>
      {error && (
        <Row style={{ marginBottom: '0.5rem' }}>
          <Col sm={24}>
            <Message type="error" description={error} />
          </Col>
        </Row>
      )}

      <Row>
        <Col sm={12}>
          <Panel bordered header={<strong>3D Preview</strong>}>
            <div style={{ height: '50vh', minHeight: '300px', position: 'relative' }}>
              <WebGL3DCanvas
                onRender={handleRender}
                onInit={handleWebGLInit}
                initialCamera={{
                  distance: 3,
                  angleX: -0.5,
                  angleY: 0.5,
                  centerX: 0.5,
                  centerY: 0.5,
                  centerZ: 0,
                }}
              />
            </div>
            <div style={{ marginTop: '0.5rem' }}>
              <Checkbox
                checked={showWireframe}
                onChange={(v, checked) => setShowWireframe(checked)}
              >
                Show Wireframe
              </Checkbox>
            </div>
          </Panel>
        </Col>

        <Col sm={12}>
          <Panel bordered header={<strong>Geometry Editor</strong>}>
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem' }}>Select Geometry:</label>
              <SelectPicker
                data={[
                  { value: '', label: '-- Select --' },
                  ...geometryKeys.map(key => ({ value: key, label: key })),
                ]}
                value={selectedGeometry || ''}
                onChange={v => {
                  setSelectedGeometry(v);
                  setSelectedTriangle(-1);
                }}
                cleanable={false}
                block
              />
            </div>

            <ButtonGroup style={{ marginBottom: '1rem' }}>
              <Button onClick={openNewGeometryDialog} appearance="primary">
                + New Geometry
              </Button>
              <Button onClick={addTriangle} disabled={!selectedGeometry}>
                + Add Triangle
              </Button>
              <Button onClick={deleteGeometry} disabled={!selectedGeometry} appearance="danger">
                Delete
              </Button>
            </ButtonGroup>

            {selectedGeometry && geometryData[selectedGeometry] && (
              <>
                <div style={{ marginBottom: '1rem' }}>
                  <label style={{ display: 'block', marginBottom: '0.25rem', fontSize: '12px' }}>
                    Type (collision bitmask):
                  </label>
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    <InputNumber
                      size="xs"
                      value={geometryData[selectedGeometry].type ?? 0}
                      min={0}
                      max={15}
                      step={1}
                      onChange={updateType}
                      style={{ width: '70px' }}
                    />
                    <span style={{ fontSize: '10px', color: 'rgba(255,255,255,0.5)' }}>
                      (0=none, 1=floor, 2=wall, 4=ceiling, 8=ramp)
                    </span>
                  </div>
                </div>
                <div style={{ maxHeight: '40vh', overflow: 'auto' }}>
                  <h4>Triangles ({geometryData[selectedGeometry].vertices.length})</h4>
                {geometryData[selectedGeometry].vertices.map((tri, triIdx) => (
                  <div
                    key={triIdx}
                    style={{
                      background: selectedTriangle === triIdx ? '#0e639c' : '#2d2d30',
                      padding: '0.5rem',
                      marginBottom: '0.5rem',
                      borderRadius: '3px',
                      cursor: 'pointer',
                      border:
                        selectedTriangle === triIdx ? '2px solid #1177bb' : '2px solid transparent',
                    }}
                    onClick={() => setSelectedTriangle(triIdx)}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <strong>Triangle {triIdx}</strong>
                      <Button size="xs" onClick={() => removeTriangle(triIdx)}>
                        Remove
                      </Button>
                    </div>
                    {tri.map((vert, vertIdx) => (
                      <div
                        key={vertIdx}
                        style={{ display: 'flex', gap: '0.5rem', marginTop: '0.25rem' }}
                      >
                        <span style={{ width: '60px' }}>V{vertIdx}:</span>
                        <InputNumber
                          size="xs"
                          value={vert[0]}
                          step={0.1}
                          onChange={val => updateVertex(triIdx, vertIdx, 0, val)}
                          style={{ width: '60px' }}
                        />
                        <InputNumber
                          size="xs"
                          value={vert[1]}
                          step={0.1}
                          onChange={val => updateVertex(triIdx, vertIdx, 1, val)}
                          style={{ width: '60px' }}
                        />
                        <InputNumber
                          size="xs"
                          value={vert[2]}
                          step={0.1}
                          onChange={val => updateVertex(triIdx, vertIdx, 2, val)}
                          style={{ width: '60px' }}
                        />
                      </div>
                    ))}
                    {/* UV surfaces for this triangle */}
                    <div
                      style={{
                        display: 'flex',
                        gap: '0.5rem',
                        marginTop: '0.5rem',
                        alignItems: 'flex-start',
                      }}
                    >
                      <span
                        style={{ width: '60px', fontSize: '11px', color: 'rgba(255,255,255,0.6)' }}
                      >
                        UVs:
                      </span>
                      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                        {(
                          (geometryData[selectedGeometry].surfaces || [])[triIdx] || [
                            [0, 0],
                            [0, 0],
                            [0, 0],
                          ]
                        ).map((uv, uvIdx) => (
                          <div
                            key={uvIdx}
                            style={{ display: 'flex', gap: '2px', alignItems: 'center' }}
                          >
                            <span style={{ fontSize: '10px', color: 'rgba(255,255,255,0.4)' }}>
                              V{uvIdx}:
                            </span>
                            <InputNumber
                              size="xs"
                              value={uv[0]}
                              step={0.1}
                              onChange={val => updateUV(triIdx, uvIdx, 0, val)}
                              style={{ width: '55px' }}
                            />
                            <InputNumber
                              size="xs"
                              value={uv[1]}
                              step={0.1}
                              onChange={val => updateUV(triIdx, uvIdx, 1, val)}
                              style={{ width: '55px' }}
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              </>
            )}
          </Panel>
        </Col>
      </Row>

      <Row style={{ marginTop: '1rem' }}>
        <Button onClick={handleUndo} disabled={!historyRef.current.canUndo}>
          ↩ Undo
        </Button>
        <Button
          onClick={handleRedo}
          disabled={!historyRef.current.canRedo}
          style={{ marginLeft: '0.5rem' }}
        >
          ↪ Redo
        </Button>
        <Button appearance="primary" onClick={handleSave} style={{ marginLeft: '0.5rem' }}>
          💾 Save Changes
        </Button>
      </Row>
      <ConfirmDialog />
      <Modal open={showNewDialog} onClose={closeNewGeometryDialog}>
        <Modal.Header onClose={closeNewGeometryDialog}>New geometry</Modal.Header>
        <Modal.Body>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '12px' }}>
            Geometry name (e.g., FLAT_ALL, WALL_T)
          </label>
          <Input
            value={newGeometryName}
            onChange={setNewGeometryName}
            autoFocus
            placeholder="e.g., FLAT_ALL, WALL_T"
            onKeyDown={e => {
              if (e.key === 'Enter') createGeometryFromName();
            }}
          />
          {nameError && (
            <p style={{ color: '#e05252', fontSize: '12px', marginTop: '0.5rem' }}>
              {nameError}
            </p>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button onClick={closeNewGeometryDialog}>Cancel</Button>
          <Button appearance="primary" onClick={createGeometryFromName}>
            Create
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
}

export default collect(GeometryEditor3D);
