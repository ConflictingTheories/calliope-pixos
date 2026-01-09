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
 * StateManager - Handles game state persistence, checkpoints, and save/load functionality.
 * 
 * Features:
 * - Serialize/deserialize full game state
 * - In-memory checkpoint system with rolling buffer
 * - Persistent save slots via IndexedDB
 * - Cross-game compatible save format (.pxsave)
 * - Autosave and emergency save on unload
 * - Export/import save files
 */
export default class StateManager {
  /**
   * Creates an instance of StateManager.
   * @param {object} engine - The game engine instance
   */
  constructor(engine) {
    /** @type {object} */
    this.engine = engine;
    
    /** @type {Array<{label: string, timestamp: number, state: object}>} */
    this.checkpoints = [];
    
    /** @type {number} Maximum number of checkpoints to keep */
    this.maxCheckpoints = 5;
    
    /** @type {number|null} Autosave interval ID */
    this.autosaveInterval = null;
    
    /** @type {number} Autosave interval in milliseconds (default: 5 minutes) */
    this.autosaveIntervalMs = 5 * 60 * 1000;
    
    /** @type {number} Game start timestamp for play time tracking */
    this.sessionStartTime = Date.now();
    
    /** @type {number} Accumulated play time from previous sessions */
    this.accumulatedPlayTime = 0;
    
    /** @type {string} Current game ID from manifest */
    this.gameId = 'unknown';
    
    /** @type {string} Current game version */
    this.gameVersion = '1.0.0';
    
    /** @type {boolean} Whether state manager is initialized */
    this.initialized = false;
    
    // Bind methods
    this.handleBeforeUnload = this.handleBeforeUnload.bind(this);
  }

  /**
   * Initialize the state manager
   * @param {object} options - Configuration options
   * @param {string} options.gameId - Game identifier
   * @param {string} options.gameVersion - Game version
   * @param {number} [options.autosaveInterval] - Autosave interval in ms
   * @param {number} [options.maxCheckpoints] - Max checkpoints to keep
   */
  async init(options = {}) {
    if (this.initialized) return;
    
    if (options.gameId) this.gameId = options.gameId;
    if (options.gameVersion) this.gameVersion = options.gameVersion;
    if (options.autosaveInterval) this.autosaveIntervalMs = options.autosaveInterval;
    if (options.maxCheckpoints) this.maxCheckpoints = options.maxCheckpoints;
    
    // Setup emergency save on page unload
    if (typeof window !== 'undefined') {
      window.addEventListener('beforeunload', this.handleBeforeUnload);
    }
    
    this.initialized = true;
    console.log('[StateManager] Initialized for game:', this.gameId);
  }

  /**
   * Cleanup and shutdown
   */
  destroy() {
    this.stopAutosave();
    if (typeof window !== 'undefined') {
      window.removeEventListener('beforeunload', this.handleBeforeUnload);
    }
    this.initialized = false;
  }

  /**
   * Handle before unload event - emergency save
   * @param {Event} event 
   */
  handleBeforeUnload(event) {
    try {
      this.saveSync('emergency');
    } catch (err) {
      console.warn('[StateManager] Emergency save failed:', err);
    }
  }

  // ==================== SERIALIZATION ====================

  /**
   * Serialize the current game state
   * @returns {object} Serialized game state in .pxsave format
   */
  serialize() {
    const engine = this.engine;
    const store = engine.store;
    const world = engine.world;
    
    // Calculate current play time
    const currentPlayTime = this.accumulatedPlayTime + (Date.now() - this.sessionStartTime);
    
    // Build save data following .pxsave schema
    const saveData = {
      // Header
      version: '1.0.0',
      format: 'pxsave',
      gameId: this.gameId,
      gameVersion: this.gameVersion,
      timestamp: new Date().toISOString(),
      playTime: currentPlayTime,
      
      // Player state
      player: this.serializePlayer(),
      
      // Game flags
      flags: store ? store.all() : {},
      
      // Zone states
      zones: this.serializeZones(),
      
      // Quest progress (if applicable)
      quests: this.serializeQuests(),
      
      // Portable cross-game data
      portable: this.serializePortable(),
      
      // Metadata
      meta: {
        engineVersion: engine.version || '1.0.0',
        platform: typeof navigator !== 'undefined' ? navigator.userAgent : 'unknown'
      }
    };
    
    return saveData;
  }

