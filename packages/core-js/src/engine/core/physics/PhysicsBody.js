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

import { Vector } from '../../utils/math/vector.js';
import { AABB } from '../../utils/math/collision.js';

/**
 * PhysicsBody - Physics component attached to entities.
 * Represents a rigid body with position, velocity, and collision properties.
 */
export default class PhysicsBody {
    /**
     * Creates a physics body.
     * @param {Object} entity - The entity this body belongs to
     * @param {number} width - Body width in pixels
     * @param {number} height - Body height in pixels
     * @param {Object} options - Configuration options
     * @param {number} options.mass - Mass (default: 1)
     * @param {number} options.layer - Collision layer (default: 1)
     * @param {number} options.mask - Collision mask (default: 0xFFFF)
     * @param {boolean} options.isDynamic - Is dynamic body (default: true)
     * @param {boolean} options.isTrigger - Is trigger/sensor (default: false)
     * @param {number} options.friction - Friction coefficient (default: 0)
     * @param {number} options.restitution - Bounciness (default: 0)
     * @param {boolean} options.useGravity - Apply gravity (default: false)
     * @param {Vector} options.offset - Position offset from entity (default: {0,0,0})
     */
    constructor(entity, width, height, options = {}) {
        this.entity = entity;
        this.width = width;
        this.height = height;

        // Physics properties
        this.mass = options.mass ?? 1;
        this.inverseMass = this.mass > 0 ? 1 / this.mass : 0;
        this.friction = options.friction ?? 0;
        this.restitution = options.restitution ?? 0;
        this.useGravity = options.useGravity ?? false;

        // Collision properties
        this.collisionLayer = options.layer ?? 1;
        this.collisionMask = options.mask ?? 0xFFFF;
        this.isDynamic = options.isDynamic ?? true;
        this.isTrigger = options.isTrigger ?? false;

        // Offset from entity position
        this.offset = options.offset ?? new Vector(0, 0, 0);

        // Velocity and acceleration
        this.velocity = new Vector(0, 0, 0);
        this.acceleration = new Vector(0, 0, 0);

        // State
        this.isAsleep = false;
        this.sleepThreshold = 0.01;

        // Collision events
        this.onCollisionEnter = null;
        this.onCollisionStay = null;
        this.onCollisionExit = null;

        // Constraints
        this.constraints = {
            freezeX: false,
            freezeY: false,
            freezeZ: false,
            freezeRotationX: false,
            freezeRotationY: false,
            freezeRotationZ: false,
        };
    }

    /**
     * Gets the AABB (bounding box) for this body.
     * @returns {AABB} Bounding box in world space
     */
    getAABB() {
        const pos = this.entity.position || this.entity.pos || new Vector(0, 0, 0);
        const x = pos.x + this.offset.x;
        const y = pos.y + this.offset.y;
        const z = pos.z + this.offset.z;

        return new AABB(
            new Vector(x - this.width / 2, y - this.height / 2, z),
            new Vector(x + this.width / 2, y + this.height / 2, z + 1)
        );
    }

    /**
     * Applies a force to this body.
     * @param {Vector} force - Force to apply
     * @param {number} deltaTime - Time delta
     */
    applyForce(force, deltaTime = 1) {
        if (this.mass <= 0 || !this.isDynamic) return;

        const accel = force.mul(this.inverseMass);
        this.acceleration = this.acceleration.add(accel);
    }

    /**
     * Applies an impulse (instant velocity change).
     * @param {Vector} impulse - Impulse vector
     */
    applyImpulse(impulse) {
        if (this.mass <= 0 || !this.isDynamic) return;

        this.velocity = this.velocity.add(impulse.mul(this.inverseMass));
    }

    /**
     * Sets velocity on specific axes.
     * @param {number|null} x - X velocity (null to keep)
     * @param {number|null} y - Y velocity (null to keep)
     * @param {number|null} z - Z velocity (null to keep)
     */
    setVelocity(x, y, z) {
        if (!this.isDynamic) return;
        if (x !== null && !this.constraints.freezeX) this.velocity.x = x;
        if (y !== null && !this.constraints.freezeY) this.velocity.y = y;
        if (z !== null && !this.constraints.freezeZ) this.velocity.z = z;
    }

    /**
     * Gets current velocity.
     * @returns {Vector} Velocity vector
     */
    getVelocity() {
        return this.velocity.clone();
    }

    /**
     * Gets current speed (magnitude of velocity).
     * @returns {number} Speed
     */
    getSpeed() {
        return this.velocity.magnitude();
    }

    /**
     * Freezes/unfreezes movement on an axis.
     * @param {string} axis - 'x', 'y', or 'z'
     * @param {boolean} frozen - Is frozen
     */
    setFrozen(axis, frozen) {
        const key = `freeze${axis.toUpperCase()}`;
        if (this.constraints.hasOwnProperty(key)) {
            this.constraints[key] = frozen;
        }
    }

    /**
     * Updates the body (called by physics manager).
     * @param {number} deltaTime - Time since last update in seconds
     * @param {Vector} gravity - Global gravity vector
     */
    update(deltaTime, gravity = new Vector(0, 0, 0)) {
        if (!this.isDynamic || this.isAsleep) return;

        // Apply gravity
        if (this.useGravity) {
            this.acceleration = this.acceleration.add(gravity);
        }

        // Update velocity
        if (!this.constraints.freezeX) {
            this.velocity.x += this.acceleration.x * deltaTime;
        }
        if (!this.constraints.freezeY) {
            this.velocity.y += this.acceleration.y * deltaTime;
        }
        if (!this.constraints.freezeZ) {
            this.velocity.z += this.acceleration.z * deltaTime;
        }

        // Apply friction
        if (this.friction > 0) {
            this.velocity = this.velocity.mul(1 - this.friction * deltaTime);
        }

        // Update position
        const pos = this.entity.position || this.entity.pos;
        if (pos) {
            if (!this.constraints.freezeX) pos.x += this.velocity.x * deltaTime;
            if (!this.constraints.freezeY) pos.y += this.velocity.y * deltaTime;
            if (!this.constraints.freezeZ) pos.z += this.velocity.z * deltaTime;
        }

        // Reset acceleration
        this.acceleration = new Vector(0, 0, 0);

        // Sleep detection
        if (this.getSpeed() < this.sleepThreshold) {
            this.isAsleep = true;
            this.velocity = new Vector(0, 0, 0);
        }
    }

    /**
     * Wakes up a sleeping body.
     */
    wake() {
        this.isAsleep = false;
    }

    /**
     * Clones this body (for entity cloning).
     * @returns {PhysicsBody} New body
     */
    clone(newEntity) {
        const clone = new PhysicsBody(newEntity, this.width, this.height, {
            mass: this.mass,
            layer: this.collisionLayer,
            mask: this.collisionMask,
            isDynamic: this.isDynamic,
            isTrigger: this.isTrigger,
            friction: this.friction,
            restitution: this.restitution,
            useGravity: this.useGravity,
            offset: this.offset.clone(),
        });
        clone.velocity = this.velocity.clone();
        return clone;
    }
}
