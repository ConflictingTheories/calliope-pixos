/**
 * Container Component
 * Flexbox container for layout
 */
import React from 'react';
import './Container.css';

export function Container({ children, className = '', style, ...props }) {
  return (
    <div className={`px-container ${className}`} style={style} {...props}>
      {children}
    </div>
  );
}
