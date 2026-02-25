/**
 * ---------------------------------------------------------------
 *               PixoSpritz – Server – Redis State Store
 * ---------------------------------------------------------------
 * Copyright (c) 2022-2025 Kyle Derby MacInnis
 *
 * Redis-based state persistence for zones and sessions.
 * Provides fallback to in-memory storage when Redis is unavailable.
 */

/**
 * Redis Store for persistent state management
 *
 * Features:
 * - Zone state persistence
 * - Session recovery data
 * - TTL-based expiration
 * - Graceful fallback to memory
 */
export class RedisStore {
  /**
   * @param {object} options
   * @param {string} options.url - Redis connection URL
   * @param {string} options.prefix - Key prefix for all stored data
   * @param {number} options.sessionTtl - Session TTL in seconds (default: 300 = 5 min)
   * @param {number} options.zoneTtl - Zone state TTL in seconds (default: 3600 = 1 hour)
   */
  constructor(options = {}) {
    this.url = options.url || process.env.REDIS_URL;
    this.prefix = options.prefix || 'pixospritz:';
    this.sessionTtl = options.sessionTtl || 300;
    this.zoneTtl = options.zoneTtl || 3600;

    /** @type {any} Redis client (optional dependency) */
    this.client = null;
    this.connected = false;

    /** @type {Map<string, any>} Fallback in-memory store */
    this.memoryStore = new Map();
    this.memoryTtls = new Map();

    // Cleanup interval for memory TTLs
    this.cleanupInterval = setInterval(() => this.cleanupExpired(), 60000);
  }

  /**
   * Initialize Redis connection
   * @returns {Promise<boolean>} True if connected successfully
   */
  async connect() {
    if (!this.url) {
      console.log('[RedisStore] No REDIS_URL configured, using in-memory fallback');
      return false;
    }

    try {
      // Dynamic import to make redis an optional dependency
      const { createClient } = await import('redis');

      this.client = createClient({ url: this.url });

      this.client.on('error', err => {
        console.error('[RedisStore] Redis error:', err.message);
        this.connected = false;
      });

      this.client.on('connect', () => {
        console.log('[RedisStore] Connected to Redis');
        this.connected = true;
      });

      this.client.on('disconnect', () => {
        console.log('[RedisStore] Disconnected from Redis');
        this.connected = false;
      });

      await this.client.connect();
      this.connected = true;
      return true;
    } catch (error) {
      console.warn('[RedisStore] Failed to connect to Redis:', error.message);
      console.log('[RedisStore] Using in-memory fallback');
      this.connected = false;
      return false;
    }
  }

  /**
   * Get full key with prefix
   * @param {string} type - Key type (zone, session, etc.)
   * @param {string} id - Entity ID
   * @returns {string} Full key
   */
  key(type, id) {
    return `${this.prefix}${type}:${id}`;
  }

  // ===========================================
  // Zone State Methods
  // ===========================================

  /**
   * Save zone state
   * @param {string} zoneId
   * @param {object} state
   * @returns {Promise<boolean>}
   */
  async saveZoneState(zoneId, state) {
    const key = this.key('zone', zoneId);
    const data = JSON.stringify(state);

    if (this.connected && this.client) {
      try {
        await this.client.setEx(key, this.zoneTtl, data);
        return true;
      } catch (error) {
        console.error('[RedisStore] Failed to save zone state:', error.message);
      }
    }

    // Fallback to memory
    this.memoryStore.set(key, data);
    this.memoryTtls.set(key, Date.now() + this.zoneTtl * 1000);
    return true;
  }

  /**
   * Load zone state
   * @param {string} zoneId
   * @returns {Promise<object|null>}
   */
  async loadZoneState(zoneId) {
    const key = this.key('zone', zoneId);

    if (this.connected && this.client) {
      try {
        const data = await this.client.get(key);
        return data ? JSON.parse(data) : null;
      } catch (error) {
        console.error('[RedisStore] Failed to load zone state:', error.message);
      }
    }

    // Fallback to memory
    const data = this.memoryStore.get(key);
    if (data) {
      const ttl = this.memoryTtls.get(key);
      if (ttl && Date.now() > ttl) {
        this.memoryStore.delete(key);
        this.memoryTtls.delete(key);
        return null;
      }
      return JSON.parse(data);
    }
    return null;
  }

  /**
   * Delete zone state
   * @param {string} zoneId
   * @returns {Promise<boolean>}
   */
  async deleteZoneState(zoneId) {
    const key = this.key('zone', zoneId);

    if (this.connected && this.client) {
      try {
        await this.client.del(key);
        return true;
      } catch (error) {
        console.error('[RedisStore] Failed to delete zone state:', error.message);
      }
    }

    // Fallback to memory
    this.memoryStore.delete(key);
    this.memoryTtls.delete(key);
    return true;
  }

  // ===========================================
  // Session Methods
  // ===========================================

  /**
   * Save session for reconnection
   * @param {string} clientId
   * @param {object} sessionData
   * @returns {Promise<boolean>}
   */
  async saveSession(clientId, sessionData) {
    const key = this.key('session', clientId);
    const data = JSON.stringify({
      ...sessionData,
      savedAt: Date.now(),
    });

    if (this.connected && this.client) {
      try {
        await this.client.setEx(key, this.sessionTtl, data);
        return true;
      } catch (error) {
        console.error('[RedisStore] Failed to save session:', error.message);
      }
    }

    // Fallback to memory
    this.memoryStore.set(key, data);
    this.memoryTtls.set(key, Date.now() + this.sessionTtl * 1000);
    return true;
  }