  /**
   * Serialize player/avatar state
   * @returns {object} Player state
   */
  serializePlayer() {
    const engine = this.engine;
    const world = engine.world;
    
    if (!world || !world.avatar) {
      return {
        zone: 'unknown',
        position: [0, 0, 0],
        facing: 0
      };
    }
    
    const avatar = world.avatar;
    const zone = world.currentZone;
    
    return {
      zone: zone?.id || 'unknown',
      position: [
        avatar.pos?.x || 0,
        avatar.pos?.y || 0,
        avatar.pos?.z || 0
      ],
      facing: avatar.facing || 0,
      sprite: avatar.id || null,
      state: avatar.state || 'idle',
      stats: this.serializeStats(avatar),
      inventory: this.serializeInventory(avatar),
      equipment: avatar.equipment || {}
    };
  }

  /**
   * Serialize player stats
   * @param {object} avatar 
   * @returns {object}
   */
  serializeStats(avatar) {
    if (!avatar.stats) return {};
    
    return {
      hp: avatar.stats.hp,
      maxHp: avatar.stats.maxHp,
      mp: avatar.stats.mp,
      maxMp: avatar.stats.maxMp,
      level: avatar.stats.level,
      exp: avatar.stats.exp,
      ...avatar.stats
    };
  }

  /**
   * Serialize player inventory
   * @param {object} avatar 
   * @returns {Array}
   */
  serializeInventory(avatar) {
    if (!avatar.inventory || !Array.isArray(avatar.inventory)) {
      return [];
    }
    
    return avatar.inventory.map(item => {
      if (typeof item === 'string') {
        return { id: item, quantity: 1 };
      }
      return {
        id: item.id || item.name,
        quantity: item.quantity || 1,
        data: item.data || {}
      };
    });
  }

  /**
   * Serialize zone states (visited, triggered events, etc.)
   * @returns {object}
   */
  serializeZones() {
    const engine = this.engine;
    const world = engine.world;
    const zones = {};
    
    if (!world || !world.zoneDict) {
      return zones;
    }
    
    for (const [zoneId, zone] of Object.entries(world.zoneDict)) {
      zones[zoneId] = {
        visited: zone.visited || false,
        cleared: zone.cleared || false,
        entities: this.serializeZoneEntities(zone),
        triggers: zone.triggeredEvents || []
      };
    }
    
    return zones;
  }

  /**
   * Serialize entity states within a zone
   * @param {object} zone 
   * @returns {object}
   */
  serializeZoneEntities(zone) {
    const entities = {};
    
    // Serialize sprites
    if (zone.spriteDict) {
      for (const [id, sprite] of Object.entries(zone.spriteDict)) {
        if (sprite.stateful) {
          entities[id] = {
            type: 'sprite',
            pos: sprite.pos ? [sprite.pos.x, sprite.pos.y, sprite.pos.z] : null,
            facing: sprite.facing,
            state: sprite.state,
            data: sprite.saveData || {}
          };
        }
      }
    }
    
    // Serialize objects
    if (zone.objectDict) {
      for (const [id, obj] of Object.entries(zone.objectDict)) {
        if (obj.stateful) {
          entities[id] = {
            type: 'object',
            state: obj.state,
            data: obj.saveData || {}
          };
        }
      }
    }
    
    return entities;
  }

  /**
   * Serialize quest progress
   * @returns {Array}
   */
  serializeQuests() {
    const engine = this.engine;
    const store = engine.store;
    const quests = [];
    
    // Look for quest-related flags
    if (store) {
      const allFlags = store.all();
      for (const [key, value] of Object.entries(allFlags)) {
        if (key.startsWith('quest_')) {
          quests.push({
            id: key.replace('quest_', ''),
            status: value.status || (value ? 'active' : 'hidden'),
            progress: value.progress || {},
            startTime: value.startTime,
            endTime: value.endTime
          });
        }
      }
    }
    
    return quests;
  }

  /**
   * Serialize portable cross-game data
   * @returns {object}
   */
  serializePortable() {
    const engine = this.engine;
    const store = engine.store;
    
    return {
      namespace: this.gameId,
      items: this.getPortableItems(),
      achievements: this.getAchievements(),
      compatibleGames: engine.manifest?.compatibleSaves || []
    };
  }

