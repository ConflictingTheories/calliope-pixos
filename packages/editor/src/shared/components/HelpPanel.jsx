/**
 * ---------------------------------------------------------------
 *                 PixoSpritz – Help Panel
 * ---------------------------------------------------------------
 * Copyright (c) 2022-2025 Kyle Derby MacInnis
 *
 * Contextual help system for the editor.
 * Provides quick tips, keyboard shortcuts, and documentation links.
 */

import React, { useState, useCallback } from 'react';
import { Modal, Panel, Nav, Input, Tag, Divider } from 'rsuite';

import '../styles/help-panel.css';

/**
 * Help content organized by category
 */
const HELP_CONTENT = {
  shortcuts: {
    title: '⌨️ Keyboard Shortcuts',
    items: [
      { key: '?', description: 'Open this help panel' },
      { key: 'Ctrl/⌘ + S', description: 'Save current project' },
      { key: 'Ctrl/⌘ + Z', description: 'Undo last action' },
      { key: 'Ctrl/⌘ + Shift + Z', description: 'Redo last action' },
      { key: 'Ctrl/⌘ + N', description: 'Create new project' },
      { key: 'Ctrl/⌘ + O', description: 'Open project' },
      { key: 'Ctrl/⌘ + E', description: 'Export project' },
      { key: 'Ctrl/⌘ + P', description: 'Preview/Play game' },
      { key: 'Escape', description: 'Close modal/Cancel action' },
      { key: 'Delete/Backspace', description: 'Delete selected item' },
      { key: 'Ctrl/⌘ + A', description: 'Select all (in editors)' },
      { key: 'Ctrl/⌘ + D', description: 'Duplicate selected' },
      { key: 'Space', description: 'Pan canvas (hold)' },
      { key: '+/-', description: 'Zoom in/out' },
      { key: '1-9', description: 'Select tool (context dependent)' },
    ]
  },
  editors: {
    title: '🛠️ Editors',
    items: [
      { 
        name: 'Map Editor', 
        icon: '🗺️',
        tips: [
          'Use layers to organize tiles, objects, and triggers',
          'Hold Shift to draw straight lines',
          'Right-click for context menu options',
          'Double-click a tile to edit properties'
        ]
      },
      { 
        name: 'Sprite Editor', 
        icon: '🎨',
        tips: [
          'Each sprite can have multiple animations',
          'Animations are sequences of frames',
          'Set anchor point for proper positioning',
          'Preview animations with the playback controls'
        ]
      },
      { 
        name: 'Cutscene Editor', 
        icon: '🎬',
        tips: [
          'Drag to reorder timeline events',
          'Use parallel tracks for simultaneous actions',
          'Preview with the playhead scrubbing',
          'Add dialogue, camera moves, and effects'
        ]
      },
      { 
        name: 'Script Editor', 
        icon: '📝',
        tips: [
          'PixoScript is Lua-inspired - easy to learn!',
          'Use autocomplete (Ctrl+Space) for functions',
          'Test scripts with the debug console',
          'Check API docs for available functions'
        ]
      },
      { 
        name: 'Tileset Editor', 
        icon: '🧱',
        tips: [
          'Define collision, walkability per tile',
          'Organize tiles with tags/categories',
          'Auto-tile rules for smart placement',
          'Import from external image files'
        ]
      },
    ]
  },
  quickStart: {
    title: '🚀 Quick Start',
    steps: [
      { step: 1, title: 'Open AI Generator', description: 'Click the ✨ icon in the sidebar' },
      { step: 2, title: 'Choose a Template', description: 'Browse templates or enter a custom prompt' },
      { step: 3, title: 'Generate', description: 'Click Generate and wait for your game assets' },
      { step: 4, title: 'Edit', description: 'Use the editors to customize your game' },
      { step: 5, title: 'Play', description: 'Test your game with the Preview button' },
      { step: 6, title: 'Export', description: 'Download as .pxz or publish online' },
    ]
  },
  faq: {
    title: '❓ FAQ',
    items: [
      { q: 'How do I save my project?', a: 'Press Ctrl+S or click the Save icon in the toolbar.' },
      { q: 'Can I import my own assets?', a: 'Yes! Drag-and-drop images into the Sprite Editor or use Import.' },
      { q: 'What is a .pxz file?', a: 'A compressed game package containing all assets and code.' },
      { q: 'How do triggers work?', a: 'Triggers are invisible zones that run scripts when entered.' },
      { q: 'Can I use multiplayer?', a: 'Yes! Enable Server Mode in project settings for real-time multiplayer.' },
    ]
  },
  links: {
    title: '📚 Resources',
    items: [
      { name: 'Documentation', url: 'https://pixospritz.com/docs.html', icon: '📖' },
      { name: 'Tutorials', url: 'https://pixospritz.com/tutorials.html', icon: '🎓' },
      { name: 'API Reference', url: 'https://pixospritz.com/api.html', icon: '⚙️' },
      { name: 'Community Forum', url: 'https://github.com/ConflictingTheories/calliope-pixos/discussions', icon: '💬' },
      { name: 'Report a Bug', url: 'https://github.com/ConflictingTheories/calliope-pixos/issues', icon: '🐛' },
    ]
  }
};

