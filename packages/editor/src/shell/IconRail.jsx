/*
 * ---------------------------------------------------------------
 *                     PixoSpritz – Editor – IconRail
 * ---------------------------------------------------------------
 * Copyright (c) 2022-2025  Kyle Derby MacInnis
 *
 * Godot-style icon rail: narrow vertical toolbar with icon + label
 * buttons for switching between editor tools. 72px wide, labels
 * prevent icon ambiguity.
 */

import React from 'react';
import './IconRail.css';

const TOOLS = [
  // Core creation tools
  { id: 'map-editor', icon: '🗺️', label: 'Map', group: 'core' },
  { id: 'sprite-editor', icon: '🎨', label: 'Sprite', group: 'core' },
  { id: 'tile-editor', icon: '🧱', label: 'Tile', group: 'core' },
  { id: 'script-editor', icon: '📝', label: 'Script', group: 'core' },
  // Specialized
  { id: 'cutscene-tool', icon: '🎬', label: 'Cutscene', group: 'specialized' },
  { id: 'geometry-editor', icon: '📐', label: 'Geometry', group: 'specialized' },
  // Viewer
  { id: 'model-preview', icon: '📦', label: 'Model', group: 'viewer' },
  // Assist
  { id: 'ai-generator', icon: '✨', label: 'AI Gen', group: 'assist' },
];

const GROUPS = ['core', 'specialized', 'viewer', 'assist'];

/**
 * Icon rail for tool switching.
 * @param {Object} props
 * @param {string} props.activeTool - Currently active tool ID
 * @param {Function} props.onSelectTool - Called with tool ID when clicked
 * @param {boolean} props.assetsOpen - Whether assets panel is open
 * @param {Function} props.onToggleAssets - Toggle assets panel
 */
export function IconRail({ activeTool, onSelectTool, assetsOpen, onToggleAssets }) {
  let lastGroup = null;

  return (
    <div className="icon-rail">
      {TOOLS.map(tool => {
        const showSeparator = lastGroup && tool.group !== lastGroup;
        lastGroup = tool.group;
        return (
          <React.Fragment key={tool.id}>
            {showSeparator && <div className="icon-rail__separator" />}
            <button
              className={`icon-rail__button${activeTool === tool.id ? ' is-active' : ''}`}
              onClick={() => onSelectTool(tool.id)}
              title={tool.label}
            >
              <span className="icon-rail__icon">{tool.icon}</span>
              <span className="icon-rail__label">{tool.label}</span>
            </button>
          </React.Fragment>
        );
      })}
      <div className="icon-rail__separator" />
      <button
        className={`icon-rail__button${assetsOpen ? ' is-active' : ''}`}
        onClick={onToggleAssets}
        title="Toggle assets panel"
      >
        <span className="icon-rail__icon">📁</span>
        <span className="icon-rail__label">Assets</span>
      </button>
      <div className="icon-rail__separator" />
      <button
        className="icon-rail__button"
        onClick={() => onSelectTool('settings')}
        title="Settings"
      >
        <span className="icon-rail__icon">⚙️</span>
        <span className="icon-rail__label">Settings</span>
      </button>
    </div>
  );
}

export default IconRail;
