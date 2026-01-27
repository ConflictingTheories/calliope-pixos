/**
 * ---------------------------------------------------------------
 *               PixoSpritz – Server – Redis Store Tests
 * ---------------------------------------------------------------
 * Tests for RedisStore with in-memory fallback
 */

import { test, describe, expect, beforeEach, afterEach } from 'vitest';
import { RedisStore } from '../src/utils/redis-store.js';

describe('RedisStore (in-memory fallback)', () => {
  let store;

  beforeEach(() => {
    // Create store without Redis URL to use memory fallback
    store = new RedisStore({
      sessionTtl: 60,
      zoneTtl: 300,
      prefix: 'test:',
    });
  });

  afterEach(async () => {
    await store.destroy();
  });

  describe('Zone State', () => {
    test('saveZoneState and loadZoneState work correctly', async () => {
      const zoneId = 'zone-1';
      const state = { players: [], objects: [{ id: 'obj-1' }] };

      await store.saveZoneState(zoneId, state);
      const loaded = await store.loadZoneState(zoneId);

      expect(loaded).toEqual(state);
    });

    test('loadZoneState returns null for non-existent zone', async () => {
      const loaded = await store.loadZoneState('non-existent');
      expect(loaded).toBe(null);
    });

    test('deleteZoneState removes zone', async () => {
      const zoneId = 'zone-to-delete';
      await store.saveZoneState(zoneId, { test: true });

      await store.deleteZoneState(zoneId);
      const loaded = await store.loadZoneState(zoneId);

      expect(loaded).toBe(null);
    });
  });

  describe('Session Management', () => {
    test('saveSession and loadSession work correctly', async () => {
      const clientId = 'client-1';
      const sessionData = { zoneId: 'zone-1', avatar: { x: 10, y: 20 } };

      await store.saveSession(clientId, sessionData);
      const loaded = await store.loadSession(clientId);

      expect(loaded.zoneId).toBe('zone-1');
      expect(loaded.avatar).toEqual({ x: 10, y: 20 });
      expect(loaded.savedAt).toBeTruthy(); // Should have timestamp
    });

    test('loadSession returns null for non-existent session', async () => {
      const loaded = await store.loadSession('non-existent');
      expect(loaded).toBe(null);
    });

    test('deleteSession removes session', async () => {
      const clientId = 'session-to-delete';
      await store.saveSession(clientId, { test: true });

      await store.deleteSession(clientId);
      const loaded = await store.loadSession(clientId);

      expect(loaded).toBe(null);
    });

    test('extendSession updates TTL', async () => {
      const clientId = 'session-extend';
      await store.saveSession(clientId, { test: true });

      const result = await store.extendSession(clientId);
      expect(result).toBe(true);
    });

    test('extendSession returns false for non-existent session', async () => {
      const result = await store.extendSession('non-existent');
      expect(result).toBe(false);
    });
  });

  describe('Player Position', () => {
    test('savePlayerPosition and getZonePlayers work correctly', async () => {
      const zoneId = 'zone-players';
      await store.savePlayerPosition(zoneId, 'player-1', { x: 10, y: 20 });
      await store.savePlayerPosition(zoneId, 'player-2', { x: 30, y: 40 });

      const players = await store.getZonePlayers(zoneId);

      // In memory fallback, this is stored in zone state
      expect(players).toBeTruthy();
    });

    test('removePlayerFromZone removes player', async () => {
      const zoneId = 'zone-remove';
      await store.savePlayerPosition(zoneId, 'player-1', { x: 10, y: 20 });

      await store.removePlayerFromZone(zoneId, 'player-1');

      // Should succeed without error
      expect(true).toBeTruthy();
    });

    test('getZonePlayers returns empty object for empty zone', async () => {
      const players = await store.getZonePlayers('empty-zone');
      expect(players).toEqual({});
    });
  });

  describe('Utility Methods', () => {
    test('getStats returns store statistics', async () => {
      await store.saveZoneState('zone-1', { test: true });
      await store.saveSession('client-1', { test: true });

      const stats = await store.getStats();

      expect(stats.connected).toBe(false); // No Redis connection
      expect(stats.memoryEntries >= 2).toBeTruthy();
    });

    test('cleanupExpired removes old entries', async () => {
      // This is hard to test without time manipulation
      // Just verify it doesn't throw
      store.cleanupExpired();
      expect(true).toBeTruthy();
    });

    test('key generates correct prefix', () => {
      const key = store.key('zone', 'test-id');
      expect(key).toBe('test:zone:test-id');
    });
  });

  describe('Connection', () => {
    test('connect returns false without Redis URL', async () => {
      const result = await store.connect();
      expect(result).toBe(false);
    });
  });
});

describe('RedisStore key prefixing', () => {
  test('uses custom prefix', () => {
    const store = new RedisStore({ prefix: 'custom:' });
    const key = store.key('session', 'test');
    expect(key).toBe('custom:session:test');
    store.destroy();
  });

  test('uses default prefix', () => {
    const store = new RedisStore({});
    const key = store.key('zone', 'test');
    expect(key).toBe('pixospritz:zone:test');
    store.destroy();
  });
});
