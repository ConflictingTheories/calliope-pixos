/*
 * ---------------------------------------------------------------
 *        Pixospritz – Editor – 3D Canvas Component
 * ---------------------------------------------------------------
 * Copyright (c) 2022‑2025  Kyle Derby MacInnis
 *
 * Reusable WebGL 2.0 canvas component with built-in camera controls.
 * Provides pan, rotate, and zoom functionality for 3D viewing.
 */

import React, { useRef, useEffect, useState, useCallback } from 'react';
import {
  initWebGL2,
  resizeCanvas,
  createMat4,
  identity,
  perspective,
  ortho,
  lookAt,
  multiply,
  translate,
} from '../shared/webgl-utils.js';

/**
 * WebGL3DCanvas - A reusable 3D canvas with camera controls
 * 
 * @param {Function} onRender - Callback to render scene. Receives (gl, projectionMatrix, viewMatrix, camera)
 * @param {Function} onInit - Optional callback when WebGL initializes. Receives (gl)
 * @param {Object} initialCamera - Initial camera settings
 * @param {Function} onCellClick - Optional callback when a cell is clicked (for map editing)
 * @param {Object} style - Additional canvas container styles
 */
export default function WebGL3DCanvas({
  onRender,
  onInit,
  initialCamera = {},
  onCellClick,
  onCellHover,
  style = {},
  showControls = true,
  viewMode = '3D', // '2D' or '3D'
}) {
  const canvasRef = useRef(null);
  const glRef = useRef(null);
  const animationFrameRef = useRef(null);

  // Camera state
  const [camera, setCamera] = useState({
    distance: initialCamera.distance || 25,
    angleX: initialCamera.angleX || -0.6,
    angleY: initialCamera.angleY || 0.5,
    centerX: initialCamera.centerX || 8.5,
    centerY: initialCamera.centerY || 9.5,
    centerZ: initialCamera.centerZ || 0,
  });

  // Interaction state
  const [isDragging, setIsDragging] = useState(false);
  const [isPanning, setIsPanning] = useState(false);
  const [lastMousePos, setLastMousePos] = useState({ x: 0, y: 0 });
  const [showGrid, setShowGrid] = useState(true);

  // Initialize WebGL
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const gl = initWebGL2(canvas);
    if (!gl) {
      console.error('Failed to initialize WebGL 2.0');
      return;
    }

    glRef.current = gl;

    // Call initialization callback
    if (onInit) {
      onInit(gl);
    }

    // Handle resize
    const handleResize = () => {
      resizeCanvas(canvas, gl);
    };
    window.addEventListener('resize', handleResize);
    handleResize();

    return () => {
      window.removeEventListener('resize', handleResize);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [onInit]);

  // Render loop
  const render = useCallback(() => {
    const gl = glRef.current;
    const canvas = canvasRef.current;
    if (!gl || !canvas) return;

    // Clear
    gl.clearColor(0.12, 0.12, 0.12, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    // Calculate matrices
    const projectionMatrix = createMat4();
    const aspect = canvas.width / canvas.height;

    if (viewMode === '2D') {
      const size = camera.distance * 0.5;
      ortho(projectionMatrix, -size * aspect, size * aspect, -size, size, 0.1, 1000.0);
    } else {
      perspective(projectionMatrix, Math.PI / 4, aspect, 0.1, 1000.0);
    }

    // Calculate camera position
    let camX, camY, camZ;
    if (viewMode === '2D') {
      camX = camera.centerX;
      camY = camera.centerY;
      camZ = camera.distance;
    } else {
      camX = camera.centerX + camera.distance * Math.cos(camera.angleX) * Math.cos(camera.angleY);
      camY = camera.centerY + camera.distance * Math.cos(camera.angleX) * Math.sin(camera.angleY);
      camZ = camera.centerZ + camera.distance * Math.sin(camera.angleX);
    }

    const viewMatrix = createMat4();
    if (viewMode === '2D') {
      lookAt(
        viewMatrix,
        [camX, camY, camZ],
        [camera.centerX, camera.centerY, 0],
        [0, 1, 0]
      );
    } else {
      lookAt(
        viewMatrix,
        [camX, camY, camZ],
        [camera.centerX, camera.centerY, camera.centerZ],
        [0, 0, 1]
      );
    }

    // Call render callback
    if (onRender) {
      onRender(gl, projectionMatrix, viewMatrix, camera, showGrid);
    }

    animationFrameRef.current = requestAnimationFrame(render);
  }, [camera, onRender, showGrid]);

  // Start render loop
  useEffect(() => {
    render();
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [render]);

  // Mouse event handlers
  const handleMouseDown = useCallback(
    (e) => {
      // Call onCellClick for shift+mousedown (painting)
      if (e.shiftKey && onCellClick) {
        const rect = canvasRef.current.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const mouseEvent = new MouseEvent('mousedown', e);
        Object.defineProperty(mouseEvent, 'button', { value: e.button });
        Object.defineProperty(mouseEvent, 'shiftKey', { value: true });
        onCellClick(x, y, camera, mouseEvent);
        return;
      }

      setIsDragging(true);
      setIsPanning(e.button === 1); // Middle mouse for panning
      setLastMousePos({ x: e.clientX, y: e.clientY });
    },
    [camera, onCellClick]
  );

  const handleMouseMove = useCallback(
    (e) => {
      // Always notify hover for cell highlighting and drag painting
      if (onCellHover) {
        const rect = canvasRef.current.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        onCellHover(x, y, camera, e);
      }

      if (!isDragging) return;

      const deltaX = e.clientX - lastMousePos.x;
      const deltaY = e.clientY - lastMousePos.y;
      setLastMousePos({ x: e.clientX, y: e.clientY });

      if (isPanning || viewMode === '2D') {
        // Pan camera
        const panSpeed = viewMode === '2D' ? camera.distance * 0.002 : camera.distance * 0.01;

        let right, forward;
        if (viewMode === '2D') {
          right = 1;
          forward = 0;
        } else {
          right = Math.cos(camera.angleY + Math.PI / 2);
          forward = Math.sin(camera.angleY + Math.PI / 2);
        }

        setCamera((prev) => ({
          ...prev,
          centerX: prev.centerX - (right * deltaX) * panSpeed,
          centerY: prev.centerY + (viewMode === '2D' ? deltaY : (forward * deltaY)) * panSpeed,
        }));
      } else {
        // Rotate camera
        setCamera((prev) => ({
          ...prev,
          angleY: prev.angleY - deltaX * 0.005,
          angleX: Math.max(
            -Math.PI / 2 + 0.1,
            Math.min(Math.PI / 2 - 0.1, prev.angleX + deltaY * 0.005)
          ),
        }));
      }
    },
    [isDragging, isPanning, lastMousePos, camera, onCellHover]
  );

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
    setIsPanning(false);
  }, []);

  const handleWheel = useCallback((e) => {
    e.preventDefault();
    const zoomSpeed = 0.1;
    const delta = e.deltaY > 0 ? 1 + zoomSpeed : 1 - zoomSpeed;

    setCamera((prev) => ({
      ...prev,
      distance: Math.max(5, Math.min(100, prev.distance * delta)),
    }));
  }, []);

  const handleClick = useCallback(
    (e) => {
      // Only trigger click if not dragging and not shift-clicking
      if (Math.abs(e.clientX - lastMousePos.x) > 5 || Math.abs(e.clientY - lastMousePos.y) > 5) {
        return;
      }

      // Don't handle regular clicks - painting is done via Shift+Click
      if (!e.shiftKey) {
        return;
      }

      if (onCellClick) {
        const rect = canvasRef.current.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        onCellClick(x, y, camera, e);
      }
    },
    [lastMousePos, onCellClick, camera]
  );

  const resetCamera = useCallback(() => {
    setCamera({
      distance: initialCamera.distance || 25,
      angleX: initialCamera.angleX || -0.6,
      angleY: initialCamera.angleY || 0.5,
      centerX: initialCamera.centerX || 8.5,
      centerY: initialCamera.centerY || 9.5,
      centerZ: initialCamera.centerZ || 0,
    });
  }, [initialCamera]);

  const toggleGrid = useCallback(() => {
    setShowGrid((prev) => !prev);
  }, []);

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%', ...style }}>
      <canvas
        ref={canvasRef}
        style={{
          width: '100%',
          height: '100%',
          display: 'block',
          cursor: isDragging ? (isPanning ? 'grabbing' : 'grab') : 'default',
        }}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onWheel={handleWheel}
        onClick={handleClick}
        onContextMenu={(e) => {
          if (e.shiftKey) {
            e.preventDefault(); // Prevent context menu for Shift+Right-Click (erase)
            if (onCellClick) {
              const rect = canvasRef.current.getBoundingClientRect();
              const x = e.clientX - rect.left;
              const y = e.clientY - rect.top;
              onCellClick(x, y, camera, e);
            }
          }
        }}
      />
      {showControls && (
        <div
          style={{
            position: 'absolute',
            bottom: 10,
            left: 10,
            background: 'rgba(0, 0, 0, 0.7)',
            padding: '8px 12px',
            borderRadius: '4px',
            fontSize: '11px',
            color: '#d4d4d4',
            userSelect: 'none',
          }}
        >
          <div>Drag to rotate | Shift+Drag to pan | Scroll to zoom</div>
          <div style={{ marginTop: '4px' }}>
            <button
              onClick={resetCamera}
              style={{
                background: '#0e639c',
                border: 'none',
                color: 'white',
                padding: '4px 8px',
                marginRight: '4px',
                borderRadius: '3px',
                cursor: 'pointer',
                fontSize: '11px',
              }}
            >
              📷 Reset Camera
            </button>
            <button
              onClick={toggleGrid}
              style={{
                background: showGrid ? '#0e639c' : '#3e3e42',
                border: 'none',
                color: 'white',
                padding: '4px 8px',
                borderRadius: '3px',
                cursor: 'pointer',
                fontSize: '11px',
              }}
            >
              ⊞ Grid
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
