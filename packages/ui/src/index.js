/**
 * @pixospritz/ui — shared components
 *
 * Single design system for the entire ecosystem.
 * Both the PixoSpritz editor and SVRN publisher use these.
 */

// Button
export function Button({ variant = 'primary', size = 'medium', children, ...props }) {
  const cls = `ps-btn ps-btn-${variant} ps-btn-${size}`;
  return <button className={cls} {...props}>{children}</button>;
}

// Input
export function Input({ error, ...props }) {
  const cls = `ps-input ${error ? 'ps-input-error' : ''}`;
  return <input className={cls} {...props} />;
}

// Modal
export function Modal({ title, onClose, children, footer, wide }) {
  return (
    <div className="ps-modal-overlay" onClick={e => {
      if (e.target === e.currentTarget) onClose?.();
    }}>
      <div className={`ps-modal ${wide ? 'ps-modal-wide' : ''}`}>
        <div className="ps-modal-header">
          <h2>{title}</h2>
          {onClose && (
            <button className="ps-btn-icon" onClick={onClose} aria-label="Close">×</button>
          )}
        </div>
        <div className="ps-modal-body">{children}</div>
        {footer && <div className="ps-modal-footer">{footer}</div>}
      </div>
    </div>
  );
}

// Field (label + input + error + hint)
export function Field({ label, hint, error, required, children }) {
  return (
    <div className="ps-field">
      <label className="ps-field-label">
        {label}
        {required && <span className="ps-required">*</span>}
      </label>
      {hint && <div className="ps-field-hint">{hint}</div>}
      {children}
      {error && <div className="ps-field-error">{error}</div>}
    </div>
  );
}

// Empty state
export function EmptyState({ icon, title, message, action }) {
  return (
    <div className="ps-empty">
      {icon && <div className="ps-empty-icon">{icon}</div>}
      {title && <div className="ps-empty-title">{title}</div>}
      {message && <div className="ps-empty-message">{message}</div>}
      {action}
    </div>
  );
}

// Badge
export function Badge({ variant = 'default', children }) {
  return <span className={`ps-badge ps-badge-${variant}`}>{children}</span>;
}

// Spinner
export function Spinner({ size = 'medium' }) {
  return <div className={`ps-spinner ps-spinner-${size}`} />;
}

// Progress bar
export function ProgressBar({ progress }) {
  return (
    <div className="ps-progress-bar">
      <div
        className="ps-progress-fill"
        style={{ width: `${Math.round((progress || 0) * 100)}%` }}
      />
    </div>
  );
}
