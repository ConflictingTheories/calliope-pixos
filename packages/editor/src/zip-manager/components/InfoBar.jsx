import './styles/InfoBar.css';

import { useRef } from 'react';

/**
 * Simplified InfoBar Component
 * Shows app info and theme controls without music player
 */
function InfoBar({ hidden, theme, onSetTheme, messages }) {
  function handleChangeAccentColor(accentColor) {
    onSetTheme({ accentColor });
  }

  if (hidden) {
    return null;
  }

  return (
    <footer className="info-bar info-bar--simple">
      <div className="info-bar__meta">
        <span className="info-bar__brand">PixoSpritz IDE</span>
        <span className="info-bar__version">v0.2.0</span>
      </div>
      <div className="info-bar__controls">
        <ThemeColorPicker
          accentColor={theme.accentColor}
          onSetAccentColor={handleChangeAccentColor}
          messages={messages}
        />
      </div>
    </footer>
  );
}

/**
 * Theme Color Picker with clear label
 */
function ThemeColorPicker({ accentColor, onSetAccentColor, messages }) {
  const colorInputRef = useRef(null);

  function handleButtonClick() {
    colorInputRef.current?.click();
  }

  function handleChange(event) {
    onSetAccentColor(event.target.value);
  }

  return (
    <div className="theme-picker">
      <button
        type="button"
        className="theme-picker__button"
        onClick={handleButtonClick}
        aria-label={messages?.ACCENT_COLOR_LABEL || 'Choose accent color'}
        title="Change theme color"
      >
        <span
          className="theme-picker__swatch"
          style={{ backgroundColor: accentColor || '#ff6b9d' }}
        />
        <span className="theme-picker__label">Theme</span>
      </button>
      <input
        type="color"
        value={accentColor || '#ff6b9d'}
        onChange={handleChange}
        ref={colorInputRef}
        tabIndex={-1}
        className="theme-picker__input"
      />
    </div>
  );
}

export default InfoBar;
