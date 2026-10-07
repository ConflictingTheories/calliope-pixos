/**
 * DialogUI — Message and choice dialogs for the game player.
 * 
 * Polls the engine world for _pendingMessage and _pendingChoice,
 * renders dialogs, and resolves the promises when user responds.
 * Supports keyboard: Enter/Escape to dismiss messages, arrows+Enter for choices.
 */

import { useState, useEffect, useRef } from 'react';

export default function DialogUI() {
  const [message, setMessage] = useState(null);
  const [choice, setChoice] = useState(null);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const dialogRef = useRef(null);

  // Set _dialogUIActive synchronously at mount to kill race window
  useEffect(() => {
    const markActive = () => {
      try {
        const world = typeof window !== 'undefined' ? window.__pixosWorld : null;
        if (world) {
          world._dialogUIActive = true;
        }
      } catch (e) {}
    };
    markActive();
    // Also check periodically in case world appears later
    const initInterval = setInterval(markActive, 50);
    const timeout = setTimeout(() => clearInterval(initInterval), 2000);
    return () => {
      clearInterval(initInterval);
      clearTimeout(timeout);
    };
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      try {
        const world = typeof window !== 'undefined' ? window.__pixosWorld : null;
        if (!world) return;

        world._dialogUIActive = true;

        if (world._pendingMessage && !message) {
          setMessage(world._pendingMessage);
        } else if (!world._pendingMessage && message) {
          setMessage(null);
        }

        if (world._pendingChoice && !choice) {
          setChoice(world._pendingChoice);
          setSelectedIndex(0);
        } else if (!world._pendingChoice && choice) {
          setChoice(null);
        }
      } catch (e) {}
    }, 100);

    return () => clearInterval(interval);
  }, [message, choice]);

  // Keyboard handling
  useEffect(() => {
    const handleKey = (e) => {
      if (message) {
        if (e.key === 'Enter' || e.key === 'Escape' || e.key === ' ') {
          e.preventDefault();
          handleMessageDismiss();
        }
      } else if (choice) {
        if (e.key === 'ArrowUp') {
          e.preventDefault();
          setSelectedIndex(i => Math.max(0, i - 1));
        } else if (e.key === 'ArrowDown') {
          e.preventDefault();
          setSelectedIndex(i => Math.min(choice.options.length - 1, i + 1));
        } else if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleChoiceSelect(selectedIndex);
        } else if (e.key === 'Escape') {
          e.preventDefault();
          handleChoiceSelect(0);
        }
      }
    };

    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [message, choice, selectedIndex]);

  // Focus trap
  useEffect(() => {
    if ((message || choice) && dialogRef.current) {
      dialogRef.current.focus();
    }
  }, [message, choice]);

  const handleMessageDismiss = () => {
    if (message && message.resolve) {
      message.resolve();
    }
    setMessage(null);
  };

  const handleChoiceSelect = (index) => {
    if (choice && choice.resolve) {
      choice.resolve(index);
    }
    setChoice(null);
  };

  if (choice) {
    return (
      <div className="dialog-overlay">
        <div className="dialog-box dialog-choice" ref={dialogRef} tabIndex={-1}>
          <div className="dialog-prompt">{choice.prompt}</div>
          <div className="dialog-options">
            {choice.options.map((opt, i) => (
              <button
                key={i}
                className={`dialog-option ${i === selectedIndex ? 'selected' : ''}`}
                onClick={() => handleChoiceSelect(i)}
                onMouseEnter={() => setSelectedIndex(i)}
              >
                {typeof opt === 'string' ? opt : opt.label || opt.text || `Option ${i + 1}`}
              </button>
            ))}
          </div>
          <div className="dialog-hint">↑↓ to select, Enter to confirm</div>
        </div>
      </div>
    );
  }

  if (message) {
    return (
      <div className="dialog-overlay">
        <div className="dialog-box dialog-message" ref={dialogRef} tabIndex={-1}>
          <div className="dialog-text">{message.text}</div>
          <button className="dialog-dismiss" onClick={handleMessageDismiss}>
            Continue
          </button>
          <div className="dialog-hint">Enter or click to continue</div>
        </div>
      </div>
    );
  }

  return null;
}
