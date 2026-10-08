/**
 * ---------------------------------------------------------------
 *               PixoSpritz – Server – Authentication Middleware
 * ---------------------------------------------------------------
 * Copyright (c) 2022-2025 Kyle Derby MacInnis
 *
 * WebSocket authentication middleware for verifying JWT tokens on connection.
 */

import { JwtManager, TokenStore } from '../auth/JwtManager.js';

/**
 * Authentication middleware for WebSocket connections
 */
export class Authenticator {
  /**
   * @param {object} options - Authentication options
   * @param {boolean} options.required - Whether auth is required (default: true in production)
   * @param {string} options.secret - JWT secret (uses JWT_SECRET env var if not provided)
   * @param {number} options.tokenExpiry - Token expiry in seconds (default: 3600)
   */
  constructor(options = {}) {
    const isProduction = process.env.NODE_ENV === 'production';

    this.required = options.required ?? isProduction;
    this.jwtManager = new JwtManager(options.secret, options.tokenExpiry || 3600);
    this.tokenStore = new TokenStore();

    if (!this.required) {
      console.log('[Authenticator] Running in development mode - authentication optional');
    }
  }

  /**
   * Authenticate a WebSocket connection request
   * @param {object} request - HTTP upgrade request
   * @returns {{authenticated: boolean, userId?: string, sessionId?: string, error?: string}}
   */
  authenticate(request) {
    const token = this.jwtManager.extractToken(request);

    // If no token and auth not required, allow with guest status
    if (!token) {
      if (!this.required) {
        return {
          authenticated: true,
          isGuest: true,
          userId: `guest_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        };
      }
      return { authenticated: false, error: 'No token provided' };
    }

    // Check if token is revoked
    if (this.tokenStore.isRevoked(token)) {
      return { authenticated: false, error: 'Token has been revoked' };
    }

    // Verify token
    const result = this.jwtManager.verify(token);

    if (!result.valid) {
      return { authenticated: false, error: result.error };
    }

    return {
      authenticated: true,
      isGuest: false,
      userId: result.payload.userId,
      sessionId: result.payload.sessionId,
      payload: result.payload,
    };
  }

  /**
   * Generate a new token for a user
   * @param {string} userId - User identifier
   * @param {object} additionalClaims - Additional claims to include
   * @returns {string} JWT token
   */
  generateToken(userId, additionalClaims = {}) {
    return this.jwtManager.generate({
      userId,
      sessionId: `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      ...additionalClaims,
    });
  }

  /**
   * Revoke a token (for logout)
   * @param {string} token
   */
  revokeToken(token) {
    this.tokenStore.revoke(token);
  }

  /**
   * Cleanup resources
   */
  destroy() {
    this.tokenStore.destroy();
  }
}

/**
 * Simple authentication helper for anonymous/guest access
 * Used when JWT is not required but you still want user tracking
 */
export class GuestAuthenticator {
  /**
   * Generate a guest identifier
   * @returns {{userId: string, isGuest: boolean}}
   */
  static generateGuest() {
    return {
      userId: `guest_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      isGuest: true,
    };
  }
}

export default Authenticator;
