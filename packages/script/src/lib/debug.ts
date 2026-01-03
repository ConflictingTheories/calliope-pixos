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
import { LuaType, coerceArgToNumber, coerceArgToString } from '../utils.js'
import { Coroutine } from './coroutine.js'

/**
 * Debug hook types
 */
type HookEvent = 'call' | 'return' | 'line' | 'count' | 'tail call'
type HookFunction = (event: HookEvent, line?: number) => void

/**
 * Function info structure
 */
interface FunctionInfo {
  source?: string
  short_src?: string
  linedefined?: number
  lastlinedefined?: number
  what?: string
  name?: string
  namewhat?: string
  nups?: number
  nparams?: number
  isvararg?: boolean
  istailcall?: boolean
  currentline?: number
  func?: Function
}

/**
 * Debug library state
 */
let currentHook: HookFunction | null = null
let hookMask: string = ''
let hookCount: number = 0

/**
 * Gets information about a function.
 * @param f - Function or stack level
 * @param what - What information to retrieve
 */
function getinfo(f: LuaType, what?: LuaType): Table | undefined {
  const info = new Table()
  
  if (typeof f === 'function') {
    // Get info about a function
    info.set('what', 'Lua')
    info.set('source', '[JavaScript]')
    info.set('short_src', '[JavaScript]')
    info.set('linedefined', 0)
    info.set('lastlinedefined', 0)
    info.set('nups', 0)
    info.set('nparams', f.length)
    info.set('isvararg', true)
    info.set('name', f.name || 'anonymous')
    info.set('namewhat', f.name ? 'function' : '')
    info.set('func', f)
  } else if (typeof f === 'number') {
    // Stack level - limited support in JavaScript
    info.set('what', 'main')
    info.set('source', '[main]')
    info.set('short_src', '[main]')
    info.set('currentline', -1)
  }
  
  return info
}

/**
 * Gets the value of a local variable.
 * @param level - Stack level
 * @param index - Local variable index
 */
function getlocal(level: LuaType, index: LuaType): [string | undefined, LuaType] {
  // Limited implementation - JavaScript doesn't expose locals easily
  const lvl = coerceArgToNumber(level, 'getlocal', 1)
  const idx = coerceArgToNumber(index, 'getlocal', 2)
  
  // Return nil for now - full implementation would require instrumentation
  return [undefined, undefined]
}

/**
 * Sets the value of a local variable.
 * @param level - Stack level
 * @param index - Local variable index
 * @param value - New value
 */
function setlocal(level: LuaType, index: LuaType, value: LuaType): string | undefined {
  // Limited implementation
  const lvl = coerceArgToNumber(level, 'setlocal', 1)
  const idx = coerceArgToNumber(index, 'setlocal', 2)
  
  // Return nil - modification not supported
  return undefined
}

/**
 * Gets the value of an upvalue.
 * @param f - Function
 * @param index - Upvalue index
 */
function getupvalue(f: LuaType, index: LuaType): [string | undefined, LuaType] {
  if (typeof f !== 'function') {
    throw new LuaError('bad argument #1 to getupvalue (function expected)')
  }
  const idx = coerceArgToNumber(index, 'getupvalue', 2)
  
  // JavaScript closures don't expose upvalues directly
  return [undefined, undefined]
}

/**
 * Sets the value of an upvalue.
 * @param f - Function
 * @param index - Upvalue index
 * @param value - New value
 */
function setupvalue(f: LuaType, index: LuaType, value: LuaType): string | undefined {
  if (typeof f !== 'function') {
    throw new LuaError('bad argument #1 to setupvalue (function expected)')
  }
  
  // Not supported in JavaScript
  return undefined
}

/**
 * Sets a hook function.
 * @param hook - Hook function or nil to remove
 * @param mask - Hook mask string ('c', 'r', 'l')
 * @param count - Hook count (for 'count' mask)
 */
function sethook(
  hook: LuaType,
  mask?: LuaType,
  count?: LuaType
): void {
  if (hook === undefined || hook === null) {
    currentHook = null
    hookMask = ''
    hookCount = 0
    return
  }
  
  if (typeof hook !== 'function') {
    throw new LuaError('bad argument #1 to sethook (function expected)')
  }
  
  currentHook = hook as HookFunction
  hookMask = mask ? coerceArgToString(mask, 'sethook', 2) : ''
  hookCount = count ? coerceArgToNumber(count, 'sethook', 3) : 0
}

/**
 * Gets the current hook settings.
 */
