/**
 * ---------------------------------------------------------------
 *                 PixoSpritz – ColorPicker Component
 * ---------------------------------------------------------------
 * Copyright (c) 2022-2025 Kyle Derby MacInnis
 *
 * An advanced color picker component for pixel art editing.
 * Supports HSV wheel, palette swatches, and hex/rgb input.
 * 
 * Usage:
 *   <ColorPicker
 *     color="#ff6b9d"
 *     onChange={handleColorChange}
 *     palette={['#ff0000', '#00ff00', '#0000ff']}
 *   />
 */

import React, { useState, useCallback, useRef, useEffect } from 'react';
import '../styles/color-picker.css';

/**
 * ColorPicker - Advanced color selection component
 * 
 * @param {Object} props
 * @param {string} props.color - Current color (hex format)
 * @param {function} props.onChange - Callback when color changes
 * @param {string[]} [props.palette=[]] - Color palette swatches
 * @param {string[]} [props.recentColors=[]] - Recently used colors
 * @param {function} [props.onPaletteAdd] - Callback to add color to palette
 * @param {boolean} [props.showInput=true] - Show hex input
 * @param {boolean} [props.showAlpha=false] - Show alpha slider
 * @param {boolean} [props.compact=false] - Compact mode
 * @param {string} [props.className] - Additional CSS classes
 */
