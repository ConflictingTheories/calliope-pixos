/**
 * Divider Component
 */
import React from 'react';
import './Divider.css';

export function Divider({ 
  vertical = false, 
  className = '',
  style,
  children,
  ...props 
}) {
  const classes = [
    'px-divider',
    vertical && 'px-divider-vertical',
    children && 'px-divider-with-text',
    className
  ].filter(Boolean).join(' ');

  if (children) {
    return (
      <div className={classes} style={style} {...props}>
        <span className="px-divider-text">{children}</span>
      </div>
    );
  }

  return <div className={classes} style={style} {...props} />;
}
