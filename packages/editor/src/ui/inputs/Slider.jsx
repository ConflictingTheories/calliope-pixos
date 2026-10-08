/**
 * Slider Component
 */
import React, { useState, useRef, useCallback } from 'react';
import './Slider.css';

export function Slider({
  value: controlledValue,
  defaultValue = 0,
  min = 0,
  max = 100,
  step = 1,
  disabled = false,
  graduated = false,
  tooltip = true,
  progress = true,
  vertical = false,
  className = '',
  onChange,
  onChangeCommitted,
  style,
  ...props
}) {
  const [internalValue, setInternalValue] = useState(defaultValue);
  const [isDragging, setIsDragging] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);
  const trackRef = useRef(null);

  const value = controlledValue !== undefined ? controlledValue : internalValue;
  const percentage = ((value - min) / (max - min)) * 100;

  const calculateValue = useCallback(
    (clientX, clientY) => {
      if (!trackRef.current) return value;
      const rect = trackRef.current.getBoundingClientRect();

      let ratio;
      if (vertical) {
        ratio = 1 - (clientY - rect.top) / rect.height;
      } else {
        ratio = (clientX - rect.left) / rect.width;
      }

      ratio = Math.max(0, Math.min(1, ratio));
      let newValue = min + ratio * (max - min);

      // Snap to step
      newValue = Math.round(newValue / step) * step;
      newValue = Math.max(min, Math.min(max, newValue));

      return newValue;
    },
    [min, max, step, vertical, value]
  );

  const handleMouseDown = e => {
    if (disabled) return;
    setIsDragging(true);
    setShowTooltip(true);

    const newValue = calculateValue(e.clientX, e.clientY);
    setInternalValue(newValue);
    onChange?.(newValue);

    const handleMouseMove = moveEvent => {
      const moveValue = calculateValue(moveEvent.clientX, moveEvent.clientY);
      setInternalValue(moveValue);
      onChange?.(moveValue);
    };

    const handleMouseUp = upEvent => {
      setIsDragging(false);
      setShowTooltip(false);
      const finalValue = calculateValue(upEvent.clientX, upEvent.clientY);
      onChangeCommitted?.(finalValue);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  const handleInputChange = e => {
    const newValue = parseFloat(e.target.value);
    setInternalValue(newValue);
    onChange?.(newValue);
  };

  const classes = [
    'px-slider',
    vertical && 'px-slider-vertical',
    disabled && 'px-slider-disabled',
    isDragging && 'px-slider-dragging',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={classes} style={style} {...props}>
      <div ref={trackRef} className="px-slider-track" onMouseDown={handleMouseDown}>
        {progress && (
          <div
            className="px-slider-progress"
            style={vertical ? { height: `${percentage}%` } : { width: `${percentage}%` }}
          />
        )}
        <div
          className="px-slider-handle"
          style={vertical ? { bottom: `${percentage}%` } : { left: `${percentage}%` }}
          onMouseEnter={() => tooltip && setShowTooltip(true)}
          onMouseLeave={() => !isDragging && setShowTooltip(false)}
        >
          {tooltip && showTooltip && <div className="px-slider-tooltip">{value}</div>}
        </div>
        {graduated && (
          <div className="px-slider-graduations">
            {Array.from({ length: Math.floor((max - min) / step) + 1 }).map((_, i) => (
              <span
                key={i}
                className="px-slider-graduation-mark"
                style={
                  vertical
                    ? { bottom: `${((i * step) / (max - min)) * 100}%` }
                    : { left: `${((i * step) / (max - min)) * 100}%` }
                }
              />
            ))}
          </div>
        )}
      </div>
      <input
        type="range"
        className="px-slider-input"
        min={min}
        max={max}
        step={step}
        value={value}
        disabled={disabled}
        onChange={handleInputChange}
      />
    </div>
  );
}
