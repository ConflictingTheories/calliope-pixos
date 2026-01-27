/**
 * ---------------------------------------------------------------
 *               PixoSpritz – Server – JWT Authentication
 * ---------------------------------------------------------------
 * Copyright (c) 2022-2025 Kyle Derby MacInnis
 *
 * JWT (JSON Web Token) authentication manager for secure WebSocket connections.
 * Provides token generation, verification, and refresh capabilities.
 */

import crypto from 'crypto';

/**
 * JWT Manager - Handles token generation and verification
 * Uses HMAC-SHA256 for signing (no external dependencies)
 */
export class JwtManager {
  /**
   * @param {string} secret - Secret key for signing tokens
   * @param {number} expiresIn - Token expiration in seconds (default: 1 hour)
   */
  constructor(secret = null, expiresIn = 3600) {
    this.secret = secret || process.env.JWT_SECRET || this._generateDefaultSecret();
    this.expiresIn = expiresIn;
    this.algorithm = 'HS256';

    if (!process.env.JWT_SECRET && !secret) {
      console.warn(
        '[JwtManager] WARNING: Using auto-generated secret. Set JWT_SECRET environment variable in production.'
      );
    }
  }

  /**
   * Generate a random secret for development
   * @private
   */
  _generateDefaultSecret() {
    return crypto.randomBytes(32).toString('hex');
  }

  /**
   * Base64url encode
   * @private
   */
  _base64UrlEncode(data) {
    const json = typeof data === 'string' ? data : JSON.stringify(data);
    return Buffer.from(json)
      .toString('base64')
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '');
  }

  /**
   * Base64url decode
   * @private
   */
  _base64UrlDecode(str) {
    str = str.replace(/-/g, '+').replace(/_/g, '/');
    while (str.length % 4) str += '=';
    return Buffer.from(str, 'base64').toString('utf8');
  }

  /**
   * Create HMAC-SHA256 signature
   * @private
   */
  _sign(data) {
    return crypto
      .createHmac('sha256', this.secret)
      .update(data)
      .digest('base64')
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '');
  }

  /**
   * Generate a JWT token for a user/session
   * @param {object} payload - Token payload (userId, sessionId, etc.)
   * @returns {string} JWT token
   */
  generate(payload) {
    const now = Math.floor(Date.now() / 1000);

    const header = {
      alg: this.algorithm,
      typ: 'JWT',
    };

    const tokenPayload = {
      ...payload,
      iat: now,
      exp: now + this.expiresIn,
    };

    const headerEncoded = this._base64UrlEncode(header);
    const payloadEncoded = this._base64UrlEncode(tokenPayload);
    const signature = this._sign(`${headerEncoded}.${payloadEncoded}`);

    return `${headerEncoded}.${payloadEncoded}.${signature}`;
  }

  /**
   * Verify and decode a JWT token
   * @param {string} token - JWT token to verify
   * @returns {{valid: boolean, payload?: object, error?: string}}
   */
  verify(token) {
    if (!token || typeof token !== 'string') {
      return { valid: false, error: 'Token is required' };
    }

    const parts = token.split('.');
    if (parts.length !== 3) {
      return { valid: false, error: 'Invalid token format' };
    }

    const [headerEncoded, payloadEncoded, signature] = parts;

    // Verify signature
    const expectedSignature = this._sign(`${headerEncoded}.${payloadEncoded}`);
    if (signature !== expectedSignature) {
      return { valid: false, error: 'Invalid signature' };
    }

    try {
      const payload = JSON.parse(this._base64UrlDecode(payloadEncoded));

      // Check expiration
      const now = Math.floor(Date.now() / 1000);
      if (payload.exp && payload.exp < now) {
        return { valid: false, error: 'Token expired' };
      }

      return { valid: true, payload };
    } catch (error) {
      return { valid: false, error: 'Invalid token payload' };
    }
  }

  /**
   * Refresh a token (generate new token with extended expiration)
   * @param {string} token - Existing valid token
   * @returns {{success: boolean, token?: string, error?: string}}
   */
  refresh(token) {
    const result = this.verify(token);

    if (!result.valid) {
      return { success: false, error: result.error };
    }

    // Remove timing claims before regenerating
    const { iat, exp, ...payload } = result.payload;
    const newToken = this.generate(payload);

    return { success: true, token: newToken };
  }

  /**
   * Extract token from various sources (query param, header)
   * @param {object} request - HTTP request object
   * @returns {string|null} Token or null
   */
  extractToken(request) {
    // Check query params (for WebSocket)
    const url = new URL(request.url, 'http://localhost');
    const queryToken = url.searchParams.get('token');
    if (queryToken) return queryToken;

    // Check Authorization header
    const authHeader = request.headers?.authorization;
    if (authHeader?.startsWith('Bearer ')) {
      return authHeader.substring(7);
    }

    return null;
  }
}

/**
 * Token store for tracking active tokens (optional revocation support)
 */
export class TokenStore {
  constructor() {
    /** @type {Set<string>} */
    this.revokedTokens = new Set();

    // Cleanup expired revoked tokens periodically
    this.cleanupInterval = setInterval(() => this.cleanup(), 3600000); // Every hour
  }

  /**
   * Revoke a token
   * @param {string} token
   */
  revoke(token) {
    this.revokedTokens.add(token);
  }

  /**
   * Check if a token is revoked
   * @param {string} token
   * @returns {boolean}
   */
  isRevoked(token) {
    return this.revokedTokens.has(token);
  }

  /**
   * Cleanup revoked tokens (called periodically)
   */
  cleanup() {
    // In a real implementation, you'd check expiration times
    // For now, just limit the set size
    if (this.revokedTokens.size > 10000) {
      const tokens = Array.from(this.revokedTokens);
      tokens.slice(0, 5000).forEach(t => this.revokedTokens.delete(t));
    }
  }

  /**
   * Destroy the token store
   */
  destroy() {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
    }
  }
}

export default JwtManager;
