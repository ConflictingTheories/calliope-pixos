/*
 * ---------------------------------------------------------------
 *        Pixospritz – Editor – Map Editor Tools
 * ---------------------------------------------------------------
 * Copyright (c) 2022-2025  Kyle Derby MacInnis
 *
 * Central export for all map editing tools.
 */

export { default as BaseTool } from './BaseTool.js';
export { default as BrushTool } from './BrushTool.js';
export { default as EraserTool } from './EraserTool.js';
export { default as FillTool } from './FillTool.js';
export { default as SelectionTool } from './SelectionTool.js';
export { default as EyedropperTool } from './EyedropperTool.js';
export { default as RectangleTool } from './RectangleTool.js';
export { default as LineTool } from './LineTool.js';

/**
 * Tool registry for easy tool lookup by name
 */
import BrushTool from './BrushTool.js';
import EraserTool from './EraserTool.js';
import FillTool from './FillTool.js';
import SelectionTool from './SelectionTool.js';
import EyedropperTool from './EyedropperTool.js';
import RectangleTool from './RectangleTool.js';
import LineTool from './LineTool.js';

export const TOOL_REGISTRY = {
  brush: BrushTool,
  eraser: EraserTool,
  fill: FillTool,
  selection: SelectionTool,
  eyedropper: EyedropperTool,
  rectangle: RectangleTool,
  line: LineTool,
};

/**
 * Creates a tool instance by name
 * @param {string} toolName - Name of the tool
 * @param {Object} options - Tool configuration options
 * @returns {Object} Tool instance
 */
export function createTool(toolName, options = {}) {
  const ToolClass = TOOL_REGISTRY[toolName];
  if (!ToolClass) {
    // eslint-disable-next-line no-console
    console.warn(`Unknown tool: ${toolName}, falling back to brush`);
    return new BrushTool(options);
  }
  return new ToolClass(options);
}
