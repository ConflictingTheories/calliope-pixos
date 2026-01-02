/**
 * High level Client Manager - Handles client connections, session recovery, and cleanup
 */
export default class ClientManager {
  constructor() {
    /** @type {Map<string, Client>} */
    this.clients = new Map();
    
    /** @type {Map<string, DisconnectedSession>} - Sessions awaiting reconnection */
    this.disconnectedSessions = new Map();
    
    /** Session timeout in ms (default: 5 minutes) */
    this.sessionTimeout = parseInt(process.env.SESSION_TIMEOUT) || 5 * 60 * 1000;
    
    // Cleanup expired sessions periodically
    this.cleanupInterval = setInterval(() => this.cleanupExpiredSessions(), 60000);
  }

  /**
   * @param {string} id 
   * @returns {Client|undefined}
   */
  getClient(id) {
    if (!this.clients.has(id)) return;
    return this.clients.get(id);
  }

  /**
   * @param {string} clientId 
   * @param {object} clientData 
   * @returns {void}
   */
  setClient(clientId, clientData) {
    // Check if this is a reconnection
    const existingSession = this.disconnectedSessions.get(clientId);
    
    if (existingSession) {
      // Reconnection - restore session state
      console.log(`[ClientManager] Client ${clientId} reconnected, restoring session`);
      const client = new Client(clientId, {
        ...clientData,
        zoneId: existingSession.zoneId,
        avatar: existingSession.avatar,
        sessionId: existingSession.sessionId
      });
      this.clients.set(clientId, client);
      this.disconnectedSessions.delete(clientId);
      
      client.sendMessage('reconnected', { 
        clientId,
        restored: true,
        zoneId: existingSession.zoneId
      });
      return;
    }
    
    // New connection
    const client = new Client(clientId, clientData);
    this.clients.set(clientId, client);

    console.log(`[ClientManager] Client ${clientId} connected`);
    client.sendMessage('connected', clientId);
  }

  /**
   * Handle client disconnect with session preservation
   * @param {string} clientId 
   * @returns {DisconnectedSession|null}
   */
  handleDisconnect(clientId) {
    const client = this.clients.get(clientId);
    if (!client) return null;
    
    // Preserve session for potential reconnection
    const session = {
      clientId,
      zoneId: client.getZoneId(),
      avatar: client.getAvatar(),
      sessionId: client.sessionId,
      disconnectTime: Date.now()
    };
    
    this.disconnectedSessions.set(clientId, session);
    this.clients.delete(clientId);
    
    console.log(`[ClientManager] Client ${clientId} disconnected, session preserved for ${this.sessionTimeout / 1000}s`);
    
    return session;
  }

  /**
   * Clean up expired disconnected sessions
   */
  cleanupExpiredSessions() {
    const now = Date.now();
    let cleaned = 0;
    
    for (const [clientId, session] of this.disconnectedSessions) {
      if (now - session.disconnectTime > this.sessionTimeout) {
        this.disconnectedSessions.delete(clientId);
        cleaned++;
      }
    }
    
    if (cleaned > 0) {
      console.log(`[ClientManager] Cleaned up ${cleaned} expired sessions`);
    }
  }

  /**
   * Check if a session exists for reconnection
   * @param {string} clientId 
   * @returns {boolean}
   */
  hasDisconnectedSession(clientId) {
    return this.disconnectedSessions.has(clientId);
  }

  /**
   * Get a disconnected session
   * @param {string} clientId 
   * @returns {DisconnectedSession|undefined}
   */
  getDisconnectedSession(clientId) {
    return this.disconnectedSessions.get(clientId);
  }

  /**
   * Destroy the client manager
   */
  destroy() {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
    }
    this.clients.clear();
    this.disconnectedSessions.clear();
  }
}

/**
 * @typedef {Object} DisconnectedSession
 * @property {string} clientId
 * @property {string|null} zoneId
 * @property {object|null} avatar
 * @property {string} sessionId
 * @property {number} disconnectTime
 */

/**
 * Websocket Client wrapper
 */
export class Client {
  constructor(id, clientData) {
    this.id = id;
    this.ws = clientData.ws;
    this.ip = clientData.ip || null;
    this.zoneId = clientData.zoneId || null;
    this.avatar = clientData.avatar || null;
    this.sessionId = clientData.sessionId || null;
    this.isGuest = clientData.isGuest || false;
    this.connectedAt = Date.now();
  }

  /**
 * 
 * @return {string} zoneId 
 */
  getZoneId() {
    return this.zoneId;
  }

  /**
   * 
   * @param {string} zoneId 
   */
  setZoneId(zoneId) {
    this.zoneId = zoneId;
  }

  /**
* 
* @return {string} 
*/
  getAvatar() {
    return this.avatar;
  }

  /**
   * 
   * @param {string} avatar 
   */
  setAvatar(avatar) {
    this.avatar = avatar;
  }

  /**
   * 
   * @returns {boolean}
   */
  isReady() {
    return this.ws && this.ws.readyState === 1;
  }

  /**
   * 
   * @param {string} type 
   * @param {any} payload 
   */
  sendMessage(type, payload) {
    this.ws.send(JSON.stringify({ type, payload }));
  }
}