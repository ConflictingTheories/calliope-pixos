/**
 * Placeholder Component
 */
import React from 'react';
import './Placeholder.css';

export function Placeholder({ 
  rows = 3,
  rowHeight = 16,
  rowSpacing = 12,
  graph,
  active = true,
  className = '',
  style,
  ...props 
}) {
  const classes = [
    'px-placeholder',
    active && 'px-placeholder-active',
    className
  ].filter(Boolean).join(' ');

  return (
    <div className={classes} style={style} {...props}>
      {graph && (
        <div className={`px-placeholder-graph px-placeholder-graph-${graph}`} />
      )}
      <div className="px-placeholder-rows">
        {Array.from({ length: rows }).map((_, i) => (
          <div 
            key={i}
            className="px-placeholder-row"
            style={{
              height: rowHeight,
              marginBottom: i < rows - 1 ? rowSpacing : 0,
              width: i === rows - 1 ? '60%' : '100%'
            }}
          />
        ))}
      </div>
    </div>
  );
}

Placeholder.Paragraph = function PlaceholderParagraph({ 
  rows = 3,
  rowHeight = 14,
  rowSpacing = 10,
  graph,
  active = true,
  className = '',
  ...props 
}) {
  return (
    <Placeholder
      rows={rows}
      rowHeight={rowHeight}
      rowSpacing={rowSpacing}
      graph={graph}
      active={active}
      className={`px-placeholder-paragraph ${className}`}
      {...props}
    />
  );
};

Placeholder.Grid = function PlaceholderGrid({ 
  rows = 3,
  columns = 4,
  active = true,
  className = '',
  ...props 
}) {
  return (
    <div className={`px-placeholder-grid ${active ? 'px-placeholder-active' : ''} ${className}`} {...props}>
      {Array.from({ length: rows * columns }).map((_, i) => (
        <div key={i} className="px-placeholder-grid-item" />
      ))}
    </div>
  );
};