function ColorPicker({
  color = '#000000',
  onChange,
  palette = [],
  recentColors = [],
  onPaletteAdd,
  showInput = true,
  showAlpha = false,
  compact = false,
  className = ''
}) {
  const [hsv, setHsv] = useState(() => hexToHsv(color));
  const [alpha, setAlpha] = useState(1);
  const [hexInput, setHexInput] = useState(color);
  const [activeTab, setActiveTab] = useState('picker'); // 'picker' | 'palette'
  
  const saturationRef = useRef(null);
  const hueRef = useRef(null);
  const alphaRef = useRef(null);
  const isDragging = useRef(null);

  // Sync HSV when color prop changes
  useEffect(() => {
    const newHsv = hexToHsv(color);
    setHsv(newHsv);
    setHexInput(color);
  }, [color]);

  // Update color when HSV changes
  const updateColor = useCallback((newHsv, newAlpha = alpha) => {
    const hex = hsvToHex(newHsv);
    setHsv(newHsv);
    setHexInput(hex);
    onChange?.(showAlpha ? `${hex}${Math.round(newAlpha * 255).toString(16).padStart(2, '0')}` : hex);
  }, [onChange, showAlpha, alpha]);

  // Handle saturation/brightness picker
  const handleSaturationMove = useCallback((e) => {
    if (!saturationRef.current) return;
    const rect = saturationRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    const y = Math.max(0, Math.min(1, (e.clientY - rect.top) / rect.height));
    updateColor({ ...hsv, s: x, v: 1 - y });
  }, [hsv, updateColor]);

  // Handle hue slider
  const handleHueMove = useCallback((e) => {
    if (!hueRef.current) return;
    const rect = hueRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    updateColor({ ...hsv, h: x * 360 });
  }, [hsv, updateColor]);

  // Handle alpha slider
  const handleAlphaMove = useCallback((e) => {
    if (!alphaRef.current) return;
    const rect = alphaRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    setAlpha(x);
    updateColor(hsv, x);
  }, [hsv, updateColor]);

  // Mouse event handlers
  const handleMouseDown = useCallback((e, type) => {
    e.preventDefault();
    isDragging.current = type;
    
    if (type === 'saturation') handleSaturationMove(e);
    else if (type === 'hue') handleHueMove(e);
    else if (type === 'alpha') handleAlphaMove(e);

    const handleMouseMove = (e) => {
      if (isDragging.current === 'saturation') handleSaturationMove(e);
      else if (isDragging.current === 'hue') handleHueMove(e);
      else if (isDragging.current === 'alpha') handleAlphaMove(e);
    };

    const handleMouseUp = () => {
      isDragging.current = null;
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
  }, [handleSaturationMove, handleHueMove, handleAlphaMove]);

  // Handle hex input change
  const handleHexChange = useCallback((e) => {
    const value = e.target.value;
    setHexInput(value);
    
    if (/^#[0-9A-Fa-f]{6}$/.test(value)) {
      setHsv(hexToHsv(value));
      onChange?.(value);
    }
  }, [onChange]);

  // Handle palette swatch click
  const handleSwatchClick = useCallback((swatchColor) => {
    setHsv(hexToHsv(swatchColor));
    setHexInput(swatchColor);
    onChange?.(swatchColor);
  }, [onChange]);

  // Add to palette
  const handleAddToPalette = useCallback(() => {
    const currentHex = hsvToHex(hsv);
    onPaletteAdd?.(currentHex);
  }, [hsv, onPaletteAdd]);

  const currentHex = hsvToHex(hsv);
  const hueColor = hsvToHex({ h: hsv.h, s: 1, v: 1 });

  return (
    <div className={`color-picker ${compact ? 'color-picker--compact' : ''} ${className}`}>
      {/* Tabs */}
      <div className="color-picker__tabs">
        <button 
          className={`color-picker__tab ${activeTab === 'picker' ? 'color-picker__tab--active' : ''}`}
          onClick={() => setActiveTab('picker')}
        >
          Picker
        </button>
        {palette.length > 0 && (
          <button 
            className={`color-picker__tab ${activeTab === 'palette' ? 'color-picker__tab--active' : ''}`}
            onClick={() => setActiveTab('palette')}
          >
            Palette
          </button>
        )}
      </div>

      {activeTab === 'picker' && (
        <div className="color-picker__picker">
          {/* Saturation/Brightness Box */}
          <div 
            ref={saturationRef}
            className="color-picker__saturation"
            style={{ backgroundColor: hueColor }}
            onMouseDown={(e) => handleMouseDown(e, 'saturation')}
          >
            <div className="color-picker__saturation-white" />
            <div className="color-picker__saturation-black" />
            <div 
              className="color-picker__saturation-cursor"
              style={{ 
                left: `${hsv.s * 100}%`, 
                top: `${(1 - hsv.v) * 100}%`,
                backgroundColor: currentHex
              }}
            />
          </div>

          {/* Hue Slider */}
          <div 
            ref={hueRef}
            className="color-picker__hue"
            onMouseDown={(e) => handleMouseDown(e, 'hue')}
          >
            <div 
              className="color-picker__hue-cursor"
              style={{ left: `${(hsv.h / 360) * 100}%` }}
            />
          </div>

          {/* Alpha Slider */}
          {showAlpha && (
            <div 
              ref={alphaRef}
              className="color-picker__alpha"
              style={{ 
                background: `linear-gradient(to right, transparent, ${currentHex})` 
              }}
              onMouseDown={(e) => handleMouseDown(e, 'alpha')}
            >
              <div 
                className="color-picker__alpha-cursor"
                style={{ left: `${alpha * 100}%` }}
              />
            </div>
          )}
        </div>
      )}

      {activeTab === 'palette' && (
        <div className="color-picker__palette">
          <div className="color-picker__swatches">
            {palette.map((swatchColor, index) => (
              <button
                key={index}
                className={`color-picker__swatch ${swatchColor === currentHex ? 'color-picker__swatch--selected' : ''}`}
                style={{ backgroundColor: swatchColor }}
                onClick={() => handleSwatchClick(swatchColor)}
                title={swatchColor}
              />
            ))}
          </div>
        </div>
      )}

      {/* Preview and Input */}
      <div className="color-picker__footer">
        <div 
          className="color-picker__preview"
          style={{ backgroundColor: currentHex }}
        />
        {showInput && (
          <input
            type="text"
            className="color-picker__input"
            value={hexInput}
            onChange={handleHexChange}
            placeholder="#000000"
          />
        )}
        {onPaletteAdd && (
          <button 
            className="color-picker__add"
            onClick={handleAddToPalette}
            title="Add to palette"
          >
            +
          </button>
        )}
      </div>

      {/* Recent Colors */}
      {recentColors.length > 0 && (
        <div className="color-picker__recent">
          <div className="color-picker__recent-label">Recent</div>
          <div className="color-picker__recent-swatches">
            {recentColors.slice(0, 8).map((swatchColor, index) => (
              <button
                key={index}
                className="color-picker__swatch color-picker__swatch--small"
                style={{ backgroundColor: swatchColor }}
                onClick={() => handleSwatchClick(swatchColor)}
                title={swatchColor}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// Color conversion utilities
function hexToHsv(hex) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!result) return { h: 0, s: 0, v: 0 };
  
  const r = parseInt(result[1], 16) / 255;
  const g = parseInt(result[2], 16) / 255;
  const b = parseInt(result[3], 16) / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const d = max - min;

  let h = 0;
  const s = max === 0 ? 0 : d / max;
  const v = max;

  if (d !== 0) {
    switch (max) {
      case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
      case g: h = ((b - r) / d + 2) / 6; break;
      case b: h = ((r - g) / d + 4) / 6; break;
    }
  }

  return { h: h * 360, s, v };
}

function hsvToHex({ h, s, v }) {
  const hNorm = h / 360;
  const i = Math.floor(hNorm * 6);
  const f = hNorm * 6 - i;
  const p = v * (1 - s);
  const q = v * (1 - f * s);
  const t = v * (1 - (1 - f) * s);

  let r, g, b;
  switch (i % 6) {
    case 0: r = v; g = t; b = p; break;
    case 1: r = q; g = v; b = p; break;
    case 2: r = p; g = v; b = t; break;
    case 3: r = p; g = q; b = v; break;
    case 4: r = t; g = p; b = v; break;
    case 5: r = v; g = p; b = q; break;
    default: r = 0; g = 0; b = 0;
  }

  const toHex = (n) => Math.round(n * 255).toString(16).padStart(2, '0');
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

export default ColorPicker;
export { ColorPicker, hexToHsv, hsvToHex };
