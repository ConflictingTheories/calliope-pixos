import { EventLoader } from '@Engine/utils/loaders/index.jsx';

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
    console.log({ msg: 'creating lua library', envScope });

    return new this.lua.Table({
      // passed in scope
      ...envScope,
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
            console.log({ msg: 'playing cutscene via lua', zone: envScope.zone, cutscene });
            if (envScope.zone.playCutscene) {
              console.log({ msg: 'cutscene function found' });
              return envScope.zone.playCutscene(cutscene).then(() => {
                resolve();
              });
            } else {
              resolve();
            }
          });
      },
      sprite_dialogue: (spriteId, dialogue, options = {}) => {
        return () =>
          new Promise((resolve) => {
            console.log({ msg: 'playing dialogue via lua', zone: envScope.zone, spriteId, dialogue });
            options.onClose = () => resolve();
            return envScope.zone.spriteDialogue(spriteId, dialogue, options).then(() => {
              console.log({ msg: 'played dialogue via lua', zone: envScope.zone, spriteId, dialogue });
            });
          });
      },
      move_sprite: (spriteId, location, running) => {
        return () =>
          new Promise((resolve) => {
            console.log({ msg: 'moving sprite via lua', zone: envScope.zone, spriteId, location, running });
            return envScope.zone.moveSprite(spriteId, this.lua.utils.ensureArray(location.toObject()), running).then(() => {
              console.log({ msg: 'moved sprite via lua', zone: envScope.zone, spriteId, location, running });
              resolve();
            });
          });
      },
      load_scripts: (scripts) => {
        console.log({ msg: 'loading scripts via lua', scripts, envScope });
        return envScope.zone.loadScripts(scripts);
      },

      // camera functions
      // ...
      set_camera: () => {
        engine.renderManager.camera.setCamera();
      },
      get_camera_vector: () => {
        return engine.renderManager.camera.cameraVector;
      },
      look_at: (pos, trgt, up) => {
        let position = this.lua.utils.ensureArray(pos.toObject());
        let target = this.lua.utils.ensureArray(trgt.toObject());
        let upDir = this.lua.utils.ensureArray(up.toObject());
        engine.renderManager.camera.lookAt(position, target, upDir);
      },
      pan_camera: (from, to, duration) => {
        console.log({ msg: 'panning camera via lua', from, to, duration });
        return () =>
          new Promise((resolve) => {
            engine.spritz.world.addEvent(
              new EventLoader(
                engine,
                'camera',
                [
                  'pan',
                  {
                    from: from,
                    to: to,
                    duration: duration,
                  },
                ],
                engine.spritz.world,
                async () => {
                  resolve();
                }
              )
            );
          });
      },
      
      _pan: (direction, radians = Math.PI / 4) => {
        if (direction === 'CCW') {
          engine.renderManager.camera.panCCW(this.luainjs.CoerceArgToFloat(radians));
        } else {
          engine.renderManager.camera.panCW(this.luainjs.CoerceArgToFloat(radians));
        }
      },
      pitch: (direction, radians = Math.PI / 4) => {
        if (direction === 'CCW') {
          engine.renderManager.camera.pitchCCW(this.luainjs.CoerceArgToFloat(radians));
        } else {
          engine.renderManager.camera.pitchCW(this.luainjs.CoerceArgToFloat(radians));
        }
      },
      tilt: (direction, radians = Math.PI / 4) => {
        if (direction === 'CCW') {
          engine.renderManager.camera.tiltCCW(this.luainjs.CoerceArgToFloat(radians));
        } else {
          engine.renderManager.camera.tiltCW(this.luainjs.CoerceArgToFloat(radians));
        }
      },

      // input functions
      // ...

      // audio functions
      // ...

      // sprite functions
      // ...

      // math functions
      vector: (tbl) => {
        let [x, y, z] = this.lua.utils.ensureArray(tbl.toObject());
        return new engine.utils.Vector(x, y, z);
      },
      vec_sub: (a, b) => {
        return a.sub(b);
      },

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
      callback_finish: (success) => {
        console.log({ msg: 'callback finish', success });
        if (envScope.finish) {
          envScope.finish(success > 0);
        }
      },
    });
  };
}
