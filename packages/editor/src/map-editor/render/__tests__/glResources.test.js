/*
 * ---------------------------------------------------------------
 *      PixoSpritz – Editor – GLResourceRegistry tests (P3-03)
 * ---------------------------------------------------------------
 * Copyright (c) 2022-2025  Kyle Derby MacInnis
 *
 * Uses a mock GL object: zero idle allocations and zero net leak
 * are asserted by construction (create/dispose call counts).
 */

import { describe, it, expect, vi } from 'vitest';
import { GLResourceRegistry, ResourceKind } from '../glResources.js';

function mockGL() {
  let next = 1;
  return {
    created: [],
    deleted: [],
    createBuffer: vi.fn(() => ({ id: next++ })),
    deleteBuffer: vi.fn(function (h) { this.deleted.push(h); }),
  };
}

describe('GLResourceRegistry', () => {
  it('shares one instance across acquirers and disposes at zero refs', () => {
    const gl = mockGL();
    const reg = new GLResourceRegistry(gl);
    const create = g => g.createBuffer();
    const dispose = (g, h) => g.deleteBuffer(h);
    const a = reg.acquire(ResourceKind.BUFFER, 'cells', create, dispose);
    const b = reg.acquire(ResourceKind.BUFFER, 'cells', create, dispose);
    expect(a).toBe(b);
    expect(gl.createBuffer).toHaveBeenCalledTimes(1);
    expect(reg.liveCount).toBe(1);
    reg.release(ResourceKind.BUFFER, 'cells');
    expect(gl.deleteBuffer).not.toHaveBeenCalled();
    reg.release(ResourceKind.BUFFER, 'cells');
    expect(gl.deleteBuffer).toHaveBeenCalledTimes(1);
    expect(reg.liveCount).toBe(0);
  });

  it('releaseAll frees everything and reports the count', () => {
    const gl = mockGL();
    const reg = new GLResourceRegistry(gl);
    const c = g => g.createBuffer();
    const d = (g, h) => g.deleteBuffer(h);
    reg.acquire(ResourceKind.BUFFER, 'a', c, d);
    reg.acquire(ResourceKind.TEXTURE, 'b', c, d);
    expect(reg.releaseAll()).toBe(2);
    expect(reg.liveCount).toBe(0);
    expect(reg.refCount).toBe(0);
  });

  it('drops handles on context loss without disposing, then rebuilds', () => {
    const gl = mockGL();
    const reg = new GLResourceRegistry(gl);
    const c = g => g.createBuffer();
    const d = (g, h) => g.deleteBuffer(h);
    const before = reg.acquire(ResourceKind.BUFFER, 'cells', c, d);
    reg.handleContextLost();
    expect(reg.liveCount).toBe(0);
    expect(gl.deleteBuffer).not.toHaveBeenCalled(); // context is gone; no GL calls
    const after = reg.acquire(ResourceKind.BUFFER, 'cells', c, d);
    expect(gl.createBuffer).toHaveBeenCalledTimes(2);
    expect(after).not.toBe(before);
  });

  it('requires a gl context', () => {
    expect(() => new GLResourceRegistry(null)).toThrow();
  });

  it('reports a census by kind', () => {
    const gl = mockGL();
    const reg = new GLResourceRegistry(gl);
    const c = g => g.createBuffer();
    const d = (g, h) => g.deleteBuffer(h);
    reg.acquire(ResourceKind.BUFFER, 'a', c, d);
    reg.acquire(ResourceKind.BUFFER, 'b', c, d);
    reg.acquire(ResourceKind.TEXTURE, 't', c, d);
    expect(reg.census()).toEqual({ buffer: 2, texture: 1 });
  });
});
