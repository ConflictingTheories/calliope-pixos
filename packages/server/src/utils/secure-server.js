/**
 * ---------------------------------------------------------------
 *               PixoSpritz – Server – TLS/HTTPS Configuration
 * ---------------------------------------------------------------
 * Copyright (c) 2022-2025 Kyle Derby MacInnis
 *
 * HTTPS/WSS server wrapper for secure WebSocket connections.
 * Supports both HTTP and HTTPS based on configuration.
 */

import https from 'https';
import http from 'http';
import fs from 'fs';
import path from 'path';

/**
 * Server factory for creating HTTP or HTTPS servers
 */
export class SecureServer {
  /**
   * Create a secure or insecure server based on configuration
   * @param {object} options
   * @param {string} options.certPath - Path to SSL certificate
   * @param {string} options.keyPath - Path to SSL private key
   * @param {string} options.caPath - Path to CA certificate (optional)
   * @param {boolean} options.forceHttps - Require HTTPS in production
   * @returns {{server: http.Server|https.Server, isSecure: boolean}}
   */
  static create(options = {}) {
    const certPath = options.certPath || process.env.SSL_CERT_PATH;
    const keyPath = options.keyPath || process.env.SSL_KEY_PATH;
    const caPath = options.caPath || process.env.SSL_CA_PATH;
    const isProduction = process.env.NODE_ENV === 'production';
    const forceHttps = options.forceHttps ?? isProduction;

    // Check if SSL files exist
    const hasCert = certPath && fs.existsSync(certPath);
    const hasKey = keyPath && fs.existsSync(keyPath);

    if (hasCert && hasKey) {
      try {
        const httpsOptions = {
          cert: fs.readFileSync(certPath),
          key: fs.readFileSync(keyPath)
        };

        // Add CA if provided
        if (caPath && fs.existsSync(caPath)) {
          httpsOptions.ca = fs.readFileSync(caPath);
        }

        console.log('[SecureServer] Creating HTTPS server with TLS');
        return {
          server: https.createServer(httpsOptions),
          isSecure: true
        };
      } catch (error) {
        console.error('[SecureServer] Failed to read SSL certificates:', error.message);
        
        if (forceHttps) {
          throw new Error('HTTPS required in production but SSL certificates are invalid');
        }
      }
    }

    if (forceHttps) {
      throw new Error(
        'HTTPS required in production. Set SSL_CERT_PATH and SSL_KEY_PATH environment variables.'
      );
    }

    console.log('[SecureServer] Creating HTTP server (no TLS)');
    console.warn('[SecureServer] WARNING: Running without TLS. Set SSL_CERT_PATH and SSL_KEY_PATH for secure connections.');
    
    return {
      server: http.createServer(),
      isSecure: false
    };
  }

  /**
   * Generate self-signed certificates for development
   * NOTE: These should NEVER be used in production
   * @param {string} outputDir - Directory to write certificates
   * @returns {Promise<{certPath: string, keyPath: string}>}
   */
  static async generateDevCerts(outputDir = './certs') {
    // This is a placeholder - in reality you'd use a library like node-forge
    // or call openssl via child_process
    console.warn('[SecureServer] Self-signed certificate generation not implemented.');
    console.warn('[SecureServer] For development, run:');
    console.warn('  openssl req -x509 -newkey rsa:4096 -keyout key.pem -out cert.pem -days 365 -nodes');
    
    return { certPath: null, keyPath: null };
  }
}

/**
 * WSS (WebSocket Secure) wrapper for existing WebSocket server
 */
export class WssWrapper {
  /**
   * Upgrade an existing WebSocketServer to use HTTPS
   * @param {object} options - Server options
   * @returns {object} Configuration for WebSocketServer
   */
  static getWssConfig(options = {}) {
    const { server, isSecure } = SecureServer.create(options);
    
    return {
      server,
      isSecure,
      perMessageDeflate: {
        zlibDeflateOptions: {
          chunkSize: 1024,
          memLevel: 7,
          level: 3
        },
        zlibInflateOptions: {
          chunkSize: 10 * 1024
        },
        clientNoContextTakeover: true,
        serverNoContextTakeover: true,
        serverMaxWindowBits: 10,
        concurrencyLimit: 10,
        threshold: 1024
      }
    };
  }
}

export default SecureServer;
