import PixosLuaLibrary from '@Engine/scripting/PixosLuaLibrary.jsx';
const luainjs = require('lua-in-js');

export default class PixosLuaInterpreter {
  constructor() {
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

  initLibrary = (engine) => {
    if (!this.env) this.createEnv();
    this.library = this.pixosLib.getLibrary(engine, this.scope);
    this.env.loadLib('pixos', this.library);
  };

  run = async (script) => {
    if (!this.env) this.createEnv();
    if (!this.library) this.initLibrary(this.scope);
    return this.env.parse(script).exec();
  };
}
