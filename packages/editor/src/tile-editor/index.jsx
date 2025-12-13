/*
 * ---------------------------------------------------------------
 *                Pixospritz – Editor – Tile Editor
 * ---------------------------------------------------------------
 * Copyright (c) 2022‑2025  Kyle Derby MacInnis
 *
 * The TileEditor allows composition of tiles from multiple geometry
 * pieces. Tiles are defined in tiles.json as named entries, where each
 * tile is an array of triplets: [geometry, texture, zOffset, ...]
 * 
 * Example format:
 *   "FLOOR": ["FLAT_ALL", "FLOOR", 0],
 *   "N_WALL": ["WALL_T", "WALL", 2, "FLAT_ALL", "EMPTY_B", 2]
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { collect } from 'react-recollect';
import {
  InputNumber,
  Button,
  Message,
  SelectPicker,
  Input,
} from 'rsuite';

// Isometric tile preview with Z-up coordinate system (matching engine)
// X: East/West, Y: North/South, Z: Up/Down
function TilePreview({ components, geometryData, size = 180 }) {
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
    
    if (!components || components.length === 0) {
      ctx.fillStyle = 'rgba(255,255,255,0.3)';
      ctx.font = '11px system-ui, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('No layers', width / 2, height / 2);
      return;
    }
    
    // Z-up isometric projection (matching engine)
    // Camera orbits around Z axis, looking down at ~30°
    const cos = Math.cos(rotation);
    const sin = Math.sin(rotation);
    const scale = size * 0.28;
    const cx = width / 2;
    const cy = height / 2 + 15;
    
    // Project 3D point to 2D with Z-up coordinate system
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
    const corners = [[0,0,0], [1,0,0], [1,1,0], [0,1,0]];
    corners.forEach((c, i) => {
      const [px, py] = project(c[0], c[1], c[2]);
      if (i === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    });
    ctx.closePath();
    ctx.stroke();
    
    // Color palette for layers
    const layerColors = [
      'rgba(125, 211, 252, 0.4)', // cyan
      'rgba(167, 139, 250, 0.4)', // purple
      'rgba(74, 222, 128, 0.4)',  // green
      'rgba(251, 191, 36, 0.4)',  // amber
      'rgba(244, 114, 182, 0.4)', // pink
    ];
    
    // Draw each layer
    components.forEach((comp, idx) => {
      // Z offset is now applied to Z coordinate (up direction)
      const zOff = (comp.zOffset || 0) * 0.1;
      const color = layerColors[idx % layerColors.length];
      const strokeColor = color.replace('0.4)', '0.8)');
      
      // Get geometry data if available
      let vertices = null;
      if (geometryData && comp.geometry && geometryData[comp.geometry]) {
        vertices = geometryData[comp.geometry].vertices;
      }
      
      if (vertices && vertices.length > 0) {
        // Draw actual geometry with Z offset applied to Z coordinate
        ctx.fillStyle = color;
        ctx.strokeStyle = strokeColor;
        ctx.lineWidth = 1.5;
        
        vertices.forEach(tri => {
          if (!tri || tri.length < 3) return;
          ctx.beginPath();
          // Apply zOff to Z coordinate (third component, the up direction)
          const [p0x, p0y] = project(tri[0][0], tri[0][1], tri[0][2] + zOff);
          ctx.moveTo(p0x, p0y);
          for (let i = 1; i < 3; i++) {
            const [px, py] = project(tri[i][0], tri[i][1], tri[i][2] + zOff);
            ctx.lineTo(px, py);
          }
          ctx.closePath();
          ctx.fill();
          ctx.stroke();
        });
      } else {
        // Draw placeholder tile shape on XY plane at Z = zOff
        ctx.fillStyle = color;
        ctx.strokeStyle = strokeColor;
        ctx.lineWidth = 1.5;
        
        // Draw a simple flat square on the XY plane at height zOff
        ctx.beginPath();
        const [p1x, p1y] = project(0, 0, zOff);
        const [p2x, p2y] = project(1, 0, zOff);
        const [p3x, p3y] = project(1, 1, zOff);
        const [p4x, p4y] = project(0, 1, zOff);
        ctx.moveTo(p1x, p1y);
        ctx.lineTo(p2x, p2y);
        ctx.lineTo(p3x, p3y);
        ctx.lineTo(p4x, p4y);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
      }
      
      // Draw layer label
      const [labelX, labelY] = project(0.5, 0.5, zOff + 0.2);
      ctx.fillStyle = 'rgba(255,255,255,0.7)';
      ctx.font = 'bold 9px system-ui, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(comp.geometry || '?', labelX, labelY);
    });
    
    // Draw axes (Z-up coordinate system)
    ctx.lineWidth = 2;
    const [ox, oy] = project(0, 0, 0);
    
    // X axis (red) - East
    ctx.strokeStyle = '#ef4444';
    ctx.beginPath();
    ctx.moveTo(ox, oy);
    const [ax, ay] = project(0.3, 0, 0);
    ctx.lineTo(ax, ay);
    ctx.stroke();
    
    // Y axis (green) - North
    ctx.strokeStyle = '#22c55e';
    ctx.beginPath();
    ctx.moveTo(ox, oy);
    const [bx, by] = project(0, 0.3, 0);
    ctx.lineTo(bx, by);
    ctx.stroke();
    
    // Z axis (blue) - Up
    ctx.strokeStyle = '#3b82f6';
    ctx.beginPath();
    ctx.moveTo(ox, oy);
    const [zx, zy] = project(0, 0, 0.3);
    ctx.lineTo(zx, zy);
    ctx.stroke();
    
    // Draw info
    ctx.fillStyle = 'rgba(255,255,255,0.4)';
    ctx.font = '9px system-ui';
    ctx.textAlign = 'left';
    ctx.fillText(`${components.length} layer(s)`, 6, height - 6);
    ctx.textAlign = 'right';
    ctx.fillText('Z-up', width - 6, height - 6);
    
  }, [components, geometryData, rotation, size]);
  
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
        borderRadius: '8px',
        background: '#0d1117',
        border: '1px solid rgba(255,255,255,0.1)',
      }}
    />
  );
}

/**
 * Parse a tile array into components (triplets of [geometry, texture, zOffset])
 * Some tiles may have an extra 4th value (flags)
 */
