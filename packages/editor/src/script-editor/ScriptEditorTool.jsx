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
  // Tab identity: app.jsx opens each tool in a tab keyed by documentPath and
  // dispatches 'px:shell-save' with detail.tabId = the active tab id, so the
  // editor answers Ctrl+S only when it is the active tab.
  mapProps: ({ documentPath }) => ({ tabId: documentPath }),
  commands: [
    // Note: Run and Format commands removed — they dispatched dead px:* events
    // with no handlers. Re-add when the script editor implements these actions.
  ],
});

export default ScriptEditorTool;
