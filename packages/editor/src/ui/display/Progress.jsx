/**
 * Progress Component
 */
import React from 'react';
import './Progress.css';

export function Progress({
  percent = 0,
  status,
  showInfo = true,
  strokeColor,
  strokeWidth = 8,
  vertical = false,
  className = '',
  style,
  ...props
}) {
  const normalizedPercent = Math.min(100, Math.max(0, percent));

  const derivedStatus = status || (normalizedPercent >= 100 ? 'success' : 'active');

  const classes = [
    'px-progress',
    `px-progress-${derivedStatus}`,
    vertical && 'px-progress-vertical',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  const barStyle = {
    [vertical ? 'height' : 'width']: `${normalizedPercent}%`,
    backgroundColor: strokeColor,
  };

  const trackStyle = {
    [vertical ? 'width' : 'height']: `${strokeWidth}px`,
  };

  return (
    <div className={classes} style={style} {...props}>
      <div className="px-progress-track" style={trackStyle}>
        <div className="px-progress-bar" style={barStyle} />
      </div>
      {showInfo && (
        <span className="px-progress-info">
          {derivedStatus === 'success' && '✓'}
          {derivedStatus === 'fail' && '✕'}
          {derivedStatus === 'active' && `${normalizedPercent}%`}
        </span>
      )}
    </div>
  );
}

Progress.Line = Progress;

Progress.Circle = function ProgressCircle({
  percent = 0,
  status,
  showInfo = true,
  strokeColor,
  strokeWidth = 8,
  gapDegree = 0,
  gapPosition = 'bottom',
  className = '',
  style,
  ...props
}) {
  const normalizedPercent = Math.min(100, Math.max(0, percent));
  const derivedStatus = status || (normalizedPercent >= 100 ? 'success' : 'active');

  const radius = 50 - strokeWidth / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (normalizedPercent / 100) * circumference;

  const classes = ['px-progress-circle', `px-progress-${derivedStatus}`, className]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={classes} style={{ width: 100, height: 100, ...style }} {...props}>
      <svg viewBox="0 0 100 100">
        <circle
          className="px-progress-circle-track"
          cx="50"
          cy="50"
          r={radius}
          strokeWidth={strokeWidth}
          fill="none"
        />
        <circle
          className="px-progress-circle-bar"
          cx="50"
          cy="50"
          r={radius}
          strokeWidth={strokeWidth}
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          style={{ stroke: strokeColor }}
          transform="rotate(-90 50 50)"
        />
      </svg>
      {showInfo && (
        <span className="px-progress-circle-info">
          {derivedStatus === 'success' && '✓'}
          {derivedStatus === 'fail' && '✕'}
          {derivedStatus === 'active' && `${normalizedPercent}%`}
        </span>
      )}
    </div>
  );
};
