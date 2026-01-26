import { describe, it, expect, beforeEach } from 'vitest';
import PhysicsBody from '../src/engine/core/physics/PhysicsBody.js';
import PhysicsManager from '../src/engine/core/physics/PhysicsManager.js';
import { Vector } from '../src/engine/utils/math/vector.js';
import { AABB } from '../src/engine/utils/math/collision.js';

describe('PhysicsBody', () => {
    let entity;
    let body;

    beforeEach(() => {
        entity = {
            position: new Vector(100, 100, 0),
            pos: null,
        };
        body = new PhysicsBody(entity, 50, 50, { mass: 1 });
    });

    describe('constructor', () => {
        it('should create a physics body with default properties', () => {
            expect(body.mass).toBe(1);
            expect(body.isDynamic).toBe(true);
            expect(body.isTrigger).toBe(false);
            expect(body.friction).toBe(0);
            expect(body.useGravity).toBe(false);
        });

        it('should accept options', () => {
            const opts = {
                mass: 2,
                friction: 0.5,
                useGravity: true,
                isTrigger: true,
            };
            const customBody = new PhysicsBody(entity, 50, 50, opts);
            expect(customBody.mass).toBe(2);
            expect(customBody.friction).toBe(0.5);
            expect(customBody.useGravity).toBe(true);
            expect(customBody.isTrigger).toBe(true);
        });

        it('should calculate inverse mass correctly', () => {
            expect(body.inverseMass).toBe(1);
            const massless = new PhysicsBody(entity, 50, 50, { mass: 0 });
            expect(massless.inverseMass).toBe(0);
        });
    });

    describe('getAABB', () => {
        it('should return correct AABB', () => {
            const aabb = body.getAABB();
            expect(aabb.min.x).toBe(75); // 100 - 50/2
            expect(aabb.min.y).toBe(75);
            expect(aabb.max.x).toBe(125); // 100 + 50/2
            expect(aabb.max.y).toBe(125);
        });

        it('should include offset', () => {
            body.offset = new Vector(10, 20, 0);
            const aabb = body.getAABB();
            expect(aabb.min.x).toBe(85); // 100 + 10 - 50/2
            expect(aabb.min.y).toBe(95); // 100 + 20 - 50/2
        });
    });

    describe('velocity and forces', () => {
        it('should apply force correctly', () => {
            const force = new Vector(10, 0, 0);
            body.applyForce(force);
            expect(body.acceleration.x).toBeCloseTo(10);
        });

        it('should apply impulse', () => {
            const impulse = new Vector(5, 10, 0);
            body.applyImpulse(impulse);
            expect(body.velocity.x).toBe(5);
            expect(body.velocity.y).toBe(10);
        });

        it('should set velocity with constraints', () => {
            body.constraints.freezeX = true;
            body.setVelocity(10, 20, 0);
            expect(body.velocity.x).toBe(0); // Frozen
            expect(body.velocity.y).toBe(20);
        });

        it('should calculate speed', () => {
            body.velocity = new Vector(3, 4, 0);
            expect(body.getSpeed()).toBe(5); // sqrt(3^2 + 4^2)
        });
    });

    describe('update', () => {
        it('should update position based on velocity', () => {
            body.velocity = new Vector(10, 0, 0);
            body.update(1.0);
            expect(entity.position.x).toBeCloseTo(110);
        });

        it('should apply gravity when enabled', () => {
            body.useGravity = true;
            const gravity = new Vector(0, -9.8, 0);
            body.update(1.0, gravity);
            expect(body.velocity.y).toBeCloseTo(-9.8);
        });

        it('should apply friction', () => {
            body.friction = 0.5;
            body.velocity = new Vector(10, 10, 0);
            body.update(1.0);
            // velocity *= (1 - friction * dt) = 10 * 0.5 = 5
            expect(body.velocity.x).toBeCloseTo(5);
            expect(body.velocity.y).toBeCloseTo(5);
        });

        it('should sleep when below threshold', () => {
            body.velocity = new Vector(0.001, 0.001, 0);
            body.update(1.0);
            expect(body.isAsleep).toBe(true);
        });

        it('should respect freeze constraints', () => {
            body.constraints.freezeY = true;
            body.velocity = new Vector(10, 20, 0);
            const initialY = entity.position.y;
            body.update(1.0);
            expect(entity.position.x).toBeCloseTo(110);
            expect(entity.position.y).toBe(initialY);
        });
    });

    describe('sleep', () => {
        it('should wake up sleeping body', () => {
            body.isAsleep = true;
            body.wake();
            expect(body.isAsleep).toBe(false);
        });
    });

    describe('clone', () => {
        it('should clone body with same properties', () => {
            body.velocity = new Vector(5, 10, 0);
            body.friction = 0.5;

            const newEntity = { position: new Vector(0, 0, 0) };
            const clone = body.clone(newEntity);

            expect(clone.mass).toBe(body.mass);
            expect(clone.friction).toBe(body.friction);
            expect(clone.velocity.x).toBe(5);
            expect(clone.velocity.y).toBe(10);
            expect(clone.entity).toBe(newEntity);
        });
    });
});

