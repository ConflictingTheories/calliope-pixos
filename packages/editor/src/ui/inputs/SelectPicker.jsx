/**
 * SelectPicker Component
 * A dropdown select component
 */
import React, { useState, useRef, useEffect } from 'react';
import './SelectPicker.css';

export function SelectPicker({
  data = [],
  value,
  defaultValue,
  placeholder = 'Select...',
  disabled = false,
  cleanable = true,
  searchable = false,
  size = 'md',
  block = false,
  placement = 'bottomStart',
  className = '',
  valueKey = 'value',
  labelKey = 'label',
  groupBy,
  onChange,
  onClean,
  renderMenuItem,
  renderValue,
  style,
  ...props
}) {
  const [internalValue, setInternalValue] = useState(defaultValue);
  const [isOpen, setIsOpen] = useState(false);
  const [searchText, setSearchText] = useState('');
  const containerRef = useRef(null);
  const inputRef = useRef(null);

  const currentValue = value !== undefined ? value : internalValue;

  // Find selected item
  const selectedItem = data.find(item => item[valueKey] === currentValue);

  // Filter items by search
  const filteredData =
    searchable && searchText
      ? data.filter(item => String(item[labelKey]).toLowerCase().includes(searchText.toLowerCase()))
      : data;

  // Group items if needed
  const groupedData = groupBy
    ? filteredData.reduce((acc, item) => {
        const group = item[groupBy] || 'Other';
        if (!acc[group]) acc[group] = [];
        acc[group].push(item);
        return acc;
      }, {})
    : null;

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = e => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
        setSearchText('');
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Focus search input when opened
  useEffect(() => {
    if (isOpen && searchable && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen, searchable]);

  const handleSelect = item => {
    const newValue = item[valueKey];
    setInternalValue(newValue);
    setIsOpen(false);
    setSearchText('');
    onChange?.(newValue, item);
  };

  const handleClear = e => {
    e.stopPropagation();
    setInternalValue(undefined);
    onChange?.(null, null);
    onClean?.();
  };

  const classes = [
    'px-select-picker',
    `px-select-picker-${size}`,
    isOpen && 'px-select-picker-open',
    disabled && 'px-select-picker-disabled',
    block && 'px-select-picker-block',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  const displayValue = selectedItem
    ? renderValue
      ? renderValue(currentValue, selectedItem)
      : selectedItem[labelKey]
    : null;

  const renderItem = item => {
    if (renderMenuItem) {
      return renderMenuItem(item[labelKey], item);
    }
    return item[labelKey];
  };

  return (
    <div ref={containerRef} className={classes} style={style} {...props}>
      <div className="px-select-picker-toggle" onClick={() => !disabled && setIsOpen(!isOpen)}>
        <span className="px-select-picker-value">
          {displayValue || <span className="px-select-picker-placeholder">{placeholder}</span>}
        </span>
        {cleanable && currentValue !== undefined && currentValue !== null && (
          <span className="px-select-picker-clear" onClick={handleClear}>
            ×
          </span>
        )}
        <span className="px-select-picker-caret">▼</span>
      </div>

      {isOpen && (
        <div className="px-select-picker-menu">
          {searchable && (
            <div className="px-select-picker-search">
              <input
                ref={inputRef}
                type="text"
                value={searchText}
                onChange={e => setSearchText(e.target.value)}
                placeholder="Search..."
                className="px-select-picker-search-input"
              />
            </div>
          )}
          <div className="px-select-picker-options">
            {groupedData
              ? Object.entries(groupedData).map(([group, items]) => (
                  <div key={group} className="px-select-picker-group">
                    <div className="px-select-picker-group-title">{group}</div>
                    {items.map(item => (
                      <div
                        key={item[valueKey]}
                        className={`px-select-picker-option ${item[valueKey] === currentValue ? 'px-select-picker-option-selected' : ''}`}
                        onClick={() => handleSelect(item)}
                      >
                        {renderItem(item)}
                      </div>
                    ))}
                  </div>
                ))
              : filteredData.map(item => (
                  <div
                    key={item[valueKey]}
                    className={`px-select-picker-option ${item[valueKey] === currentValue ? 'px-select-picker-option-selected' : ''}`}
                    onClick={() => handleSelect(item)}
                  >
                    {renderItem(item)}
                  </div>
                ))}
            {filteredData.length === 0 && (
              <div className="px-select-picker-no-results">No results found</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
