/**
 * InputNumber Component
 */
import React, { useState, useEffect } from 'react';
import './InputNumber.css';

export function InputNumber({
  value: controlledValue,
  defaultValue = 0,
  min,
  max,
  step = 1,
  size = 'md',
  disabled = false,
  scrollable = true,
  className = '',
  onChange,
  style,
  ...props
}) {
  const [internalValue, setInternalValue] = useState(defaultValue);
  const value = controlledValue !== undefined ? controlledValue : internalValue;

  const clamp = val => {
    let clamped = val;
    if (min !== undefined) clamped = Math.max(min, clamped);
    if (max !== undefined) clamped = Math.min(max, clamped);
    return clamped;
  };

  const handleChange = e => {
    const newValue = parseFloat(e.target.value) || 0;
    const clamped = clamp(newValue);
    setInternalValue(clamped);
    onChange?.(clamped, e);
  };

  const handleStep = direction => {
    const newValue = clamp(value + step * direction);
    setInternalValue(newValue);
    onChange?.(newValue);
  };

  const handleWheel = e => {
    if (!scrollable || disabled) return;
    e.preventDefault();
    const direction = e.deltaY < 0 ? 1 : -1;
    handleStep(direction);
  };

  const classes = [
    'px-input-number',
    `px-input-number-${size}`,
    disabled && 'px-input-number-disabled',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={classes} style={style}>
      <button
        type="button"
        className="px-input-number-btn px-input-number-minus"
        onClick={() => handleStep(-1)}
        disabled={disabled || (min !== undefined && value <= min)}
      >
        −
      </button>
      <input
        type="number"
        className="px-input-number-input"
        value={value}
        min={min}
        max={max}
        step={step}
        disabled={disabled}
        onChange={handleChange}
        onWheel={handleWheel}
        {...props}
      />
      <button
        type="button"
        className="px-input-number-btn px-input-number-plus"
        onClick={() => handleStep(1)}
        disabled={disabled || (max !== undefined && value >= max)}
      >
        +
      </button>
    </div>
  );
}
