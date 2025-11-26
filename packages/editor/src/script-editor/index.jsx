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

import React, { useState, useEffect, useCallback } from 'react';
import { collect } from 'react-recollect';
import Editor, { loader } from '@monaco-editor/react';
import * as monaco from 'monaco-editor';
import { Button } from 'rsuite';

// Configure Monaco to use local bundle instead of CDN
loader.config({ monaco });

/**
 * ScriptEditor component allows editing and viewing of script and text files
 * with syntax highlighting and language support via Monaco Editor.
 *
 * @param {object} props
 * @param {string} props.content - Initial content to display in editor
 * @param {string} props.lang - Programming language identifier for syntax highlighting
 * @param {string} props.type - Layout type; 'script-only' uses full width, otherwise split panes
 * @param {function(string):void} [props.onSave] - Optional callback to save edited content
 * @returns {JSX.Element}
 */
function ScriptEditor({ content: initialContent, lang: initialLang, type: initialType, onSave }) {
  const [content, setContent] = useState(initialContent || 'please start your edits :)');
  const [lang, setLang] = useState(initialLang || 'lua');
  const [type] = useState(initialType || 'script-only');
  const [hasChanges, setHasChanges] = useState(false);

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
      setLang(initialLang);
    }
  }, [initialLang]);

  /**
   * Handle content changes in the editor
   */
  const handleEditorChange = useCallback((value) => {
    setContent(value || '');
    setHasChanges(true);
  }, []);

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

  // Keyboard shortcut for save (Ctrl+S / Cmd+S)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        saveChanges();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [saveChanges]);

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
        <div style={{ flex: 1, minHeight: 0 }}>
          <Editor
            theme="vs-dark"
            height="100%"
            value={content}
            language={lang}
            onChange={handleEditorChange}
            loading={<div style={{ padding: '2rem', color: '#888' }}>Loading editor...</div>}
            options={{
              minimap: { enabled: false },
              fontSize: 14,
              lineNumbers: 'on',
              scrollBeyondLastLine: false,
              wordWrap: 'on',
              automaticLayout: true,
            }}
          />
        </div>
        <div style={{ 
          padding: '10px', 
          borderTop: '1px solid rgba(255,255,255,0.1)',
          display: 'flex',
          alignItems: 'center',
          gap: '1rem',
          flexShrink: 0,
        }}>
          <Button 
            appearance="primary" 
            size="sm"
            onClick={saveChanges}
            disabled={!hasChanges}
          >
            {hasChanges ? 'Save Changes *' : 'Save Changes'}
          </Button>
          {hasChanges && (
            <span style={{ color: '#888', fontSize: '12px' }}>
              Unsaved changes (Ctrl+S to save)
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

export default collect(ScriptEditor);
