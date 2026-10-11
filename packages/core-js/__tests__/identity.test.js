/**
 * IdentityContext tests — creator/consumer duality.
 *
 * Covers: default consumer mode, mode switching, capability gates,
 * mode+permission combined gates, anonymous handling.
 */
import { describe, it, expect } from 'vitest';
import IdentityContext, { IdentityModes } from '../src/engine/core/identity/context.js';

const alice = { id: 'svrn:alice', displayName: 'Alice' };

function manifestWith(permissions) {
  return {
    title: 'Test',
    id: 'test',
    author: { id: 'svrn:alice' },
    permissions,
  };
}

describe('IdentityContext', () => {
  it('starts in consumer mode', () => {
    const ctx = new IdentityContext(alice);
    expect(ctx.mode).toBe(IdentityModes.CONSUMER);
    expect(ctx.can('play')).toBe(true);
    expect(ctx.can('host-session')).toBe(false);
  });

  it('switches modes fluidly', () => {
    const ctx = new IdentityContext(alice);
    ctx.setMode(IdentityModes.CREATOR);
    expect(ctx.mode).toBe(IdentityModes.CREATOR);
    expect(ctx.can('build')).toBe(true);
    expect(ctx.can('host-session')).toBe(true);
    ctx.setMode(IdentityModes.CONSUMER);
    expect(ctx.can('build')).toBe(false);
  });

  it('notifies mode listeners', () => {
    const ctx = new IdentityContext(alice);
    const events = [];
    ctx.onModeChange(e => events.push(e));
    ctx.setMode(IdentityModes.HOST);
    expect(events.length).toBe(1);
    expect(events[0].prev).toBe(IdentityModes.CONSUMER);
    expect(events[0].mode).toBe(IdentityModes.HOST);
  });

  it('rejects unknown modes', () => {
    const ctx = new IdentityContext(alice);
    expect(() => ctx.setMode('wizard')).toThrow();
  });

  it('anonymous identity is a guest consumer', () => {
    const ctx = new IdentityContext(null);
    expect(ctx.isAnonymous()).toBe(true);
    expect(ctx.getDisplayName()).toBe('Guest');
    expect(ctx.mode).toBe(IdentityModes.CONSUMER);
  });

  it('merge gate requires mode AND package permission', () => {
    const ctx = new IdentityContext({ id: 'svrn:bob' });
    const openPkg = manifestWith({ merge: 'public' });
    const closedPkg = manifestWith({ merge: 'private' });

    // Consumer mode: no merge capability even for open packages
    expect(ctx.canMergeWorld(openPkg)).toBe(false);

    // Creator mode + open package: allowed
    ctx.setMode(IdentityModes.CREATOR);
    expect(ctx.canMergeWorld(openPkg)).toBe(true);

    // Creator mode + private package: denied
    expect(ctx.canMergeWorld(closedPkg)).toBe(false);
  });

  it('performer can do live art but not host sessions', () => {
    const ctx = new IdentityContext(alice);
    ctx.setMode(IdentityModes.PERFORMER);
    expect(ctx.canLiveArt()).toBe(true);
    expect(ctx.canCommentate()).toBe(true);
    expect(ctx.can('host-session')).toBe(false);
  });
});
