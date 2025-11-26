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
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { collect } from 'react-recollect';
import {
  InputNumber,
  Button,
  Message,
  Input,
} from 'rsuite';

// Simple 3D wireframe preview using Canvas 2D
function GeometryPreview({ geometry }) {
  const canvasRef = useRef(null);
  const [rotation, setRotation] = useState(0);
  
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !geometry?.vertices) return;
    
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;
    
    // Clear
    ctx.fillStyle = '#1a1a2e';
    ctx.fillRect(0, 0, width, height);
    
    // Draw grid
    ctx.strokeStyle = 'rgba(255,255,255,0.1)';
    ctx.lineWidth = 0.5;
    for (let i = 0; i <= 10; i++) {
      const x = (i / 10) * width;
      const y = (i / 10) * height;
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }
    
    // Simple isometric projection
    const cos = Math.cos(rotation);
    const sin = Math.sin(rotation);
    const scale = 80;
    const cx = width / 2;
    const cy = height / 2;
    
    const project = (x, y, z) => {
      // Rotate around Y axis
      const rx = x * cos - z * sin;
      const rz = x * sin + z * cos;
      // Isometric projection
      const px = cx + (rx - rz) * scale * 0.7;
      const py = cy - y * scale * 0.8 + (rx + rz) * scale * 0.3;
      return [px, py];
    };
    
    // Draw triangles
    ctx.strokeStyle = '#7dd3fc';
    ctx.fillStyle = 'rgba(125, 211, 252, 0.15)';
    ctx.lineWidth = 1.5;
    
    (geometry.vertices || []).forEach((tri) => {
      if (!tri || tri.length < 3) return;
      
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
    
    // Draw axes
    ctx.lineWidth = 2;
    const [ox, oy] = project(0, 0, 0);
    
    // X axis (red)
    ctx.strokeStyle = '#ef4444';
    ctx.beginPath();
    ctx.moveTo(ox, oy);
    const [ax, ay] = project(0.5, 0, 0);
    ctx.lineTo(ax, ay);
    ctx.stroke();
    
    // Y axis (green)
    ctx.strokeStyle = '#22c55e';
    ctx.beginPath();
    ctx.moveTo(ox, oy);
    const [bx, by] = project(0, 0.5, 0);
    ctx.lineTo(bx, by);
    ctx.stroke();
    
    // Z axis (blue)
    ctx.strokeStyle = '#3b82f6';
    ctx.beginPath();
    ctx.moveTo(ox, oy);
    const [dx, dy] = project(0, 0, 0.5);
    ctx.lineTo(dx, dy);
    ctx.stroke();
  }, [geometry, rotation]);
  
  // Auto-rotate
  useEffect(() => {
    const interval = setInterval(() => {
      setRotation(r => r + 0.02);
    }, 50);
    return () => clearInterval(interval);
  }, []);
  
  return (
    <canvas 
      ref={canvasRef} 
      width={200} 
      height={200}
      style={{ 
        borderRadius: '8px',
        background: '#1a1a2e',
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

  const renameGeometry = useCallback((oldKey, newKey) => {
    const cleanKey = newKey.trim().toUpperCase().replace(/\s+/g, '_');
    if (!cleanKey || cleanKey === oldKey) return;
    if (geometryMap[cleanKey]) {
      setError(`Geometry "${cleanKey}" already exists`);
      return;
    }
    const { [oldKey]: geom, ...rest } = geometryMap;
    setGeometryMap({ ...rest, [cleanKey]: geom });
    if (selectedKey === oldKey) setSelectedKey(cleanKey);
    setError(null);
  }, [geometryMap, selectedKey]);

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
      {/* Left sidebar - Geometry list */}
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
            placeholder="🔍 Search..."
            value={searchFilter}
            onChange={setSearchFilter}
            style={{ marginBottom: '8px' }}
          />
          {/* Add new */}
          <div style={{ display: 'flex', gap: '4px' }}>
            <Input
              size="xs"
              placeholder="NEW_NAME"
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
                <div style={{ color: '#e6eef8', fontSize: '12px', fontWeight: 600, wordBreak: 'break-all' }}>
                  {key}
                </div>
                <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '10px', marginTop: '2px' }}>
                  {triCount} triangle{triCount !== 1 ? 's' : ''} • type: {geom.type ?? 0}
                </div>
              </div>
            );
          })}
          {geometryKeys.length === 0 && (
            <div style={{ textAlign: 'center', padding: '20px', color: 'rgba(255,255,255,0.4)', fontSize: '12px' }}>
              {searchFilter ? 'No matches found' : 'No geometry defined'}
            </div>
          )}
        </div>

        {/* Save button */}
        <div style={{ padding: '12px', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
          <Button appearance='primary' block size="sm" onClick={handleSave}>
            💾 Save Changes
          </Button>
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
              <GeometryPreview geometry={selectedGeom} />
              
              {/* Properties */}
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px', flexWrap: 'wrap' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <label style={{ color: 'rgba(255,255,255,0.6)', fontSize: '11px' }}>Name:</label>
                    <Input
                      value={selectedKey}
                      onChange={(val) => renameGeometry(selectedKey, val)}
                      size="sm"
                      style={{ width: '180px', fontFamily: 'monospace' }}
                    />
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <label style={{ color: 'rgba(255,255,255,0.6)', fontSize: '11px' }}>Type:</label>
                    <InputNumber
                      value={selectedGeom.type ?? 0}
                      onChange={(val) => updateGeometry(selectedKey, 'type', val)}
                      size="sm"
                      min={0}
                      max={15}
                      style={{ width: '70px' }}
                    />
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <Button appearance='ghost' size="xs" onClick={() => duplicateGeometry(selectedKey)} style={{ color: '#7dd3fc' }}>
                    ⧉ Duplicate
                  </Button>
                  <Button appearance='ghost' size="xs" onClick={() => deleteGeometry(selectedKey)} style={{ color: '#ef4444' }}>
                    🗑 Delete
                  </Button>
                </div>
                <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: '10px', marginTop: '10px' }}>
                  Type bitmask: 0=none, 1=floor, 2=wall, 4=ceiling, 8=ramp (combine with +)
                </div>
              </div>
            </div>

            {/* Triangles section */}
            <div style={{ flex: 1, overflow: 'auto', padding: '16px', minHeight: 0 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <h5 style={{ margin: 0, color: '#a78bfa', fontSize: '13px', fontWeight: 600 }}>
                  Triangles ({selectedGeom.vertices?.length || 0})
                </h5>
                <Button 
                  appearance='ghost' 
                  size="xs" 
                  onClick={() => {
                    const newVerts = [...(selectedGeom.vertices || []), [[0,0,0], [1,0,0], [0,1,0]]];
                    const newSurfs = [...(selectedGeom.surfaces || []), [[0,0], [1,0], [0,1]]];
                    updateGeometry(selectedKey, 'vertices', newVerts);
                    updateGeometry(selectedKey, 'surfaces', newSurfs);
                  }}
                  style={{ color: '#a78bfa' }}
                >
                  + Add Triangle
                </Button>
              </div>

              {selectedGeom.vertices?.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {selectedGeom.vertices.map((triangle, triIdx) => (
                    <div
                      key={triIdx}
                      style={{
                        background: 'rgba(167,139,250,0.08)',
                        border: '1px solid rgba(167,139,250,0.2)',
                        borderRadius: '8px',
                        padding: '12px',
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                        <span style={{ color: '#a78bfa', fontSize: '11px', fontWeight: 600 }}>
                          Triangle #{triIdx + 1}
                        </span>
                        <button
                          onClick={() => {
                            const newVerts = selectedGeom.vertices.filter((_, i) => i !== triIdx);
                            const newSurfs = (selectedGeom.surfaces || []).filter((_, i) => i !== triIdx);
                            updateGeometry(selectedKey, 'vertices', newVerts);
                            updateGeometry(selectedKey, 'surfaces', newSurfs);
                          }}
                          style={{
                            background: 'rgba(239,68,68,0.15)',
                            border: '1px solid rgba(239,68,68,0.3)',
                            color: '#ef4444',
                            padding: '3px 8px',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            fontSize: '10px',
                          }}
                        >
                          Remove
                        </button>
                      </div>

                      <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap' }}>
                        {/* Vertices */}
                        <div>
                          <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: '10px', marginBottom: '6px', fontWeight: 500 }}>
                            Vertices (X, Y, Z)
                          </div>
                          {triangle.map((vertex, vIdx) => (
                            <div key={vIdx} style={{ display: 'flex', gap: '4px', marginBottom: '4px', alignItems: 'center' }}>
                              <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: '10px', width: '14px' }}>{vIdx + 1}:</span>
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
                          <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: '10px', marginBottom: '6px', fontWeight: 500 }}>
                            UVs (U, V)
                          </div>
                          {(selectedGeom.surfaces?.[triIdx] || [[0,0],[0,0],[0,0]]).map((uv, uvIdx) => (
                            <div key={uvIdx} style={{ display: 'flex', gap: '4px', marginBottom: '4px', alignItems: 'center' }}>
                              <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: '10px', width: '14px' }}>{uvIdx + 1}:</span>
                              {uv.map((coord, cIdx) => (
                                <InputNumber
                                  key={cIdx}
                                  value={coord}
                                  step={0.1}
                                  onChange={(val) => {
                                    const newSurfs = JSON.parse(JSON.stringify(selectedGeom.surfaces || []));
                                    if (!newSurfs[triIdx]) newSurfs[triIdx] = [[0,0],[0,0],[0,0]];
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
                  ))}
                </div>
              ) : (
                <div style={{
                  textAlign: 'center',
                  padding: '50px 20px',
                  color: 'rgba(255,255,255,0.4)',
                  fontSize: '12px',
                  background: 'rgba(0,0,0,0.2)',
                  borderRadius: '8px',
                }}>
                  No triangles defined.<br/>
                  Click "+ Add Triangle" to create geometry.
                </div>
              )}
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
              Select geometry from the list<br/>
              or create a new one.
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default collect(GeometryEditor);