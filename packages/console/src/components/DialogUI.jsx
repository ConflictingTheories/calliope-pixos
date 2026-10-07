/**
 * DialogUI — Message and choice dialogs for the game player.
 * 
 * Polls the engine world for _pendingMessage and _pendingChoice,
 * renders dialogs, and resolves the promises when user responds.
 */

import { useState, useEffect } from 'react';

export default function DialogUI() {
  const [message, setMessage] = useState(null);
  const [choice, setChoice] = useState(null);

  useEffect(() => {
    const interval = setInterval(() => {
      try {
        const world = typeof window !== 'undefined' ? window.__pixosWorld : null;
        if (!world) return;

        // Mark UI as active so engine doesn't auto-resolve
        world._dialogUIActive = true;

        // Check for pending message
        if (world._pendingMessage && !message) {
          setMessage(world._pendingMessage);
        } else if (!world._pendingMessage && message) {
          setMessage(null);
        }

        // Check for pending choice
        if (world._pendingChoice && !choice) {
          setChoice(world._pendingChoice);
        } else if (!world._pendingChoice && choice) {
          setChoice(null);
        }
      } catch (e) {
        // World not ready yet
      }
    }, 100);

    return () => clearInterval(interval);
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
        <div className="dialog-box dialog-choice">
          <div className="dialog-prompt">{choice.prompt}</div>
          <div className="dialog-options">
            {choice.options.map((opt, i) => (
              <button
                key={i}
                className="dialog-option"
                onClick={() => handleChoiceSelect(i)}
              >
                {typeof opt === 'string' ? opt : opt.label || opt.text || `Option ${i + 1}`}
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (message) {
    return (
      <div className="dialog-overlay">
        <div className="dialog-box dialog-message">
          <div className="dialog-text">{message.text}</div>
          <button className="dialog-dismiss" onClick={handleMessageDismiss}>
            Continue
          </button>
        </div>
      </div>
    );
  }

  return null;
}
