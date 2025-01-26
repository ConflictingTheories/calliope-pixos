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
      // core functions
      get_caller: () => {
        return envScope._this;
      },
      get_subject: () => {
        return envScope.subject;
      },
      get_map: () => {
        return envScope.map || envScope.zone;
      },
      get_world: () => {
        return engine.spritz.world;
      },

      // world functions
      remove_all_zones: () => {
        console.log({ msg: 'removing all zones via lua' });
        return engine.spritz.world.removeAllZones();
      },
      load_zone_from_zip: (z, zip) => {
        console.log({ msg: 'loading zone from zip via lua', world: engine.spritz.world, z, zip });
        return engine.spritz.world.loadZoneFromZip(z, zip);
      },

      // zone functions
      play_cutscene: (cutscene) => {
        // todo - not working
        return () =>
          new Promise((resolve) => {
            console.log({ msg: 'playing cutscene via lua', zone: envScope._this, cutscene });
            if (envScope._this.playCutscene) {
              console.log({ msg: 'cutscene function found' });
              return envScope._this.playCutscene(cutscene).then(() => {
                resolve();
              });
            }else{
              resolve();
            }
          });
      },
      sprite_dialogue: (spriteId, dialogue, options = {}) => {
        return () =>
          new Promise((resolve) => {
            console.log({ msg: 'playing dialogue via lua', zone: envScope._this, spriteId, dialogue });
            options.onClose = () => resolve();
            return envScope._this.spriteDialogue(spriteId, dialogue, options).then(() => {
              console.log({ msg: 'played dialogue via lua', zone: envScope._this, spriteId, dialogue });
            });
          });
      },
      move_sprite: (spriteId, location, running) => {
        return () =>
          new Promise((resolve) => {
            console.log({ msg: 'moving sprite via lua', zone: envScope._this, spriteId, location, running });
            return envScope._this.moveSprite(spriteId, this.lua.utils.ensureArray(location.toObject()), running).then(() => {
              console.log({ msg: 'moved sprite via lua', zone: envScope._this, spriteId, location, running });
              resolve();
            });
          });
      },
      load_scripts: (scripts) => {
        console.log({ msg: 'loading scripts via lua', scripts, envScope });
        return envScope._this.loadScripts(scripts);
      },

      // sprite functions
      // ...

      // misc utils & functions
      sync: async (p) => {
        for (const a of p.toObject()) {
          await a();
        }
      },
      as_obj: (tbl) => {
        return tbl.toObject();
      },
      as_array: (tbl) => {
        return this.lua.utils.ensureArray(tbl.toObject());
      },
      as_table: (obj) => {
        const table = new this.lua.Table();
        for (const [key, value] of Object.entries(obj)) {
          table.set(key, value);
        }
        return table;
      },
      log: (msg) => {
        console.log(msg);
      },
      to: (obj, tbl) => {
        for (const [key, value] of Object.entries(tbl.toObject())) {
          obj[key] = value;
        }
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