describe('PhysicsManager', () => {
    let engine;
    let manager;

    beforeEach(() => {
        engine = {
            emit: () => { },
        };
        manager = new PhysicsManager(engine);
    });

    describe('body management', () => {
        it('should add and remove dynamic bodies', () => {
            const entity = {
                position: new Vector(0, 0, 0),
                getAABB: () => new AABB(new Vector(-10, -10, 0), new Vector(10, 10, 0)),
            };

            manager.addBody(entity, 20, 20);
            expect(manager.bodies).toContain(entity);

            manager.removeBody(entity);
            expect(manager.bodies).not.toContain(entity);
        });

        it('should add static bodies', () => {
            const entity = {
                position: new Vector(0, 0, 0),
                getAABB: () => new AABB(new Vector(-50, -50, 0), new Vector(50, 50, 0)),
            };

            manager.addStaticBody(entity);
            expect(manager.staticBodies).toContain(entity);
        });

        it('should clear all bodies', () => {
            const entity = { position: new Vector(0, 0, 0) };
            manager.addBody(entity);
            manager.clear();
            expect(manager.bodies).toHaveLength(0);
            expect(manager.staticBodies).toHaveLength(0);
        });
    });

    describe('collision detection', () => {
        it('should detect collisions between AABBs', () => {
            const entity1 = {
                position: new Vector(0, 0, 0),
                velocity: new Vector(0, 0, 0),
                getAABB: () => new AABB(new Vector(-10, -10, 0), new Vector(10, 10, 0)),
                collisionLayer: 1,
                collisionMask: 0xFFFF,
                isTrigger: false,
            };

            const entity2 = {
                position: new Vector(5, 5, 0),
                velocity: new Vector(0, 0, 0),
                getAABB: () => new AABB(new Vector(-5, -5, 0), new Vector(15, 15, 0)),
                collisionLayer: 1,
                collisionMask: 0xFFFF,
                isTrigger: false,
            };

            manager.addBody(entity1);
            manager.addBody(entity2);

            const collisions = manager._detectCollisions(entity1);
            expect(collisions.size).toBe(1);
            expect(collisions.has(entity2)).toBe(true);
        });

        it('should not detect collisions with incompatible masks', () => {
            const entity1 = {
                position: new Vector(0, 0, 0),
                velocity: new Vector(0, 0, 0),
                getAABB: () => new AABB(new Vector(-10, -10, 0), new Vector(10, 10, 0)),
                collisionLayer: 1,
                collisionMask: 0, // No collision mask
            };

            const entity2 = {
                position: new Vector(5, 5, 0),
                velocity: new Vector(0, 0, 0),
                getAABB: () => new AABB(new Vector(-5, -5, 0), new Vector(15, 15, 0)),
                collisionLayer: 1,
                collisionMask: 0xFFFF,
            };

            manager.addBody(entity1);
            manager.addBody(entity2);

            const collisions = manager._detectCollisions(entity1);
            expect(collisions.size).toBe(0);
        });
    });

    describe('events', () => {
        it('should fire collision enter events', (done) => {
            const entity1 = {
                position: new Vector(0, 0, 0),
                velocity: new Vector(0, 0, 0),
                getAABB: () => new AABB(new Vector(-10, -10, 0), new Vector(10, 10, 0)),
                collisionLayer: 1,
                collisionMask: 0xFFFF,
                isTrigger: false,
                onCollisionEnter: (other) => {
                    expect(other).toBe(entity2);
                    done();
                },
            };

            const entity2 = {
                position: new Vector(5, 5, 0),
                velocity: new Vector(0, 0, 0),
                getAABB: () => new AABB(new Vector(-5, -5, 0), new Vector(15, 15, 0)),
                collisionLayer: 1,
                collisionMask: 0xFFFF,
                isTrigger: false,
            };

            manager.addBody(entity1);
            manager.addBody(entity2);
            manager.update(0.016);
        });

        it('should fire collision exit events', (done) => {
            let frameCount = 0;
            const entity1 = {
                position: new Vector(0, 0, 0),
                velocity: new Vector(20, 0, 0), // Moving away
                getAABB: () => new AABB(
                    new Vector(entity1.position.x - 10, -10, 0),
                    new Vector(entity1.position.x + 10, 10, 0)
                ),
                collisionLayer: 1,
                collisionMask: 0xFFFF,
                isTrigger: false,
                onCollisionExit: (other) => {
                    expect(frameCount).toBe(2);
                    done();
                },
            };

            const entity2 = {
                position: new Vector(15, 0, 0),
                velocity: new Vector(0, 0, 0),
                getAABB: () => new AABB(new Vector(5, -10, 0), new Vector(25, 10, 0)),
                collisionLayer: 1,
                collisionMask: 0xFFFF,
                isTrigger: false,
            };

            manager.addBody(entity1);
            manager.addBody(entity2);

            // Frame 1: collision
            manager.update(0.016);
            frameCount++;

            // Frame 2: still colliding
            manager.update(0.016);
            frameCount++;

            // Frame 3: no longer colliding, should trigger exit
            manager.update(0.016);
            frameCount++;
        });
    });
});