/**
 * HelpPanel component - contextual help modal
 */
export default function HelpPanel({ show, onClose, activeEditor = null }) {
  const [activeTab, setActiveTab] = useState('shortcuts');
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = useCallback((value) => {
    setSearchQuery(value.toLowerCase());
  }, []);

  const renderShortcuts = () => (
    <div className="help-shortcuts">
      {HELP_CONTENT.shortcuts.items.map((item, index) => (
        <div key={index} className="shortcut-item">
          <kbd className="shortcut-key">{item.key}</kbd>
          <span className="shortcut-desc">{item.description}</span>
        </div>
      ))}
    </div>
  );

  const renderEditors = () => (
    <div className="help-editors">
      {HELP_CONTENT.editors.items.map((editor, index) => (
        <Panel 
          key={index} 
          header={<><span className="editor-icon">{editor.icon}</span> {editor.name}</>}
          collapsible
          bordered
          defaultExpanded={activeEditor === editor.name.toLowerCase().replace(' ', '-')}
        >
          <ul className="editor-tips">
            {editor.tips.map((tip, i) => <li key={i}>{tip}</li>)}
          </ul>
        </Panel>
      ))}
    </div>
  );

  const renderQuickStart = () => (
    <div className="help-quickstart">
      {HELP_CONTENT.quickStart.steps.map((item) => (
        <div key={item.step} className="quickstart-step">
          <div className="step-number">{item.step}</div>
          <div className="step-content">
            <strong>{item.title}</strong>
            <p>{item.description}</p>
          </div>
        </div>
      ))}
    </div>
  );

  const renderFaq = () => (
    <div className="help-faq">
      {HELP_CONTENT.faq.items.map((item, index) => (
        <Panel key={index} header={item.q} collapsible bordered>
          <p>{item.a}</p>
        </Panel>
      ))}
    </div>
  );

  const renderLinks = () => (
    <div className="help-links">
      {HELP_CONTENT.links.items.map((item, index) => (
        <a 
          key={index} 
          href={item.url} 
          target="_blank" 
          rel="noopener noreferrer"
          className="help-link-item"
        >
          <span className="link-icon">{item.icon}</span>
          <span className="link-name">{item.name}</span>
        </a>
      ))}
    </div>
  );

  const renderContent = () => {
    switch (activeTab) {
      case 'shortcuts': return renderShortcuts();
      case 'editors': return renderEditors();
      case 'quickstart': return renderQuickStart();
      case 'faq': return renderFaq();
      case 'links': return renderLinks();
      default: return renderShortcuts();
    }
  };

  return (
    <Modal open={show} onClose={onClose} size="md" className="help-panel-modal">
      <Modal.Header>
        <Modal.Title>Help & Documentation</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Nav appearance="subtle" activeKey={activeTab} onSelect={setActiveTab}>
          <Nav.Item eventKey="shortcuts">⌨️ Shortcuts</Nav.Item>
          <Nav.Item eventKey="editors">🛠️ Editors</Nav.Item>
          <Nav.Item eventKey="quickstart">🚀 Quick Start</Nav.Item>
          <Nav.Item eventKey="faq">❓ FAQ</Nav.Item>
          <Nav.Item eventKey="links">📚 Resources</Nav.Item>
        </Nav>
        <Divider />
        <div className="help-content">
          {renderContent()}
        </div>
      </Modal.Body>
      <Modal.Footer>
        <div className="help-footer-tip">
          <Tag color="blue">Tip</Tag> Press <kbd>?</kbd> anytime to open this panel
        </div>
      </Modal.Footer>
    </Modal>
  );
}

/**
 * Get contextual help for a specific editor
 */
export function getEditorHelp(editorName) {
  const editor = HELP_CONTENT.editors.items.find(
    e => e.name.toLowerCase().replace(' ', '-') === editorName.toLowerCase()
  );
  return editor || null;
}

/**
 * Export help content for external use
 */
export { HELP_CONTENT };
