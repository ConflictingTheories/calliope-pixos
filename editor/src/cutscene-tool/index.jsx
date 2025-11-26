/*
 * ---------------------------------------------------------------
 *              Pixospritz – Editor – Cutscene Tool
 * ---------------------------------------------------------------
 * Copyright (c) 2022‑2025  Kyle Derby MacInnis
 *
 * The CutsceneTool allows authors to construct simple scripted
 * sequences for storytelling.  A cutscene consists of an ordered
 * list of events such as dialogue lines, waits, or actions.  Users
 * can add events, reorder them and edit their contents.  The
 * resulting array of events can be exported as JSON for inclusion
 * in a Pixospritz package.
 */

import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { collect } from 'react-recollect';
import {
  Button,
  Message,
  Nav,
  Input,
  SelectPicker,
  ButtonGroup,
  Panel,
} from 'rsuite';
import Editor, { loader } from '@monaco-editor/react';
import * as monaco from 'monaco-editor';
import { registerSpritzCutLanguage } from '../shared/spritzcut-language.js';
import CutscenePlayer from './CutscenePlayer';

// Configure Monaco to use local bundle
loader.config({ monaco });

// Register SpritzCut language
registerSpritzCutLanguage(monaco);

// Available event types for cutscenes
const EVENT_TYPES = [
  { label: 'Dialogue', value: 'dialogue' },
  { label: 'Cutin', value: 'cutin' },
  { label: 'Wait', value: 'wait' },
  { label: 'Action', value: 'action' },
];

// Parse DSL script to events for editing
function parseDSLToEvents(text) {
  const events = [];
  const lines = text.replace(/\r\n/g, '\n').split('\n');
  let i = 0;

  while (i < lines.length) {
    let raw = lines[i].trim();
    if (!raw || raw.startsWith('#')) {
      i++;
      continue;
    }

    // Dialogue line: NAME: content or *NAME: content
    const dlg = raw.match(/^(\*?)([A-Za-z0-9_]+)\s*:\s*(.*)$/);
    if (dlg) {
      const isCutin = !!dlg[1];
      const speaker = dlg[2];
      let tail = dlg[3].trim();
      let meta = {};

      // Extract bracket metadata
      if (tail.startsWith('[')) {
        const ci = tail.indexOf(']');
        if (ci !== -1) {
          const bracketStr = tail.slice(0, ci + 1);
          // Simple bracket parser
          const inner = bracketStr.slice(1, -1);
          inner.split(',').forEach(p => {
            const [k, v] = p.trim().split('=');
            if (k && v) meta[k.trim()] = v.trim().replace(/^"|"$/g, '');
          });
          tail = tail.slice(ci + 1).trim();
        }
      }

      // Check for multiline content
      let content = tail;
      if (tail.startsWith('"""') || (lines[i + 1] && lines[i + 1].trim().startsWith('"""'))) {
        if (!tail.startsWith('"""')) i++;
        content = '';
        let collecting = true;
        while (i < lines.length && collecting) {
          const line = lines[i];
          if (line.includes('"""')) {
            const parts = line.split('"""');
            if (parts.length > 1) {
              content += parts[1];
              collecting = false;
            } else if (parts[0]) {
              content += parts[0];
              collecting = false;
            }
            i++;
            break;
          } else {
            content += line + '\n';
            i++;
          }
        }
        content = content.trim();
      }

      events.push({
        type: isCutin ? 'cutin' : 'dialogue',
        speaker,
        content,
        portrait: meta.sprite || '',
        meta
      });
      i++;
      continue;
    }

    // Wait command
    if (raw.startsWith('wait ')) {
      const match = raw.match(/^wait\s+(\d+)/);
      if (match) {
        events.push({
          type: 'wait',
          duration: parseInt(match[1], 10) / 1000, // Convert ms to seconds
          command: raw
        });
      }
      i++;
      continue;
    }

    // waitInput command
    if (raw.startsWith('waitInput')) {
      events.push({
        type: 'wait',
        duration: 0,
        command: raw
      });
      i++;
      continue;
    }

    // @ commands (actions, backdrop, transitions, etc)
    if (raw.startsWith('@')) {
      events.push({
        type: 'action',
        command: raw,
        speaker: '',
        content: ''
      });
      i++;
      continue;
    }

    // Unknown/raw command
    events.push({
      type: 'action',
      command: raw,
      speaker: '',
      content: ''
    });
    i++;
  }

  return events.length > 0 ? events : [
    { type: 'dialogue', speaker: '', content: '', portrait: '', meta: {} }
  ];
}

