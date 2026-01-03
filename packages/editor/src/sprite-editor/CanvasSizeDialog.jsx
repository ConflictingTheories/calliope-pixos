/**
 * ---------------------------------------------------------------
 *                 PixoSpritz – CanvasSizeDialog Component
 * ---------------------------------------------------------------
 * Copyright (c) 2022-2025 Kyle Derby MacInnis
 *
 * Dialog for changing canvas/sprite size. Supports:
 * - Custom canvas sizes (8x8 to 256x256)
 * - Preset sizes for common formats
 * - Anchor point selection for resize
 * - Scale vs resize options
 */

import React, { useState, useCallback, useMemo } from 'react';
import { Modal, Button, InputNumber, SelectPicker, Radio, RadioGroup } from 'rsuite';
import './canvas-size-dialog.css';

// Preset canvas sizes
const PRESET_SIZES = [
  { label: '8×8 (Tiny)', value: '8x8' },
  { label: '16×16 (Small)', value: '16x16' },
  { label: '24×24', value: '24x24' },
  { label: '32×32 (Standard)', value: '32x32' },
  { label: '48×48', value: '48x48' },
  { label: '64×64 (Large)', value: '64x64' },
  { label: '96×96', value: '96x96' },
  { label: '128×128', value: '128x128' },
  { label: '256×256 (XL)', value: '256x256' },
  { label: 'Custom...', value: 'custom' },
];

// Anchor positions for resize
const ANCHORS = [
  ['top-left', 'top-center', 'top-right'],
  ['middle-left', 'middle-center', 'middle-right'],
  ['bottom-left', 'bottom-center', 'bottom-right'],
];

/**
 * CanvasSizeDialog - Modal dialog for changing canvas dimensions
 * 
 * @param {Object} props
 * @param {boolean} props.open - Whether dialog is open
 * @param {function} props.onClose - Close callback
 * @param {number} props.currentWidth - Current canvas width
 * @param {number} props.currentHeight - Current canvas height
 * @param {function} props.onApply - Callback with new dimensions and options
 */
