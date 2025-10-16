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
  if (client.zoneId) {
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

  broadcastToZone(zoneId, { type: 'player-joined', payload: { client: { clientId, avatar } } }, clientId);
  console.log(`Client ${clientId} joined zone ${zoneId}`);
}

function handleDisconnect(clientId) {
  const client = clients.get(clientId);
  if (client && client.zoneId) {
    const zone = zones.get(client.zoneId);
    if (zone) {
      zone.delete(clientId);
      broadcastToZone(client.zoneId, { type: 'player-left', payload: { clientId } });
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
