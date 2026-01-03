/*
 * ---------------------------------------------------------------
 *                 Pixospritz – Editor – Image Preview
 * ---------------------------------------------------------------
 * Copyright (c) 2022‑2025  Kyle Derby MacInnis
 *
 * This component renders an image using a provided data URI.
 * It receives the encoded image via the `content` prop.
 * If no content is provided the component renders a placeholder.
 * 
 * Features:
 *  - Zoom controls (mouse wheel or buttons)
 *  - Image dimensions display
 *  - Format detection
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { collect } from 'react-recollect';
import { Panel, ButtonToolbar, IconButton, ButtonGroup } from 'rsuite';

/**
 * ImagePreview - Displays an image with zoom and info features.
 * @param {Object} props
 * @param {string} props.content - Data URI or URL of the image to display
 */
function ImagePreview({ content }) {
  const [zoom, setZoom] = useState(1);
  const [imageInfo, setImageInfo] = useState({ width: 0, height: 0, format: '' });
  const imgRef = useRef(null);
  const containerRef = useRef(null);

  // Reset zoom when content changes
  useEffect(() => {
    setZoom(1);
  }, [content]);

  // Get image info when loaded
  const handleImageLoad = useCallback((e) => {
    const img = e.target;
    let format = 'Unknown';

    // Detect format from data URI or extension
    if (content) {
      if (content.startsWith('data:image/png')) format = 'PNG';
      else if (content.startsWith('data:image/jpeg')) format = 'JPEG';
      else if (content.startsWith('data:image/gif')) format = 'GIF';
      else if (content.startsWith('data:image/webp')) format = 'WebP';
      else if (content.startsWith('data:image/svg')) format = 'SVG';
      else if (content.includes('.png')) format = 'PNG';
      else if (content.includes('.jpg') || content.includes('.jpeg')) format = 'JPEG';
    }

    setImageInfo({
      width: img.naturalWidth,
      height: img.naturalHeight,
      format: format
    });
  }, [content]);

  // Handle mouse wheel zoom (only when Shift is held)
  const handleWheel = useCallback((e) => {
    // Only zoom when Shift key is pressed, otherwise allow normal scroll
    if (!e.shiftKey) {
      return;
    }
    e.preventDefault();
    const delta = e.deltaY > 0 ? -0.1 : 0.1;
    setZoom(prevZoom => Math.max(0.1, Math.min(5, prevZoom + delta)));
  }, []);

  // Zoom controls
  const zoomIn = () => setZoom(z => Math.min(5, z + 0.25));
  const zoomOut = () => setZoom(z => Math.max(0.1, z - 0.25));
  const zoomReset = () => setZoom(1);
  const zoomFit = () => {
    if (containerRef.current && imageInfo.width > 0) {
      const containerWidth = containerRef.current.clientWidth - 40;
      const fitZoom = containerWidth / imageInfo.width;
      setZoom(Math.min(1, fitZoom));
    }
  };

  if (!content) {
    return (
      <div style={{ padding: '1rem', color: '#888', textAlign: 'center' }}>
        No image to preview.
      </div>
    );
  }

  return (
    <div className="editor-tool-container" style={{
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
      minHeight: 0,
      overflow: 'hidden'
    }}>
      <Panel bordered style={{
        margin: '1rem',
        flex: '1 1 auto',
        display: 'flex',
        flexDirection: 'column',
        minHeight: 0,
        overflow: 'hidden'
      }}>
        {/* Toolbar */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '0.5rem',
          background: 'var(--rs-bg-card, #1a1d24)',
          borderRadius: '4px',
          flexShrink: 0
        }}>
          <div style={{ fontSize: '12px', color: '#888' }}>
            {imageInfo.width > 0 && (
              <>
                <span>{imageInfo.width} × {imageInfo.height}px</span>
                <span style={{ marginLeft: '1rem' }}>{imageInfo.format}</span>
                <span style={{ marginLeft: '1rem' }}>{Math.round(zoom * 100)}%</span>
              </>
            )}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ fontSize: '11px', color: '#666' }}>Shift+Scroll to zoom</span>
            <ButtonToolbar>
              <ButtonGroup size="xs">
                <IconButton
                  icon={<span>−</span>}
                  onClick={zoomOut}
                  disabled={zoom <= 0.1}
                  title="Zoom Out"
                />
                <IconButton
                  icon={<span>⟲</span>}
                  onClick={zoomReset}
                  title="Reset Zoom"
                />
                <IconButton
                  icon={<span>+</span>}
                  onClick={zoomIn}
                  disabled={zoom >= 5}
                  title="Zoom In"
                />
                <IconButton
                  icon={<span>◻</span>}
                  onClick={zoomFit}
                  title="Fit to Width"
                />
              </ButtonGroup>
            </ButtonToolbar>
          </div>
        </div>

        {/* Image Container */}
        <div
          ref={containerRef}
          style={{
            flex: '1 1 auto',
            overflow: 'auto',
            minHeight: 0,
            background: 'repeating-conic-gradient(#222 0% 25%, #333 0% 50%) 50% / 20px 20px',
            borderRadius: '4px',
            padding: '1rem',
            textAlign: 'center'
          }}
          onWheel={handleWheel}
        >
          <img
            ref={imgRef}
            src={content}
            alt="Preview"
            onLoad={handleImageLoad}
            style={{
              maxWidth: 'none',
              transform: `scale(${zoom})`,
              transformOrigin: 'top left',
              imageRendering: zoom > 1 ? 'pixelated' : 'auto'
            }}
          />
        </div>
      </Panel>
    </div>
  );
}

export default collect(ImagePreview);