function parseTileComponents(arr) {
  const components = [];
  let i = 0;
  while (i < arr.length) {
    const geometry = arr[i];
    const texture = arr[i + 1];
    const zOffset = arr[i + 2] ?? 0;
    i += 3;
    // Check if next value is a number (flag) before another geometry name
    let flags = null;
    if (i < arr.length && typeof arr[i] === 'number' && 
        (i + 1 >= arr.length || typeof arr[i + 1] !== 'string')) {
      flags = arr[i];
      i++;
    }
    components.push({ geometry, texture, zOffset, flags });
  }
  return components;
}

/**
 * Convert components back to the flat array format
 */
function componentsToArray(components) {
  const arr = [];
  for (const comp of components) {
    arr.push(comp.geometry, comp.texture, comp.zOffset);
    if (comp.flags !== null && comp.flags !== undefined) {
      arr.push(comp.flags);
    }
  }
  return arr;
}

function TileEditor({ content, onSave, geometryContent, textureList = [] }) {
  // tiles: Object with named keys
  const [tiles, setTiles] = useState({});
  const [tileNames, setTileNames] = useState([]);
  const [selectedTileName, setSelectedTileName] = useState(null);
  const [geometryNames, setGeometryNames] = useState([]);
  const [geometryData, setGeometryData] = useState(null);
  const [error, setError] = useState(null);
  const [newTileName, setNewTileName] = useState('');
  const [renamingTile, setRenamingTile] = useState(null);
  const [renameValue, setRenameValue] = useState('');
  const [searchFilter, setSearchFilter] = useState('');

  // Parse incoming tile content
  useEffect(() => {
    if (content) {
      try {
        const obj = JSON.parse(content);
        // tiles.json is a flat object with named tiles
        if (obj && typeof obj === 'object' && !Array.isArray(obj)) {
          setTiles(obj);
          const names = Object.keys(obj);
          setTileNames(names);
          if (names.length > 0 && !selectedTileName) {
            setSelectedTileName(names[0]);
          }
        }
        setError(null);
      } catch (err) {
        console.warn('Failed to parse tiles JSON', err);
        setError('Invalid tiles.json format');
      }
    }
  }, [content]);

  // Parse geometry content to get geometry names and data
  useEffect(() => {
    if (geometryContent) {
      try {
        const obj = JSON.parse(geometryContent);
        if (obj && typeof obj === 'object') {
          setGeometryNames(Object.keys(obj));
          setGeometryData(obj);
        }
      } catch (err) {
        console.warn('Failed to parse geometry JSON', err);
      }
    }
  }, [geometryContent]);

  // Get current tile's components
  const selectedTileArray = selectedTileName ? tiles[selectedTileName] : null;
  const components = selectedTileArray ? parseTileComponents(selectedTileArray) : [];

  // Update a component
  const updateComponent = useCallback((compIdx, field, value) => {
    if (!selectedTileName) return;
    
    const newComponents = [...components];
    newComponents[compIdx] = { ...newComponents[compIdx], [field]: value };
    
    setTiles(prev => ({
      ...prev,
      [selectedTileName]: componentsToArray(newComponents)
    }));
  }, [selectedTileName, components]);

  // Add a component
  const addComponent = useCallback(() => {
    if (!selectedTileName) return;
    
    const newComponents = [...components, { 
      geometry: geometryNames[0] || 'FLAT_ALL', 
      texture: 'FLOOR', 
      zOffset: 0,
      flags: null
    }];
    
    setTiles(prev => ({
      ...prev,
      [selectedTileName]: componentsToArray(newComponents)
    }));
  }, [selectedTileName, components, geometryNames]);

  // Remove a component
  const removeComponent = useCallback((compIdx) => {
    if (!selectedTileName) return;
    
    const newComponents = components.filter((_, i) => i !== compIdx);
    
    setTiles(prev => ({
      ...prev,
      [selectedTileName]: componentsToArray(newComponents)
    }));
  }, [selectedTileName, components]);

  // Add a new tile
  const addTile = useCallback(() => {
    const name = newTileName.trim().toUpperCase().replace(/\s+/g, '_');
    if (!name) return;
    if (tiles[name]) {
      setError(`Tile "${name}" already exists`);
      return;
    }
    
    setTiles(prev => ({
      ...prev,
      [name]: ['FLAT_ALL', 'FLOOR', 0]
    }));
    setTileNames(prev => [...prev, name]);
    setSelectedTileName(name);
    setNewTileName('');
    setError(null);
  }, [newTileName, tiles]);

  // Delete a tile
  const deleteTile = useCallback((name) => {
    const newTiles = { ...tiles };
    delete newTiles[name];
    setTiles(newTiles);
    setTileNames(prev => prev.filter(n => n !== name));
    if (selectedTileName === name) {
      const remaining = Object.keys(newTiles);
      setSelectedTileName(remaining.length > 0 ? remaining[0] : null);
    }
  }, [tiles, selectedTileName]);

  // Rename a tile
  const renameTile = useCallback((oldName) => {
    const newName = renameValue.trim().toUpperCase().replace(/\s+/g, '_');
    if (!newName || newName === oldName) {
      setRenamingTile(null);
      return;
    }
    if (tiles[newName]) {
      setError(`Tile "${newName}" already exists`);
      return;
    }
    
    const newTiles = { ...tiles };
    newTiles[newName] = newTiles[oldName];
    delete newTiles[oldName];
    
    setTiles(newTiles);
    setTileNames(prev => prev.map(n => n === oldName ? newName : n));
    if (selectedTileName === oldName) {
      setSelectedTileName(newName);
    }
    setRenamingTile(null);
    setRenameValue('');
    setError(null);
  }, [tiles, renameValue, selectedTileName]);

  // Duplicate a tile
  const duplicateTile = useCallback((name) => {
    let newName = `${name}_COPY`;
    let counter = 1;
    while (tiles[newName]) {
      newName = `${name}_COPY_${counter++}`;
    }
    
    setTiles(prev => ({
      ...prev,
      [newName]: [...prev[name]]
    }));
    setTileNames(prev => [...prev, newName]);
    setSelectedTileName(newName);
  }, [tiles]);

  // Save handler
  const handleSave = useCallback(() => {
    if (onSave) {
      onSave(tiles);
    } else {
    }
  }, [tiles, onSave]);

  // Geometry picker options
  const geometryOptions = geometryNames.map(name => ({
    label: name,
    value: name,
  }));

  // Texture options from textureList
  const textureOptions = textureList.map(name => ({
    label: name,
    value: name,
  }));

  return (
    <div style={{ 
      position: 'relative',
      width: '100%',
      height: '100%',
      display: 'flex',
      overflow: 'hidden',
      background: 'linear-gradient(135deg, rgba(7,20,38,0.98), rgba(4,12,20,0.98))',
    }}>
      {/* Left panel - Tile list */}
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
            🧩 Tiles ({Object.keys(tiles).length})
          </h4>
          {/* Search */}
          <Input
            size="xs"
            placeholder="🔍 Search tiles..."
            value={searchFilter}
            onChange={setSearchFilter}
            style={{ marginBottom: '8px' }}
          />
          {/* Add new */}
          <div style={{ display: 'flex', gap: '6px' }}>
            <Input
              value={newTileName}
              onChange={setNewTileName}
              placeholder="NEW_TILE"
              size="xs"
              style={{ flex: 1 }}
              onKeyDown={(e) => e.key === 'Enter' && addTile()}
            />
            <Button appearance='primary' size="xs" onClick={addTile}>+</Button>
          </div>
        </div>

        {/* Tile list */}
        <div style={{ flex: 1, overflow: 'auto', padding: '8px' }}>
          {tileNames.filter(n => !searchFilter || n.toLowerCase().includes(searchFilter.toLowerCase())).map((name) => {
            const tileArr = tiles[name];
            const compCount = parseTileComponents(tileArr || []).length;
            
            return (
              <div
                key={name}
                onClick={() => setSelectedTileName(name)}
                style={{
                  padding: '10px',
                  marginBottom: '4px',
                  background: selectedTileName === name ? 'rgba(125,211,252,0.2)' : 'rgba(255,255,255,0.03)',
                  border: `1px solid ${selectedTileName === name ? 'rgba(125,211,252,0.5)' : 'transparent'}`,
                  borderRadius: '6px',
                  cursor: 'pointer',
                  transition: 'all 0.15s',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  {renamingTile === name ? (
                    <Input
                      value={renameValue}
                      onChange={setRenameValue}
                      size="xs"
                      autoFocus
                      onBlur={() => renameTile(name)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') renameTile(name);
                        if (e.key === 'Escape') setRenamingTile(null);
                      }}
                      onClick={(e) => e.stopPropagation()}
                      style={{ width: '120px' }}
                    />
                  ) : (
                    <div 
                      onDoubleClick={(e) => {
                        e.stopPropagation();
                        setRenamingTile(name);
                        setRenameValue(name);
                      }}
                      style={{ flex: 1 }}
                    >
                      <div style={{ color: '#e6eef8', fontSize: '12px', fontWeight: 500 }}>{name}</div>
                      <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: '10px' }}>
                        {compCount} layer{compCount !== 1 ? 's' : ''}
                      </div>
                    </div>
                  )}
                  <div style={{ display: 'flex', gap: '4px' }}>
                    <button
                      onClick={(e) => { e.stopPropagation(); duplicateTile(name); }}
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
                      onClick={(e) => { e.stopPropagation(); deleteTile(name); }}
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
          
          {tileNames.length === 0 && (
            <div style={{ textAlign: 'center', padding: '20px', color: 'rgba(255,255,255,0.4)', fontSize: '12px' }}>
              No tiles defined.
            </div>
          )}
        </div>

        {/* Save button */}
        <div style={{ padding: '12px', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
          <Button appearance='primary' block onClick={handleSave}>💾 Save Tiles</Button>
        </div>
      </div>

      {/* Main panel */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', minWidth: 0 }}>
        {error && (
          <div style={{ padding: '8px 12px', flexShrink: 0 }}>
            <Message type='error' description={error} closable onClose={() => setError(null)} />
          </div>
        )}

        {selectedTileName && selectedTileArray ? (
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
              <TilePreview components={components} geometryData={geometryData} />
              
              {/* Info */}
              <div style={{ flex: 1 }}>
                <h4 style={{ margin: '0 0 8px 0', color: '#7dd3fc', fontSize: '18px' }}>{selectedTileName}</h4>
                <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '11px', marginBottom: '12px', fontFamily: 'monospace' }}>
                  [{selectedTileArray.map(v => typeof v === 'string' ? `"${v}"` : v).join(', ')}]
                </div>
                <Button 
                  appearance='ghost' 
                  size="sm" 
                  onClick={addComponent}
                  style={{ color: '#a78bfa', borderColor: 'rgba(167,139,250,0.3)' }}
                >
                  + Add Layer
                </Button>
                {!geometryContent && (
                  <div style={{ color: '#fbbf24', fontSize: '10px', marginTop: '10px' }}>
                    ⚠ Load geometry.json from same folder for better preview & dropdowns
                  </div>
                )}
              </div>
            </div>

            {/* Layers section */}
            <div style={{ flex: 1, overflow: 'auto', padding: '16px', minHeight: 0 }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {components.map((comp, compIdx) => (
                  <div
                    key={compIdx}
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
                        Layer {compIdx + 1}
                      </span>
                      <button
                        onClick={() => removeComponent(compIdx)}
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
                      gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
                      gap: '12px',
                    }}>
                      {/* Geometry selector */}
                      <div>
                        <label style={{ 
                          display: 'block', 
                          color: 'rgba(255,255,255,0.6)', 
                          fontSize: '11px',
                          marginBottom: '4px',
                          fontWeight: 500,
                        }}>
                          Geometry
                        </label>
                        {geometryNames.length > 0 ? (
                          <SelectPicker
                            data={geometryOptions}
                            value={comp.geometry}
                            onChange={(val) => updateComponent(compIdx, 'geometry', val)}
                            size="sm"
                            block
                            placeholder="Select geometry..."
                            cleanable={false}
                            searchable
                          />
                        ) : (
                          <Input
                            value={comp.geometry || ''}
                            onChange={(val) => updateComponent(compIdx, 'geometry', val)}
                            size="sm"
                            placeholder="FLAT_ALL"
                          />
                        )}
                      </div>

                      {/* Texture input */}
                      <div>
                        <label style={{ 
                          display: 'block', 
                          color: 'rgba(255,255,255,0.6)', 
                          fontSize: '11px',
                          marginBottom: '4px',
                          fontWeight: 500,
                        }}>
                          Texture
                        </label>
                        {textureList.length > 0 ? (
                          <SelectPicker
                            data={textureOptions}
                            value={comp.texture}
                            onChange={(val) => updateComponent(compIdx, 'texture', val)}
                            size="sm"
                            block
                            placeholder="Select texture..."
                            searchable
                          />
                        ) : (
                          <Input
                            value={comp.texture || ''}
                            onChange={(val) => updateComponent(compIdx, 'texture', val)}
                            size="sm"
                            placeholder="FLOOR"
                          />
                        )}
                      </div>

                      {/* Z Offset */}
                      <div>
                        <label style={{ 
                          display: 'block', 
                          color: 'rgba(255,255,255,0.6)', 
                          fontSize: '11px',
                          marginBottom: '4px',
                          fontWeight: 500,
                        }}>
                          Z Offset
                        </label>
                        <InputNumber
                          value={comp.zOffset ?? 0}
                          onChange={(val) => updateComponent(compIdx, 'zOffset', val)}
                          size="sm"
                          step={0.5}
                          style={{ width: '100%' }}
                        />
                      </div>

                      {/* Flags (optional) */}
                      <div>
                        <label style={{ 
                          display: 'block', 
                          color: 'rgba(255,255,255,0.6)', 
                          fontSize: '11px',
                          marginBottom: '4px',
                          fontWeight: 500,
                        }}>
                          Flags (optional)
                        </label>
                        <InputNumber
                          value={comp.flags ?? ''}
                          onChange={(val) => updateComponent(compIdx, 'flags', val === '' ? null : val)}
                          size="sm"
                          style={{ width: '100%' }}
                          placeholder="—"
                        />
                      </div>
                    </div>
                  </div>
                ))}

                {components.length === 0 && (
                  <div style={{
                    textAlign: 'center',
                    padding: '50px 20px',
                    color: 'rgba(255,255,255,0.4)',
                    fontSize: '12px',
                    background: 'rgba(0,0,0,0.2)',
                    borderRadius: '8px',
                  }}>
                    No layers defined for this tile.<br/>
                    Click "+ Add Layer" to add geometry components.
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
              <div style={{ fontSize: '48px', marginBottom: '16px', opacity: 0.5 }}>🧩</div>
              Select a tile from the list<br/>
              or create a new one to begin editing.
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default collect(TileEditor);
