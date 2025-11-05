import { Table } from './Table.js';
import { LuaError } from './LuaError.js';
import { LuaType, Config } from './utils.js';
interface Script {
    exec: () => LuaType;
}
declare function createEnv(config?: Config): {
    parse: (script: string) => Script;
    parseFile: (path: string) => Script;
    loadLib: (name: string, value: Table) => void;
};
import * as utils from './utils.js';
export { createEnv, Table, LuaError, utils };
