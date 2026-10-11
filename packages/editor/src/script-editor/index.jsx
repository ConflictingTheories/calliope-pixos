/*
 * ---------------------------------------------------------------
 *                 Pixospritz – Editor – Script Editor
 * ---------------------------------------------------------------
 * Copyright (c) 2022‑2025  Kyle Derby MacInnis
 *
 * This component provides a text editor for viewing and editing
 * scripts and text files contained within a Pixospritz package.
 * It leverages the Monaco Editor via the @monaco-editor/react
 * wrapper.  The editor supports multiple languages (Lua, JSON,
 * plain text, etc.) and exposes a save button to write changes
 * back to the underlying entry.
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { collect } from 'react-recollect';
import Editor, { loader } from '@monaco-editor/react';
import { Button } from '../ui';

// Import Monaco with pre-configured web workers
import { monaco } from '../monaco-setup.js';
import { registerPixoScriptLanguage } from '../shared/pixoscript-language.js';
import { registerSpritzCutLanguage } from '../shared/spritzcut-language.js';
import { registerPXSLLanguage } from '../shared/pxsl-language.js';
// (UX Phase 2) Live pixoscript diagnostics (finding A5.1) — errors
// surface in the editor, not only at play time.
import { lintPixoScript, toMonacoMarkers } from './pixoscript-lint.js';
import { Badge } from '../ui';

// Configure Monaco to use local bundle instead of CDN
loader.config({ monaco });

// Register custom languages
registerPixoScriptLanguage(monaco);
registerSpritzCutLanguage(monaco);
registerPXSLLanguage(monaco);

/**
 * ScriptEditor component allows editing and viewing of script and text files
 * with syntax highlighting and language support via Monaco Editor.
 *
 * @param {object} props
 * @param {string} props.content - Initial content to display in editor
 * @param {string} props.lang - Programming language identifier for syntax highlighting
 * @param {string} props.type - Layout type; 'script-only' uses full width, otherwise split panes
 * @param {function(string):void} [props.onSave] - Optional callback to save edited content
 * @param {string} [props.tabId] - Tab identity; the editor only answers 'px:shell-save'
 *   when event.detail.tabId matches it (supplied by ScriptEditorTool)
 * @returns {JSX.Element}
 */
