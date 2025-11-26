import { Table } from './Table.js';
import { coerceToNumber, coerceToString, coerceToBoolean } from './utils.js';
import { LuaError } from './LuaError.js';
const binaryArithmetic = (left, right, metaMethodName, callback) => {
    const mm = (left instanceof Table && left.getMetaMethod(metaMethodName)) ||
        (right instanceof Table && right.getMetaMethod(metaMethodName));
    if (mm)
        return mm(left, right)[0];
    const L = coerceToNumber(left, 'attempt to perform arithmetic on a %type value');
    const R = coerceToNumber(right, 'attempt to perform arithmetic on a %type value');
    return callback(L, R);
};
const binaryBooleanArithmetic = (left, right, metaMethodName, callback) => {
    if ((typeof left === 'string' && typeof right === 'string') ||
        (typeof left === 'number' && typeof right === 'number')) {
        return callback(left, right);
    }
    return binaryArithmetic(left, right, metaMethodName, callback);
};
// extra
const bool = (value) => coerceToBoolean(value);
// logical
const and = (l, r) => coerceToBoolean(l) ? r : l;
const or = (l, r) => coerceToBoolean(l) ? l : r;
// unary
const not = (value) => !bool(value);
const unm = (value) => {
    const mm = value instanceof Table && value.getMetaMethod('__unm');
    if (mm)
        return mm(value)[0];
    return -1 * coerceToNumber(value, 'attempt to perform arithmetic on a %type value');
};
const bnot = (value) => {
    const mm = value instanceof Table && value.getMetaMethod('__bnot');
    if (mm)
        return mm(value)[0];
    return ~coerceToNumber(value, 'attempt to perform arithmetic on a %type value');
};
const len = (value) => {
    if (value instanceof Table) {
        const mm = value.getMetaMethod('__len');
        if (mm)
            return mm(value)[0];
        return value.getn();
    }
    if (typeof value === 'string')
        return value.length;
    throw new LuaError('attempt to get length of an unsupported value');
    // if (typeof value === 'object') {
    //     let length = 0
    //     for (const key in value) {
    //         if (hasOwnProperty(value, key)) {
    //             length += 1
    //         }
    //     }
    //     return length
    // }
};
// binary
const add = (left, right) => binaryArithmetic(left, right, '__add', (l, r) => l + r);
const sub = (left, right) => binaryArithmetic(left, right, '__sub', (l, r) => l - r);
const mul = (left, right) => binaryArithmetic(left, right, '__mul', (l, r) => l * r);
const mod = (left, right) => binaryArithmetic(left, right, '__mod', (l, r) => {
    if (r === 0 || r === -Infinity || r === Infinity || isNaN(l) || isNaN(r))
        return NaN;
    const absR = Math.abs(r);
    let result = Math.abs(l) % absR;
    if (l * r < 0)
        result = absR - result;
    if (r < 0)
        result *= -1;
    return result;
});
const pow = (left, right) => binaryArithmetic(left, right, '__pow', Math.pow);
const div = (left, right) => binaryArithmetic(left, right, '__div', (l, r) => {
    if (r === undefined)
        throw new LuaError('attempt to perform arithmetic on a nil value');
    return l / r;
});
const idiv = (left, right) => binaryArithmetic(left, right, '__idiv', (l, r) => {
    if (r === undefined)
        throw new LuaError('attempt to perform arithmetic on a nil value');
    return Math.floor(l / r);
});
const band = (left, right) => binaryArithmetic(left, right, '__band', (l, r) => l & r);
const bor = (left, right) => binaryArithmetic(left, right, '__bor', (l, r) => l | r);
const bxor = (left, right) => binaryArithmetic(left, right, '__bxor', (l, r) => l ^ r);
const shl = (left, right) => binaryArithmetic(left, right, '__shl', (l, r) => l << r);
const shr = (left, right) => binaryArithmetic(left, right, '__shr', (l, r) => l >> r);
const concat = (left, right) => {
    const mm = (left instanceof Table && left.getMetaMethod('__concat')) ||
        (right instanceof Table && right.getMetaMethod('__concat'));
    if (mm)
        return mm(left, right)[0];
    const L = coerceToString(left, 'attempt to concatenate a %type value');
    const R = coerceToString(right, 'attempt to concatenate a %type value');
    return `${L}${R}`;
};
const neq = (left, right) => !eq(left, right);
const eq = (left, right) => {
    const mm = right !== left &&
        left instanceof Table &&
        right instanceof Table &&
        left.metatable === right.metatable &&
        left.getMetaMethod('__eq');
    if (mm)
        return !!mm(left, right)[0];
    return left === right;
};
const lt = (left, right) => binaryBooleanArithmetic(left, right, '__lt', (l, r) => l < r);
const le = (left, right) => binaryBooleanArithmetic(left, right, '__le', (l, r) => l <= r);
const gt = (left, right) => !le(left, right);
const ge = (left, right) => !lt(left, right);
const operators = {
    bool,
    and,
    or,
    not,
    unm,
    bnot,
    len,
    add,
    sub,
    mul,
    mod,
    pow,
    div,
    idiv,
    band,
    bor,
    bxor,
    shl,
    shr,
    concat,
    neq,
    eq,
    lt,
    le,
    gt,
    ge,
};
export { operators };
