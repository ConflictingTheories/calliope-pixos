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

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { collect } from 'react-recollect';
import {
  Container,
  Panel,
  Row,
  Col,
  Input,
  SelectPicker,
  Button,
  ButtonGroup,
  Message,
  Checkbox,
} from 'rsuite';
import CutscenePlayer from './CutscenePlayer';

// Available event types for cutscenes
const EVENT_TYPES = [
  { label: 'Dialogue', value: 'dialogue' },
  { label: 'Wait', value: 'wait' },
  { label: 'Action', value: 'action' },
];

// Serialize events to SpritzCut DSL script string
function serializeEvents(events) {
  function serializeBracket(meta) {
    const parts = [];
    for (const key in meta) {
      const val = meta[key];
      if (val === true) parts.push(key);
      else parts.push(`${key}=${val}`);
    }
    return parts.length ? `[${parts.join(',')}]` : '';
  }

  let script = '';
  events.forEach((ev) => {
    if (ev.type === 'dialogue' || ev.type === 'cutin') {
      const bracket = serializeBracket(ev.meta || {});
      const header = `${ev.type === 'cutin' ? '*' : ''}${ev.speaker || ev.actor || 'UNKNOWN'}: ${bracket}${ev.content || ''}\n`;
      if (ev.content && ev.content.includes('\n')) {
        script += header.trimEnd() + '\n"""\n' + ev.content + '\n"""\n';
      } else {
        script += header;
      }
    } else if (ev.type === 'wait') {
      const dur = ev.duration || 1;
      script += `wait ${dur * 1000}\n`;
    } else if (ev.type === 'action') {
      script += `@action ${ev.command || ''}\n`;
    } else {
      // Fallback raw or unknown events 
      if (ev.raw) script += ev.raw + '\n';
    }
  });
  return script;
}

