/*                                                 *\
** ----------------------------------------------- **
**          Calliope - PixoScript Engine           **
** ----------------------------------------------- **
**  Copyright (c) 2020-2025 - Kyle Derby MacInnis  **
**                                                 **
**    Any unauthorized distribution or transfer    **
**       of this work is strictly prohibited.      **
**                                                 **
**               All Rights Reserved.              **
** ----------------------------------------------- **
\*                                                 */

import { Table } from '../Table.js'
import { LuaError } from '../LuaError.js'
import { LuaType } from '../utils.js'

/**
 * Coroutine states matching Lua semantics
 */
type CoroutineStatus = 'suspended' | 'running' | 'normal' | 'dead'

/**
 * Represents a Lua-style coroutine implemented using JavaScript generators.
 */
export class Coroutine {
  /** Unique identifier for debugging */
  public id: string

  /** Current status of the coroutine */
  public status: CoroutineStatus

  /** The generator function that powers this coroutine */
  private generatorFn: (...args: LuaType[]) => Generator<LuaType[], LuaType[], LuaType[]>

  /** The generator instance */
  private generator: Generator<LuaType[], LuaType[], LuaType[]> | null

  /** Values passed to resume that should be returned by yield */
  private resumeValues: LuaType[]

  /** Values yielded that should be returned by resume */
  private yieldValues: LuaType[]

  /** Error that caused coroutine to die */
  private error: Error | null

  /** Parent coroutine (if resumed from within another coroutine) */
  public parent: Coroutine | null

  /** Static reference to currently running coroutine */
  private static currentCoroutine: Coroutine | null = null

  constructor(fn: Function, id?: string) {
    this.id = id || `co_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`
    this.status = 'suspended'
    this.generator = null
    this.resumeValues = []
    this.yieldValues = []
    this.error = null
    this.parent = null

    // Wrap the function in a generator
    const self = this
    this.generatorFn = function* (...args: LuaType[]): Generator<LuaType[], LuaType[], LuaType[]> {
      try {
        // First yield is to receive initial resume args
        const initialArgs = yield []
        
        // Call the actual function with combined args
        const result = fn(...(args.length > 0 ? args : initialArgs))
        
        // If result is iterable (generator), yield its values
        if (result && typeof result[Symbol.iterator] === 'function' && typeof result !== 'string') {
          for (const value of result) {
            const resumeArgs = yield [value]
            // Resume args are available but typically ignored in simple yields
          }
        }
        
        return Array.isArray(result) ? result : [result]
      } catch (e) {
        self.error = e instanceof Error ? e : new Error(String(e))
        throw e
      }
    }
  }

  /**
   * Creates a new coroutine from a function.
   */
  static create(fn: LuaType): Coroutine {
    if (typeof fn !== 'function') {
      throw new LuaError('bad argument #1 to create (function expected)')
    }
    return new Coroutine(fn)
  }

  /**
   * Resumes execution of a coroutine.
   * Returns [success, ...values] where success is true if no error occurred.
   */
  static resume(co: LuaType, ...args: LuaType[]): LuaType[] {
    if (!(co instanceof Coroutine)) {
      throw new LuaError('bad argument #1 to resume (coroutine expected)')
    }

    if (co.status === 'dead') {
      return [false, 'cannot resume dead coroutine']
    }

    if (co.status === 'running') {
      return [false, 'cannot resume running coroutine']
    }

    try {
      // Track parent/child relationship for normal status
      const previousCoroutine = Coroutine.currentCoroutine
      if (previousCoroutine) {
        previousCoroutine.status = 'normal'
        co.parent = previousCoroutine
      }

      co.status = 'running'
      Coroutine.currentCoroutine = co

      // Initialize generator on first resume
      if (!co.generator) {
        co.generator = co.generatorFn(...args)
        // Start the generator
        co.generator.next()
      }

      // Send values and get next yield
      const result = co.generator.next(args)

      if (result.done) {
        co.status = 'dead'
        Coroutine.currentCoroutine = previousCoroutine
        if (previousCoroutine) {
          previousCoroutine.status = 'running'
        }
        return [true, ...(result.value || [])]
      }

      co.status = 'suspended'
      Coroutine.currentCoroutine = previousCoroutine
      if (previousCoroutine) {
        previousCoroutine.status = 'running'
      }

      return [true, ...(result.value || [])]
    } catch (e) {
      co.status = 'dead'
      const errorMsg = e instanceof Error ? e.message : String(e)
      return [false, errorMsg]
    }
  }

  /**
   * Yields from the currently running coroutine.
   * Returns the values passed to the next resume call.
   */
  static yield(...values: LuaType[]): LuaType[] {
    // This is a placeholder - actual yield happens via generator yield
    // The implementation requires the coroutine function to be a generator
    throw new LuaError('yield called outside of coroutine')
  }

  /**
   * Returns the status of a coroutine.
   */
  static status(co: LuaType): CoroutineStatus {
    if (!(co instanceof Coroutine)) {
      throw new LuaError('bad argument #1 to status (coroutine expected)')
    }
    return co.status
  }

  /**
   * Returns the running coroutine plus a boolean indicating if it's the main thread.
   */
  static running(): [Coroutine | null, boolean] {
    return [Coroutine.currentCoroutine, Coroutine.currentCoroutine === null]
  }

  /**
   * Returns true if the coroutine can yield (is not in the main thread).
   */
  static isyieldable(): boolean {
    return Coroutine.currentCoroutine !== null
  }

  /**
   * Wraps a function so that each call resumes it as a coroutine.
   * Returns a function that, when called, resumes the coroutine.
   */
  static wrap(fn: LuaType): Function {
    if (typeof fn !== 'function') {
      throw new LuaError('bad argument #1 to wrap (function expected)')
    }

    const co = Coroutine.create(fn)

    return function (...args: LuaType[]): LuaType {
      const result = Coroutine.resume(co as unknown as LuaType, ...args)
      if (result[0] === false) {
        throw new LuaError(String(result[1]))
      }
      // Return all values except the success flag
      if (result.length === 2) {
        return result[1]
      }
      // Return as table for multiple values
      const returnTable = new Table()
      for (let i = 1; i < result.length; i++) {
        returnTable.set(i, result[i])
      }
      return returnTable
    }
  }

  /**
   * Closes a coroutine, transitioning it to dead status.
   */
  static close(co: LuaType): [boolean, string?] {
    if (!(co instanceof Coroutine)) {
      throw new LuaError('bad argument #1 to close (coroutine expected)')
    }

    if (co.status === 'running') {
      return [false, 'cannot close running coroutine']
    }

    co.status = 'dead'
    co.generator = null
    return [true]
  }
}

/**
 * Creates a coroutine-enabled function that can yield.
 * This is a helper for creating generator-based coroutines.
 */
export function* yieldable(fn: Function): Generator<LuaType[], LuaType[], LuaType[]> {
  const result = fn()
  if (result !== undefined) {
    yield Array.isArray(result) ? result : [result]
  }
  return []
}

/**
 * Creates the coroutine library table for PixoScript.
 */
export const libCoroutine = new Table()

// Add all coroutine functions to the library table
libCoroutine.set('create', Coroutine.create)
libCoroutine.set('resume', Coroutine.resume)
libCoroutine.set('yield', Coroutine.yield)
libCoroutine.set('status', Coroutine.status)
libCoroutine.set('running', Coroutine.running)
libCoroutine.set('isyieldable', Coroutine.isyieldable)
libCoroutine.set('wrap', Coroutine.wrap)
libCoroutine.set('close', Coroutine.close)

export default libCoroutine
