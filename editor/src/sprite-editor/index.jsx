/*
 * ---------------------------------------------------------------
 *                 Pixospritz – Editor – Sprite Editor
 * ---------------------------------------------------------------
 * Copyright (c) 2022‑2025  Kyle Derby MacInnis
 *
 * A full-featured sprite editor for Pixospritz. Supports:
 * - Canvas-based sprite rendering
 * - Camera pan/zoom controls (event-isolated)
 * - Undo/redo stack for sprite edits
 * - Save/resave button for exporting sprite data
 * - Frame/tile editing and palette support
 */

import React, { useRef, useState, useEffect } from 'react';
import { Panel, Container, Row, Col, Button, Message, Input } from 'rsuite';

const DEFAULT_SIZE = 32;
const DEFAULT_FRAMES = 1;
const DEFAULT_PALETTE = [
  '#000000', '#ffffff', '#ff0000', '#00ff00', '#0000ff', '#ffff00', '#00ffff', '#ff00ff'
];

function SpriteEditor({ content, onSave }) {
  // Sprite state
  const [frames, setFrames] = useState(DEFAULT_FRAMES);
  const [currentFrame, setCurrentFrame] = useState(0);
  const [palette, setPalette] = useState(DEFAULT_PALETTE);
  const [pixels, setPixels] = useState(
    Array.from({ length: DEFAULT_FRAMES }, () =>
      Array.from({ length: DEFAULT_SIZE }, () => Array(DEFAULT_SIZE).fill(0))
    )
  );
  const [selectedColor, setSelectedColor] = useState(1);
  const [error, setError] = useState(null);
  const [history, setHistory] = useState([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [camera, setCamera] = useState({ x: 0, y: 0, zoom: 16 });
  const cameraRef = useRef(camera);
  cameraRef.current = camera;
  const [dragging, setDragging] = useState(false);
  const dragStart = useRef({ x: 0, y: 0 });
  const canvasRef = useRef();

  // Push history
  function pushHistorySnapshot(newPixels) {
    const snapshot = JSON.parse(JSON.stringify(newPixels));
    setHistory((prev) => {
      const trimmed = prev.slice(0, historyIndex + 1);
      const updated = [...trimmed, snapshot];
      setHistoryIndex(updated.length - 1);
      return updated;
    });
  }

  // Undo/redo
  function undo() {
    if (historyIndex > 0) {
      setPixels(history[historyIndex - 1]);
      setHistoryIndex(historyIndex - 1);
    }
  }
  function redo() {
    if (historyIndex < history.length - 1) {
      setPixels(history[historyIndex + 1]);
      setHistoryIndex(historyIndex + 1);
    }
  }

  // Mouse/touch camera controls
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
    let zoom = cameraRef.current.zoom + (e.deltaY < 0 ? 2 : -2);
    zoom = Math.max(4, Math.min(64, zoom));
    setCamera((prev) => ({ ...prev, zoom }));
  }
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

  // Draw sprite
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.save();
    ctx.translate(camera.x, camera.y);
    ctx.scale(camera.zoom, camera.zoom);
    for (let y = 0; y < DEFAULT_SIZE; y++) {
      for (let x = 0; x < DEFAULT_SIZE; x++) {
        ctx.fillStyle = palette[pixels[currentFrame][y][x]];
        ctx.fillRect(x, y, 1, 1);
      }
    }
    ctx.restore();
  }, [pixels, currentFrame, palette, camera]);

  // Paint pixel
  function handleCanvasClick(e) {
    const rect = canvasRef.current.getBoundingClientRect();
    const x = Math.floor((e.clientX - rect.left - camera.x) / camera.zoom);
    const y = Math.floor((e.clientY - rect.top - camera.y) / camera.zoom);
    if (x >= 0 && x < DEFAULT_SIZE && y >= 0 && y < DEFAULT_SIZE) {
      const newPixels = JSON.parse(JSON.stringify(pixels));
      newPixels[currentFrame][y][x] = selectedColor;
      setPixels(newPixels);
      pushHistorySnapshot(newPixels);
    }
  }

  // Save sprite
  function handleSave() {
    const spriteData = { frames, palette, pixels };
    if (onSave) {
      onSave(spriteData);
    } else {
      console.log('Sprite saved:', JSON.stringify(spriteData, null, 2));
    }
  }

  return (
    <Container style={{ padding: '1rem' }}>
      <Row>
        <Col sm={18} md={18} lg={18}>
          <Panel bordered header={<strong>Sprite Editor</strong>}>
            <canvas
              ref={canvasRef}
              width={512}
              height={512}
              style={{
                border: '1px solid #333',
                background: '#222',
                cursor: dragging ? 'grab' : 'pointer',
                userSelect: 'none',
                touchAction: 'none',
              }}
              onMouseDown={handleMouseDown}
              onMouseUp={handleMouseUp}
              onMouseMove={handleMouseMove}
              onWheel={handleWheel}
              onTouchStart={handleTouchStart}
              onTouchEnd={handleTouchEnd}
              onTouchMove={handleTouchMove}
              onClick={handleCanvasClick}
            />
          </Panel>
        </Col>
        <Col sm={6} md={6} lg={6}>
          <Panel bordered header={<strong>Palette</strong>}>
            <div style={{ display: 'flex', flexWrap: 'wrap' }}>
              {palette.map((color, idx) => (
                <div
                  key={idx}
                  style={{
                    width: 32,
                    height: 32,
                    background: color,
                    border: selectedColor === idx ? '2px solid #fff' : '1px solid #333',
                    margin: 2,
                    cursor: 'pointer',
                  }}
                  onClick={() => setSelectedColor(idx)}
                />
              ))}
            </div>
          </Panel>
          <Panel bordered header={<strong>Frames</strong>}>
            <div style={{ display: 'flex', flexWrap: 'wrap' }}>
              {[...Array(frames).keys()].map((f) => (
                <Button
                  key={f}
                  appearance={currentFrame === f ? 'primary' : 'default'}
                  style={{ margin: 2 }}
                  onClick={() => setCurrentFrame(f)}
                >
                  Frame {f + 1}
                </Button>
              ))}
              <Button appearance='default' style={{ margin: 2 }} onClick={() => {
                setFrames(frames + 1);
                setPixels([...pixels, Array.from({ length: DEFAULT_SIZE }, () => Array(DEFAULT_SIZE).fill(0))]);
              }}>
                + Add Frame
              </Button>
            </div>
          </Panel>
        </Col>
      </Row>
      <Row style={{ paddingTop: '1rem' }}>
        <Button appearance='primary' onClick={handleSave}>
          Save Changes
        </Button>
        <Button appearance='default' style={{ marginLeft: '0.5rem' }} onClick={undo} disabled={historyIndex <= 0}>
          Undo
        </Button>
        <Button appearance='default' style={{ marginLeft: '0.5rem' }} onClick={redo} disabled={historyIndex >= history.length - 1}>
          Redo
        </Button>
      </Row>
      {error && (
        <Row style={{ marginTop: '1rem' }}>
          <Col sm={24} md={24} lg={24}>
            <Message type='error' description={error} />
          </Col>
        </Row>
      )}
    </Container>
  );
}

export default SpriteEditor;
