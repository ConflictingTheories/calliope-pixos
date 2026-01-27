/*                                                 *\
** ----------------------------------------------- **
**          Calliope - Pixos Game Engine   	       **
** ----------------------------------------------- **
**  Copyright (c) 2020-2025 - Kyle Derby MacInnis  **
**                                                 **
**    Any unauthorized distribution or transfer    **
**       of this work is strictly prohibited.      **
**                                                 **
**               All Rights Reserved.              **
** ----------------------------------------------- **
\*                                                 */

import { Vector } from '@Engine/utils/math/vector.js';
import { ActionLoader } from '@Engine/utils/loaders/index.js';
import { mergeDeep } from '@Engine/utils/enums.js';
import Sprite from '@Engine/core/scene/sprite.js';
import PixoScriptInterpreter from '@Engine/scripting/PixoScriptInterpreter.js';
import { debug, debugError } from '@Engine/utils/debug-logger.js';

/**
 * DynamicSprite - A dynamic sprite with JSON loading, state machines, and Lua scripting support.
 */
export default class DynamicSprite extends Sprite {
  /**
   * Creates an instance of DynamicSprite.
   * @param {GLEngine} engine - The game engine instance.
   * @param {Object} json - The JSON configuration.
   * @param {Object} zip - The zip file data.
   */
  constructor(engine, json, zip) {
    // Initialize Sprite
    super(engine);
    /** @type {GLEngine} */
    this.engine = engine;
    /** @type {Object} */
    this.json = json;
    /** @type {Object} */
    this.zip = zip;
    // store json config
    this.ActionLoader = ActionLoader;
  }

  /**
   * Loads JSON properties into the object.
   * @returns {Promise<void>}
   */
  loadJson = async () => {
    // extended properties
    if (this.json.extends) {
      await Promise.all(
        this.json.extends.map(async file => {
          let stringD = JSON.parse(
            await this.zip.file('sprites/' + file + '.json').async('string')
          );
          debug('DynamicSprite', 'extending', { old: this.json, new: stringD });
          this.json = mergeDeep(this.json, stringD);
        })
      );
      // unset
      this.json.extends = null;
    }
    // core properties
    this.update(this.json);
    this.src = this.json.src;
    this.portraitSrc = this.json.portraitSrc;
    this.sheetSize = this.json.sheetSize;
    this.tileSize = this.json.tileSize;
    this.isLit = this.json.isLit;
    this.direction = this.json.direction;
    this.attenuation = this.json.attenuation;
    this.density = this.json.density;
    this.lightColor = this.json.lightColor;
    this.state = this.json.state ?? 'intro';
    // Frames
    this.frames = this.json.frames;
    // Offsets
    this.drawOffset = {};
    Object.keys(this.json.drawOffset).forEach(offset => {
      this.drawOffset[offset] = new Vector(...this.json.drawOffset[offset]);
    });
    this.hotspotOffset = new Vector(...this.json.hotspotOffset);
    // Should the camera follow the avatar?
    this.bindCamera = this.json.bindCamera;
    this.enableSpeech = this.json.enableSpeech; // speech bubble
  };

  /**
   * Handles interaction with state machine and Lua callbacks.
   * @param {Sprite} sprite - The interacting sprite.
   * @param {function} [finish=() => {}] - Callback on completion.
   * @returns {Promise<Array>} The interaction results.
   */
  interact = async (sprite, finish = () => {}) => {
    let ret = null;
    let states = this.json.states ?? [];

    // build state machine
    let stateMachine = {};
    await Promise.all(
      states.map(async state => {
        let actions = await this.loadActionDynamically(state, sprite, finish); // load actions dynamically

        for (const action of actions) {
          debug('DynamicSprite', 'loading action', action);
        }
        debug('DynamicSprite', 'switching state', state.name);
        stateMachine[state.name] = { next: state.next, actions };
      })
    );
    debug('DynamicSprite', 'loading stateMachine', stateMachine);

    // run state actions
    ret = [];
    for (const action of stateMachine[this.state].actions) {
      ret.push(await action(this, sprite, finish));
    }

    // update state
    this.state = stateMachine[this.state].next;

    // If completion handler passed through - call it when done
    if (finish) finish(false);

    return ret;
  };

