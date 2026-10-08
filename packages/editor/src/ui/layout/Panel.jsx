/**
 * Panel Component
 * A container with optional header, collapsible, bordered styling
 */
import React from 'react';
import './Panel.css';

export function Panel({
  header,
  children,
  bordered = false,
  shaded = false,
  collapsible = false,
  defaultExpanded = true,
  className = '',
  bodyFill = false,
  style,
  ...props
}) {
  const [expanded, setExpanded] = React.useState(defaultExpanded);

  const classes = [
    'px-panel',
    bordered && 'px-panel-bordered',
    shaded && 'px-panel-shaded',
    bodyFill && 'px-panel-body-fill',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={classes} style={style} {...props}>
      {header && (
        <div
          className="px-panel-header"
          onClick={collapsible ? () => setExpanded(!expanded) : undefined}
          style={collapsible ? { cursor: 'pointer' } : undefined}
        >
          {collapsible && <span className="px-panel-collapse-icon">{expanded ? '▼' : '▶'}</span>}
          {header}
        </div>
      )}
      {(!collapsible || expanded) && <div className="px-panel-body">{children}</div>}
    </div>
  );
}
