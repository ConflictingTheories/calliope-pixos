/*                                                 *\
** ----------------------------------------------- **
**          Calliope - Pixos Game Engine           **
** ----------------------------------------------- **
**  Copyright (c) 2020-2025 - Kyle Derby MacInnis  **
**                                                 **
**    Any unauthorized distribution or transfer    **
**       of this work is strictly prohibited.      **
**                                                 **
**               All Rights Reserved.              **
** ----------------------------------------------- **
\*                                                 */

import { AABB } from '../../utils/math/collision.js';
import { Vector } from '../../utils/math/vector.js';
import SpatialHash from './SpatialHash.js';
import CollisionMask from './CollisionMask.js';

/**
 * PhysicsManager - Handles collisions and simple physics simulation.
 * Uses spatial hashing for efficient broad-phase collision detection.
 */
export default class PhysicsManager {
    constructor(engine) {
        this.engine = engine;
        this.bodies = [];
        this.staticBodies = [];
        /** @type {SpatialHash} */
        this.spatialHash = new SpatialHash(32); // 32px cells
        /** @type {Map<Object, Set<Object>>} */
        this.currentCollisions = new Map(); // Track ongoing collisions for events
    }

    /**
     * Adds a dynamic body to the physics simulation.
     * @param {object} body - Object with position, velocity, and getAABB()
     * @param {number} width - Body width (if getAABB not available).
     * @param {number} height - Body height (if getAABB not available).
     * @param {number} layer - Collision layer (default: CollisionMask.Layers.DEFAULT).
     * @param {number} mask - Collision mask (default: CollisionMask.Layers.ALL).
     */
    addBody(body, width = null, height = null, layer = CollisionMask.Layers.DEFAULT, mask = CollisionMask.Layers.ALL) {
        if (!this.bodies.includes(body)) {
            this.bodies.push(body);
            // Set collision properties
            body.collisionLayer = layer;
            body.collisionMask = mask;
            body.isTrigger = body.isTrigger || false;
            // Add to spatial hash
            this.spatialHash.insert(body);
        }
    }

    /**
     * Removes a dynamic body.
     */
    removeBody(body) {
        this.bodies = this.bodies.filter(b => b !== body);
        this.spatialHash.remove(body);
        this.currentCollisions.delete(body);
    }

    /**
     * Adds a static body (e.g., wall, floor).
     * @param {object} body - Static body object.
     * @param {number} layer - Collision layer (default: CollisionMask.Layers.WALL).
     * @param {number} mask - Collision mask (default: CollisionMask.Layers.ALL).
     */
    addStaticBody(body, layer = CollisionMask.Layers.WALL, mask = CollisionMask.Layers.ALL) {
        if (!this.staticBodies.includes(body)) {
            this.staticBodies.push(body);
            body.collisionLayer = layer;
            body.collisionMask = mask;
            body.isTrigger = body.isTrigger || false;
            this.spatialHash.insert(body);
        }
    }

    /**
     * Clears all bodies.
     */
    clear() {
        this.bodies = [];
        this.staticBodies = [];
        this.spatialHash.clear();
        this.currentCollisions.clear();
    }

    /**
     * Updates the physics simulation.
     * @param {number} deltaTime - Time since last update in seconds.
     */
    update(deltaTime) {
        // Rebuild spatial hash
        this.spatialHash.clear();
        for (const body of [...this.bodies, ...this.staticBodies]) {
            this.spatialHash.insert(body);
        }

        // Track collisions for event system
        const newCollisions = new Map();

        for (const body of this.bodies) {
            // Get position property (some objects use 'pos', others 'position')
            const position = body.position || body.pos;
            if (!position) continue;

            // Apply gravity if enabled
            if (body.useGravity && body.velocity) {
                body.velocity.y -= 9.8 * deltaTime;
            }

            // Integration (simple Euler)
            if (body.velocity) {
                position.x += body.velocity.x * deltaTime;
                position.y += body.velocity.y * deltaTime;
                position.z += body.velocity.z * deltaTime;
            }

            // Collision detection and resolution
            const collisions = this._detectCollisions(body);
            newCollisions.set(body, collisions);

            // Resolve collisions
            this._resolveCollisions(body, collisions);
        }

        // Emit collision events
        this._emitCollisionEvents(newCollisions);
    }

