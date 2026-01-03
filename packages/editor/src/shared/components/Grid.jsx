/**
 * ---------------------------------------------------------------
 *                 PixoSpritz – Grid Component
 * ---------------------------------------------------------------
 * Copyright (c) 2022-2025 Kyle Derby MacInnis
 *
 * A snap-to-grid utility component for editors.
 * Provides visual grid overlay and snapping utilities.
 * 
 * Usage:
 *   <Grid
 *     size={16}
 *     visible={true}
 *     snap={true}
 *     onCellClick={handleCellClick}
 *   >
 *     <Canvas />
 *   </Grid>
 */

import React, { useMemo, useCallback, forwardRef } from 'react';
import '../styles/grid.css';

/**
 * Grid - Visual grid overlay with snapping utilities
 * 
 * @param {Object} props
 * @param {number} [props.size=16] - Grid cell size in pixels
 * @param {boolean} [props.visible=true] - Show grid lines
 * @param {boolean} [props.snap=true] - Enable snapping to grid
 * @param {string} [props.color='rgba(255, 255, 255, 0.1)'] - Grid line color
 * @param {number} [props.majorInterval=4] - Major grid line interval
 * @param {string} [props.majorColor='rgba(255, 255, 255, 0.2)'] - Major grid line color
 * @param {number} [props.offsetX=0] - Grid offset X
 * @param {number} [props.offsetY=0] - Grid offset Y
 * @param {number} [props.zoom=1] - Zoom level
 * @param {function} [props.onCellClick] - Callback when grid cell is clicked (x, y)
 * @param {function} [props.onCellHover] - Callback when hovering over cell (x, y)
 * @param {React.ReactNode} props.children - Content to render within grid
 * @param {string} [props.className] - Additional CSS classes
 */
const Grid = forwardRef(function Grid({
  size = 16,
  visible = true,
  snap = true,
  color = 'rgba(255, 255, 255, 0.1)',
  majorInterval = 4,
  majorColor = 'rgba(255, 255, 255, 0.2)',
  offsetX = 0,
  offsetY = 0,
  zoom = 1,
  onCellClick,
  onCellHover,
  children,
  className = '',
  style,
  ...rest
}, ref) {
  const actualSize = size * zoom;
  const majorSize = actualSize * majorInterval;

  // Generate grid background pattern
  const gridBackground = useMemo(() => {
    if (!visible) return {};

    return {
      backgroundImage: `
        linear-gradient(to right, ${color} 1px, transparent 1px),
        linear-gradient(to bottom, ${color} 1px, transparent 1px),
        linear-gradient(to right, ${majorColor} 1px, transparent 1px),
        linear-gradient(to bottom, ${majorColor} 1px, transparent 1px)
      `,
      backgroundSize: `
        ${actualSize}px ${actualSize}px,
        ${actualSize}px ${actualSize}px,
        ${majorSize}px ${majorSize}px,
        ${majorSize}px ${majorSize}px
      `,
      backgroundPosition: `
        ${offsetX}px ${offsetY}px,
        ${offsetX}px ${offsetY}px,
        ${offsetX}px ${offsetY}px,
        ${offsetX}px ${offsetY}px
      `
    };
  }, [visible, actualSize, majorSize, color, majorColor, offsetX, offsetY]);

  // Snap a position to the grid
  const snapToGrid = useCallback((x, y) => {
    if (!snap) return { x, y };
    const snappedX = Math.round((x - offsetX) / actualSize) * actualSize + offsetX;
    const snappedY = Math.round((y - offsetY) / actualSize) * actualSize + offsetY;
    return { x: snappedX, y: snappedY };
  }, [snap, actualSize, offsetX, offsetY]);

  // Get grid cell from position
  const getCellFromPosition = useCallback((x, y) => {
    const cellX = Math.floor((x - offsetX) / actualSize);
    const cellY = Math.floor((y - offsetY) / actualSize);
    return { cellX, cellY };
  }, [actualSize, offsetX, offsetY]);

  // Handle click on grid
  const handleClick = useCallback((e) => {
    if (!onCellClick) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const { cellX, cellY } = getCellFromPosition(x, y);
    onCellClick(cellX, cellY, e);
  }, [getCellFromPosition, onCellClick]);

  // Handle mouse move on grid
  const handleMouseMove = useCallback((e) => {
    if (!onCellHover) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const { cellX, cellY } = getCellFromPosition(x, y);
    onCellHover(cellX, cellY, e);
  }, [getCellFromPosition, onCellHover]);

  return (
    <div
      ref={ref}
      className={`grid-container ${visible ? 'grid-container--visible' : ''} ${className}`}
      style={{ ...gridBackground, ...style }}
      onClick={handleClick}
      onMouseMove={handleMouseMove}
      data-grid-size={size}
      data-grid-snap={snap}
      {...rest}
    >
      {children}
    </div>
  );
});

