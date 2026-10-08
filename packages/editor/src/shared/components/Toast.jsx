/**
 * ---------------------------------------------------------------
 *                 PixoSpritz – Toast Component
 * ---------------------------------------------------------------
 * Copyright (c) 2022-2025 Kyle Derby MacInnis
 *
 * A notification toast system for the editor.
 *
 * Usage:
 *   import { useToast, ToastContainer } from './Toast';
 *
 *   function App() {
 *     const toast = useToast();
 *     return (
 *       <>
 *         <button onClick={() => toast.success('Saved!')}>Save</button>
 *         <ToastContainer />
 *       </>
 *     );
 *   }
 */

import React, { useState, useCallback, useEffect, createContext, useContext } from 'react';
import { createPortal } from 'react-dom';
import '../styles/toast.css';

/**
 * @typedef {'info' | 'success' | 'warning' | 'error'} ToastType
 */

/**
 * @typedef {Object} Toast
 * @property {string} id - Unique toast ID
 * @property {ToastType} type - Toast type
 * @property {string} message - Toast message
 * @property {string} [title] - Optional title
 * @property {number} [duration] - Duration in ms (0 for persistent)
 * @property {function} [onClose] - Callback when closed
 */

// Toast context
const ToastContext = createContext(null);

/**
 * ToastProvider - Provides toast functionality to children
 */
export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const removeToast = useCallback(id => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const addToast = useCallback(
    toast => {
      const id = `toast-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      const newToast = {
        id,
        duration: 4000,
        ...toast,
      };

      setToasts(prev => [...prev, newToast]);

      // Auto-remove after duration (if not persistent)
      if (newToast.duration > 0) {
        setTimeout(() => {
          removeToast(id);
          newToast.onClose?.();
        }, newToast.duration);
      }

      return id;
    },
    [removeToast]
  );

  const toast = useCallback(
    (message, options = {}) => {
      return addToast({ message, type: 'info', ...options });
    },
    [addToast]
  );

  toast.info = useCallback(
    (message, options = {}) => {
      return addToast({ message, type: 'info', ...options });
    },
    [addToast]
  );

  toast.success = useCallback(
    (message, options = {}) => {
      return addToast({ message, type: 'success', ...options });
    },
    [addToast]
  );

  toast.warning = useCallback(
    (message, options = {}) => {
      return addToast({ message, type: 'warning', ...options });
    },
    [addToast]
  );

  toast.error = useCallback(
    (message, options = {}) => {
      return addToast({ message, type: 'error', ...options });
    },
    [addToast]
  );

  toast.remove = removeToast;

  return (
    <ToastContext.Provider value={{ toasts, toast, removeToast }}>
      {children}
      <ToastContainer toasts={toasts} onClose={removeToast} />
    </ToastContext.Provider>
  );
}

/**
 * useToast - Hook to access toast functionality
 */
export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    // Return a standalone toast function if not within provider
    console.warn('useToast: No ToastProvider found. Using standalone mode.');
    return createStandaloneToast();
  }
  return context.toast;
}

// Standalone toast for use without provider
function createStandaloneToast() {
  const toast = (message, options = {}) => {
    console.log(`[Toast ${options.type || 'info'}]: ${message}`);
  };
  toast.info = (message, options) => toast(message, { ...options, type: 'info' });
  toast.success = (message, options) => toast(message, { ...options, type: 'success' });
  toast.warning = (message, options) => toast(message, { ...options, type: 'warning' });
  toast.error = (message, options) => toast(message, { ...options, type: 'error' });
  toast.remove = () => {};
  return toast;
}

/**
 * ToastContainer - Renders all active toasts
 */
function ToastContainer({ toasts = [], onClose }) {
  if (toasts.length === 0) return null;

  return createPortal(
    <div className="toast-container" role="region" aria-live="polite" aria-label="Notifications">
      {toasts.map(toast => (
        <ToastItem key={toast.id} toast={toast} onClose={onClose} />
      ))}
    </div>,
    document.body
  );
}

/**
 * ToastItem - Individual toast notification
 */
function ToastItem({ toast, onClose }) {
  const [isExiting, setIsExiting] = useState(false);

  const handleClose = useCallback(() => {
    setIsExiting(true);
    setTimeout(() => {
      onClose?.(toast.id);
      toast.onClose?.();
    }, 200);
  }, [toast, onClose]);

  return (
    <div className={`toast toast--${toast.type} ${isExiting ? 'toast--exiting' : ''}`} role="alert">
      <div className="toast__icon">
        <ToastIcon type={toast.type} />
      </div>
      <div className="toast__content">
        {toast.title && <div className="toast__title">{toast.title}</div>}
        <div className="toast__message">{toast.message}</div>
      </div>
      <button className="toast__close" onClick={handleClose} aria-label="Close notification">
        <CloseIcon />
      </button>
    </div>
  );
}

// Toast icons
function ToastIcon({ type }) {
  switch (type) {
    case 'success':
      return (
        <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
          <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
        </svg>
      );
    case 'warning':
      return (
        <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
          <path d="M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z" />
        </svg>
      );
    case 'error':
      return (
        <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" />
        </svg>
      );
    case 'info':
    default:
      return (
        <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z" />
        </svg>
      );
  }
}

function CloseIcon() {
  return (
    <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor">
      <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
    </svg>
  );
}

export default ToastContainer;
export { ToastContainer };
