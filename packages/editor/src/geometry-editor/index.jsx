/*
 * ---------------------------------------------------------------
 *              Pixospritz – Editor – Geometry Editor
 * ---------------------------------------------------------------
 * Copyright (c) 2022‑2025  Kyle Derby MacInnis
 *
 * This component provides a UI for editing geometry definitions.
 * Geometry is stored as an object with named keys, where each
 * geometry has vertices (triangles) and surfaces (UV coordinates).
 * 
 * Format:
 * {
 *   "GEOMETRY_NAME": {
 *     "vertices": [[[x,y,z], [x,y,z], [x,y,z]], ...], // triangles
 *     "surfaces": [[[u,v], [u,v], [u,v]], ...],       // UV coords
 *     "type": 15  // collision bitmask
 *   }
 * }
 * 
 * Coordinate System: Z-up (matching engine)
 * - X: East/West
 * - Y: North/South  
 * - Z: Up/Down
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { collect } from 'react-recollect';
import {
  InputNumber,
  Button,
  Message,
  Input,
} from '../ui';

// 3D wireframe preview using Canvas 2D with Z-up coordinate system
function GeometryPreview({ geometry, size = 280 }) {
  const canvasRef = useRef(null);
  const [rotation, setRotation] = useState(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;

    // Clear with dark background
    ctx.fillStyle = '#0d1117';
    ctx.fillRect(0, 0, width, height);

    // Draw subtle grid
    ctx.strokeStyle = 'rgba(255,255,255,0.05)';
    ctx.lineWidth = 1;
    const gridSize = width / 8;
    for (let i = 1; i < 8; i++) {
      ctx.beginPath();
      ctx.moveTo(i * gridSize, 0);
      ctx.lineTo(i * gridSize, height);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(0, i * gridSize);
      ctx.lineTo(width, i * gridSize);
      ctx.stroke();
    }

    // Z-up isometric projection (matching engine)
    // Camera orbits around Z axis, looking down at ~30°
    const cos = Math.cos(rotation);
    const sin = Math.sin(rotation);
    const scale = size * 0.35;
    const cx = width / 2;
    const cy = height / 2 + 20;

    // Project 3D point to 2D with Z-up
    const project = (x, y, z) => {
      // Rotate around Z axis (vertical)
      const rx = x * cos - y * sin;
      const ry = x * sin + y * cos;
      // Isometric projection: X/Y on ground plane, Z is up
      const px = cx + (rx - ry) * scale * 0.7;
      const py = cy - z * scale * 0.8 + (rx + ry) * scale * 0.25;
      return [px, py, rx + ry]; // Include depth for sorting
    };

    // Draw ground plane reference
    ctx.strokeStyle = 'rgba(255,255,255,0.1)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    const corners = [[0, 0, 0], [1, 0, 0], [1, 1, 0], [0, 1, 0]];
    corners.forEach((c, i) => {
      const [px, py] = project(c[0], c[1], c[2]);
      if (i === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    });
    ctx.closePath();
    ctx.stroke();

    // Draw triangles if we have geometry
    if (geometry?.vertices?.length > 0) {
      // Sort triangles by depth for proper rendering
      const trianglesWithDepth = geometry.vertices.map((tri, idx) => {
        if (!tri || tri.length < 3) return null;
        const centerZ = (tri[0][2] + tri[1][2] + tri[2][2]) / 3;
        const [, , depth] = project(
          (tri[0][0] + tri[1][0] + tri[2][0]) / 3,
          (tri[0][1] + tri[1][1] + tri[2][1]) / 3,
          centerZ
        );
        return { tri, idx, depth };
      }).filter(Boolean).sort((a, b) => a.depth - b.depth);

      trianglesWithDepth.forEach(({ tri }) => {
        ctx.fillStyle = 'rgba(125, 211, 252, 0.2)';
        ctx.strokeStyle = 'rgba(125, 211, 252, 0.8)';
        ctx.lineWidth = 1.5;

        ctx.beginPath();
        const [p0x, p0y] = project(tri[0][0], tri[0][1], tri[0][2]);
        ctx.moveTo(p0x, p0y);
        for (let i = 1; i < 3; i++) {
          const [px, py] = project(tri[i][0], tri[i][1], tri[i][2]);
          ctx.lineTo(px, py);
        }
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
      });
    } else {
      // No geometry message
      ctx.fillStyle = 'rgba(255,255,255,0.3)';
      ctx.font = '12px system-ui, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('No triangles', width / 2, height / 2);
    }

    // Draw axes (Z-up coordinate system)
    ctx.lineWidth = 2;
    const [ox, oy] = project(0, 0, 0);

    // X axis (red) - East
    ctx.strokeStyle = '#ef4444';
    ctx.beginPath();
    ctx.moveTo(ox, oy);
    const [ax, ay] = project(0.4, 0, 0);
    ctx.lineTo(ax, ay);
    ctx.stroke();
    ctx.fillStyle = '#ef4444';
    ctx.font = 'bold 10px system-ui';
    ctx.fillText('X', ax + 5, ay);

    // Y axis (green) - North
    ctx.strokeStyle = '#22c55e';
    ctx.beginPath();
    ctx.moveTo(ox, oy);
    const [bx, by] = project(0, 0.4, 0);
    ctx.lineTo(bx, by);
    ctx.stroke();
    ctx.fillStyle = '#22c55e';
    ctx.fillText('Y', bx + 5, by);

    // Z axis (blue) - Up
    ctx.strokeStyle = '#3b82f6';
    ctx.beginPath();
    ctx.moveTo(ox, oy);
    const [zx, zy] = project(0, 0, 0.4);
    ctx.lineTo(zx, zy);
    ctx.stroke();
    ctx.fillStyle = '#3b82f6';
    ctx.fillText('Z', zx + 5, zy - 5);

    // Info text
    ctx.fillStyle = 'rgba(255,255,255,0.4)';
    ctx.font = '9px system-ui';
    ctx.textAlign = 'left';
    ctx.fillText(`${geometry?.vertices?.length || 0} triangles`, 8, height - 8);
    ctx.textAlign = 'right';
    ctx.fillText('Z-up', width - 8, height - 8);

  }, [geometry, rotation, size]);

  // Auto-rotate
  useEffect(() => {
    const interval = setInterval(() => {
      setRotation(r => r + 0.015);
    }, 50);
    return () => clearInterval(interval);
  }, []);

  return (
    <canvas
      ref={canvasRef}
      width={size}
      height={size}
      style={{
        borderRadius: '12px',
        background: '#0d1117',
        border: '1px solid rgba(255,255,255,0.1)',
      }}
    />
  );
}

function GeometryEditor({ content, onSave }) {
  const [geometryMap, setGeometryMap] = useState({});
  const [selectedKey, setSelectedKey] = useState(null);
  const [error, setError] = useState(null);
  const [newKeyName, setNewKeyName] = useState('');
  const [searchFilter, setSearchFilter] = useState('');
  const [renamingKey, setRenamingKey] = useState(null);
  const [renameValue, setRenameValue] = useState('');

  // Parse incoming JSON
  useEffect(() => {
    if (content) {
      try {
        const obj = JSON.parse(content);
        if (obj && typeof obj === 'object' && !Array.isArray(obj)) {
          setGeometryMap(obj);
          const keys = Object.keys(obj);
          if (keys.length > 0 && !selectedKey) {
            setSelectedKey(keys[0]);
          }
        }
        setError(null);
      } catch (err) {
        console.warn('Failed to parse geometry JSON', err);
        setError('Invalid geometry JSON');
      }
    }
  }, [content]);

  const addGeometry = useCallback(() => {
    const name = newKeyName.trim().toUpperCase().replace(/\s+/g, '_') || `GEOM_${Object.keys(geometryMap).length}`;
    if (geometryMap[name]) {
      setError(`Geometry "${name}" already exists`);
      return;
    }
    setGeometryMap(prev => ({
      ...prev,
      [name]: { vertices: [], surfaces: [], type: 0 }
    }));
    setSelectedKey(name);
    setNewKeyName('');
    setError(null);
  }, [geometryMap, newKeyName]);

  const renameGeometry = useCallback((oldKey) => {
    const newKey = renameValue.trim().toUpperCase().replace(/\s+/g, '_');
    if (!newKey || newKey === oldKey) {
      setRenamingKey(null);
      return;
    }
    if (geometryMap[newKey]) {
      setError(`Geometry "${newKey}" already exists`);
      return;
    }
    const { [oldKey]: geom, ...rest } = geometryMap;
    setGeometryMap({ ...rest, [newKey]: geom });
    if (selectedKey === oldKey) setSelectedKey(newKey);
    setRenamingKey(null);
    setRenameValue('');
    setError(null);
  }, [geometryMap, selectedKey, renameValue]);

  const deleteGeometry = useCallback((key) => {
    const { [key]: _, ...rest } = geometryMap;
    setGeometryMap(rest);
    if (selectedKey === key) {
      const keys = Object.keys(rest);
      setSelectedKey(keys.length > 0 ? keys[0] : null);
    }
  }, [geometryMap, selectedKey]);

  const updateGeometry = useCallback((key, field, value) => {
    setGeometryMap(prev => ({
      ...prev,
      [key]: { ...prev[key], [field]: value }
    }));
  }, []);

  const duplicateGeometry = useCallback((key) => {
    let finalName = `${key}_COPY`;
    let counter = 1;
    while (geometryMap[finalName]) finalName = `${key}_COPY_${counter++}`;
    setGeometryMap(prev => ({
      ...prev,
      [finalName]: JSON.parse(JSON.stringify(prev[key]))
    }));
    setSelectedKey(finalName);
  }, [geometryMap]);

  const handleSave = useCallback(() => {
    if (onSave) onSave(geometryMap);
  }, [geometryMap, onSave]);

  const geometryKeys = Object.keys(geometryMap).filter(k =>
    !searchFilter || k.toLowerCase().includes(searchFilter.toLowerCase())
  );
  const selectedGeom = selectedKey ? geometryMap[selectedKey] : null;

  return (
    <div style={{
      position: 'relative',
      width: '100%',
      height: '100%',
      display: 'flex',
      overflow: 'hidden',
      background: 'linear-gradient(135deg, rgba(7,20,38,0.98), rgba(4,12,20,0.98))',
    }}>
      {/* Left panel - Geometry list */}
      <div style={{
        width: '240px',
        minWidth: '240px',
        borderRight: '1px solid rgba(255,255,255,0.1)',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        background: 'rgba(0,0,0,0.2)',
      }}>
        {/* Header */}
        <div style={{
          padding: '12px',
          borderBottom: '1px solid rgba(255,255,255,0.08)',
        }}>
          <h4 style={{ margin: '0 0 10px 0', color: '#7dd3fc', fontSize: '14px', fontWeight: 600 }}>
            📐 Geometry ({Object.keys(geometryMap).length})
          </h4>
          {/* Search */}
          <Input
            size="xs"
            placeholder="🔍 Search geometry..."
            value={searchFilter}
            onChange={setSearchFilter}
            style={{ marginBottom: '8px' }}
          />
          {/* Add new */}
          <div style={{ display: 'flex', gap: '6px' }}>
            <Input
              size="xs"
              placeholder="NEW_GEOMETRY"
              value={newKeyName}
              onChange={setNewKeyName}
              onKeyDown={(e) => e.key === 'Enter' && addGeometry()}
              style={{ flex: 1 }}
            />
            <Button appearance='primary' size="xs" onClick={addGeometry}>+</Button>
          </div>
        </div>

        {/* Geometry list */}
        <div style={{ flex: 1, overflow: 'auto', padding: '8px' }}>
          {geometryKeys.map((key) => {
            const geom = geometryMap[key];
            const triCount = geom.vertices?.length || 0;

            return (
              <div
                key={key}
                onClick={() => setSelectedKey(key)}
                style={{
                  padding: '10px',
                  marginBottom: '4px',
                  background: selectedKey === key ? 'rgba(125,211,252,0.2)' : 'rgba(255,255,255,0.03)',
                  border: `1px solid ${selectedKey === key ? 'rgba(125,211,252,0.5)' : 'transparent'}`,
                  borderRadius: '6px',
                  cursor: 'pointer',
                  transition: 'all 0.15s',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  {renamingKey === key ? (
                    <Input
                      value={renameValue}
                      onChange={setRenameValue}
                      size="xs"
                      autoFocus
                      onBlur={() => renameGeometry(key)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') renameGeometry(key);
                        if (e.key === 'Escape') setRenamingKey(null);
                      }}
                      onClick={(e) => e.stopPropagation()}
                      style={{ width: '120px' }}
                    />
                  ) : (
                    <div
                      onDoubleClick={(e) => {
                        e.stopPropagation();
                        setRenamingKey(key);
                        setRenameValue(key);
                      }}
                      style={{ flex: 1 }}
                    >
                      <div style={{ color: '#e6eef8', fontSize: '12px', fontWeight: 500 }}>{key}</div>
                      <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: '10px' }}>
                        {triCount} triangle{triCount !== 1 ? 's' : ''} • type: {geom.type ?? 0}
                      </div>
                    </div>
                  )}
                  <div style={{ display: 'flex', gap: '4px' }}>
                    <button
                      onClick={(e) => { e.stopPropagation(); duplicateGeometry(key); }}
                      style={{
                        background: 'rgba(125,211,252,0.1)',
                        border: '1px solid rgba(125,211,252,0.2)',
                        color: '#7dd3fc',
                        padding: '2px 6px',
                        borderRadius: '3px',
                        cursor: 'pointer',
                        fontSize: '9px',
                      }}
                      title="Duplicate"
                    >⧉</button>
                    <button
                      onClick={(e) => { e.stopPropagation(); deleteGeometry(key); }}
                      style={{
                        background: 'rgba(239,68,68,0.1)',
                        border: '1px solid rgba(239,68,68,0.2)',
                        color: '#ef4444',
                        padding: '2px 6px',
                        borderRadius: '3px',
                        cursor: 'pointer',
                        fontSize: '9px',
                      }}
                      title="Delete"
                    >✕</button>
                  </div>
                </div>
              </div>
            );
          })}

          {geometryKeys.length === 0 && (
            <div style={{ textAlign: 'center', padding: '20px', color: 'rgba(255,255,255,0.4)', fontSize: '12px' }}>
              {searchFilter ? 'No matches found' : 'No geometry defined.'}
            </div>
          )}
        </div>

        {/* Save button */}
        <div style={{ padding: '12px', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
          <Button appearance='primary' block onClick={handleSave}>💾 Save Geometry</Button>
        </div>
      </div>

      {/* Main panel */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', minWidth: 0 }}>
        {error && (
          <div style={{ padding: '8px 12px', flexShrink: 0 }}>
            <Message type='error' description={error} closable onClose={() => setError(null)} />
          </div>
        )}

        {selectedGeom ? (
          <>
            {/* Header with preview */}
            <div style={{
              padding: '16px',
              borderBottom: '1px solid rgba(255,255,255,0.08)',
              display: 'flex',
              gap: '20px',
              alignItems: 'flex-start',
              flexShrink: 0,
              background: 'rgba(0,0,0,0.15)',
            }}>
              {/* Preview */}
              <GeometryPreview geometry={selectedGeom} size={180} />

              {/* Info */}
              <div style={{ flex: 1 }}>
                <h4 style={{ margin: '0 0 8px 0', color: '#7dd3fc', fontSize: '18px' }}>{selectedKey}</h4>
                <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '11px', marginBottom: '12px' }}>
                  {selectedGeom.vertices?.length || 0} triangles • Type: {selectedGeom.type ?? 0}
                  <span style={{ color: 'rgba(255,255,255,0.3)', marginLeft: '8px' }}>
                    (0=none, 1=floor, 2=wall, 4=ceiling, 8=ramp)
                  </span>
                </div>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '12px' }}>
                  <label style={{ color: 'rgba(255,255,255,0.6)', fontSize: '11px', fontWeight: 500 }}>Type:</label>
                  <InputNumber
                    value={selectedGeom.type ?? 0}
                    onChange={(val) => updateGeometry(selectedKey, 'type', val)}
                    size="sm"
                    min={0}
                    max={15}
                    style={{ width: '70px' }}
                  />
                </div>
                <Button
                  appearance='ghost'
                  size="sm"
                  onClick={() => {
                    // Default triangle on XY plane (floor)
                    const newVerts = [...(selectedGeom.vertices || []), [[0, 0, 0], [1, 0, 0], [0.5, 1, 0]]];
                    const newSurfs = [...(selectedGeom.surfaces || []), [[0, 0], [1, 0], [0.5, 1]]];
                    updateGeometry(selectedKey, 'vertices', newVerts);
                    updateGeometry(selectedKey, 'surfaces', newSurfs);
                  }}
                  style={{ color: '#a78bfa', borderColor: 'rgba(167,139,250,0.3)' }}
                >
                  + Add Triangle
                </Button>
              </div>
            </div>

            {/* Triangles section */}
            <div style={{ flex: 1, overflow: 'auto', padding: '16px', minHeight: 0 }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {selectedGeom.vertices?.length > 0 ? (
                  selectedGeom.vertices.map((triangle, triIdx) => (
                    <div
                      key={triIdx}
                      style={{
                        background: 'rgba(167,139,250,0.05)',
                        border: '1px solid rgba(167,139,250,0.15)',
                        borderRadius: '8px',
                        padding: '14px',
                      }}
                    >
                      <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        marginBottom: '12px',
                      }}>
                        <span style={{
                          color: '#a78bfa',
                          fontSize: '12px',
                          fontWeight: 600,
                        }}>
                          Triangle {triIdx + 1}
                        </span>
                        <button
                          onClick={() => {
                            const newVerts = selectedGeom.vertices.filter((_, i) => i !== triIdx);
                            const newSurfs = (selectedGeom.surfaces || []).filter((_, i) => i !== triIdx);
                            updateGeometry(selectedKey, 'vertices', newVerts);
                            updateGeometry(selectedKey, 'surfaces', newSurfs);
                          }}
                          style={{
                            background: 'rgba(239,68,68,0.1)',
                            border: '1px solid rgba(239,68,68,0.2)',
                            color: '#ef4444',
                            padding: '3px 10px',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            fontSize: '10px',
                          }}
                        >
                          Remove
                        </button>
                      </div>

                      <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
                        gap: '16px',
                      }}>
                        {/* Vertices */}
                        <div>
                          <label style={{
                            display: 'block',
                            color: 'rgba(255,255,255,0.6)',
                            fontSize: '11px',
                            marginBottom: '8px',
                            fontWeight: 500,
                          }}>
                            Vertices (X, Y, Z)
                          </label>
                          {triangle.map((vertex, vIdx) => (
                            <div key={vIdx} style={{ display: 'flex', gap: '4px', marginBottom: '6px', alignItems: 'center' }}>
                              <span style={{
                                color: vIdx === 0 ? '#ef4444' : vIdx === 1 ? '#22c55e' : '#3b82f6',
                                fontSize: '10px',
                                width: '16px',
                                fontWeight: 600,
                              }}>V{vIdx + 1}</span>
                              {vertex.map((coord, cIdx) => (
                                <InputNumber
                                  key={cIdx}
                                  value={coord}
                                  step={0.1}
                                  onChange={(val) => {
                                    const newVerts = JSON.parse(JSON.stringify(selectedGeom.vertices));
                                    newVerts[triIdx][vIdx][cIdx] = val;
                                    updateGeometry(selectedKey, 'vertices', newVerts);
                                  }}
                                  size="xs"
                                  style={{ width: '60px' }}
                                />
                              ))}
                            </div>
                          ))}
                        </div>

                        {/* UVs */}
                        <div>
                          <label style={{
                            display: 'block',
                            color: 'rgba(255,255,255,0.6)',
                            fontSize: '11px',
                            marginBottom: '8px',
                            fontWeight: 500,
                          }}>
                            UVs (U, V)
                          </label>
                          {(selectedGeom.surfaces?.[triIdx] || [[0, 0], [0, 0], [0, 0]]).map((uv, uvIdx) => (
                            <div key={uvIdx} style={{ display: 'flex', gap: '4px', marginBottom: '6px', alignItems: 'center' }}>
                              <span style={{
                                color: 'rgba(255,255,255,0.4)',
                                fontSize: '10px',
                                width: '16px'
                              }}>{uvIdx + 1}:</span>
                              {uv.map((coord, cIdx) => (
                                <InputNumber
                                  key={cIdx}
                                  value={coord}
                                  step={0.1}
                                  onChange={(val) => {
                                    const newSurfs = JSON.parse(JSON.stringify(selectedGeom.surfaces || []));
                                    if (!newSurfs[triIdx]) newSurfs[triIdx] = [[0, 0], [0, 0], [0, 0]];
                                    newSurfs[triIdx][uvIdx][cIdx] = val;
                                    updateGeometry(selectedKey, 'surfaces', newSurfs);
                                  }}
                                  size="xs"
                                  style={{ width: '60px' }}
                                />
                              ))}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div style={{
                    textAlign: 'center',
                    padding: '50px 20px',
                    color: 'rgba(255,255,255,0.4)',
                    fontSize: '12px',
                    background: 'rgba(0,0,0,0.2)',
                    borderRadius: '8px',
                  }}>
                    No triangles defined.<br />
                    Click "+ Add Triangle" to create geometry.
                  </div>
                )}
              </div>
            </div>
          </>
        ) : (
          <div style={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'rgba(255,255,255,0.4)',
            fontSize: '14px',
            textAlign: 'center',
          }}>
            <div>
              <div style={{ fontSize: '48px', marginBottom: '16px', opacity: 0.5 }}>📐</div>
              Select geometry from the list<br />
              or create a new one.
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default collect(GeometryEditor);