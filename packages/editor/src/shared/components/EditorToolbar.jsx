/**
 * ---------------------------------------------------------------
 *                 PixoSpritz – Editor Toolbar Component
 * ---------------------------------------------------------------
 * Copyright (c) 2022-2025 Kyle Derby MacInnis
 *
 * A reusable toolbar component for all editors.
 * Provides consistent UI for save, undo/redo, and common actions.
 *
 * Usage:
 *   <EditorToolbar
 *     title="Map Editor"
 *     onSave={handleSave}
 *     onUndo={undo}
 *     onRedo={redo}
 *     canUndo={canUndo}
 *     canRedo={canRedo}
 *     isSaving={isSaving}
 *     hasChanges={hasChanges}
 *     extraActions={[
 *       { icon: <ExportIcon />, label: 'Export', onClick: handleExport }
 *     ]}
 *   />
 */

import React, { useCallback, useState } from 'react';
import { ButtonToolbar, IconButton, ButtonGroup, Tooltip, Whisper, Divider, Badge } from '../../ui';

// Icon components (using simple SVG icons for standalone use)
const UndoIcon = () => (
  <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
    <path d="M12.5 8c-2.65 0-5.05.99-6.9 2.6L2 7v9h9l-3.62-3.62c1.39-1.16 3.16-1.88 5.12-1.88 3.54 0 6.55 2.31 7.6 5.5l2.37-.78C21.08 11.03 17.15 8 12.5 8z" />
  </svg>
);

const RedoIcon = () => (
  <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
    <path d="M18.4 10.6C16.55 8.99 14.15 8 11.5 8c-4.65 0-8.58 3.03-9.96 7.22L3.9 16c1.05-3.19 4.05-5.5 7.6-5.5 1.95 0 3.73.72 5.12 1.88L13 16h9V7l-3.6 3.6z" />
  </svg>
);

const SaveIcon = () => (
  <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
    <path d="M17 3H5c-1.11 0-2 .9-2 2v14c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V7l-4-4zm-5 16c-1.66 0-3-1.34-3-3s1.34-3 3-3 3 1.34 3 3-1.34 3-3 3zm3-10H5V5h10v4z" />
  </svg>
);

const HelpIcon = () => (
  <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 17h-2v-2h2v2zm2.07-7.75l-.9.92C13.45 12.9 13 13.5 13 15h-2v-.5c0-1.1.45-2.1 1.17-2.83l1.24-1.26c.37-.36.59-.86.59-1.41 0-1.1-.9-2-2-2s-2 .9-2 2H8c0-2.21 1.79-4 4-4s4 1.79 4 4c0 .88-.36 1.68-.93 2.25z" />
  </svg>
);

/**
 * @typedef {Object} ToolbarAction
 * @property {React.ReactNode} icon - Icon element
 * @property {string} label - Tooltip label
 * @property {function} onClick - Click handler
 * @property {boolean} [disabled] - Whether the action is disabled
 * @property {string} [appearance] - Button appearance ('default', 'primary', 'link', 'subtle', 'ghost')
 */

/**
 * EditorToolbar - A consistent toolbar component for all editors
 *
 * @param {Object} props
 * @param {string} [props.title] - Editor title to display
 * @param {function} [props.onSave] - Save handler
 * @param {function} [props.onUndo] - Undo handler
 * @param {function} [props.onRedo] - Redo handler
 * @param {boolean} [props.canUndo=false] - Whether undo is available
 * @param {boolean} [props.canRedo=false] - Whether redo is available
 * @param {boolean} [props.isSaving=false] - Whether save is in progress
 * @param {boolean} [props.hasChanges=false] - Whether there are unsaved changes
 * @param {ToolbarAction[]} [props.extraActions=[]] - Additional toolbar actions
 * @param {ToolbarAction[]} [props.rightActions=[]] - Actions on the right side
 * @param {function} [props.onHelp] - Help button handler (shows keyboard shortcuts)
 * @param {React.ReactNode} [props.children] - Additional content
 * @param {string} [props.className] - Additional CSS classes
 */
