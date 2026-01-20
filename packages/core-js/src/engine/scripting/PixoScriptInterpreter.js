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
    // Cache for loaded scripts (simulated filesystem)
    this._scriptCache = new Map();
  }

  setScope = (scope) => {
    this.scope = scope;
  };

  getScope = () => {
    return this.scope;
  };

  /**
   * Register a script in the virtual filesystem for require() support
   * @param {string} path - Virtual path like "mymodule" or "lib/utils"
   * @param {string} content - The script content
   */
  registerScript = (path, content) => {
    this._scriptCache.set(path, content);
    this._scriptCache.set(path + '.pxs', content);
  };

  createEnv = () => {
    // Create config with virtual filesystem handlers
    const config = {
      PIXOSCRIPT_PATH: './?.pxs;./?/init.pxs',
      fileExists: (path) => {
        // Check if path exists in our script cache
        const normalizedPath = path.replace(/^\.\//, '');
        return this._scriptCache.has(normalizedPath);
      },
      loadFile: (path) => {
        const normalizedPath = path.replace(/^\.\//, '');
        const content = this._scriptCache.get(normalizedPath);
        if (!content) {
          throw new Error(`Script not found: ${path}`);
        }
        return content;
      }
    };

    this.env = this.pixoscript.createEnv(config);
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
    try {
      return await this.env.parse(script).exec();
    } catch (e) {
      console.error('[PixoScript] Runtime Error:', e.message);

      // Attempt to extract line number from typical Lua error format: [string "..."]:line: message
      const match = e.message && typeof e.message === 'string' ? e.message.match(/:(\d+):/) : null;
      if (match) {
        const lineNum = parseInt(match[1]);
        const lines = script.split('\n');
        console.error(`Error at line ${lineNum}:`);

        // Print context (previous line, error line, next line)
        const start = Math.max(0, lineNum - 2);
        const end = Math.min(lines.length, lineNum + 1);

        for (let i = start; i < end; i++) {
          const marker = i === (lineNum - 1) ? '> ' : '  ';
          console.error(`${marker}${i + 1}: ${lines[i]}`);
        }
      }
      throw e;
    }
  };
}
