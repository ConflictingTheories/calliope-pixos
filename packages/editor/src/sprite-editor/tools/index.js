/*
 * ---------------------------------------------------------------
 *        Pixospritz – Editor – Sprite Editor Tools
 * ---------------------------------------------------------------
 * Copyright (c) 2022-2025  Kyle Derby MacInnis
 *
 * Central export for all sprite editing tools.
 */

export { default as BaseTool } from './BaseTool.js';
export { default as PencilTool } from './PencilTool.js';
export { default as BrushTool } from './BrushTool.js';
export { default as EraserTool } from './EraserTool.js';
export { default as FillTool } from './FillTool.js';
export { default as EyedropperTool } from './EyedropperTool.js';
export { default as LineTool } from './LineTool.js';
export { default as RectangleTool } from './RectangleTool.js';
export { default as EllipseTool } from './EllipseTool.js';
export { default as SelectionTool } from './SelectionTool.js';

// Tool registry for easy lookup
import PencilTool from './PencilTool.js';
import BrushTool from './BrushTool.js';
import EraserTool from './EraserTool.js';
import FillTool from './FillTool.js';
import EyedropperTool from './EyedropperTool.js';
import LineTool from './LineTool.js';
import RectangleTool from './RectangleTool.js';
import EllipseTool from './EllipseTool.js';
import SelectionTool from './SelectionTool.js';

export const TOOL_REGISTRY = {
  pencil: PencilTool,
  brush: BrushTool,
  eraser: EraserTool,
  fill: FillTool,
  eyedropper: EyedropperTool,
  line: LineTool,
  rectangle: RectangleTool,
  ellipse: EllipseTool,
  selection: SelectionTool,
};

/**
 * Creates a tool instance by name
 * @param {string} toolName - Name of the tool
 * @param {Object} options - Tool configuration options
 * @returns {BaseTool} Tool instance
 */
export function createTool(toolName, options = {}) {
  const ToolClass = TOOL_REGISTRY[toolName];
  if (!ToolClass) {
    return new PencilTool(options);
  }
  return new ToolClass(options);
}
