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

import PixoScriptLibrary from '@Engine/scripting/PixoScriptLibrary.js';
import * as pixoscript from 'pixoscript';

export default class PixoScriptInterpreter {
  constructor(engine) {
    this.engine = engine;
    this.pixoscript = pixoscript;
    this.pixosLib = new PixoScriptLibrary(this.pixoscript);
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
    this.env = this.pixoscript.createEnv({});
    return this.env;
  };

  initLibrary = () => {
    if (!this.env) this.createEnv();
    this.library = this.pixosLib.getLibrary(this.engine, this.scope);
    this.env.loadLib('pixos', this.library);
  };

  run = async (script) => {
    if (!this.env) this.createEnv();
    if (!this.library) this.initLibrary();
    return this.env.parse(script).exec();
  };
}
