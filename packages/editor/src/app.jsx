/*
 * ---------------------------------------------------------------
 *                     Pixospritz – Editor App
 * ---------------------------------------------------------------
 * Copyright (c) 2022‑2025  Kyle Derby MacInnis
 *
 * Main application container for the Pixospritz editor.  It
 * orchestrates the zip manager sidebar and renders the various
 * preview/editing panes depending on the file type selected by
 * the user.  New viewers and editors are registered below to
 * support audio, 3D models, maps, tilesets and cutscenes in
 * addition to text and image files.
 */

import React, { useState, useEffect, useCallback, useRef, Suspense } from 'react';

import ZipManager from './zip-manager/index.jsx';
// (P3-12) Tool panels load lazily via the tool registry — the shell
// bundle no longer parses all 12 panels at boot.
import { getTool } from './shell/toolRegistry.js';
// (P2-09) Single keyboard dispatcher + command registry.
import { keymap } from './shell/commands/keymap.js';
import { commands } from './shell/commands/commands.js';
import CommandPalette from './shell/commands/CommandPalette.jsx';
// (UX Phase 2) Shortcut reference dialog (finding A3.1) — generated
// from the command registry so it never goes stale.
import ShortcutHelp from './shell/commands/ShortcutHelp.jsx';
// (P2-07) Save status bus: domain save paths report here, never alert().
import { useSaveStatus, reportSaveOk, reportSaveError } from './shell/saveStatus.js';
// (P3-14) Blob URLs for binary previews — no base64 data URIs.
import { createPreviewUrl, revokePreviewUrl } from './shared/blobUrls.js';
import ImagePreviewTool from './image-preview/ImagePreviewTool.jsx';
import { createDefaultRegistry } from './core/documents/registry.js';
import SpriteEditorTool from './sprite-editor/SpriteEditorTool.jsx';
import TileEditorTool from './tile-editor/TileEditorTool.jsx';
import ScriptEditorTool from './script-editor/ScriptEditorTool.jsx';
import { CommandBus } from './core/commands/commandBus.js';
import { ProjectStore } from './core/project/projectStore.js';
import { BridgedProjectRepository } from './core/project/repository.js';
import ProjectSettings from './components/ProjectSettings.jsx';
import ModeEditor from './components/ModeEditor.jsx';
import UpdateTracker from './components/UpdateTracker.jsx';
import ShaderEditor from './components/ShaderEditor.jsx';
import PortalEditor from './components/PortalEditor.jsx';
import BehaviorEditor from './components/BehaviorEditor.jsx';
import LightEditor from './components/LightEditor.jsx';
import SceneTest from './components/SceneTest.jsx';

const AudioPreview = getTool('audio-preview').component;
const ModelPreview = getTool('model-preview').component;
const UnifiedMapEditor = getTool('map-editor').component;
const CutsceneTool = getTool('cutscene-tool').component;
const GeometryEditor = getTool('geometry-editor').component;
const GeometryEditor3D = getTool('geometry-editor-3d').component;
const AIGenerator = getTool('ai-generator').component;
import { loadTilesetWithExtends, mergeDeep, resolveExtends } from './shared/extends-utils.js';
import FirstTimeWizard from './onboarding/FirstTimeWizard.jsx';
import './onboarding/FirstTimeWizard.css';
import { debug, debugWarn, debugError } from './shared/debug-logger.js';
import ConsolePanel, { useConsole } from './script-editor/ConsolePanel.jsx';
import { addLogListener, removeLogListener } from 'pixospritz-core/engine/utils/debug-logger.js';
// (UX Phase 1) Multi-document tabs + toast feedback.
import { useToast } from './shared/components/Toast.jsx';
import { Button, Modal } from './ui';
// (UX Phase 2) Per-tool crash containment — a tool crash shows a
// crash card instead of white-screening the app (finding A1.2).
import ErrorBoundary from './shared/components/ErrorBoundary.jsx';
import './shell/tabs.css';
import {
  PublishToSvrnDialog,
  buildSvrnBundle,
  uploadBundle,
  localDownloadTarget,
} from './svrn-publish/index.js';

const SUPPORT_LINKS = [
  { href: 'https://github.com/sponsors/ConflictingTheories', icon: '❤️', label: 'GitHub Sponsors' },
  { href: 'https://patreon.com/kderbyma', icon: '🎨', label: 'Patreon' },
  { href: 'https://ko-fi.com/kderbyma', icon: '☕', label: 'Ko-fi' },
  { href: 'https://buymeacoffee.com/kderbyma', icon: '☕', label: 'Buy Me a Coffee' },
];

const COMMUNITY_ACTIONS = [
  '⭐ Star the GitHub repo',
  '🐛 Report engine or editor bugs',
  '💡 Share feature ideas',
  '📢 Spread Pixospritz to other devs',
];

/**
 * Primary React component that drives the editor UI.
 * Maintains package state, renders the appropriate editor pane, and exposes
 * helpers for asset validation, file management, and content previews.
 * @returns {React.ReactElement}
 */
