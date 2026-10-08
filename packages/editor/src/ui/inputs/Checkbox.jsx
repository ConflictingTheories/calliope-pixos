/**
 * Checkbox Component
 */
import React from 'react';
import './Checkbox.css';

export function Checkbox({
  children,
  checked,
  defaultChecked,
  indeterminate = false,
  disabled = false,
  value,
  name,
  className = '',
  onChange,
  style,
  ...props
}) {
  const inputRef = React.useRef(null);

  React.useEffect(() => {
    if (inputRef.current) {
      inputRef.current.indeterminate = indeterminate;
    }
  }, [indeterminate]);

  const classes = ['px-checkbox', disabled && 'px-checkbox-disabled', className]
    .filter(Boolean)
    .join(' ');

  const handleChange = e => {
    onChange?.(value, e.target.checked, e);
  };

  return (
    <label className={classes} style={style}>
      <input
        ref={inputRef}
        type="checkbox"
        className="px-checkbox-input"
        checked={checked}
        defaultChecked={defaultChecked}
        disabled={disabled}
        name={name}
        value={value}
        onChange={handleChange}
        {...props}
      />
      <span className="px-checkbox-control" />
      {children && <span className="px-checkbox-label">{children}</span>}
    </label>
  );
}
