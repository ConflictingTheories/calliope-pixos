import { Table } from '../Table.js'
import { LuaError } from '../LuaError.js'
import { coerceArgToNumber, coerceArgToTable, LuaType } from '../utils.js'

/**
 * PixoScript Physics Library
 * Bindings for physics system functionality
 */

interface PhysicsOptions {
    mass?: number
    friction?: number
    restitution?: number
    useGravity?: boolean
    isTrigger?: boolean
    isDynamic?: boolean
    layer?: number
    mask?: number
}

function addPhysicsBody(entity: any, width: LuaType, height: LuaType, opts: any = {}) {
    if (!entity || typeof entity !== 'object') {
        throw new LuaError('Bad argument #1 to addPhysicsBody(): expected entity')
    }

    width = coerceArgToNumber(width, 'addPhysicsBody', 2)
    height = coerceArgToNumber(height, 'addPhysicsBody', 3)

    const options: PhysicsOptions = {}
    if (opts && typeof opts === 'object') {
        if ((opts as any).mass !== undefined) options.mass = coerceArgToNumber((opts as any).mass, 'addPhysicsBody', 4)
        if ((opts as any).friction !== undefined) options.friction = coerceArgToNumber((opts as any).friction, 'addPhysicsBody', 4)
        if ((opts as any).restitution !== undefined) options.restitution = coerceArgToNumber((opts as any).restitution, 'addPhysicsBody', 4)
        if ((opts as any).useGravity !== undefined) options.useGravity = Boolean((opts as any).useGravity)
        if ((opts as any).isTrigger !== undefined) options.isTrigger = Boolean((opts as any).isTrigger)
        if ((opts as any).isDynamic !== undefined) options.isDynamic = Boolean((opts as any).isDynamic)
        if ((opts as any).layer !== undefined) options.layer = coerceArgToNumber((opts as any).layer, 'addPhysicsBody', 4)
        if ((opts as any).mask !== undefined) options.mask = coerceArgToNumber((opts as any).mask, 'addPhysicsBody', 4)
    }

    // Create physics body through engine API
    if (global.engine && global.engine.physics) {
        const PhysicsBody = global.engine.physics.PhysicsBody
        if (PhysicsBody) {
            entity.physicsBody = new PhysicsBody(entity, width, height, options)
            global.engine.physics.addBody(entity.physicsBody)
            return entity.physicsBody
        }
    }

    throw new LuaError('Physics system not available')
}

function removePhysicsBody(entity) {
    if (!entity || typeof entity !== 'object') {
        throw new LuaError('Bad argument #1 to removePhysicsBody(): expected entity')
    }

    if (entity.physicsBody && global.engine && global.engine.physics) {
        global.engine.physics.removeBody(entity.physicsBody)
        entity.physicsBody = null
    }
}

function setVelocity(entity: any, x: LuaType, y: LuaType, z: LuaType = 0) {
    if (!entity || !entity.physicsBody) {
        throw new LuaError('Entity has no physics body')
    }

    x = coerceArgToNumber(x, 'setVelocity', 2)
    y = coerceArgToNumber(y, 'setVelocity', 3)
    z = coerceArgToNumber(z, 'setVelocity', 4)

    entity.physicsBody.setVelocity(x, y, z)
}

function getVelocity(entity: any): Table {
    if (!entity || !entity.physicsBody) {
        throw new LuaError('Entity has no physics body')
    }

    const vel = entity.physicsBody.getVelocity()
    const table = new Table() as any
    table.set('x', vel.x)
    table.set('y', vel.y)
    table.set('z', vel.z)
    return table
}

function applyForce(entity: any, x: LuaType, y: LuaType, z: LuaType = 0) {
    if (!entity || !entity.physicsBody) {
        throw new LuaError('Entity has no physics body')
    }

    x = coerceArgToNumber(x, 'applyForce', 2)
    y = coerceArgToNumber(y, 'applyForce', 3)
    z = coerceArgToNumber(z, 'applyForce', 4)

    const { Vector } = (global as any).engine.utils.math
    entity.physicsBody.applyForce(new Vector(x, y, z))
}

function applyImpulse(entity: any, x: LuaType, y: LuaType, z: LuaType = 0) {
    if (!entity || !entity.physicsBody) {
        throw new LuaError('Entity has no physics body')
    }

    x = coerceArgToNumber(x, 'applyImpulse', 2)
    y = coerceArgToNumber(y, 'applyImpulse', 3)
    z = coerceArgToNumber(z, 'applyImpulse', 4)

    const { Vector } = (global as any).engine.utils.math
    entity.physicsBody.applyImpulse(new Vector(x, y, z))
}

