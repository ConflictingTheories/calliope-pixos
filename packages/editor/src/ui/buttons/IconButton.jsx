/**
 * IconButton Component
 */
import React from 'react';
import { Button } from './Button';
import './IconButton.css';

export function IconButton({ 
  icon,
  circle = false,
  className = '',
  children,
  ...props 
}) {
  const classes = [
    'px-icon-btn',
    circle && 'px-icon-btn-circle',
    className
  ].filter(Boolean).join(' ');

  return (
    <Button className={classes} {...props}>
      {icon}
      {children}
    </Button>
  );
}
