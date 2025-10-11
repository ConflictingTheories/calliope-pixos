/*
 * Pixos Cutscene Manager
 *
 * This minimal manager supports registering named cutscenes composed of
 * sequential steps (wait, transition, load zone). A cutscene can be
 * started via the engine API or Lua and will run asynchronously,
 * blocking player input until complete. Additional step types can be
 * added as needed.
 */

export default class CutsceneManager {
  constructor(engine) {
    this.engine = engine;
    // Registered cutscenes: name -> array of steps
    this.scenes = {};
    // Queue of steps for the currently active cutscene
    this.queue = [];
    this.active = false;
    this._currentPromise = null;
  }

  /**
   * Register a cutscene definition. Each cutscene is an array of step
   * objects. Supported step types include:
   *   - wait: { type: 'wait', ms: number }
   *   - transition: { type: 'transition', effect: string, direction: 'in'|'out', duration: number }
   *   - load_zone: { type: 'load_zone', zone: string, effect?: string, duration?: number, remotely?: boolean }
   *
   * @param {string} name
   * @param {Array<Object>} steps
   */
  register = (name, steps) => {
    this.scenes[name] = Array.isArray(steps) ? steps.slice() : [];
  }

  /**
   * Begin playing a cutscene by name. If another cutscene is active it
   * will be replaced. Steps are copied from the definition so the
   * original remains untouched.
   *
   * @param {string} name
   */
  start = (name) => {
    const def = this.scenes[name];
    if (!def) {
      console.warn('Cutscene not found:', name);
      return;
    }
    this.queue = def.slice();
    this.active = true;
    this._currentPromise = null;
  }

  /**
   * Skip the active cutscene. Clears the queue and sets active false.
   */
  skip = () => {
    this.queue = [];
    this.active = false;
  }

  /**
   * Return true if a cutscene is running.
   */
  isRunning = () => {
    return this.active;
  }

  /**
   * Called each frame from the engine render loop. Executes pending
   * cutscene steps sequentially. When all steps finish, the cutscene
   * becomes inactive.
   */
  update = () => {
    if (!this.active) return;
    // if a step is currently processing, wait
    if (this._currentPromise) return;
    const step = this.queue.shift();
    if (!step) {
      this.active = false;
      return;
    }
    // execute step and on completion call update again to process next
    let promise;
    switch (step.type) {
      // todo -- add addiitonal step support:
      // -- Thinking along the lines of run script, dialogue, picker, music, sprite and object actions, etc.
      // -- in theory should be able to script a scene, set flags too, and have it proceed to the next scene if
      // -- if another one follows. -- I should be able to script a basic 'movie' using this
      case 'action':
        promise = this.runAction(step);
        break;
      case 'wait':
        promise = this.wait(step.ms || 0);
        break;
      case 'transition':
        promise = this.transition(step);
        break;
      case 'load_zone':
        promise = this.loadZone(step);
        break;
      default:
        console.warn('Unknown cutscene step:', step.type);
        promise = Promise.resolve();
    }
    this._currentPromise = promise;
    promise.then(() => {
      this._currentPromise = null;
      this.update();
    });
  }

  // internal step handlers
  wait = (ms) => {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
  transition = (step) => {
    const rm = this.engine.renderManager;
    if (!rm) return Promise.resolve();
    const effect = step.effect || 'fade';
    const direction = step.direction || 'out';
    const duration = step.duration || 500;
    return rm.startTransition({ effect, direction, duration });
  }
  runAction = (step) => {
    const action = step.action;
    if (!action) return Promise.resolve();
    return action();
  }
  loadZone = (step) => {
    const { zone, remotely = false, zip } = step;
    if (!zone || !this.engine.spritz || !this.engine.spritz.world) {
      return Promise.resolve();
    }
    const effect = step.effect || 'fade';
    const duration = step.duration || 500;
    // If a zip parameter is provided, load the zone from the given zip
    // archive. Otherwise call the standard loadZone. When loading from zip
    // we do not skip the default transition settings provided by
    // loadZoneFromZip() because cutscene steps explicitly specify
    // transition parameters.
    if (zip) {
      // When a zone is loaded as part of a cutscene we disable automatic
      // transitions inside loadZoneFromZip by passing null for transition
      // parameters. The cutscene step already specifies its own
      // transitions before and after zone loads, so we avoid double fades.
      return this.engine.spritz.world.loadZoneFromZip(zone, zip, false, null);
    }
    // Similarly pass null for transition parameters when loading zones
    // directly. The surrounding cutscene will manage the fade in/out.
    return this.engine.spritz.world.loadZone(zone, remotely, false, null);
  }
}