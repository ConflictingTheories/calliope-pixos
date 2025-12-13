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
 * ModelPreview displays a 3D model using ObjModelViewer for OBJ files
 * or the model-viewer web component for GLTF/GLB.
 *
 * Props:
 *  - content (string): Raw OBJ content or data URI for GLTF/GLB
 *  - mtlContent (string): Optional MTL material content for OBJ files
 *  - textureBasePath (string): Optional base path for texture loading
 *  - textures (object): Optional map of texture names to data URIs
 */
function ModelPreview({ content, mtlContent, textureBasePath, textures }) {
  // Early return if no content
  if (!content) {
    return (
      <div className="editor-tool-container" style={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        height: '100%',
        color: '#888' 
      }}>
        No model content to preview.
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
    <div className="editor-tool-container" style={{ 
      display: 'flex', 
      flexDirection: 'column', 
      height: '100%',
      minHeight: 0,
      overflow: 'hidden',
      padding: '1rem'
    }}>
      <model-viewer
        src={content}
        style={{ 
          flex: '1 1 auto',
          width: '100%', 
          minHeight: 0,
          borderRadius: '4px',
          background: '#1a1a1a'
        }}
        autoplay
        auto-rotate
        camera-controls
        exposure='1.0'
        background-color='#1a1a1a'
      >
        <span style={{ padding: '1rem', color: '#888' }}>Loading 3D model…</span>
      </model-viewer>
    </div>
  );
}

export default collect(ModelPreview);