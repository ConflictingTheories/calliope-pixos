/*
 * ---------------------------------------------------------------
 *           PixoSpritz – Editor – TileEditorTool
 * ---------------------------------------------------------------
 * Copyright (c) 2022-2025  Kyle Derby MacInnis
 *
 * (P3-10) Tile editor migrated onto the new core.  Document
 * access via the registry, save via the command bus (undoable),
 * shell commands registered for the palette.
 */

import TileEditor from './index.jsx';
import { createMigratedTool } from '../shell/migrateTool.jsx';

export const TileEditorTool = createMigratedTool({
  kind: 'json',
  View: TileEditor,
  commands: [
    {
      id: 'tile-editor.add-tile',
      title: 'Add tile',
      group: 'tile-editor',
      run: () => document.dispatchEvent(new CustomEvent('px:tile-add')),
    },
  ],
});

export default TileEditorTool;
