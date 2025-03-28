import PixosLuaLibrary from '@Engine/scripting/PixosLuaLibrary.jsx';
import * as luainjs from 'lua-in-js';
export default class PixosLuaInterpreter {
  constructor(engine) {
    this.engine = engine;
    this.lua = luainjs;
    this.pixosLib = new PixosLuaLibrary(this.lua);
    this.scope = {};
    this.env = null;
    this.library = null;
  }

  setScope = (scope) => {
    this.scope = scope;
  };

  getScope = () => {
    return this.scope;
  };

  createEnv = () => {
    this.env = this.lua.createEnv();
    return this.env;
  };

  initLibrary = () => {
    if (!this.env) this.createEnv();
    this.library = this.pixosLib.getLibrary(this.engine, this.scope);
    this.env.loadLib('pixos', this.library);
  };

  run = async (script) => {
    if (!this.env) this.createEnv();
    if (!this.library) this.initLibrary();
    return this.env.parse(script).exec();
  };
}
