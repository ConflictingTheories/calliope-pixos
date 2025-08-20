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

import React, { useState } from 'react';
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
} from 'rsuite';

// Available event types for cutscenes
const EVENT_TYPES = [
  { label: 'Dialogue', value: 'dialogue' },
  { label: 'Wait', value: 'wait' },
  { label: 'Action', value: 'action' },
];

function CutsceneTool({ content, onSave, assets = [] }) {
  // Attempt to parse existing cutscene JSON; otherwise start with a single event
  const initialEvents = (() => {
    if (content) {
      try {
        const obj = JSON.parse(content);
        if (Array.isArray(obj)) return obj;
      } catch (err) {
        console.warn('Failed to parse cutscene JSON', err);
      }
    }
    // Default event includes optional fields for dialogue
    return [{ type: 'dialogue', content: '', speaker: '', portrait: '' }];
  })();

  const [events, setEvents] = useState(initialEvents);

  // Build portrait options from available assets
  const portraitOptions = assets.map((a) => ({ label: a.name, value: a.name }));

  // Update an event field
  function updateEvent(index, prop, value) {
    setEvents((prev) =>
      prev.map((ev, i) => (i === index ? { ...ev, [prop]: value } : ev)),
    );
  }

  // Add a new event to the end
  function addEvent() {
    setEvents((prev) => [...prev, { type: 'dialogue', content: '', speaker: '', portrait: '' }]);
  }

  // Remove an event by index
  function removeEvent(index) {
    setEvents((prev) => prev.filter((_, i) => i !== index));
  }

  // Move an event up or down in the list
  function moveEvent(index, direction) {
    setEvents((prev) => {
      const next = [...prev];
      const target = next[index];
      const newIndex = index + direction;
      if (newIndex < 0 || newIndex >= next.length) return next;
      // Swap positions
      next[index] = next[newIndex];
      next[newIndex] = target;
      return next;
    });
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
            </Row>
          </Panel>
        </Col>
      </Row>
    </Container>
  );
}

export default collect(CutsceneTool);