function EditorToolbar({
  title,
  onSave,
  onUndo,
  onRedo,
  canUndo = false,
  canRedo = false,
  isSaving = false,
  hasChanges = false,
  extraActions = [],
  rightActions = [],
  onHelp,
  children,
  className = '',
}) {
  const [showShortcuts, setShowShortcuts] = useState(false);

  const handleKeyDown = useCallback(
    event => {
      // F1 = Help
      if (event.key === 'F1') {
        event.preventDefault();
        if (onHelp) {
          onHelp();
        } else {
          setShowShortcuts(true);
        }
      }
    },
    [onHelp]
  );

  // Attach keyboard listener
  React.useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  return (
    <div
      className={`editor-toolbar ${className}`}
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '8px 16px',
        background: 'var(--rs-bg-card, #1a1d24)',
        borderBottom: '1px solid var(--rs-border-primary, #3c3f43)',
        gap: '16px',
        flexShrink: 0,
      }}
    >
      {/* Left Section: Title + History */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        {title && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <h3
              style={{
                margin: 0,
                fontSize: '16px',
                fontWeight: 600,
                color: 'var(--rs-text-primary, #fff)',
              }}
            >
              {title}
            </h3>
            {hasChanges && (
              <Badge
                content="•"
                style={{
                  background: 'var(--rs-orange-500, #ff9800)',
                  marginLeft: '4px',
                }}
              />
            )}
          </div>
        )}

        {/* Undo/Redo Controls */}
        {(onUndo || onRedo) && (
          <>
            <Divider vertical style={{ height: '24px', margin: '0' }} />
            <ButtonGroup>
              <Whisper
                placement="bottom"
                trigger="hover"
                speaker={<Tooltip>Undo (Ctrl+Z)</Tooltip>}
              >
                <IconButton
                  icon={<UndoIcon />}
                  size="sm"
                  appearance="subtle"
                  disabled={!canUndo}
                  onClick={onUndo}
                  aria-label="Undo"
                />
              </Whisper>
              <Whisper
                placement="bottom"
                trigger="hover"
                speaker={<Tooltip>Redo (Ctrl+Y)</Tooltip>}
              >
                <IconButton
                  icon={<RedoIcon />}
                  size="sm"
                  appearance="subtle"
                  disabled={!canRedo}
                  onClick={onRedo}
                  aria-label="Redo"
                />
              </Whisper>
            </ButtonGroup>
          </>
        )}
      </div>

      {/* Center Section: Extra Actions + Children */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1 }}>
        {extraActions.length > 0 && (
          <ButtonToolbar>
            {extraActions.map((action, i) => (
              <Whisper
                key={i}
                placement="bottom"
                trigger="hover"
                speaker={<Tooltip>{action.label}</Tooltip>}
              >
                <IconButton
                  icon={action.icon}
                  size="sm"
                  appearance={action.appearance || 'subtle'}
                  disabled={action.disabled}
                  onClick={action.onClick}
                  aria-label={action.label}
                />
              </Whisper>
            ))}
          </ButtonToolbar>
        )}
        {children}
      </div>

      {/* Right Section: Save + Right Actions + Help */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        {rightActions.map((action, i) => (
          <Whisper
            key={i}
            placement="bottom"
            trigger="hover"
            speaker={<Tooltip>{action.label}</Tooltip>}
          >
            <IconButton
              icon={action.icon}
              size="sm"
              appearance={action.appearance || 'subtle'}
              disabled={action.disabled}
              onClick={action.onClick}
              aria-label={action.label}
            />
          </Whisper>
        ))}

        {/* Save Button */}
        {onSave && (
          <Whisper placement="bottom" trigger="hover" speaker={<Tooltip>Save (Ctrl+S)</Tooltip>}>
            <IconButton
              icon={<SaveIcon />}
              size="sm"
              appearance={hasChanges ? 'primary' : 'subtle'}
              loading={isSaving}
              onClick={onSave}
              aria-label="Save"
            >
              Save
            </IconButton>
          </Whisper>
        )}

        {/* Help Button */}
        <Whisper placement="bottom" trigger="hover" speaker={<Tooltip>Help (F1)</Tooltip>}>
          <IconButton
            icon={<HelpIcon />}
            size="sm"
            appearance="subtle"
            onClick={onHelp || (() => setShowShortcuts(true))}
            aria-label="Help"
          />
        </Whisper>
      </div>
    </div>
  );
}

export default EditorToolbar;
