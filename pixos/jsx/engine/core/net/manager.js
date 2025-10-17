
/**
 * NetworkManager - Handles WebSocket connections for multiplayer functionality.
 * Manages client-server communication, zone joining, player synchronization, and action broadcasting.
 */
class NetworkManager {
  /**
   * Creates an instance of NetworkManager.
   * @param {import('../index.js').default} engine - The main game engine instance.
   */
  constructor(engine) {
    /** @type {import('../index.js').default} */
    this.engine = engine;
    /** @type {WebSocket|null} */
    this.ws = null;
    /** @type {string|null} */
    this.clientId = null;
    /** @type {Map<string, object>} */
    this.players = new Map();
    /** @type {string} */
    this.authority = 'server'; // Default to server authority, can be overridden by manifest
    this.setAuthorityFromManifest();
  }

  /**
   * Establishes a WebSocket connection to the server.
   * @param {string} url - The WebSocket URL to connect to.
   * @returns {Promise<void>} A promise that resolves when the connection is established.
   */
  async connect(url) {
    if (this.ws) {
      this.disconnect();
    }

    this.ws = new WebSocket(url);

    return new Promise((resolve, reject) => {
      this.ws.onopen = () => {
        console.log('WebSocket connection established');
        resolve();
      };

      this.ws.onmessage = (event) => {
        this.handleMessage(event.data);
      };

      this.ws.onclose = () => {
        console.log('WebSocket connection closed');
      };

      this.ws.onerror = (error) => {
        console.error('WebSocket error:', error);
        reject(error);
      };
    });
  }

  /**
   * Disconnects the WebSocket connection.
   */
  disconnect() {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }

  /**
   * Sends a message to the server.
   * @param {string} type - The message type.
   * @param {object} payload - The message payload.
   */
  send(type, payload) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({ type, payload }));
    }
  }

  /**
   * Handles incoming messages from the server.
   * @param {string} message - The raw message string.
   */
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
        case 'players-update':
          this.handlePlayersUpdate(data.payload);
          break;
        case 'zone-state':
          this.handleZoneState(data.payload);
          break;
        case 'zone-state-request':
          // Server-side only, ignore
          break;
        case 'avatar-update':
          this.handleAvatarUpdate(data.payload);
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

  /**
   * Loads a zone on the server.
   * @param {string} zoneId - The ID of the zone to load.
   * @param {object} zone - The zone object.
   */
  loadZone(zoneId, zone) {
    const zoneData = zone.getZoneData ? zone.getZoneData() : zone;
    // Remove circular references
    const cleanZoneData = JSON.parse(JSON.stringify(zoneData));
    this.send('load-zone', { zoneId, zone: cleanZoneData });
  }

  /**
   * Joins a zone.
   * @param {string} zoneId - The ID of the zone to join.
   */
  joinZone(zoneId) {
    const avatar = this.engine.spritz.world.getAvatar();
    const avatarData = avatar.getAvatarData();
    // Remove circular references
    const cleanAvatarData = JSON.parse(JSON.stringify(avatarData));
    this.send('join-zone', { zoneId, avatar: cleanAvatarData });
  }

  /**
   * Sends an action to the server or handles locally based on authority.
   * @param {object} action - The action object.
   * @param {object} sprite - The sprite performing the action.
   */
  sendAction(action, sprite) {
    if (this.authority === 'server') {
      const data = {
        action: action.constructor.name.toLowerCase(),
        params: action.params,
        spriteId: sprite.id + '-' + this.clientId,
      };
      this.send('action', data);
    } else {
      // Client authority: handle locally and broadcast
      this.handleAction({ clientId: this.clientId, action: action.constructor.name.toLowerCase(), params: action.params, spriteId: sprite.id });
    }
  }

  /**
   * Updates the client's avatar position on the server.
   * @param {object} avatar - The avatar sprite.
   */
  updateAvatarPosition(avatar) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      const data = {
        avatar: {
          id: avatar.id,
          x: avatar.pos.x,
          y: avatar.pos.y,
          z: avatar.pos.z,
          facing: avatar.facing
        }
      };
      // Remove circular references
      const cleanData = JSON.parse(JSON.stringify(data));
      this.send('update-avatar', cleanData);
    }
  }

  /**
   * Handles zone loaded message.
   * @param {object} payload - The payload containing zoneId.
   */
  handleZoneLoaded(payload) {
    console.log(`Loaded zone ${payload.zoneId}`);
    // Automatically join the zone after loading
    this.joinZone(payload.zoneId);
  }

  /**
   * Handles zone joined message.
   * @param {object} payload - The payload containing zoneId and players.
   */
  handleZoneJoined(payload) {
    console.log(`Joined zone ${payload.zoneId} with players:`, payload.players);
    // Create avatars for existing players in the zone
    payload.players.forEach(playerData => this.handlePlayerJoined({ client: playerData }));
    // Request zone state from server to sync all sprites
    this.send('zone-state-request', { zoneId: payload.zoneId });
  }

  getZoneSprites(zoneId) {
    const world = this.engine.spritz.world;
    if (!world) return [];
    const zone = world.getZoneById(zoneId);
    if (!zone) return [];
    return zone.spriteList.map(sprite => ({
      id: sprite.id,
      objId: sprite.objId,
      x: sprite.pos.x,
      y: sprite.pos.y,
      z: sprite.pos.z,
      avatar: sprite.getAvatarData ? sprite.getAvatarData() : sprite
    }));
  }

  /**
   * Handles zone change message.
   * @param {object} payload - The payload containing zoneId.
   */
  handleZoneChange(payload) {
    console.log(`Change zone ${payload.zoneId}`);
    // TODO: Handle zone changes to state - this could be from triggers in other zones
  }

  /**
   * Handles player joined message.
   * @param {object} payload - The payload containing client info.
   */
  handlePlayerJoined(payload) {
    if (payload.client.clientId === this.clientId) return;
    console.log(`Player ${payload.client.clientId} joined the zone`);

    const world = this.engine.spritz.world;
    if (world) {
      const newPlayer = world.createAvatar(payload.client.avatar);
      this.players.set(payload.client.clientId, newPlayer);
    }
  }

  /**
   * Handles player left message.
   * @param {object} payload - The payload containing clientId.
   */
  handlePlayerLeft(payload) {
    console.log(`Player ${payload.clientId} left the zone`);
    const player = this.players.get(payload.clientId);
    if (player) {
      const world = this.engine.spritz.world;
      if (world) world.removeAvatar(player);
      this.players.delete(payload.clientId);
    }
  }

  /**
   * Handles players update message.
   * @param {object} payload - The payload containing updated players list.
   */
  handlePlayersUpdate(payload) {
    console.log('Players update:', payload.players);
    // Update local players map
    const existingPlayers = new Set(this.players.keys());
    const newPlayers = new Set(payload.players.map(p => p.clientId));

    // Remove players no longer in the zone
    for (const clientId of existingPlayers) {
      if (!newPlayers.has(clientId)) {
        const player = this.players.get(clientId);
        if (player) {
          const world = this.engine.spritz.world;
          if (world) world.removeAvatar(player);
          this.players.delete(clientId);
        }
      }
    }

    // Add or update players
    payload.players.forEach(playerData => {
      if (playerData.clientId !== this.clientId) {
        const world = this.engine.spritz.world;
        if (world) {
          if (this.players.has(playerData.clientId)) {
            // Update existing player avatar if needed
            const existingPlayer = this.players.get(playerData.clientId);
            // Assuming avatar data can be updated, but for simplicity, recreate if different
            if (JSON.stringify(existingPlayer.getAvatarData()) !== JSON.stringify(playerData.avatar)) {
              world.removeAvatar(existingPlayer);
              const newPlayer = world.createAvatar(playerData.avatar);
              this.players.set(playerData.clientId, newPlayer);
            }
          } else {
            const newPlayer = world.createAvatar(playerData.avatar);
            this.players.set(playerData.clientId, newPlayer);
          }
        }
      }
    });
  }

  /**
   * Handles action message.
   * @param {object} payload - The payload containing action details.
   */
  handleAction(payload) {
    if (payload.clientId === this.clientId && this.authority === 'server') return; // Avoid echo for server authority
    console.log(`Received action from ${payload.clientId}:`, payload);
    const player = this.players.get(payload.clientId) || this.engine.spritz.world.getAvatar(); // For own actions in client authority
    if (player) {
      const Action = this.engine.spritz.world.actionFactory(payload.action);
      if (Action) {
        const action = new Action(player, ...Object.values(payload.params));
        player.addAction(action);
      }
    }
  }

  /**
   * Handles zone state message to synchronize all sprites in the zone.
   * @param {object} payload - The payload containing zoneId and sprites.
   */
  handleZoneState(payload) {
    console.log(`Received zone state for ${payload.zoneId}:`, payload.sprites);
    const world = this.engine.spritz.world;
    if (!world) return;

    const zone = world.getZoneById(payload.zoneId);
    if (!zone) return;

    // Update or create sprites based on zone state
    payload.sprites.forEach(spriteData => {
      // Skip own avatar to avoid duplication
      if (spriteData.id === 'avatar') return;

      let existingSprite = zone.spriteDict[spriteData.id];
      if (existingSprite) {
        // Update existing sprite position/data
        existingSprite.pos.x = spriteData.x;
        existingSprite.pos.y = spriteData.y;
        existingSprite.pos.z = spriteData.z || 0;
        // Update other properties as needed
      } else {
        // Create new sprite/avatar
        const avatarData = {
          id: spriteData.id,
          x: spriteData.x,
          y: spriteData.y,
          z: spriteData.z || 0,
          ...spriteData.avatar
        };
        world.createAvatar(avatarData);
      }
    });
  }

  /**
   * Sets the network authority from the manifest.
   */
  setAuthorityFromManifest() {
    if (this.engine && this.engine.spritz && this.engine.spritz.manifest && this.engine.spritz.manifest.network) {
      this.authority = this.engine.spritz.manifest.network.authority || 'server';
    }
  }

  /**
   * Handles avatar update message to synchronize avatar positions.
   * @param {object} payload - The payload containing clientId and avatar data.
   */
  handleAvatarUpdate(payload) {
    console.log(`Received avatar update for ${payload.clientId}:`, payload.avatar);
    const player = this.players.get(payload.clientId);
    if (player) {
      // Update player avatar position and properties
      player.pos.x = payload.avatar.x;
      player.pos.y = payload.avatar.y;
      player.pos.z = payload.avatar.z;
      player.facing = payload.avatar.facing;
      // Update other properties as needed
    }
  }

  /**
   * Sets the network authority.
   * @param {string} authority - 'server' or 'client'.
   */
  setAuthority(authority) {
    this.authority = authority;
  }
}

export default NetworkManager;
