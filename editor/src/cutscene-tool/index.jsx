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

import React, { useState, useEffect } from 'react';
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
} from 'rsuite';

// Available event types for cutscenes
const EVENT_TYPES = [
  { label: 'Dialogue', value: 'dialogue' },
  { label: 'Wait', value: 'wait' },
  { label: 'Action', value: 'action' },
];

function CutsceneTool({ content, onSave, assets = [] }) {
  // Maintain events state; parse input content in an effect
  const [events, setEvents] = useState([
    { type: 'dialogue', content: '', speaker: '', portrait: '' },
  ]);
  const [error, setError] = useState(null);

  // History for undo/redo
  const [history, setHistory] = useState([]);
  const [historyIndex, setHistoryIndex] = useState(-1);

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
        } else {
          parsed = [
            { type: 'dialogue', content: '', speaker: '', portrait: '' },
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
          { type: 'dialogue', content: '', speaker: '', portrait: '' },
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
    const next = events.map((ev, i) => (i === index ? { ...ev, [prop]: value } : ev));
    setEvents(next);
    pushHistorySnapshot(next);
  }

  // Add a new event to the end
  function addEvent() {
    const next = [...events, { type: 'dialogue', content: '', speaker: '', portrait: '' }];
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

  function handleSave() {
    if (onSave) {
      onSave(events);
    } else {
      console.log('Cutscene saved:', JSON.stringify(events, null, 2));
    }
  }

  return (
    <Container style={{ padding: '1rem' }}>
      {error && (
        <Row style={{ marginBottom: '0.5rem' }}>
          <Col sm={24} md={24} lg={24}>
            <Message type='error' description={error} />
          </Col>
        </Row>
      )}
      <Row>
        <Col sm={24} md={24} lg={24}>
          <Panel bordered header={<strong>Cutscene Tool</strong>}>
            <div style={{ maxHeight: '60vh', overflow: 'auto' }}>
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
                      {/* Fields vary based on event type */}
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
      </Row>
    </Container>
  );
}

export default collect(CutsceneTool);