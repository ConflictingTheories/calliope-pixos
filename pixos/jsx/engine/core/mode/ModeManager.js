/* ModeManager - manages game modes (explore, tactics, etc.)
 * Modes are backed by Lua scripts (setup & update) and can be attached
 * globally to the world or to individual zones.
 */
export default class ModeManager {
  constructor(world) {
    this.world = world;
    this.engine = world.engine;
    this.current = null; // { name, scope, updateFn }
    this.registered = Object.create(null);
  }

  register(name, handlers) {
    console.log('ModeManager.register ->', name, 'hasSetup?', !!(handlers && handlers.setup), 'currentMode=', this.current?.name);
    this.registered[name] = handlers;
    // If this mode is currently active but handlers were not present at set-time,
    // run its setup now so late-registered modes still initialize correctly.
    if (this.current && this.current.name === name) {
      const params = this.current.params || {};
      (async () => {
        try {
          const h = this.registered[name];
          this.current.handlers = h;
          if (h && h.setup) {
            const res = await h.setup(params);
            if (res && typeof res === 'object') {
              Object.assign(h, res);
              this.registered[name] = h;
              this.current.handlers = h;
            }
          }
        } catch (e) {
          console.warn('mode late-register setup failed', name, e);
        }
      })();
    }
  }

  async set(name, params = {}) {
    if (!name) return;
    // teardown previous
    if (this.current && this.current.handlers?.teardown) {
      try {
        await this.current.handlers.teardown(params);
      } catch (e) {
        console.warn('mode teardown failed', e);
      }
    }
    
    if (!this.registered[name]) {
      console.warn('Warning - Mode has not been registered')
    }

    const handlers = this.registered[name] || {};
    this.current = { name, handlers, params };
    console.log('ModeManager: set mode ->', name, params, handlers);
    if (handlers.setup) {
      try {
        // Allow setup to optionally return an object of handlers
        const res = await handlers.setup(params);
        if (res && typeof res === 'object') {
          // merge returned handlers into the active handlers so check_input/on_select/etc. are available
          Object.assign(handlers, res);
          // update registration to reflect merged handlers
          this.registered[name] = handlers;
          this.current.handlers = handlers;
        }
      } catch (e) { console.warn('mode setup failed', e); }
    }
  }

  async update(time) {
    if (!this.current) return;
    const h = this.current.handlers;
    if (h && h.update) {
      try { await h.update(time, this.current.params); } catch (e) { console.warn('mode update failed', e); }
    }
  }

  /** Allow modes to handle input; return true if input was consumed */
  handleInput(time) {
    if (!this.current) return false;
    const handlers = this.current.handlers;
    console.log({handlers});
    try {
      if (handlers && handlers.check_input) return !!handlers.check_input(time, this.current.params);
    } catch (e) {
      console.warn('mode input handler failed', e);
    }
    return false;
  }

  /** Allow modes to handle selection (tile/sprite). Return true to consume default onSelect */
  handleSelect(zone, row, cell, type) {
    if (!this.current) return false;
    const handlers = this.current.handlers;
    console.log({handlers});
    try {
      if (handlers && handlers.on_select) return !!handlers.on_select(zone, row, cell, type, this.current.params);
    } catch (e) {
      console.warn('mode on_select failed', e);
    }
    return false;
  }

  getMode() {
    return this.current?.name || null;
  }
}