  /**
   * Load session for reconnection
   * @param {string} clientId
   * @returns {Promise<object|null>}
   */
  async loadSession(clientId) {
    const key = this.key('session', clientId);

    if (this.connected && this.client) {
      try {
        const data = await this.client.get(key);
        return data ? JSON.parse(data) : null;
      } catch (error) {
        console.error('[RedisStore] Failed to load session:', error.message);
      }
    }

    // Fallback to memory
    const data = this.memoryStore.get(key);
    if (data) {
      const ttl = this.memoryTtls.get(key);
      if (ttl && Date.now() > ttl) {
        this.memoryStore.delete(key);
        this.memoryTtls.delete(key);
        return null;
      }
      return JSON.parse(data);
    }
    return null;
  }

  /**
   * Delete session
   * @param {string} clientId
   * @returns {Promise<boolean>}
   */
  async deleteSession(clientId) {
    const key = this.key('session', clientId);

    if (this.connected && this.client) {
      try {
        await this.client.del(key);
        return true;
      } catch (error) {
        console.error('[RedisStore] Failed to delete session:', error.message);
      }
    }

    // Fallback to memory
    this.memoryStore.delete(key);
    this.memoryTtls.delete(key);
    return true;
  }

  /**
   * Extend session TTL (heartbeat)
   * @param {string} clientId
   * @returns {Promise<boolean>}
   */
  async extendSession(clientId) {
    const key = this.key('session', clientId);

    if (this.connected && this.client) {
      try {
        await this.client.expire(key, this.sessionTtl);
        return true;
      } catch (error) {
        console.error('[RedisStore] Failed to extend session:', error.message);
      }
    }

    // Fallback to memory
    if (this.memoryStore.has(key)) {
      this.memoryTtls.set(key, Date.now() + this.sessionTtl * 1000);
      return true;
    }
    return false;
  }

  // ===========================================
  // Player Position Methods (for delta sync)
  // ===========================================

  /**
   * Save player position in a zone
   * @param {string} zoneId
   * @param {string} playerId
   * @param {object} position
   * @returns {Promise<boolean>}
   */
  async savePlayerPosition(zoneId, playerId, position) {
    const key = this.key('zone-players', zoneId);

    if (this.connected && this.client) {
      try {
        await this.client.hSet(key, playerId, JSON.stringify(position));
        await this.client.expire(key, this.zoneTtl);
        return true;
      } catch (error) {
        console.error('[RedisStore] Failed to save player position:', error.message);
      }
    }

    // Fallback: Store in zone state
    const state = (await this.loadZoneState(zoneId)) || { players: {} };
    state.players = state.players || {};
    state.players[playerId] = position;
    return this.saveZoneState(zoneId, state);
  }

  /**
   * Get all player positions in a zone
   * @param {string} zoneId
   * @returns {Promise<object>}
   */
  async getZonePlayers(zoneId) {
    const key = this.key('zone-players', zoneId);

    if (this.connected && this.client) {
      try {
        const data = await this.client.hGetAll(key);
        const players = {};
        for (const [id, pos] of Object.entries(data)) {
          players[id] = JSON.parse(pos);
        }
        return players;
      } catch (error) {
        console.error('[RedisStore] Failed to get zone players:', error.message);
      }
    }

    // Fallback
    const state = await this.loadZoneState(zoneId);
    return state?.players || {};
  }

  /**
   * Remove player from zone
   * @param {string} zoneId
   * @param {string} playerId
   * @returns {Promise<boolean>}
   */
  async removePlayerFromZone(zoneId, playerId) {
    const key = this.key('zone-players', zoneId);

    if (this.connected && this.client) {
      try {
        await this.client.hDel(key, playerId);
        return true;
      } catch (error) {
        console.error('[RedisStore] Failed to remove player from zone:', error.message);
      }
    }

    // Fallback
    const state = await this.loadZoneState(zoneId);
    if (state?.players?.[playerId]) {
      delete state.players[playerId];
      return this.saveZoneState(zoneId, state);
    }
    return true;
  }

  // ===========================================
  // Utility Methods
  // ===========================================

  /**
   * Clean up expired entries in memory store
   */
  cleanupExpired() {
    const now = Date.now();
    for (const [key, ttl] of this.memoryTtls) {
      if (now > ttl) {
        this.memoryStore.delete(key);
        this.memoryTtls.delete(key);
      }
    }
  }

  /**
   * Get store statistics
   * @returns {Promise<object>}
   */
  async getStats() {
    const stats = {
      connected: this.connected,
      memoryEntries: this.memoryStore.size,
    };

    if (this.connected && this.client) {
      try {
        const info = await this.client.info('memory');
        stats.redisMemory = info;
      } catch (error) {
        stats.redisError = error.message;
      }
    }

    return stats;
  }

  /**
   * Graceful shutdown
   */
  async destroy() {
    clearInterval(this.cleanupInterval);

    if (this.client) {
      try {
        await this.client.quit();
      } catch (error) {
        console.error('[RedisStore] Error during shutdown:', error.message);
      }
    }

    this.memoryStore.clear();
    this.memoryTtls.clear();
  }
}

export default RedisStore;
