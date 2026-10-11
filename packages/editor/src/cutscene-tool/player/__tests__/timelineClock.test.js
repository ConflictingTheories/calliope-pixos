/*
 * ---------------------------------------------------------------
 *      PixoSpritz – Editor – TimelineClock tests (P3-09)
 * ---------------------------------------------------------------
 * Copyright (c) 2022-2025  Kyle Derby MacInnis
 *
 * Seek/play/replay produce identical event order (determinism).
 */

import { describe, it, expect } from 'vitest';
import { TimelineClock, ClockState, eventDuration } from '../timelineClock.js';

const NODES = [
  { id: 'a', type: 'dialogue', duration: 2 },
  { id: 'b', type: 'wait', duration: 1 },
  { id: 'c', type: 'action', duration: 3 },
];

function record(clock) {
  const events = [];
  clock.on('enter', e => events.push(['enter', e.node.id]));
  clock.on('exit', e => events.push(['exit', e.node.id]));
  clock.on('ended', () => events.push(['ended']));
  return events;
}

describe('TimelineClock', () => {
  it('builds a deterministic schedule', () => {
    const c = new TimelineClock(NODES);
    expect(c.totalDuration).toBe(6);
    expect(c.schedule.map(s => [s.start, s.end])).toEqual([[0, 2], [2, 3], [3, 6]]);
  });

  it('seek emits enter/exit in order', () => {
    const c = new TimelineClock(NODES);
    const events = record(c);
    c.seek(0.5);
    c.seek(2.5);
    c.seek(4);
    expect(events).toEqual([
      ['enter', 'a'],
      ['exit', 'a'], ['enter', 'b'],
      ['exit', 'b'], ['enter', 'c'],
    ]);
    expect(c.frame().node.id).toBe('c');
  });

  it('play advances with a fixed timestep and ends deterministically', () => {
    const c = new TimelineClock(NODES, { tickHz: 10 });
    const events = record(c);
    c.play();
    // Advance in uneven chunks — the fixed timestep keeps event order identical.
    for (const dt of [0.13, 0.71, 0.05, 2.2, 1.7, 3.0]) c.advance(dt);
    expect(c.state).toBe(ClockState.ENDED);
    const enters = events.filter(e => e[0] === 'enter').map(e => e[1]);
    expect(enters).toEqual(['a', 'b', 'c']);
    expect(events[events.length - 1]).toEqual(['ended']);
  });

  it('replay after end restarts deterministically', () => {
    const run = () => {
      const c = new TimelineClock(NODES, { tickHz: 10 });
      const events = record(c);
      c.play();
      for (let i = 0; i < 70; i++) c.advance(0.1);
      return events;
    };
    const first = run();
    const second = run();
    expect(second).toEqual(first);
  });

  it('seek is idempotent within a slot', () => {
    const c = new TimelineClock(NODES);
    const events = record(c);
    c.seek(0.2);
    c.seek(0.8);
    c.seek(1.9);
    expect(events).toEqual([['enter', 'a']]);
  });

  it('pause halts advancement', () => {
    const c = new TimelineClock(NODES, { tickHz: 10 });
    c.play();
    c.advance(1);
    c.pause();
    const t = c.time;
    c.advance(5);
    expect(c.time).toBe(t);
    expect(c.state).toBe(ClockState.PAUSED);
  });

  it('handles empty node lists', () => {
    const c = new TimelineClock([]);
    expect(c.totalDuration).toBe(0);
    c.play();
    expect(c.state).toBe(ClockState.IDLE);
  });

  it('eventDuration defaults per type', () => {
    expect(eventDuration({ type: 'dialogue' }, 2)).toBe(2);
    expect(eventDuration({ type: 'wait' }, 2)).toBe(1);
    expect(eventDuration({ type: 'action', duration: 5 }, 2)).toBe(5);
  });
});
