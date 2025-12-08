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

// Import Monaco with pre-configured web workers
import { monaco } from '../monaco-setup.js';
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

// =============================================================================
// StoryboardEditor - A visual, beginner-friendly cutscene editor
// =============================================================================

// Event type icons and colors for visual distinction
const EVENT_VISUALS = {
  dialogue: { icon: '💬', color: '#7dd3fc', label: 'Dialogue' },
  cutin: { icon: '🎭', color: '#f472b6', label: 'Cutin' },
  wait: { icon: '⏱️', color: '#fbbf24', label: 'Wait' },
  action: { icon: '⚡', color: '#a78bfa', label: 'Action' },
};

// Expression emoji mapping
const EXPRESSION_EMOJIS = {
  smile: '😊', happy: '😊', sad: '😢', angry: '😠', annoyed: '😠',
  shocked: '😨', surprised: '😨', neutral: '😐', smirk: '😏',
  worried: '😰', tired: '😴',
};

function StoryboardEditor({ events, setEvents, setTextContent, serializeEvents, pushHistorySnapshot, portraitOptions }) {
  const [draggedIndex, setDraggedIndex] = useState(null);
  const [dropTarget, setDropTarget] = useState(null);
  const [selectedIndex, setSelectedIndex] = useState(null);
  const [showAddMenu, setShowAddMenu] = useState(false);
  
  // Track known speakers for autocomplete
  const knownSpeakers = useMemo(() => {
    const speakers = new Set();
    events.forEach(ev => {
      if (ev.speaker) speakers.add(ev.speaker.toUpperCase());
    });
    return Array.from(speakers);
  }, [events]);

  // Update event and sync
  const updateEvent = useCallback((index, field, value) => {
    const next = events.map((ev, i) => {
      if (i === index) {
        if (field === 'meta') {
          return { ...ev, meta: { ...ev.meta, ...value } };
        }
        return { ...ev, [field]: value };
      }
      return ev;
    });
    setEvents(next);
    setTextContent(serializeEvents(next));
    pushHistorySnapshot(next);
  }, [events, setEvents, setTextContent, serializeEvents, pushHistorySnapshot]);

  // Add a new event of a specific type
  const addEvent = useCallback((type, insertAfter = null) => {
    const newEvent = type === 'dialogue' || type === 'cutin'
      ? { type, speaker: '', content: '', portrait: '', meta: {} }
      : type === 'wait'
      ? { type, duration: 1, command: 'wait 1000' }
      : { type, command: '', speaker: '', content: '' };
    
    let next;
    if (insertAfter !== null && insertAfter >= 0) {
      next = [...events.slice(0, insertAfter + 1), newEvent, ...events.slice(insertAfter + 1)];
      setSelectedIndex(insertAfter + 1);
    } else {
      next = [...events, newEvent];
      setSelectedIndex(events.length);
    }
    setEvents(next);
    setTextContent(serializeEvents(next));
    pushHistorySnapshot(next);
    setShowAddMenu(false);
  }, [events, setEvents, setTextContent, serializeEvents, pushHistorySnapshot]);

  // Remove an event
  const removeEvent = useCallback((index) => {
    if (events.length <= 1) return; // Keep at least one event
    const next = events.filter((_, i) => i !== index);
    setEvents(next);
    setTextContent(serializeEvents(next));
    pushHistorySnapshot(next);
    if (selectedIndex === index) setSelectedIndex(null);
    else if (selectedIndex > index) setSelectedIndex(selectedIndex - 1);
  }, [events, setEvents, setTextContent, serializeEvents, pushHistorySnapshot, selectedIndex]);

  // Drag and drop handlers
  const handleDragStart = (index) => {
    setDraggedIndex(index);
  };

  const handleDragOver = (e, index) => {
    e.preventDefault();
    if (draggedIndex !== null && draggedIndex !== index) {
      setDropTarget(index);
    }
  };

  const handleDrop = (index) => {
    if (draggedIndex !== null && draggedIndex !== index) {
      const next = [...events];
      const [dragged] = next.splice(draggedIndex, 1);
      next.splice(index, 0, dragged);
      setEvents(next);
      setTextContent(serializeEvents(next));
      pushHistorySnapshot(next);
    }
    setDraggedIndex(null);
    setDropTarget(null);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
    setDropTarget(null);
  };

  // Render a compact card for each event in the timeline
  const renderEventCard = (ev, idx) => {
    const visual = EVENT_VISUALS[ev.type] || EVENT_VISUALS.action;
    const isSelected = selectedIndex === idx;
    const isDragging = draggedIndex === idx;
    const isDropTarget = dropTarget === idx;

    return (
      <div
        key={idx}
        draggable
        onDragStart={() => handleDragStart(idx)}
        onDragOver={(e) => handleDragOver(e, idx)}
        onDrop={() => handleDrop(idx)}
        onDragEnd={handleDragEnd}
        onClick={() => setSelectedIndex(isSelected ? null : idx)}
        style={{
          display: 'flex',
          alignItems: 'stretch',
          gap: '8px',
          padding: '6px 8px',
          marginBottom: '4px',
          background: isSelected 
            ? `linear-gradient(135deg, ${visual.color}22, ${visual.color}11)`
            : 'rgba(255,255,255,0.02)',
          border: `1px solid ${isSelected ? visual.color + '66' : isDropTarget ? '#fbbf24' : 'rgba(255,255,255,0.06)'}`,
          borderRadius: '6px',
          cursor: 'pointer',
          opacity: isDragging ? 0.5 : 1,
          transform: isDropTarget ? 'scale(1.02)' : 'scale(1)',
          transition: 'all 0.15s ease',
        }}
      >
        {/* Drag handle + type icon */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '2px',
          cursor: 'grab',
          padding: '0 2px',
        }}>
          <span style={{ fontSize: '14px', filter: 'grayscale(0.2)' }}>{visual.icon}</span>
          <span style={{ 
            fontSize: '8px', 
            color: visual.color, 
            fontWeight: 600,
            textTransform: 'uppercase',
            letterSpacing: '0.3px',
          }}>
            {visual.label.slice(0, 3)}
          </span>
        </div>

        {/* Content preview */}
        <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          {(ev.type === 'dialogue' || ev.type === 'cutin') && (
            <>
              <div style={{ 
                fontSize: '11px', 
                fontWeight: 600, 
                color: visual.color,
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
              }}>
                {ev.speaker || <span style={{ opacity: 0.5, fontStyle: 'italic' }}>Speaker?</span>}
                {ev.meta?.expression && (
                  <span style={{ fontSize: '12px' }}>{EXPRESSION_EMOJIS[ev.meta.expression] || ''}</span>
                )}
              </div>
              <div style={{ 
                fontSize: '11px', 
                color: 'rgba(255,255,255,0.7)',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}>
                {ev.content || <span style={{ opacity: 0.4, fontStyle: 'italic' }}>Enter dialogue...</span>}
              </div>
            </>
          )}
          {ev.type === 'wait' && (
            <div style={{ fontSize: '11px', color: visual.color }}>
              {ev.command?.includes('waitInput') ? '⌨️ Wait for input' : `⏱️ ${ev.duration || 1}s`}
            </div>
          )}
          {ev.type === 'action' && (
            <div style={{ 
              fontSize: '10px', 
              color: 'rgba(255,255,255,0.7)',
              fontFamily: 'monospace',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}>
              {ev.command || <span style={{ opacity: 0.4 }}>@command...</span>}
            </div>
          )}
        </div>

        {/* Quick delete on hover */}
        <button
          onClick={(e) => { e.stopPropagation(); removeEvent(idx); }}
          style={{
            background: 'transparent',
            border: 'none',
            color: 'rgba(239,68,68,0.6)',
            cursor: 'pointer',
            padding: '0 4px',
            fontSize: '14px',
            opacity: 0.5,
            transition: 'opacity 0.15s',
          }}
          onMouseEnter={(e) => e.currentTarget.style.opacity = 1}
          onMouseLeave={(e) => e.currentTarget.style.opacity = 0.5}
          title="Delete"
        >
          ×
        </button>
      </div>
    );
  };

  // Render the detail editor for selected event
  const renderDetailEditor = () => {
    if (selectedIndex === null || !events[selectedIndex]) {
      return (
        <div style={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'rgba(255,255,255,0.3)',
          fontSize: '12px',
          fontStyle: 'italic',
          textAlign: 'center',
          padding: '20px',
        }}>
          Click an event to edit<br/>or drag to reorder
        </div>
      );
    }

    const ev = events[selectedIndex];
    const visual = EVENT_VISUALS[ev.type] || EVENT_VISUALS.action;

    return (
      <div style={{
        flex: 1,
        minHeight: 0,
        overflow: 'auto',
        padding: '8px',
        background: 'rgba(0,0,0,0.2)',
        borderRadius: '6px',
      }}>
        {/* Type selector as visual tabs */}
        <div style={{
          display: 'flex',
          gap: '4px',
          marginBottom: '10px',
          flexWrap: 'wrap',
        }}>
          {Object.entries(EVENT_VISUALS).map(([type, vis]) => (
            <button
              key={type}
              onClick={() => updateEvent(selectedIndex, 'type', type)}
              style={{
                background: ev.type === type ? vis.color + '33' : 'rgba(255,255,255,0.05)',
                border: `1px solid ${ev.type === type ? vis.color : 'transparent'}`,
                borderRadius: '4px',
                padding: '4px 8px',
                cursor: 'pointer',
                color: ev.type === type ? vis.color : 'rgba(255,255,255,0.5)',
                fontSize: '11px',
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                transition: 'all 0.15s',
              }}
            >
              <span>{vis.icon}</span>
              <span>{vis.label}</span>
            </button>
          ))}
        </div>

        {/* Dialogue/Cutin editor */}
        {(ev.type === 'dialogue' || ev.type === 'cutin') && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {/* Speaker with suggestions */}
            <div style={{ position: 'relative' }}>
              <input
                type="text"
                value={ev.speaker || ''}
                onChange={(e) => updateEvent(selectedIndex, 'speaker', e.target.value.toUpperCase())}
                placeholder="SPEAKER NAME"
                style={{
                  width: '100%',
                  padding: '8px 10px',
                  background: 'rgba(0,0,0,0.3)',
                  border: '1px solid rgba(125,211,252,0.2)',
                  borderRadius: '4px',
                  color: visual.color,
                  fontSize: '13px',
                  fontWeight: 600,
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                  boxSizing: 'border-box',
                }}
                list="speaker-suggestions"
              />
              <datalist id="speaker-suggestions">
                {knownSpeakers.map(s => <option key={s} value={s} />)}
              </datalist>
            </div>

            {/* Expression quick-select */}
            <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
              {Object.entries(EXPRESSION_EMOJIS).slice(0, 8).map(([expr, emoji]) => (
                <button
                  key={expr}
                  onClick={() => updateEvent(selectedIndex, 'meta', { expression: ev.meta?.expression === expr ? '' : expr })}
                  style={{
                    padding: '4px 6px',
                    background: ev.meta?.expression === expr ? 'rgba(125,211,252,0.2)' : 'rgba(255,255,255,0.05)',
                    border: ev.meta?.expression === expr ? '1px solid rgba(125,211,252,0.4)' : '1px solid transparent',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontSize: '14px',
                    transition: 'all 0.15s',
                  }}
                  title={expr}
                >
                  {emoji}
                </button>
              ))}
            </div>

            {/* Dialogue text - big comfortable textarea */}
            <textarea
              value={ev.content || ''}
              onChange={(e) => updateEvent(selectedIndex, 'content', e.target.value)}
              placeholder="What do they say?"
              style={{
                width: '100%',
                minHeight: '80px',
                padding: '10px',
                background: 'rgba(0,0,0,0.3)',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '4px',
                color: '#e6eef8',
                fontSize: '13px',
                lineHeight: '1.5',
                resize: 'vertical',
                fontFamily: 'inherit',
                boxSizing: 'border-box',
              }}
            />
          </div>
        )}

        {/* Wait editor */}
        {ev.type === 'wait' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                onClick={() => {
                  updateEvent(selectedIndex, 'duration', ev.duration || 1);
                  updateEvent(selectedIndex, 'command', `wait ${Math.round((ev.duration || 1) * 1000)}`);
                }}
                style={{
                  flex: 1,
                  padding: '12px',
                  background: !ev.command?.includes('waitInput') ? 'rgba(251,191,36,0.2)' : 'rgba(255,255,255,0.05)',
                  border: !ev.command?.includes('waitInput') ? '1px solid rgba(251,191,36,0.4)' : '1px solid transparent',
                  borderRadius: '6px',
                  color: !ev.command?.includes('waitInput') ? '#fbbf24' : 'rgba(255,255,255,0.5)',
                  cursor: 'pointer',
                  fontSize: '12px',
                  fontWeight: 600,
                }}
              >
                ⏱️ Timed Wait
              </button>
              <button
                onClick={() => {
                  updateEvent(selectedIndex, 'command', 'waitInput');
                }}
                style={{
                  flex: 1,
                  padding: '12px',
                  background: ev.command?.includes('waitInput') ? 'rgba(251,191,36,0.2)' : 'rgba(255,255,255,0.05)',
                  border: ev.command?.includes('waitInput') ? '1px solid rgba(251,191,36,0.4)' : '1px solid transparent',
                  borderRadius: '6px',
                  color: ev.command?.includes('waitInput') ? '#fbbf24' : 'rgba(255,255,255,0.5)',
                  cursor: 'pointer',
                  fontSize: '12px',
                  fontWeight: 600,
                }}
              >
                ⌨️ Wait for Input
              </button>
            </div>
            {!ev.command?.includes('waitInput') && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <input
                  type="range"
                  min="0.5"
                  max="10"
                  step="0.5"
                  value={ev.duration || 1}
                  onChange={(e) => {
                    const dur = parseFloat(e.target.value);
                    updateEvent(selectedIndex, 'duration', dur);
                    updateEvent(selectedIndex, 'command', `wait ${Math.round(dur * 1000)}`);
                  }}
                  style={{ flex: 1 }}
                />
                <span style={{ 
                  color: '#fbbf24', 
                  fontWeight: 600, 
                  fontSize: '14px',
                  minWidth: '40px',
                  textAlign: 'right',
                }}>
                  {ev.duration || 1}s
                </span>
              </div>
            )}
          </div>
        )}

        {/* Action editor */}
        {ev.type === 'action' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {/* Quick action buttons */}
            <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
              {[
                { label: '🖼️', cmd: '@backdrop ', title: 'Set backdrop' },
                { label: '👤', cmd: '@char ', title: 'Add character' },
                { label: '🎵', cmd: '@do playBgm [name=]', title: 'Play music' },
                { label: '🔊', cmd: '@do playSfx [name=]', title: 'Play sound' },
                { label: '🌀', cmd: '@transition ', title: 'Transition' },
                { label: '🔇', cmd: '@do stopBgm', title: 'Stop music' },
              ].map(({ label, cmd, title }) => (
                <button
                  key={cmd}
                  onClick={() => updateEvent(selectedIndex, 'command', cmd)}
                  style={{
                    padding: '6px 10px',
                    background: 'rgba(167,139,250,0.15)',
                    border: '1px solid rgba(167,139,250,0.3)',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontSize: '14px',
                    transition: 'all 0.15s',
                  }}
                  title={title}
                >
                  {label}
                </button>
              ))}
            </div>
            {/* Command input */}
            <input
              type="text"
              value={ev.command || ''}
              onChange={(e) => updateEvent(selectedIndex, 'command', e.target.value)}
              placeholder="@command [param=value]"
              style={{
                width: '100%',
                padding: '10px',
                background: 'rgba(0,0,0,0.3)',
                border: '1px solid rgba(167,139,250,0.3)',
                borderRadius: '4px',
                color: '#e6eef8',
                fontSize: '12px',
                fontFamily: 'monospace',
                boxSizing: 'border-box',
              }}
            />
          </div>
        )}
      </div>
    );
  };

  return (
    <div 
      style={{
        flex: 1,
        minHeight: 0,
        display: 'flex',
        flexDirection: 'column',
        gap: '6px',
        height: '100%',
        overflow: 'hidden',
      }}
      onKeyDown={(e) => e.stopPropagation()}
    >
      {/* Timeline - scrollable list of event cards */}
      <div style={{
        flex: '1 1 50%',
        minHeight: '120px',
        overflowY: 'auto',
        padding: '4px',
        background: 'rgba(0,0,0,0.15)',
        borderRadius: '6px',
      }}>
        {events.map((ev, idx) => renderEventCard(ev, idx))}
        
        {/* Add button */}
        <div style={{ position: 'relative' }}>
          <button
            onClick={() => setShowAddMenu(!showAddMenu)}
            style={{
              width: '100%',
              padding: '6px',
              background: 'transparent',
              border: '1px dashed rgba(125,211,252,0.3)',
              borderRadius: '4px',
              color: 'rgba(125,211,252,0.6)',
              cursor: 'pointer',
              fontSize: '16px',
              transition: 'all 0.15s',
            }}
          >
            +
          </button>
          {showAddMenu && (
            <div style={{
              position: 'absolute',
              bottom: '100%',
              left: 0,
              right: 0,
              marginBottom: '4px',
              background: 'rgba(10,15,26,0.98)',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '6px',
              padding: '4px',
              display: 'flex',
              gap: '4px',
              zIndex: 10,
            }}>
              {Object.entries(EVENT_VISUALS).map(([type, vis]) => (
                <button
                  key={type}
                  onClick={() => addEvent(type)}
                  style={{
                    flex: 1,
                    padding: '8px 4px',
                    background: `${vis.color}15`,
                    border: `1px solid ${vis.color}40`,
                    borderRadius: '4px',
                    cursor: 'pointer',
                    color: vis.color,
                    fontSize: '11px',
                    fontWeight: 600,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '2px',
                  }}
                >
                  <span style={{ fontSize: '16px' }}>{vis.icon}</span>
                  <span>{vis.label}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Detail editor for selected event */}
      <div style={{ flex: '1 1 50%', minHeight: '150px', display: 'flex', flexDirection: 'column' }}>
        {renderDetailEditor()}
      </div>
    </div>
  );
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
  
  // Export state
  const [isExporting, setIsExporting] = useState(false);
  const [exportProgress, setExportProgress] = useState(null);
  
  // Panel split ratio (preview panel width as percentage)
  const [splitRatio, setSplitRatio] = useState(60);
  const [isDraggingSplit, setIsDraggingSplit] = useState(false);
  const containerRef = useRef(null);

  // Ref to CutscenePlayer for imperative control
  const cutscenePlayerRef = useRef(null);
  // Track if initial content has been loaded
  const initialLoadDone = useRef(false);
  
  // Handle split resizing
  const handleSplitMouseDown = useCallback((e) => {
    e.preventDefault();
    setIsDraggingSplit(true);
  }, []);
  
  useEffect(() => {
    if (!isDraggingSplit) return;
    
    const handleMouseMove = (e) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const percentage = (x / rect.width) * 100;
      // Clamp between 30% and 80%
      setSplitRatio(Math.max(30, Math.min(80, percentage)));
    };
    
    const handleMouseUp = () => {
      setIsDraggingSplit(false);
    };
    
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDraggingSplit]);
  
  // Handle video export
  const handleExportVideo = useCallback(async () => {
    if (!cutscenePlayerRef.current) return;
    
    setIsExporting(true);
    setExportProgress({ status: 'starting', progress: 0 });
    
    try {
      const result = await cutscenePlayerRef.current.exportVideo();
      if (result?.success) {
        setExportProgress({ status: 'complete', progress: 100 });
        setTimeout(() => {
          setIsExporting(false);
          setExportProgress(null);
        }, 2000);
      } else {
        setError('Export failed: ' + (result?.error || 'Unknown error'));
        setIsExporting(false);
        setExportProgress(null);
      }
    } catch (err) {
      setError('Export failed: ' + err.message);
      setIsExporting(false);
      setExportProgress(null);
    }
  }, []);

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
      <div 
        ref={containerRef}
        style={{
          display: 'flex',
          flex: 1,
          minHeight: 0,
          gap: 0,
        }}
      >
        {/* Left side - Preview player */}
        <div style={{
          flex: `0 0 ${splitRatio}%`,
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
              
              {/* Export Video Button */}
              <button
                onClick={handleExportVideo}
                disabled={isExporting}
                style={{
                  padding: '4px 10px',
                  background: isExporting ? 'rgba(251,191,36,0.2)' : 'rgba(34,197,94,0.15)',
                  border: `1px solid ${isExporting ? 'rgba(251,191,36,0.4)' : 'rgba(34,197,94,0.4)'}`,
                  borderRadius: '4px',
                  color: isExporting ? '#fbbf24' : '#22c55e',
                  fontSize: '11px',
                  fontWeight: 600,
                  cursor: isExporting ? 'wait' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  transition: 'all 0.15s',
                }}
                title="Export cutscene as WebM video"
              >
                {isExporting ? (
                  <>
                    <span style={{ animation: 'spin 1s linear infinite' }}>⏳</span>
                    {exportProgress?.progress || 0}%
                  </>
                ) : (
                  <>📹 Export</>
                )}
              </button>
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
            position: 'relative',
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
                onExportProgress={setExportProgress}
              />
            </div>
            
            {/* Export Progress Overlay */}
            {isExporting && exportProgress && (
              <div style={{
                position: 'absolute',
                bottom: '16px',
                left: '50%',
                transform: 'translateX(-50%)',
                background: 'rgba(0,0,0,0.85)',
                border: '1px solid rgba(251,191,36,0.4)',
                borderRadius: '8px',
                padding: '12px 20px',
                minWidth: '280px',
                zIndex: 100,
                backdropFilter: 'blur(4px)',
              }}>
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'space-between',
                  marginBottom: '8px',
                }}>
                  <span style={{ 
                    color: '#fbbf24', 
                    fontSize: '12px', 
                    fontWeight: 600,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                  }}>
                    <span style={{ animation: 'spin 1s linear infinite' }}>📹</span>
                    {exportProgress.status === 'complete' ? 'Export Complete!' : 'Exporting Video...'}
                  </span>
                  <span style={{ color: '#fbbf24', fontSize: '12px', fontWeight: 700 }}>
                    {exportProgress.progress || 0}%
                  </span>
                </div>
                
                {/* Progress bar */}
                <div style={{
                  width: '100%',
                  height: '6px',
                  background: 'rgba(251,191,36,0.15)',
                  borderRadius: '3px',
                  overflow: 'hidden',
                }}>
                  <div style={{
                    width: `${exportProgress.progress || 0}%`,
                    height: '100%',
                    background: exportProgress.status === 'complete' 
                      ? 'linear-gradient(90deg, #22c55e, #4ade80)'
                      : exportProgress.status === 'error'
                      ? '#ef4444'
                      : 'linear-gradient(90deg, #f59e0b, #fbbf24)',
                    borderRadius: '3px',
                    transition: 'width 0.2s ease',
                  }} />
                </div>
                
                {/* Status message */}
                {exportProgress.message && (
                  <div style={{ 
                    marginTop: '6px', 
                    fontSize: '10px', 
                    color: 'rgba(255,255,255,0.6)',
                    textAlign: 'center',
                  }}>
                    {exportProgress.message}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Resizable divider */}
        <div
          className="split-divider"
          onMouseDown={handleSplitMouseDown}
          style={{
            width: '10px',
            cursor: 'col-resize',
            background: isDraggingSplit 
              ? 'rgba(125, 211, 252, 0.2)' 
              : 'transparent',
            transition: 'background 0.15s',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
          onMouseEnter={(e) => {
            if (!isDraggingSplit) {
              e.currentTarget.style.background = 'rgba(125, 211, 252, 0.1)';
              e.currentTarget.querySelector('.split-handle').style.background = 'rgba(125, 211, 252, 0.6)';
            }
          }}
          onMouseLeave={(e) => {
            if (!isDraggingSplit) {
              e.currentTarget.style.background = 'transparent';
              e.currentTarget.querySelector('.split-handle').style.background = 'rgba(255,255,255,0.15)';
            }
          }}
        >
          <div 
            className="split-handle"
            style={{
              width: '3px',
              height: '50px',
              background: isDraggingSplit 
                ? 'rgba(125, 211, 252, 0.8)'
                : 'rgba(255,255,255,0.15)',
              borderRadius: '2px',
              transition: 'background 0.15s',
            }} 
          />
        </div>

        {/* Right side - Editor Panel */}
        <div 
          className="editor-panel"
          style={{
            flex: 1,
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
              <div style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column' }}>
                <StoryboardEditor
                  events={events}
                  setEvents={setEvents}
                  setTextContent={setTextContent}
                  serializeEvents={serializeEvents}
                  pushHistorySnapshot={pushHistorySnapshot}
                  portraitOptions={portraitOptions}
                />
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
