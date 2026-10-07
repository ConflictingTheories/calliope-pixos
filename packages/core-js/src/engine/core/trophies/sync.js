/*                                                 *\
** ----------------------------------------------- **
**          Calliope - Pixos Game Engine            **
** ----------------------------------------------- **
**  Copyright (c) 2020-2025 - Kyle Derby MacInnis   **
**                                                 **
** PixoSpritz Dual License - see LICENSE.          **
** Free for education, non-commercial use, and     **
** individual non-profit artists (CC-BY-NC-SA-4.0) **
** Commercial use requires a purchased license.    **
** ----------------------------------------------- **
\*                                                 */

/**
 * @fileoverview Trophy sync provider interface.
 *
 * Syncs a game's unlocked-trophy set against the player's SVRN identity.
 * Trophies are monotonic (once unlocked, always unlocked), so the merge
 * is a pure union — no conflict resolution needed beyond keeping the
 * earliest unlock timestamp.
 *
 * @typedef {object} UnlockedTrophy
 * @property {string} id - Trophy id.
 * @property {string} unlockedAt - ISO timestamp of unlock.
 */

/**
 * Base sync provider. Subclass and override push/pull for a real backend.
 * The default merge is union-by-id with earliest-timestamp-wins.
 */
export class TrophySyncProvider {
  /**
   * Push the local unlocked set to the remote.
   * @param {string} gameId
   * @param {UnlockedTrophy[]} unlocked
   * @returns {Promise<void>}
   */
  async push(gameId, unlocked) {
    throw new Error('TrophySyncProvider.push: not implemented');
  }

  /**
   * Pull the remote unlocked set for this game + identity.
   * @param {string} gameId
   * @returns {Promise<UnlockedTrophy[]|null>} remote set, or null if unavailable.
   */
  async pull(gameId) {
    throw new Error('TrophySyncProvider.pull: not implemented');
  }

  /**
   * Merge local and remote unlocked sets. Default: union by id,
   * earliest unlockedAt wins. Trophies never "re-lock" via sync.
   * @param {UnlockedTrophy[]} local
   * @param {UnlockedTrophy[]} remote
   * @returns {UnlockedTrophy[]}
   */
  merge(local, remote) {
    const byId = new Map();
    for (const t of [...(local || []), ...(remote || [])]) {
      if (!t || typeof t.id !== 'string') continue;
      const existing = byId.get(t.id);
      if (!existing || (t.unlockedAt && t.unlockedAt < existing.unlockedAt)) {
        byId.set(t.id, { id: t.id, unlockedAt: t.unlockedAt || new Date().toISOString() });
      }
    }
    return [...byId.values()];
  }
}

/**
 * Default provider: local-only. Push is a no-op, pull returns null
 * (nothing remote to merge). The game works fully offline.
 */
export class LocalTrophySyncProvider extends TrophySyncProvider {
  async push(gameId, unlocked) {
    // Local-only: nothing to push.
  }

  async pull(gameId) {
    return null;
  }
}

/**
 * Typed error thrown when SVRN hub sync is attempted before the
 * identity provider exists. Mirrors SvrnHubNotAvailableError in
 * the editor's svrn-publish module.
 */
export class SvrnHubTrophySyncNotAvailableError extends Error {
  constructor(
    message = 'SVRN trophy sync is not available yet: the hub identity provider does not exist. ' +
      'Trophies persist locally — sync will activate once the hub is live.'
  ) {
    super(message);
    this.name = 'SvrnHubTrophySyncNotAvailableError';
    this.code = 'svrn-hub-trophy-sync-not-available';
  }
}

/**
 * Stub for the future SVRN hub sync provider. Every operation throws
 * the typed not-available error until the hub identity provider exists.
 * Replace with a real implementation backed by the SVRN identity API.
 */
export class SvrnHubTrophySyncProvider extends TrophySyncProvider {
  /**
   * @param {object} [opts]
   * @param {string} [opts.hubUrl] - Hub base URL (unused until the hub exists).
   * @param {() => Promise<string|null>} [opts.getIdentityToken] - Returns the SVRN identity token.
   */
  constructor(opts = {}) {
    super();
    this.hubUrl = opts.hubUrl || null;
    this.getIdentityToken = opts.getIdentityToken || (async () => null);
  }

  async push(gameId, unlocked) {
    throw new SvrnHubTrophySyncNotAvailableError();
  }

  async pull(gameId) {
    throw new SvrnHubTrophySyncNotAvailableError();
  }
}
