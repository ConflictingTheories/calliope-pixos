/**
 * ButtonToolbar Component
 */
import React from 'react';
import './ButtonToolbar.css';

export function ButtonToolbar({ children, className = '', style, ...props }) {
  return (
    <div className={`px-btn-toolbar ${className}`} style={style} {...props}>
      {children}
    </div>
  );
}
