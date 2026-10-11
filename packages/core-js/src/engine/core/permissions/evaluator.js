/*                                                 *\
** ----------------------------------------------- **
**          Calliope - Pixos Game Engine           **
** ----------------------------------------------- **
**  Copyright (c) 2020-2025 - Kyle Derby MacInnis  **
**                                                 **
** PixoSpritz Dual License - see LICENSE.          **
** Free for education, non-commercial use, and     **
** individual non-profit artists (CC-BY-NC-SA-4.0) **
** Commercial use requires a purchased license.    **
** ----------------------------------------------- **
\*                                                 */

/**
 * PermissionEvaluator — access control for spritz packages.
 *
 * Every package declares a `permissions` block in its manifest:
 * {
 *   visibility: 'public' | 'unlisted' | 'private',
 *   merge:      'public' | 'allowlist' | 'private',
 *   fork:       'public' | 'allowlist' | 'private',
 *   liveSession:'public' | 'invite'    | 'private',
 *   allowlist:  ['svrn-identity-id', ...]
 * }
 *
 * The package author (manifest.author.id) always has full access.
 * All other identities are evaluated against the declared policy.
 *
 * Missing `permissions` block = legacy open defaults (all public).
 */

const OPEN_DEFAULTS = {
  visibility: 'public',
  merge: 'public',
  fork: 'public',
  liveSession: 'public',
  allowlist: [],
};

function permsOf(manifest) {
  return { ...OPEN_DEFAULTS, ...(manifest?.permissions || {}) };
}

function identityId(identity) {
  if (!identity) return null;
  return typeof identity === 'string' ? identity : (identity.id || null);
}

function authorId(manifest) {
  const a = manifest?.author;
  if (!a) return null;
  return typeof a === 'string' ? a : (a.id || null);
}

export default class PermissionEvaluator {
  /**
   * @param {object|string|null} identity - SVRN identity ({ id } or id string), null for anonymous.
   */
  constructor(identity = null) {
    this.identity = identity;
  }

  setIdentity(identity) {
    this.identity = identity;
  }

  /** Package author always has full access. */
  isOwner(manifest) {
    const iid = identityId(this.identity);
    const aid = authorId(manifest);
    return !!iid && !!aid && iid === aid;
  }

  inAllowlist(manifest) {
    const iid = identityId(this.identity);
    if (!iid) return false;
    return permsOf(manifest).allowlist.includes(iid);
  }

  /** Who can discover and load this package. */
  canView(manifest) {
    if (this.isOwner(manifest)) return true;
    const { visibility } = permsOf(manifest);
    if (visibility === 'public' || visibility === 'unlisted') return true;
    return this.inAllowlist(manifest); // private
  }

  /** Who can merge this world's content into another spritz. */
  canMerge(manifest) {
    if (this.isOwner(manifest)) return true;
    const { merge } = permsOf(manifest);
    if (merge === 'public') return true;
    if (merge === 'allowlist') return this.inAllowlist(manifest);
    return false; // private
  }

  /** Who can fork/branch this package into a derivative. */
  canFork(manifest) {
    if (this.isOwner(manifest)) return true;
    const { fork } = permsOf(manifest);
    if (fork === 'public') return true;
    if (fork === 'allowlist') return this.inAllowlist(manifest);
    return false; // private
  }

  /** Who can join live sessions hosted in this package's zones. */
  canJoinLiveSession(manifest) {
    if (this.isOwner(manifest)) return true;
    const { liveSession } = permsOf(manifest);
    if (liveSession === 'public') return true;
    if (liveSession === 'invite') return this.inAllowlist(manifest);
    return false; // private
  }

  /**
   * Evaluate all permissions at once — useful for UI gating.
   * @returns {{view, merge, fork, joinLiveSession, isOwner}}
   */
  evaluateAll(manifest) {
    return {
      view: this.canView(manifest),
      merge: this.canMerge(manifest),
      fork: this.canFork(manifest),
      joinLiveSession: this.canJoinLiveSession(manifest),
      isOwner: this.isOwner(manifest),
    };
  }
}