  /**
   * Get items marked as portable (transferable between games)
   * @returns {Array}
   */
  getPortableItems() {
    const engine = this.engine;
    const avatar = engine.world?.avatar;
    const portableItemIds = engine.manifest?.portableItems || [];
    
    if (!avatar || !avatar.inventory) return [];
    
    return avatar.inventory
      .filter(item => {
        const itemId = typeof item === 'string' ? item : item.id;
        return portableItemIds.includes(itemId);
      })
      .map(item => {
        if (typeof item === 'string') {
          return { id: item, type: 'item' };
        }
        return {
          id: item.id,
          type: item.type || 'item',
          data: item.data
        };
      });
  }

  /**
   * Get unlocked achievements
   * @returns {Array<string>}
   */
  getAchievements() {
    const store = this.engine.store;
    if (!store) return [];
    
    const allFlags = store.all();
    const achievements = [];
    
    for (const [key, value] of Object.entries(allFlags)) {
      if (key.startsWith('achievement_') && value) {
        achievements.push(key.replace('achievement_', ''));
      }
    }
    
    return achievements;
  }

  // ==================== DESERIALIZATION ====================

  /**
   * Deserialize and restore game state
   * @param {object} saveData - Saved game data
   * @returns {Promise<boolean>} Success status
   */
  async deserialize(saveData) {
    if (!saveData || saveData.format !== 'pxsave') {
      console.error('[StateManager] Invalid save data format');
      return false;
    }
    
    try {
      const engine = this.engine;
      
      // Restore play time
      this.accumulatedPlayTime = saveData.playTime || 0;
      this.sessionStartTime = Date.now();
      
      // Restore flags
      if (saveData.flags && engine.store) {
        for (const [key, value] of Object.entries(saveData.flags)) {
          engine.store.set(key, value);
        }
      }
      
      // Load target zone and restore player
      if (saveData.player && saveData.player.zone) {
        await this.restorePlayer(saveData.player);
      }
      
      // Restore zone states
      if (saveData.zones) {
        this.restoreZones(saveData.zones);
      }
      
      // Emit load complete event
      if (engine.eventSystem) {
        engine.eventSystem.emit('save:load_complete', { slotId: saveData.slotId });
      }
      
      console.log('[StateManager] Game state restored from:', saveData.timestamp);
      return true;
    } catch (err) {
      console.error('[StateManager] Failed to restore state:', err);
      return false;
    }
  }

  /**
   * Restore player state
   * @param {object} playerData 
   */
  async restorePlayer(playerData) {
    const engine = this.engine;
    const world = engine.world;
    
    if (!world) return;
    
    // Load the zone if not current
    const targetZone = playerData.zone;
    if (world.currentZone?.id !== targetZone) {
      await world.loadZone(targetZone);
    }
    
    // Restore avatar position and state
    if (world.avatar) {
      const avatar = world.avatar;
      
      if (playerData.position) {
        avatar.pos.x = playerData.position[0];
        avatar.pos.y = playerData.position[1];
        avatar.pos.z = playerData.position[2];
      }
      
      if (playerData.facing !== undefined) {
        avatar.facing = playerData.facing;
      }
      
      if (playerData.stats) {
        avatar.stats = { ...avatar.stats, ...playerData.stats };
      }
      
      if (playerData.inventory) {
        avatar.inventory = playerData.inventory;
      }
      
      if (playerData.equipment) {
        avatar.equipment = playerData.equipment;
      }
    }
  }

  /**
   * Restore zone states
   * @param {object} zonesData 
   */
  restoreZones(zonesData) {
    const world = this.engine.world;
    if (!world) return;
    
    // Store zone states for lazy restoration when zones load
    world.savedZoneStates = zonesData;
    
    // Restore already-loaded zones
    if (world.zoneDict) {
      for (const [zoneId, zoneState] of Object.entries(zonesData)) {
        const zone = world.zoneDict[zoneId];
        if (zone) {
          zone.visited = zoneState.visited;
          zone.cleared = zoneState.cleared;
          zone.triggeredEvents = zoneState.triggers || [];
          
          // Restore entity states
          this.restoreZoneEntities(zone, zoneState.entities);
        }
      }
    }
  }

