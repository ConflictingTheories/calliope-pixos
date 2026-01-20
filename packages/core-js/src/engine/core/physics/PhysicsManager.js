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

/**
 * PhysicsManager - Handles collisions and simple physics simulation.
 */
export default class PhysicsManager {
    constructor(engine) {
        this.engine = engine;
        this.bodies = [];
        this.staticBodies = [];
    }

    /**
     * Adds a dynamic body to the physics simulation.
     * @param {object} body - Object with position, velocity, and getAABB()
     */
    addBody(body) {
        if (!this.bodies.includes(body)) {
            this.bodies.push(body);
        }
    }

    /**
     * Removes a dynamic body.
     */
    removeBody(body) {
        this.bodies = this.bodies.filter(b => b !== body);
    }

    /**
     * Adds a static body (e.g., wall, floor).
     */
    addStaticBody(body) {
        if (!this.staticBodies.includes(body)) {
            this.staticBodies.push(body);
        }
    }

    /**
     * Clears all bodies.
     */
    clear() {
        this.bodies = [];
        this.staticBodies = [];
    }

    /**
     * Updates the physics simulation.
     * @param {number} deltaTime - Time since last update in seconds.
     */
    update(deltaTime) {
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

            // Collision resolution
            this._resolveCollisions(body);
        }
    }

    /**
     * Resolves collisions for a given body against all other bodies.
     * @private
     */
    _resolveCollisions(body) {
        if (!body.getAABB) return;

        const aabb = body.getAABB();
        if (!aabb) return;

        // Check against static bodies
        for (const staticBody of this.staticBodies) {
            if (!staticBody.getAABB) continue;
            const staticAABB = staticBody.getAABB();
            if (!staticAABB) continue;

            if (aabb.intersects(staticAABB)) {
                this._resolveAABBCollision(body, aabb, staticBody, staticAABB);
            }
        }

        // Check against other dynamic bodies
        for (const other of this.bodies) {
            if (body === other || !other.getAABB) continue;
            const otherAABB = other.getAABB();
            if (!otherAABB) continue;

            if (aabb.intersects(otherAABB)) {
                this._resolveAABBCollision(body, aabb, other, otherAABB);
            }
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
}
