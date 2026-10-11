/*                                                 *\
** ----------------------------------------------- **
**          Calliope - Pixos Game Engine           **
** ----------------------------------------------- **
**  Copyright (c) 2020-2025 - Kyle Derby MacInnis  **
**                                                 **
** PixoSpritz Dual License - see LICENSE.          **
** Free for education, non-commercial use, and     **
** individual non-profit artists (CC-BY-NC-SA-4.0) **
** Commercial use requires a purchased license.    **
** ----------------------------------------------- **
\*                                                 */

/**
 * BehaviorManager: declarative + scripted behaviors for scene objects.
 *
 * Every object in a scene has a unique ID and can have:
 *
 * 1. Declarative behaviors (JSON, no code):
 *    {
 *      "behaviors": {
 *        "wander": { "radius": 3, "speed": 1 },
 *        "dialog": { "greeting": "Hello!", "options": [...] },
 *        "chest": { "items": ["sword", "potion"], "locked": false },
 *        "trigger": { "onEnter": "flag:set:met_elder" }
 *      }
 *    }
 *
 * 2. Script hooks (PixoScript files):
 *    {
 *      "scripts": {
 *        "onInteract": "elder_talk.pxs",
 *        "onEnter": "trap_trigger.pxs",
 *        "onUpdate": "patrol.pxs"
 *      }
 *    }
 *
 * Behaviors are declarative shortcuts. Scripts are full PixoScript.
 * Both can coexist on the same object.
 */

// Built-in declarative behaviors
const BUILT_IN_BEHAVIORS = {
  /**
   * Wander: NPC moves randomly within radius.
   */
  wander: {
    defaults: { radius: 3, speed: 1, pauseChance: 0.3 },
    onUpdate(obj, config, ctx) {
      // Simplified: implemented by engine's movement system
      // Config is passed to the object's AI controller
      obj._wanderConfig = { ...this.defaults, ...config };
    },
  },

  /**
   * Dialog: simple dialogue tree on interact.
   */
  dialog: {
    defaults: { greeting: '...', options: [] },
    onInteract(obj, config, ctx) {
      const cfg = { ...this.defaults, ...config };
      return ctx.showDialog({
        speaker: obj.id,
        text: cfg.greeting,
        options: cfg.options,
      });
    },
  },

  /**
   * Chest: openable container.
   */
  chest: {
    defaults: { items: [], locked: false, opened: false },
    onInteract(obj, config, ctx) {
      const cfg = { ...this.defaults, ...config, ...obj._chestState };
      if (cfg.locked) {
        return ctx.showMessage('It\'s locked.');
      }
      if (cfg.opened) {
        return ctx.showMessage('Empty.');
      }
      // Give items
      for (const item of cfg.items) {
        ctx.giveItem(item);
      }
      obj._chestState = { ...cfg, opened: true };
      return ctx.showMessage(`Found: ${cfg.items.join(', ')}`);
    },
  },

  /**
   * Trigger: fires when avatar enters/exits area.
   */
  trigger: {
    defaults: { onEnter: null, onExit: null, once: true, radius: 1 },
    onEnter(obj, config, ctx) {
      const cfg = { ...this.defaults, ...config };
      if (cfg.once && obj._triggerFired) return;
      obj._triggerFired = true;
      if (cfg.onEnter) {
        ctx.runScript(cfg.onEnter, { obj });
      }
    },
  },

  /**
   * Door: open/close, optionally linked to portal.
   */
  door: {
    defaults: { open: false, portalId: null },
    onInteract(obj, config, ctx) {
      const cfg = { ...this.defaults, ...config, ...obj._doorState };
      cfg.open = !cfg.open;
      obj._doorState = cfg;
      if (cfg.open && cfg.portalId) {
        const portal = ctx.getPortal(cfg.portalId);
        if (portal) ctx.travelViaPortal(portal);
      }
      return ctx.showMessage(cfg.open ? 'Opened.' : 'Closed.');
    },
  },
};

export default class BehaviorManager {
  constructor(world) {
    this.world = world;
    this.customBehaviors = {};
  }

  /**
   * Register a custom declarative behavior.
   */
  registerBehavior(name, behavior) {
    this.customBehaviors[name] = behavior;
  }

  /**
   * Get a behavior by name (built-in or custom).
   */
  getBehavior(name) {
    return this.customBehaviors[name] || BUILT_IN_BEHAVIORS[name] || null;
  }

  /**
   * Attach behaviors to an object from its definition.
   */
  attachBehaviors(obj, definition) {
    obj.behaviors = {};
    obj.scripts = definition.scripts || {};

    // Validate unique ID
    if (!obj.id) {
      console.warn('BehaviorManager: object missing ID, generating one');
      obj.id = `obj_${Math.random().toString(36).substr(2, 9)}`;
    }

    // Attach declarative behaviors
    for (const [name, config] of Object.entries(definition.behaviors || {})) {
      const behavior = this.getBehavior(name);
      if (!behavior) {
        console.warn(`BehaviorManager: unknown behavior "${name}" on ${obj.id}`);
        continue;
      }
      obj.behaviors[name] = { ...behavior.defaults, ...config };
    }

    return obj;
  }

  /**
   * Trigger a hook on an object (e.g. 'onInteract', 'onEnter').
   * Runs declarative behavior first, then script if present.
   */
  async triggerHook(obj, hookName, context) {
    const results = [];

    // Declarative behaviors
    for (const [name, config] of Object.entries(obj.behaviors || {})) {
      const behavior = this.getBehavior(name);
      if (behavior && typeof behavior[hookName] === 'function') {
        try {
          const result = await behavior[hookName].call(behavior, obj, config, context);
          results.push({ type: 'behavior', name, result });
        } catch (e) {
          console.error(`Behavior "${name}" hook "${hookName}" failed:`, e);
        }
      }
    }

    // Script hooks
    const scriptFile = obj.scripts?.[hookName];
    if (scriptFile) {
      try {
        const result = await context.runScript(scriptFile, { obj, hook: hookName });
        results.push({ type: 'script', file: scriptFile, result });
      } catch (e) {
        console.error(`Script "${scriptFile}" hook "${hookName}" failed:`, e);
      }
    }

    return results;
  }

  /**
   * Validate all objects have unique IDs in a scene.
   * Returns list of duplicates or missing.
   */
  validateIds(objects) {
    const seen = new Map();
    const issues = [];

    for (const obj of objects) {
      if (!obj.id) {
        issues.push({ type: 'missing', obj });
      } else if (seen.has(obj.id)) {
        issues.push({ type: 'duplicate', id: obj.id, objects: [seen.get(obj.id), obj] });
      } else {
        seen.set(obj.id, obj);
      }
    }

    return issues;
  }
}

export { BUILT_IN_BEHAVIORS };
