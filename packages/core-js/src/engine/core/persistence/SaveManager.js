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

/**
 * SaveManager handles persisting and loading game state.
 */
export default class SaveManager {
    /**
     * @param {Object} engine - Reference to the engine.
     */
    constructor(engine) {
        this.engine = engine;
        this.slots = [];
        this.metadataKey = 'pixos_save_metadata';
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
     * Saves the current game state to a slot.
     * @param {number} slotId - The ID of the slot to save to.
     * @param {string} name - A name for the save.
     * @returns {Promise<boolean>}
     */
    async saveGame(slotId, name = null) {
        const world = this.engine.world;
        const avatar = world.avatar;
        const manifest = this.engine.manifest || {};

        const saveData = {
            version: "1.0.0",
            format: "pxsave",
            gameId: manifest.id || "default",
            timestamp: Date.now(),
            player: {
                zone: world.currentZoneId,
                position: [avatar.x, avatar.y, avatar.z],
                direction: avatar.direction,
            },
            flags: world.flags || {},
            // Add more state as needed (inventory, etc.)
        };

        try {
            // 1. Save data to IndexedDB
            await this.engine.db.dbAdd('saves', {
                slotId,
                gameId: saveData.gameId,
                timestamp: saveData.timestamp,
                data: saveData
            });

            // 2. Update metadata
            let slot = this.slots.find(s => s.id === slotId);
            if (!slot) {
                slot = new SaveSlot(slotId);
                this.slots.push(slot);
            }
            slot.name = name || slot.name;
            slot.timestamp = saveData.timestamp;
            slot.zone = saveData.player.zone;
            slot.gameId = saveData.gameId;

            this.saveMetadata();
            return true;
        } catch (e) {
            console.error('Failed to save game:', e);
            return false;
        }
    }

    /**
     * Loads game state from a slot.
     * @param {number} slotId - The ID of the slot to load from.
     * @returns {Promise<boolean>}
     */
    async loadGame(slotId) {
        try {
            // 1. Get data from IndexedDB
            // Note: We need a way to get the latest save for this slot.
            // Since dbAdd returns id, we might want to query by slotId and sort by timestamp.
            const entries = await this.engine.db.db.saves
                .where('slotId')
                .equals(slotId)
                .sortBy('timestamp');

            if (!entries || entries.length === 0) {
                console.warn(`No save found for slot ${slotId}`);
                return false;
            }

            const latest = entries[entries.length - 1].data;

            // 2. Apply state to engine
            await this.engine.world.loadZone(latest.player.zone);
            const avatar = this.engine.world.avatar;
            avatar.x = latest.player.position[0];
            avatar.y = latest.player.position[1];
            avatar.z = latest.player.position[2];
            avatar.direction = latest.player.direction;
            this.engine.world.flags = latest.flags;

            return true;
        } catch (e) {
            console.error('Failed to load game:', e);
            return false;
        }
    }

    /**
     * Deletes a save slot.
     * @param {number} slotId - The ID of the slot to delete.
     * @returns {Promise<boolean>}
     */
    async deleteSave(slotId) {
        try {
            await this.engine.db.db.saves.where('slotId').equals(slotId).delete();
            this.slots = this.slots.filter(s => s.id !== slotId);
            this.saveMetadata();
            return true;
        } catch (e) {
            console.error('Failed to delete save:', e);
            return false;
        }
    }
}
