/*
 * ---------------------------------------------------------------
 *    PixoSpritz – Editor – keymap/commands tests (P2-09)
 * ---------------------------------------------------------------
 * Copyright (c) 2022-2025  Kyle Derby MacInnis
 */

import { describe, it, expect, vi } from 'vitest';
import { KeymapRegistry, chordOf, parseShortcut, keymap } from '../keymap.js';
import { CommandRegistry } from '../commands.js';

const keyEvent = (key, mods = {}) => ({
  key,
  ctrlKey: !!mods.ctrl,
  metaKey: !!mods.meta,
  shiftKey: !!mods.shift,
  altKey: !!mods.alt,
  target: { tagName: 'BODY' },
  preventDefault: vi.fn(),
});

describe('KeymapRegistry', () => {
  it('dispatches canonical chords to registered handlers', () => {
    const km = new KeymapRegistry();
    const run = vi.fn(() => true);
    km.register('save', 'ctrl+s', run);
    expect(km.handleKeyDown(keyEvent('s', { ctrl: true }))).toBe(true);
    expect(run).toHaveBeenCalledTimes(1);
    expect(km.handleKeyDown(keyEvent('s'))).toBe(false);
  });

  it('normalizes chords (case, cmd alias)', () => {
    expect(parseShortcut('Cmd+Shift+Z')).toBe('meta+shift+z');
    expect(chordOf(keyEvent('Z', { meta: true, shift: true }))).toBe('meta+shift+z');
  });

  it('does not hijack typing in inputs (except Escape)', () => {
    const km = new KeymapRegistry();
    const run = vi.fn(() => true);
    km.register('x', 'a', run);
    const inInput = { ...keyEvent('a'), target: { tagName: 'INPUT' } };
    expect(km.handleKeyDown(inInput)).toBe(false);
    expect(run).not.toHaveBeenCalled();
  });

  it('honours when() guards and unregisters cleanly', () => {
    const km = new KeymapRegistry();
    const run = vi.fn(() => true);
    const off = km.register('g', 'g', run, { when: () => false });
    expect(km.handleKeyDown(keyEvent('g'))).toBe(false);
    off();
    expect(km.describe().some(d => d.id === 'g')).toBe(false);
  });
});

describe('CommandRegistry', () => {
  it('registers, lists, filters and executes commands', () => {
    const reg = new CommandRegistry();
    const run = vi.fn();
    reg.register({ id: 'px.save', title: 'Save pixozine', group: 'file', shortcut: 'ctrl+s', run });
    reg.register({ id: 'px.undo', title: 'Undo', group: 'edit', run: vi.fn() });
    expect(reg.list()).toHaveLength(2);
    expect(reg.list('save')).toHaveLength(1);
    expect(reg.execute('px.save')).toBe(true);
    expect(run).toHaveBeenCalled();
    expect(reg.execute('missing')).toBe(false);
  });

  it('wires shortcuts into the shared keymap', () => {
    const reg = new CommandRegistry();
    const run = vi.fn();
    reg.register({ id: 'px.test', title: 'Test', shortcut: 'ctrl+k', run });
    expect(keymap.handleKeyDown(keyEvent('k', { ctrl: true }))).toBe(true);
    expect(run).toHaveBeenCalled();
    reg.unregister('px.test');
  });

  it('rejects duplicates and validates definitions', () => {
    const reg = new CommandRegistry();
    reg.register({ id: 'a', title: 'A', run: () => {} });
    expect(() => reg.register({ id: 'a', title: 'A2', run: () => {} })).toThrow(/duplicate/);
    expect(() => reg.register({ id: 'b' })).toThrow();
  });
});
