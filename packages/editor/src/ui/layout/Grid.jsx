/**
 * Grid Components - Row and Col
 * Flexbox-based grid system
 */
import React from 'react';
import './Grid.css';

export function Row({ 
  children, 
  className = '',
  gutter = 0,
  style,
  ...props 
}) {
  const rowStyle = {
    ...style,
    gap: gutter ? `${gutter}px` : undefined
  };

  return (
    <div className={`px-row ${className}`} style={rowStyle} {...props}>
      {children}
    </div>
  );
}

export function Col({ 
  children, 
  className = '',
  xs,
  sm,
  md,
  lg,
  xl,
  xxl,
  colspan,
  style,
  ...props 
}) {
  // Simple responsive column - uses flex basis
  const colSpan = colspan || xs || 24;
  const colStyle = {
    ...style,
    flex: `0 0 ${(colSpan / 24) * 100}%`,
    maxWidth: `${(colSpan / 24) * 100}%`
  };

  return (
    <div className={`px-col ${className}`} style={colStyle} {...props}>
      {children}
    </div>
  );
}
