import { Table } from '../Table.js';
import { LuaType, Config } from '../utils.js';
declare const getLibPackage: (execModule: (content: string, moduleName: string) => LuaType, cfg: Config) => {
    libPackage: Table;
    _require: (modname: LuaType) => LuaType;
};
export { getLibPackage };
