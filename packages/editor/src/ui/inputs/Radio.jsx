/**
 * Radio and RadioGroup Components
 */
import React, { createContext, useContext } from 'react';
import './Radio.css';

const RadioContext = createContext(null);

export function RadioGroup({ 
  children,
  value,
  defaultValue,
  name,
  inline = false,
  className = '',
  onChange,
  style,
  ...props 
}) {
  const [internalValue, setInternalValue] = React.useState(defaultValue);
  const currentValue = value !== undefined ? value : internalValue;

  const handleChange = (newValue, event) => {
    setInternalValue(newValue);
    onChange?.(newValue, event);
  };

  const classes = [
    'px-radio-group',
    inline && 'px-radio-group-inline',
    className
  ].filter(Boolean).join(' ');

  return (
    <RadioContext.Provider value={{ value: currentValue, name, onChange: handleChange }}>
      <div className={classes} style={style} {...props}>
        {children}
      </div>
    </RadioContext.Provider>
  );
}

export function Radio({ 
  children,
  value,
  disabled = false,
  className = '',
  style,
  ...props 
}) {
  const context = useContext(RadioContext);
  const checked = context ? context.value === value : props.checked;
  const name = context?.name || props.name;

  const handleChange = (e) => {
    if (context) {
      context.onChange(value, e);
    }
    props.onChange?.(value, e);
  };

  const classes = [
    'px-radio',
    disabled && 'px-radio-disabled',
    className
  ].filter(Boolean).join(' ');

  return (
    <label className={classes} style={style}>
      <input
        type="radio"
        className="px-radio-input"
        name={name}
        value={value}
        checked={checked}
        disabled={disabled}
        onChange={handleChange}
      />
      <span className="px-radio-control" />
      {children && <span className="px-radio-label">{children}</span>}
    </label>
  );
}
