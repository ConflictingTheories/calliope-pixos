/**
 * Input Component
 */
import React from 'react';
import './Input.css';

export const Input = React.forwardRef(function Input(
  {
    value,
    defaultValue,
    placeholder,
    size = 'md',
    disabled = false,
    readOnly = false,
    as = 'input',
    className = '',
    onChange,
    onPressEnter,
    style,
    ...props
  },
  ref
) {
  const Component = as === 'textarea' ? 'textarea' : 'input';

  const classes = ['px-input', `px-input-${size}`, disabled && 'px-input-disabled', className]
    .filter(Boolean)
    .join(' ');

  const handleKeyDown = e => {
    if (e.key === 'Enter' && onPressEnter) {
      onPressEnter(e);
    }
    props.onKeyDown?.(e);
  };

  return (
    <Component
      ref={ref}
      className={classes}
      value={value}
      defaultValue={defaultValue}
      placeholder={placeholder}
      disabled={disabled}
      readOnly={readOnly}
      onChange={onChange}
      onKeyDown={handleKeyDown}
      style={style}
      {...props}
    />
  );
});