/**
 * useGrid - Hook for grid snapping utilities
 * 
 * @param {Object} options
 * @param {number} [options.size=16] - Grid cell size
 * @param {number} [options.offsetX=0] - Grid offset X
 * @param {number} [options.offsetY=0] - Grid offset Y
 * @param {number} [options.zoom=1] - Zoom level
 */
export function useGrid({ size = 16, offsetX = 0, offsetY = 0, zoom = 1 } = {}) {
  const actualSize = size * zoom;

  const snapToGrid = useCallback((x, y) => {
    const snappedX = Math.round((x - offsetX) / actualSize) * actualSize + offsetX;
    const snappedY = Math.round((y - offsetY) / actualSize) * actualSize + offsetY;
    return { x: snappedX, y: snappedY };
  }, [actualSize, offsetX, offsetY]);

  const snapToGridFloor = useCallback((x, y) => {
    const snappedX = Math.floor((x - offsetX) / actualSize) * actualSize + offsetX;
    const snappedY = Math.floor((y - offsetY) / actualSize) * actualSize + offsetY;
    return { x: snappedX, y: snappedY };
  }, [actualSize, offsetX, offsetY]);

  const getCellFromPosition = useCallback((x, y) => {
    const cellX = Math.floor((x - offsetX) / actualSize);
    const cellY = Math.floor((y - offsetY) / actualSize);
    return { cellX, cellY };
  }, [actualSize, offsetX, offsetY]);

  const getPositionFromCell = useCallback((cellX, cellY) => {
    const x = cellX * actualSize + offsetX;
    const y = cellY * actualSize + offsetY;
    return { x, y };
  }, [actualSize, offsetX, offsetY]);

  const getCellBounds = useCallback((cellX, cellY) => {
    const x = cellX * actualSize + offsetX;
    const y = cellY * actualSize + offsetY;
    return {
      x,
      y,
      width: actualSize,
      height: actualSize,
      left: x,
      top: y,
      right: x + actualSize,
      bottom: y + actualSize
    };
  }, [actualSize, offsetX, offsetY]);

  return {
    size: actualSize,
    snapToGrid,
    snapToGridFloor,
    getCellFromPosition,
    getPositionFromCell,
    getCellBounds
  };
}

/**
 * alignToGrid - Utility to align multiple items to grid
 * 
 * @param {Array<{x: number, y: number}>} items - Items to align
 * @param {number} gridSize - Grid cell size
 * @param {'left' | 'center' | 'right'} [horizontal='left'] - Horizontal alignment
 * @param {'top' | 'middle' | 'bottom'} [vertical='top'] - Vertical alignment
 */
export function alignToGrid(items, gridSize, horizontal = 'left', vertical = 'top') {
  if (items.length === 0) return [];

  // Find bounds
  const minX = Math.min(...items.map(i => i.x));
  const maxX = Math.max(...items.map(i => i.x));
  const minY = Math.min(...items.map(i => i.y));
  const maxY = Math.max(...items.map(i => i.y));

  // Calculate offsets
  let offsetX = 0;
  let offsetY = 0;

  switch (horizontal) {
    case 'left':
      offsetX = Math.floor(minX / gridSize) * gridSize - minX;
      break;
    case 'center':
      const centerX = (minX + maxX) / 2;
      offsetX = Math.round(centerX / gridSize) * gridSize - centerX;
      break;
    case 'right':
      offsetX = Math.ceil(maxX / gridSize) * gridSize - maxX;
      break;
  }

  switch (vertical) {
    case 'top':
      offsetY = Math.floor(minY / gridSize) * gridSize - minY;
      break;
    case 'middle':
      const centerY = (minY + maxY) / 2;
      offsetY = Math.round(centerY / gridSize) * gridSize - centerY;
      break;
    case 'bottom':
      offsetY = Math.ceil(maxY / gridSize) * gridSize - maxY;
      break;
  }

  return items.map(item => ({
    ...item,
    x: item.x + offsetX,
    y: item.y + offsetY
  }));
}

/**
 * distributeOnGrid - Distribute items evenly on grid
 * 
 * @param {Array<{x: number, y: number}>} items - Items to distribute
 * @param {number} gridSize - Grid cell size
 * @param {'horizontal' | 'vertical'} direction - Distribution direction
 */
export function distributeOnGrid(items, gridSize, direction = 'horizontal') {
  if (items.length < 2) return items;

  const sorted = [...items].sort((a, b) =>
    direction === 'horizontal' ? a.x - b.x : a.y - b.y
  );

  const first = sorted[0];
  const last = sorted[sorted.length - 1];
  const totalDistance = direction === 'horizontal'
    ? last.x - first.x
    : last.y - first.y;
  const step = totalDistance / (items.length - 1);
  const gridStep = Math.round(step / gridSize) * gridSize;

  return sorted.map((item, index) => {
    if (direction === 'horizontal') {
      return { ...item, x: first.x + gridStep * index };
    } else {
      return { ...item, y: first.y + gridStep * index };
    }
  });
}

export default Grid;
export { Grid };
