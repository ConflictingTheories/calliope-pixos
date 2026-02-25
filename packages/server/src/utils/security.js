/**
 * ---------------------------------------------------------------
 *               PixoSpritz – Server – Security Utilities
 * ---------------------------------------------------------------
 * Copyright (c) 2022-2025 Kyle Derby MacInnis
 *
 * Security utilities for the WebSocket server including:
 * - Rate limiting
 * - Input validation
 * - Message sanitization
 */

/**
 * Rate limiter for WebSocket connections.
 * Prevents clients from overwhelming the server with too many messages.
 */
export class RateLimiter {
  /**
   * @param {number} maxRequests - Maximum requests allowed in the time window
   * @param {number} windowMs - Time window in milliseconds
   */
  constructor(maxRequests = 60, windowMs = 1000) {
    this.maxRequests = maxRequests;
    this.windowMs = windowMs;
    /** @type {Map<string, {count: number, windowStart: number}>} */
    this.clients = new Map();

    // Clean up old entries periodically
    this.cleanupInterval = setInterval(() => this.cleanup(), 60000);
  }

  /**
   * Check if a client is allowed to make a request
   * @param {string} clientId - Unique client identifier
   * @returns {{allowed: boolean, retryAfter?: number}} Result with retry info
   */
  check(clientId) {
    const now = Date.now();
    let client = this.clients.get(clientId);

    if (!client) {
      client = { count: 1, windowStart: now };
      this.clients.set(clientId, client);
      return { allowed: true };
    }

    // Check if we're in a new window
    if (now - client.windowStart >= this.windowMs) {
      client.count = 1;
      client.windowStart = now;
      return { allowed: true };
    }

    // Increment count and check limit
    client.count++;

    if (client.count > this.maxRequests) {
      const retryAfter = this.windowMs - (now - client.windowStart);
      return { allowed: false, retryAfter };
    }

    return { allowed: true };
  }

  /**
   * Remove a client from tracking (on disconnect)
   * @param {string} clientId
   */
  remove(clientId) {
    this.clients.delete(clientId);
  }

  /**
   * Clean up old client entries
   */
  cleanup() {
    const now = Date.now();
    const oldThreshold = now - this.windowMs * 10;

    for (const [clientId, client] of this.clients) {
      if (client.windowStart < oldThreshold) {
        this.clients.delete(clientId);
      }
    }
  }

  /**
   * Destroy the rate limiter (cleanup interval)
   */
  destroy() {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
    }
  }
}

/**
 * Message validator for WebSocket payloads.
 * Ensures messages conform to expected schemas.
 */
export class MessageValidator {
  constructor() {
    // Define expected message schemas
    this.schemas = {
      'load-zone': {
        required: ['zoneId'],
        properties: {
          zoneId: { type: 'string', maxLength: 256 },
          zip: { type: 'string', maxLength: 256 },
        },
      },
      'join-zone': {
        required: ['zoneId'],
        properties: {
          zoneId: { type: 'string', maxLength: 256 },
        },
      },
      'zone-state': {
        required: ['zoneId'],
        properties: {
          zoneId: { type: 'string', maxLength: 256 },
          state: { type: 'object' },
        },
      },
      'zone-state-request': {
        required: ['zoneId'],
        properties: {
          zoneId: { type: 'string', maxLength: 256 },
        },
      },
      'update-avatar': {
        required: ['avatar'],
        properties: {
          avatar: {
            type: 'object',
            properties: {
              position: { type: 'object' },
              direction: { type: 'string', maxLength: 32 },
              animation: { type: 'string', maxLength: 64 },
              sprite: { type: 'string', maxLength: 256 },
            },
          },
        },
      },
      action: {
        required: ['actionType'],
        properties: {
          actionType: { type: 'string', maxLength: 64 },
          target: { type: 'string', maxLength: 256 },
          data: { type: 'object' },
        },
      },
    };
  }