function getSpeed(entity: any): number {
    if (!entity || !entity.physicsBody) {
        throw new LuaError('Entity has no physics body')
    }

    return entity.physicsBody.getSpeed()
}

function freeze(entity: any, x: boolean = true, y: boolean = true, z: boolean = false) {
    if (!entity || !entity.physicsBody) {
        throw new LuaError('Entity has no physics body')
    }

    if (x) entity.physicsBody.setFrozen('x', true)
    if (y) entity.physicsBody.setFrozen('y', true)
    if (z) entity.physicsBody.setFrozen('z', true)
}

function unfreeze(entity: any, x: boolean = true, y: boolean = true, z: boolean = false) {
    if (!entity || !entity.physicsBody) {
        throw new LuaError('Entity has no physics body')
    }

    if (x) entity.physicsBody.setFrozen('x', false)
    if (y) entity.physicsBody.setFrozen('y', false)
    if (z) entity.physicsBody.setFrozen('z', false)
}

function raycast(x: LuaType, y: LuaType, z: LuaType, dirX: LuaType, dirY: LuaType, dirZ: LuaType, maxDist: LuaType = 1000) {
    x = coerceArgToNumber(x, 'raycast', 1)
    y = coerceArgToNumber(y, 'raycast', 2)
    z = coerceArgToNumber(z, 'raycast', 3)
    dirX = coerceArgToNumber(dirX, 'raycast', 4)
    dirY = coerceArgToNumber(dirY, 'raycast', 5)
    dirZ = coerceArgToNumber(dirZ, 'raycast', 6)
    maxDist = coerceArgToNumber(maxDist, 'raycast', 7)

    if (!(global as any).engine || !(global as any).engine.physics) {
        throw new LuaError('Physics system not available')
    }

    const { Vector } = (global as any).engine.utils.math
    const origin = new Vector(x, y, z)
    const direction = new Vector(dirX, dirY, dirZ).normalize()

    const hit = (global as any).engine.physics.raycast(origin, direction)

    if (!hit) return null

    const result = new Table() as any
    result.set('body', hit.body)
    result.set('distance', hit.distance)
    const point = new Table() as any
    point.set('x', hit.point.x)
    point.set('y', hit.point.y)
    point.set('z', hit.point.z)
    result.set('point', point)

    return result
}

function queryCollisions(x: LuaType, y: LuaType, width: LuaType, height: LuaType) {
    x = coerceArgToNumber(x, 'queryCollisions', 1)
    y = coerceArgToNumber(y, 'queryCollisions', 2)
    width = coerceArgToNumber(width, 'queryCollisions', 3)
    height = coerceArgToNumber(height, 'queryCollisions', 4)

    if (!(global as any).engine || !(global as any).engine.physics) {
        throw new LuaError('Physics system not available')
    }

    const { Vector } = (global as any).engine.utils.math
    const { AABB } = (global as any).engine.utils.collision

    const aabb = new AABB(
        new Vector(x, y, 0),
        new Vector(x + width, y + height, 1)
    )

    const candidates = (global as any).engine.physics.spatialHash.getPotentialCollisions({ getAABB: () => aabb })

    const result = new Table() as any
    for (let i = 0; i < candidates.length; i++) {
        result.set(i + 1, candidates[i])
    }

    return result
}

export const metatable = new Table() as any
metatable.set('addPhysicsBody', addPhysicsBody)
metatable.set('removePhysicsBody', removePhysicsBody)
metatable.set('setVelocity', setVelocity)
metatable.set('getVelocity', getVelocity)
metatable.set('applyForce', applyForce)
metatable.set('applyImpulse', applyImpulse)
metatable.set('getSpeed', getSpeed)
metatable.set('freeze', freeze)
metatable.set('unfreeze', unfreeze)
metatable.set('raycast', raycast)
metatable.set('queryCollisions', queryCollisions)

/**
 * Physics library initialization
 * @param {Object} engine - Game engine instance
 * @returns {Table} Physics API table
 */
export function initPhysicsLibrary(engine: any): Table {
    (global as any).engine = engine

    const lib = new Table() as any

    // Entity methods
    lib.set('addPhysicsBody', addPhysicsBody)
    lib.set('removePhysicsBody', removePhysicsBody)
    lib.set('setVelocity', setVelocity)
    lib.set('getVelocity', getVelocity)
    lib.set('applyForce', applyForce)
    lib.set('applyImpulse', applyImpulse)
    lib.set('getSpeed', getSpeed)
    lib.set('freeze', freeze)
    lib.set('unfreeze', unfreeze)

    // World queries
    lib.set('raycast', raycast)
    lib.set('queryCollisions', queryCollisions)

    return lib
}
