/**
 * Badge Component
 */
import React from 'react';
import './Badge.css';

export function Badge({ 
  children,
  content,
  color = 'red',
  maxCount = 99,
  className = '',
  style,
  ...props 
}) {
  const displayContent = typeof content === 'number' && content > maxCount
    ? `${maxCount}+`
    : content;

  const classes = [
    'px-badge',
    `px-badge-${color}`,
    !children && 'px-badge-standalone',
    className
  ].filter(Boolean).join(' ');

  if (!children) {
    return (
      <span className={classes} style={style} {...props}>
        {displayContent}
      </span>
    );
  }

  return (
    <span className="px-badge-wrapper" style={style}>
      {children}
      {content !== undefined && content !== null && (
        <span className={classes} {...props}>
          {displayContent}
        </span>
      )}
    </span>
  );
}
