ref/**
 * ---------------------------------------------------------------
 *                 Pixospritz – Editor – Sprite Editor
 * ---------------------------------------------------------------
 * Copyright (c) 2022‑2025  Kyle Derby MacInnis
 *
 * A sprite editor for Pixospritz spritesheets. Supports:
 * - Spritesheet visualization with grid overlay
 * - Frame coordinate editing for directional animations
 * - Animation preview and playback
 * - Property editing for sprite configuration
 */

import React, { useRef, useState, useEffect } from 'react';
import { Panel, Container, Row, Col, Button, Message, Slider, Checkbox, Input, InputNumber, SelectPicker } from 'rsuite';

const DIRECTIONS = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];

/**
 * SpriteEditor component for editing Pixospritz spritesheet-based sprites.
 *
 * @param {object} props
 * @param {string} [props.content] - Initial sprite data as JSON string
 * @param {object} [props.zip] - ZIP filesystem object
 * @param {function} [props.getData] - Function to get data from ZIP entries
 * @param {function} [props.toDataUri] - Function to convert binary to data URI
 * @param {function(object):void} [props.onSave] - Callback invoked with sprite data on save
 * @returns {JSX.Element}
 */
function SpriteEditor({ content, zip, getData, toDataUri, onSave }) {
  const [spriteData, setSpriteData] = useState(null);
  const [spriteImage, setSpriteImage] = useState(null);
  const [error, setError] = useState(null);
  const [selectedDirection, setSelectedDirection] = useState('S');
  const [selectedFrame, setSelectedFrame] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [animationSpeed, setAnimationSpeed] = useState(200);
  const [loop, setLoop] = useState(true);
  const [camera, setCamera] = useState({ x: 0, y: 0, zoom: 2 });
  const [dragging, setDragging] = useState(false);
  const dragStart = useRef({ x: 0, y: 0 });
  const canvasRef = useRef();
  const previewCanvasRef = useRef();
  const animationFrameRef = useRef();

  // Load sprite data and image
  useEffect(() => {
    if (!content) return;

    try {
      const data = JSON.parse(content);
      setSpriteData(data);

      // Load the spritesheet image
      if (data.src && zip && getData && toDataUri) {
        loadSpriteImage(data.src);
      }
    } catch (e) {
      setError('Failed to parse sprite data: ' + e.message);
    }
  }, [content, zip, getData, toDataUri]);

  const loadSpriteImage = async (src) => {
    if (!zip || !getData || !toDataUri) return;

    try {
      // Find the image file in the ZIP
      const findImageEntry = (node, targetName) => {
        if (node.children) {
          for (const child of node.children) {
            if (!child.directory && child.name === targetName) {
              return child;
            }
            if (child.directory) {
              const found = findImageEntry(child, targetName);
              if (found) return found;
            }
          }
        }
        return null;
      };

      const imageEntry = findImageEntry(zip.root, src);
      if (imageEntry) {
        const imageData = await getData(imageEntry, false);
        const mime = `image/${src.split('.').pop().toLowerCase()}`;
        const dataUri = toDataUri(imageData, mime);
        setSpriteImage(dataUri);
      } else {
        setError(`Spritesheet image not found: ${src}`);
      }
    } catch (e) {
      setError('Failed to load spritesheet: ' + e.message);
    }
  };

  // Draw spritesheet with grid and frame overlays
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !spriteData || !spriteImage) return;

    const ctx = canvas.getContext('2d');
    const img = new Image();
    img.onload = () => {
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.save();
      ctx.translate(camera.x, camera.y);
      ctx.scale(camera.zoom, camera.zoom);

      // Draw the spritesheet
      ctx.drawImage(img, 0, 0);

      // Draw grid
      const { tileSize, sheetSize } = spriteData;
      if (tileSize && tileSize.length >= 2) {
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
        ctx.lineWidth = 1 / camera.zoom;

        // Use sheetSize if available, otherwise use image dimensions
        const gridWidth = sheetSize && sheetSize.length >= 1 ? sheetSize[0] : img.width;
        const gridHeight = sheetSize && sheetSize.length >= 2 ? sheetSize[1] : img.height;

        for (let x = 0; x <= gridWidth; x += tileSize[0]) {
          ctx.beginPath();
          ctx.moveTo(x, 0);
          ctx.lineTo(x, gridHeight);
          ctx.stroke();
        }

        for (let y = 0; y <= gridHeight; y += tileSize[1]) {
          ctx.beginPath();
          ctx.moveTo(0, y);
          ctx.lineTo(gridWidth, y);
          ctx.stroke();
        }
      }

      // Draw frame rectangles for current direction
      if (spriteData.frames && spriteData.frames[selectedDirection]) {
        const frames = spriteData.frames[selectedDirection];
        ctx.strokeStyle = '#00ff00';
        ctx.lineWidth = 2 / camera.zoom;

        frames.forEach((frame, index) => {
          if (Array.isArray(frame) && frame.length >= 2) {
            const [x, y] = frame;
            const isSelected = index === selectedFrame;

            ctx.strokeStyle = isSelected ? '#ff0000' : '#00ff00';
            ctx.strokeRect(x, y, tileSize[0], tileSize[1]);
          }
        });
      }

      ctx.restore();
    };
    img.src = spriteImage;
  }, [spriteData, spriteImage, camera, selectedDirection, selectedFrame]);

  // Draw preview animation
  useEffect(() => {
    const canvas = previewCanvasRef.current;
    if (!canvas || !spriteData || !spriteImage) return;

    const ctx = canvas.getContext('2d');
    const img = new Image();
    img.onload = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      if (spriteData.frames && spriteData.frames[selectedDirection]) {
        const frames = spriteData.frames[selectedDirection];
        if (frames[selectedFrame] && Array.isArray(frames[selectedFrame])) {
          const [x, y] = frames[selectedFrame];
          const { tileSize, drawOffset } = spriteData;

          // Scale to fit preview canvas
          const scale = Math.min(canvas.width / tileSize[0], canvas.height / tileSize[1]);
          const scaledWidth = tileSize[0] * scale;
          const scaledHeight = tileSize[1] * scale;
          let offsetX = (canvas.width - scaledWidth) / 2;
          let offsetY = (canvas.height - scaledHeight) / 2;

          // Apply drawOffset if available
          if (drawOffset && drawOffset[selectedDirection]) {
            const [dx, dy] = drawOffset[selectedDirection];
            offsetX += dx * scaledWidth;
            offsetY += dy * scaledHeight;
          }

          ctx.drawImage(
            img,
            x, y, tileSize[0], tileSize[1],
            offsetX, offsetY, scaledWidth, scaledHeight
          );
        }
      }
    };
    img.src = spriteImage;
  }, [spriteData, spriteImage, selectedDirection, selectedFrame]);

  // Animation playback
  useEffect(() => {
    if (isPlaying && spriteData?.frames?.[selectedDirection]) {
      const frames = spriteData.frames[selectedDirection];
      const animate = () => {
        setSelectedFrame((prev) => {
          const next = prev + 1;
          if (next >= frames.length) {
            if (loop) {
              return 0;
            } else {
              setIsPlaying(false);
              return prev;
            }
          }
          return next;
        });
        animationFrameRef.current = setTimeout(animate, animationSpeed);
      };
      animationFrameRef.current = setTimeout(animate, animationSpeed);
    } else {
      if (animationFrameRef.current) {
        clearTimeout(animationFrameRef.current);
      }
    }
    return () => {
      if (animationFrameRef.current) {
        clearTimeout(animationFrameRef.current);
      }
    };
  }, [isPlaying, animationSpeed, spriteData, selectedDirection, loop]);

  // Canvas interaction handlers
  const handleMouseDown = (e) => {
    setDragging(true);
    dragStart.current = { x: e.clientX, y: e.clientY };
  };

  const handleMouseUp = () => {
    setDragging(false);
  };

  const handleMouseMove = (e) => {
    if (!dragging) return;
    const dx = e.clientX - dragStart.current.x;
    const dy = e.clientY - dragStart.current.y;
    dragStart.current = { x: e.clientX, y: e.clientY };
    setCamera((prev) => ({ ...prev, x: prev.x + dx, y: prev.y + dy }));
  };

  const handleWheel = (e) => {
    e.preventDefault();
    let zoom = camera.zoom + (e.deltaY < 0 ? 0.2 : -0.2);
    zoom = Math.max(0.5, Math.min(8, zoom));
    setCamera((prev) => ({ ...prev, zoom }));
  };

  const handleCanvasClick = (e) => {
    if (!spriteData || !spriteData.tileSize) return;

    const rect = canvasRef.current.getBoundingClientRect();
    const x = Math.floor((e.clientX - rect.left - camera.x) / camera.zoom);
    const y = Math.floor((e.clientY - rect.top - camera.y) / camera.zoom);

    const { tileSize } = spriteData;
    const gridX = Math.floor(x / tileSize[0]) * tileSize[0];
    const gridY = Math.floor(y / tileSize[1]) * tileSize[1];

    // Update the current frame position
    const newData = { ...spriteData };
    if (!newData.frames[selectedDirection]) {
      newData.frames[selectedDirection] = [];
    }
    if (!newData.frames[selectedDirection][selectedFrame]) {
      newData.frames[selectedDirection][selectedFrame] = [0, 0];
    }
    newData.frames[selectedDirection][selectedFrame] = [gridX, gridY];
    setSpriteData(newData);
  };

  const updateSpriteProperty = (property, value) => {
    const newData = { ...spriteData };
    newData[property] = value;
    setSpriteData(newData);
  };

  const updateFrameCoordinate = (direction, frameIndex, coordIndex, value) => {
    const newData = { ...spriteData };
    if (!newData.frames[direction]) {
      newData.frames[direction] = [];
    }
    if (!newData.frames[direction][frameIndex]) {
      newData.frames[direction][frameIndex] = [0, 0];
    }
    newData.frames[direction][frameIndex][coordIndex] = value;
    setSpriteData(newData);
  };

  const handleSave = () => {
    if (onSave && spriteData) {
      onSave(spriteData);
    }
  };

  if (!spriteData) {
    return (
      <Container style={{ padding: '1rem' }}>
        <Message type="info" description="Loading sprite data..." />
      </Container>
    );
  }

  return (
    <div style={{ padding: '0.125rem', height: '100vh', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      {/* Top Row: Spritesheet + Preview */}
      <div style={{ display: 'flex', gap: '0.25rem', marginBottom: '0.25rem', flex: '1', minHeight: 0 }}>
        {/* Spritesheet View */}
        <div style={{ flex: '2', display: 'flex', flexDirection: 'column', minHeight: 0 }}>
          <div style={{ border: '1px solid #333', padding: '0.125rem', background: '#1a1a1a', flex: '1', display: 'flex', flexDirection: 'column', minHeight: 0 }}>
            <div style={{ fontWeight: 'bold', fontSize: '0.8em', marginBottom: '0.125rem', color: '#fff' }}>Spritesheet</div>
            <canvas
              ref={canvasRef}
              width={400}
              height={250}
              style={{
                border: '1px solid #333',
                background: '#222',
                cursor: dragging ? 'grab' : 'crosshair',
                userSelect: 'none',
                touchAction: 'none',
                width: '100%',
                height: '100%',
                display: 'block',
                flex: '1',
                minHeight: 0,
              }}
              onMouseDown={handleMouseDown}
              onMouseUp={handleMouseUp}
              onMouseMove={handleMouseMove}
              onWheel={handleWheel}
              onClick={handleCanvasClick}
            />
            <div style={{ marginTop: '0.125rem', fontSize: '0.6em', color: '#ccc', textAlign: 'center' }}>
              Zoom: {camera.zoom.toFixed(1)}x
            </div>
          </div>
        </div>

        {/* Preview + Controls */}
        <div style={{ flex: '1', display: 'flex', flexDirection: 'column', gap: '0.25rem', minHeight: 0 }}>
          {/* Preview */}
          <div style={{ border: '1px solid #333', padding: '0.125rem', background: '#1a1a1a', flex: '1' }}>
            <div style={{ fontWeight: 'bold', fontSize: '0.8em', marginBottom: '0.125rem', color: '#fff' }}>Preview</div>
            <canvas
              ref={previewCanvasRef}
              width={64}
              height={64}
              style={{
                border: '1px solid #333',
                background: '#222',
                width: '100%',
                height: '100%',
                display: 'block',
              }}
            />
          </div>

          {/* Controls */}
          <div style={{ border: '1px solid #333', padding: '0.125rem', background: '#1a1a1a' }}>
            <div style={{ display: 'flex', gap: '0.125rem', marginBottom: '0.125rem' }}>
              <Button
                appearance={isPlaying ? 'primary' : 'default'}
                onClick={() => setIsPlaying(!isPlaying)}
                size="xs"
                style={{ flex: '1', fontSize: '0.7em', padding: '0.125rem' }}
              >
                {isPlaying ? 'Pause' : 'Play'}
              </Button>
              <Checkbox checked={loop} onChange={setLoop} size="xs" style={{ fontSize: '0.7em' }}>
                Loop
              </Checkbox>
            </div>
            <div>
              <div style={{ fontSize: '0.6em', marginBottom: '0.125rem', color: '#ccc' }}>Speed: {animationSpeed}ms</div>
              <Slider
                min={50}
                max={1000}
                step={50}
                value={animationSpeed}
                onChange={setAnimationSpeed}
                style={{ width: '100%' }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Row: All Controls */}
      <div style={{ display: 'flex', gap: '0.25rem', flex: '1', minHeight: 0 }}>
        {/* Direction & Frame */}
        <div style={{ flex: '1', border: '1px solid #333', padding: '0.125rem', background: '#1a1a1a', display: 'flex', flexDirection: 'column' }}>
          <div style={{ fontWeight: 'bold', fontSize: '0.8em', marginBottom: '0.125rem', color: '#fff' }}>Direction & Frame</div>
          <div style={{ marginBottom: '0.25rem', flex: '1' }}>
            <div style={{ fontSize: '0.6em', marginBottom: '0.125rem', color: '#ccc' }}>Direction:</div>
            <SelectPicker
              data={DIRECTIONS.map(dir => ({ label: dir, value: dir }))}
              value={selectedDirection}
              onChange={setSelectedDirection}
              size="xs"
              style={{ width: '100%', fontSize: '0.7em' }}
            />
          </div>
          <div style={{ flex: '1' }}>
            <div style={{ fontSize: '0.6em', marginBottom: '0.125rem', color: '#ccc' }}>Frame:</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.0625rem' }}>
              {spriteData.frames?.[selectedDirection]?.map((frame, index) => (
                <Button
                  key={index}
                  appearance={selectedFrame === index ? 'primary' : 'default'}
                  onClick={() => setSelectedFrame(index)}
                  size="xs"
                  style={{ minWidth: '1.25rem', height: '1.25rem', padding: '0', fontSize: '0.6em' }}
                >
                  {index + 1}
                </Button>
              ))}
              <Button
                appearance="default"
                size="xs"
                onClick={() => {
                  const newData = { ...spriteData };
                  if (!newData.frames[selectedDirection]) {
                    newData.frames[selectedDirection] = [];
                  }
                  newData.frames[selectedDirection].push([0, 0]);
                  setSpriteData(newData);
                }}
                style={{ minWidth: '1.25rem', height: '1.25rem', padding: '0', fontSize: '0.6em' }}
              >
                +
              </Button>
            </div>
          </div>
        </div>

        {/* Frame Coordinates */}
        <div style={{ flex: '1', border: '1px solid #333', padding: '0.125rem', background: '#1a1a1a', display: 'flex', flexDirection: 'column' }}>
          <div style={{ fontWeight: 'bold', fontSize: '0.8em', marginBottom: '0.125rem', color: '#fff' }}>Coordinates</div>
          {spriteData.frames?.[selectedDirection]?.[selectedFrame] ? (
            <div style={{ display: 'flex', gap: '0.125rem', flex: '1' }}>
              <div style={{ flex: '1' }}>
                <div style={{ fontSize: '0.6em', marginBottom: '0.125rem', color: '#ccc' }}>X:</div>
                <InputNumber
                  value={spriteData.frames[selectedDirection][selectedFrame][0]}
                  onChange={(value) => updateFrameCoordinate(selectedDirection, selectedFrame, 0, value)}
                  size="xs"
                  style={{ width: '100%', fontSize: '0.7em' }}
                />
              </div>
              <div style={{ flex: '1' }}>
                <div style={{ fontSize: '0.6em', marginBottom: '0.125rem', color: '#ccc' }}>Y:</div>
                <InputNumber
                  value={spriteData.frames[selectedDirection][selectedFrame][1]}
                  onChange={(value) => updateFrameCoordinate(selectedDirection, selectedFrame, 1, value)}
                  size="xs"
                  style={{ width: '100%', fontSize: '0.7em' }}
                />
              </div>
            </div>
          ) : (
            <div style={{ color: '#666', fontStyle: 'italic', fontSize: '0.6em', flex: '1', display: 'flex', alignItems: 'center' }}>
              Select frame
            </div>
          )}
        </div>

        {/* Sprite Properties */}
        <div style={{ flex: '2', border: '1px solid #333', padding: '0.125rem', background: '#1a1a1a', display: 'flex', flexDirection: 'column' }}>
          <div style={{ fontWeight: 'bold', fontSize: '0.8em', marginBottom: '0.125rem', color: '#fff' }}>Properties</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(80px, 1fr))', gap: '0.125rem', flex: '1' }}>
            <div>
              <div style={{ fontSize: '0.6em', marginBottom: '0.125rem', color: '#ccc' }}>Type:</div>
              <Input
                value={spriteData.type || ''}
                onChange={(value) => updateSpriteProperty('type', value)}
                size="xs"
                style={{ width: '100%', fontSize: '0.7em' }}
              />
            </div>
            <div>
              <div style={{ fontSize: '0.6em', marginBottom: '0.125rem', color: '#ccc' }}>Source:</div>
              <Input
                value={spriteData.src || ''}
                onChange={(value) => updateSpriteProperty('src', value)}
                size="xs"
                style={{ width: '100%', fontSize: '0.7em' }}
              />
            </div>
            <div>
              <div style={{ fontSize: '0.6em', marginBottom: '0.125rem', color: '#ccc' }}>Sheet W:</div>
              <InputNumber
                value={spriteData.sheetSize?.[0] || 0}
                onChange={(value) => updateSpriteProperty('sheetSize', [value, spriteData.sheetSize?.[1] || 0])}
                size="xs"
                style={{ width: '100%', fontSize: '0.7em' }}
              />
            </div>
            <div>
              <div style={{ fontSize: '0.6em', marginBottom: '0.125rem', color: '#ccc' }}>Sheet H:</div>
              <InputNumber
                value={spriteData.sheetSize?.[1] || 0}
                onChange={(value) => updateSpriteProperty('sheetSize', [spriteData.sheetSize?.[0] || 0, value])}
                size="xs"
                style={{ width: '100%', fontSize: '0.7em' }}
              />
            </div>
            <div>
              <div style={{ fontSize: '0.6em', marginBottom: '0.125rem', color: '#ccc' }}>Tile W:</div>
              <InputNumber
                value={spriteData.tileSize?.[0] || 0}
                onChange={(value) => updateSpriteProperty('tileSize', [value, spriteData.tileSize?.[1] || 0])}
                size="xs"
                style={{ width: '100%', fontSize: '0.7em' }}
              />
            </div>
            <div>
              <div style={{ fontSize: '0.6em', marginBottom: '0.125rem', color: '#ccc' }}>Tile H:</div>
              <InputNumber
                value={spriteData.tileSize?.[1] || 0}
                onChange={(value) => updateSpriteProperty('tileSize', [spriteData.tileSize?.[0] || 0, value])}
                size="xs"
                style={{ width: '100%', fontSize: '0.7em' }}
              />
            </div>
            <div>
              <div style={{ fontSize: '0.6em', marginBottom: '0.125rem', color: '#ccc' }}>State:</div>
              <Input
                value={spriteData.state || ''}
                onChange={(value) => updateSpriteProperty('state', value)}
                size="xs"
                style={{ width: '100%', fontSize: '0.7em' }}
              />
            </div>
            <div>
              <div style={{ fontSize: '0.6em', marginBottom: '0.125rem', color: '#ccc' }}>Gender:</div>
              <Input
                value={spriteData.gender || ''}
                onChange={(value) => updateSpriteProperty('gender', value)}
                size="xs"
                style={{ width: '100%', fontSize: '0.7em' }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Bottom: Save Button */}
      <div style={{ marginTop: '0.25rem' }}>
        <Button appearance="primary" onClick={handleSave} block size="xs" style={{ fontSize: '0.8em', padding: '0.25rem' }}>
          Save
        </Button>
      </div>

      {error && (
        <div style={{ marginTop: '0.125rem' }}>
          <div style={{ border: '1px solid #d9534f', padding: '0.125rem', background: '#2a1a1a', color: '#d9534f', fontSize: '0.7em' }}>
            {error}
          </div>
        </div>
      )}
    </div>
  );
}

export default SpriteEditor;
