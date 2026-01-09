/**
 * Steps Component
 */
import React from 'react';
import './Steps.css';

export function Steps({ 
  children,
  current = 0,
  vertical = false,
  small = false,
  className = '',
  style,
  ...props 
}) {
  const classes = [
    'px-steps',
    vertical && 'px-steps-vertical',
    small && 'px-steps-small',
    className
  ].filter(Boolean).join(' ');

  const items = React.Children.map(children, (child, index) => {
    if (!React.isValidElement(child)) return child;
    
    let status = 'wait';
    if (index < current) status = 'finish';
    else if (index === current) status = 'process';
    
    return React.cloneElement(child, {
      stepNumber: index + 1,
      status: child.props.status || status
    });
  });

  return (
    <div className={classes} style={style} {...props}>
      {items}
    </div>
  );
}

Steps.Item = function StepsItem({ 
  title,
  description,
  icon,
  status = 'wait',
  stepNumber,
  className = '',
  ...props 
}) {
  const classes = [
    'px-steps-item',
    `px-steps-item-${status}`,
    className
  ].filter(Boolean).join(' ');

  const statusIcons = {
    finish: '✓',
    error: '✕'
  };

  return (
    <div className={classes} {...props}>
      <div className="px-steps-item-tail" />
      <div className="px-steps-item-icon">
        {icon || statusIcons[status] || stepNumber}
      </div>
      <div className="px-steps-item-content">
        <div className="px-steps-item-title">{title}</div>
        {description && (
          <div className="px-steps-item-description">{description}</div>
        )}
      </div>
    </div>
  );
};