    /**
     * Detects collisions for a body using spatial hashing.
     * @private
     * @param {Object} body - Body to check collisions for.
     * @returns {Set<Object>} Set of colliding bodies.
     */
    _detectCollisions(body) {
        if (!body.getAABB) return new Set();

        const aabb = body.getAABB();
        if (!aabb) return new Set();

        const collisions = new Set();
        const candidates = this.spatialHash.getPotentialCollisions(body);

        for (const other of candidates) {
            if (!other.getAABB) continue;

            const layerA = body.collisionLayer || CollisionMask.Layers.DEFAULT;
            const maskA = body.collisionMask || CollisionMask.Layers.ALL;
            const layerB = other.collisionLayer || CollisionMask.Layers.DEFAULT;
            const maskB = other.collisionMask || CollisionMask.Layers.ALL;

            // Check collision mask
            if (!CollisionMask.shouldCollide(layerA, maskA, layerB, maskB)) {
                continue;
            }

            const otherAABB = other.getAABB();
            if (!otherAABB) continue;

            if (aabb.intersects(otherAABB)) {
                collisions.add(other);
            }
        }

        return collisions;
    }

    /**
     * Resolves collisions for a given body.
     * @private
     * @param {Object} body - Body to resolve collisions for.
     * @param {Set<Object>} collisions - Set of colliding bodies.
     */
    _resolveCollisions(body, collisions) {
        if (!body.getAABB || !collisions) return;

        const aabb = body.getAABB();
        if (!aabb) return;

        for (const other of collisions) {
            if (!other.getAABB) continue;
            const otherAABB = other.getAABB();
            if (!otherAABB) continue;

            // Skip resolution for triggers
            if (body.isTrigger || other.isTrigger) {
                continue;
            }

            this._resolveAABBCollision(body, aabb, other, otherAABB);
        }
    }

    /**
     * Resolves a collision between two AABBs by pushing the body out.
     * @private
     */
    _resolveAABBCollision(body, aabb, other, otherAABB) {
        // Guard against invalid AABBs
        if (!aabb || !aabb.min || !aabb.max || !otherAABB || !otherAABB.min || !otherAABB.max ||
            !(aabb.min instanceof Vector) || !(aabb.max instanceof Vector) ||
            !(otherAABB.min instanceof Vector) || !(otherAABB.max instanceof Vector) ||
            typeof aabb.min.x !== 'number' || typeof aabb.min.y !== 'number' || typeof aabb.min.z !== 'number' ||
            typeof aabb.max.x !== 'number' || typeof aabb.max.y !== 'number' || typeof aabb.max.z !== 'number' ||
            typeof otherAABB.min.x !== 'number' || typeof otherAABB.min.y !== 'number' || typeof otherAABB.min.z !== 'number' ||
            typeof otherAABB.max.x !== 'number' || typeof otherAABB.max.y !== 'number' || typeof otherAABB.max.z !== 'number') {
            return;
        }

        // Guard against invalid getCenter method
        if (!aabb.getCenter || typeof aabb.getCenter !== 'function' ||
            !otherAABB.getCenter || typeof otherAABB.getCenter !== 'function') {
            return;
        }

        const center = aabb.getCenter();
        const otherCenter = otherAABB.getCenter();
        if (!center || typeof center.x !== 'number' || typeof center.y !== 'number' || typeof center.z !== 'number' ||
            !otherCenter || typeof otherCenter.x !== 'number' || typeof otherCenter.y !== 'number' || typeof otherCenter.z !== 'number') {
            return;
        }

        // Guard against invalid body position
        const position = body.position || body.pos;
        if (!body || !position || typeof position.x !== 'number' || typeof position.y !== 'number' || typeof position.z !== 'number') {
            return;
        }

        // Simple push-out resolution
        const overlapX = Math.min(aabb.max.x, otherAABB.max.x) - Math.max(aabb.min.x, otherAABB.min.x);
        const overlapY = Math.min(aabb.max.y, otherAABB.max.y) - Math.max(aabb.min.y, otherAABB.min.y);
        const overlapZ = Math.min(aabb.max.z, otherAABB.max.z) - Math.max(aabb.min.z, otherAABB.min.z);

        // Find axis of minimum penetration
        if (overlapX < overlapY && overlapX < overlapZ) {
            const dir = center.x < otherCenter.x ? -1 : 1;
            position.x += overlapX * dir;
            if (body.velocity && typeof body.velocity.x === 'number') body.velocity.x = 0;
        } else if (overlapY < overlapX && overlapY < overlapZ) {
            const dir = center.y < otherCenter.y ? -1 : 1;
            position.y += overlapY * dir;
            if (body.velocity && typeof body.velocity.y === 'number') body.velocity.y = 0;
        } else {
            const dir = center.z < otherCenter.z ? -1 : 1;
            position.z += overlapZ * dir;
            if (body.velocity && typeof body.velocity.z === 'number') body.velocity.z = 0;
        }
    }

