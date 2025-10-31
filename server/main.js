const { WebSocketServer } = require('ws');
const { v4: uuidv4 } = require('uuid');

const wss = new WebSocketServer({ port: 8080 });

const clients = new Map();
const zones = new Map();
const actionQueue = [];

console.log('WebSocket server started on port 8080');

wss.on('connection', (ws) => {
  const clientId = uuidv4();
  clients.set(clientId, { ws });
  console.log(`Client ${clientId} connected`);

  ws.send(JSON.stringify({ type: 'connected', clientId }));

  ws.on('message', (message) => {
    try {
      const data = JSON.parse(message);
      console.log(`Received message from ${clientId}:`, data);

      switch (data.type) {
        case 'load-zone':
          handleLoadZone(clientId, data.payload);
          break;
        case 'join-zone':
          handleJoinZone(clientId, data.payload);
          break;
        case 'zone-state':
          handleZoneState(clientId, data.payload);
          break;
        case 'zone-state-request':
          handleZoneStateRequest(clientId, data.payload);
          break;
        case 'update-avatar':
          handleUpdateAvatar(clientId, data.payload);
          break;
        case 'action':
          actionQueue.push({ clientId, action: data.payload });
          break;
        default:
          console.log(`Unknown message type: ${data.type}`);
      }
    } catch (error) {
      console.error(`Failed to parse message from ${clientId}:`, error);
    }
  });

  ws.on('close', () => {
    handleDisconnect(clientId);
  });
});

function handleLoadZone(clientId, payload) {
  const client = clients.get(clientId);
  if (!client) return;

  const { zoneId } = payload;

  // Add to new zone
  if (!zones.has(zoneId)) {
    zones.set(zoneId, new Set());
  }
  const zone = zones.get(zoneId);
  zone.add(clientId);

  client.ws.send(JSON.stringify({ type: 'zone-loaded', payload: { zoneId } }));
  console.log(`Client ${clientId} loaded zone ${zoneId}`);
}

function handleJoinZone(clientId, payload) {
  const client = clients.get(clientId);
  if (!client) return;

  const { zoneId, avatar } = payload;
  client.avatar = avatar;

  // Remove from previous zone if any
  if (client.zoneId && client.zoneId !== zoneId) {
    const oldZone = zones.get(client.zoneId);
    if (oldZone) {
      oldZone.delete(clientId);
      broadcastToZone(client.zoneId, { type: 'player-left', payload: { clientId } });
    }
  }

  // Add to new zone
  if (!zones.has(zoneId)) {
    zones.set(zoneId, new Set());
  }
  const zone = zones.get(zoneId);
  zone.add(clientId);
  client.zoneId = zoneId;

  const playersInZone = Array.from(zone)
    .filter(id => id !== clientId)
    .map(id => ({ clientId: id, avatar: clients.get(id).avatar }));

  client.ws.send(JSON.stringify({ type: 'zone-joined', payload: { zoneId, players: playersInZone } }));
  // Inform others a player joined and broadcast current players list
  broadcastToZone(zoneId, { type: 'player-joined', payload: { client: { clientId, avatar } } }, clientId);
  const updatedPlayers = Array.from(zone).map(id => ({ clientId: id, avatar: clients.get(id).avatar }));
  broadcastToZone(zoneId, { type: 'players-update', payload: { players: updatedPlayers } });
  console.log(`Client ${clientId} joined zone ${zoneId}`);

  // After joining, request zone state to sync all sprites
  setTimeout(() => {
    broadcastToZone(zoneId, { type: 'zone-state-request', payload: { zoneId } });
  }, 100); // Small delay to ensure join is processed
}

function handleDisconnect(clientId) {
  const client = clients.get(clientId);
  if (client && client.zoneId) {
    const zone = zones.get(client.zoneId);
    if (zone) {
      zone.delete(clientId);
      broadcastToZone(client.zoneId, { type: 'player-left', payload: { clientId } });
  // Broadcast updated player list after disconnect
  const updatedPlayers = Array.from(zone).map(id => ({ clientId: id, avatar: clients.get(id).avatar }));
  broadcastToZone(client.zoneId, { type: 'players-update', payload: { players: updatedPlayers } });
    }
  }
  clients.delete(clientId);
  console.log(`Client ${clientId} disconnected`);
}

function broadcastToZone(zoneId, message, excludeClientId = null) {
  const zone = zones.get(zoneId);
  if (zone) {
    const messageString = JSON.stringify(message);
    for (const clientId of zone) {
      if (clientId !== excludeClientId) {
        const client = clients.get(clientId);
        if (client && client.ws.readyState === client.ws.OPEN) {
          client.ws.send(messageString);
        }
      }
    }
  }
}

function handleZoneState(clientId, payload) {
  const client = clients.get(clientId);
  if (!client || !client.zoneId) return;

  // Broadcast zone state to all clients in the zone
  broadcastToZone(client.zoneId, { type: 'zone-state', payload: payload });
}

function handleZoneStateRequest(clientId, payload) {
  const client = clients.get(clientId);
  if (!client || !client.zoneId) return;

  const { zoneId } = payload;
  const zone = zones.get(zoneId);
  if (!zone) return;

  // Collect all sprites in the zone from all clients
  const sprites = [];
  for (const cid of zone) {
    const c = clients.get(cid);
    if (c && c.avatar) {
  // Normalize avatar representation: some clients send pos under 'pos' or top-level x/y
  const x = (c.avatar.pos && c.avatar.pos.x) != null ? c.avatar.pos.x : (c.avatar.x != null ? c.avatar.x : 0);
  const y = (c.avatar.pos && c.avatar.pos.y) != null ? c.avatar.pos.y : (c.avatar.y != null ? c.avatar.y : 0);
  const z = (c.avatar.pos && c.avatar.pos.z) != null ? c.avatar.pos.z : (c.avatar.z != null ? c.avatar.z : 0);
  const id = c.avatar.id != null ? c.avatar.id : `player-${cid}`;
  sprites.push({ clientId: cid, id, objId: c.avatar.objId || cid, x, y, z, avatar: { ...c.avatar, x, y, z, id, clientId: cid } });
    }
  }

  // Send zone state to the requesting client
  const ws = clients.get(clientId).ws;
  if (ws.readyState === ws.OPEN) {
    ws.send(JSON.stringify({ type: 'zone-state', payload: { zoneId, sprites } }));
  }
}

function handleUpdateAvatar(clientId, payload) {
  const client = clients.get(clientId);
  if (!client || !client.zoneId) return;

  // Update client's avatar data
  client.avatar = { ...client.avatar, ...payload.avatar };

  // Broadcast avatar update to other clients in the same zone
  broadcastToZone(client.zoneId, { type: 'avatar-update', payload: { clientId, avatar: payload.avatar } }, clientId);
}

/**
 * Processes the action queue, broadcasting actions to the appropriate zones.
 */
function processActionQueue() {
  if (actionQueue.length > 0) {
    const { clientId, action } = actionQueue.shift();
    const client = clients.get(clientId);
    if (client && client.zoneId) {
      console.log(`Processing action from ${clientId} in zone ${client.zoneId}:`, action);
      broadcastToZone(client.zoneId, { type: 'action', payload: { clientId, ...action } });
    }
  }
}

setInterval(processActionQueue, 100); // Process queue every 100ms
