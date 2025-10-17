import { EventLoader } from '@Engine/utils/loaders/index.js';

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
      get_zone: () => {
        return envScope.map || envScope.zone;
      },
      get_world: () => {
        return engine.spritz.world;
      },
      // network functions
      send_action: (action = false) => {
        const { networkManager } = engine;
        if (networkManager && networkManager.ws) {
          const sent = networkManager.sendAction(action.toObject());
          if (action)
            return () => Promise.resolve(sent);
          return sent;
        }
        if (action)
          return () => Promise.resolve(false);
        return false;
      },
      // flag functions
      all_flags: (action = false) => {
        const flags = engine.store.all();
        if (action)
          return () => Promise.resolve(flags);
        return flags;
      },
      has_flag: (key, action = false) => {
        console.log('checking flag via lua', key, action);
        const hasFlag = engine.store.keys().includes(key);
        if (action)
          return () => Promise.resolve(hasFlag);
        return hasFlag;
      },
      set_flag: (key, value, action = false) => {
        console.log('setting flag via lua', key, action);
        const flag = engine.store.set(key, value.toObject());
        if (action)
          return () => Promise.resolve(flag);
        return flag;
      },
      add_flag: (key, value, action = false) => {
        console.log('adding flag via lua', key, action);
        engine.store.add(key, value.toObject());
        if (action)
          return () => Promise.resolve(true);
        return true;
      },
      get_flag: (key, action = false) => {
        console.log('getting flag via lua', key, action);
        const flag = engine.store.get(key);
        if (action)
          return () => Promise.resolve(flag);
        return flag;
      },
      // world functions
      remove_all_zones: () => {
        console.log({ msg: 'removing all zones via lua' });
        return engine.spritz.world.removeAllZones();
      },
      load_zone_from_zip: (z, zip) => {
        console.log({ msg: 'loading zone from zip via lua', world: engine.spritz.world, z, zip });
        // When loading zones via Lua we allow the world to manage screen
        // transitions. Passing `undefined` (or omitting the parameter) causes
        // World.loadZoneFromZip() to use its default transition settings
        // (typically a fade in/out). This keeps portal transitions consistent
        // with other zone loads while still avoiding duplicate fades when the
        // engine is already transitioning. The world implementation guards
        // against overlapping transitions via the renderManager.isTransitioning
        // flag and skips transitions if the zone is already cached.
        return engine.spritz.world.loadZoneFromZip(z, zip, false);
      },

      /**
       * Register a cutscene definition from Lua. The `steps` parameter
       * should be a Lua table (array-like) whose entries are tables with
       * step definitions (type, effect, direction, duration, zone, etc.).
       * These tables are converted to plain JS objects and stored under
       * the provided name. Once registered, call pixos.start_cutscene(name)
       * to play it. If a cutscene with the same name already exists it
       * will be replaced.
       *
       * Example Lua:
       *   pixos.register_cutscene("intro", {
       *     { type = 'transition', effect = 'fade', direction = 'out', duration = 500 },
       *     { type = 'load_zone', zone = 'village', effect = 'fade', duration = 500 },
       *     { type = 'transition', effect = 'fade', direction = 'in', duration = 500 },
       *   })
       * @param {string} name
       * @param {table} steps
       */
      register_cutscene: (name, steps) => {
        try {
          // Convert Lua table to JS array of step objects
          const arr = this.lua.utils.ensureArray(steps.toObject());
          const jsSteps = arr.map((item) => {
            // `item` may be a Lua Table; convert to JS object
            return item && typeof item.toObject === 'function' ? item.toObject() : item;
          });
          engine.cutsceneManager.register(name, jsSteps);
        } catch (e) {
          console.warn('Failed to register cutscene from Lua', e);
        }
      },

      /**
       * Start a pre-registered cutscene by name. Returns immediately. The
       * cutscene will run asynchronously. Use pixos.skip_cutscene() to
       * cancel the currently playing cutscene.
       * @param {string} name
       */
      start_cutscene: (name) => {
        try {
          engine.cutsceneManager.start(name);
        } catch (e) {
          console.warn('Failed to start cutscene', name, e);
        }
      },

      /**
       * Skip the currently active cutscene, if any. Clears the cutscene
       * queue immediately. Safe to call even if no cutscene is running.
       */
      skip_cutscene: () => {
        try {
          engine.cutsceneManager.skip();
        } catch (e) {
          console.warn('Failed to skip cutscene', e);
        }
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

      /**
       * TODO - This is working well - but I need to fix up older cutscene methods,
       * and consolidate everything together. Zones, etc, should all work using the 
       * same system.
       * 
       * Run an ad-hoc cutscene defined by a Lua table of steps. Returns a
       * function that can be yielded in a Lua script and executed via
       * pixos.sync. The returned function resolves when the cutscene
       * completes. Steps are converted to plain JS objects. A unique
       * temporary name is generated for each call to avoid collisions.
       *
       * Example Lua:
       *   local steps = {
       *     { type = 'transition', effect = 'cross', direction = 'out', duration = 500 },
       *     { type = 'load_zone', zone = 'cave', effect = 'cross', duration = 500 },
       *     { type = 'transition', effect = 'cross', direction = 'in', duration = 500 },
       *   }
       *   pixos.sync({ pixos.run_cutscene(steps) })
       */
      run_cutscene: (steps) => {
        // Return an async function that the Lua runtime will call
        return () =>
          new Promise((resolve) => {
            try {
              const arr = this.lua.utils.ensureArray(steps.toObject());
              const jsSteps = arr.map((item) => {
                return item && typeof item.toObject === 'function' ? item.toObject() : item;
              });
              // Generate a unique name for this temporary cutscene
              const name = '__lua_cutscene_' + Date.now() + '_' + Math.floor(Math.random() * 10000);
              engine.cutsceneManager.register(name, jsSteps);
              engine.cutsceneManager.start(name);
              // Poll until cutscene finishes
              const poll = () => {
                if (!engine.cutsceneManager.isRunning()) {
                  resolve();
                } else {
                  setTimeout(poll, 30);
                }
              };
              poll();
            } catch (e) {
              console.warn('Failed to run cutscene', e);
              resolve();
            }
          });
      },
      run_transition: (effect = 'fade', direction = 'out', duration = 500) => {
        return () => {
          new Promise((resolve) => {
            const rm = engine.renderManager;
            if (!rm) resolve();
            return rm.startTransition({ effect, direction, duration }).then(() => resolve());
          })
        }
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
        return engine.renderManager.camera.cameraTarget;
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
      bind_action: (action, inputType, inputValue) => {
        try {
          if (engine.inputManager) {
            engine.inputManager.bindAction(action, inputType, inputValue);
          }
        } catch (e) {
          console.warn('bind_action failed', e);
        }
      },
      unbind_action: (action, inputType) => {
        try {
          if (engine.inputManager) {
            engine.inputManager.unbindAction(action, inputType);
          }
        } catch (e) {
          console.warn('unbind_action failed', e);
        }
      },
      register_action_hook: (action, hook) => {
        try {
          if (engine.inputManager) {
            engine.inputManager.registerActionHook(action, hook);
          }
        } catch (e) {
          console.warn('register_action_hook failed', e);
        }
      },
      is_action_active: (action) => {
        try {
          return engine.inputManager ? engine.inputManager.isActionActive(action) : false;
        } catch (e) {
          console.warn('is_action_active failed', e);
          return false;
        }
      },
      get_action_input: (action) => {
        try {
          return engine.inputManager ? engine.inputManager.getActionInput(action) : null;
        } catch (e) {
          console.warn('get_action_input failed', e);
          return null;
        }
      },

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
      /** Mode API - allow Lua scripts to change or query current mode */
      set_mode: (name, params) => {
        try {
          console.log('pixos.set_mode called ->', name, params);
          const world = engine.spritz.world;
          if (world && world.modeManager) {
            // params may be a Lua table - convert if necessary
            const p = params && typeof params.toObject === 'function' ? params.toObject() : params;
            world.modeManager.set(name, p);
          }
        } catch (e) {
          console.warn('set_mode failed', e);
        }
      },
      get_mode: () => {
        try { return engine.spritz.world.modeManager.getMode(); } catch (e) { return null; }
      },
      set_mode_mappings: (name, params) => {
        try {
          console.log('pixos.set_mode_mappings called ->', name, params);
          if (engine && engine.inputManager) {
            // params may be a Lua table - convert if necessary
            const p = params && typeof params.toObject === 'function' ? params.toObject() : params;
            engine.inputManager.setModeMappings(name, p);
          }
        } catch (e) {
          console.warn('set_mode_mappings failed', e);
        }
      },
      register_mode: (name, handlers) => {
        try {
          if (!name) {
            console.warn('pixos.register_mode called with undefined name');
            return;
          }
          console.log('pixos.register_mode called ->', name);
          const world = engine.spritz.world;
          if (!world || !world.modeManager) return;
          // handlers may be a Lua table; convert to JS object safely
          const h = {};
          const asObj = handlers && typeof handlers.toObject === 'function' ? handlers.toObject() : handlers || {};
          if (asObj.setup) h.setup = asObj.setup;
          if (asObj.update) h.update = asObj.update;
          if (asObj.teardown) h.teardown = asObj.teardown;
          world.modeManager.register(name, h);
        } catch (e) { console.warn('register_mode failed', e); }
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
      // skybox shader switching
      set_skybox_shader: async (shaderName) => {
        if (engine.renderManager?.skyboxManager?.setSkyboxShader) {
          await engine.renderManager.skyboxManager.setSkyboxShader(shaderName);
        }
      },
    });
  };
}
