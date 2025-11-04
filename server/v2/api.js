import { v4 as uuidv4 } from 'uuid';
import { WebSocketServer } from 'ws';
import ClientManager from './clientManager.js';
import ZoneHandler from './zoneHandler.js';

export default class API {
  constructor() {
    this.wss = new WebSocketServer({ port: 8080 });
    this.clientManager = new ClientManager();
    this.zoneHandler = new ZoneHandler(this.clientManager);
    this.actionQueue = [];
  }

  /**
   * Setup Connection Listener for API
   */
  listen() {
    this.wss.on('connection', (ws) => {
      const clientId = uuidv4();
      this.clientManager.setClient(clientId, { ws });

      ws.on('message', message => this.onMessage(clientId, message));

      ws.on('close', () => {
        this.zoneHandler.handleDisconnect(clientId);
      });
    });
  }

  /**
   * TODO - move into Avatar Manager Class
   * @param {string} clientId 
   * @param {any} payload 
   * @returns 
   */
  handleUpdateAvatar(clientId, payload) {
    const client = this.clientManager.getClient(clientId);
    if (!client || !client.getZoneId()) return;

    // Update client's avatar data
    client.setAvatar({ ...client.getAvatar(), ...payload.avatar });

    // Broadcast avatar update to other clients in the same zone
    console.log(`Broadcasting avatar-update from ${clientId} to zone ${client.getZoneId()}`);
    this.zoneHandler.broadcastToZone(client.getZoneId(), { type: 'avatar-update', payload: { clientId, avatar: payload.avatar } }, clientId);
  }

  /**
   * 
   * @param {string} clientId 
   * @param {any} message 
   */
  onMessage(clientId, message) {
    try {
      const data = JSON.parse(message);
      console.log(`Received message from ${clientId}:`, data);

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
          console.log(`Unknown message type: ${data.type}`);
      }
    } catch (error) {
      console.error(`Failed to parse message from ${clientId}:`, error);
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
        console.log(`Processing action from ${clientId} in zone ${client.getZoneId()}:`, action);
        this.zoneHandler.broadcastToZone(client.getZoneId(), { type: 'action', payload: { clientId, ...action } });
      }
    }
  }
}