// Serialize events to SpritzCut DSL script string
function serializeEvents(events) {
  function serializeBracket(meta) {
    const parts = [];
    for (const key in meta) {
      const val = meta[key];
      if (val === true) parts.push(key);
      else if (val !== '' && val !== null && val !== undefined) parts.push(`${key}=${val}`);
    }
    return parts.length ? `[${parts.join(',')}]` : '';
  }

  let script = '';
  events.forEach((ev) => {
    if (ev.type === 'dialogue' || ev.type === 'cutin') {
      const bracket = serializeBracket(ev.meta || {});
      const prefix = ev.type === 'cutin' ? '*' : '';
      const speaker = ev.speaker || ev.actor || 'UNKNOWN';
      
      if (ev.content && ev.content.includes('\n')) {
        // Multiline content
        script += `${prefix}${speaker}: ${bracket}\n"""\n${ev.content}\n"""\n\n`;
      } else {
        // Single line content
        const content = ev.content || '';
        script += `${prefix}${speaker}: ${bracket}${bracket && content ? ' ' : ''}${content}\n`;
      }
    } else if (ev.type === 'wait') {
      if (ev.command && ev.command.includes('waitInput')) {
        script += 'waitInput\n';
      } else {
        const dur = ev.duration || 1;
        script += `wait ${Math.round(dur * 1000)}\n`;
      }
    } else if (ev.type === 'action') {
      const cmd = ev.command || '';
      if (cmd.startsWith('@')) {
        script += `${cmd}\n`;
      } else if (cmd) {
        script += `@action ${cmd}\n`;
      }
    } else {
      // Fallback raw or unknown events 
      if (ev.raw) script += ev.raw + '\n';
      else if (ev.command) script += ev.command + '\n';
    }
  });
  return script;
}

