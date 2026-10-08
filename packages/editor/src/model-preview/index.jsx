/*
 * ---------------------------------------------------------------
 *                 Pixospritz – Editor – Model Preview
 * ---------------------------------------------------------------
 * Copyright (c) 2022‑2025  Kyle Derby MacInnis
 *
 * This component previews 3D models packaged within a Pixospritz
 * zip archive.  It uses ObjModelViewer for OBJ files and the
 * <model-viewer> web component for GLTF/GLB files.
 */

import React, { useEffect } from 'react';
import { collect } from 'react-recollect';
import ObjModelViewer from './ObjModelViewer.jsx';

/**
 * Check if content looks like OBJ format
 * OBJ files typically start with comments (#) or vertex data (v)
 */
function isOBJContent(content) {
  if (typeof content !== 'string') return false;

  // Reject data URIs / URLs early (these are not raw OBJ text)
  if (content.startsWith('data:') || /^[a-zA-Z]+:\/\//.test(content)) return false;

  // Look for common OBJ tokens anywhere in the start of the file.
  // Some files may include comments or MTL snippets; scanning the first
  // chunk is more reliable than only the very first non-empty line.
  const sample = content.slice(0, 8192);
  if (/(^|\n)\s*(#|mtllib|newmtl|o\s|g\s|v\s|vt\s|vn\s|f\s|usemtl)/i.test(sample)) {
    return true;
  }

  return false;
}

/**
 * Check if content is an MTL material file rather than renderable geometry.
 * MTL files define materials via `newmtl` blocks and never contain OBJ
 * geometry (v/vt/vn/f) lines, so they can never be previewed on their own.
 * Detected by file extension when known, otherwise by content sniffing.
 */
function isMTLOnly(content, fileName) {
  if (fileName && /\.mtl$/i.test(fileName.trim())) return true;

  if (typeof content !== 'string') return false;

  // Data URIs are opaque here; extension is the only signal for those.
  if (content.startsWith('data:') || /^[a-zA-Z]+:\/\//.test(content)) return false;

  const sample = content.slice(0, 8192);
  const hasNewmtl = /(^|\n)\s*newmtl\s+\S/i.test(sample);
  const hasGeometry = /(^|\n)\s*(v\s|vt\s|vn\s|f\s)/i.test(sample);
  return hasNewmtl && !hasGeometry;
}

/**
 * ModelPreview displays a 3D model using ObjModelViewer for OBJ files
 * or the model-viewer web component for GLTF/GLB.
 *
 * Props:
 *  - content (string): Raw OBJ content or data URI for GLTF/GLB
 *  - mtlContent (string): Optional MTL material content for OBJ files
 *  - textureBasePath (string): Optional base path for texture loading
 *  - textures (object): Optional map of texture names to data URIs
 *  - fileName (string): Optional source file name (used to detect .mtl files)
 *  - error (string): Optional error message; shown instead of any viewer
 *  - missingRefs (string[]): Optional list of external files referenced by a
 *    .gltf that could not be found in the package; shown as per-file warnings
 *    above the preview instead of blocking it
 */
function ModelPreview({ content, mtlContent, textureBasePath, textures, fileName, error, missingRefs }) {
  // Caller-reported failure (e.g. a .gltf's external files missing from the
  // package) takes precedence over everything else.
  if (error) {
    return (
      <div
        className="editor-tool-container"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100%',
          color: '#e08080',
          padding: '2rem',
          textAlign: 'center',
        }}
      >
        {error}
      </div>
    );
  }

  // Early return if no content
  if (!content) {
    return (
      <div
        className="editor-tool-container"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100%',
          color: '#888',
        }}
      >
        No model content to preview.
      </div>
    );
  }

  // An .mtl file alone is not renderable: it only describes materials for an
  // accompanying .obj. It must not reach either viewer — model-viewer would
  // sit on "Loading..." forever and ObjModelViewer would show an empty scene.
  if (isMTLOnly(content, fileName)) {
    return (
      <div
        className="editor-tool-container"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100%',
          color: '#888',
          padding: '2rem',
          textAlign: 'center',
        }}
      >
        MTL material files can&rsquo;t be previewed alone &mdash; open the accompanying .obj
        instead.
      </div>
    );
  }

  // Check if content is OBJ format
  const isOBJ = isOBJContent(content);

  // Use ObjModelViewer for OBJ files
  if (isOBJ) {
    return (
      <ObjModelViewer
        objContent={content}
        mtlContent={mtlContent || ''}
        textureBasePath={textureBasePath || ''}
        textures={textures || {}}
      />
    );
  }

  // External .gltf refs that couldn't be resolved in the package. These do
  // not block the preview — whatever embedded fine still renders — but each
  // missing file is called out so the cause of untextured/missing geometry
  // is obvious.
  const missingList = Array.isArray(missingRefs) ? missingRefs.filter(Boolean) : [];
  const missingBanner =
    missingList.length > 0 ? (
      <div
        role="alert"
        style={{
          flex: '0 0 auto',
          marginBottom: '0.75rem',
          padding: '0.6rem 0.8rem',
          border: '1px solid #7a5c1e',
          borderRadius: '4px',
          background: '#2a2113',
          color: '#e8c766',
          fontSize: '0.85rem',
        }}
      >
        <div style={{ fontWeight: 'bold', marginBottom: '0.25rem' }}>
          {missingList.length === 1
            ? '1 referenced file is missing from the package:'
            : `${missingList.length} referenced files are missing from the package:`}
        </div>
        <ul style={{ margin: 0, paddingLeft: '1.2rem' }}>
          {missingList.map(name => (
            <li key={name}>
              Missing: {name} &mdash; preview may show untextured/missing geometry
            </li>
          ))}
        </ul>
      </div>
    ) : null;

  // For GLTF/GLB, use model-viewer web component
  useEffect(() => {
    if (!window.customElements || !window.customElements.get('model-viewer')) {
      const script = document.createElement('script');
      script.type = 'module';
      script.src = 'https://unpkg.com/@google/model-viewer@3.2.1/dist/model-viewer.min.js';
      document.head.appendChild(script);
    }
  }, []);

  return (
    <div
      className="editor-tool-container"
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        minHeight: 0,
        overflow: 'hidden',
        padding: '1rem',
      }}
    >
      {missingBanner}
      <model-viewer
        src={content}
        style={{
          flex: '1 1 auto',
          width: '100%',
          minHeight: 0,
          borderRadius: '4px',
          background: '#1a1a1a',
        }}
        autoplay
        auto-rotate
        camera-controls
        exposure="1.0"
        background-color="#1a1a1a"
      >
        <span style={{ padding: '1rem', color: '#888' }}>Loading 3D model…</span>
      </model-viewer>
    </div>
  );
}

export default collect(ModelPreview);
