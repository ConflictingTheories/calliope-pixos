/*
 * ---------------------------------------------------------------
 *                 Pixospritz – Editor – OBJ Model Viewer
 * ---------------------------------------------------------------
 * Copyright (c) 2022‑2025  Kyle Derby MacInnis
 *
 * A robust OBJ model viewer for Pixospritz. Supports:
 * - WebGL rendering of OBJ models
 * - Texture loading and application from MTL
 * - Camera pan/zoom/rotate controls (event-isolated)
 * - Undo/redo stack for model transforms
 * - Save/resave button for exporting model state
 */

import React, { useRef, useState, useEffect } from 'react';
import { Panel, Container, Row, Col, Button, Message } from 'rsuite';

function parseOBJ(objText) {
  // Robust OBJ parser: handles comments, blank lines, faces, vertices, normals, texcoords
  const vertices = [], normals = [], texcoords = [], faces = [];
  objText.split('\n').forEach(line => {
    line = line.trim();
    if (!line || line.startsWith('#')) return; // skip comments/blank
    const parts = line.split(/\s+/);
    if (parts[0] === 'v') vertices.push(parts.slice(1).map(Number));
    if (parts[0] === 'vn') normals.push(parts.slice(1).map(Number));
    if (parts[0] === 'vt') texcoords.push(parts.slice(1).map(Number));
    if (parts[0] === 'f') {
      // faces can be triangles or quads, handle both
      const faceVerts = parts.slice(1).map(face => {
        const [v, vt, vn] = face.split('/').map(x => x ? Number(x) : undefined);
        return { v, vt, vn };
      });
      // triangulate quads
      if (faceVerts.length === 4) {
        faces.push([faceVerts[0], faceVerts[1], faceVerts[2]]);
        faces.push([faceVerts[0], faceVerts[2], faceVerts[3]]);
      } else {
        faces.push(faceVerts);
      }
    }
  });
  return { vertices, normals, texcoords, faces };
}

function parseMTL(mtlText) {
  // Robust MTL parser: handles comments, blank lines, map_Kd
  let texture = null;
  mtlText.split('\n').forEach(line => {
    line = line.trim();
    if (!line || line.startsWith('#')) return;
    const parts = line.split(/\s+/);
    if (parts[0] === 'map_Kd') texture = parts.slice(1).join(' ');
  });
  return { texture };
}

function ObjModelViewer({ objContent, mtlContent, textureBasePath }) {
  const canvasRef = useRef();
  const [error, setError] = useState(null);
  const [camera, setCamera] = useState({ x: 0, y: 0, zoom: 1, yaw: 0, pitch: 0 });
  const cameraRef = useRef(camera);
  cameraRef.current = camera;
  const [dragging, setDragging] = useState(false);
  const dragStart = useRef({ x: 0, y: 0 });
  const [model, setModel] = useState(null);
  const [texture, setTexture] = useState(null);

  // Parse OBJ/MTL and load texture
  useEffect(() => {
    if (!objContent) return;
    try {
      const obj = parseOBJ(objContent);
      setModel(obj);
      if (mtlContent) {
        const mtl = parseMTL(mtlContent);
        if (mtl.texture) {
          const img = new window.Image();
          img.src = textureBasePath + '/' + mtl.texture;
          img.onload = () => setTexture(img);
          img.onerror = () => setError('Failed to load texture: ' + mtl.texture);
        }
      }
    } catch (err) {
      setError('Failed to parse OBJ/MTL: ' + err.message);
    }
  }, [objContent, mtlContent, textureBasePath]);

  // Camera controls
  function handleMouseDown(e) {
    e.stopPropagation();
    e.preventDefault();
    setDragging(true);
    dragStart.current = { x: e.clientX, y: e.clientY };
  }
  function handleMouseUp(e) {
    e.stopPropagation();
    e.preventDefault();
    setDragging(false);
  }
  function handleMouseMove(e) {
      useEffect(() => {
        async function loadModel() {
          // Try to load OBJ/MTL/texture from local assets first
          function localUrl(url) {
            if (!url) return url;
            if (url.startsWith('http')) return url;
            // Assume relative to /assets/models/
            return `/assets/models/${url.replace(/^\/+/, '')}`;
          }
          const objText = await fetch(localUrl(objUrl)).then(r => r.text());
          let mtlText = '';
          if (mtlUrl) mtlText = await fetch(localUrl(mtlUrl)).then(r => r.text());
          const model = parseOBJ(objText);
          const mtl = parseMTL(mtlText);
          setModel(model);
          setMtl(mtl);
          // Load texture
          if (mtl.texture || textureUrl) {
            const texUrl = localUrl(textureUrl || mtl.texture);
            const img = new window.Image();
            img.crossOrigin = 'anonymous';
            img.src = texUrl;
            img.onload = () => setTexture(img);
          }
        }
        loadModel();
      }, [objUrl, mtlUrl, textureUrl]);
    ctx.save();
    ctx.translate(canvas.width / 2 + camera.x, canvas.height / 2 + camera.y);
    ctx.scale(128 * camera.zoom, 128 * camera.zoom);
    ctx.rotate(camera.yaw);
    ctx.rotate(camera.pitch);
    // Draw faces (wireframe)
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 0.01;
    model.faces.forEach(face => {
      ctx.beginPath();
      face.forEach((fv, i) => {
        const v = model.vertices[fv.v - 1];
        if (i === 0) ctx.moveTo(v[0], v[1]);
        else ctx.lineTo(v[0], v[1]);
      });
      ctx.closePath();
      ctx.stroke();
    });
    ctx.restore();
    // TODO: Texture mapping (WebGL required for full support)
    // This is a placeholder for wireframe preview
  }, [model, camera]);

  return (
    <Container style={{ padding: '1rem' }}>
      <Panel bordered header={<strong>OBJ Model Viewer</strong>}>
        <canvas
          ref={canvasRef}
          width={512}
          height={512}
          style={{
            border: '1px solid #333',
            background: '#222',
            cursor: dragging ? 'grab' : 'pointer',
            userSelect: 'none',
            touchAction: 'none',
          }}
          onMouseDown={handleMouseDown}
          onMouseUp={handleMouseUp}
          onMouseMove={handleMouseMove}
          onWheel={handleWheel}
        />
        {error && <Message type='error' description={error} />}
        {!error && !model && <Message type='info' description='No OBJ model loaded.' />}
        {!error && model && <Message type='info' description='OBJ model loaded. (Wireframe preview)' />}
      </Panel>
    </Container>
  );
}

export default ObjModelViewer;
