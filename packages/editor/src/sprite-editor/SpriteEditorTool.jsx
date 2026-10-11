/*
 * ---------------------------------------------------------------
 *           PixoSpritz – Editor – SpriteEditorTool
 * ---------------------------------------------------------------
 * Copyright (c) 2022-2025  Kyle Derby MacInnis
 *
 * (P3-10) Sprite editor migrated onto the new core.  The legacy
 * `zip` / `getData` props are gone; spritesheet lookup goes
 * through the repository-backed resolveAsset.  Save routes
 * through the command bus (undoable).
 */

import SpriteEditor from './index.jsx';
import { createMigratedTool } from '../shell/migrateTool.jsx';

function bytesToDataUri(bytes, mime) {
  let binary = '';
  const chunk = 0x8000;
  for (let i = 0; i < bytes.length; i += chunk) {
    binary += String.fromCharCode.apply(null, bytes.subarray(i, i + chunk));
  }
  return `data:${mime};base64,${btoa(binary)}`;
}

export const SpriteEditorTool = createMigratedTool({
  kind: 'json',
  View: SpriteEditor,
  commands: [
    // Note: Export command removed — it dispatched a dead px:sprite-export event
    // with no handler. Re-add when the sprite editor implements export.
  ],
  mapProps: ({ resolveAsset }) => ({
    // Replaces the legacy findImageEntry(zip.root, src) + getData + toDataUri
    // path in the view: repository-backed lookup, data-URI output.
    toDataUri: bytesToDataUri,
    resolveSpriteImage: async src => {
      const entries = await resolveAsset.list('');
      const match = entries.find(e => e === src || e.endsWith('/' + src));
      if (!match) throw new Error(`Spritesheet image not found: ${src}`);
      const bytes = await resolveAsset.read(match);
      const ext = src.split('.').pop().toLowerCase();
      return bytesToDataUri(bytes, `image/${ext === 'jpg' ? 'jpeg' : ext}`);
    },
  }),
});

export default SpriteEditorTool;
