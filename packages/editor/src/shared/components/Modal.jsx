/**
 * ---------------------------------------------------------------
 *                 PixoSpritz – Modal Component
 * ---------------------------------------------------------------
 * Copyright (c) 2022-2025 Kyle Derby MacInnis
 *
 * A consistent modal/dialog component for the editor.
 * Supports header, footer, and various sizes.
 *
 * Usage:
 *   <Modal
 *     open={isOpen}
 *     onClose={handleClose}
 *     title="Confirm Action"
 *     size="medium"
 *   >
 *     <p>Are you sure you want to proceed?</p>
 *   </Modal>
 */

import React, { useEffect, useCallback, useRef } from 'react';
import { createPortal } from 'react-dom';
import '../styles/modal.css';

/**
 * @typedef {'small' | 'medium' | 'large' | 'fullscreen'} ModalSize
 */

/**
 * Modal - Dialog component
 *
 * @param {Object} props
 * @param {boolean} props.open - Whether modal is open
 * @param {function} props.onClose - Callback to close modal
 * @param {string} [props.title] - Modal title
 * @param {React.ReactNode} [props.icon] - Icon for title
 * @param {ModalSize} [props.size='medium'] - Modal size
 * @param {boolean} [props.showClose=true] - Show close button
 * @param {boolean} [props.closeOnOverlay=true] - Close when clicking overlay
 * @param {boolean} [props.closeOnEscape=true] - Close on Escape key
 * @param {React.ReactNode} [props.footer] - Footer content
 * @param {React.ReactNode} props.children - Modal content
 * @param {string} [props.className] - Additional CSS classes
 */
function Modal({
  open,
  onClose,
  title,
  icon,
  size = 'medium',
  showClose = true,
  closeOnOverlay = true,
  closeOnEscape = true,
  footer,
  children,
  className = '',
}) {
  const modalRef = useRef(null);
  const previousActiveElement = useRef(null);

  // Handle escape key
  const handleKeyDown = useCallback(
    e => {
      if (closeOnEscape && e.key === 'Escape') {
        onClose?.();
      }
    },
    [closeOnEscape, onClose]
  );

  // Handle overlay click
  const handleOverlayClick = useCallback(
    e => {
      if (closeOnOverlay && e.target === e.currentTarget) {
        onClose?.();
      }
    },
    [closeOnOverlay, onClose]
  );

  // Manage focus and body scroll
  useEffect(() => {
    if (open) {
      previousActiveElement.current = document.activeElement;
      document.body.style.overflow = 'hidden';
      modalRef.current?.focus();
      document.addEventListener('keydown', handleKeyDown);
    } else {
      document.body.style.overflow = '';
      previousActiveElement.current?.focus();
    }

    return () => {
      document.body.style.overflow = '';
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [open, handleKeyDown]);

  if (!open) return null;

  const modalContent = (
    <div
      className="modal-overlay"
      onClick={handleOverlayClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby={title ? 'modal-title' : undefined}
    >
      <div ref={modalRef} className={`modal modal--${size} ${className}`} tabIndex={-1}>
        {/* Header */}
        {(title || showClose) && (
          <div className="modal__header">
            <div className="modal__title-wrapper">
              {icon && <span className="modal__icon">{icon}</span>}
              {title && (
                <h2 id="modal-title" className="modal__title">
                  {title}
                </h2>
              )}
            </div>
            {showClose && (
              <button className="modal__close" onClick={onClose} aria-label="Close modal">
                <CloseIcon />
              </button>
            )}
          </div>
        )}

        {/* Content */}
        <div className="modal__content">{children}</div>

        {/* Footer */}
        {footer && <div className="modal__footer">{footer}</div>}
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}

// Close icon
function CloseIcon() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
      <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
    </svg>
  );
}

/**
 * ConfirmModal - A convenience wrapper for confirmation dialogs
 */
function ConfirmModal({
  open,
  onClose,
  onConfirm,
  title = 'Confirm',
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  variant = 'primary', // 'primary' | 'danger'
  ...props
}) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      title={title}
      size="small"
      footer={
        <div className="modal__button-group">
          <button className="modal__button modal__button--secondary" onClick={onClose}>
            {cancelText}
          </button>
          <button
            className={`modal__button modal__button--${variant}`}
            onClick={() => {
              onConfirm?.();
              onClose?.();
            }}
          >
            {confirmText}
          </button>
        </div>
      }
      {...props}
    >
      <p className="modal__message">{message}</p>
    </Modal>
  );
}

export default Modal;
export { Modal, ConfirmModal };
