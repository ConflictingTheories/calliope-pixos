/**
 * ---------------------------------------------------------------
 *                 PixoSpritz – PropertyPanel Component
 * ---------------------------------------------------------------
 * Copyright (c) 2022-2025 Kyle Derby MacInnis
 *
 * A property inspector panel for editing entity properties.
 * Supports various input types and grouped sections.
 * 
 * Usage:
 *   <PropertyPanel
 *     title="Sprite Properties"
 *     properties={[
 *       { key: 'name', label: 'Name', type: 'text', value: sprite.name },
 *       { key: 'x', label: 'X', type: 'number', value: sprite.x },
 *       { key: 'visible', label: 'Visible', type: 'boolean', value: sprite.visible },
 *     ]}
 *     onChange={(key, value) => updateSprite(key, value)}
 *   />
 */

import React, { useState, useCallback, useMemo } from 'react';
import '../styles/property-panel.css';

/**
 * @typedef {'text' | 'number' | 'boolean' | 'select' | 'color' | 'slider' | 'textarea' | 'vector2' | 'vector3'} PropertyType
 */

/**
 * @typedef {Object} PropertyDefinition
 * @property {string} key - Unique property key
 * @property {string} label - Display label
 * @property {PropertyType} type - Input type
 * @property {*} value - Current value
 * @property {*} [defaultValue] - Default value
 * @property {string} [group] - Group name for grouping
 * @property {string} [tooltip] - Tooltip text
 * @property {boolean} [disabled] - Whether the property is disabled
 * @property {boolean} [readonly] - Whether the property is readonly
 * @property {number} [min] - Min value for number/slider
 * @property {number} [max] - Max value for number/slider
 * @property {number} [step] - Step value for number/slider
 * @property {Array<{label: string, value: *}>} [options] - Options for select type
 */

/**
 * PropertyPanel - Property inspector component
 * 
 * @param {Object} props
 * @param {string} [props.title] - Panel title
 * @param {PropertyDefinition[]} props.properties - Array of property definitions
 * @param {function} props.onChange - Callback when a property changes (key, value)
 * @param {function} [props.onReset] - Callback to reset property to default
 * @param {boolean} [props.showGroups=true] - Whether to show grouped sections
 * @param {string} [props.className] - Additional CSS classes
 */
function PropertyPanel({
  title,
  properties = [],
  onChange,
  onReset,
  showGroups = true,
  className = ''
}) {
  const [collapsedGroups, setCollapsedGroups] = useState({});

  // Group properties by their group field
  const groupedProperties = useMemo(() => {
    if (!showGroups) {
      return { '': properties };
    }

    return properties.reduce((groups, prop) => {
      const group = prop.group || 'General';
      if (!groups[group]) {
        groups[group] = [];
      }
      groups[group].push(prop);
      return groups;
    }, {});
  }, [properties, showGroups]);

  // Toggle group collapse state
  const toggleGroup = useCallback((groupName) => {
    setCollapsedGroups(prev => ({
      ...prev,
      [groupName]: !prev[groupName]
    }));
  }, []);

  // Handle property value change
  const handleChange = useCallback((key, value, type) => {
    // Type conversion
    let convertedValue = value;
    if (type === 'number' || type === 'slider') {
      convertedValue = parseFloat(value) || 0;
    } else if (type === 'boolean') {
      convertedValue = Boolean(value);
    }
    onChange?.(key, convertedValue);
  }, [onChange]);

  return (
    <div className={`property-panel ${className}`}>
      {title && <div className="property-panel__title">{title}</div>}
      
      <div className="property-panel__content">
        {Object.entries(groupedProperties).map(([groupName, groupProps]) => (
          <PropertyGroup
            key={groupName}
            name={groupName}
            properties={groupProps}
            collapsed={collapsedGroups[groupName]}
            onToggle={() => toggleGroup(groupName)}
            onChange={handleChange}
            onReset={onReset}
            showHeader={showGroups && groupName !== ''}
          />
        ))}
      </div>
    </div>
  );
}

/**
 * PropertyGroup - A collapsible group of properties
 */
function PropertyGroup({ name, properties, collapsed, onToggle, onChange, onReset, showHeader }) {
  return (
    <div className={`property-group ${collapsed ? 'property-group--collapsed' : ''}`}>
      {showHeader && (
        <div className="property-group__header" onClick={onToggle}>
          <span className="property-group__chevron">
            <ChevronIcon collapsed={collapsed} />
          </span>
          <span className="property-group__name">{name}</span>
        </div>
      )}
      
      {!collapsed && (
        <div className="property-group__content">
          {properties.map(prop => (
            <PropertyRow
              key={prop.key}
              property={prop}
              onChange={onChange}
              onReset={onReset}
            />
          ))}
        </div>
      )}
    </div>
  );
}

