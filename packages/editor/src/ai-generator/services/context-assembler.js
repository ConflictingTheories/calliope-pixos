/**
 * ---------------------------------------------------------------
 *            AI Generator - Context Assembler
 * ---------------------------------------------------------------
 * Copyright (c) 2022-2025 Kyle Derby MacInnis
 *
 * Builds the structured project context handed to the model:
 * the current document, the asset inventory (from the
 * ProjectRepository), and the pixozine manifest shape. The user
 * controls exactly what is included via explicit toggles in the
 * UI — nothing is sent silently.
 *
 * Everything is budget-capped: large projects are truncated with
 * a note rather than blowing the model's context window.
 */

export const CONTEXT_BUDGETS = {
  maxFileChars: 8000,
  maxAssetEntries: 120,
  maxManifestChars: 4000,
  maxSummaryChars: 12000,
};

function truncate(str, max, label) {
  if (typeof str !== 'string') return '';
  if (str.length <= max) return str;
  return str.slice(0, max) + `\n…[truncated ${label}: ${str.length - max} more chars]`;
}

/**
 * Assemble structured context for generation.
 *
 * @param {object} opts
 * @param {boolean} opts.includeCurrentFile - include the open document
 * @param {boolean} opts.includeProject - include project file listing
 * @param {boolean} opts.includeAssets - include asset inventory
 * @param {object} [opts.currentDocument] - { path, kind, content }
 * @param {object} [opts.projectRepository] - ProjectRepository instance
 * @param {object} [opts.manifest] - pixozine manifest object
 * @param {object} [opts.selection] - current editor selection, if any
 * @returns {Promise<object>} { summary, files, assets, manifest, selection, included }
 */
export async function assembleContext(opts = {}) {
  const {
    includeCurrentFile = true,
    includeProject = false,
    includeAssets = false,
    currentDocument = null,
    projectRepository = null,
    manifest = null,
    selection = null,
  } = opts;

  const included = [];
  const files = [];
  let assets = [];
  let manifestText = '';

  if (includeCurrentFile && currentDocument) {
    included.push('current-file');
    files.push({
      path: currentDocument.path ?? '(untitled)',
      kind: currentDocument.kind ?? 'unknown',
      content: truncate(
        typeof currentDocument.content === 'string'
          ? currentDocument.content
          : JSON.stringify(currentDocument.content ?? ''),
        CONTEXT_BUDGETS.maxFileChars,
        'file'
      ),
    });
  }

  if ((includeProject || includeAssets) && projectRepository && typeof projectRepository.list === 'function') {
    try {
      const entries = await projectRepository.list('');
      const names = Array.isArray(entries) ? entries.map(e => (typeof e === 'string' ? e : e.path ?? e.name ?? String(e))) : [];
      if (includeProject) {
        included.push('project');
        files.push({
          path: '(project listing)',
          kind: 'listing',
          content: names.slice(0, CONTEXT_BUDGETS.maxAssetEntries).join('\n'),
        });
      }
      if (includeAssets) {
        included.push('assets');
        assets = names.slice(0, CONTEXT_BUDGETS.maxAssetEntries);
      }
    } catch {
      // Repository unreadable — context simply omits it
    }
  }

  if (manifest) {
    manifestText = truncate(JSON.stringify(manifest, null, 2), CONTEXT_BUDGETS.maxManifestChars, 'manifest');
  }

  const parts = [];
  if (files.length > 0) {
    parts.push(
      'FILES:\n' +
        files.map(f => `--- ${f.path} (${f.kind}) ---\n${f.content}`).join('\n')
    );
  }
  if (assets.length > 0) {
    parts.push(`PROJECT ASSETS (${assets.length}):\n${assets.join('\n')}`);
  }
  if (manifestText) {
    parts.push(`PIXOZINE MANIFEST:\n${manifestText}`);
  }
  if (selection) {
    parts.push(`CURRENT SELECTION:\n${truncate(JSON.stringify(selection), 2000, 'selection')}`);
  }

  const summary = truncate(parts.join('\n\n'), CONTEXT_BUDGETS.maxSummaryChars, 'context');

  return {
    summary,
    files,
    assets,
    manifest: manifestText,
    selection: selection ?? null,
    included,
  };
}

/**
 * Describe what will be included, for the UI toggle labels.
 */
export function describeInclusion(flags) {
  const parts = [];
  if (flags.includeCurrentFile) parts.push('current file');
  if (flags.includeProject) parts.push('project listing');
  if (flags.includeAssets) parts.push('asset inventory');
  if (parts.length === 0) return 'no project context';
  return parts.join(', ');
}