function ScriptEditor({ content: initialContent, lang: initialLang, type: initialType, onSave, tabId }) {
  // Empty string = clean empty document. The placeholder text is display-only
  // (rendered as an overlay below), never editor state, so saving an untouched
  // empty file writes '' instead of the placeholder string.
  const [content, setContent] = useState(initialContent || '');
  const [lang, setLang] = useState(initialLang || 'lua');
  const [type] = useState(initialType || 'script-only');
  const [hasChanges, setHasChanges] = useState(false);
  const editorRef = useRef(null);
  const monacoRef = useRef(null);
  // (UX Phase 2) Live diagnostics: { errors, warnings } for the pill.
  const [diagCounts, setDiagCounts] = useState({ errors: 0, warnings: 0 });
  const lintTimer = useRef(null);

  // Map file extensions to appropriate languages
  const getLanguage = useCallback(langOrExt => {
    if (!langOrExt) return 'lua';
    const ext = langOrExt.toLowerCase();
    if (ext === 'pxs' || ext === 'pixoscript') return 'pixoscript';
    if (ext === 'pxc' || ext === 'spritzcut') return 'spritzcut';
    if (ext === 'pxsl') return 'pxsl'; // PixoSpritz Shader Language
    if (ext === 'glsl' || ext === 'vert' || ext === 'frag') return 'glsl';
    if (ext === 'lua') return 'pixoscript'; // Use enhanced PixoScript for .lua files
    return langOrExt;
  }, []);

  // (UX Phase 2) Live pixoscript diagnostics (finding A5.1).
  /** Run the linter and push markers into Monaco. */
  const runLint = useCallback(
    (value, editor, monacoInstance) => {
      if (!editor || !monacoInstance) return;
      const language = getLanguage(lang);
      if (language !== 'pixoscript' && language !== 'lua') {
        monacoInstance.editor.setModelMarkers(editor.getModel(), 'pixolint', []);
        setDiagCounts({ errors: 0, warnings: 0 });
        return;
      }
      const diags = lintPixoScript(value || '');
      monacoInstance.editor.setModelMarkers(
        editor.getModel(),
        'pixolint',
        toMonacoMarkers(diags, monacoInstance)
      );
      setDiagCounts({
        errors: diags.filter(d => d.severity === 'error').length,
        warnings: diags.filter(d => d.severity === 'warning').length,
      });
    },
    [lang, getLanguage]
  );

  const scheduleLint = useCallback(
    value => {
      if (lintTimer.current) clearTimeout(lintTimer.current);
      lintTimer.current = setTimeout(() => {
        runLint(value, editorRef.current, monacoRef.current);
      }, 400);
    },
    [runLint]
  );

  useEffect(() => () => {
    if (lintTimer.current) clearTimeout(lintTimer.current);
  }, []);

  // Update content when props change
  useEffect(() => {
    if (initialContent !== undefined) {
      setContent(initialContent);
      setHasChanges(false);
    }
  }, [initialContent]);

  // Update lang when props change
  useEffect(() => {
    if (initialLang !== undefined) {
      setLang(getLanguage(initialLang));
    }
  }, [initialLang, getLanguage]);

  /**
   * Handle content changes in the editor
   */
  const handleEditorChange = useCallback(
    value => {
      setContent(value || '');
      setHasChanges(true);
      scheduleLint(value || '');
    },
    [scheduleLint]
  );

  /**
   * Handle editor mount - store reference for future use
   */
  const handleEditorMount = useCallback(
    (editor, monacoInstance) => {
      editorRef.current = editor;
      monacoRef.current = monacoInstance;

      // Apply custom theme based on language
      if (lang === 'pixoscript') {
        monacoInstance.editor.setTheme('pixoscript-dark');
      } else if (lang === 'spritzcut') {
        monacoInstance.editor.setTheme('spritzcut-dark');
      }
      // Initial lint pass.
      runLint(editor.getValue(), editor, monacoInstance);
    },
    [lang, runLint]
  );

  /**
   * Saves the current content state by invoking the onSave callback if provided.
   */
  const saveChanges = useCallback(async () => {
    if (onSave) {
      try {
        await onSave(content);
        setHasChanges(false);
      } catch (err) {
        console.error('Save failed:', err);
      }
    } else {
      console.warn('ScriptEditor: No onSave callback provided');
    }
  }, [content, onSave]);

  // Save via shell command (Ctrl+S). Listens for 'px:shell-save' dispatched by
  // the shell's command system, instead of a rogue window-level listener.
  // Only saves when the event targets this tab (detail.tabId matches the
  // tabId prop) and there are actual unsaved changes — an empty document
  // that was never touched has hasChanges === false, so it is never written.
  useEffect(() => {
    const handleShellSave = event => {
      const targetTabId = event && event.detail ? event.detail.tabId : undefined;
      if (targetTabId !== undefined && targetTabId !== tabId) return;
      if (!hasChanges) return;
      saveChanges();
    };
    document.addEventListener('px:shell-save', handleShellSave);
    return () => document.removeEventListener('px:shell-save', handleShellSave);
  }, [saveChanges, hasChanges, tabId]);

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        width: '100%',
        height: '100%',
        minHeight: '400px',
        padding: '0.5rem',
        boxSizing: 'border-box',
      }}
    >
      <div
        style={{
          flex: 1,
          minHeight: 0,
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          background: 'var(--bg-primary, #0f0f1e)',
          borderRadius: '8px',
          border: '1px solid rgba(255,255,255,0.1)',
        }}
      >
        <div style={{ flex: 1, minHeight: 0, position: 'relative' }}>
          {/* Display-only placeholder: Monaco has no placeholder prop, so the
              hint is an overlay shown only when the document is empty. It is
              never part of editor state, so it can never be saved. */}
          {content === '' && (
            <div
              style={{
                position: 'absolute',
                top: '8px',
                left: '62px',
                color: '#6e7681',
                fontSize: '14px',
                fontFamily: 'monospace',
                pointerEvents: 'none',
                userSelect: 'none',
                zIndex: 1,
              }}
            >
              please start your edits :)
            </div>
          )}
          <Editor
            theme={
              lang === 'pixoscript'
                ? 'pixoscript-dark'
                : lang === 'spritzcut'
                  ? 'spritzcut-dark'
                  : 'vs-dark'
            }
            height="100%"
            value={content}
            language={lang}
            onChange={handleEditorChange}
            onMount={handleEditorMount}
            loading={<div style={{ padding: '2rem', color: '#888' }}>Loading editor...</div>}
            options={{
              minimap: { enabled: false },
              fontSize: 14,
              lineNumbers: 'on',
              scrollBeyondLastLine: false,
              wordWrap: 'on',
              automaticLayout: true,
              quickSuggestions: true,
              suggestOnTriggerCharacters: true,
              parameterHints: { enabled: true },
            }}
          />
        </div>
        <div
          style={{
            padding: '10px',
            borderTop: '1px solid rgba(255,255,255,0.1)',
            display: 'flex',
            alignItems: 'center',
            gap: '1rem',
            flexShrink: 0,
          }}
        >
          <Button appearance="primary" size="sm" onClick={saveChanges} disabled={!hasChanges}>
            {hasChanges ? 'Save Changes *' : 'Save Changes'}
          </Button>
          {hasChanges && (
            <span style={{ color: '#888', fontSize: '12px' }}>
              Unsaved changes (Ctrl+S to save)
            </span>
          )}
          {/* (UX Phase 2) Live validation pill (finding A5.1/A5.2) — the
              manual "click to validate" ritual is replaced by continuous
              linting; the pill reflects the current marker counts. */}
          <span style={{ marginLeft: 'auto', display: 'flex', gap: '6px' }}>
            {diagCounts.errors > 0 && (
              <Badge color="red">
                {diagCounts.errors} error{diagCounts.errors === 1 ? '' : 's'}
              </Badge>
            )}
            {diagCounts.warnings > 0 && (
              <Badge color="yellow">
                {diagCounts.warnings} warning{diagCounts.warnings === 1 ? '' : 's'}
              </Badge>
            )}
            {diagCounts.errors === 0 && diagCounts.warnings === 0 && (
              <Badge color="green">✓ clean</Badge>
            )}
          </span>
        </div>
      </div>
    </div>
  );
}

export default collect(ScriptEditor);
