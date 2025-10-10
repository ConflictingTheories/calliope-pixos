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
    this.registered[name] = handlers;
  }

  async set(name, params = {}) {
    if (!name) return;
    // teardown previous
    if (this.current && this.current.handlers?.teardown) {
      try { await this.current.handlers.teardown(params); } catch (e) { console.warn('mode teardown failed', e); }
    }
    const handlers = this.registered[name] || {};
    this.current = { name, handlers, params };
    if (handlers.setup) {
      try { await handlers.setup(params); } catch (e) { console.warn('mode setup failed', e); }
    }
  }

  async update(time) {
    if (!this.current) return;
    const h = this.current.handlers;
    if (h && h.update) {
      try { await h.update(time, this.current.params); } catch (e) { console.warn('mode update failed', e); }
    }
  }

  getMode() {
    return this.current?.name || null;
  }
}
