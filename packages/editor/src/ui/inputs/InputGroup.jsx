/**
 * InputGroup Component
 */
import React from 'react';
import './InputGroup.css';

export function InputGroup({ children, inside = false, size, className = '', style, ...props }) {
  const classes = [
    'px-input-group',
    inside && 'px-input-group-inside',
    size && `px-input-group-${size}`,
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={classes} style={style} {...props}>
      {children}
    </div>
  );
}

// Addon for prefixes/suffixes
InputGroup.Addon = function InputGroupAddon({ children, className = '', ...props }) {
  return (
    <span className={`px-input-group-addon ${className}`} {...props}>
      {children}
    </span>
  );
};

// Button variant
InputGroup.Button = function InputGroupButton({ children, className = '', ...props }) {
  return (
    <span className={`px-input-group-btn ${className}`} {...props}>
      {children}
    </span>
  );
};
