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

import Avatar from './avatar.js';
import { Vector } from '@Engine/utils/math/vector.js';
import { debug } from '@Engine/utils/debug-logger.js';

/**
 * NetworkAvatarManager handles remote players' avatars in the world.
 */
export default class NetworkAvatarManager {
    /**
     * @param {import('./world.js').default} world - Reference to the world.
     */
    constructor(world) {
        this.world = world;
        this.engine = world.engine;
        /** @type {Map<string, Avatar>} */
        this.remoteAvatars = new Map();
    }

    addRemoteAvatar(clientId, avatarData) {
        // Create and add a new avatar sprite for the remote player using engine Avatar class
        try {
            // If we already have this remote avatar, update and return it
            if (this.remoteAvatars.has(clientId)) {
                const existing = this.remoteAvatars.get(clientId);
                try { debug('NetworkAvatarManager', `Remote avatar for ${clientId} already exists, updating instead`); } catch (e) { }
                if (avatarData.x != null) existing.pos.x = avatarData.x;
                if (avatarData.y != null) existing.pos.y = avatarData.y;
                if (avatarData.z != null) existing.pos.z = avatarData.z;
                if (avatarData.facing != null) existing.facing = avatarData.facing;
                return existing;
            }
            // Instantiate Avatar and try to copy template properties from the local player avatar
            const avatar = new Avatar(this.engine);

            // Try to find a local avatar template to copy necessary rendering/template fields
            const localTemplate = this.world.getAvatar();
            if (localTemplate) {
                // Copy minimal template fields required by Sprite
                avatar.src = localTemplate.src;
                avatar.portraitSrc = localTemplate.portraitSrc;
                avatar.sheetSize = localTemplate.sheetSize;
                avatar.tileSize = localTemplate.tileSize;
                avatar.frames = localTemplate.frames;
                avatar.hotspotOffset = localTemplate.hotspotOffset;
                avatar.drawOffset = localTemplate.drawOffset;
                avatar.enableSpeech = localTemplate.enableSpeech;
                avatar.bindCamera = false; // remote avatars shouldn't bind camera
                // Copy runtime resources so remote avatar can render immediately
                if (localTemplate.texture) avatar.texture = localTemplate.texture;
                if (localTemplate.vertexTexBuf) avatar.vertexTexBuf = localTemplate.vertexTexBuf;
                if (localTemplate.vertexPosBuf) avatar.vertexPosBuf = localTemplate.vertexPosBuf;
                if (localTemplate.speech && localTemplate.speechTexBuf) avatar.speech = localTemplate.speech, avatar.speechTexBuf = localTemplate.speechTexBuf;
                // mark as loaded so draw will render without waiting for async onLoad
                avatar.loaded = true;
                avatar.templateLoaded = true;
            } else {
                console.warn('No local avatar template found; remote avatar may not render correctly');
            }

            // Ensure unique sprite id to avoid collisions with local 'avatar' id
            const baseId = avatarData.id || 'player';
            const spriteId = `${baseId}-${clientId}`;

            // Set properties and create buffers synchronously
            const zone = this.world.getZoneById(avatarData.zone || avatarData.zoneId) || this.world.zoneContaining(avatarData.x || 0, avatarData.y || 0);
            avatar.zone = zone;
            avatar.id = spriteId;
            // compute z if not provided. Use hotspot offset so we sample tile height for avatar foot position.
            const rawX = avatarData.x ?? (avatarData.pos && avatarData.pos.x) ?? 0;
            const rawY = avatarData.y ?? (avatarData.pos && avatarData.pos.y) ?? 0;
            const hx = rawX + (avatar.hotspotOffset?.x ?? 0);
            const hy = rawY + (avatar.hotspotOffset?.y ?? 0);
            const zVal = (typeof avatarData.z === 'number') ? avatarData.z : (avatarData.pos && typeof avatarData.pos.z === 'number') ? avatarData.pos.z : (zone ? zone.getHeight(hx, hy) : 0);
            avatar.pos = new Vector(rawX, rawY, zVal);
            avatar.facing = avatarData.facing || 0;
            avatar.isSelected = false; // remote avatars not selected

            // Create buffers synchronously with fallback tile size
            let tileSize = (zone && zone.tileset && zone.tileset.tileSize) ? zone.tileset.tileSize : 32;
            let normTile = [avatar.tileSize[0] / tileSize, avatar.tileSize[1] / tileSize];
            let verts = [
                [0, 0, 0],
                [normTile[0], 0, 0],
                [normTile[0], 0, normTile[1]],
                [0, 0, normTile[1]],
            ];
            let poly = [
                [verts[2], verts[3], verts[0]],
                [verts[2], verts[0], verts[1]]
            ].flat(3);
            avatar.vertexPosBuf = this.engine.renderManager.createBuffer(poly, this.engine.gl.STATIC_DRAW, 3);
            let texCoords = avatar.getTexCoords();
            avatar.vertexTexBuf = this.engine.renderManager.createBuffer(texCoords, this.engine.gl.DYNAMIC_DRAW, 2);
            if (avatar.enableSpeech) {
                avatar.speechVerBuf = this.engine.renderManager.createBuffer(avatar.getSpeechBubbleVertices(), this.engine.gl.STATIC_DRAW, 3);
                avatar.speechTexBuf = this.engine.renderManager.createBuffer(avatar.getSpeechBubbleTexture(), this.engine.gl.DYNAMIC_DRAW, 2);
            }

            // Add to the zone if available. Ensure id/zone registration happens *before* we store
            // this.remoteAvatars to avoid updates arriving before registration completes.
            if (zone) {
                // Ensure zone has spriteDict and spriteList
                if (!zone.spriteDict) zone.spriteDict = {};
                if (!zone.spriteList) zone.spriteList = [];
                // register in dictionaries and lists synchronously
                this.world.spriteDict[avatar.id] = avatar;
                zone.spriteDict[avatar.id] = avatar;
                if (!zone.spriteList.includes(avatar)) zone.spriteList.push(avatar);
                if (!this.world.spriteList.includes(avatar)) this.world.spriteList.push(avatar);
                debug('NetworkAvatarManager', `Added remote avatar for client ${clientId} as sprite '${avatar.id}' to zone ${zone.id} at (${avatar.pos.x},${avatar.pos.y},${avatar.pos.z})`);
            }

            // store mapping after registration
            this.remoteAvatars.set(clientId, avatar);
            try { debug('NetworkAvatarManager', `Remote avatar map now has ${this.remoteAvatars.size} entries`); } catch (e) { }
            return avatar;
        } catch (e) {
            console.warn('Failed to add remote avatar', e);
            return null;
        }
    }

