/*                                                 *\
** ----------------------------------------------- **
**          Calliope - Pixos Game Engine           **
** ----------------------------------------------- **
**  Copyright (c) 2020-2025 - Kyle Derby MacInnis  **
**                                                 **
** PixoSpritz Dual License - see LICENSE.          **
** Free for education, non-commercial use, and     **
** individual non-profit artists (CC-BY-NC-SA-4.0) **
** Commercial use requires a purchased license.    **
** ----------------------------------------------- **
\*                                                 */

/**
 * PlayerChrome: loading, error, pause, and controls UI for the game player.
 *
 * Usage:
 *   <PlayerChrome state="loading" progress={0.5} />
 *   <PlayerChrome state="error" error="Failed to load map" onRetry={...} />
 *   <PlayerChrome state="paused" onResume={...} onQuit={...} />
 *   <PlayerChrome state="controls" onClose={...} />
 */

export function PlayerLoading({ progress, message }) {
  return (
    <div className="player-overlay player-loading">
      <div className="player-loading-spinner" />
      <div className="player-loading-message">{message || 'Loading…'}</div>
      {typeof progress === 'number' && (
        <div className="player-progress-bar">
          <div
            className="player-progress-fill"
            style={{ width: `${Math.round(progress * 100)}%` }}
          />
        </div>
      )}
    </div>
  );
}

export function PlayerError({ error, onRetry, onQuit }) {
  return (
    <div className="player-overlay player-error">
      <div className="player-error-icon">⚠️</div>
      <h2>Something went wrong</h2>
      <p className="player-error-message">{error || 'Failed to load the game.'}</p>
      <div className="player-error-actions">
        {onRetry && (
          <button className="player-btn player-btn-primary" onClick={onRetry}>
            Try Again
          </button>
        )}
        {onQuit && (
          <button className="player-btn player-btn-secondary" onClick={onQuit}>
            Quit
          </button>
        )}
      </div>
    </div>
  );
}

export function PlayerPaused({ onResume, onQuit, onShowControls }) {
  return (
    <div className="player-overlay player-paused">
      <h2>Paused</h2>
      <div className="player-menu">
        {onResume && (
          <button className="player-btn player-btn-primary" onClick={onResume}>
            ▶ Resume
          </button>
        )}
        {onShowControls && (
          <button className="player-btn player-btn-secondary" onClick={onShowControls}>
            🎮 Controls
          </button>
        )}
        {onQuit && (
          <button className="player-btn player-btn-secondary" onClick={onQuit}>
            Quit to Title
          </button>
        )}
      </div>
    </div>
  );
}

export function PlayerControls({ onClose, bindings }) {
  const defaults = [
    { action: 'Move', keys: 'WASD / Arrow Keys' },
    { action: 'Interact', keys: 'E / Space' },
    { action: 'Pause', keys: 'Esc / P' },
    { action: 'Confirm', keys: 'Enter' },
  ];
  const list = bindings || defaults;

  return (
    <div className="player-overlay player-controls">
      <h2>Controls</h2>
      <div className="player-controls-list">
        {list.map((b, i) => (
          <div key={i} className="player-control-row">
            <span className="player-control-action">{b.action}</span>
            <span className="player-control-keys">{b.keys}</span>
          </div>
        ))}
      </div>
      {onClose && (
        <button className="player-btn player-btn-primary" onClick={onClose}>
          Close
        </button>
      )}
    </div>
  );
}

export function PlayerChrome({ state, ...props }) {
  switch (state) {
    case 'loading':
      return <PlayerLoading {...props} />;
    case 'error':
      return <PlayerError {...props} />;
    case 'paused':
      return <PlayerPaused {...props} />;
    case 'controls':
      return <PlayerControls {...props} />;
    default:
      return null;
  }
}

export default PlayerChrome;
