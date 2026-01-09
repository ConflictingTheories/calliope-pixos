/**
 * Tooltip and Whisper Components
 */
import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import './Tooltip.css';

export function Tooltip({ children, className = '', ...props }) {
  return (
    <div className={`px-tooltip ${className}`} role="tooltip" {...props}>
      <div className="px-tooltip-arrow" />
      <div className="px-tooltip-content">{children}</div>
    </div>
  );
}

export function Whisper({ 
  children,
  speaker,
  trigger = 'hover',
  placement = 'top',
  delay = 0,
  delayHide = 0,
  className = '',
  ...props 
}) {
  const [visible, setVisible] = useState(false);
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const triggerRef = useRef(null);
  const tooltipRef = useRef(null);
  const showTimeoutRef = useRef(null);
  const hideTimeoutRef = useRef(null);

  const updatePosition = () => {
    if (!triggerRef.current || !tooltipRef.current) return;

    const triggerRect = triggerRef.current.getBoundingClientRect();
    const tooltipRect = tooltipRef.current.getBoundingClientRect();
    
    let top, left;

    switch (placement) {
      case 'top':
        top = triggerRect.top - tooltipRect.height - 8;
        left = triggerRect.left + (triggerRect.width - tooltipRect.width) / 2;
        break;
      case 'bottom':
        top = triggerRect.bottom + 8;
        left = triggerRect.left + (triggerRect.width - tooltipRect.width) / 2;
        break;
      case 'left':
        top = triggerRect.top + (triggerRect.height - tooltipRect.height) / 2;
        left = triggerRect.left - tooltipRect.width - 8;
        break;
      case 'right':
        top = triggerRect.top + (triggerRect.height - tooltipRect.height) / 2;
        left = triggerRect.right + 8;
        break;
      case 'topStart':
        top = triggerRect.top - tooltipRect.height - 8;
        left = triggerRect.left;
        break;
      case 'topEnd':
        top = triggerRect.top - tooltipRect.height - 8;
        left = triggerRect.right - tooltipRect.width;
        break;
      case 'bottomStart':
        top = triggerRect.bottom + 8;
        left = triggerRect.left;
        break;
      case 'bottomEnd':
        top = triggerRect.bottom + 8;
        left = triggerRect.right - tooltipRect.width;
        break;
      default:
        top = triggerRect.top - tooltipRect.height - 8;
        left = triggerRect.left + (triggerRect.width - tooltipRect.width) / 2;
    }

    // Keep within viewport
    const padding = 8;
    top = Math.max(padding, Math.min(window.innerHeight - tooltipRect.height - padding, top));
    left = Math.max(padding, Math.min(window.innerWidth - tooltipRect.width - padding, left));

    setPosition({ top, left });
  };

  const show = () => {
    clearTimeout(hideTimeoutRef.current);
    showTimeoutRef.current = setTimeout(() => {
      setVisible(true);
    }, delay);
  };

  const hide = () => {
    clearTimeout(showTimeoutRef.current);
    hideTimeoutRef.current = setTimeout(() => {
      setVisible(false);
    }, delayHide);
  };

  useEffect(() => {
    if (visible) {
      updatePosition();
      window.addEventListener('scroll', updatePosition, true);
      window.addEventListener('resize', updatePosition);
    }
    return () => {
      window.removeEventListener('scroll', updatePosition, true);
      window.removeEventListener('resize', updatePosition);
    };
  }, [visible]);

  useEffect(() => {
    return () => {
      clearTimeout(showTimeoutRef.current);
      clearTimeout(hideTimeoutRef.current);
    };
  }, []);

  const triggerProps = {};
  
  if (trigger === 'hover' || trigger.includes?.('hover')) {
    triggerProps.onMouseEnter = show;
    triggerProps.onMouseLeave = hide;
  }
  
  if (trigger === 'focus' || trigger.includes?.('focus')) {
    triggerProps.onFocus = show;
    triggerProps.onBlur = hide;
  }
  
  if (trigger === 'click' || trigger.includes?.('click')) {
    triggerProps.onClick = () => setVisible(v => !v);
  }

  // Clone child with ref and trigger props
  const child = React.Children.only(children);
  const triggerElement = React.cloneElement(child, {
    ref: triggerRef,
    ...triggerProps
  });

  const tooltip = visible && createPortal(
    <div
      ref={tooltipRef}
      className={`px-whisper px-whisper-${placement} ${className}`}
      style={{ 
        position: 'fixed',
        top: position.top,
        left: position.left,
        zIndex: 1060
      }}
      onMouseEnter={trigger === 'hover' ? show : undefined}
      onMouseLeave={trigger === 'hover' ? hide : undefined}
    >
      {speaker}
    </div>,
    document.body
  );

  return (
    <>
      {triggerElement}
      {tooltip}
    </>
  );
}
