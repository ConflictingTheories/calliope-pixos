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

import PermissionEvaluator from '../permissions/evaluator.js';

/**
 * IdentityContext — the creator/consumer duality.
 *
 * One SVRN identity flows through the engine, but the person behind it
 * wears different hats at different moments:
 * - consumer: playing, exploring, spectating
 * - creator: building, hosting live sessions, merging worlds, commenting live
 * - collaborator: co-building in a shared universe
 * - performer: live art inside a running session
 * - host: running a live multiplayer session
 * - modder: forking and extending someone else's spritz
 *
 * Modes are fluid — a consumer can become a host mid-session, a player
 * can switch to creator to fix something live. The engine gates
 * capabilities by mode + package permissions, not by account type.
 *
 * Anonymous (null identity) = consumer with public-only access.
 */
export const IdentityModes = {
  CONSUMER: 'consumer',
  CREATOR: 'creator',
  COLLABORATOR: 'collaborator',
  PERFORMER: 'performer',
  HOST: 'host',
  MODDER: 'modder',
};

/** Which modes unlock which capability gates. */
const MODE_CAPABILITIES = {
  [IdentityModes.CONSUMER]: ['play', 'spectate', 'save'],
  [IdentityModes.CREATOR]: ['play', 'spectate', 'save', 'build', 'host-session', 'commentate', 'merge'],
  [IdentityModes.COLLABORATOR]: ['play', 'spectate', 'save', 'build'],
  [IdentityModes.PERFORMER]: ['play', 'spectate', 'save', 'live-art', 'commentate'],
  [IdentityModes.HOST]: ['play', 'spectate', 'save', 'host-session', 'commentate', 'cue'],
  [IdentityModes.MODDER]: ['play', 'spectate', 'save', 'fork', 'merge'],
};

export default class IdentityContext {
  /**
   * @param {object|string|null} identity - SVRN identity ({ id, displayName }) or null.
   */
  constructor(identity = null) {
    this.identity = identity;
    this.mode = IdentityModes.CONSUMER;
    this.permissions = new PermissionEvaluator(identity);
    /** @type {Function[]} */
    this.modeListeners = [];
  }

  /** Set or replace the identity (login/logout/switch). */
  setIdentity(identity) {
    this.identity = identity;
    this.permissions.setIdentity(identity);
    // Anonymous users drop to consumer mode
    if (!identity) this.setMode(IdentityModes.CONSUMER, { silent: false });
  }

  getIdentityId() {
    if (!this.identity) return null;
    return typeof this.identity === 'string' ? this.identity : this.identity.id || null;
  }

  getDisplayName() {
    if (!this.identity) return 'Guest';
    return typeof this.identity === 'string' ? this.identity : (this.identity.displayName || this.identity.id || 'Guest');
  }

  isAnonymous() {
    return !this.getIdentityId();
  }

  /**
   * Switch mode. Modes are fluid — no auth ceremony, just intent.
   * Capability gates still apply (mode + package permissions).
   */
  setMode(mode, { silent = false } = {}) {
    if (!Object.values(IdentityModes).includes(mode)) {
      throw new Error(`Unknown identity mode: ${mode}`);
    }
    const prev = this.mode;
    this.mode = mode;
    if (!silent && prev !== mode) {
      for (const cb of this.modeListeners) {
        try { cb({ prev, mode, identity: this.identity }); } catch (e) { console.warn('Mode listener error:', e); }
      }
    }
    return this.mode;
  }

  onModeChange(cb) {
    this.modeListeners.push(cb);
    return () => {
      this.modeListeners = this.modeListeners.filter(f => f !== cb);
    };
  }

  /** Capabilities unlocked by the current mode. */
  modeCapabilities() {
    return MODE_CAPABILITIES[this.mode] || [];
  }

  /** Does the current mode unlock this capability? */
  can(capability) {
    return this.modeCapabilities().includes(capability);
  }

  /**
   * Full gate: mode capability AND package permission.
   * e.g. canMergeWorld(manifest) = mode allows 'merge' AND package allows this identity.
   */
  canMergeWorld(manifest) {
    return this.can('merge') && this.permissions.canMerge(manifest);
  }

  canForkPackage(manifest) {
    return this.can('fork') && this.permissions.canFork(manifest);
  }

  canHostSession(manifest) {
    // Hosting is a mode capability; joining is gated by package liveSession policy
    return this.can('host-session');
  }

  canJoinSession(manifest) {
    return this.permissions.canJoinLiveSession(manifest);
  }

  canCommentate() {
    return this.can('commentate');
  }

  canLiveArt() {
    return this.can('live-art') || this.can('build');
  }
}
