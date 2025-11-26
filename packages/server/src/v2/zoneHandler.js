/**
 * High level Zone Manager - handles zone management logic - handling transitions, events, and players.
 */
export default class ZoneHandler {

  constructor(clientManager,) {
    /** @type {<string, object>[]}*/
    this.zones = new Map();

    /** @type {import('./clientManager.js').default} */
    this.clientManager = clientManager;
  }

  /**
   * 
   * @param {string} id 
   * @returns 
   */
  getZone(id) {
    if (!this.zones.has(id)) return;
    return this.zones.get(id);
  }

  /**
   * 
   * @param {string} id 
   * @param {any} zoneData 
   * @returns 
   */
  setZone(id, zoneData) {
    return this.zones.set(id, zoneData);
  }

  /**
   * 
   * @param {string} clientId 
   * @param {object} payload 
   * @returns 
   */
  handleLoadZone(clientId, payload) {
    /** @type{import("./clientManager.js").Client} */
    const client = this.clientManager.getClient(clientId);
    if (!client) return;

    const { zoneId } = payload;

    // Add to new zone
    if (!this.zones.has(zoneId)) {
      this.setZone(zoneId, new Set());
    }

    const zone = this.zones.get(zoneId);
    zone.add(clientId);

    client.sendMessage('zone-loaded', { zoneId });
    console.log(`Client ${clientId} loaded zone ${zoneId}`);
  }

  /**
   *
   * @param {string} clientId
   * @param {any} payload
   * @returns
   */
  handleJoinZone(clientId, payload) {
    /** @type{import("./clientManager.js").Client} */
    const client = this.clientManager.getClient(clientId);
    if (!client) return;

    const { zoneId, avatar } = payload;
    client.setAvatar(avatar);

    // Remove from previous zone if any
    if (client.getZoneId() && client.getZoneId() !== zoneId) {
      const oldZone = this.getZone(client.getZoneId());
      if (oldZone) {
        oldZone.delete(clientId);
        this.broadcastToZone(client.getZoneId(), { type: 'player-left', payload: { clientId } });
      }
    }

    // Add to new zone
    if (!this.zones.has(zoneId)) {
      this.setZone(zoneId, new Set());
    }
    const zone = this.getZone(zoneId);
    zone.add(clientId);
    client.setZoneId(zoneId);

    const playersInZone = Array.from(zone)
      .filter(id => id !== clientId)
      .map(id => ({ clientId: id, avatar: this.clientManager.getClient(id).getAvatar() }));

    client.sendMessage('zone-joined', { zoneId, players: playersInZone });

    // Inform others a player joined and broadcast current players list
    this.broadcastToZone(zoneId, { type: 'player-joined', payload: { client: { clientId, avatar } } }, clientId);

    const updatedPlayers = Array.from(zone).map(id => ({ clientId: id, avatar: this.clientManager.getClient(id).getAvatar() }));

    this.broadcastToZone(zoneId, { type: 'players-update', payload: { players: updatedPlayers } });

    console.log(`Client ${clientId} joined zone ${zoneId}`);

    // After joining, request zone state to sync all sprites
    setTimeout(() => {
      this.broadcastToZone(zoneId, { type: 'zone-state-request', payload: { zoneId } });
    }, 100); // Small delay to ensure join is processed
  }

  /**
   *
   * @param {string} clientId
   */
  handleDisconnect(clientId) {
    /** @type{import("./clientManager.js").Client} */
    const client = this.clientManager.getClient(clientId);
    if (client && client.getZoneId()) {
      const zone = this.getZone(client.getZoneId());
      if (zone) {
        zone.delete(clientId);
        this.broadcastToZone(client.getZoneId(), { type: 'player-left', payload: { clientId } });
        // Broadcast updated player list after disconnect
        const updatedPlayers = Array.from(zone).map(id => ({ clientId: id, avatar: this.clientManager.getClient(id).getAvatar() }));
        this.broadcastToZone(client.getZoneId(), { type: 'players-update', payload: { players: updatedPlayers } });
      }
    }
    this.clientManager.clients.delete(clientId);
    console.log(`Client ${clientId} disconnected`);
  }

  /**
   * 
   * @param {*} zoneId 
   * @param {*} message 
   * @param {*} excludeClientId 
   */
  broadcastToZone(zoneId, message, excludeClientId = null) {
    const zone = this.getZone(zoneId);
    if (zone) {
      for (const clientId of zone) {
        if (clientId !== excludeClientId) {
          const client = this.clientManager.getClient(clientId);
          if (client && client.isReady()) {
            try {
              client.sendMessage(message.type, message.payload);
              console.log(`Broadcast to ${clientId} in zone ${zoneId}: ${message.type || 'message'}`);
            } catch (e) {
              console.warn(`Failed to send to ${clientId}:`, e);
            }
          }
        }
      }
    }
  }

  handleZoneState(clientId, payload) {
    const client = this.clientManager.getClient(clientId);
    if (!client || !client.getZoneId()) return;

    // Broadcast zone state to all clients in the zone
    this.broadcastToZone(client.getZoneId(), { type: 'zone-state', payload: payload });
  }

  handleZoneStateRequest(clientId, payload) {
    /** @type{import("./clientManager.js").Client} */
    const client = this.clientManager.getClient(clientId);
    if (!client || !client.getZoneId()) return;

    const { zoneId } = payload;
    const zone = this.getZone(zoneId);
    if (!zone) return;

    // Collect all sprites in the zone from all clients
    const sprites = [];
    for (const cid of zone) {
      const c = this.clientManager.getClient(cid);
      if (c && c.getAvatar()) {
        const avatar = c.getAvatar();
        // Normalize avatar representation: some clients send pos under 'pos' or top-level x/y
        const x = (avatar.pos && avatar.pos.x) != null ? avatar.pos.x : (avatar.x != null ? avatar.x : 0);
        const y = (avatar.pos && avatar.pos.y) != null ? avatar.pos.y : (avatar.y != null ? avatar.y : 0);
        const z = (avatar.pos && avatar.pos.z) != null ? avatar.pos.z : (avatar.z != null ? avatar.z : 0);
        const id = avatar.id != null ? avatar.id : `avatar-${cid}`;
        sprites.push({ clientId: cid, id, objId: avatar.objId || cid, x, y, z, avatar: { ...avatar, x, y, z, id, clientId: cid } });
      }
    }

    // Send zone state to the requesting client
    if (client && client.isReady()) {
      client.sendMessage('zone-state', { zoneId, sprites });
    }
  }


}
