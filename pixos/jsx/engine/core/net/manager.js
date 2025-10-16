
class NetworkManager {
  constructor(engine) {
    this.engine = engine;
    this.ws = null;
    this.clientId = null;
    this.players = new Map();
  }

  connect(url) {
    if (this.ws) {
      this.disconnect();
    }

    this.ws = new WebSocket(url);

    this.ws.onopen = () => {
      console.log('WebSocket connection established');
    };

    this.ws.onmessage = (event) => {
      this.handleMessage(event.data);
    };

    this.ws.onclose = () => {
      console.log('WebSocket connection closed');
    };

    this.ws.onerror = (error) => {
      console.error('WebSocket error:', error);
    };
  }

  disconnect() {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }

  send(type, payload) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({ type, payload }));
    }
  }

  handleMessage(message) {
    try {
      const data = JSON.parse(message);
      console.log('Received message from server:', data);

      switch (data.type) {
        case 'connected':
          this.clientId = data.clientId;
          this.engine.store.set("clientId", this.clientId);
          console.log(`Connected to server with client ID: ${this.clientId}`);
          break;
        case 'zone-loaded':
          this.handleZoneLoaded(data.payload);
          break;
        case 'zone-change':
          this.handleZoneChange(data.payload);
          break;
        case 'zone-joined':
          this.handleZoneJoined(data.payload);
          break;
        case 'player-joined':
          this.handlePlayerJoined(data.payload);
          break;
        case 'player-left':
          this.handlePlayerLeft(data.payload);
          break;
        case 'action':
          this.handleAction(data.payload);
          break;
        default:
          console.log(`Unknown message type: ${data.type}`);
      }
    } catch (error) {
      console.error('Failed to parse message from server:', error);
    }
  }

  loadZone(zoneId, zone) {
    this.send('load-zone', { zoneId, zone: zone.getZoneData() });
  }

  joinZone(zoneId) {
    const avatar = this.engine.spritz.world.getAvatar();
    this.send('join-zone', { zoneId, avatar: avatar.getAvatarData() });
  }

  sendAction(action, sprite) {
    const data = {
      action: action.constructor.name.toLowerCase(),
      params: action.params,
      spriteId: sprite.id + '-' + this.clientId,
    };
    this.send('action', data);
  }

  handleZoneLoaded(payload) {
    console.log(`Loaded zone ${payload.zoneId}`);
    // todo -- add zone to list - establish zone state from payload
    // -- Flags and state can be managed jointly
  }

  handleZoneJoined(payload) {
    console.log(`Joined zone ${payload.zoneId} with players:`, payload.players);
    // Create avatars for existing players in the zone
    payload.players.forEach(playerData => this.handlePlayerJoined({ client: playerData }));
  }

  handleZoneChange(payload) {
    console.log(`Change zone ${payload.zoneId}`);
    // todo -- handle zone changes to state - this could be from triggers in other zones
  }

  handlePlayerJoined(payload) {
    if (payload.client.clientId === this.clientId) return;
    console.log(`Player ${payload.client.clientId} joined the zone`);

    const world = this.engine.spritz.world;
    if (world) {
      const newPlayer = world.createAvatar(payload.client.avatar);
      this.players.set(payload.client.clientId, newPlayer);
    }
  }

  handlePlayerLeft(payload) {
    console.log(`Player ${payload.clientId} left the zone`);
    const player = this.players.get(payload.clientId);
    if (player) {
      const world = this.engine.spritz.world;
      if (world) world.removeAvatar(player);
      this.players.delete(payload.clientId);
    }
  }

  handleAction(payload) {
    if (payload.clientId === this.clientId) return;
    console.log(`Received action from ${payload.clientId}:`, payload);
    const player = this.players.get(payload.clientId);
    if (player) {
      const Action = this.engine.spritz.world.actionFactory(payload.action);
      if (Action) {
        const action = new Action(player, ...Object.values(payload.params));
        player.addAction(action);
      }
    }
  }
}

export default NetworkManager;
