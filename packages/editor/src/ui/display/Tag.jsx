/**
 * Tag Component
 */
import React from 'react';
import './Tag.css';

export function Tag({
  children,
  color,
  size = 'md',
  closable = false,
  className = '',
  onClose,
  style,
  ...props
}) {
  const classes = [
    'px-tag',
    `px-tag-${size}`,
    color && `px-tag-${color}`,
    closable && 'px-tag-closable',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <span className={classes} style={style} {...props}>
      {children}
      {closable && (
        <button type="button" className="px-tag-close" onClick={onClose} aria-label="Remove">
          ×
        </button>
      )}
    </span>
  );
}
