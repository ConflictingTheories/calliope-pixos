import { LuaError } from './LuaError.js';
import { Table } from './Table.js';
/** Pattern to identify a float string value that can validly be converted to a number in Lua */
const FLOATING_POINT_PATTERN = /^[-+]?[0-9]*\.?([0-9]+([eE][-+]?[0-9]+)?)?$/;
/** Pattern to identify a hex string value that can validly be converted to a number in Lua */
const HEXIDECIMAL_CONSTANT_PATTERN = /^(-)?0x([0-9a-fA-F]*)\.?([0-9a-fA-F]*)$/;
function type(v) {
    const t = typeof v;
    switch (t) {
        case 'undefined':
            return 'nil';
        case 'number':
        case 'string':
        case 'boolean':
        case 'function':
            return t;
        case 'object':
            if (v instanceof Table)
                return 'table';
            if (v instanceof Function)
                return 'function';
    }
}
function tostring(v) {
    if (v instanceof Table) {
        const mm = v.getMetaMethod('__tostring');
        if (mm)
            return mm(v)[0];
        return valToStr(v, 'table: 0x');
    }
    if (v instanceof Function) {
        return valToStr(v, 'function: 0x');
    }
    return coerceToString(v);
    function valToStr(v, prefix) {
        const s = v.toString();
        if (s.indexOf(prefix) > -1)
            return s;
        const str = prefix + Math.floor(Math.random() * 0xffffffff).toString(16);
        v.toString = () => str;
        return str;
    }
}
/* translate a relative string position: negative means back from end */
function posrelat(pos, len) {
    if (pos >= 0)
        return pos;
    if (-pos > len)
        return 0;
    return len + pos + 1;
}
/**
 * Thows an error with the type of a variable included in the message
 * @param {Object} val The value whise type is to be inspected.
 * @param {String} errorMessage The error message to throw.
 * @throws {LuaError}
 */
function throwCoerceError(val, errorMessage) {
    if (!errorMessage)
        return undefined;
    throw new LuaError(`${errorMessage}`.replace(/%type/gi, type(val)));
}
/**
 * Coerces a value from its current type to a boolean in the same manner as Lua.
 * @param {Object} val The value to be converted.
 * @returns {Boolean} The converted value.
 */
function coerceToBoolean(val) {
    return !(val === false || val === undefined);
}
/**
 * Coerces a value from its current type to a number in the same manner as Lua.
 * @param {Object} val The value to be converted.
 * @param {String} [errorMessage] The error message to throw if the conversion fails.
 * @returns {Number} The converted value.
 */
function coerceToNumber(val, errorMessage) {
    if (typeof val === 'number')
        return val;
    switch (val) {
        case undefined:
            return undefined;
        case 'inf':
            return Infinity;
        case '-inf':
            return -Infinity;
        case 'nan':
            return NaN;
    }
    const V = `${val}`;
    if (V.match(FLOATING_POINT_PATTERN)) {
        return parseFloat(V);
    }
    const match = V.match(HEXIDECIMAL_CONSTANT_PATTERN);
    if (match) {
        const [, sign, exponent, mantissa] = match;
        let n = parseInt(exponent, 16) || 0;
        if (mantissa)
            n += parseInt(mantissa, 16) / Math.pow(16, mantissa.length);
        if (sign)
            n *= -1;
        return n;
    }
    if (errorMessage === undefined)
        return undefined;
    throwCoerceError(val, errorMessage);
}
/**
 * Coerces a value from its current type to a string in the same manner as Lua.
 * @param {Object} val The value to be converted.
 * @param {String} [errorMessage] The error message to throw if the conversion fails.
 * @returns {String} The converted value.
 */
function coerceToString(val, errorMessage) {
    if (typeof val === 'string')
        return val;
    switch (val) {
        case undefined:
        case null:
            return 'nil';
        case Infinity:
            return 'inf';
        case -Infinity:
            return '-inf';
    }
    if (typeof val === 'number') {
        return Number.isNaN(val) ? 'nan' : `${val}`;
    }
    if (typeof val === 'boolean') {
        return `${val}`;
    }
    if (errorMessage === undefined)
        return 'nil';
    throwCoerceError(val, errorMessage);
}
function coerceArg(value, coerceFunc, typ, funcName, index) {
    return coerceFunc(value, `bad argument #${index} to '${funcName}' (${typ} expected, got %type)`);
}
function coerceArgToNumber(value, funcName, index) {
    return coerceArg(value, coerceToNumber, 'number', funcName, index);
}
function coerceArgToString(value, funcName, index) {
    return coerceArg(value, coerceToString, 'string', funcName, index);
}
function coerceArgToTable(value, funcName, index) {
    if (value instanceof Table) {
        return value;
    }
    else {
        const typ = type(value);
        throw new LuaError(`bad argument #${index} to '${funcName}' (table expected, got ${typ})`);
    }
}
function coerceArgToFunction(value, funcName, index) {
    if (value instanceof Function) {
        return value;
    }
    else {
        const typ = type(value);
        throw new LuaError(`bad argument #${index} to '${funcName}' (function expected, got ${typ})`);
    }
}
const ensureArray = (value) => (value instanceof Array ? value : [value]);
const hasOwnProperty = (obj, key) => Object.prototype.hasOwnProperty.call(obj, key);
export { type, tostring, posrelat, coerceToBoolean, coerceToNumber, coerceToString, coerceArgToNumber, coerceArgToString, coerceArgToTable, coerceArgToFunction, ensureArray, hasOwnProperty };
