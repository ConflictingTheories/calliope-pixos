/**
 * PermissionEvaluator tests.
 *
 * Covers: owner always allowed, public/allowlist/private policies,
 * legacy manifests without permissions block default to open.
 */
import { describe, it, expect } from 'vitest';
import PermissionEvaluator from '../src/engine/core/permissions/evaluator.js';

const ownerIdentity = { id: 'svrn:alice', displayName: 'Alice' };
const otherIdentity = { id: 'svrn:bob', displayName: 'Bob' };

function manifestWith(permissions, authorId = 'svrn:alice') {
  return {
    title: 'Test Spritz',
    id: 'test-spritz',
    author: { id: authorId },
    permissions,
  };
}

describe('PermissionEvaluator', () => {
  it('owner always has full access', () => {
    const ev = new PermissionEvaluator(ownerIdentity);
    const m = manifestWith({
      visibility: 'private',
      merge: 'private',
      fork: 'private',
      liveSession: 'private',
      allowlist: [],
    });
    const all = ev.evaluateAll(m);
    expect(all.view).toBe(true);
    expect(all.merge).toBe(true);
    expect(all.fork).toBe(true);
    expect(all.joinLiveSession).toBe(true);
    expect(all.isOwner).toBe(true);
  });

  it('public merge allows anyone', () => {
    const ev = new PermissionEvaluator(otherIdentity);
    const m = manifestWith({ merge: 'public' });
    expect(ev.canMerge(m)).toBe(true);
  });

  it('private merge denies non-owners', () => {
    const ev = new PermissionEvaluator(otherIdentity);
    const m = manifestWith({ merge: 'private' });
    expect(ev.canMerge(m)).toBe(false);
  });

  it('allowlist merge allows listed identities', () => {
    const ev = new PermissionEvaluator(otherIdentity);
    const m = manifestWith({ merge: 'allowlist', allowlist: ['svrn:bob'] });
    expect(ev.canMerge(m)).toBe(true);
  });

  it('allowlist merge denies unlisted identities', () => {
    const ev = new PermissionEvaluator({ id: 'svrn:mallory' });
    const m = manifestWith({ merge: 'allowlist', allowlist: ['svrn:bob'] });
    expect(ev.canMerge(m)).toBe(false);
  });

  it('legacy manifests without permissions default to open', () => {
    const ev = new PermissionEvaluator(otherIdentity);
    const m = { title: 'Legacy', id: 'legacy', author: { id: 'svrn:alice' } };
    const all = ev.evaluateAll(m);
    expect(all.view).toBe(true);
    expect(all.merge).toBe(true);
    expect(all.fork).toBe(true);
    expect(all.joinLiveSession).toBe(true);
    expect(all.isOwner).toBe(false);
  });

  it('anonymous identity gets public-only access', () => {
    const ev = new PermissionEvaluator(null);
    const m = manifestWith({ merge: 'allowlist', allowlist: ['svrn:bob'] });
    expect(ev.canMerge(m)).toBe(false);
    expect(ev.isOwner(m)).toBe(false);
  });

  it('invite-only live sessions gate on allowlist', () => {
    const bob = new PermissionEvaluator(otherIdentity);
    const mallory = new PermissionEvaluator({ id: 'svrn:mallory' });
    const m = manifestWith({ liveSession: 'invite', allowlist: ['svrn:bob'] });
    expect(bob.canJoinLiveSession(m)).toBe(true);
    expect(mallory.canJoinLiveSession(m)).toBe(false);
  });
});