const App = () => {
  const toast = useToast();
  // (UX Phase 1) Multi-document tabs. Each tab keeps its tool element
  // mounted (inactive tabs are hidden, not unmounted), so switching
  // documents no longer destroys tool state. Tab ids are stable
  // document paths — reopening a file focuses its tab.
  const [tabs, setTabs] = useState([]);
  const [activeTabId, setActiveTabId] = useState(null);
  const tabsRef = useRef([]);
  useEffect(() => {
    tabsRef.current = tabs;
  }, [tabs]);
  // Dirty paths from the project store -> dirty-dot indicators.
  const [dirtyPaths, setDirtyPaths] = useState([]);
  // Mirror for the closeTab callback (avoids stale state).
  const dirtyPathsRef = useRef([]);
  useEffect(() => {
    dirtyPathsRef.current = dirtyPaths;
  }, [dirtyPaths]);
  // Per-tab blob URLs for binary previews (revoked on tab close).
  const previewUrlsRef = useRef(new Map());
  useEffect(() => {
    const urls = previewUrlsRef.current;
    return () => {
      for (const url of urls.values()) revokePreviewUrl(url);
      urls.clear();
    };
  }, []);

  const openTab = useCallback((id, label, element, kind = 'document') => {
    setTabs(prev => {
      if (prev.some(t => t.id === id)) return prev;
      return [...prev, { id, label, kind, element }];
    });
    setActiveTabId(id);
  }, []);

  const [pendingCloseTab, setPendingCloseTab] = useState(null);

  const doCloseTab = useCallback(id => {
    setPendingCloseTab(null);
    const url = previewUrlsRef.current.get(id);
    if (url) {
      revokePreviewUrl(url);
      previewUrlsRef.current.delete(id);
    }
    const prev = tabsRef.current;
    const idx = prev.findIndex(t => t.id === id);
    if (idx === -1) return;
    const next = prev.filter(t => t.id !== id);
    setTabs(next);
    setActiveTabId(current => {
      if (current !== id) return current;
      if (next.length === 0) return null;
      return next[Math.min(idx, next.length - 1)].id;
    });
  }, []);

  const closeTab = useCallback(id => {
    // (UX Phase 2) Forgiveness: dirty tabs route through an in-app
    // confirmation — never window.confirm(), never silent loss.
    const isDirty = dirtyPathsRef.current.includes(id);
    if (isDirty) {
      setPendingCloseTab(id);
      return;
    }
    doCloseTab(id);
  }, [doCloseTab]);

  const cycleTab = useCallback(direction => {
    const list = tabsRef.current;
    if (list.length < 2) return;
    setActiveTabId(current => {
      const idx = list.findIndex(t => t.id === current);
      const from = idx === -1 ? 0 : idx;
      return list[(from + direction + list.length) % list.length].id;
    });
  }, []);
  // Keep track of the loaded package filesystem
  const [zip, setZip] = useState(null);
  // Keep a list of image assets (name and data URI) for use in the tileset editor
  const [assets, setAssets] = useState([]);

  // Validation report state.  When set, contains an object with `errors` and `warnings`
  const [validationReport, setValidationReport] = useState(null);
  const [supportPreference, setSupportPreference] = useState(true);
  const [supportPanelPinned, setSupportPanelPinned] = useState(false);
  const [supportMenuOpen, setSupportMenuOpen] = useState(false);
  const [hideTitleBar, setHideTitleBar] = useState(false);
  const [showWizard, setShowWizard] = useState(false);
  const supportFabRef = useRef(null);

  // Console State
  const consoleState = useConsole();
  const [showConsole, setShowConsole] = useState(false);
  const [consoleHeight, setConsoleHeight] = useState(250);

  // Hook up core logger to console
  useEffect(() => {
    const handleLog = msg => {
      // msg = { level, component, args, timestamp, text }
      switch (msg.level) {
        case 'error':
          consoleState.error(`[${msg.component}] ${msg.text}`);
          break;
        case 'warn':
          consoleState.warn(`[${msg.component}] ${msg.text}`);
          break;
        case 'debug':
          consoleState.debug(`[${msg.component}] ${msg.text}`);
          break;
        default:
          consoleState.info(`[${msg.component}] ${msg.text}`);
          break;
      }
    };
    addLogListener(handleLog);
    return () => removeLogListener(handleLog);
  }, [consoleState]);

  // (P2-10/P3-10) Shared core for migrated tools.  The repository is
  // bridged onto the live zip-manager session so migrated tools read
  // and write the same project the shell has open.
  const toolCore = useMemo(() => {
    const store = new ProjectStore();
    const repository = new BridgedProjectRepository({
      read: async (path, options = {}) => {
        const entry = findEntryByPath(path);
        if (!entry) throw new Error(`not found: ${path}`);
        return getData(entry, options.as !== 'bytes');
      },
      write: async (path, data) => {
        await writeFile(path, data);
      },
      list: async (dir = '') => {
        const out = [];
        const walk = (node, prefix) => {
          for (const child of node?.children || []) {
            const p = prefix ? `${prefix}/${child.name}` : child.name;
            if (child.directory) walk(child, p);
            else out.push(p);
          }
        };
        walk(zip, '');
        return dir ? out.filter(e => e.startsWith(dir + '/')) : out;
      },
      exists: async path => !!findEntryByPath(path),
    });
    // Bus ctx carries the repository via services (P1-04 guard seam).
    const bus = new CommandBus(store, { repository });
    return { registry: createDefaultRegistry(), commands, bus, store, repository };
    // Bridged once per open project; the closures delegate to the live session.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // (P2-09) Shell command infrastructure: palette visibility, the single
  // global keydown dispatcher, and the core command registrations.
  const [paletteOpen, setPaletteOpen] = useState(false);
  // (UX Phase 2) Shortcut help dialog state.
  const [shortcutsOpen, setShortcutsOpen] = useState(false);
  const saveStatus = useSaveStatus();
  // (Publishing vertical) "Publish to SVRN" dialog state.
  const [svrnPublishOpen, setSvrnPublishOpen] = useState(false);
  const [svrnPublishBusy, setSvrnPublishBusy] = useState(false);
  // Project tools state.
  const [projectSettingsOpen, setProjectSettingsOpen] = useState(false);
  const [modeEditorOpen, setModeEditorOpen] = useState(false);
  const [updateTrackerOpen, setUpdateTrackerOpen] = useState(false);
  const [shaderEditorOpen, setShaderEditorOpen] = useState(false);
  const [portalEditorOpen, setPortalEditorOpen] = useState(false);
  const [behaviorEditorOpen, setBehaviorEditorOpen] = useState(false);
  const [lightEditorOpen, setLightEditorOpen] = useState(false);
  const [sceneTestOpen, setSceneTestOpen] = useState(false);
  useEffect(() => {
    const offPalette = commands.register({
      id: 'shell.command-palette',
      title: 'Open command palette',
      group: 'shell',
      shortcut: 'ctrl+k',
      run: () => setPaletteOpen(true),
    });
    const offPublish = commands.register({
      id: 'svrn.publish',
      title: 'Publish to SVRN…',
      group: 'publish',
      run: () => setSvrnPublishOpen(true),
    });
    const offProjectSettings = commands.register({
      id: 'project.settings',
      title: 'Project Settings…',
      group: 'project',
      run: () => setProjectSettingsOpen(true),
    });
    const offModeEditor = commands.register({
      id: 'project.mode-editor',
      title: 'Mode Editor…',
      group: 'project',
      run: () => setModeEditorOpen(true),
    });
    const offUpdateTracker = commands.register({
      id: 'project.update-tracker',
      title: 'Update History…',
      group: 'project',
      run: () => setUpdateTrackerOpen(true),
    });
    const offShaderEditor = commands.register({
      id: 'tools.shader-editor',
      title: 'Shader Editor…',
      group: 'tools',
      run: () => setShaderEditorOpen(true),
    });
    const offPortalEditor = commands.register({
      id: 'tools.portal-editor',
      title: 'Portal Editor…',
      group: 'tools',
      run: () => setPortalEditorOpen(true),
    });
    const offBehaviorEditor = commands.register({
      id: 'tools.behavior-editor',
      title: 'Behavior Editor…',
      group: 'tools',
      run: () => setBehaviorEditorOpen(true),
    });
    const offLightEditor = commands.register({
      id: 'tools.light-editor',
      title: 'Light Editor…',
      group: 'tools',
      run: () => setLightEditorOpen(true),
    });
    const offSceneTest = commands.register({
      id: 'tools.scene-test',
      title: 'Test Scene…',
      group: 'tools',
      shortcut: 'ctrl+t',
      run: () => setSceneTestOpen(true),
    });
    // (UX Phase 2) Shortcut reference (finding A3.1).
    const offShortcuts = commands.register({
      id: 'shell.shortcuts',
      title: 'Keyboard shortcuts',
      group: 'shell',
      shortcut: 'shift+?',
      run: () => setShortcutsOpen(true),
    });
    const onKeyDown = e => keymap.handleKeyDown(e);
    window.addEventListener('keydown', onKeyDown);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
      offPalette();
      offPublish();
      offProjectSettings();
      offModeEditor();
      offUpdateTracker();
      offShaderEditor();
      offPortalEditor();
      offBehaviorEditor();
      offLightEditor();
      offSceneTest();
      offShortcuts();
    };
  }, []);

  // (UX Phase 2, backlog 2.7 / finding A3.2) Shell-level undo/redo wired
  // to the CommandBus. Tools route edits through the bus; the shell
  // surfaces undo/redo buttons + shortcuts so users can always tell
  // what is undoable.
  const bus = toolCore.bus;
  const [canUndo, setCanUndo] = useState(false);
  const [canRedo, setCanRedo] = useState(false);
  useEffect(() => {
    const sync = () => {
      setCanUndo(bus.canUndo);
      setCanRedo(bus.canRedo);
    };
    sync();
    const offExec = bus.on('executed', sync);
    const offUndone = bus.on('undone', sync);
    const offRedone = bus.on('redone', sync);
    return () => {
      offExec();
      offUndone();
      offRedone();
    };
  }, [bus]);
  useEffect(() => {
    const offUndo = commands.register({
      id: 'shell.undo',
      title: 'Undo',
      group: 'shell',
      shortcut: 'ctrl+z',
      when: () => bus.canUndo,
      run: () => {
        if (!bus.undo()) toast.info('Nothing to undo');
      },
    });
    const offRedo = commands.register({
      id: 'shell.redo',
      title: 'Redo',
      group: 'shell',
      shortcut: 'ctrl+shift+z',
      when: () => bus.canRedo,
      run: () => {
        if (!bus.redo()) toast.info('Nothing to redo');
      },
    });
    const offRedoAlt = commands.register({
      id: 'shell.redo-alt',
      title: 'Redo (alternate)',
      group: 'shell',
      shortcut: 'ctrl+y',
      when: () => bus.canRedo,
      run: () => {
        if (!bus.redo()) toast.info('Nothing to redo');
      },
    });
    return () => {
      offUndo();
      offRedo();
      offRedoAlt();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bus]);

  // (UX Phase 1) Tab keyboard shortcuts: ctrl+tab / ctrl+shift+tab cycle,
  // ctrl+w closes the active tab.
  useEffect(() => {
    const offNext = commands.register({
      id: 'shell.next-tab',
      title: 'Next open document',
      group: 'shell',
      shortcut: 'ctrl+tab',
      run: () => cycleTab(1),
    });
    const offPrev = commands.register({
      id: 'shell.prev-tab',
      title: 'Previous open document',
      group: 'shell',
      shortcut: 'ctrl+shift+tab',
      run: () => cycleTab(-1),
    });
    const offClose = commands.register({
      id: 'shell.close-tab',
      title: 'Close active document',
      group: 'shell',
      shortcut: 'ctrl+w',
      run: () => {
        if (activeTabIdRef.current) closeTab(activeTabIdRef.current);
      },
    });
    return () => {
      offNext();
      offPrev();
      offClose();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cycleTab, closeTab]);

  // Mirror of activeTabId for the shortcut callback.
  const activeTabIdRef = useRef(null);
  useEffect(() => {
    activeTabIdRef.current = activeTabId;
  }, [activeTabId]);

  // (Publishing vertical) "Publish to SVRN": build the versioned .svrn
  // bundle from the project repository and hand it to the upload target.
  // Today the target is local-download (the hub does not exist yet);
  // when it does, swap in the hub target — no flow changes needed.
  const handlePublishToSvrn = useCallback(
    async meta => {
      setSvrnPublishBusy(true);
      try {
        const bundle = await buildSvrnBundle({ repository: toolCore.repository, meta });
        await uploadBundle(bundle, localDownloadTarget);
        toast.success(`Bundle built: ${bundle.filename} (${bundle.manifest.fileCount} files)`, {
          title: 'Publish to SVRN',
        });
        setSvrnPublishOpen(false);
      } catch (err) {
        toast.error(err && err.message ? err.message : String(err), {
          title: 'Publish to SVRN failed',
        });
      } finally {
        setSvrnPublishBusy(false);
      }
    },
    [toast]
  );

  // (UX Phase 1) Dirty-dot indicators from the project store.
  useEffect(() => {
    const store = toolCore.store;
    if (!store || typeof store.on !== 'function') return undefined;
    const sync = () => {
      try {
        setDirtyPaths(store.dirtyDocuments());
      } catch {
        /* store unavailable */
      }
    };
    sync();
    const off = store.on('dirty-change', sync);
    return () => off();
  }, [toolCore]);

  // (UX Phase 1) Surface save failures as toasts, not just the status pill.
  const lastSaveToastAt = useRef(0);
  useEffect(() => {
    if (saveStatus.kind === 'error' && saveStatus.at !== lastSaveToastAt.current) {
      lastSaveToastAt.current = saveStatus.at;
      toast.error(saveStatus.message || 'Save failed', { title: 'Save failed' });
    } else if (saveStatus.kind === 'saved' && saveStatus.at !== lastSaveToastAt.current) {
      lastSaveToastAt.current = saveStatus.at;
      // Saved feedback stays subtle: the status pill shows it; toast only errors.
    }
  }, [saveStatus, toast]);

  const handleOptionsChange = useCallback(options => {
    if (!options) {
      return;
    }

    if (Object.prototype.hasOwnProperty.call(options, 'showSupportPanel')) {
      const allowSupportPanel = Boolean(options.showSupportPanel);
      setSupportPreference(allowSupportPanel);
      if (allowSupportPanel) {
        setSupportPanelPinned(false);
        setSupportMenuOpen(false);
      }
    }

    if (Object.prototype.hasOwnProperty.call(options, 'hideTitleBar')) {
      setHideTitleBar(Boolean(options.hideTitleBar));
    }
  }, []);

  const handleSupportFabClick = useCallback(() => {
    setSupportMenuOpen(prev => !prev);
  }, []);

  const handleSupportLinkClick = useCallback(() => {
    setSupportMenuOpen(false);
  }, []);

  const handleSupportPanelToggle = useCallback(() => {
    setSupportPanelPinned(prev => !prev);
    setSupportMenuOpen(false);
  }, []);

  const handleWizardClose = useCallback(() => {
    setShowWizard(false);
    try {
      localStorage.setItem('pixospritz_wizard_seen', '1');
    } catch {}
  }, []);

  // Show the welcome wizard on first launch (unless the user has seen it).
  useEffect(() => {
    try {
      if (!localStorage.getItem('pixospritz_wizard_seen')) {
        setShowWizard(true);
      }
    } catch {}
  }, []);

  useEffect(() => {
    if (!supportMenuOpen) {
      return undefined;
    }

    const handlePointer = event => {
      if (supportFabRef.current && !supportFabRef.current.contains(event.target)) {
        setSupportMenuOpen(false);
      }
    };

    const handleKey = event => {
      if (event.key === 'Escape') {
        setSupportMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handlePointer);
    document.addEventListener('touchstart', handlePointer);
    document.addEventListener('keydown', handleKey);

    return () => {
      document.removeEventListener('mousedown', handlePointer);
      document.removeEventListener('touchstart', handlePointer);
      document.removeEventListener('keydown', handleKey);
    };
  }, [supportMenuOpen]);

  /**
   * Read a file entry from the package filesystem and return its text
   * representation or raw bytes when requested.
   * @param {object} entry - Zip.js entry describing the file.
   * @param {boolean} [asText=false] - Whether to resolve the content as text.
   * @returns {Promise<string|Uint8Array|null>}
   */
  const getData = useCallback(async (entry, asText = false) => {
    if (!entry) return null;

    // Handle newly created files that have Blob data directly
    if (entry.data instanceof Blob) {
      debug('App', '[getData] Entry has Blob data directly, reading...');
      if (asText) {
        return await entry.data.text();
      } else {
        const arrayBuffer = await entry.data.arrayBuffer();
        return new Uint8Array(arrayBuffer);
      }
    }

    // Check if entry has the data.getData method (zip.js filesystem structure for original files)
    if (!entry.data || typeof entry.data.getData !== 'function') {
      console.error('[getData] Entry missing data.getData and is not a Blob:', entry);
      return null;
    }

    if (asText) {
      let stream = new TransformStream();
      let dataPromise = new Response(stream.readable).text();
      await entry.data.getData(stream.writable);
      return await dataPromise;
    }
    // For binary data
    let stream = new TransformStream();
    let dataPromise = new Response(stream.readable).arrayBuffer();
    await entry.data.getData(stream.writable);
    const arrayBuffer = await dataPromise;
    return new Uint8Array(arrayBuffer);
  }, []);

  /**
   * Convert binary bytes to a base64 data URI with the provided MIME type.
   * @param {Uint8Array|string} binaryString - Raw bytes or string to encode.
   * @param {string} mimeType - MIME type of the binary payload.
   * @returns {string}
   */
  const toDataUri = useCallback((binaryString, mimeType) => {
    if (!binaryString) return '';
    const bytes =
      typeof binaryString !== 'string'
        ? binaryString
        : new Uint8Array([...binaryString].map(c => c.charCodeAt(0)));
    let binary = '';
    bytes.forEach(b => (binary += String.fromCharCode(b)));
    const base64String = btoa(binary);
    return `data:${mimeType};base64,${base64String}`;
  }, []);

  /**
   * Write or replace content at the given path in the loaded package.
   * Supports both text content and binary Blob content.
   * @param {string} filePath - Full path of the file inside the package.
   * @param {string|Blob} content - UTF-8 text or Blob to save.
   * @returns {Promise<void>}
   */
  const writeFile = useCallback(
    async (filePath, content) => {
      if (!zip) {
        throw new Error('Package filesystem not available');
      }

      // Helper to find a file in the tree
      const findFile = (node, path = '', targetPath) => {
        if (node.children) {
          for (const child of node.children) {
            const fullPath = path ? `${path}/${child.name}` : child.name;
            if (!child.directory && fullPath === targetPath) {
              return child;
            }
            if (child.directory) {
              const found = findFile(child, fullPath, targetPath);
              if (found) return found;
            }
          }
        }
        return null;
      };

      // Helper to find a directory in the tree
      const findDirectory = (node, path = '', targetPath) => {
        const currentPath = path || (node === zip.root ? '' : node.name);
        if (currentPath === targetPath) {
          return node;
        }
        if (node.children) {
          for (const child of node.children) {
            if (child.directory) {
              const childPath = path ? `${path}/${child.name}` : child.name;
              const found = findDirectory(child, childPath, targetPath);
              if (found) return found;
            }
          }
        }
        return null;
      };

      const existingFile = findFile(zip.root, '', filePath);
      const fileName = filePath.split('/').pop();
      const dirPath = filePath.substring(0, filePath.lastIndexOf('/'));

      let parentFolder;

      if (existingFile) {
        // File exists - update it
        parentFolder = existingFile.parent;

        if (!parentFolder) {
          throw new Error(`Cannot find parent folder for: ${filePath}`);
        }

        await zip.remove(existingFile);
      } else {
        // File doesn't exist - create it in the appropriate directory
        // Find the parent directory
        parentFolder = dirPath ? findDirectory(zip.root, '', dirPath) : zip.root;

        if (!parentFolder) {
          // Try to create missing directories
          const pathParts = dirPath.split('/');
          let currentDir = zip.root;
          let currentPath = '';

          for (const part of pathParts) {
            if (!part) continue;
            currentPath = currentPath ? `${currentPath}/${part}` : part;
            const existingDir = findDirectory(zip.root, '', currentPath);

            if (existingDir) {
              currentDir = existingDir;
            } else {
              // Create the directory
              currentDir = await currentDir.addDirectory(part);
            }
          }
          parentFolder = currentDir;
        }
      }

      // Add the file with content
      let blob;
      if (content instanceof Blob) {
        // Already a blob (binary file like images)
        blob = content;
      } else {
        // Text content - wrap in blob
        blob = new Blob([content], { type: 'text/plain' });
      }

      await parentFolder.addBlob(fileName, blob);
    },
    [zip]
  );

  /**
   * Get the full path of a zip entry by traversing up to the root parent.
   * @param {object} entry - Zip.js entry whose path is resolved.
   * @returns {string}
   */
  const getEntryFullPath = useCallback(entry => {
    if (entry.fullName) {
      debug('App', '[getEntryFullPath] Using entry.fullName:', entry.fullName);
      return entry.fullName;
    }

    const parts = [];
    let current = entry;
    while (current && current.name) {
      parts.unshift(current.name);
      current = current.parent;
      // Safety check to avoid infinite loop
      if (parts.length > 20) {
        console.error('[getEntryFullPath] Loop detected, breaking');
        break;
      }
    }
    const fullPath = parts.join('/');
    debug('App', '[getEntryFullPath] Constructed path:', fullPath, 'from parts:', parts);
    return fullPath;
  }, []);

  // (P3-10) Reverse lookup for the repository bridge: path -> zip entry.
  const findEntryByPath = useCallback(
    target => {
      let found = null;
      const walk = node => {
        for (const child of node?.children || []) {
          if (getEntryFullPath(child) === target) {
            found = child;
            return;
          }
          if (child.directory) walk(child);
          if (found) return;
        }
      };
      walk(zip);
      return found;
    },
    [zip, getEntryFullPath]
  );

  /**
   * Build a list of image assets with URIs so the tileset editor can
   * render them.  Supports png, jpg/jpeg, gif, and bmp files.
   * @param {object} zipFs - Zip.js filesystem for the loaded package.
   * @returns {Promise<void>}
   */
  const buildAssetList = useCallback(
    async zipFs => {
      if (!zipFs || typeof zipFs.entries !== 'function') {
        setAssets([]);
        return;
      }
      const imageExts = ['png', 'jpg', 'jpeg', 'gif', 'bmp'];
      const list = [];
      const promises = [];
      for (const entry of zipFs.entries()) {
        if (entry.directory) continue;
        const ext = entry.name.split('.').pop().toLowerCase();
        if (imageExts.includes(ext)) {
          promises.push(
            getData(entry, false).then(bin => {
              const mime = `image/${ext === 'jpg' ? 'jpeg' : ext}`;
              const uri = toDataUri(bin, mime);
              list.push({ name: entry.name, uri });
            })
          );
        }
      }
      await Promise.all(promises);
      setAssets(list);
    },
    [getData, toDataUri]
  );

  // Whenever a new zip is loaded, rebuild the asset list
  // Rebuild asset list when zip changes
  useEffect(() => {
    if (zip) {
      buildAssetList(zip);
    } else {
      setAssets([]);
    }
  }, [zip, buildAssetList]);

  /**
   * Validate the currently loaded package by scanning JSON assets and
   * collecting cross-reference errors/warnings.
   * @returns {Promise<void>}
   */
  const validatePackage = useCallback(async () => {
    if (!zip) {
      setValidationReport(null);
      return;
    }
    const errors = [];
    const warnings = [];
    const assetNames = assets.map(a => a.name);
    const tilesets = [];
    const mapsList = [];
    const cutscenes = [];
    const entries = zip.files
      ? Object.values(zip.files).filter(e => !e.dir && e.name.toLowerCase().endsWith('.json'))
      : [];
    await Promise.all(
      entries.map(async entry => {
        try {
          const data = entry.async ? await entry.async('string') : await getData(entry);
          const obj = JSON.parse(data);
          const name = entry.name;
          const lower = name.toLowerCase();
          if (lower.includes('tileset') || lower.includes('tiles')) {
            const tiles = Array.isArray(obj.tiles) ? obj.tiles : [];
            const geom = Array.isArray(obj.geometry) ? obj.geometry : [];
            tilesets.push({ name, tiles, geometry: geom });
          } else if (lower.includes('map')) {
            const layers = Array.isArray(obj.layers) ? obj.layers : obj.cells ? [obj.cells] : [];
            const attributes = Array.isArray(obj.attributes) ? obj.attributes : [];
            mapsList.push({ name, layers, attributes });
          } else if (lower.includes('cutscene')) {
            const events = Array.isArray(obj) ? obj : [];
            cutscenes.push({ name, events });
          }
        } catch (err) {
          errors.push(`File ${entry.name} contains invalid JSON`);
        }
      })
    );
    // Build a set of all tile IDs defined across all tilesets
    const tileIdSet = new Set();
    tilesets.forEach(ts => {
      ts.tiles.forEach(tile => {
        if (typeof tile.id === 'number') tileIdSet.add(tile.id);
      });
    });
    // Validate tilesets
    tilesets.forEach(ts => {
      ts.tiles.forEach((tile, idx) => {
        if (tile.geometry !== undefined && tile.geometry !== null) {
          const geomIndex = tile.geometry;
          const length = ts.geometry.length;
          if (geomIndex < 0 || geomIndex >= length) {
            errors.push(`Tileset ${ts.name}: tile ${idx} has invalid geometry index ${geomIndex}`);
          }
        }
        if (tile.texture) {
          if (!assetNames.includes(tile.texture)) {
            errors.push(
              `Tileset ${ts.name}: tile ${idx} references missing texture ${tile.texture}`
            );
          }
        }
      });
    });
    // Validate maps
    mapsList.forEach(m => {
      m.layers.forEach(layer => {
        layer.forEach(row => {
          row.forEach(cell => {
            if (cell !== 0 && !tileIdSet.has(cell)) {
              errors.push(`Map ${m.name}: cell value ${cell} is not a valid tile id`);
            }
          });
        });
      });
    });
    // Validate cutscenes
    cutscenes.forEach(cs => {
      cs.events.forEach((ev, idx) => {
        if (ev.type === 'dialogue' && ev.portrait) {
          if (!assetNames.includes(ev.portrait)) {
            errors.push(
              `Cutscene ${cs.name}: event ${idx + 1} references missing portrait ${ev.portrait}`
            );
          }
        }
      });
    });
    setValidationReport({ errors, warnings });
  }, [zip, assets, getData]);

  // Editor/viewer renderers
  // (P3-10) Script editor migrated: registry load, command-bus save
  // (undoable), shell commands.  No direct ZIP path.
  const renderScriptEditor = useCallback(
    async (entry, lang) => {
      const script = await getData(entry, true);
      const fullPath = getEntryFullPath(entry);
      openTab(fullPath, entry.name, (
        <ScriptEditorTool
          key={fullPath}
          documentPath={fullPath}
          core={toolCore}
          text={script}
          initialProps={{ lang, type: 'script-only' }}
        />
      ));
    },
    [getData, getEntryFullPath, toolCore]
  );


  // (P2-10) Image preview migrated onto the new core: document access
  // via the registry, zoom via shell commands.  No direct ZIP path.
  const renderImagePreview = useCallback(
    async entry => {
      const imageBytes = await getData(entry, false);
      const extension = entry.name.split('.').pop().toLowerCase();
      const mime = `image/${extension === 'jpg' ? 'jpeg' : extension}`;
      const fullPath = getEntryFullPath(entry);
      openTab(fullPath, entry.name, (
        <ImagePreviewTool
          key={fullPath}
          documentPath={fullPath}
          core={toolCore}
          imageBytes={imageBytes}
          mime={mime}
        />
      ), 'preview');
    },
    [getData, getEntryFullPath, toolCore]
  );

  const renderAudioPreview = useCallback(
    async entry => {
      const audioBytes = await getData(entry, false);
      const extension = entry.name.split('.').pop().toLowerCase();
      const mime = `audio/${extension}`;
      const tabId = getEntryFullPath(entry);
      const url = createPreviewUrl(audioBytes, mime);
      previewUrlsRef.current.set(tabId, url);
      openTab(tabId, entry.name, <AudioPreview key={tabId} content={url} />, 'preview');
    },
    [getData, getEntryFullPath, openTab]
  );

  /**
   * Render a 3D model preview with full support for OBJ files with MTL and textures.
   * Automatically discovers and loads associated MTL files and textures from the zip.
   */
  const renderModelPreview = useCallback(
    async entry => {
      const extension = entry.name.split('.').pop().toLowerCase();

      // Helper to get full path of an entry
      const getEntryPath = ent => {
        if (ent.fullName) return ent.fullName;
        const parts = [];
        let current = ent;
        while (current && current.name) {
          parts.unshift(current.name);
          current = current.parent;
        }
        return parts.join('/');
      };

      // Get the directory path of the model file
      const entryPath = getEntryPath(entry);
      const modelDir = entryPath.substring(0, entryPath.lastIndexOf('/') + 1);

      // Get all entries from zip
      let allEntries = [];
      if (zip) {
        if (typeof zip.entries === 'function') {
          allEntries = Array.from(zip.entries());
        } else if (zip.root) {
          const buildEntryList = (node, path = '', list = []) => {
            if (node.children) {
              node.children.forEach(child => {
                const fullPath = path ? `${path}/${child.name}` : child.name;
                if (!fullPath.includes('__MACOSX') && !child.name.startsWith('._')) {
                  if (!child.directory) {
                    list.push({ ...child, fullName: fullPath });
                  }
                  buildEntryList(child, fullPath, list);
                }
              });
            }
            return list;
          };
          allEntries = buildEntryList(zip.root);
        }
      }

      if (extension === 'obj') {
        // Read OBJ file content
        const objBytes = await getData(entry, false);
        const objText = new TextDecoder().decode(objBytes);

        // Parse OBJ to find mtllib reference
        let mtlFileName = null;
        const mtlMatch = objText.match(/mtllib\s+(.+)/i);
        if (mtlMatch) {
          mtlFileName = mtlMatch[1].trim();
        }

        // Find and load MTL file
        let mtlContent = '';
        let materials = {};
        if (mtlFileName) {
          const mtlPath = modelDir + mtlFileName;
          const mtlEntry = allEntries.find(e => (e.fullName || e.name) === mtlPath);
          if (mtlEntry) {
            const mtlBytes = await getData(mtlEntry, false);
            mtlContent = new TextDecoder().decode(mtlBytes);

            // Parse MTL to find texture references
            const lines = mtlContent.split(/\r?\n/);
            let currentMaterial = null;
            for (const line of lines) {
              const parts = line.trim().split(/\s+/);
              if (parts[0] === 'newmtl') {
                currentMaterial = parts[1];
                materials[currentMaterial] = {};
              } else if (currentMaterial && parts[0] === 'map_Kd') {
                materials[currentMaterial].map_Kd = parts.slice(1).join(' ');
              }
            }
          }
        }

        // Load textures referenced in MTL
        const textures = {};
        for (const matName of Object.keys(materials)) {
          const mat = materials[matName];
          if (mat.map_Kd) {
            const texPath = modelDir + mat.map_Kd;
            const texEntry = allEntries.find(e => (e.fullName || e.name) === texPath);
            if (texEntry) {
              const texBytes = await getData(texEntry, false);
              const texExt = mat.map_Kd.split('.').pop().toLowerCase();
              const texMime = `image/${texExt === 'jpg' ? 'jpeg' : texExt}`;
              textures[mat.map_Kd] = toDataUri(texBytes, texMime);
            }
          }
        }

        openTab(getEntryFullPath(entry), entry.name, (
          <ModelPreview
            key={getEntryFullPath(entry)}
            content={objText}
            mtlContent={mtlContent}
            textures={textures}
            textureBasePath={modelDir}
          />
        ), 'preview');
      } else {
        // For GLTF/GLB, pass as data URI
        const modelBytes = await getData(entry, false);
        const mimeLookup = {
          mtl: 'text/plain',
          gltf: 'model/gltf+json',
          glb: 'model/gltf-binary',
        };
        const mime = mimeLookup[extension] || 'application/octet-stream';
        const dataUri = toDataUri(modelBytes, mime);
        const modelTabId = getEntryFullPath(entry);
        openTab(modelTabId, entry.name, <ModelPreview key={modelTabId} content={dataUri} />, 'preview');
      }
    },
    [getData, toDataUri, zip]
  );

  const renderMapEditor = useCallback(
    async entry => {
      debug('App', 'Loading map editor for:', entry.name);
      debug('App', 'Zip object:', zip);
      debug('App', 'Zip type:', typeof zip);
      debug('App', 'Zip methods:', zip ? Object.keys(zip) : 'no zip');

      // Helper to get full path of an entry
      const getEntryFullPath = ent => {
        // If entry already has fullName, use it
        if (ent.fullName) return ent.fullName;

        // Otherwise, traverse up the parent chain to build the path
        const pathParts = [];
        let current = ent;
        while (current) {
          if (current.name) {
            pathParts.unshift(current.name);
          }
          current = current.parent;
        }
        return pathParts.join('/');
      };

      const entryFullPath = getEntryFullPath(entry);

      // Get all entries from zip filesystem - try multiple approaches
      let allEntries = [];
      if (zip) {
        if (typeof zip.entries === 'function') {
          allEntries = Array.from(zip.entries());
          debug('App', 'Got entries from zip.entries():', allEntries.length);
        } else if (zip.root) {
          // Build a map of full paths to actual entry objects
          const buildEntryMap = (node, path = '', map = new Map()) => {
            if (node.children) {
              node.children.forEach(child => {
                const fullPath = path ? `${path}/${child.name}` : child.name;
                // Skip macOS metadata
                if (fullPath.includes('__MACOSX') || child.name.startsWith('._')) {
                  return;
                }
                if (!child.directory) {
                  map.set(fullPath, child); // Store actual entry object
                }
                buildEntryMap(child, fullPath, map);
              });
            }
            return map;
          };

          const entryMap = buildEntryMap(zip.root);
          allEntries = Array.from(entryMap.entries()).map(([fullPath, entry]) => ({
            ...entry,
            fullName: fullPath,
          }));
          debug('App', 'Got entries from root:', allEntries.length);
        }
      }
      debug(
        'App',
        'Available files in package:',
        allEntries.map(e => e.fullName || e.name)
      );

      // Filter out macOS metadata files
      allEntries = allEntries.filter(e => {
        const fullPath = e.fullName || e.name;
        return (
          !fullPath.includes('__MACOSX') && !fullPath.split('/').some(part => part.startsWith('._'))
        );
      });
      debug('App', 'Filtered files (no macOS junk):', allEntries.length);

      // Load map.json
      const mapContent = await getData(entry, true);
      let mapData = null;
      let cellsData = null;
      let tilesetName = null;

      try {
        mapData = JSON.parse(mapContent);
        tilesetName = mapData.tileset;
        debug('App', 'Map data loaded, tileset:', tilesetName);
        debug('App', 'Full map data:', mapData);
      } catch (err) {
        console.error('Failed to parse map.json:', err);
      }

      // Load cells.json and heights.json from the same directory
      let heightsData = null;
      if (allEntries.length > 0) {
        try {
          // Extract the directory from the map file path
          const mapDir = entryFullPath.substring(0, entryFullPath.lastIndexOf('/') + 1);
          const cellsFileName = 'cells.json';
          const heightsFileName = 'heights.json';

          debug('App', 'Map file path:', entryFullPath);
          debug('App', 'Searching for cells.json and heights.json in directory:', mapDir);

          // Find cells.json in the same directory as map.json
          const cellsFile = allEntries.find(e => {
            const fullPath = e.fullName || e.name;
            const exactMatch = fullPath === `${mapDir}${cellsFileName}`;
            if (exactMatch) {
              debug('App', 'Found exact match for cells.json:', fullPath);
            }
            return exactMatch;
          });

          if (cellsFile) {
            debug('App', 'Found cells.json at:', cellsFile.fullName || cellsFile.name);
            try {
              const cellsContent = await getData(cellsFile, true);
              debug(
                'App',
                'Cells content type:',
                typeof cellsContent,
                'length:',
                cellsContent?.length
              );
              debug('App', 'Cells content preview:', cellsContent?.substring(0, 100));
              if (cellsContent) {
                const parsedCells = JSON.parse(cellsContent);
                debug(
                  'App',
                  'Parsed cells data type:',
                  Array.isArray(parsedCells) ? 'array' : typeof parsedCells
                );
                debug('App', 'Cells data:', parsedCells);

                // Check if cells.json has extends
                if (parsedCells.extends && Array.isArray(parsedCells.extends)) {
                  debug('App', '[Cells] Found extends:', parsedCells.extends);

                  // Load and merge extended cells
                  let mergedCells = parsedCells.cells || [];

                  for (const extendMapName of parsedCells.extends) {
                    try {
                      debug('App', '[Cells] Loading extended map:', extendMapName);
                      const extendCellsPath = `maps/${extendMapName}/cells.json`;
                      const extendCellsFile = allEntries.find(
                        e => (e.fullName || e.name) === extendCellsPath
                      );

                      if (extendCellsFile) {
                        const extendCellsContent = await getData(extendCellsFile, true);
                        const extendCellsData = JSON.parse(extendCellsContent);

                        // Get the cells array (handle both array format and object format)
                        const extendCells = Array.isArray(extendCellsData)
                          ? extendCellsData
                          : extendCellsData.cells;

                        if (extendCells && Array.isArray(extendCells)) {
                          debug(
                            'App',
                            '[Cells] Extending with cells from',
                            extendMapName,
                            ':',
                            extendCells.length,
                            'rows'
                          );

                          // Append extended cells (note: this is append-style like you mentioned)
                          mergedCells = [...mergedCells, ...extendCells];
                        }
                      } else {
                        console.warn('[Cells] Extended map cells not found:', extendCellsPath);
                      }
                    } catch (extErr) {
                      console.error('[Cells] Failed to load extended map:', extendMapName, extErr);
                    }
                  }

                  cellsData = mergedCells;
                  debug('App', '[Cells] Final merged cells:', cellsData.length, 'rows');
                } else if (Array.isArray(parsedCells)) {
                  // Simple array format
                  cellsData = parsedCells;
                  debug('App', 'Cells data loaded:', cellsData.length, 'x', cellsData[0]?.length);
                } else if (parsedCells.cells && Array.isArray(parsedCells.cells)) {
                  // Object format with cells property
                  cellsData = parsedCells.cells;
                  debug(
                    'App',
                    'Cells data loaded from .cells property:',
                    cellsData.length,
                    'x',
                    cellsData[0]?.length
                  );
                } else {
                  console.error('ERROR: cells.json format not recognized!', parsedCells);
                  cellsData = null;
                }
              } else {
                console.error('cells.json getData returned null');
              }
            } catch (parseErr) {
              console.error('Failed to parse cells.json:', parseErr);
            }
          } else {
            console.warn('cells.json not found in directory:', mapDir);
            console.warn(
              'Available files:',
              allEntries.map(e => e.fullName || e.name)
            );
          }

          // Find heights.json in the same directory as map.json
          const heightsFile = allEntries.find(e => {
            const fullPath = e.fullName || e.name;
            const exactMatch = fullPath === `${mapDir}${heightsFileName}`;
            return exactMatch;
          });

          if (heightsFile) {
            debug('App', 'Found heights.json at:', heightsFile.fullName || heightsFile.name);
            try {
              const heightsContent = await getData(heightsFile, true);
              debug(
                'App',
                'Heights content type:',
                typeof heightsContent,
                'length:',
                heightsContent?.length
              );
              if (heightsContent) {
                heightsData = JSON.parse(heightsContent);
                debug(
                  'App',
                  'Heights data loaded:',
                  heightsData.length,
                  'x',
                  heightsData[0]?.length
                );
              } else {
                console.warn('heights.json getData returned null');
              }
            } catch (parseErr) {
              console.error('Failed to parse heights.json:', parseErr);
            }
          } else {
            debug(
              'App',
              'heights.json not found in directory:',
              mapDir,
              '(this is OK for maps without custom heights)'
            );
          }
        } catch (err) {
          console.error('Failed to load cells.json/heights.json:', err);
        }
      }

      // Combine map, cells, and heights data
      const combinedContent = {
        ...mapData,
        cells: cellsData || mapData?.cells || [],
        heights: heightsData || mapData?.heights || null,
      };

      debug(
        'App',
        'Combined content - cells:',
        Array.isArray(combinedContent.cells)
          ? `${combinedContent.cells.length} rows`
          : typeof combinedContent.cells,
        'heights:',
        combinedContent.heights ? 'present' : 'none'
      );
      debug(
        'App',
        'Final cells dimensions:',
        combinedContent.cells?.length,
        'x',
        combinedContent.cells?.[0]?.length
      );

      // Load tileset and its dependencies
      let tileset = null;
      let geometry = null;
      let tiles = null;
      let textureAtlas = null;

      if (tilesetName && allEntries.length > 0) {
        try {
          debug('App', 'Loading tileset:', tilesetName);
          debug(
            'App',
            'Available tileset files:',
            allEntries
              .filter(e => (e.fullName || e.name).includes('tileset'))
              .map(e => e.fullName || e.name)
          );

          // Use extends-aware tileset loader
          try {
            const resolvedTileset = await loadTilesetWithExtends(zip, tilesetName, getData);
            debug('App', 'Tileset loaded with extends support:', resolvedTileset);
            tileset = resolvedTileset;
            geometry = resolvedTileset.geometry || {};
            tiles = resolvedTileset.tiles || {};
            debug(
              'App',
              'Tileset loaded - geometry:',
              Object.keys(geometry).length,
              'tiles:',
              Object.keys(tiles).length
            );

            // Load texture atlas
            if (resolvedTileset.src) {
              debug('App', 'Loading texture:', resolvedTileset.src);
              const textureName = resolvedTileset.src;

              // Search for texture file - check multiple locations
              let textureFile = allEntries.find(e => {
                const fullPath = e.fullName || e.name;
                // Try exact match first
                return fullPath.endsWith(textureName);
              });

              // If not found, try broader search
              if (!textureFile) {
                const baseName = textureName.split('/').pop(); // Get just the filename
                textureFile = allEntries.find(e => {
                  const fullPath = e.fullName || e.name;
                  return fullPath.endsWith(baseName) && fullPath.match(/\.(png|jpg|jpeg|gif)$/i);
                });
              }

              if (textureFile) {
                debug('App', 'Found texture at:', textureFile.fullName || textureFile.name);
                const textureBytes = await getData(textureFile, false);
                if (textureBytes) {
                  const ext = resolvedTileset.src.split('.').pop().toLowerCase();
                  const mime = `image/${ext === 'jpg' ? 'jpeg' : ext}`;
                  textureAtlas = toDataUri(textureBytes, mime);
                  debug(
                    'App',
                    'Texture atlas loaded, size:',
                    textureBytes.length,
                    'bytes',
                    'mime:',
                    mime
                  );
                } else {
                  console.error(
                    'Failed to get texture bytes for:',
                    textureFile.fullName || textureFile.name
                  );
                }
              } else {
                console.warn('Texture not found:', textureName);
                console.warn('Searched for basename:', textureName.split('/').pop());
                console.warn(
                  'Available texture files:',
                  allEntries
                    .filter(e => {
                      const fullPath = e.fullName || e.name;
                      return fullPath.match(/\.(png|jpg|jpeg|gif)$/i);
                    })
                    .map(e => e.fullName || e.name)
                );
              }
            }
          } catch (extendsErr) {
            console.error('Failed to load tileset with extends:', extendsErr);
            console.error('Error details:', extendsErr.message);

            // Fallback: try loading without extends support
            // Search more broadly for the tileset file
            let tilesetFile = allEntries.find(e => {
              const fullPath = e.fullName || e.name;
              return (
                fullPath.includes(`tilesets/${tilesetName}`) && fullPath.endsWith('tileset.json')
              );
            });

            // Try fuzzy match if exact not found
            if (!tilesetFile) {
              tilesetFile = allEntries.find(e => {
                const fullPath = e.fullName || e.name;
                return fullPath.includes(tilesetName) && fullPath.endsWith('tileset.json');
              });
            }

            if (tilesetFile) {
              debug('App', 'Found tileset (fallback):', tilesetFile.fullName || tilesetFile.name);
              const tilesetContent = await getData(tilesetFile, true);
              if (tilesetContent && typeof tilesetContent === 'string') {
                const tilesetData = JSON.parse(tilesetContent);
                debug('App', 'Tileset loaded (fallback without extends)');
                tileset = tilesetData;
                geometry = tilesetData.geometry || {};
                tiles = tilesetData.tiles || {};
              }
            }
          }
        } catch (err) {
          console.error('Failed to load tileset dependencies:', err);
        }
      }

      debug('App', 'Rendering MapEditor3D with:', {
        hasTileset: !!tileset,
        hasGeometry: !!geometry,
        hasTiles: !!tiles,
        hasTexture: !!textureAtlas,
        cellsSize: combinedContent.cells?.length,
      });

      const mapTabId = getEntryFullPath(entry);
      openTab(mapTabId, entry.name, (
        <UnifiedMapEditor
          key={mapTabId}
          content={combinedContent}
          tileset={tileset}
          geometry={geometry}
          tiles={tiles}
          textureAtlas={textureAtlas}
          zip={zip}
          entryName={entry.name}
          onSave={async obj => {
            try {
              debug('App', '[MapEditor] Saving map data:', obj);
              debug('App', '[MapEditor] Entry:', entry);

              // Get full path of the entry
              const fullPath = getEntryFullPath(entry);
              debug('App', '[MapEditor] Full path:', fullPath);

              // Extract cells and heights from the saved data
              const { cells, heights, ...mapOnlyData } = obj;

              // Save map.json (metadata only, no cells/heights)
              const mapJsonData = JSON.stringify(mapOnlyData, null, 2);
              await writeFile(fullPath, mapJsonData);
              debug('App', '[MapEditor] Saved map.json:', fullPath);

              // Save cells.json
              const cellsPath = fullPath.replace('map.json', 'cells.json');
              const cellsJsonData = JSON.stringify(cells, null, 2);
              await writeFile(cellsPath, cellsJsonData);
              debug('App', '[MapEditor] Saved cells.json:', cellsPath);

              // Save heights.json if it exists
              debug(
                'App',
                '[MapEditor] Heights data:',
                heights ? `${heights.length} rows` : 'null',
                heights
              );
              if (heights && heights.length > 0) {
                const heightsPath = fullPath.replace('map.json', 'heights.json');
                const heightsJsonData = JSON.stringify(heights, null, 2);
                await writeFile(heightsPath, heightsJsonData);
                debug(
                  'App',
                  '[MapEditor] Saved heights.json:',
                  heightsPath,
                  'with',
                  heights.length,
                  'rows'
                );
              } else {
                console.warn('[MapEditor] No heights data to save');
              }

              debug('App', '[MapEditor] All map files saved successfully');
              reportSaveOk(
                fullPath,
                'Map saved successfully! Note: You may need to close and reopen the map to see the changes reflected in the editor.'
              );
            } catch (err) {
              console.error('[MapEditor] Save failed:', err);
              reportSaveError(fullPath, err);
            }
          }}
        />
      ));
    },
    [getData, zip, toDataUri, getEntryFullPath, openTab]
  );

  // (P3-10) Tile editor migrated: sibling-file discovery goes through
  // the repository (not zip.root traversal); save via command bus.
  const renderTileEditor = useCallback(
    async entry => {
      const tileContent = await getData(entry, true);
      const entryPath = getEntryFullPath(entry);
      debug('App', '[TileEditor] Loading tiles:', tileContent);

      let geometryContent = null;
      let textureList = [];
      try {
        const parentPath = entryPath.substring(0, entryPath.lastIndexOf('/'));
        const entries = await toolCore.repository.list('');
        const inSameDir = name =>
          entries.find(e => {
            const dir = e.includes('/') ? e.substring(0, e.lastIndexOf('/')) : '';
            return dir === parentPath && e.toLowerCase().endsWith('/' + name.toLowerCase());
          });
        const geoPath = inSameDir('geometry.json');
        if (geoPath) {
          geometryContent = await toolCore.repository.read(geoPath);
          debug('App', '[TileEditor] Loaded geometry context');
        }
        const tilesetPath = inSameDir('tileset.json');
        if (tilesetPath) {
          const tileset = JSON.parse(await toolCore.repository.read(tilesetPath));
          if (tileset.textures) {
            textureList = Object.keys(tileset.textures);
            debug('App', '[TileEditor] Loaded texture list:', textureList);
          }
        }
      } catch (err) {
        console.warn('[TileEditor] Could not load sibling files:', err);
      }

      openTab(entryPath, entry.name, (
        <TileEditorTool
          key={entryPath}
          documentPath={entryPath}
          core={toolCore}
          text={tileContent}
          initialProps={{ geometryContent, textureList }}
        />
      ));
    },
    [getData, getEntryFullPath, toolCore, openTab]
  );

  const renderGeometryEditor = useCallback(
    async entry => {
      const geoContent = await getData(entry, true);

      // Try to parse to determine if it has the new format (with vertices/surfaces)
      let useEnhanced = false;
      try {
        const parsed = JSON.parse(geoContent);
        const geomObj = parsed.geometry || parsed;

        // Check if any geometry has vertices (new format)
        if (typeof geomObj === 'object') {
          for (const key in geomObj) {
            if (geomObj[key].vertices && Array.isArray(geomObj[key].vertices)) {
              useEnhanced = true;
              break;
            }
          }
        }
      } catch (err) {
        console.warn('Failed to parse geometry', err);
      }

      const EditorComponent = useEnhanced ? GeometryEditor3D : GeometryEditor;
      const geoTabId = getEntryFullPath(entry);

      openTab(geoTabId, entry.name, (
        <EditorComponent
          key={geoTabId}
          content={geoContent}
          onSave={async obj => {
            try {
              const fullPath = getEntryFullPath(entry);
              const data = JSON.stringify(obj, null, 2);
              await writeFile(fullPath, data);
              debug('App', '[GeometryEditor] Saved:', fullPath);
              reportSaveOk(fullPath, 'Geometry saved successfully!');
            } catch (err) {
              reportSaveError(fullPath, err);
            }
          }}
        />
      ));
    },
    [getData, zip, getEntryFullPath, openTab]
  );

  // (P3-10) Sprite editor migrated: repository-backed asset resolution,
  // command-bus save (undoable), shell commands.  No direct ZIP path.
  const renderSpriteEditor = useCallback(
    async entry => {
      const spriteContent = await getData(entry, true);
      const fullPath = getEntryFullPath(entry);
      openTab(fullPath, entry.name, (
        <SpriteEditorTool
          key={fullPath}
          documentPath={fullPath}
          core={toolCore}
          text={spriteContent}
        />
      ));
    },
    [getData, getEntryFullPath, toolCore, openTab]
  );

  const renderCutsceneTool = useCallback(
    async entry => {
      const cutsceneContent = await getData(entry, true);
      const fileExtension = entry.name.match(/\\.\\w+$/)?.[0] || '.pxc';

      // Asset loader function that loads from ZIP with proper MIME types
      const assetLoader = async path => {
        try {
          debug('App', '[assetLoader] Loading asset:', path);
          // Clean the path
          let cleanPath = path.replace(/^data:/, '').replace(/^assets\//, '');
          debug('App', '[assetLoader] Clean path:', cleanPath);

          // Helper to find asset by name in ZIP recursively
          const findAsset = (node, targetName) => {
            if (node.children) {
              for (const child of node.children) {
                if (
                  !child.directory &&
                  (child.name === targetName || child.name.includes(targetName))
                ) {
                  return child;
                }
                if (child.directory) {
                  const found = findAsset(child, targetName);
                  if (found) return found;
                }
              }
            }
            return null;
          };

          // First try direct match
          let assetEntry = findAsset(zip, cleanPath);

          // If not found, try common prefix and extension fixes for sprites and audio
          if (!assetEntry) {
            // For sprite assets like "characters/male"
            if (
              cleanPath.startsWith('characters/') ||
              cleanPath.startsWith('npc/') ||
              cleanPath.startsWith('sprites/')
            ) {
              // Try image formats FIRST (cutscene needs pixels, not JSON)
              // Then fall back to JSON definition
              const trialPaths = [
                cleanPath.startsWith('sprites/')
                  ? cleanPath + '.png'
                  : 'sprites/' + cleanPath + '.png',
                cleanPath.startsWith('sprites/')
                  ? cleanPath + '.gif'
                  : 'sprites/' + cleanPath + '.gif',
                cleanPath.startsWith('sprites/') ? cleanPath : 'sprites/' + cleanPath,
                cleanPath + '.png',
                cleanPath + '.gif',
                cleanPath.startsWith('sprites/')
                  ? cleanPath + '.json'
                  : 'sprites/' + cleanPath + '.json',
                cleanPath + '.json',
              ];
              for (const trial of trialPaths) {
                assetEntry = findAsset(zip, trial);
                if (assetEntry) {
                  debug('App', '[assetLoader] Found sprite at:', trial);
                  break;
                }
              }
            }

            // For texture/backdrop files
            if (!assetEntry && cleanPath.startsWith('textures/')) {
              const trialTexturePaths = [
                cleanPath,
                cleanPath + '.png',
                cleanPath + '.gif',
                cleanPath + '.jpg',
                cleanPath + '.jpeg',
              ];
              for (const trial of trialTexturePaths) {
                assetEntry = findAsset(zip, trial);
                if (assetEntry) break;
              }
            }

            // For audio files, try prefixing with "audio/"
            if (!assetEntry && cleanPath.match(/\.mp3$|\.wav$|\.ogg$/)) {
              const trialAudioPath = 'audio/' + cleanPath.replace(/^audio\//, '');
              assetEntry = findAsset(zip, trialAudioPath);
            }

            // For direct portrait references (like fire_portrait, water_portrait)
            if (!assetEntry && cleanPath.match(/_portrait$/)) {
              const trialPortraitPaths = [
                'textures/' + cleanPath + '.gif',
                'textures/' + cleanPath + '.png',
                cleanPath + '.gif',
                cleanPath + '.png',
              ];
              for (const trial of trialPortraitPaths) {
                assetEntry = findAsset(zip, trial);
                if (assetEntry) break;
              }
            }

            // Last resort: try without any prefix if it has an extension
            if (!assetEntry && cleanPath.match(/\.\w+$/)) {
              assetEntry = findAsset(zip, cleanPath.split('/').pop());
            }
          }

          if (!assetEntry) {
            // Only warn if it's not an intermediate search path
            // (e.g., don't warn for .json when looking for .gif)
            if (!path.match(/\.(json|gif|png)$/)) {
              console.warn(`Asset not found in ZIP: ${path}`);
            }
            return null;
          }

          // Get the data and convert to data URI
          const data = await getData(assetEntry, false);
          const ext = assetEntry.name.split('.').pop().toLowerCase();
          const mimeMap = {
            png: 'image/png',
            jpg: 'image/jpeg',
            jpeg: 'image/jpeg',
            gif: 'image/gif',
            webp: 'image/webp',
            svg: 'image/svg+xml',
            mp3: 'audio/mpeg',
            wav: 'audio/wav',
            ogg: 'audio/ogg',
            json: 'application/json',
          };
          const mimeType = mimeMap[ext] || 'application/octet-stream';
          debug('App', '[assetLoader] Returning data URI with MIME type:', mimeType);
          return toDataUri(data, mimeType);
        } catch (err) {
          console.error(`Failed to load asset ${path}:`, err);
          return null;
        }
      };

      const cutsceneTabId = getEntryFullPath(entry);
      openTab(cutsceneTabId, entry.name, (
        <CutsceneTool
          key={cutsceneTabId}
          content={cutsceneContent}
          fileExtension={fileExtension}
          assetLoader={assetLoader}
          onSave={async data => {
            try {
              const fullPath = getEntryFullPath(entry);
              // Save as-is if it's a string (DSL), or stringify if it's an object (JSON)
              const saveData =
                typeof data === 'string' ? data : JSON.stringify({ events: data }, null, 2);
              await writeFile(fullPath, saveData);
              debug('App', '[CutsceneTool] Saved:', fullPath);
              reportSaveOk(fullPath, 'Cutscene saved successfully!');
            } catch (err) {
              reportSaveError(fullPath, err);
            }
          }}
          assets={assets}
        />
      ));
    },
    [getData, zip, assets, toDataUri, getEntryFullPath, openTab]
  );

  /**
   * Render the AI Generator panel for creating game assets with AI.
   */
  const renderAIGenerator = useCallback(() => {
    openTab('ai-generator', 'AI Generator', (
      <AIGenerator
        key="ai-generator"
        writeFile={writeFile}
        refreshFolder={() => buildAssetList(zip)}
        onFileGenerated={asset => {
          // Rebuild asset list when new file is generated
          buildAssetList(zip);
        }}
      />
    ), 'tool');
  }, [writeFile, zip, buildAssetList, openTab]);

  // Open file and route to correct editor/viewer
  const openFile = useCallback(
    async entry => {
      if (!entry) return;

      // (UX Phase 1) If this document already has a tab, focus it instead of
      // reloading — this is what preserves tool state across switches.
      if (!entry.directory) {
        const existingId = getEntryFullPath(entry);
        if (tabsRef.current.some(t => t.id === existingId)) {
          setActiveTabId(existingId);
          return;
        }
      }

      // If it's a directory, check if it's a map directory and auto-load map.json
      if (entry.directory) {
        debug('App', '[App] Directory selected:', entry.name);

        // Check if this looks like a map directory (maps/* pattern)
        const isMapDir = entry.name.includes('/maps/') || entry.name.endsWith('/maps');

        if (isMapDir && zip) {
          try {
            // Try to find map.json in this directory
            const allEntries = await zip.entries();
            const mapJsonPath = entry.name.endsWith('/')
              ? `${entry.name}map.json`
              : `${entry.name}/map.json`;

            const mapJsonEntry = allEntries.find(e => {
              const fullPath = e.fullName || e.name;
              return fullPath === mapJsonPath;
            });

            if (mapJsonEntry) {
              debug('App', '[App] Auto-loading map.json from directory:', mapJsonPath);
              renderMapEditor(mapJsonEntry);
              return;
            } else {
              debug('App', '[App] No map.json found in directory:', entry.name);
              toast.warning('No map.json found in this directory', { title: 'Nothing to open' });
              return;
            }
          } catch (err) {
            console.error('[App] Failed to auto-load map from directory:', err);
          }
        }

        // Not a map directory or failed to load - transient feedback only
        toast.info('Directory selected. Choose a file to open it.');
        return;
      }

      const name = entry.name.toLowerCase();
      setSelectedEntry(entry);
      if (name.endsWith('.pxs')) {
        renderScriptEditor(entry, 'lua');
        return;
      }
      if (name.endsWith('.pxc')) {
        renderCutsceneTool(entry);
        return;
      }
      if (name.endsWith('.txt')) {
        renderScriptEditor(entry, 'plaintext');
        return;
      }
      if (name.endsWith('.json')) {
        // Content-aware routing: read the JSON and sniff its structure to
        // determine the asset type. Falls back to filename heuristics if
        // the content can't be read or doesn't match a known shape.
        const routeByContent = (obj) => {
          if (!obj || typeof obj !== 'object') return null;
          // Map: bounds + tileset + sprites array
          if (Array.isArray(obj.bounds) && typeof obj.tileset === 'string') {
            return 'map';
          }
          // Tileset: tileSize + sheetSize + textures map
          if (typeof obj.tileSize === 'number' && obj.sheetSize && typeof obj.textures === 'object') {
            return 'tileset';
          }
          // Sprite: frames object (direction -> coordinates)
          if (obj.frames && typeof obj.frames === 'object') {
            return 'sprite';
          }
          // Cutscene: nodes/timeline/tracks
          if (obj.nodes || obj.timeline || obj.tracks) {
            return 'cutscene';
          }
          // Geometry: named shapes with vertex arrays
          const keys = Object.keys(obj);
          if (keys.length > 0 && keys.every(k => {
            const v = obj[k];
            return v && typeof v === 'object' && Array.isArray(v.vertices);
          })) {
            return 'geometry';
          }
          return null;
        };
        try {
          const text = entry.async ? await entry.async('string') : null;
          if (text) {
            const obj = JSON.parse(text);
            const kind = routeByContent(obj);
            if (kind === 'map') { renderMapEditor(entry); return; }
            if (kind === 'tileset') { renderTileEditor(entry); return; }
            if (kind === 'sprite') { renderSpriteEditor(entry); return; }
            if (kind === 'cutscene') { renderCutsceneTool(entry); return; }
            if (kind === 'geometry') { renderGeometryEditor(entry); return; }
          }
        } catch {
          // Fall through to filename heuristics
        }
        if (name.includes('map')) {
          renderMapEditor(entry);
          return;
        }
        if (name.includes('geometry')) {
          renderGeometryEditor(entry);
          return;
        }
        if (name.includes('tiles')) {
          renderTileEditor(entry);
          return;
        }
        if (name.includes('cutscene')) {
          renderCutsceneTool(entry);
          return;
        }
        if (name.includes('sprite')) {
          renderSpriteEditor(entry);
          return;
        }
        renderScriptEditor(entry, 'json');
        return;
      }
      if (['.png', '.gif', '.jpg', '.jpeg', '.bmp'].some(ext => name.endsWith(ext))) {
        renderImagePreview(entry);
        return;
      }
      if (['.mp3', '.wav', '.ogg'].some(ext => name.endsWith(ext))) {
        renderAudioPreview(entry);
        return;
      }
      if (['.obj', '.mtl', '.gltf', '.glb'].some(ext => name.endsWith(ext))) {
        renderModelPreview(entry);
        return;
      }
      // Unknown file types fallback - transient feedback, no tab
      toast.warning(`No registered viewer for ${name}`, { title: 'Cannot open' });
    },
    [
      renderScriptEditor,
      renderMapEditor,
      renderGeometryEditor,
      renderTileEditor,
      renderCutsceneTool,
      renderImagePreview,
      renderAudioPreview,
      renderModelPreview,
      getEntryFullPath,
      toast,
      zip,
    ]
  );

  const hasContent = tabs.length > 0;
  const activeTab = tabs.find(t => t.id === activeTabId) || null;
  const errorCount = validationReport?.errors?.length ?? 0;
  const warningCount = validationReport?.warnings?.length ?? 0;
  const activeTabLabel = activeTab?.label || 'Choose an asset from the sidebar';
  const shellClassName = [
    hasContent ? 'editor-shell has-active-content' : 'editor-shell',
    hideTitleBar ? 'editor-shell--compact' : '',
  ]
    .filter(Boolean)
    .join(' ');
  const supportPanelVisible = supportPreference || supportPanelPinned;
  const supportFabClassName = [
    'support-fab',
    supportPreference ? 'is-link' : supportPanelPinned ? 'is-active' : '',
    supportMenuOpen ? 'is-open' : '',
  ]
    .filter(Boolean)
    .join(' ');
  const supportFabTitle = supportMenuOpen ? 'Close support menu' : 'Open support menu';

  return (
    <div className={shellClassName}>
      {!hideTitleBar && (
        <section className="editor-hero">
          <h1>Pixospritz Creator Studio</h1>
          <p>
            Manage packages, preview assets, and edit scripts inside an interface inspired by
            pixospritz.com.
          </p>
        </section>
      )}
      <div className="editor-stage">
        <ResizableSidebar
          openFile={openFile}
          onZipLoaded={setZip}
          onValidatePackage={validatePackage}
          validationReport={validationReport}
          onOptionsChange={handleOptionsChange}
        />
        <section
          className="editor-main"
          style={{ display: 'flex', flexDirection: 'column', flex: 1, minWidth: 0 }}
        >
          {!hideTitleBar && (
            <header className="editor-main-header">
              <div className="editor-main-title">
                <span>Active file</span>
                <strong>{activeTabLabel}</strong>
              </div>
              <div className="editor-main-actions">
                {/* (UX Phase 2) Shell undo/redo — wired to the CommandBus (finding A3.2). */}
                <Button
                  appearance="subtle"
                  size="sm"
                  disabled={!canUndo}
                  onClick={() => commands.execute('shell.undo')}
                  title="Undo (Ctrl+Z)"
                  aria-label="Undo"
                >
                  ↩ Undo
                </Button>
                <Button
                  appearance="subtle"
                  size="sm"
                  disabled={!canRedo}
                  onClick={() => commands.execute('shell.redo')}
                  title="Redo (Ctrl+Shift+Z)"
                  aria-label="Redo"
                  style={{ marginLeft: '4px' }}
                >
                  ↪ Redo
                </Button>
                <Button
                  appearance="subtle"
                  size="sm"
                  active={activeTabId === 'ai-generator'}
                  onClick={renderAIGenerator}
                  title={
                    zip
                      ? 'Open AI Asset Generator'
                      : 'Open AI Asset Generator (load a package to save files)'
                  }
                >
                  AI Generate
                </Button>
                <Button
                  appearance="subtle"
                  size="sm"
                  active={showConsole}
                  onClick={() => setShowConsole(!showConsole)}
                  title="Toggle Console Panel"
                  style={{ marginLeft: '8px' }}
                >
                  Console
                </Button>
                {validationReport && (
                  <div className="editor-pill">
                    <span>{errorCount} errors</span>
                    <span>{warningCount} warnings</span>
                  </div>
                )}
              </div>
            </header>
          )}
          {hasContent && (
            <div className="editor-tabbar" role="tablist" aria-label="Open documents">
              {tabs.map(tab => {
                const isActive = tab.id === activeTabId;
                const isDirty = dirtyPaths.includes(tab.id);
                return (
                  <div
                    key={tab.id}
                    role="tab"
                    aria-selected={isActive}
                    tabIndex={0}
                    title={tab.id}
                    className={`editor-tab${isActive ? ' is-active' : ''}${isDirty ? ' is-dirty' : ''}`}
                    onClick={() => setActiveTabId(tab.id)}
                    onAuxClick={e => {
                      if (e.button === 1) closeTab(tab.id);
                    }}
                    onKeyDown={e => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        setActiveTabId(tab.id);
                      } else if (e.key === 'Delete' || e.key === 'Backspace') {
                        e.preventDefault();
                        closeTab(tab.id);
                      }
                    }}
                  >
                    <span className="editor-tab__label">{tab.label}</span>
                    {isDirty && (
                      <span className="editor-tab__dirty" title="Unsaved changes" aria-label="Unsaved changes" />
                    )}
                    <button
                      type="button"
                      className="editor-tab__close"
                      aria-label={`Close ${tab.label}`}
                      onClick={e => {
                        e.stopPropagation();
                        closeTab(tab.id);
                      }}
                    >
                      ×
                    </button>
                  </div>
                );
              })}
            </div>
          )}
          <div
            className="editor-main-content"
            style={{ flex: 1, minHeight: 0, overflow: 'hidden', position: 'relative' }}
          >
            {hasContent ? (
              <Suspense fallback={<div className="editor-tool-loading">Loading tool…</div>}>
                {tabs.map(tab => (
                  <div
                    key={tab.id}
                    className="editor-tabpanel"
                    hidden={tab.id !== activeTabId}
                  >
                    <ErrorBoundary
                      toolName={tab.label}
                      onReset={() => closeTab(tab.id)}
                    >
                      {tab.element}
                    </ErrorBoundary>
                  </div>
                ))}
              </Suspense>
            ) : (
              <div className="editor-empty-state">
                <h3>Welcome to Pixospritz IDE</h3>
                <p>Load a project or drop a .zip file into the sidebar to begin.</p>
              </div>
            )}
          </div>
          {showConsole && (
            <div
              className="editor-console-pane"
              style={{
                height: consoleHeight,
                borderTop: '1px solid #333',
                background: '#111',
                flexShrink: 0,
                display: 'flex',
                flexDirection: 'column',
              }}
            >
              <ConsolePanel
                messages={consoleState.messages}
                onCommand={consoleState.command}
                onClear={consoleState.clear}
                isRunning={consoleState.isRunning}
                onStop={consoleState.stopExecution}
              />
            </div>
          )}
        </section>
      </div>
      {supportPanelVisible && (
        <section className="editor-support-panel">
          <div className="support-copy">
            <p className="eyebrow">Support Pixospritz</p>
            <h3>Keep the retro tools alive ♥</h3>
            <p>
              These utilities stay free thanks to community backing. Every badge, bug report, and
              donation helps us ship new toys faster.
            </p>
          </div>
          <div className="support-links">
            {SUPPORT_LINKS.map(link => (
              <a
                key={link.href}
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
                className="support-link"
              >
                <span className="support-icon" aria-hidden="true">
                  {link.icon}
                </span>
                <span>{link.label}</span>
              </a>
            ))}
          </div>
          <ul className="support-other">
            {COMMUNITY_ACTIONS.map(action => (
              <li key={action}>{action}</li>
            ))}
          </ul>
          {!supportPreference && (
            <button
              type="button"
              className="support-panel__dismiss"
              onClick={() => setSupportPanelPinned(false)}
              aria-label="Hide support panel"
            >
              ×
            </button>
          )}
        </section>
      )}
      <div ref={supportFabRef} className={`support-fab-shell ${supportMenuOpen ? 'is-open' : ''}`}>
        <div className="support-menu" role="menu" aria-hidden={!supportMenuOpen}>
          <p className="support-menu__eyebrow">Pick a portal</p>
          <div className="support-menu__links">
            {SUPPORT_LINKS.map(link => (
              <a
                key={link.href}
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
                className="support-menu__link"
                onClick={handleSupportLinkClick}
              >
                <span className="support-icon" aria-hidden="true">
                  {link.icon}
                </span>
                <span>{link.label}</span>
              </a>
            ))}
          </div>
          {!supportPreference && (
            <button
              type="button"
              className="support-menu__panel-toggle"
              onClick={handleSupportPanelToggle}
            >
              {supportPanelPinned ? 'Hide support panel' : 'Show support panel'}
            </button>
          )}
        </div>
        <button
          type="button"
          className={supportFabClassName}
          aria-haspopup="true"
          aria-expanded={supportMenuOpen}
          aria-pressed={!supportPreference && supportPanelPinned}
          onClick={handleSupportFabClick}
          title={supportFabTitle}
        >
          <span className="support-fab__icon" aria-hidden="true">
            ♥
          </span>
          <span>Support Pixospritz</span>
        </button>
      </div>
      {showWizard && <FirstTimeWizard onClose={handleWizardClose} />}
      {/* (P2-09) Command palette */}
      <CommandPalette open={paletteOpen} onClose={() => setPaletteOpen(false)} />
      <ShortcutHelp open={shortcutsOpen} onClose={() => setShortcutsOpen(false)} />
      {/* (UX Phase 2) Dirty-tab close confirmation (forgiveness). */}
      <Modal open={!!pendingCloseTab} onClose={() => setPendingCloseTab(null)} size="sm">
        <Modal.Header onClose={() => setPendingCloseTab(null)}>
          <Modal.Title>Unsaved changes</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p style={{ margin: 0, fontSize: '13px', color: 'var(--color-text-secondary)', lineHeight: 1.5 }}>
            “{tabs.find(t => t.id === pendingCloseTab)?.label || pendingCloseTab}” has
            unsaved changes. Closing now will lose them.
          </p>
        </Modal.Body>
        <Modal.Footer>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
            <Button appearance="ghost" onClick={() => setPendingCloseTab(null)}>
              Keep editing
            </Button>
            <Button appearance="primary" color="red" onClick={() => doCloseTab(pendingCloseTab)}>
              Close without saving
            </Button>
          </div>
        </Modal.Footer>
      </Modal>
      {/* (Publishing vertical) Publish to SVRN dialog */}
      <PublishToSvrnDialog
        open={svrnPublishOpen}
        busy={svrnPublishBusy}
        onClose={() => setSvrnPublishOpen(false)}
        onPublish={handlePublishToSvrn}
      />
      {projectSettingsOpen && (
        <ProjectSettings
          manifest={{}}
          onSave={() => setProjectSettingsOpen(false)}
          onClose={() => setProjectSettingsOpen(false)}
        />
      )}
      {modeEditorOpen && (
        <ModeEditor
          mode={null}
          onSave={() => setModeEditorOpen(false)}
          onClose={() => setModeEditorOpen(false)}
        />
      )}
      {updateTrackerOpen && (
        <UpdateTracker
          entries={[]}
          onAdd={() => {}}
          onClose={() => setUpdateTrackerOpen(false)}
        />
      )}
      {shaderEditorOpen && (
        <ShaderEditor
          onSave={() => setShaderEditorOpen(false)}
          onClose={() => setShaderEditorOpen(false)}
        />
      )}
      {portalEditorOpen && (
        <PortalEditor
          portals={[]}
          availableMaps={[]}
          portalsByMap={{}}
          onAdd={() => {}}
          onUpdate={() => {}}
          onDelete={() => {}}
          onClose={() => setPortalEditorOpen(false)}
        />
      )}
      {behaviorEditorOpen && (
        <BehaviorEditor
          object={{ id: 'selected' }}
          onSave={() => setBehaviorEditorOpen(false)}
          onClose={() => setBehaviorEditorOpen(false)}
        />
      )}
      {lightEditorOpen && (
        <LightEditor
          lights={[]}
          onAdd={() => {}}
          onUpdate={() => {}}
          onDelete={() => {}}
          onClose={() => setLightEditorOpen(false)}
        />
      )}
      {sceneTestOpen && (
        <SceneTest
          mapId="village-hub"
          onClose={() => setSceneTestOpen(false)}
        />
      )}
      {/* (P2-07) Save status replaces alert() dialogs in save paths */}
      {saveStatus.kind !== 'idle' && (
        <div
          className={`editor-save-status editor-save-status--${saveStatus.kind}`}
          role="status"
          aria-live="polite"
        >
          {saveStatus.message}
        </div>
      )}
    </div>
  );
};

// Resizable and Collapsible Sidebar Component
function ResizableSidebar({
  openFile,
  onZipLoaded,
  onValidatePackage,
  validationReport,
  onOptionsChange,
}) {
  const [width, setWidth] = useState(420);
  const [collapsed, setCollapsed] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const minWidth = 200;
  const maxWidth = 600;
  const collapsedWidth = 40;

  const sidebarClasses = [
    'editor-sidebar-panel',
    'editor-scrollbar',
    collapsed ? 'is-collapsed' : '',
  ]
    .filter(Boolean)
    .join(' ');

  const handleMouseDown = e => {
    e.preventDefault();
    setIsDragging(true);
  };

  useEffect(() => {
    if (!isDragging) return;

    const handleMouseMove = e => {
      const newWidth = Math.min(Math.max(e.clientX, minWidth), maxWidth);
      setWidth(newWidth);
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging]);

  return (
    <aside
      className={sidebarClasses}
      style={{
        width: collapsed ? collapsedWidth : width,
        minWidth: collapsed ? collapsedWidth : minWidth,
        maxWidth: collapsed ? collapsedWidth : maxWidth,
        transition: collapsed ? 'width 0.3s ease' : 'none',
        height: '100%',
        minHeight: 0,
      }}
    >
      <button
        className="editor-sidebar-toggle"
        onClick={() => setCollapsed(prev => !prev)}
        title={collapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
      >
        {collapsed ? '›' : '‹'}
      </button>

      <div className={collapsed ? 'editor-sidebar-body is-hidden' : 'editor-sidebar-body'}>
        <ZipManager
          openFile={openFile}
          onZipLoaded={onZipLoaded}
          onValidatePackage={onValidatePackage}
          validationReport={validationReport}
          onOptionsChange={onOptionsChange}
        />
      </div>

      {!collapsed && (
        <div
          className={`editor-sidebar-resizer ${isDragging ? 'is-dragging' : ''}`}
          onMouseDown={handleMouseDown}
        />
      )}
    </aside>
  );
}

export default App;
