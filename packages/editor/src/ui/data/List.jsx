/**
 * List Component
 */
import React from 'react';
import './List.css';

export function List({ 
  children,
  bordered = false,
  hover = false,
  size = 'md',
  className = '',
  style,
  ...props 
}) {
  const classes = [
    'px-list',
    bordered && 'px-list-bordered',
    hover && 'px-list-hover',
    `px-list-${size}`,
    className
  ].filter(Boolean).join(' ');

  return (
    <ul className={classes} style={style} {...props}>
      {children}
    </ul>
  );
}

List.Item = function ListItem({ 
  children, 
  index,
  className = '',
  ...props 
}) {
  return (
    <li className={`px-list-item ${className}`} {...props}>
      {children}
    </li>
  );
};
