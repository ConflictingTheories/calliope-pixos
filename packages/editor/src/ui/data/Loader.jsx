/**
 * Loader Component
 */
import React from 'react';
import './Loader.css';

export function Loader({
  size = 'md',
  speed = 'normal',
  center = false,
  backdrop = false,
  vertical = false,
  inverse = false,
  content,
  className = '',
  style,
  ...props
}) {
  const classes = [
    'px-loader',
    `px-loader-${size}`,
    `px-loader-speed-${speed}`,
    center && 'px-loader-center',
    vertical && 'px-loader-vertical',
    inverse && 'px-loader-inverse',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  const loader = (
    <div className={classes} style={style} {...props}>
      <span className="px-loader-spin" />
      {content && <span className="px-loader-content">{content}</span>}
    </div>
  );

  if (backdrop) {
    return <div className="px-loader-backdrop">{loader}</div>;
  }

  return loader;
}
