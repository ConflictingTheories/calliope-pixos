import { hasOwnProperty, tostring } from './utils.js';
class Table {
    constructor(initialiser) {
        this.numValues = [undefined];
        this.strValues = {};
        this.keys = [];
        this.values = [];
        this.metatable = null;
        if (initialiser === undefined)
            return;
        if (typeof initialiser === 'function') {
            initialiser(this);
            return;
        }
        if (Array.isArray(initialiser)) {
            this.insert(...initialiser);
            return;
        }
        for (const key in initialiser) {
            if (hasOwnProperty(initialiser, key)) {
                let value = initialiser[key];
                if (value === null)
                    value = undefined;
                this.set(key, value);
            }
        }
    }
    get(key) {
        const value = this.rawget(key);
        if (value === undefined && this.metatable) {
            const mm = this.metatable.get('__index');
            if (mm instanceof Table) {
                return mm.get(key);
            }
            if (typeof mm === 'function') {
                const v = mm.call(undefined, this, key);
                return v instanceof Array ? v[0] : v;
            }
        }
        return value;
    }
    rawget(key) {
        switch (typeof key) {
            case 'string':
                if (hasOwnProperty(this.strValues, key)) {
                    return this.strValues[key];
                }
                break;
            case 'number':
                if (key > 0 && key % 1 === 0) {
                    return this.numValues[key];
                }
        }
        const index = this.keys.indexOf(tostring(key));
        return index === -1 ? undefined : this.values[index];
    }
    getMetaMethod(name) {
        return this.metatable && this.metatable.rawget(name);
    }
    set(key, value) {
        const mm = this.metatable && this.metatable.get('__newindex');
        if (mm) {
            const oldValue = this.rawget(key);
            if (oldValue === undefined) {
                if (mm instanceof Table) {
                    return mm.set(key, value);
                }
                if (typeof mm === 'function') {
                    return mm(this, key, value);
                }
            }
        }
        this.rawset(key, value);
    }
    setFn(key) {
        return v => this.set(key, v);
    }
    rawset(key, value) {
        switch (typeof key) {
            case 'string':
                this.strValues[key] = value;
                return;
            case 'number':
                if (key > 0 && key % 1 === 0) {
                    this.numValues[key] = value;
                    return;
                }
        }
        const K = tostring(key);
        const index = this.keys.indexOf(K);
        if (index > -1) {
            this.values[index] = value;
            return;
        }
        this.values[this.keys.length] = value;
        this.keys.push(K);
    }
    insert(...values) {
        this.numValues.push(...values);
    }
    toObject() {
        const outputAsArray = Object.keys(this.strValues).length === 0 && this.getn() > 0;
        const result = outputAsArray ? [] : {};
        for (let i = 1; i < this.numValues.length; i++) {
            const propValue = this.numValues[i];
            const value = propValue instanceof Table ? propValue.toObject() : propValue;
            if (outputAsArray) {
                const res = result;
                res[i - 1] = value;
            }
            else {
                const res = result;
                res[String(i - 1)] = value;
            }
        }
        for (const key in this.strValues) {
            if (hasOwnProperty(this.strValues, key)) {
                const propValue = this.strValues[key];
                const value = propValue instanceof Table ? propValue.toObject() : propValue;
                const res = result;
                res[key] = value;
            }
        }
        return result;
    }
    getn() {
        const vals = this.numValues;
        const keys = [];
        for (const i in vals) {
            if (hasOwnProperty(vals, i)) {
                keys[i] = true;
            }
        }
        let j = 0;
        while (keys[j + 1]) {
            j += 1;
        }
        // Following translated from ltable.c (http://www.lua.org/source/5.3/ltable.c.html)
        if (j > 0 && vals[j] === undefined) {
            /* there is a boundary in the array part: (binary) search for it */
            let i = 0;
            while (j - i > 1) {
                const m = Math.floor((i + j) / 2);
                if (vals[m] === undefined) {
                    j = m;
                }
                else {
                    i = m;
                }
            }
            return i;
        }
        return j;
    }
}
export { Table };
