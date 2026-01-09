/**
 * ButtonGroup Component
 */
import React from 'react';
import './ButtonGroup.css';

export function ButtonGroup({ 
  children, 
  size,
  vertical = false,
  justified = false,
  className = '',
  style,
  ...props 
}) {
  const classes = [
    'px-btn-group',
    vertical && 'px-btn-group-vertical',
    justified && 'px-btn-group-justified',
    className
  ].filter(Boolean).join(' ');

  // Pass size down to children if specified
  const enhancedChildren = size
    ? React.Children.map(children, child =>
        React.isValidElement(child)
          ? React.cloneElement(child, { size })
          : child
      )
    : children;

  return (
    <div className={classes} style={style} {...props}>
      {enhancedChildren}
    </div>
  );
}
