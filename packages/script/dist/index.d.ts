import { Table } from './Table.js';
import { LuaError } from './LuaError.js';
import { LuaType, Config } from './utils.js';
/**
 * Represents a parsed PixoScript chunk that can be executed later.
 */
interface Script {
    exec: () => LuaType;
}
/**
 * Create a Pixoscript runtime environment with injected libraries.
 * @param {Config} [config={}] - Runtime overrides (paths, IO, filesystem helpers).
 */
declare function createEnv(config?: Config): {
    parse: (script: string) => Script;
    parseFile: (path: string) => Script;
    loadLib: (name: string, value: Table) => void;
};
import * as utils from './utils.js';
export { createEnv, Table, LuaError, utils };