  /**
   * Restore entity states in a zone
   * @param {object} zone 
   * @param {object} entitiesData 
   */
  restoreZoneEntities(zone, entitiesData) {
    if (!entitiesData) return;
    
    for (const [id, entityState] of Object.entries(entitiesData)) {
      let entity = null;
      
      if (entityState.type === 'sprite' && zone.spriteDict) {
        entity = zone.spriteDict[id];
      } else if (entityState.type === 'object' && zone.objectDict) {
        entity = zone.objectDict[id];
      }
      
      if (entity) {
        if (entityState.pos) {
          entity.pos.x = entityState.pos[0];
          entity.pos.y = entityState.pos[1];
          entity.pos.z = entityState.pos[2];
        }
        if (entityState.facing !== undefined) {
          entity.facing = entityState.facing;
        }
        if (entityState.state) {
          entity.state = entityState.state;
        }
        if (entityState.data) {
          entity.saveData = entityState.data;
        }
      }
    }
  }

  // ==================== CHECKPOINTS ====================

  /**
   * Create an in-memory checkpoint
   * @param {string} [label='auto'] - Checkpoint label
   * @returns {number} Checkpoint index
   */
  checkpoint(label = 'auto') {
    const state = this.serialize();
    
    this.checkpoints.push({
      label,
      timestamp: Date.now(),
      state
    });
    
    // Trim to max checkpoints
    while (this.checkpoints.length > this.maxCheckpoints) {
      this.checkpoints.shift();
    }
    
    // Emit checkpoint event
    if (this.engine.eventSystem) {
      this.engine.eventSystem.emit('save:checkpoint', { label });
    }
    
    console.log(`[StateManager] Checkpoint created: ${label} (${this.checkpoints.length}/${this.maxCheckpoints})`);
    return this.checkpoints.length - 1;
  }

  /**
   * Restore from a checkpoint
   * @param {number} [index=-1] - Checkpoint index (-1 for latest)
   * @returns {Promise<boolean>} Success status
   */
  async restore(index = -1) {
    const checkpoint = this.checkpoints.at(index);
    
    if (!checkpoint) {
      console.warn('[StateManager] No checkpoint found at index:', index);
      return false;
    }
    
    console.log(`[StateManager] Restoring checkpoint: ${checkpoint.label}`);
    return await this.deserialize(checkpoint.state);
  }

  /**
   * Get all checkpoints
   * @returns {Array<{label: string, timestamp: number}>}
   */
  getCheckpoints() {
    return this.checkpoints.map(cp => ({
      label: cp.label,
      timestamp: cp.timestamp
    }));
  }

  /**
   * Clear all checkpoints
   */
  clearCheckpoints() {
    this.checkpoints = [];
  }

  // ==================== PERSISTENT SAVES ====================

  /**
   * Save game to a slot (async, uses IndexedDB)
   * @param {string} slotId - Save slot identifier
   * @param {string} [slotName] - User-friendly slot name
   * @param {string} [screenshot] - Base64 encoded screenshot
   * @returns {Promise<boolean>} Success status
   */
  async save(slotId, slotName = '', screenshot = null) {
    try {
      const state = this.serialize();
      state.slotId = slotId;
      state.slotName = slotName || `Save ${slotId}`;
      
      if (screenshot) {
        state.screenshot = screenshot;
      }
      
      // Generate checksum
      state.checksum = await this.generateChecksum(state);
      
      // Emit save start event
      if (this.engine.eventSystem) {
        this.engine.eventSystem.emit('save:save_start', { slotId });
      }
      
      // Save to IndexedDB via database
      const db = this.engine.database;
      if (db) {
        // Check if slot exists
        const existing = await this.getSaveSlot(slotId);
        if (existing) {
          await db.dbUpdate('saves', existing.id, state);
        } else {
          await db.dbAdd('saves', state);
        }
      } else {
        // Fallback to localStorage
        localStorage.setItem(`pxsave_${this.gameId}_${slotId}`, JSON.stringify(state));
      }
      
      // Emit save complete event
      if (this.engine.eventSystem) {
        this.engine.eventSystem.emit('save:save_complete', { slotId });
      }
      
      console.log(`[StateManager] Game saved to slot: ${slotId}`);
      return true;
    } catch (err) {
      console.error('[StateManager] Save failed:', err);
      
      if (this.engine.eventSystem) {
        this.engine.eventSystem.emit('save:save_error', { slotId, error: err.message });
      }
      
      return false;
    }
  }