function gethook(): [HookFunction | undefined, string, number] {
  return [currentHook || undefined, hookMask, hookCount]
}

/**
 * Returns a string with a traceback of the call stack.
 * @param message - Optional message to include
 * @param level - Stack level to start from
 */
function traceback(message?: LuaType, level?: LuaType): string {
  const msg = message !== undefined ? coerceArgToString(message, 'traceback', 1) : ''
  const lvl = level !== undefined ? coerceArgToNumber(level, 'traceback', 2) : 1
  
  // Capture JavaScript stack
  const stack = new Error().stack || ''
  const lines = stack.split('\n').slice(lvl + 2) // Skip traceback and Error constructor
  
  let result = msg ? msg + '\n' : ''
  result += 'stack traceback:\n'
  
  for (let i = 0; i < lines.length && i < 20; i++) {
    const line = lines[i].trim()
    if (line) {
      result += '\t' + line + '\n'
    }
  }
  
  return result.trim()
}

/**
 * Gets or sets the metatable of an object.
 * Unlike getmetatable, this doesn't honor __metatable.
 */
function getmetatable(value: LuaType): Table | undefined {
  if (value instanceof Table) {
    return value.metatable
  }
  return undefined
}

function setmetatable(value: LuaType, metatable: LuaType): LuaType {
  if (!(value instanceof Table)) {
    throw new LuaError('bad argument #1 to setmetatable (table expected)')
  }
  
  if (metatable !== undefined && metatable !== null && !(metatable instanceof Table)) {
    throw new LuaError('bad argument #2 to setmetatable (nil or table expected)')
  }
  
  value.metatable = metatable as Table || undefined
  return value
}

/**
 * Gets the registry table.
 * In this implementation, returns a shared table.
 */
const registry = new Table()
function getregistry(): Table {
  return registry
}

/**
 * Gets the user value associated with a userdata.
 * Limited support - returns nil.
 */
function getuservalue(u: LuaType): undefined {
  return undefined
}

/**
 * Sets the user value associated with a userdata.
 * Limited support - does nothing.
 */
function setuservalue(u: LuaType, value: LuaType): LuaType {
  return u
}

/**
 * Debug utility: print value with type information
 */
function inspect(value: LuaType, depth: number = 0): string {
  const indent = '  '.repeat(depth)
  
  if (value === undefined || value === null) {
    return 'nil'
  }
  
  if (typeof value === 'boolean') {
    return value.toString()
  }
  
  if (typeof value === 'number') {
    return value.toString()
  }
  
  if (typeof value === 'string') {
    return `"${value}"`
  }
  
  if (typeof value === 'function') {
    return `function: ${value.name || 'anonymous'}`
  }
  
  if (value instanceof Table) {
    if (depth > 3) return '{...}'
    
    const parts: string[] = []
    
    // Numeric indices
    for (const key in value.numValues) {
      if (value.numValues[key] !== undefined) {
        parts.push(`[${key}] = ${inspect(value.numValues[key], depth + 1)}`)
      }
    }
    
    // String keys
    for (const key in value.strValues) {
      if (value.strValues[key] !== undefined) {
        parts.push(`${key} = ${inspect(value.strValues[key], depth + 1)}`)
      }
    }
    
    if (parts.length === 0) return '{}'
    if (parts.length <= 3 && depth === 0) {
      return `{ ${parts.join(', ')} }`
    }
    
    return `{\n${indent}  ${parts.join(',\n' + indent + '  ')}\n${indent}}`
  }
  
  if ((value as object) instanceof Coroutine) {
    return `coroutine: ${(value as Coroutine).status}`
  }
  
  return `userdata: ${typeof value}`
}

/**
 * Creates the debug library table for PixoScript.
 */
export const libDebug = new Table()

// Core debug functions
libDebug.set('getinfo', getinfo)
libDebug.set('getlocal', getlocal)
libDebug.set('setlocal', setlocal)
libDebug.set('getupvalue', getupvalue)
libDebug.set('setupvalue', setupvalue)
libDebug.set('sethook', sethook)
libDebug.set('gethook', gethook)
libDebug.set('traceback', traceback)

// Metatable access (bypasses __metatable)
libDebug.set('getmetatable', getmetatable)
libDebug.set('setmetatable', setmetatable)

// Registry
libDebug.set('getregistry', getregistry)

// Uservalue (limited support)
libDebug.set('getuservalue', getuservalue)
libDebug.set('setuservalue', setuservalue)

// Extra utilities
libDebug.set('inspect', inspect)

export default libDebug