  /**
   * Validate a message against its schema
   * @param {string} type - Message type
   * @param {object} payload - Message payload
   * @returns {{valid: boolean, errors: string[]}}
   */
  validate(type, payload) {
    const errors = [];
    const schema = this.schemas[type];

    // Unknown message type
    if (!schema) {
      return { valid: false, errors: [`Unknown message type: ${type}`] };
    }

    // Check required fields
    for (const field of schema.required || []) {
      if (!(field in payload)) {
        errors.push(`Missing required field: ${field}`);
      }
    }

    // Validate property types and constraints
    for (const [key, constraints] of Object.entries(schema.properties || {})) {
      if (key in payload) {
        const value = payload[key];

        // Type check
        if (constraints.type === 'string') {
          if (typeof value !== 'string') {
            errors.push(`Field ${key} must be a string`);
          } else if (constraints.maxLength && value.length > constraints.maxLength) {
            errors.push(`Field ${key} exceeds maximum length of ${constraints.maxLength}`);
          }
        } else if (constraints.type === 'object') {
          if (typeof value !== 'object' || value === null) {
            errors.push(`Field ${key} must be an object`);
          }
        } else if (constraints.type === 'number') {
          if (typeof value !== 'number' || isNaN(value)) {
            errors.push(`Field ${key} must be a number`);
          }
        }
      }
    }

    return { valid: errors.length === 0, errors };
  }

  /**
   * Sanitize a message payload to remove potentially dangerous content
   * @param {object} payload - Message payload
   * @returns {object} Sanitized payload
   */
  sanitize(payload) {
    // Deep clone and sanitize
    const sanitized = JSON.parse(JSON.stringify(payload));

    // Remove any prototype pollution attempts
    const dangerous = ['__proto__', 'constructor', 'prototype'];

    function cleanObject(obj) {
      if (typeof obj !== 'object' || obj === null) return obj;

      for (const key of Object.keys(obj)) {
        if (dangerous.includes(key)) {
          delete obj[key];
        } else if (typeof obj[key] === 'object') {
          cleanObject(obj[key]);
        } else if (typeof obj[key] === 'string') {
          // Basic XSS prevention for string values
          obj[key] = obj[key].replace(/</g, '&lt;').replace(/>/g, '&gt;').substring(0, 10000); // Limit string length
        }
      }

      return obj;
    }

    return cleanObject(sanitized);
  }
}

/**
 * Connection tracker for monitoring and limiting connections.
 */
export class ConnectionTracker {
  /**
   * @param {number} maxConnectionsPerIp - Maximum connections from a single IP
   */
  constructor(maxConnectionsPerIp = 5) {
    this.maxConnectionsPerIp = maxConnectionsPerIp;
    /** @type {Map<string, Set<string>>} */
    this.ipToClients = new Map();
  }

  /**
   * Track a new connection
   * @param {string} clientId - Client identifier
   * @param {string} ip - Client IP address
   * @returns {boolean} Whether the connection is allowed
   */
  addConnection(clientId, ip) {
    let clients = this.ipToClients.get(ip);

    if (!clients) {
      clients = new Set();
      this.ipToClients.set(ip, clients);
    }

    if (clients.size >= this.maxConnectionsPerIp) {
      return false;
    }

    clients.add(clientId);
    return true;
  }

  /**
   * Remove a connection
   * @param {string} clientId - Client identifier
   * @param {string} ip - Client IP address
   */
  removeConnection(clientId, ip) {
    const clients = this.ipToClients.get(ip);
    if (clients) {
      clients.delete(clientId);
      if (clients.size === 0) {
        this.ipToClients.delete(ip);
      }
    }
  }

  /**
   * Get connection count for an IP
   * @param {string} ip
   * @returns {number}
   */
  getConnectionCount(ip) {
    const clients = this.ipToClients.get(ip);
    return clients ? clients.size : 0;
  }
}

export default {
  RateLimiter,
  MessageValidator,
  ConnectionTracker,
};
