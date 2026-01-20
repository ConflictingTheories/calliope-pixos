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

import SaveSlot from './SaveSlot';
import SaveMigration from './SaveMigration';

/**
 * SaveManager handles persisting and loading game state.
 * Supports LocalStorage for metadata and IndexedDB for save data.
 */
export default class SaveManager {
    /**
     * @param {Object} engine - Reference to the engine.
     */
    constructor(engine) {
        this.engine = engine;
        this.slots = [];
        this.metadataKey = 'pixos_save_metadata';
        this.autoSaveEnabled = false;
        this.autoSaveInterval = null;
        this.autoSaveSlotId = 0; // Slot 0 reserved for auto-save
        this.loadMetadata();
    }

    /**
     * Loads save slot metadata from LocalStorage.
     */
    loadMetadata() {
        try {
            const data = localStorage.getItem(this.metadataKey);
            if (data) {
                const parsed = JSON.parse(data);
                this.slots = parsed.map(s => new SaveSlot(s.id, s));
            }
        } catch (e) {
            console.error('Failed to load save metadata:', e);
            this.slots = [];
        }
    }

    /**
     * Saves slot metadata to LocalStorage.
     */
    saveMetadata() {
        try {
            const serialized = this.slots.map(s => s.serialize());
            localStorage.setItem(this.metadataKey, JSON.stringify(serialized));
        } catch (e) {
            console.error('Failed to save save metadata:', e);
        }
    }

    /**
     * Returns a list of all save slots.
     * @returns {SaveSlot[]}
     */
    getSlots() {
        return this.slots;
    }

    /**
     * Captures a screenshot of the current game state.
     * @returns {Promise<string|null>} - Base64-encoded PNG screenshot or null.
     */
    async captureScreenshot() {
        try {
            const canvas = this.engine.canvas;
            if (!canvas) return null;
            
            // Convert canvas to base64 PNG
            return canvas.toDataURL('image/png');
        } catch (e) {
            console.warn('Failed to capture screenshot:', e);
            return null;
        }
    }

    /**
     * Generates a SHA-256 checksum for save data integrity.
     * @param {Object} data - Save data to checksum.
     * @returns {Promise<string>} - Checksum in format "sha256:hex".
     */
    async generateChecksum(data) {
        try {
            const encoder = new TextEncoder();
            const dataStr = JSON.stringify(data);
            const dataBuffer = encoder.encode(dataStr);
            const hashBuffer = await crypto.subtle.digest('SHA-256', dataBuffer);
            const hashArray = Array.from(new Uint8Array(hashBuffer));
            const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
            return `sha256:${hashHex}`;
        } catch (e) {
            console.warn('Failed to generate checksum:', e);
            return null;
        }
    }

    /**
     * Saves the current game state to a slot.
     * @param {number} slotId - The ID of the slot to save to.
     * @param {string} name - A name for the save.
     * @param {Object} options - Additional save options.
     * @param {boolean} options.captureScreenshot - Whether to capture a screenshot.
     * @returns {Promise<boolean>}
     */
    async saveGame(slotId, name = null, options = {}) {
        const world = this.engine.world;
        const avatar = world.avatar;
        const manifest = this.engine.manifest || {};

        if (!world || !avatar) {
            console.error('Cannot save: world or avatar not initialized');
            return false;
        }

        // Build save data according to schema
        const saveData = {
            version: SaveMigration.CURRENT_VERSION,
            format: "pxsave",
            gameId: manifest.id || "default",
            gameVersion: manifest.version || "1.0.0",
            timestamp: new Date().toISOString(),
            slotId: slotId.toString(),
            slotName: name || `Slot ${slotId}`,
            player: {
                zone: world.currentZoneId || "unknown",
                position: [avatar.x || 0, avatar.y || 0, avatar.z || 0],
                facing: avatar.direction || 0,
                sprite: avatar.id || null,
                state: avatar.state || "idle",
            },
            flags: world.flags || {},
            zones: this.collectZoneStates(world),
        };

        // Capture screenshot if requested
        if (options.captureScreenshot !== false) {
            saveData.screenshot = await this.captureScreenshot();
        }

        // Generate checksum
        const checksum = await this.generateChecksum(saveData);
        if (checksum) {
            saveData.checksum = checksum;
        }

        try {
            // Ensure database is initialized
            const db = this.engine.database || this.engine.db;
            if (!db || !db.db) {
                console.error('Database not initialized');
                return false;
            }

            // 1. Save data to IndexedDB
            await db.dbAdd('saves', {
                slotId,
                gameId: saveData.gameId,
                timestamp: Date.now(), // Store numeric timestamp for sorting
                data: saveData
            });

            // 2. Update metadata
            let slot = this.slots.find(s => s.id === slotId);
            if (!slot) {
                slot = new SaveSlot(slotId);
                this.slots.push(slot);
            }
            slot.name = name || slot.name || `Slot ${slotId}`;
            slot.timestamp = Date.now();
            slot.zone = saveData.player.zone;
            slot.gameId = saveData.gameId;
            slot.version = saveData.version;
            if (saveData.screenshot) {
                slot.thumbnail = saveData.screenshot;
            }

            this.saveMetadata();
            return true;
        } catch (e) {
            console.error('Failed to save game:', e);
            return false;
        }
    }

