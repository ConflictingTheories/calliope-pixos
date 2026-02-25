import { hasOwnProperty } from './utils.js';
export class Scope {
    constructor(variables = {}) {
        this._variables = variables;
    }
    get(key) {
        return this._variables[key];
    }
    set(key, value) {
        if (hasOwnProperty(this._variables, key) || !this.parent) {
            this.setLocal(key, value);
        }
        else {
            this.parent.set(key, value);
        }
    }
    setLocal(key, value) {
        this._variables[key] = value;
    }
    setVarargs(args) {
        this._varargs = args;
    }
    getVarargs() {
        return this._varargs || (this.parent && this.parent.getVarargs()) || [];
    }
    extend() {
        const innerVars = Object.create(this._variables);
        const scope = new Scope(innerVars);
        scope.parent = this;
        return scope;
    }
}
