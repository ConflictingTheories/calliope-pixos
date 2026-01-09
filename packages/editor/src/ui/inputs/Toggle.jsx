/**
 * Toggle Component
 */
import React from 'react';
import './Toggle.css';

export function Toggle({ 
  checked,
  defaultChecked,
  disabled = false,
  size = 'md',
  checkedChildren,
  unCheckedChildren,
  className = '',
  onChange,
  style,
  ...props 
}) {
  const [internalChecked, setInternalChecked] = React.useState(defaultChecked ?? false);
  const isChecked = checked !== undefined ? checked : internalChecked;

  const handleChange = (e) => {
    const newValue = e.target.checked;
    setInternalChecked(newValue);
    onChange?.(newValue, e);
  };

  const classes = [
    'px-toggle',
    `px-toggle-${size}`,
    isChecked && 'px-toggle-checked',
    disabled && 'px-toggle-disabled',
    className
  ].filter(Boolean).join(' ');

  return (
    <label className={classes} style={style}>
      <input
        type="checkbox"
        className="px-toggle-input"
        checked={isChecked}
        disabled={disabled}
        onChange={handleChange}
        {...props}
      />
      <span className="px-toggle-track">
        <span className="px-toggle-thumb" />
        {(checkedChildren || unCheckedChildren) && (
          <span className="px-toggle-content">
            {isChecked ? checkedChildren : unCheckedChildren}
          </span>
        )}
      </span>
    </label>
  );
}