    /**
     * Collects per-zone state for saving.
     * @param {Object} world - World instance.
     * @returns {Object} - Zone states.
     */
    collectZoneStates(world) {
        const zones = {};
        
        // Collect state from all loaded zones
        if (world.zones && typeof world.zones === 'object') {
            for (const [zoneId, zone] of Object.entries(world.zones)) {
                if (zone && typeof zone === 'object') {
                    zones[zoneId] = {
                        visited: true,
                        cleared: zone.cleared || false,
                        entities: zone.entityStates || {},
                        triggers: zone.triggeredEvents || [],
                    };
                }
            }
        }
        
        return zones;
    }

    /**
     * Loads game state from a slot.
     * @param {number} slotId - The ID of the slot to load from.
     * @returns {Promise<boolean>}
     */
    async loadGame(slotId) {
        try {
            // Ensure database is initialized
            const db = this.engine.database || this.engine.db;
            if (!db || !db.db) {
                console.error('Database not initialized');
                return false;
            }

            // 1. Get data from IndexedDB
            const entries = await db.db.saves
                .where('slotId')
                .equals(slotId)
                .sortBy('timestamp');

            if (!entries || entries.length === 0) {
                console.warn(`No save found for slot ${slotId}`);
                return false;
            }

            let saveData = entries[entries.length - 1].data;

            // 2. Migrate save data if needed
            if (saveData.version !== SaveMigration.CURRENT_VERSION) {
                saveData = await SaveMigration.migrate(saveData);
            }

            // 3. Validate save data
            if (!SaveMigration.validate(saveData)) {
                console.error('Invalid save data format');
                return false;
            }

            // 4. Verify checksum if present
            if (saveData.checksum) {
                const currentChecksum = await this.generateChecksum(saveData);
                if (currentChecksum !== saveData.checksum) {
                    console.warn('Save data checksum mismatch - data may be corrupted');
                    // Continue anyway, but warn user
                }
            }

            // 5. Apply state to engine
            const world = this.engine.world;
            if (!world) {
                console.error('Cannot load: world not initialized');
                return false;
            }

            // Load zone first
            await world.loadZone(saveData.player.zone);

            // Restore player position and state
            const avatar = world.avatar;
            if (avatar) {
                avatar.x = saveData.player.position[0];
                avatar.y = saveData.player.position[1];
                avatar.z = saveData.player.position[2];
                avatar.direction = saveData.player.facing || saveData.player.direction || 0;
                if (saveData.player.sprite) avatar.id = saveData.player.sprite;
                if (saveData.player.state) avatar.state = saveData.player.state;
            }

            // Restore flags
            world.flags = saveData.flags || {};

            // Restore zone states
            if (saveData.zones) {
                this.applyZoneStates(world, saveData.zones);
            }

            return true;
        } catch (e) {
            console.error('Failed to load game:', e);
            return false;
        }
    }

    /**
     * Applies saved zone states to the world.
     * @param {Object} world - World instance.
     * @param {Object} zoneStates - Saved zone states.
     */
    applyZoneStates(world, zoneStates) {
        for (const [zoneId, state] of Object.entries(zoneStates)) {
            const zone = world.zones?.[zoneId];
            if (zone) {
                if (state.cleared !== undefined) zone.cleared = state.cleared;
                if (state.entities) zone.entityStates = state.entities;
                if (state.triggers) zone.triggeredEvents = state.triggers;
            }
        }
    }

    /**
     * Deletes a save slot.
     * @param {number} slotId - The ID of the slot to delete.
     * @returns {Promise<boolean>}
     */
    async deleteSave(slotId) {
        try {
            // Ensure database is initialized
            const db = this.engine.database || this.engine.db;
            if (!db || !db.db) {
                console.error('Database not initialized');
                return false;
            }

            await db.db.saves.where('slotId').equals(slotId).delete();
            this.slots = this.slots.filter(s => s.id !== slotId);
            this.saveMetadata();
            return true;
        } catch (e) {
            console.error('Failed to delete save:', e);
            return false;
        }
    }

    /**
     * Checks if a save slot exists.
     * @param {number} slotId - The ID of the slot to check.
     * @returns {Promise<boolean>}
     */
    async hasSave(slotId) {
        try {
            // Ensure database is initialized
            const db = this.engine.database || this.engine.db;
            if (!db || !db.db) {
                return false;
            }

            const entries = await db.db.saves
                .where('slotId')
                .equals(slotId)
                .count();
            return entries > 0;
        } catch (e) {
            console.error('Failed to check save:', e);
            return false;
        }
    }

    /**
     * Enables auto-save functionality.
     * @param {number} intervalMs - Auto-save interval in milliseconds (default: 60000 = 1 minute).
     * @param {number} slotId - Slot ID to use for auto-save (default: 0).
     */
    enableAutoSave(intervalMs = 60000, slotId = 0) {
        this.disableAutoSave();
        this.autoSaveEnabled = true;
        this.autoSaveSlotId = slotId;
        this.autoSaveInterval = setInterval(() => {
            this.saveGame(slotId, 'Auto-save', { captureScreenshot: false });
        }, intervalMs);
    }

    /**
     * Disables auto-save functionality.
     */
    disableAutoSave() {
        this.autoSaveEnabled = false;
        if (this.autoSaveInterval) {
            clearInterval(this.autoSaveInterval);
            this.autoSaveInterval = null;
        }
    }

    /**
     * Performs a quick save (auto-save slot).
     * @returns {Promise<boolean>}
     */
    async quickSave() {
        return this.saveGame(this.autoSaveSlotId, 'Quick Save');
    }
}
