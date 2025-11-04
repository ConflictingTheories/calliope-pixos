/*                                                 *\
** ----------------------------------------------- **
**          Calliope - Pixos Game Engine   	       **
** ----------------------------------------------- **
**  Copyright (c) 2020-2025 - Kyle Derby MacInnis  **
**                                                 **
**    Any unauthorized distribution or transfer    **
**       of this work is strictly prohibited.      **
**                                                 **
**               All Rights Reserved.              **
** ----------------------------------------------- **
\*                                                 */

/**
 * NetworkManager - Handles WebSocket connections for multiplayer functionality.
 * Manages client-server communication, zone joining, player synchronization, and action broadcasting.
 */
export default class NetworkManager {
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
    /** @type {string|null} */
    this.zoneId = null;
    this.setAuthorityFromManifest();
  }

  // Lazy import for action loader fallback
  static _ActionLoader = null;

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
   * Safely stringify an object for logging (avoids circular refs).
   * @param {any} obj
   */
  safeStringify(obj) {
    try {
      return JSON.stringify(obj);
    } catch (e) {
      try {
        // Fallback: show a minimal shallow representation
        const out = {};
        Object.keys(obj || {}).forEach(k => {
          const v = obj[k];
          if (v && (typeof v === 'object')) out[k] = Array.isArray(v) ? `[Array(${v.length})]` : `{${v.constructor && v.constructor.name}}`;
          else out[k] = v;
        });
        return JSON.stringify(out);
      } catch (e2) {
        return String(obj);
      }
    }
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
  // Avoid serializing circular structures in the incoming message; log a safe preview instead.
  const preview = typeof message === 'string' ? (message.length > 1000 ? message.slice(0, 1000) + '... (truncated)' : message) : this.safeStringify(message);
  console.error('Failed to parse message from server. Parse error:', error);
  console.error('Raw message preview:', preview);
    }
  }

  /**
   * Loads a zone on the server.
   * @param {string} zoneId - The ID of the zone to load.
   * @param {object} zone - The zone object.
   */
  loadZone(zoneId, zone) {
    const zoneData = zone.getZoneData ? zone.getZoneData() : zone;
    // Try to remove circular references safely; fall back to a minimal payload if needed
    let cleanZoneData;
    try {
      cleanZoneData = JSON.parse(JSON.stringify(zoneData));
    } catch (e) {
      console.warn('Zone data contains circular refs, sending minimal zone info instead');
      cleanZoneData = { id: zoneId, name: zone && zone.name };
    }
    this.send('load-zone', { zoneId, zone: cleanZoneData });
  }

  /**
   * Joins a zone.
   * @param {string} zoneId - The ID of the zone to join.
   */
  joinZone(zoneId) {
    this.zoneId = zoneId;
    const avatar = this.engine.spritz.world.getAvatar();
    const avatarData = avatar.getAvatarData();
    // Build a safe, plain avatar payload to avoid circular refs (DOM/React objects may be attached)
    const cleanAvatarData = {
      id: avatarData.id || avatar.objId || avatar.id || 'avatar',
      templateLoaded: !!avatarData.templateLoaded,
      animFrame: avatarData.animFrame || 0,
      facing: avatarData.facing || 0,
      fixed: !!avatarData.fixed,
      isSelected: !!avatarData.isSelected,
      // simple position
      x: avatar && avatar.pos ? avatar.pos.x : (avatarData.pos && avatarData.pos.x) || 0,
      y: avatar && avatar.pos ? avatar.pos.y : (avatarData.pos && avatarData.pos.y) || 0,
      z: avatar && avatar.pos ? avatar.pos.z : (avatarData.pos && avatarData.pos.z) || 0,
      // include small useful bits, but avoid large or circular objects
      drawOffset: avatarData.drawOffset ? { x: avatarData.drawOffset.x, y: avatarData.drawOffset.y } : undefined,
      hotspotOffset: avatarData.hotspotOffset ? { x: avatarData.hotspotOffset.x, y: avatarData.hotspotOffset.y } : undefined,
      scale: avatarData.scale ? { x: avatarData.scale.x, y: avatarData.scale.y } : undefined
    };
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
        spriteId: sprite.id,
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
    // Handle zone changes to state - this could be from triggers in other zones
  }

  /**
   * Handles player joined message.
   * @param {object} payload - The payload containing client info.
   */
  handlePlayerJoined(payload) {
    if (payload.client.clientId === this.clientId) return;
    console.log(`Player ${payload.client.clientId} joined the zone`);
    // HUD / quick notification if available
    try {
      if (this.engine && this.engine.hud && typeof this.engine.hud.scrollText === 'function') {
        this.engine.hud.scrollText(`Player ${payload.client.clientId} joined`, true, { autoclose: true, duration: 3000 });
      }
    } catch (e) { /* ignore HUD errors */ }

    const world = this.engine.spritz.world;
    if (world) {
  // Use world.addRemoteAvatar to create a remote avatar representation
  world.addRemoteAvatar(payload.client.clientId, payload.client.avatar);
      // store a lightweight player entry keyed by clientId
      this.players.set(payload.client.clientId, Object.assign({}, payload.client.avatar, { clientId: payload.client.clientId }));
    }
  }

  /**
   * Handles player left message.
   * @param {object} payload - The payload containing clientId.
   */
  handlePlayerLeft(payload) {
    console.log(`Player ${payload.clientId} left the zone`);
    try {
      if (this.engine && this.engine.hud && typeof this.engine.hud.scrollText === 'function') {
        this.engine.hud.scrollText(`Player ${payload.clientId} left`, true, { autoclose: true, duration: 3000 });
      }
    } catch (e) { /* ignore HUD errors */ }
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
    try {
      if (this.engine && this.engine.hud && typeof this.engine.hud.scrollText === 'function') {
        this.engine.hud.scrollText(`Players in zone: ${payload.players.map(p=>p.clientId).join(', ')}`, true, { autoclose: true, duration: 3000 });
      }
    } catch (e) { /* ignore HUD errors */ }
    // Update local players map
  const existingPlayers = new Set(this.players.keys());
  const newPlayers = new Set(payload.players.map(p => p.clientId));

    // Remove players no longer in the zone
    for (const clientId of existingPlayers) {
      if (!newPlayers.has(clientId)) {
        // Remove remote avatar via world API
        const world = this.engine.spritz.world;
        if (world) world.removeRemoteAvatar(clientId);
        this.players.delete(clientId);
      }
    }

    // Add or update players
    payload.players.forEach(playerData => {
      if (playerData.clientId !== this.clientId) {
        const world = this.engine.spritz.world;
        if (world) {
          if (this.players.has(playerData.clientId)) {
            // Update remote avatar data
            world.updateRemoteAvatar(playerData.clientId, playerData.avatar);
            this.players.set(playerData.clientId, playerData.avatar);
          } else {
            world.addRemoteAvatar(playerData.clientId, playerData.avatar);
            this.players.set(playerData.clientId, playerData.avatar);
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
    if (payload.clientId === this.clientId) return; // Skip own actions to prevent double application
    console.log(`Received action from ${payload.clientId}:`, payload);
    const player = this.engine.spritz.world.remoteAvatars.get(payload.clientId); // Only handle remote avatars
    if (!player) return;
    try {
      let Action = null;
      const world = this.engine.spritz && this.engine.spritz.world;
      if (world && typeof world.actionFactory === 'function') {
        Action = world.actionFactory(payload.action);
      }
      // Fallback: use ActionLoader to construct action if factory missing
      if (!Action) {
        if (!NetworkManager._ActionLoader) NetworkManager._ActionLoader = require('@Engine/utils/loaders/ActionLoader.js').ActionLoader;
        const loader = new NetworkManager._ActionLoader(this.engine, payload.action, payload.params || {}, player, () => {});
        // loader.load returns an instance of Action (synchronously in our loader implementation)
        const instance = loader;
        // Some path: ActionLoader returns an Action instance via its load helper
        if (instance && instance.instances == null) {
          // unlikely shape; log and skip
          console.warn('ActionLoader returned unexpected instance for action', payload.action, instance);
        }
        // ActionLoader already enqueued the action on the sprite via its callbacks;
      } else {
        const action = new Action(player, ...Object.values(payload.params || {}));
        player.addAction(action);
      }
    } catch (e) {
      console.warn('Failed to handle action payload', payload, e);
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
      // Skip own avatar (identified by clientId)
      if (spriteData.clientId === this.clientId) return;

      try {
        // Prefer updating remote avatars by clientId to avoid id mismatch between clients and server
        if (spriteData.clientId && world.remoteAvatars && world.remoteAvatars.has(spriteData.clientId)) {
          // Use existing remote avatar mapping
          world.updateRemoteAvatar(spriteData.clientId, {
            x: spriteData.x,
            y: spriteData.y,
            z: spriteData.z || 0,
            facing: (spriteData.avatar && spriteData.avatar.facing) || spriteData.facing,
            animFrame: (spriteData.avatar && spriteData.avatar.animFrame) || spriteData.animFrame,
            ...((spriteData.avatar) || {})
          });
        } else {
          // Fallback: try to match by sprite id in zone spriteDict
          let existingSprite = zone.spriteDict[spriteData.id];
          if (existingSprite) {
            existingSprite.pos.x = spriteData.x;
            existingSprite.pos.y = spriteData.y;
            existingSprite.pos.z = spriteData.z || 0;
            if (spriteData.avatar) {
              if (spriteData.avatar.facing != null) existingSprite.facing = spriteData.avatar.facing;
              if (spriteData.avatar.animFrame != null) existingSprite.animFrame = spriteData.avatar.animFrame;
            }
          } else {
            // Create remote avatar using world.addRemoteAvatar if possible, providing clientId-aware data
            const avatarPayload = {
              id: spriteData.id || (`player-${spriteData.clientId}`),
              x: spriteData.x,
              y: spriteData.y,
              z: spriteData.z || 0,
              facing: (spriteData.avatar && spriteData.avatar.facing) || spriteData.facing,
              animFrame: (spriteData.avatar && spriteData.avatar.animFrame) || spriteData.animFrame,
              ...((spriteData.avatar) || {})
            };
            if (spriteData.clientId && typeof world.addRemoteAvatar === 'function') {
              world.addRemoteAvatar(spriteData.clientId, avatarPayload);
            } else if (typeof world.createAvatar === 'function') {
              world.createAvatar(avatarPayload);
            }
          }
        }
      } catch (e) {
        console.warn('Error handling zone state sprite update:', e);
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
    // Update remote avatar via world helper
    const world = this.engine.spritz.world;
    if (world) {
      const updated = world.updateRemoteAvatar(payload.clientId, payload.avatar);
      if (!updated) {
        // If avatar didn't exist, create it
        world.addRemoteAvatar(payload.clientId, { id: payload.avatar.id || `player-${payload.clientId}`, ...payload.avatar });
        this.players.set(payload.clientId, payload.avatar);
      } else {
        this.players.set(payload.clientId, payload.avatar);
      }
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
