/*
 * ---------------------------------------------------------------
 *           PixoSpritz – Editor – ScriptEditorTool
 * ---------------------------------------------------------------
 * Copyright (c) 2022-2025  Kyle Derby MacInnis
 *
 * (P3-10) Script editor migrated onto the new core.  Document
 * access via the registry (kind 'script'), save via the command
 * bus (undoable), run/format exposed as shell commands.
 */

import ScriptEditor from './index.jsx';
import { createMigratedTool } from '../shell/migrateTool.jsx';

export const ScriptEditorTool = createMigratedTool({
  kind: 'script',
  View: ScriptEditor,
  commands: [
    {
      id: 'script-editor.run',
      title: 'Run script',
      group: 'script-editor',
      shortcut: 'ctrl+enter',
      run: () => document.dispatchEvent(new CustomEvent('px:script-run')),
    },
    {
      id: 'script-editor.format',
      title: 'Format script',
      group: 'script-editor',
      run: () => document.dispatchEvent(new CustomEvent('px:script-format')),
    },
  ],
});

export default ScriptEditorTool;
