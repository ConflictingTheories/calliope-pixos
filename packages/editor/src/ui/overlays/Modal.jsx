/**
 * Modal Component
 */
import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import './Modal.css';

export function Modal({
  open,
  onClose,
  backdrop = true,
  keyboard = true,
  size = 'sm',
  overflow = true,
  full = false,
  className = '',
  children,
  ...props
}) {
  // Handle escape key
  useEffect(() => {
    if (!keyboard || !open) return;

    const handleKeyDown = e => {
      if (e.key === 'Escape') {
        onClose?.();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [keyboard, open, onClose]);

  // Prevent body scroll when open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  if (!open) return null;

  const handleBackdropClick = e => {
    if (backdrop && e.target === e.currentTarget) {
      onClose?.();
    }
  };

  const classes = [
    'px-modal',
    `px-modal-${size}`,
    full && 'px-modal-full',
    overflow && 'px-modal-overflow',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  const modal = (
    <div className="px-modal-backdrop" onClick={handleBackdropClick}>
      <div className={classes} role="dialog" aria-modal="true" {...props}>
        {children}
      </div>
    </div>
  );

  return createPortal(modal, document.body);
}

Modal.Header = function ModalHeader({
  children,
  closeButton = true,
  onClose,
  className = '',
  ...props
}) {
  return (
    <div className={`px-modal-header ${className}`} {...props}>
      <div className="px-modal-title">{children}</div>
      {closeButton && (
        <button type="button" className="px-modal-close" onClick={onClose} aria-label="Close">
          ×
        </button>
      )}
    </div>
  );
};

Modal.Title = function ModalTitle({ children, className = '', ...props }) {
  return (
    <h4 className={`px-modal-title-text ${className}`} {...props}>
      {children}
    </h4>
  );
};

Modal.Body = function ModalBody({ children, className = '', ...props }) {
  return (
    <div className={`px-modal-body ${className}`} {...props}>
      {children}
    </div>
  );
};

Modal.Footer = function ModalFooter({ children, className = '', ...props }) {
  return (
    <div className={`px-modal-footer ${className}`} {...props}>
      {children}
    </div>
  );
};
