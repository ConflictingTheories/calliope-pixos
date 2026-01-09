/**
 * Message Component
 */
import React from 'react';
import './Message.css';

export function Message({ 
  type = 'info',
  showIcon = true,
  closable = false,
  header,
  children,
  className = '',
  onClose,
  style,
  ...props 
}) {
  const [visible, setVisible] = React.useState(true);

  if (!visible) return null;

  const handleClose = () => {
    setVisible(false);
    onClose?.();
  };

  const icons = {
    info: 'ℹ️',
    success: '✓',
    warning: '⚠️',
    error: '✕'
  };

  const classes = [
    'px-message',
    `px-message-${type}`,
    showIcon && 'px-message-with-icon',
    className
  ].filter(Boolean).join(' ');

  return (
    <div className={classes} style={style} role="alert" {...props}>
      {showIcon && (
        <span className="px-message-icon">{icons[type]}</span>
      )}
      <div className="px-message-content">
        {header && <div className="px-message-header">{header}</div>}
        {children && <div className="px-message-body">{children}</div>}
      </div>
      {closable && (
        <button 
          type="button"
          className="px-message-close" 
          onClick={handleClose}
          aria-label="Close"
        >
          ×
        </button>
      )}
    </div>
  );
}
