/**
 * ---------------------------------------------------------------
 *               PixoSpritz – Server – Security Tests
 * ---------------------------------------------------------------
 * Tests for security utilities: RateLimiter, MessageValidator, ConnectionTracker
 */

import { test, describe, beforeEach } from 'node:test';
import assert from 'node:assert';
import { RateLimiter, MessageValidator, ConnectionTracker } from '../src/utils/security.js';

describe('RateLimiter', () => {
  let limiter;

  beforeEach(() => {
    limiter = new RateLimiter(5, 1000); // 5 requests per second
  });

  test('allows requests under the limit', () => {
    const clientId = 'test-client';
    
    for (let i = 0; i < 5; i++) {
      const result = limiter.check(clientId);
      assert.strictEqual(result.allowed, true);
    }
  });

  test('blocks requests over the limit', () => {
    const clientId = 'test-client';
    
    // Use up all allowed requests
    for (let i = 0; i < 5; i++) {
      limiter.check(clientId);
    }
    
    // Next request should be blocked
    const result = limiter.check(clientId);
    assert.strictEqual(result.allowed, false);
    assert(result.retryAfter > 0);
  });

  test('removes client tracking', () => {
    const clientId = 'test-client';
    
    limiter.check(clientId);
    limiter.remove(clientId);
    
    // After removal, client should start fresh
    const result = limiter.check(clientId);
    assert.strictEqual(result.allowed, true);
  });

  test('cleanup removes old entries', () => {
    const clientId = 'test-client';
    limiter.check(clientId);
    
    // Cleanup should not throw
    limiter.cleanup();
    
    // Recent entries should still exist
    const result = limiter.check(clientId);
    assert.strictEqual(result.allowed, true);
  });

  test('destroy clears interval', () => {
    limiter.destroy();
    assert(true); // No error thrown
  });
});

describe('MessageValidator', () => {
  let validator;

  beforeEach(() => {
    validator = new MessageValidator();
  });

  test('validates load-zone message', () => {
    const payload = { zoneId: 'test-zone' };
    const result = validator.validate('load-zone', payload);
    
    assert.strictEqual(result.valid, true);
    assert.deepStrictEqual(result.errors, []);
  });

  test('rejects load-zone without zoneId', () => {
    const payload = {};
    const result = validator.validate('load-zone', payload);
    
    assert.strictEqual(result.valid, false);
    assert(result.errors.length > 0);
  });

  test('validates join-zone message', () => {
    const payload = { zoneId: 'test-zone' };
    const result = validator.validate('join-zone', payload);
    
    assert.strictEqual(result.valid, true);
  });

  test('validates update-avatar message', () => {
    const payload = {
      avatar: {
        position: { x: 10, y: 20 },
        direction: 'north',
        animation: 'walk'
      }
    };
    const result = validator.validate('update-avatar', payload);
    
    assert.strictEqual(result.valid, true);
  });

  test('validates action message', () => {
    const payload = {
      actionType: 'attack',
      target: 'enemy-1',
      data: { damage: 10 }
    };
    const result = validator.validate('action', payload);
    
    assert.strictEqual(result.valid, true);
  });

  test('rejects oversized string', () => {
    const payload = { zoneId: 'a'.repeat(500) }; // Exceeds maxLength of 256
    const result = validator.validate('load-zone', payload);
    
    assert.strictEqual(result.valid, false);
  });

  test('allows unknown message types', () => {
    const payload = { foo: 'bar' };
    const result = validator.validate('unknown-type', payload);
    
    // Unknown types should pass (no schema to validate against)
    assert.strictEqual(result.valid, true);
  });

  test('sanitize removes dangerous characters', () => {
    const payload = {
      text: '<script>alert("xss")</script>',
      normal: 'hello world'
    };
    
    const sanitized = validator.sanitize(payload);
    
    // Should escape or remove script tags
    assert(!sanitized.text.includes('<script>'));
    assert.strictEqual(sanitized.normal, 'hello world');
  });

  test('sanitize handles nested objects', () => {
    const payload = {
      nested: {
        value: '<b>bold</b>'
      }
    };
    
    const sanitized = validator.sanitize(payload);
    
    // Should handle nested objects
    assert(sanitized.nested);
  });
});

describe('ConnectionTracker', () => {
  let tracker;

  beforeEach(() => {
    tracker = new ConnectionTracker(3); // Max 3 connections per IP
  });

  test('allows connections under the limit', () => {
    assert.strictEqual(tracker.addConnection('client-1', '192.168.1.1'), true);
    assert.strictEqual(tracker.addConnection('client-2', '192.168.1.1'), true);
    assert.strictEqual(tracker.addConnection('client-3', '192.168.1.1'), true);
  });

  test('blocks connections over the limit', () => {
    tracker.addConnection('client-1', '192.168.1.1');
    tracker.addConnection('client-2', '192.168.1.1');
    tracker.addConnection('client-3', '192.168.1.1');
    
    // Fourth connection from same IP should be blocked
    assert.strictEqual(tracker.addConnection('client-4', '192.168.1.1'), false);
  });

  test('allows connections from different IPs', () => {
    tracker.addConnection('client-1', '192.168.1.1');
    tracker.addConnection('client-2', '192.168.1.1');
    tracker.addConnection('client-3', '192.168.1.1');
    
    // Different IP should be allowed
    assert.strictEqual(tracker.addConnection('client-4', '192.168.1.2'), true);
  });

  test('removes connection frees up slot', () => {
    tracker.addConnection('client-1', '192.168.1.1');
    tracker.addConnection('client-2', '192.168.1.1');
    tracker.addConnection('client-3', '192.168.1.1');
    
    // Remove one connection
    tracker.removeConnection('client-1', '192.168.1.1');
    
    // New connection should be allowed
    assert.strictEqual(tracker.addConnection('client-4', '192.168.1.1'), true);
  });

  test('getConnectionCount returns correct count', () => {
    tracker.addConnection('client-1', '192.168.1.1');
    tracker.addConnection('client-2', '192.168.1.1');
    
    assert.strictEqual(tracker.getConnectionCount('192.168.1.1'), 2);
  });

  test('getConnectionCount returns 0 for unknown IP', () => {
    assert.strictEqual(tracker.getConnectionCount('10.0.0.1'), 0);
  });
});
