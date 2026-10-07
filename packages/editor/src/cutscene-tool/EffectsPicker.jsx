/**
 * ---------------------------------------------------------------
 *           PixoSpritz – Editor – EffectsPicker
 * ---------------------------------------------------------------
 * Copyright (c) 2022-2025 Kyle Derby MacInnis
 *
 * Small effects picker for the cutscene tool: browse the engine's
 * unified preset registry (transitions + post-FX, including the
 * mushu-powered dither dissolve), tweak params, and insert the
 * corresponding DSL command (@transition <name> {params}).
 *
 * Consumes: pixospritz-core/engine/shaders/presets.js
 */

import React, { useState, useMemo } from 'react';
import { Button, SelectPicker, Input, Panel, Nav } from '../ui';
import { listPresets } from 'pixospritz-core/engine/shaders/presets.js';

const KINDS = [
  { label: 'Transitions', value: 'transition' },
  { label: 'Post FX', value: 'postfx' },
];

function paramControl(param, value, onChange) {
  if (param.type === 'number') {
    return (
      <div key={param.name} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
        <span style={{ minWidth: 110, fontSize: 12 }}>{param.label}</span>
        <Input
          type="number"
          size="sm"
          value={value}
          min={param.min}
          max={param.max}
          step={param.step ?? 1}
          onChange={(v) => onChange(param.name, Number(v))}
          style={{ width: 90 }}
        />
      </div>
    );
  }
  return null;
}

export default function EffectsPicker({ onInsert }) {
  const presets = useMemo(() => listPresets(), []);
  const [kind, setKind] = useState('transition');
  const [selectedId, setSelectedId] = useState(null);
  const [paramValues, setParamValues] = useState({});

  const filtered = presets.filter((p) => p.kind === kind);
  const selected = presets.find((p) => p.id === selectedId) ?? filtered[0];

  const setParam = (name, value) =>
    setParamValues((prev) => ({ ...prev, [name]: value }));

  const handleInsert = () => {
    if (!selected || !onInsert) return;
    // DSL: @transition <name> {param: value, …}
    // Preset ids are "transition:fade" — the DSL takes the bare name.
    const name = selected.id.split(':')[1];
    const params = {};
    for (const p of selected.params) {
      const v = paramValues[p.name] ?? p.default;
      if (v !== p.default) params[p.name] = v;
    }
    const paramStr = Object.keys(params).length > 0
      ? ' ' + JSON.stringify(params)
      : '';
    onInsert(`@transition ${name}${paramStr}`);
  };

  return (
    <Panel header="Effects" bordered style={{ marginBottom: 12 }}>
      <Nav appearance="subtle" activeKey={kind} onSelect={setKind} style={{ marginBottom: 8 }}>
        {KINDS.map((k) => (
          <Nav.Item key={k.value} eventKey={k.value}>{k.label}</Nav.Item>
        ))}
      </Nav>

      <SelectPicker
        block
        data={filtered.map((p) => ({ label: p.label, value: p.id }))}
        value={selected?.id}
        onChange={setSelectedId}
        placeholder="Choose an effect…"
        style={{ marginBottom: 8 }}
      />

      {selected && (
        <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 8 }}>
          {selected.description}
        </div>
      )}

      {selected?.params.map((p) =>
        paramControl(p, paramValues[p.name] ?? p.default, setParam)
      )}

      <Button
        appearance="primary"
        block
        size="sm"
        disabled={!selected}
        onClick={handleInsert}
        style={{ marginTop: 8 }}
      >
        Insert @transition command
      </Button>
    </Panel>
  );
}