  /**
   * Synchronous save for emergency/beforeunload (uses localStorage)
   * @param {string} slotId 
   */
  saveSync(slotId) {
    try {
      const state = this.serialize();
      state.slotId = slotId;
      state.slotName = 'Emergency Save';
      
      localStorage.setItem(`pxsave_${this.gameId}_${slotId}`, JSON.stringify(state));
      console.log(`[StateManager] Emergency save to slot: ${slotId}`);
    } catch (err) {
      console.warn('[StateManager] Sync save failed:', err);
    }
  }

  /**
   * Load game from a slot
   * @param {string} slotId - Save slot identifier
   * @returns {Promise<boolean>} Success status
   */
  async load(slotId) {
    try {
      // Emit load start event
      if (this.engine.eventSystem) {
        this.engine.eventSystem.emit('save:load_start', { slotId });
      }
      
      let state = null;
      
      // Try IndexedDB first
      const db = this.engine.database;
      if (db) {
        state = await this.getSaveSlot(slotId);
      }
      
      // Fallback to localStorage
      if (!state) {
        const stored = localStorage.getItem(`pxsave_${this.gameId}_${slotId}`);
        if (stored) {
          state = JSON.parse(stored);
        }
      }
      
      if (!state) {
        console.warn('[StateManager] No save found for slot:', slotId);
        return false;
      }
      
      // Verify checksum if present
      if (state.checksum) {
        const valid = await this.verifyChecksum(state);
        if (!valid) {
          console.warn('[StateManager] Save file checksum mismatch');
          // Continue anyway, but log warning
        }
      }
      
      return await this.deserialize(state);
    } catch (err) {
      console.error('[StateManager] Load failed:', err);
      
      if (this.engine.eventSystem) {
        this.engine.eventSystem.emit('save:load_error', { slotId, error: err.message });
      }
      
      return false;
    }
  }

  /**
   * Get a save slot from IndexedDB
   * @param {string} slotId 
   * @returns {Promise<object|null>}
   */
  async getSaveSlot(slotId) {
    const db = this.engine.database;
    if (!db || !db.db.saves) return null;
    
    try {
      const saves = await db.db.saves.where('slotId').equals(slotId).toArray();
      return saves.length > 0 ? saves[0] : null;
    } catch (err) {
      return null;
    }
  }