function CutsceneTool({ content, onSave, assets = [] }) {
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

  // Ref to CutscenePlayer for imperative control
  const cutscenePlayerRef = useRef(null);

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
      setHistoryIndex(historyIndex - 1);
    }
  }

  // Redo next action
  function redo() {
    if (historyIndex < history.length - 1) {
      const nextState = history[historyIndex + 1];
      setEvents(nextState);
      setHistoryIndex(historyIndex + 1);
    }
  }

  // Reparse when content changes
  useEffect(() => {
    if (content) {
      try {
        const obj = JSON.parse(content);
        let parsed;
        if (Array.isArray(obj)) {
          parsed = obj;
        } else if (obj.events && Array.isArray(obj.events)) {
          parsed = obj.events;
        } else {
          parsed = [
            { type: 'dialogue', speaker: '', content: '', portrait: '', meta: {} },
          ];
        }
        setEvents(parsed);
        // Initialize history with parsed events
        setHistory([JSON.parse(JSON.stringify(parsed))]);
        setHistoryIndex(0);
        setError(null);
      } catch (err) {
        console.warn('Failed to parse cutscene JSON', err);
        setError('Invalid cutscene JSON');
        // Reset events to a default single dialogue event
        const defaultEvents = [
          { type: 'dialogue', speaker: '', content: '', portrait: '', meta: {} },
        ];
        setEvents(defaultEvents);
        setHistory([JSON.parse(JSON.stringify(defaultEvents))]);
        setHistoryIndex(0);
      }
    }
  }, [content]);

  // Build portrait options from available assets
  const portraitOptions = assets.map((a) => ({ label: a.name, value: a.name }));

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
    pushHistorySnapshot(next);
  }

  // Add a new event to the end
  function addEvent() {
    const next = [...events, { type: 'dialogue', speaker: '', content: '', portrait: '', meta: {} }];
    setEvents(next);
    pushHistorySnapshot(next);
  }

  // Remove an event by index
  function removeEvent(index) {
    const next = events.filter((_, i) => i !== index);
    setEvents(next);
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
    pushHistorySnapshot(next);
  }

  // Serialize events into script text passed to player for playback
  const scriptText = useMemo(() => serializeEvents(events), [events]);

  function handleSave() {
    if (onSave) {
      onSave(events);
    } else {
      console.log('Cutscene saved:', JSON.stringify(events, null, 2));
    }
  }

  return (
    <Container style={{ display: 'flex', padding: '1rem', gap: '1rem', height: '100%' }}>
      {error && (
        <Row style={{ marginBottom: '0.5rem', width: '100%' }}>
          <Col sm={24} md={24} lg={24}>
            <Message type='error' description={error} />
          </Col>
        </Row>
      )}
      <Row style={{ flexGrow: 1, overflow: 'hidden' }}>
        <Col sm={24} md={12} lg={12} style={{ height: '100%', overflowY: 'auto' }}>
          <Panel bordered header={<strong>Cutscene Events Editor</strong>} style={{ height: '100%' }}>
            <div style={{ maxHeight: 'calc(100vh - 200px)', overflowY: 'auto', paddingRight: '8px' }}>
              {events.map((ev, idx) => (
                <Panel
                  key={idx}
                  bordered
                  header={`Event ${idx + 1}`}
                  style={{ marginBottom: '1rem' }}
                >
                  <Row style={{ marginBottom: '0.5rem' }}>
                    <Col sm={8} md={6} lg={6}>
                      <SelectPicker
                        data={EVENT_TYPES}
                        value={ev.type}
                        onChange={(val) => updateEvent(idx, 'type', val)}
                        cleanable={false}
                        block
                      />
                    </Col>
                    <Col sm={16} md={18} lg={18}>
                      {ev.type === 'dialogue' && (
                        <div>
                          <Row style={{ marginBottom: '0.5rem' }}>
                            <Col sm={12} md={12} lg={12}>
                              <Input
                                value={ev.speaker || ''}
                                placeholder='Speaker'
                                onChange={(val) => updateEvent(idx, 'speaker', val)}
                              />
                            </Col>
                            <Col sm={12} md={12} lg={12}>
                              <SelectPicker
                                data={portraitOptions}
                                value={ev.portrait || ''}
                                onChange={(val) => updateEvent(idx, 'portrait', val)}
                                placeholder='Portrait'
                                cleanable
                                style={{ width: '100%' }}
                                searchable={false}
                              />
                            </Col>
                          </Row>
                          <Input
                            as='textarea'
                            rows={2}
                            placeholder='Dialogue content...'
                            value={ev.content || ''}
                            onChange={(val) => updateEvent(idx, 'content', val)}
                          />
                        </div>
                      )}
                      {ev.type === 'wait' && (
                        <div>
                          <Input
                            type='number'
                            placeholder='Duration (s)'
                            value={ev.duration || 1}
                            onChange={(val) => updateEvent(idx, 'duration', Number(val))}
                          />
                        </div>
                      )}
                      {ev.type === 'action' && (
                        <div>
                          <Input
                            placeholder='Action command'
                            value={ev.command || ''}
                            onChange={(val) => updateEvent(idx, 'command', val)}
                          />
                        </div>
                      )}
                    </Col>
                  </Row>
                  <ButtonGroup>
                    <Button onClick={() => moveEvent(idx, -1)} disabled={idx === 0}>
                      Up
                    </Button>
                    <Button
                      onClick={() => moveEvent(idx, 1)}
                      disabled={idx === events.length - 1}
                    >
                      Down
                    </Button>
                    <Button appearance='ghost' color='red' onClick={() => removeEvent(idx)}>
                      Remove
                    </Button>
                  </ButtonGroup>
                </Panel>
              ))}
            </div>
            <Row style={{ marginTop: '1rem' }}>
              <Button appearance='primary' onClick={addEvent}>
                Add Event
              </Button>
              <Button appearance='primary' style={{ marginLeft: '1rem' }} onClick={handleSave}>
                Save Changes
              </Button>
              <Button
                appearance='default'
                style={{ marginLeft: '0.5rem' }}
                onClick={undo}
                disabled={historyIndex <= 0}
              >
                Undo
              </Button>
              <Button
                appearance='default'
                style={{ marginLeft: '0.5rem' }}
                onClick={redo}
                disabled={historyIndex >= history.length - 1}
              >
                Redo
              </Button>
            </Row>
          </Panel>
        </Col>
        <Col sm={24} md={12} lg={12} style={{ height: '100%' }}>
          <Panel bordered header={<strong>Cutscene Playback Preview</strong>} style={{ height: '100%', padding: '0', display: 'flex', flexDirection: 'column' }}>
            <div style={{ flexGrow: 1, padding: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <div style={{ width: '100%', maxWidth: '960px', aspectRatio: '16 / 9' }}>
                <CutscenePlayer
                  ref={cutscenePlayerRef}
                  scriptText={scriptText}
                  speed={speed}
                  autoAdvance={autoAdvance}
                />
              </div>
            </div>
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '10px',
            padding: '12px 16px',
            background: 'linear-gradient(180deg, rgba(6,10,16,0.72), rgba(4,8,14,0.72))',
            borderRadius: '0 0 10px 10px',
            boxShadow: '0 -4px 12px rgba(0,0,0,0.3)',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1 }}>
                <label htmlFor="speedRange" style={{ fontSize: '13px', color: 'rgba(255,255,255,0.85)', whiteSpace: 'nowrap' }}>Speed (ms / char)</label>
                <input
                  id="speedRange"
                  type="range"
                  min="8"
                  max="200"
                  value={speed}
                  onChange={(e) => setSpeed(Number(e.target.value))}
                  style={{ flex: 1, verticalAlign: 'middle' }}
                />
                <div style={{ width: 44, textAlign: 'right', fontSize: '13px', color: 'rgba(255,255,255,0.85)', fontVariantNumeric: 'tabular-nums' }}>{speed}</div>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <label style={{ fontSize: '13px', color: 'rgba(255,255,255,0.9)', display: 'flex', alignItems: 'center', gap: '5px' }}>
                <input
                  type="checkbox"
                  checked={autoAdvance}
                  onChange={(e) => setAutoAdvance(e.target.checked)}
                  style={{ margin: 0 }}
                />
                Auto-advance
              </label>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  type="button"
                  style={{
                    background: 'transparent',
                    border: '1px solid rgba(255,255,255,0.06)',
                    color: '#7dd3fc',
                    padding: '6px 12px',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontSize: '13px'
                  }}
                  onClick={() => cutscenePlayerRef.current && cutscenePlayerRef.current.play()}
                >
                  Play
                </button>
                <button
                  type="button"
                  style={{
                    background: 'transparent',
                    border: '1px solid rgba(255,255,255,0.06)',
                    color: '#7dd3fc',
                    padding: '6px 12px',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontSize: '13px'
                  }}
                  onClick={() => cutscenePlayerRef.current && cutscenePlayerRef.current.stop()}
                >
                  Stop
                </button>
                <button
                  type="button"
                  style={{
                    background: 'transparent',
                    border: '1px solid rgba(255,255,255,0.06)',
                    color: '#7dd3fc',
                    padding: '6px 12px',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontSize: '13px'
                  }}
                  onClick={() => cutscenePlayerRef.current && cutscenePlayerRef.current.skip()}
                >
                  Skip
                </button>
              </div>
            </div>
          </div>
          </Panel>
        </Col>
      </Row>
    </Container>
  );
}

export default collect(CutsceneTool);