    /**
     * Raycast against all bodies.
     * @param {Vector} origin
     * @param {Vector} direction
     * @returns {object|null} Hit info { body, distance, point }
     */
    raycast(origin, direction) {
        let closestHit = null;
        let minDistance = Infinity;

        const allBodies = [...this.staticBodies, ...this.bodies];

        for (const body of allBodies) {
            if (!body.getAABB) continue;
            const aabb = body.getAABB();
            const distance = this._intersectRayAABB(origin, direction, aabb);

            if (distance !== null && distance < minDistance) {
                minDistance = distance;
                closestHit = {
                    body,
                    distance,
                    point: origin.add(direction.mul(distance))
                };
            }
        }

        return closestHit;
    }

    /**
     * Internal ray-AABB intersection test.
     * @private
     */
    _intersectRayAABB(origin, direction, aabb) {
        let tmin = (aabb.min.x - origin.x) / direction.x;
        let tmax = (aabb.max.x - origin.x) / direction.x;

        if (tmin > tmax) [tmin, tmax] = [tmax, tmin];

        let tymin = (aabb.min.y - origin.y) / direction.y;
        let tymax = (aabb.max.y - origin.y) / direction.y;

        if (tymin > tymax) [tymin, tymax] = [tymax, tymin];

        if ((tmin > tymax) || (tymin > tmax)) return null;

        if (tymin > tmin) tmin = tymin;
        if (tymax < tmax) tmax = tymax;

        let tzmin = (aabb.min.z - origin.z) / direction.z;
        let tzmax = (aabb.max.z - origin.z) / direction.z;

        if (tzmin > tzmax) [tzmin, tzmax] = [tzmax, tzmin];

        if ((tmin > tzmax) || (tzmin > tmax)) return null;

        if (tzmin > tmin) tmin = tzmin;
        if (tzmax < tmax) tmax = tzmax;

        return tmin >= 0 ? tmin : null;
    }

    /**
     * Emits collision events (onCollisionEnter, onCollisionStay, onCollisionExit).
     * @private
     * @param {Map<Object, Set<Object>>} newCollisions - Current frame collisions.
     */
    _emitCollisionEvents(newCollisions) {
        // Check for new collisions (enter)
        for (const [body, collisions] of newCollisions.entries()) {
            const previousCollisions = this.currentCollisions.get(body) || new Set();

            for (const other of collisions) {
                if (!previousCollisions.has(other)) {
                    // onCollisionEnter
                    if (typeof body.onCollisionEnter === 'function') {
                        body.onCollisionEnter(other);
                    }
                    if (typeof other.onCollisionEnter === 'function') {
                        other.onCollisionEnter(body);
                    }
                } else {
                    // onCollisionStay
                    if (typeof body.onCollisionStay === 'function') {
                        body.onCollisionStay(other);
                    }
                    if (typeof other.onCollisionStay === 'function') {
                        other.onCollisionStay(body);
                    }
                }
            }

            // Check for exited collisions
            for (const other of previousCollisions) {
                if (!collisions.has(other)) {
                    // onCollisionExit
                    if (typeof body.onCollisionExit === 'function') {
                        body.onCollisionExit(other);
                    }
                    if (typeof other.onCollisionExit === 'function') {
                        other.onCollisionExit(body);
                    }
                }
            }
        }

        // Update current collisions
        this.currentCollisions = newCollisions;
    }
}
