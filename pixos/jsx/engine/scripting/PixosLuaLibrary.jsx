export default class PixosLuaLibrary {
  /**
   * Constructor
   * @param {luainjs} luainjs - Lua in JS Library
   * @constructor
   */
  constructor(luainjs) {
    this.lua = luainjs;
  }

  /**
   * Create Script Environment
   */
  getLibrary = (engine, envScope) => {
    return new this.lua.Table({
      as_obj: (tbl) => {
        return tbl.toObject();
      },
      as_table: (obj) => {
        const table = new this.lua.Table();
        for (const [key, value] of Object.entries(obj)) {
          table.set(key, value);
        }
        return table;
      },
      get_caller: () => {
        return envScope._this;
      },
      get_sprite: () => {
        return envScope.sprite;
      },
      get_world: () => {
        return engine.spritz.world;
      },
      remove_all_zones: () => {
        console.log({ msg: 'removing all zones via lua'});
        return engine.spritz.world.removeAllZones();
      },
      load_zone_from_zip: (z, zip) => {
        console.log({ msg: 'loading zone from zip via lua', world: engine.spritz.world, z, zip });
        return engine.spritz.world.loadZoneFromZip(z, zip);
      },
      play_cutscene: async (cutscene) => {
        console.log({ msg: 'playing cutscene via lua', zone: envScope._this, cutscene });
        if(envScope._this.playCutscene){
          return await envScope._this.playCutscene(cutscene);
        }
      },
      log: (msg) => {
        console.log(msg);
      },
      from: (obj, key) => {
        return obj[key];
      },
      length: (tbl) => {
        return tbl.length || 0;
      },
      ...envScope,
    });
  };
}
