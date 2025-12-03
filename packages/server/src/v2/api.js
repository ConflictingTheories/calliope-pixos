import { v4 as uuidv4 } from 'uuid';
import { WebSocketServer } from 'ws';
import ClientManager from './clientManager.js';
import ZoneHandler from './zoneHandler.js';
import { RateLimiter, MessageValidator, ConnectionTracker } from '../utils/security.js';

/**
 * PixoSpritz WebSocket API Server
 * 
 * Handles multiplayer connections, zone management, and action broadcasting.
 * Includes security features: rate limiting, input validation, connection tracking.
 */
export default class API {
  constructor() {
    const port = process.env.PORT || 8080;
    this.wss = new WebSocketServer({ port });
    this.clientManager = new ClientManager();
    this.zoneHandler = new ZoneHandler(this.clientManager);
    this.actionQueue = [];
    
    // Security: Rate limiting (60 messages per second per client)
    this.rateLimiter = new RateLimiter(60, 1000);
    
    // Security: Message validation
    this.messageValidator = new MessageValidator();
    
    // Security: Connection tracking (max 5 connections per IP)
    this.connectionTracker = new ConnectionTracker(5);
    
    console.log(`[API] WebSocket server initialized on port ${port}`);
  }

  /**
   * Setup Connection Listener for API
   */
  listen() {
    this.wss.on('connection', (ws, req) => {
      const clientId = uuidv4();
      const ip = req.socket.remoteAddress || 'unknown';
      
      // Security: Check connection limit per IP
      if (!this.connectionTracker.addConnection(clientId, ip)) {
        console.warn(`[API] Connection rejected from ${ip}: too many connections`);
        ws.close(4429, 'Too many connections from this IP');
        return;
      }
      
      // Store client with IP for cleanup
      this.clientManager.setClient(clientId, { ws, ip });
      console.log(`[API] Client ${clientId} connected from ${ip}`);

      ws.on('message', message => this.onMessage(clientId, message));

      ws.on('close', () => {
        const client = this.clientManager.getClient(clientId);
        if (client) {
          this.connectionTracker.removeConnection(clientId, client.ip || ip);
        }
        this.rateLimiter.remove(clientId);
        this.zoneHandler.handleDisconnect(clientId);
        console.log(`[API] Client ${clientId} disconnected`);
      });
      
      ws.on('error', (error) => {
        console.error(`[API] WebSocket error for client ${clientId}:`, error.message);
      });
    });
  }

  /**
   * Handle avatar updates
   * @param {string} clientId 
   * @param {any} payload 
   */
  handleUpdateAvatar(clientId, payload) {
    const client = this.clientManager.getClient(clientId);
    if (!client || !client.getZoneId()) return;

    // Update client's avatar data
    client.setAvatar({ ...client.getAvatar(), ...payload.avatar });

    // Broadcast avatar update to other clients in the same zone
    this.zoneHandler.broadcastToZone(
      client.getZoneId(), 
      { type: 'avatar-update', payload: { clientId, avatar: payload.avatar } }, 
      clientId
    );
  }

  /**
   * Handle incoming WebSocket messages
   * @param {string} clientId 
   * @param {any} message 
   */
  onMessage(clientId, message) {
    // Security: Rate limiting
    const rateLimitResult = this.rateLimiter.check(clientId);
    if (!rateLimitResult.allowed) {
      const client = this.clientManager.getClient(clientId);
      if (client?.ws?.readyState === 1) {
        client.ws.send(JSON.stringify({
          type: 'error',
          payload: {
            code: 'RATE_LIMIT',
            message: 'Too many requests',
            retryAfter: rateLimitResult.retryAfter
          }
        }));
      }
      return;
    }

    try {
      const data = JSON.parse(message);
      
      // Security: Validate message structure
      if (!data.type || typeof data.type !== 'string') {
        throw new Error('Invalid message: missing or invalid type');
      }
      
      // Security: Validate and sanitize payload
      if (data.payload) {
        const validation = this.messageValidator.validate(data.type, data.payload);
        if (!validation.valid) {
          const client = this.clientManager.getClient(clientId);
          if (client?.ws?.readyState === 1) {
            client.ws.send(JSON.stringify({
              type: 'error',
              payload: {
                code: 'VALIDATION_ERROR',
                message: 'Invalid message payload',
                errors: validation.errors
              }
            }));
          }
          return;
        }
        
        // Sanitize payload
        data.payload = this.messageValidator.sanitize(data.payload);
      }

      switch (data.type) {
        // Zone Handler
        case 'load-zone':
          this.zoneHandler.handleLoadZone(clientId, data.payload);
          break;
        case 'join-zone':
          this.zoneHandler.handleJoinZone(clientId, data.payload);
          break;
        case 'zone-state':
          this.zoneHandler.handleZoneState(clientId, data.payload);
          break;
        case 'zone-state-request':
          this.zoneHandler.handleZoneStateRequest(clientId, data.payload);
          break;

        // Player Avatar Actions
        case 'update-avatar':
          this.handleUpdateAvatar(clientId, data.payload);
          break;
        case 'action':
          this.actionQueue.push({ clientId, action: data.payload });
          break;
        default:
          console.warn(`[API] Unknown message type from ${clientId}: ${data.type}`);
      }
    } catch (error) {
      console.error(`[API] Failed to process message from ${clientId}:`, error.message);
      const client = this.clientManager.getClient(clientId);
      if (client?.ws?.readyState === 1) {
        client.ws.send(JSON.stringify({
          type: 'error',
          payload: {
            code: 'PARSE_ERROR',
            message: 'Failed to parse message'
          }
        }));
      }
    }
  }

  /**
   * Processes the action queue, broadcasting actions to the appropriate zones.
   */
  processActionQueue() {
    if (this.actionQueue?.length > 0) {
      const { clientId, action } = this.actionQueue.shift();
      const client = this.clientManager.getClient(clientId);
      if (client && client.getZoneId()) {
        this.zoneHandler.broadcastToZone(
          client.getZoneId(), 
          { type: 'action', payload: { clientId, ...action } }
        );
      }
    }
  }
  
  /**
   * Graceful shutdown
   */
  shutdown() {
    console.log('[API] Shutting down...');
    this.rateLimiter.destroy();
    this.wss.close();
  }
}

