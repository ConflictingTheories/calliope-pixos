/**
 * Button Component
 */
import React from 'react';
import './Button.css';

export function Button({ 
  children,
  appearance = 'default',
  color,
  size = 'md',
  block = false,
  disabled = false,
  loading = false,
  active = false,
  className = '',
  onClick,
  type = 'button',
  style,
  ...props 
}) {
  const classes = [
    'px-btn',
    `px-btn-${appearance}`,
    `px-btn-${size}`,
    color && `px-btn-${color}`,
    block && 'px-btn-block',
    disabled && 'px-btn-disabled',
    loading && 'px-btn-loading',
    active && 'px-btn-active',
    className
  ].filter(Boolean).join(' ');

  return (
    <button 
      type={type}
      className={classes} 
      style={style}
      disabled={disabled || loading}
      onClick={onClick}
      {...props}
    >
      {loading && <span className="px-btn-spinner" />}
      {children}
    </button>
  );
}