  /**
   * Loads actions dynamically based on state and Lua callbacks.
   * @param {Object} state - The state configuration.
   * @param {Sprite} sprite - The sprite context.
   * @param {function} finish - The finish callback.
   * @returns {Promise<Array>} The loaded actions.
   */
  loadActionDynamically = async (state, sprite, finish) => {
    debug('DynamicSprite', 'loadActionDynamically', { sprite: sprite?.id, state: state?.name });
    return await Promise.all(
      // load actions based on state
      state.actions.map(async action => {
        debug('DynamicSprite', 'preping actions', action);
        let luaCallback =
          action.callback && action.callback !== ''
            ? await this.zip.file('callbacks/' + action.callback + '.pxs').async('string')
            : 'print("no callback")';

        // lua script callback is injected via function wrapper
        let callback = () => {
          debug('DynamicSprite', 'calling callback');
          let interpreter = new PixoScriptInterpreter(this.engine);
          interpreter.setScope({ _this: this, zone: sprite.zone, subject: sprite, finish: finish });
          interpreter.initLibrary();
          interpreter.run('print("hello world lua - sprite callback")');
          return interpreter.run(luaCallback);
        };

        // supported action types
        switch (action.type) {
          case 'dialogue':
            debug('DynamicSprite', 'preparing dialogue action');
            return async (_this, sprite, finish) => {
              debug('DynamicSprite', 'executing dialogue');
              let actionToLoad = new _this.ActionLoader(
                _this.engine,
                'dialogue',
                [
                  JSON.stringify(action.dialogue),
                  false,
                  { autoclose: true, onClose: () => finish(true) },
                ],
                _this,
                callback
              );
              debug('DynamicSprite', 'action to load', actionToLoad);
              _this.addAction(actionToLoad);
            };
          case 'animate':
            debug('DynamicSprite', 'preparing animate action');
            return async (_this, sprite, finish) => {
              debug('DynamicSprite', 'executing animate', { action });
              let actionToLoad = new _this.ActionLoader(
                _this.engine,
                'animate',
                [...action.animate, () => finish(true)],
                _this,
                callback
              );
              debug('DynamicSprite', 'action to load', actionToLoad);
              _this.addAction(actionToLoad);
            };
          default:
            return async (_this, sprite, _finish) => {
              debug('DynamicSprite', 'no action found for type', action.type);
            };
        }
      })
    );
  };

  /**
   * Handles selection interaction, with Lua scripting support.
   * @param {Object} _this - The context.
   * @param {Sprite} sprite - The sprite being selected.
   * @returns {Promise<any>}
   */
  onSelect = async (_this, sprite) => {
    if (!this.selectTrigger) {
      return;
    }

    // pass-through interaction
    if (this.selectTrigger === 'interact') {
      return await this.interact(sprite, () => {});
    }

    // lua scripting
    try {
      debug('DynamicSprite', 'onSelect trigger', this.selectTrigger);
      let file = this.zip.file(`triggers/${this.selectTrigger}.pxs`);
      if (!file) file = this.zip.file(`triggers/${this.selectTrigger}.pxs`);
      if (!file) throw new Error('No Lua Script Found');

      let luaScript = await file.async('string');
      debug('DynamicSprite', 'trigger lua statement', luaScript);

      let interpreter = new PixoScriptInterpreter(this.engine);
      interpreter.setScope({ _this: this, zone: sprite.zone, subject: sprite });
      interpreter.initLibrary();
      interpreter.run('print("hello world lua")');

      return await interpreter.run(luaScript);
    } catch (e) {
      debug('DynamicSprite', 'no lua script found', e.message);
    }
  };

  /**
   * Handles step interaction, with Lua scripting support.
   * @param {Object} _this - The context.
   * @param {Sprite} sprite - The sprite stepping.
   * @returns {Promise<any>}
   */
  onStep = async (_this, sprite) => {
    if (!this.stepTrigger) {
      return;
    }

    // lua scripting
    try {
      debug('DynamicSprite', 'onStep trigger', this.stepTrigger);
      let file = this.zip.file(`triggers/${this.stepTrigger}.pxs`);
      if (!file) file = this.zip.file(`triggers/${this.stepTrigger}.pxs`);
      if (!file) throw new Error('No Lua Script Found');

      let luaScript = await file.async('string');
      debug('DynamicSprite', 'trigger lua statement', luaScript);

      let interpreter = new PixoScriptInterpreter(this.engine);
      interpreter.setScope({ _this: this, zone: sprite.zone, subject: sprite });
      interpreter.initLibrary();
      interpreter.run('print("hello world lua")');

      return await interpreter.run(luaScript);
    } catch (e) {
      debug('DynamicSprite', 'no lua script found', e.message);
    }
  };
}
