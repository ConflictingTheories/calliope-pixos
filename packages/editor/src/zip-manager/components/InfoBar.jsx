import './styles/InfoBar.css';

import { useEffect, useRef, useState } from 'react';

function InfoBar({ hidden, theme, musicData, onPlayMusic, onStopMusic, onSetTheme, musicPlayerActive, constants, messages }) {
  const PLAYER_ICON_CLASSNAME = 'icon icon-music-player';
  const PLAYER_PAUSED_CLASSNAME = ' paused';
  const PLAYER_PAUSED = {
    label: messages.PAUSED_MUSIC_ICON,
    className: PLAYER_ICON_CLASSNAME + PLAYER_PAUSED_CLASSNAME,
  };
  const PLAYER_ACTIVE = {
    label: messages.PLAYING_MUSIC_ICON,
    className: PLAYER_ICON_CLASSNAME,
  };

  const [iconPlayer, setIconPlayer] = useState(PLAYER_PAUSED);

  function handleChangeAccentColor(accentColor) {
    onSetTheme({ accentColor });
  }

  function handleChangeIconPlayer(paused) {
    const iconData = paused ? PLAYER_PAUSED : PLAYER_ACTIVE;
    setIconPlayer(iconData);
  }

  if (hidden) {
    return null;
  }

  return (
    <footer className={`info-bar${musicPlayerActive ? ' player-active' : ''}`}>
      <div className="info-bar__meta">
        <div className="info-bar__title">
          <span>PixoSpritz IDE</span>
          <small>v0.2.0</small>
        </div>
        <p className="info-bar__subtitle">Website skin synced · Console ready</p>
      </div>
      <div className="info-bar__controls">
        <AccentColorPickerButton
          accentColor={theme.accentColor}
          onSetAccentColor={handleChangeAccentColor}
          messages={messages}
        >
          🎨
        </AccentColorPickerButton>
        <MusicPlayerButton
          musicPlayerActive={musicPlayerActive}
          iconPlayer={iconPlayer}
          onSetIconPlayer={handleChangeIconPlayer}
          onPlayMusic={onPlayMusic}
          onStopMusic={onStopMusic}
        />
        <MusicVisualizer
          skin={theme.skin}
          musicData={musicData}
          accentColor={theme.accentColor}
          musicPlayerActive={musicPlayerActive}
          constants={constants}
        />
      </div>
    </footer>
  );
}

function AccentColorPickerButton({ accentColor, onSetAccentColor, children, messages }) {
  const colorInputRef = useRef(null);

  function handleButtonClick() {
    colorInputRef.current?.click();
  }

  function handleChange(event) {
    onSetAccentColor(event.target.value);
  }

  useEffect(() => {
    if (accentColor) {
      colorInputRef.current.value = accentColor;
    }
  }, [accentColor]);

  return (
    <>
      <button
        type="button"
        className="info-bar__icon-button"
        onClick={handleButtonClick}
        aria-label={messages.ACCENT_COLOR_LABEL}
      >
        <span className="icon" aria-hidden="true">
          {children}
        </span>
      </button>
      <input type="color" onChange={handleChange} ref={colorInputRef} tabIndex={-1} />
    </>
  );
}

function MusicPlayerButton({ onPlayMusic, onStopMusic, musicPlayerActive, iconPlayer, onSetIconPlayer }) {
  function handlePlayButtonClick() {
    if (musicPlayerActive) {
      onStopMusic();
      onSetIconPlayer(true);
    } else {
      onPlayMusic();
      onSetIconPlayer();
    }
  }

  return (
    <button
      type="button"
      className={`info-bar__icon-button ${musicPlayerActive ? 'is-playing' : ''}`}
      onClick={handlePlayButtonClick}
      aria-label={iconPlayer.label}
    >
      <span className={iconPlayer.className} aria-hidden="true">
        {iconPlayer.label}
      </span>
    </button>
  );
}

function MusicVisualizer({ skin, musicData, accentColor, musicPlayerActive, constants }) {
  const CANVAS_WIDTH = 128;
  const CANVAS_HEIGTH = 64;
  const CANVAS_BLOCK_OFFSET = CANVAS_HEIGTH / 8;
  const MAX_FFT_VALUE = 256;

  const canvasRef = useRef(null);
  const audioContextRef = useRef(null);
  const resolution = constants?.FFT_RESOLUTIONS?.[skin] ?? 64;
  const barWidth = resolution ? CANVAS_WIDTH / (resolution / 2) : 2;

  useEffect(() => {
    if (!canvasRef.current) {
      return;
    }

    if (!audioContextRef.current) {
      audioContextRef.current = canvasRef.current.getContext('2d');
    }

    const context = audioContextRef.current;
    const gradient = context.createLinearGradient(0, 0, 0, CANVAS_HEIGTH);
    const accent = accentColor || '#ffffff';
    gradient.addColorStop(0, accent);
    gradient.addColorStop(0.7, accent);
    gradient.addColorStop(1, 'transparent');
    context.fillStyle = gradient;
  }, [accentColor]);

  useEffect(() => {
    if (!canvasRef.current || !audioContextRef.current) {
      return;
    }

    const context = audioContextRef.current;
    context.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGTH);

    if (!musicPlayerActive || !musicData?.frequencyData) {
      return;
    }

    musicData.frequencyData.forEach((byteTimeDomain, index) => {
      const barHeight = (CANVAS_BLOCK_OFFSET - byteTimeDomain) / (MAX_FFT_VALUE / CANVAS_HEIGTH);
      context.fillRect(index * barWidth, CANVAS_HEIGTH, barWidth, barHeight);
      context.fillRect(CANVAS_WIDTH - index * barWidth - barWidth, CANVAS_HEIGTH, barWidth, barHeight);
    });
  }, [musicData, musicPlayerActive, barWidth]);

  return (
    <div className="info-bar__visualizer">
      <canvas ref={canvasRef} width={CANVAS_WIDTH} height={CANVAS_HEIGTH}></canvas>
    </div>
  );
}

export default InfoBar;