function CutsceneTool({ content, onSave, assets = [], fileExtension = '.pxc', assetLoader }) {
  // Maintain events state; parse input content in an effect
  const [events, setEvents] = useState([
    { type: 'dialogue', speaker: '', content: '', portrait: '', meta: {} },
  ]);
  const [error, setError] = useState(null);

  // History for undo/redo
  const [history, setHistory] = useState([]);
  const [historyIndex, setHistoryIndex] = useState(-1);

  // Speed state for player
  const [speed, setSpeed] = useState(60);
  // Auto advance state for player
  const [autoAdvance, setAutoAdvance] = useState(false);
  // Editor mode: 'text' or 'visual'
  const [editorMode, setEditorMode] = useState('text');
  // Text content for text editor
  const [textContent, setTextContent] = useState('');

  // Ref to CutscenePlayer for imperative control
  const cutscenePlayerRef = useRef(null);
  // Track if initial content has been loaded
  const initialLoadDone = useRef(false);

  // Push snapshot into history; ensures future redo states are discarded
  function pushHistorySnapshot(nextEvents) {
    const snapshot = JSON.parse(JSON.stringify(nextEvents));
    setHistory((prev) => {
      const trimmed = prev.slice(0, historyIndex + 1);
      const updated = [...trimmed, snapshot];
      setHistoryIndex(updated.length - 1);
      return updated;
    });
  }

  // Undo last action
  function undo() {
    if (historyIndex > 0) {
      const prevState = history[historyIndex - 1];
      setEvents(prevState);
      setTextContent(serializeEvents(prevState));
      setHistoryIndex(historyIndex - 1);
    }
  }

  // Redo next action
  function redo() {
    if (historyIndex < history.length - 1) {
      const nextState = history[historyIndex + 1];
      setEvents(nextState);
      setTextContent(serializeEvents(nextState));
      setHistoryIndex(historyIndex + 1);
    }
  }

  // Reparse when content changes (only on initial load)
  useEffect(() => {
    if (content && !initialLoadDone.current) {
      try {
        setTextContent(content);
        // Try parsing as JSON first (for backward compatibility)
        let parsed;
        try {
          const obj = JSON.parse(content);
          if (Array.isArray(obj)) {
            parsed = obj;
          } else if (obj.events && Array.isArray(obj.events)) {
            parsed = obj.events;
          }
        } catch {
          // Not JSON, try parsing as DSL script
          parsed = parseDSLToEvents(content);
        }

        if (!parsed || parsed.length === 0) {
          parsed = [
            { type: 'dialogue', speaker: '', content: '', portrait: '', meta: {} },
          ];
        }

        setEvents(parsed);
        // Initialize history with parsed events
        setHistory([JSON.parse(JSON.stringify(parsed))]);
        setHistoryIndex(0);
        setError(null);
        initialLoadDone.current = true;
      } catch (err) {
        console.warn('Failed to parse cutscene content', err);
        setError('Failed to parse cutscene: ' + err.message);
        // Reset events to a default single dialogue event
        const defaultEvents = [
          { type: 'dialogue', speaker: '', content: '', portrait: '', meta: {} },
        ];
        setEvents(defaultEvents);
        setHistory([JSON.parse(JSON.stringify(defaultEvents))]);
        setHistoryIndex(0);
        initialLoadDone.current = true;
      }
    }
  }, [content]);

  // Build portrait options from available assets
  const portraitOptions = assets.map((a) => ({ label: a.name, value: a.name }));
  
  // Quick insert templates for common commands
  const insertTemplate = (template) => {
    if (editorMode === 'text') {
      const cursorPos = textContent.length;
      const newText = textContent + (textContent.endsWith('\n') ? '' : '\n') + template + '\n';
      setTextContent(newText);
      try {
        const parsed = parseDSLToEvents(newText);
        setEvents(parsed);
        pushHistorySnapshot(parsed);
      } catch (err) {
        console.warn('Parse error:', err);
      }
    } else {
      // In visual mode, add an action event with the template
      const next = [...events, { type: 'action', command: template, speaker: '', content: '' }];
      setEvents(next);
      setTextContent(serializeEvents(next));
      pushHistorySnapshot(next);
    }
  };

  // Update an event field
  function updateEvent(index, prop, value) {
    const next = events.map((ev, i) => {
      if (i === index) {
        if (prop === 'meta' && typeof value === 'object') {
          return { ...ev, meta: { ...ev.meta, ...value } };
        }
        return { ...ev, [prop]: value };
      }
      return ev;
    });
    setEvents(next);
    setTextContent(serializeEvents(next));
    pushHistorySnapshot(next);
  }

  // Add a new event to the end
  function addEvent() {
    const next = [...events, { type: 'dialogue', speaker: '', content: '', portrait: '', meta: {} }];
    setEvents(next);
    setTextContent(serializeEvents(next));
    pushHistorySnapshot(next);
  }

  // Remove an event by index
  function removeEvent(index) {
    const next = events.filter((_, i) => i !== index);
    setEvents(next);
    setTextContent(serializeEvents(next));
    pushHistorySnapshot(next);
  }

  // Move an event up or down in the list
  function moveEvent(index, direction) {
    const next = [...events];
    const newIndex = index + direction;
    if (newIndex < 0 || newIndex >= next.length) return;
    const target = next[index];
    next[index] = next[newIndex];
    next[newIndex] = target;
    setEvents(next);
    setTextContent(serializeEvents(next));
    pushHistorySnapshot(next);
  }

  // Serialize events into script text passed to player for playback
  const scriptText = useMemo(() => {
    return editorMode === 'text' ? textContent : serializeEvents(events);
  }, [events, textContent, editorMode]);

  function handleSave() {
    if (onSave) {
      // Save as DSL script for .pxc files, JSON for others
      if (fileExtension === '.pxc') {
        const dslScript = editorMode === 'text' ? textContent : serializeEvents(events);
        onSave(dslScript);
      } else {
        onSave(events);
      }
    } else {
      console.log('Cutscene saved:', JSON.stringify(events, null, 2));
    }
  }

  return (
    <div 
      className="cutscene-tool"
      style={{ 
        display: 'flex', 
        flexDirection: 'column',
        padding: '0.5rem',
        height: '100%',
        width: '100%',
        boxSizing: 'border-box',
        gap: '0.5rem',
        overflow: 'hidden',
      }}
    >
      {error && (
        <div style={{ position: 'absolute', top: 10, left: '50%', transform: 'translateX(-50%)', zIndex: 1000 }}>
          <Message type='error' description={error} closable onClose={() => setError(null)} />
        </div>
      )}
      
      {/* Main content area - horizontal split */}
      <div style={{
        display: 'flex',
        flex: 1,
        minHeight: 0,
        gap: '0.75rem',
      }}>
        {/* Left side - Preview player */}
        <div style={{
          flex: '0 0 60%',
          minWidth: 0,
          display: 'flex',
          flexDirection: 'column',
          background: 'linear-gradient(135deg, rgba(7,20,38,0.9), rgba(4,12,20,0.9))',
          border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: '10px',
          overflow: 'hidden',
        }}>
          {/* Preview header */}
          <div style={{
            padding: '8px 12px',
            borderBottom: '1px solid rgba(255,255,255,0.06)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexShrink: 0,
          }}>
            <h4 style={{ margin: 0, color: '#7dd3fc', fontSize: '13px', fontWeight: 600 }}>
              Preview Stage
            </h4>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <label style={{ fontSize: '11px', color: 'rgba(255,255,255,0.7)' }}>Speed</label>
                <input
                  type="range"
                  min="8"
                  max="200"
                  value={speed}
                  onChange={(e) => setSpeed(Number(e.target.value))}
                  style={{ width: '80px' }}
                />
                <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.7)', width: '28px', textAlign: 'right' }}>{speed}</span>
              </div>
              <label style={{ 
                fontSize: '11px', 
                color: 'rgba(255,255,255,0.7)',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                cursor: 'pointer',
              }}>
                <input
                  type="checkbox"
                  checked={autoAdvance}
                  onChange={(e) => setAutoAdvance(e.target.checked)}
                  style={{ margin: 0 }}
                />
                Auto
              </label>
            </div>
          </div>
          
          {/* Player container - maintains aspect ratio */}
          <div style={{
            flex: 1,
            minHeight: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '8px',
            background: '#000',
          }}>
            <div style={{
              width: '100%',
              maxWidth: '960px',
              aspectRatio: '16/9',
              position: 'relative',
            }}>
              <CutscenePlayer
                ref={cutscenePlayerRef}
                scriptText={scriptText}
                speed={speed}
                autoAdvance={autoAdvance}
                assetLoader={assetLoader}
              />
            </div>
          </div>
        </div>

        {/* Right side - Editor Panel */}
        <div 
          className="editor-panel"
          style={{
            flex: '0 0 40%',
            minWidth: 0,
            background: 'linear-gradient(135deg, rgba(7,20,38,0.9), rgba(4,12,20,0.9))',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: '10px',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
          }}
          onKeyDown={(e) => e.stopPropagation()}
          onKeyUp={(e) => e.stopPropagation()}
          onClick={(e) => e.stopPropagation()}
          onMouseDown={(e) => e.stopPropagation()}
        >
          {/* Editor header with tabs */}
          <div style={{ 
            padding: '8px 12px',
            borderBottom: '1px solid rgba(255,255,255,0.06)',
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            flexShrink: 0,
          }}>
            <h4 style={{ margin: 0, color: '#7dd3fc', fontSize: '13px', fontWeight: 600 }}>
              SpritzCut DSL Editor
            </h4>
            <Nav appearance="subtle" activeKey={editorMode} onSelect={setEditorMode} style={{ marginBottom: 0 }}>
              <Nav.Item eventKey="text" style={{ fontSize: '11px', padding: '3px 8px' }}>Code</Nav.Item>
              <Nav.Item eventKey="visual" style={{ fontSize: '11px', padding: '3px 8px' }}>Visual</Nav.Item>
            </Nav>
          </div>
          
          {/* Quick Insert Commands Panel */}
          <details style={{ 
            margin: '8px',
            background: 'rgba(125,211,252,0.05)',
            border: '1px solid rgba(125,211,252,0.15)',
            borderRadius: '6px',
            padding: '6px',
            flexShrink: 0,
          }}>
            <summary style={{ 
              color: '#7dd3fc',
              fontSize: '10px',
              fontWeight: 600,
              cursor: 'pointer',
              userSelect: 'none',
              textTransform: 'uppercase',
              letterSpacing: '0.5px'
            }}>
              Quick Insert Commands
            </summary>
            <div style={{ 
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: '3px',
              marginTop: '6px'
            }}>
              {[
                { label: '🖼️ Backdrop', template: '@backdrop textures/room.gif [fadeIn=800]' },
                { label: '👤 Character', template: '@char HERO sprite=characters/male' },
                { label: '🎵 BGM', template: '@do playBgm [name=audio/brass-loop.mp3]' },
                { label: '🔊 SFX', template: '@do playSfx [name=audio/organ.mp3]' },
                { label: '⏱️ Wait', template: 'wait 1000' },
                { label: '⌨️ Input', template: 'waitInput' },
                { label: '🌀 Transition', template: '@transition fadeOutBackdrop [duration=600]' },
                { label: '⚡ Action', template: '@action HERO moveTo [x=40,duration=600]' },
                { label: '💬 Comment', template: '# Comment or scene header' },
              ].map(({ label, template }) => (
                <button
                  key={label}
                  onClick={() => insertTemplate(template)}
                  style={{
                    background: 'rgba(125,211,252,0.1)',
                    border: '1px solid rgba(125,211,252,0.2)',
                    color: '#7dd3fc',
                    padding: '3px 4px',
                    borderRadius: '3px',
                    cursor: 'pointer',
                    fontSize: '9px',
                    fontWeight: 500,
                  }}
                  title={template}
                >
                  {label}
                </button>
              ))}
            </div>
          </details>
          
          {/* Editor content area */}
          <div style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column', padding: '0 8px 8px' }}>
            {/* Text Editor Mode - Monaco */}
            {editorMode === 'text' && (
              <div style={{ flex: 1, minHeight: 0, borderRadius: '6px', overflow: 'hidden' }}>
                <Editor
                  theme="spritzcut-dark"
                  height="100%"
                  value={textContent}
                  language="spritzcut"
                  onChange={(value) => {
                    setTextContent(value || '');
                    try {
                      const parsed = parseDSLToEvents(value || '');
                      setEvents(parsed);
                    } catch (err) {
                      console.warn('Parse error:', err);
                    }
                  }}
                  loading={<div style={{ padding: '1rem', color: '#888' }}>Loading editor...</div>}
                  options={{
                    minimap: { enabled: false },
                    fontSize: 12,
                    lineNumbers: 'on',
                    scrollBeyondLastLine: false,
                    wordWrap: 'on',
                    automaticLayout: true,
                    padding: { top: 8 },
                  }}
                />
              </div>
            )}

            {/* Visual Editor Mode - Storyboard Style */}
            {editorMode === 'visual' && (
              <StoryboardEditor
                events={events}
                setEvents={setEvents}
                setTextContent={setTextContent}
                serializeEvents={serializeEvents}
                pushHistorySnapshot={pushHistorySnapshot}
                portraitOptions={portraitOptions}
              />
            )}
                      size="sm"
                      style={{ flex: 1 }}
                      placeholder="Event Type"
                      preventOverflow
                      menuStyle={{ zIndex: 10000 }}
                    />
                  </div>
                  <div style={{ display: 'flex', gap: '4px', marginLeft: '8px' }}>
                    <button
                      onClick={() => moveEvent(idx, -1)}
                      disabled={idx === 0}
                      style={{
                        background: 'rgba(125,211,252,0.1)',
                        border: '1px solid rgba(125,211,252,0.2)',
                        color: idx === 0 ? 'rgba(125,211,252,0.3)' : '#7dd3fc',
                        padding: '4px 8px',
                        borderRadius: '4px',
                        cursor: idx === 0 ? 'not-allowed' : 'pointer',
                        fontSize: '12px',
                        fontWeight: 600,
                      }}
                      title="Move Up"
                    >
                      ↑
                    </button>
                    <button
                      onClick={() => moveEvent(idx, 1)}
                      disabled={idx === events.length - 1}
                      style={{
                        background: 'rgba(125,211,252,0.1)',
                        border: '1px solid rgba(125,211,252,0.2)',
                        color: idx === events.length - 1 ? 'rgba(125,211,252,0.3)' : '#7dd3fc',
                        padding: '4px 8px',
                        borderRadius: '4px',
                        cursor: idx === events.length - 1 ? 'not-allowed' : 'pointer',
                        fontSize: '12px',
                        fontWeight: 600,
                      }}
                      title="Move Down"
                    >
                      ↓
                    </button>
                    <button
                      onClick={() => removeEvent(idx)}
                      style={{
                        background: 'rgba(239,68,68,0.1)',
                        border: '1px solid rgba(239,68,68,0.3)',
                        color: '#ef4444',
                        padding: '4px 8px',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontSize: '12px',
                        fontWeight: 600,
                      }}
                      title="Delete"
                    >
                      ✕
                    </button>
                  </div>
                </div>

                {/* Content Fields */}
                {(ev.type === 'dialogue' || ev.type === 'cutin') && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    <div>
                      <label style={{ 
                        display: 'block',
                        fontSize: '11px',
                        color: 'rgba(125,211,252,0.8)',
                        marginBottom: '4px',
                        fontWeight: 600,
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px'
                      }}>
                        Speaker Name
                      </label>
                      <Input
                        value={ev.speaker || ''}
                        placeholder='e.g., ALDEN'
                        onChange={(val) => updateEvent(idx, 'speaker', val)}
                        size="sm"
                        style={{
                          background: 'rgba(2,20,35,0.6)',
                          border: '1px solid rgba(125,211,252,0.2)',
                          color: '#e6eef8',
                        }}
                      />
                    </div>
                    <div>
                      <label style={{ 
                        display: 'block',
                        fontSize: '11px',
                        color: 'rgba(125,211,252,0.8)',
                        marginBottom: '4px',
                        fontWeight: 600,
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px'
                      }}>
                        {ev.type === 'cutin' ? 'Cutin Image' : 'Portrait Image'}
                      </label>
                      <SelectPicker
                        data={portraitOptions}
                        value={ev.portrait || ''}
                        onChange={(val) => updateEvent(idx, 'portrait', val)}
                        placeholder={ev.type === 'cutin' ? 'Select cutin image...' : 'Select portrait...'}
                        cleanable
                        block
                        size="sm"
                        style={{
                          background: 'rgba(2,20,35,0.6)',
                        }}
                        preventOverflow
                        menuStyle={{ zIndex: 10000 }}
                      />
                    </div>
                    <div style={{ display: 'flex', gap: '10px' }}>
                      <div style={{ flex: 1 }}>
                        <label style={{ 
                          display: 'block',
                          fontSize: '11px',
                          color: 'rgba(125,211,252,0.8)',
                          marginBottom: '4px',
                          fontWeight: 600,
                          textTransform: 'uppercase',
                          letterSpacing: '0.5px'
                        }}>
                          Expression / State
                        </label>
                        <SelectPicker
                          data={[
                            { label: '😊 Happy / Smile', value: 'smile' },
                            { label: '😢 Sad', value: 'sad' },
                            { label: '😠 Angry / Annoyed', value: 'annoyed' },
                            { label: '😨 Shocked / Surprised', value: 'shocked' },
                            { label: '😐 Neutral', value: 'neutral' },
                            { label: '😏 Smirk', value: 'smirk' },
                            { label: '😰 Worried', value: 'worried' },
                            { label: '😴 Tired / Sleepy', value: 'tired' },
                          ]}
                          value={ev.meta?.expression || ''}
                          onChange={(val) => updateEvent(idx, 'meta', { ...(ev.meta || {}), expression: val })}
                          placeholder='Select expression...'
                          cleanable
                          block
                          size="sm"
                          style={{
                            background: 'rgba(2,20,35,0.6)',
                          }}
                          preventOverflow
                          menuStyle={{ zIndex: 10000 }}
                        />
                      </div>
                      <div style={{ flex: 1 }}>
                        <label style={{ 
                          display: 'block',
                          fontSize: '11px',
                          color: 'rgba(125,211,252,0.8)',
                          marginBottom: '4px',
                          fontWeight: 600,
                          textTransform: 'uppercase',
                          letterSpacing: '0.5px'
                        }}>
                          Position
                        </label>
                        <SelectPicker
                          data={[
                            { label: '← Left', value: 'left' },
                            { label: '→ Right', value: 'right' },
                            { label: '● Center', value: 'center' },
                            { label: '↖ Top-Left', value: 'top-left' },
                            { label: '↗ Top-Right', value: 'top-right' },
                            { label: '↑ Top-Center', value: 'top-center' },
                          ]}
                          value={ev.meta?.position || ''}
                          onChange={(val) => updateEvent(idx, 'meta', { ...(ev.meta || {}), position: val })}
                          placeholder='Select position...'
                          cleanable
                          block
                          size="sm"
                          style={{
                            background: 'rgba(2,20,35,0.6)',
                          }}
                          preventOverflow
                          menuStyle={{ zIndex: 10000 }}
                        />
                      </div>
                    </div>
                    <div>
                      <label style={{ 
                        display: 'block',
                        fontSize: '11px',
                        color: 'rgba(125,211,252,0.8)',
                        marginBottom: '4px',
                        fontWeight: 600,
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px'
                      }}>
                        Dialogue Text
                      </label>
                      <Input
                        as='textarea'
                        rows={3}
                        placeholder={ev.type === 'cutin' ? 'Enter cutin dialogue...' : 'Enter dialogue...'}
                        value={ev.content || ''}
                        onChange={(val) => updateEvent(idx, 'content', val)}
                        size="sm"
                        style={{
                          background: 'rgba(2,20,35,0.6)',
                          border: '1px solid rgba(125,211,252,0.2)',
                          color: '#e6eef8',
                          fontFamily: 'monospace',
                          fontSize: '12px',
                        }}
                      />
                    </div>
                  </div>
                )}
                {ev.type === 'wait' && (
                  <div>
                    <label style={{ 
                      display: 'block',
                      fontSize: '11px',
                      color: 'rgba(125,211,252,0.8)',
                      marginBottom: '4px',
                      fontWeight: 600,
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px'
                    }}>
                      Duration (seconds)
                    </label>
                    <Input
                      type='number'
                      placeholder='e.g., 2'
                      value={ev.duration || 1}
                      onChange={(val) => updateEvent(idx, 'duration', Number(val))}
                      size="sm"
                      style={{
                        background: 'rgba(2,20,35,0.6)',
                        border: '1px solid rgba(125,211,252,0.2)',
                        color: '#e6eef8',
                      }}
                    />
                  </div>
                )}
                {ev.type === 'action' && (
                  <div>
                    <label style={{ 
                      display: 'block',
                      fontSize: '11px',
                      color: 'rgba(125,211,252,0.8)',
                      marginBottom: '4px',
                      fontWeight: 600,
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px'
                    }}>
                      Command
                    </label>
                    <Input
                      placeholder='e.g., @backdrop image.png'
                      value={ev.command || ''}
                      onChange={(val) => updateEvent(idx, 'command', val)}
                      size="sm"
                      style={{
                        background: 'rgba(2,20,35,0.6)',
                        border: '1px solid rgba(125,211,252,0.2)',
                        color: '#e6eef8',
                        fontFamily: 'monospace',
                        fontSize: '12px',
                      }}
                    />
                  </div>
                )}
              </div>
            ))}
            <button
              onClick={addEvent}
              style={{
                width: '100%',
                padding: '12px',
                background: 'linear-gradient(135deg, rgba(125,211,252,0.15), rgba(125,211,252,0.08))',
                border: '1px dashed rgba(125,211,252,0.4)',
                borderRadius: '8px',
                color: '#7dd3fc',
                fontSize: '13px',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.2s',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'linear-gradient(135deg, rgba(125,211,252,0.25), rgba(125,211,252,0.15))';
                e.currentTarget.style.borderColor = 'rgba(125,211,252,0.6)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'linear-gradient(135deg, rgba(125,211,252,0.15), rgba(125,211,252,0.08))';
                e.currentTarget.style.borderColor = 'rgba(125,211,252,0.4)';
              }}
            >
              <span style={{ fontSize: '16px' }}>+</span>
              Add Event
            </button>
          </div>
        )}
          
          {/* Footer with save/undo/redo */}
          <div style={{ 
            display: 'flex', 
            gap: '6px',
            paddingTop: '8px',
            borderTop: '1px solid rgba(255,255,255,0.06)',
            flexShrink: 0,
          }}>
            <Button 
              appearance='primary' 
              size="sm"
              style={{ flex: 1 }}
              onClick={handleSave}
            >
              Save
            </Button>
            <Button
              appearance='default'
              size="sm"
              onClick={undo}
              disabled={historyIndex <= 0}
            >
              Undo
            </Button>
            <Button
              appearance='default'
              size="sm"
              onClick={redo}
              disabled={historyIndex >= history.length - 1}
            >
              Redo
            </Button>
          </div>
        </div>
        </div>
      </div>
    </div>
  );
}

export default collect(CutsceneTool);