function CanvasSizeDialog({
  open,
  onClose,
  currentWidth = 32,
  currentHeight = 32,
  onApply
}) {
  const [width, setWidth] = useState(currentWidth);
  const [height, setHeight] = useState(currentHeight);
  const [lockAspect, setLockAspect] = useState(false);
  const [anchor, setAnchor] = useState('middle-center');
  const [resizeMode, setResizeMode] = useState('resize'); // 'resize' | 'scale'
  const [scaleMethod, setScaleMethod] = useState('nearest'); // 'nearest' | 'bilinear'
  
  const aspectRatio = useMemo(() => currentWidth / currentHeight, [currentWidth, currentHeight]);

  // Handle preset selection
  const handlePresetChange = useCallback((value) => {
    if (value === 'custom') return;
    const [w, h] = value.split('x').map(Number);
    setWidth(w);
    setHeight(h);
  }, []);

  // Handle width change with aspect lock
  const handleWidthChange = useCallback((value) => {
    const newWidth = Math.max(8, Math.min(256, value || 8));
    setWidth(newWidth);
    if (lockAspect) {
      setHeight(Math.round(newWidth / aspectRatio));
    }
  }, [lockAspect, aspectRatio]);

  // Handle height change with aspect lock
  const handleHeightChange = useCallback((value) => {
    const newHeight = Math.max(8, Math.min(256, value || 8));
    setHeight(newHeight);
    if (lockAspect) {
      setWidth(Math.round(newHeight * aspectRatio));
    }
  }, [lockAspect, aspectRatio]);

  // Apply changes
  const handleApply = useCallback(() => {
    onApply?.({
      width,
      height,
      anchor,
      mode: resizeMode,
      scaleMethod: resizeMode === 'scale' ? scaleMethod : null
    });
    onClose?.();
  }, [width, height, anchor, resizeMode, scaleMethod, onApply, onClose]);

  // Reset to current size
  const handleReset = useCallback(() => {
    setWidth(currentWidth);
    setHeight(currentHeight);
  }, [currentWidth, currentHeight]);

  const selectedPreset = useMemo(() => {
    const preset = `${width}x${height}`;
    return PRESET_SIZES.find(p => p.value === preset)?.value || 'custom';
  }, [width, height]);

  return (
    <Modal open={open} onClose={onClose} size="xs" className="canvas-size-dialog">
      <Modal.Header>
        <Modal.Title>Canvas Size</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <div className="canvas-size-dialog__content">
          {/* Current Size Info */}
          <div className="canvas-size-dialog__info">
            <span>Current: {currentWidth}×{currentHeight}</span>
          </div>

          {/* Preset Selector */}
          <div className="canvas-size-dialog__row">
            <label>Preset:</label>
            <SelectPicker
              data={PRESET_SIZES}
              value={selectedPreset}
              onChange={handlePresetChange}
              searchable={false}
              cleanable={false}
              size="sm"
              style={{ width: 150 }}
            />
          </div>

          {/* Width & Height Inputs */}
          <div className="canvas-size-dialog__dimensions">
            <div className="canvas-size-dialog__dimension">
              <label>Width:</label>
              <InputNumber
                value={width}
                onChange={handleWidthChange}
                min={8}
                max={256}
                step={1}
                size="sm"
              />
              <span>px</span>
            </div>
            
            <button
              className={`canvas-size-dialog__lock ${lockAspect ? 'canvas-size-dialog__lock--active' : ''}`}
              onClick={() => setLockAspect(!lockAspect)}
              title={lockAspect ? 'Unlock aspect ratio' : 'Lock aspect ratio'}
            >
              {lockAspect ? '🔗' : '⛓️‍💥'}
            </button>
            
            <div className="canvas-size-dialog__dimension">
              <label>Height:</label>
              <InputNumber
                value={height}
                onChange={handleHeightChange}
                min={8}
                max={256}
                step={1}
                size="sm"
              />
              <span>px</span>
            </div>
          </div>

          {/* Resize Mode */}
          <div className="canvas-size-dialog__row">
            <label>Mode:</label>
            <RadioGroup
              inline
              value={resizeMode}
              onChange={setResizeMode}
            >
              <Radio value="resize">Resize Canvas</Radio>
              <Radio value="scale">Scale Image</Radio>
            </RadioGroup>
          </div>

          {/* Scale Method (only for scale mode) */}
          {resizeMode === 'scale' && (
            <div className="canvas-size-dialog__row">
              <label>Method:</label>
              <RadioGroup
                inline
                value={scaleMethod}
                onChange={setScaleMethod}
              >
                <Radio value="nearest">Nearest (Sharp)</Radio>
                <Radio value="bilinear">Bilinear (Smooth)</Radio>
              </RadioGroup>
            </div>
          )}

          {/* Anchor Selection (only for resize mode) */}
          {resizeMode === 'resize' && (
            <div className="canvas-size-dialog__anchor-section">
              <label>Anchor:</label>
              <div className="canvas-size-dialog__anchor-grid">
                {ANCHORS.map((row, rowIndex) => (
                  <div key={rowIndex} className="canvas-size-dialog__anchor-row">
                    {row.map((pos) => (
                      <button
                        key={pos}
                        className={`canvas-size-dialog__anchor-btn ${anchor === pos ? 'canvas-size-dialog__anchor-btn--active' : ''}`}
                        onClick={() => setAnchor(pos)}
                        title={pos.replace('-', ' ')}
                      >
                        <span className="canvas-size-dialog__anchor-dot" />
                      </button>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Preview */}
          <div className="canvas-size-dialog__preview">
            <div 
              className="canvas-size-dialog__preview-outer"
              style={{
                width: Math.max(width, currentWidth) / 2 + 20,
                height: Math.max(height, currentHeight) / 2 + 20
              }}
            >
              <div 
                className="canvas-size-dialog__preview-current"
                style={{
                  width: currentWidth / 2,
                  height: currentHeight / 2
                }}
              />
              <div 
                className="canvas-size-dialog__preview-new"
                style={{
                  width: width / 2,
                  height: height / 2
                }}
              />
            </div>
            <span className="canvas-size-dialog__preview-label">
              {width}×{height} ({Math.round((width * height) / (currentWidth * currentHeight) * 100)}%)
            </span>
          </div>
        </div>
      </Modal.Body>
      <Modal.Footer>
        <Button onClick={handleReset} appearance="subtle">Reset</Button>
        <Button onClick={onClose} appearance="subtle">Cancel</Button>
        <Button onClick={handleApply} appearance="primary">Apply</Button>
      </Modal.Footer>
    </Modal>
  );
}

export default CanvasSizeDialog;
