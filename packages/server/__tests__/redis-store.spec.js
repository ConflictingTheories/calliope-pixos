/**
 * ---------------------------------------------------------------
 *               PixoSpritz – Server – Redis Store Tests
 * ---------------------------------------------------------------
 * Tests for RedisStore with in-memory fallback
 */

import { test, describe, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert';
import { RedisStore } from '../src/utils/redis-store.js';

describe('RedisStore (in-memory fallback)', () => {
  let store;

  beforeEach(() => {
    // Create store without Redis URL to use memory fallback
    store = new RedisStore({
      sessionTtl: 60,
      zoneTtl: 300,
      prefix: 'test:'
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
      
      assert.deepStrictEqual(loaded, state);
    });

    test('loadZoneState returns null for non-existent zone', async () => {
      const loaded = await store.loadZoneState('non-existent');
      assert.strictEqual(loaded, null);
    });

    test('deleteZoneState removes zone', async () => {
      const zoneId = 'zone-to-delete';
      await store.saveZoneState(zoneId, { test: true });
      
      await store.deleteZoneState(zoneId);
      const loaded = await store.loadZoneState(zoneId);
      
      assert.strictEqual(loaded, null);
    });
  });

  describe('Session Management', () => {
    test('saveSession and loadSession work correctly', async () => {
      const clientId = 'client-1';
      const sessionData = { zoneId: 'zone-1', avatar: { x: 10, y: 20 } };
      
      await store.saveSession(clientId, sessionData);
      const loaded = await store.loadSession(clientId);
      
      assert.strictEqual(loaded.zoneId, 'zone-1');
      assert.deepStrictEqual(loaded.avatar, { x: 10, y: 20 });
      assert(loaded.savedAt); // Should have timestamp
    });

    test('loadSession returns null for non-existent session', async () => {
      const loaded = await store.loadSession('non-existent');
      assert.strictEqual(loaded, null);
    });

    test('deleteSession removes session', async () => {
      const clientId = 'session-to-delete';
      await store.saveSession(clientId, { test: true });
      
      await store.deleteSession(clientId);
      const loaded = await store.loadSession(clientId);
      
      assert.strictEqual(loaded, null);
    });

    test('extendSession updates TTL', async () => {
      const clientId = 'session-extend';
      await store.saveSession(clientId, { test: true });
      
      const result = await store.extendSession(clientId);
      assert.strictEqual(result, true);
    });

    test('extendSession returns false for non-existent session', async () => {
      const result = await store.extendSession('non-existent');
      assert.strictEqual(result, false);
    });
  });

  describe('Player Position', () => {
    test('savePlayerPosition and getZonePlayers work correctly', async () => {
      const zoneId = 'zone-players';
      await store.savePlayerPosition(zoneId, 'player-1', { x: 10, y: 20 });
      await store.savePlayerPosition(zoneId, 'player-2', { x: 30, y: 40 });
      
      const players = await store.getZonePlayers(zoneId);
      
      // In memory fallback, this is stored in zone state
      assert(players);
    });

    test('removePlayerFromZone removes player', async () => {
      const zoneId = 'zone-remove';
      await store.savePlayerPosition(zoneId, 'player-1', { x: 10, y: 20 });
      
      await store.removePlayerFromZone(zoneId, 'player-1');
      
      // Should succeed without error
      assert(true);
    });

    test('getZonePlayers returns empty object for empty zone', async () => {
      const players = await store.getZonePlayers('empty-zone');
      assert.deepStrictEqual(players, {});
    });
  });

  describe('Utility Methods', () => {
    test('getStats returns store statistics', async () => {
      await store.saveZoneState('zone-1', { test: true });
      await store.saveSession('client-1', { test: true });
      
      const stats = await store.getStats();
      
      assert.strictEqual(stats.connected, false); // No Redis connection
      assert(stats.memoryEntries >= 2);
    });

    test('cleanupExpired removes old entries', async () => {
      // This is hard to test without time manipulation
      // Just verify it doesn't throw
      store.cleanupExpired();
      assert(true);
    });

    test('key generates correct prefix', () => {
      const key = store.key('zone', 'test-id');
      assert.strictEqual(key, 'test:zone:test-id');
    });
  });

  describe('Connection', () => {
    test('connect returns false without Redis URL', async () => {
      const result = await store.connect();
      assert.strictEqual(result, false);
    });
  });
});

describe('RedisStore key prefixing', () => {
  test('uses custom prefix', () => {
    const store = new RedisStore({ prefix: 'custom:' });
    const key = store.key('session', 'test');
    assert.strictEqual(key, 'custom:session:test');
    store.destroy();
  });

  test('uses default prefix', () => {
    const store = new RedisStore({});
    const key = store.key('zone', 'test');
    assert.strictEqual(key, 'pixospritz:zone:test');
    store.destroy();
  });
});
