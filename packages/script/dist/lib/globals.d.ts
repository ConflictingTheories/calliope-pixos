import { Table } from '../Table.js';
import { LuaType, Config, tostring } from '../utils.js';
declare function createG(cfg: Config, execChunk: (_G: Table, chunk: string) => LuaType[]): Table;
export { tostring, createG };
