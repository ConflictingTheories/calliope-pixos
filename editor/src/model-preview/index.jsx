/*
 * ---------------------------------------------------------------
 *                 Pixospritz – Editor – Model Preview
 * ---------------------------------------------------------------
 * Copyright (c) 2022‑2025  Kyle Derby MacInnis
 *
 * This component previews 3D models packaged within a Pixospritz
 * zip archive.  It leverages the <model-viewer> web component
 * (see https://modelviewer.dev/) to render OBJ/GLTF/GLB files.
 * When the component is mounted it ensures the model viewer
 * library is loaded by dynamically injecting the module script.
 */

import React, { useEffect } from 'react';
import { collect } from 'react-recollect';

/**
 * ModelPreview displays a 3D model using the model-viewer web
 * component.  The provided `content` prop should be a data URI
 * representing a binary model (e.g. OBJ, GLB, GLTF).  The
 * component will auto‑load the model-viewer library if it is not
 * already available on the page.
 *
 * Props:
 *  - content (string): A data URI for the model to preview.
 */
function ModelPreview({ content }) {
  // If OBJ, use ObjModelViewer; else use <model-viewer>
  if (!content) return null;
  const isOBJ = typeof content === 'string' && content.trim().startsWith('v ');
  if (isOBJ) {
    const ObjModelViewer = require('./ObjModelViewer.jsx').default;
    return <ObjModelViewer objContent={content} mtlContent={mtlContent} textureBasePath={textureBasePath || ''} />;
  }
  useEffect(() => {
    if (!window.customElements || !window.customElements.get('model-viewer')) {
      const script = document.createElement('script');
      script.type = 'module';
      script.src = 'https://unpkg.com/@google/model-viewer@3.2.1/dist/model-viewer.min.js';
      document.head.appendChild(script);
    }
  }, []);
  return (
    <div style={{ padding: '1rem', width: '100%', height: '80vh' }}>
      <hr />
      <model-viewer
        src={content}
        style={{ width: '100%', height: '100%' }}
        autoplay
        auto-rotate
        camera-controls
        exposure='1.0'
        background-color='#1a1a1a'
      >
        <span>Loading 3D model…</span>
      </model-viewer>
      <hr />
    </div>
  );
}

export default collect(ModelPreview);