    removeRemoteAvatar(clientId) {
        const avatar = this.remoteAvatars.get(clientId);
        if (avatar) {
            try {
                if (avatar.zone) {
                    // remove by id if possible
                    const idToRemove = avatar.id || (avatar.objId ? avatar.objId : null);
                    if (idToRemove) avatar.zone.removeSprite(idToRemove);
                    else avatar.zone.removeSprite(avatar);
                }
            } catch (e) {
                try { if (avatar.zone) avatar.zone.removeSprite(avatar); } catch (e2) { }
            }
            this.remoteAvatars.delete(clientId);
        }
    }

    updateRemoteAvatar(clientId, avatarData) {
        const avatar = this.remoteAvatars.get(clientId);
        if (avatar) {
            try { debug('NetworkAvatarManager', `updateRemoteAvatar: client=${clientId} pre pos=${avatar.pos?.x},${avatar.pos?.y},${avatar.pos?.z} loaded=${avatar.loaded} id=${avatar.id} zone=${avatar.zone?.id}`); } catch (e) { }
            if (typeof avatar.setPosition === 'function') {
                avatar.setPosition(avatarData.x, avatarData.y, avatarData.z);
            } else if (avatar.pos) {
                avatar.pos.x = avatarData.x;
                avatar.pos.y = avatarData.y;
                avatar.pos.z = avatarData.z || avatar.pos.z;
            }
            if (typeof avatar.updateState === 'function') {
                avatar.updateState(avatarData);
            } else {
                // fallback: apply facing and animation frame
                if (avatarData.facing != null) avatar.facing = avatarData.facing;
                if (avatarData.animFrame != null) avatar.animFrame = avatarData.animFrame;
            }
            // Defensive: ensure sprite is marked loaded so draw will execute
            if (!avatar.loaded) {
                console.warn(`Remote avatar ${clientId} was not loaded; forcing loaded=true so renderer will attempt to draw.`);
                avatar.loaded = true;
                avatar.templateLoaded = true;
                if (!avatar.texture || typeof avatar.texture.attach !== 'function') avatar.texture = { loaded: true, attach: () => { } };
            }
            try { debug('NetworkAvatarManager', `updateRemoteAvatar: client=${clientId} post pos=${avatar.pos?.x},${avatar.pos?.y},${avatar.pos?.z} loaded=${avatar.loaded} id=${avatar.id} zone=${avatar.zone?.id}`); } catch (e) { }
            return avatar;
        }
        return null;
    }

    applyRemoteAction(clientId, action, params, spriteId) {
        const avatar = this.remoteAvatars.get(clientId);
        if (avatar) {
            avatar.performAction(action, params); // implement this in your avatar class
        }
    }

    /**
     * Clears all remote avatars.
     */
    clear() {
        for (const [clientId] of this.remoteAvatars) {
            this.removeRemoteAvatar(clientId);
        }
    }
}