/**
 * PropertyRow - A single property input row
 */
function PropertyRow({ property, onChange, onReset }) {
  const { key, label, type, value, tooltip, disabled, readonly, defaultValue } = property;
  const hasDefaultValue = defaultValue !== undefined;
  const isDifferentFromDefault = hasDefaultValue && value !== defaultValue;

  const handleReset = useCallback((e) => {
    e.stopPropagation();
    if (onReset) {
      onReset(key);
    } else {
      onChange(key, defaultValue, type);
    }
  }, [key, defaultValue, type, onChange, onReset]);

  return (
    <div className={`property-row ${disabled ? 'property-row--disabled' : ''}`} title={tooltip}>
      <label className="property-row__label">
        {label}
        {isDifferentFromDefault && (
          <button 
            className="property-row__reset" 
            onClick={handleReset}
            title="Reset to default"
          >
            ↺
          </button>
        )}
      </label>
      <div className="property-row__input">
        <PropertyInput
          property={property}
          onChange={(val) => onChange(key, val, type)}
          disabled={disabled || readonly}
        />
      </div>
    </div>
  );
}

/**
 * PropertyInput - Renders the appropriate input based on type
 */
function PropertyInput({ property, onChange, disabled }) {
  const { type, value, min, max, step, options } = property;

  switch (type) {
    case 'text':
      return (
        <input
          type="text"
          className="property-input property-input--text"
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
        />
      );

    case 'number':
      return (
        <input
          type="number"
          className="property-input property-input--number"
          value={value ?? ''}
          min={min}
          max={max}
          step={step || 1}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
        />
      );

    case 'boolean':
      return (
        <label className="property-input property-input--boolean">
          <input
            type="checkbox"
            checked={Boolean(value)}
            onChange={(e) => onChange(e.target.checked)}
            disabled={disabled}
          />
          <span className="property-checkbox"></span>
        </label>
      );

    case 'select':
      return (
        <select
          className="property-input property-input--select"
          value={value ?? ''}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
        >
          {(options || []).map(opt => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      );

    case 'color':
      return (
        <div className="property-input property-input--color">
          <input
            type="color"
            value={value || '#000000'}
            onChange={(e) => onChange(e.target.value)}
            disabled={disabled}
          />
          <input
            type="text"
            className="property-input--color-text"
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            disabled={disabled}
            placeholder="#000000"
          />
        </div>
      );

    case 'slider':
      return (
        <div className="property-input property-input--slider">
          <input
            type="range"
            value={value ?? min ?? 0}
            min={min ?? 0}
            max={max ?? 100}
            step={step ?? 1}
            onChange={(e) => onChange(parseFloat(e.target.value))}
            disabled={disabled}
          />
          <span className="property-slider-value">{value}</span>
        </div>
      );

    case 'textarea':
      return (
        <textarea
          className="property-input property-input--textarea"
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
          rows={3}
        />
      );

    case 'vector2':
      return (
        <div className="property-input property-input--vector">
          <input
            type="number"
            value={value?.x ?? 0}
            onChange={(e) => onChange({ ...value, x: parseFloat(e.target.value) || 0 })}
            disabled={disabled}
            placeholder="X"
          />
          <input
            type="number"
            value={value?.y ?? 0}
            onChange={(e) => onChange({ ...value, y: parseFloat(e.target.value) || 0 })}
            disabled={disabled}
            placeholder="Y"
          />
        </div>
      );

    case 'vector3':
      return (
        <div className="property-input property-input--vector">
          <input
            type="number"
            value={value?.x ?? 0}
            onChange={(e) => onChange({ ...value, x: parseFloat(e.target.value) || 0 })}
            disabled={disabled}
            placeholder="X"
          />
          <input
            type="number"
            value={value?.y ?? 0}
            onChange={(e) => onChange({ ...value, y: parseFloat(e.target.value) || 0 })}
            disabled={disabled}
            placeholder="Y"
          />
          <input
            type="number"
            value={value?.z ?? 0}
            onChange={(e) => onChange({ ...value, z: parseFloat(e.target.value) || 0 })}
            disabled={disabled}
            placeholder="Z"
          />
        </div>
      );

    default:
      return (
        <input
          type="text"
          className="property-input property-input--text"
          value={String(value ?? '')}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
        />
      );
  }
}

// Chevron icon
function ChevronIcon({ collapsed }) {
  return (
    <svg
      viewBox="0 0 24 24"
      width="12"
      height="12"
      fill="currentColor"
      style={{ transform: collapsed ? 'rotate(-90deg)' : 'rotate(0deg)', transition: 'transform 0.15s ease' }}
    >
      <path d="M7.41 8.59L12 13.17l4.59-4.58L18 10l-6 6-6-6 1.41-1.41z"/>
    </svg>
  );
}

export default PropertyPanel;
export { PropertyPanel };