  /**
   * Get all save slots
   * @returns {Promise<Array>}
   */
  async getAllSaves() {
    const saves = [];
    
    // Get from IndexedDB
    const db = this.engine.database;
    if (db && db.db.saves) {
      try {
        const dbSaves = await db.db.saves.where('gameId').equals(this.gameId).toArray();
        saves.push(...dbSaves);
      } catch (err) {
        console.warn('[StateManager] Failed to read saves from DB:', err);
      }
    }
    
    // Also check localStorage
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith(`pxsave_${this.gameId}_`)) {
        try {
          const data = JSON.parse(localStorage.getItem(key));
          if (!saves.find(s => s.slotId === data.slotId)) {
            saves.push(data);
          }
        } catch (err) {
          // Skip invalid entries
        }
      }
    }
    
    // Sort by timestamp descending
    saves.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    
    return saves;
  }

  /**
   * Delete a save slot
   * @param {string} slotId 
   * @returns {Promise<boolean>}
   */
  async deleteSave(slotId) {
    try {
      const db = this.engine.database;
      if (db) {
        const existing = await this.getSaveSlot(slotId);
        if (existing) {
          await db.dbRemove('saves', existing.id);
        }
      }
      
      // Also remove from localStorage
      localStorage.removeItem(`pxsave_${this.gameId}_${slotId}`);
      
      console.log(`[StateManager] Deleted save slot: ${slotId}`);
      return true;
    } catch (err) {
      console.error('[StateManager] Delete failed:', err);
      return false;
    }
  }

  // ==================== IMPORT/EXPORT ====================

  /**
   * Export save data as downloadable file
   * @param {string} slotId 
   * @returns {Promise<Blob|null>}
   */
  async exportSave(slotId) {
    const state = slotId ? await this.getSaveSlot(slotId) : this.serialize();
    if (!state) return null;
    
    const json = JSON.stringify(state, null, 2);
    return new Blob([json], { type: 'application/json' });
  }

  /**
   * Import save data from file
   * @param {File|Blob} file 
   * @param {string} [targetSlotId] - Slot to import into
   * @returns {Promise<boolean>}
   */
  async importSave(file, targetSlotId = null) {
    try {
      const text = await file.text();
      const state = JSON.parse(text);
      
      // Validate format
      if (state.format !== 'pxsave') {
        throw new Error('Invalid save file format');
      }
      
      // Check game compatibility
      const compatible = this.isCompatibleSave(state);
      if (!compatible) {
        console.warn('[StateManager] Save from different game, importing portable data only');
        return await this.importPortableData(state);
      }
      
      // Assign to target slot
      if (targetSlotId) {
        state.slotId = targetSlotId;
      }
      
      // Save to storage
      await this.save(state.slotId || 'imported', state.slotName || 'Imported Save');
      
      // Emit import event
      if (this.engine.eventSystem) {
        this.engine.eventSystem.emit('save:import_save', { sourceGameId: state.gameId });
      }
      
      return true;
    } catch (err) {
      console.error('[StateManager] Import failed:', err);
      return false;
    }
  }

  /**
   * Check if save is compatible with current game
   * @param {object} saveData 
   * @returns {boolean}
   */
  isCompatibleSave(saveData) {
    if (saveData.gameId === this.gameId) {
      return true;
    }
    
    const compatibleGames = this.engine.manifest?.compatibleSaves || [];
    return compatibleGames.includes(saveData.gameId);
  }

  /**
   * Import only portable data from incompatible save
   * @param {object} saveData 
   * @returns {Promise<boolean>}
   */
  async importPortableData(saveData) {
    if (!saveData.portable) return false;
    
    const store = this.engine.store;
    const avatar = this.engine.world?.avatar;
    
    // Import portable items
    if (saveData.portable.items && avatar && avatar.inventory) {
      for (const item of saveData.portable.items) {
        avatar.inventory.push(item);
      }
    }
    
    // Import achievements as flags
    if (saveData.portable.achievements && store) {
      for (const achievement of saveData.portable.achievements) {
        store.set(`imported_achievement_${achievement}`, true);
      }
    }
    
    return true;
  }

  // ==================== AUTOSAVE ====================

  /**
   * Start autosave interval
   */
  startAutosave() {
    if (this.autosaveInterval) return;
    
    this.autosaveInterval = setInterval(() => {
      this.save('autosave', 'Autosave');
      
      if (this.engine.eventSystem) {
        this.engine.eventSystem.emit('save:autosave');
      }
    }, this.autosaveIntervalMs);
    
    console.log(`[StateManager] Autosave started (every ${this.autosaveIntervalMs / 1000}s)`);
  }

  /**
   * Stop autosave interval
   */
  stopAutosave() {
    if (this.autosaveInterval) {
      clearInterval(this.autosaveInterval);
      this.autosaveInterval = null;
      console.log('[StateManager] Autosave stopped');
    }
  }

  // ==================== UTILITIES ====================

  /**
   * Generate SHA-256 checksum for save data
   * @param {object} data 
   * @returns {Promise<string>}
   */
  async generateChecksum(data) {
    const copy = { ...data };
    delete copy.checksum;
    delete copy.screenshot;
    
    const json = JSON.stringify(copy);
    
    if (typeof crypto !== 'undefined' && crypto.subtle) {
      const encoder = new TextEncoder();
      const dataBuffer = encoder.encode(json);
      const hashBuffer = await crypto.subtle.digest('SHA-256', dataBuffer);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
      return `sha256:${hashHex}`;
    }
    
    // Fallback: simple hash
    let hash = 0;
    for (let i = 0; i < json.length; i++) {
      const char = json.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return `simple:${Math.abs(hash).toString(16)}`;
  }

  /**
   * Verify checksum of save data
   * @param {object} data 
   * @returns {Promise<boolean>}
   */
  async verifyChecksum(data) {
    if (!data.checksum) return true;
    
    const calculated = await this.generateChecksum(data);
    return calculated === data.checksum;
  }

  /**
   * Get current play time in milliseconds
   * @returns {number}
   */
  getPlayTime() {
    return this.accumulatedPlayTime + (Date.now() - this.sessionStartTime);
  }

  /**
   * Format play time as human-readable string
   * @param {number} [ms] - Milliseconds (defaults to current play time)
   * @returns {string}
   */
  formatPlayTime(ms = null) {
    const time = ms ?? this.getPlayTime();
    const seconds = Math.floor(time / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    
    if (hours > 0) {
      return `${hours}h ${minutes % 60}m`;
    }
    return `${minutes}m ${seconds % 60}s`;
  }
}
