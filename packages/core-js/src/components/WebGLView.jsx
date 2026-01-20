/*                                                 *\
** ----------------------------------------------- **
**          Calliope - Pixos Game Engine   	       **
** ----------------------------------------------- **
**  Copyright (c) 2020-2025 - Kyle Derby MacInnis  **
**                                                 **
**    Any unauthorized distribution or transfer    **
**       of this work is strictly prohibited.      **
**                                                 **
**               All Rights Reserved.              **
** ----------------------------------------------- **
\*                                                 */

import React, { useEffect, useRef, useState } from 'react';
import PropTypes from 'prop-types';

import glEngine from '@Engine/core/index.js';
import { minecraftia } from '@Engine/core/hud/index.js';
//
const WebGLView = ({ width, height, SpritzProvider, class: string, zipData }) => {
  // Canvas
  const ref = useRef();
  const hudRef = useRef();
  const gamepadRef = useRef();
  const fileRef = useRef();
  const mmRef = useRef();

  let engine = null;

  // keyboard & touch - use wrapper functions to guard against uninitialized engine
  const onKeyEvent = (e) => {
    try {
      if (SpritzProvider && SpritzProvider.onKeyEvent) SpritzProvider.onKeyEvent(e);
    } catch (err) {
      // swallow until engine initialized
    }
  };

  /**
   * Handles touch/mouse events with proper coordinate transformation.
   * The canvas element may be scaled via CSS to fit the viewport, but its
   * internal resolution (width/height attributes) can differ from the display
   * size (getBoundingClientRect). This function computes the correct canvas
   * coordinates by accounting for the scale difference and any offset.
   */
  const onTouchEvent = (e) => {
    try {
      const canvas = hudRef.current;
      if (!canvas) {
        if (SpritzProvider && SpritzProvider.onTouchEvent) SpritzProvider.onTouchEvent(e);
        return;
      }

      const rect = canvas.getBoundingClientRect();

      // Handle both mouse and touch events
      let clientX, clientY;
      if (e.touches && e.touches.length > 0) {
        clientX = e.touches[0].clientX;
        clientY = e.touches[0].clientY;
      } else if (e.changedTouches && e.changedTouches.length > 0) {
        clientX = e.changedTouches[0].clientX;
        clientY = e.changedTouches[0].clientY;
      } else {
        clientX = e.clientX;
        clientY = e.clientY;
      }

      // Calculate scale factors between internal canvas size and displayed size
      const scaleX = canvas.width / rect.width;
      const scaleY = canvas.height / rect.height;

      // Calculate position relative to canvas with proper scaling
      const canvasX = (clientX - rect.left) * scaleX;
      const canvasY = (clientY - rect.top) * scaleY;

      // Create adjusted event with canvas-relative coordinates
      const adjustedEvent = {
        ...e,
        type: e.type,
        clientX: clientX,
        clientY: clientY,
        // Pre-computed canvas coordinates for the engine
        canvasX: canvasX,
        canvasY: canvasY,
        pageX: canvasX + rect.left,
        pageY: canvasY + rect.top,
        _canvasRect: rect,
        _scaleX: scaleX,
        _scaleY: scaleY
      };

      if (SpritzProvider && SpritzProvider.onTouchEvent) {
        SpritzProvider.onTouchEvent(adjustedEvent);
      }
    } catch (err) {
      console.warn('onTouchEvent error:', err);
    }
  };

  /**
   * Handles touch/mouse events for gamepad canvas with proper coordinate transformation.
   */
  const onGamepadTouchEvent = (e) => {
    try {
      const canvas = gamepadRef.current;
      if (!canvas) {
        return;
      }

      const rect = canvas.getBoundingClientRect();

      // Handle both mouse and touch events
      let clientX, clientY;
      if (e.touches && e.touches.length > 0) {
        clientX = e.touches[0].clientX;
        clientY = e.touches[0].clientY;
      } else if (e.changedTouches && e.changedTouches.length > 0) {
        clientX = e.changedTouches[0].clientX;
        clientY = e.changedTouches[0].clientY;
      } else {
        clientX = e.clientX;
        clientY = e.clientY;
      }

      // Calculate scale factors between internal canvas size and displayed size
      const scaleX = canvas.width / rect.width;
      const scaleY = canvas.height / rect.height;

      // Calculate position relative to canvas with proper scaling
      const canvasX = (clientX - rect.left) * scaleX;
      const canvasY = (clientY - rect.top) * scaleY;

      // Create adjusted event with canvas-relative coordinates
      const adjustedEvent = {
        ...e,
        type: e.type,
        clientX: clientX,
        clientY: clientY,
        // Pre-computed canvas coordinates for the engine
        canvasX: canvasX,
        canvasY: canvasY,
        pageX: canvasX + rect.left,
        pageY: canvasY + rect.top,
        _canvasRect: rect,
        _scaleX: scaleX,
        _scaleY: scaleY
      };

      if (engine && engine.inputManager && engine.inputManager.gamepad) {
        engine.inputManager.gamepad.listen(adjustedEvent);
      }
    } catch (err) {
      console.warn('onGamepadTouchEvent error:', err);
    }
  };

  // Resize
  const [screenSize, getDimension] = useState({
    dynamicWidth: window.innerWidth,
    dynamicHeight: window.innerHeight,
  });

  // window dimensions
  const setDimension = () => {
    getDimension({
      dynamicWidth: window.innerWidth,
      dynamicHeight: window.innerHeight,
    });
  };

  // load fonts
  async function loadFonts() {
    await minecraftia.load();
    document.fonts.add(minecraftia);
  }

  function stopTouchScrolling(canvas) {
    // Prevent scrolling when touching the canvas
    document.body.addEventListener(
      'touchstart',
      function (e) {
        if (e.target == canvas) {
          e.preventDefault();
        }
      },
      { passive: false }
    );
    document.body.addEventListener(
      'touchend',
      function (e) {
        if (e.target == canvas) {
          e.preventDefault();
        }
      },
      { passive: false }
    );
    document.body.addEventListener(
      'touchmove',
      function (e) {
        if (e.target == canvas) {
          e.preventDefault();
        }
      },
      { passive: false }
    );
  }

  useEffect(async () => {
    // handle resize
    window.addEventListener('resize', setDimension);

    // setup canvases
    const canvas = ref.current;
    const hud = hudRef.current;
    const mipmap = mmRef.current;
    const gamepad = gamepadRef.current;
    const fileUpload = fileRef.current;

    // Webgl Engine
    engine = new glEngine(canvas, hud, mipmap, gamepad, fileUpload, width, height);

    // load fonts
    await loadFonts();

    // Initialize Spritz
    await engine.init(SpritzProvider);

    // Create ResizeObserver for proper canvas resize handling
    let resizeObserver = null;
    if (typeof ResizeObserver !== 'undefined') {
      resizeObserver = new ResizeObserver((entries) => {
        for (const entry of entries) {
          if (entry.target === canvas || entry.target === hud) {
            // Notify engine of resize
            if (engine && engine.handleResize) {
              engine.handleResize();
            }
          }
        }
      });
      resizeObserver.observe(canvas);
      resizeObserver.observe(hud);
    }

    // Add native event listeners with { passive: false } to allow preventDefault
    // These must be native listeners, not React synthetic events
    if (hud) {
      hud.addEventListener('touchstart', onTouchEvent, { passive: false });
      hud.addEventListener('touchmove', onTouchEvent, { passive: false });
      hud.addEventListener('touchend', onTouchEvent, { passive: false });
      hud.addEventListener('touchcancel', onTouchEvent, { passive: false });
      hud.addEventListener('mousedown', onTouchEvent, { passive: false });
      hud.addEventListener('mouseup', onTouchEvent, { passive: false });
      hud.addEventListener('mousemove', onTouchEvent, { passive: false });
    }

    if (gamepad) {
      gamepad.addEventListener('touchstart', onGamepadTouchEvent, { passive: false });
      gamepad.addEventListener('touchmove', onGamepadTouchEvent, { passive: false });
      gamepad.addEventListener('touchend', onGamepadTouchEvent, { passive: false });
      gamepad.addEventListener('touchcancel', onGamepadTouchEvent, { passive: false });
      gamepad.addEventListener('mousedown', onGamepadTouchEvent, { passive: false });
      gamepad.addEventListener('mouseup', onGamepadTouchEvent, { passive: false });
      gamepad.addEventListener('mousemove', onGamepadTouchEvent, { passive: false });
    }

    // render loop
    engine.render();

    // cleanup
    return () => {
      stopTouchScrolling(canvas);
      stopTouchScrolling(gamepad);
      stopTouchScrolling(hud);
      window.removeEventListener('resize', setDimension);
      
      // Remove native event listeners
      if (hud) {
        hud.removeEventListener('touchstart', onTouchEvent);
        hud.removeEventListener('touchmove', onTouchEvent);
        hud.removeEventListener('touchend', onTouchEvent);
        hud.removeEventListener('touchcancel', onTouchEvent);
        hud.removeEventListener('mousedown', onTouchEvent);
        hud.removeEventListener('mouseup', onTouchEvent);
        hud.removeEventListener('mousemove', onTouchEvent);
      }

      if (gamepad) {
        gamepad.removeEventListener('touchstart', onGamepadTouchEvent);
        gamepad.removeEventListener('touchmove', onGamepadTouchEvent);
        gamepad.removeEventListener('touchend', onGamepadTouchEvent);
        gamepad.removeEventListener('touchcancel', onGamepadTouchEvent);
        gamepad.removeEventListener('mousedown', onGamepadTouchEvent);
        gamepad.removeEventListener('mouseup', onGamepadTouchEvent);
        gamepad.removeEventListener('mousemove', onGamepadTouchEvent);
      }
      
      if (resizeObserver) {
        resizeObserver.disconnect();
      }
      engine.close();
    };
  }, [SpritzProvider]);

  let wrapperHeight = (screenSize.dynamicWidth * 3) / 4 > 1080 ? 1080 : screenSize.dynamicHeight;
  let canvasHeight = (screenSize.dynamicWidth * 3) / 4 > 1080 ? wrapperHeight : wrapperHeight - 200;
  let canvasWidth = screenSize.dynamicWidth > 1920 ? 1920 : screenSize.dynamicWidth;
  let showGamepad = screenSize.dynamicWidth <= 900;
  let gamepadHeight = 200;

  return (
    <div style={{ marginLeft: 'auto', marginRight: 'auto' }}>
      <div
        style={{
          position: 'relative',
          padding: 'none',
          background: 'var(--color-bg, #0a0a0f)',
          height: canvasHeight + 'px',
          width: canvasWidth + 'px',
        }}
        onKeyDownCapture={(e) => onKeyEvent(e.nativeEvent)}
        onKeyUpCapture={(e) => onKeyEvent(e.nativeEvent)}
        tabIndex={0}
      >
        {/* Game */}
        <div>
          {/* // WEBGL - For 3D Rendering */}
          <canvas
            style={{
              position: 'absolute',
              zIndex: 1,
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
            }}
            ref={ref}
            width={canvasWidth}
            height={canvasHeight}
            className={string}
          />
          {/* HUD - For Dialogue / Menus / Overlays */}
          <canvas
            style={{
              position: 'absolute',
              zIndex: 2,
              top: 0,
              left: 0,
              background: 'none',
              width: '100%',
              height: '100%',
              touchAction: 'none', // Prevent browser gestures
              cursor: 'pointer',
            }}
            ref={hudRef}
            width={canvasWidth}
            height={canvasHeight}
            className={string}
          />
          {/* MIPMAP - For Sprite Text / Speech / Titles */}
          <canvas style={{ display: 'none' }} ref={mmRef} width={256} height={256} />
        </div>
      </div>
      {/* Gamepad - For controls on Mobile Only - Positioned BELOW game canvas */}
      <div style={{
        width: canvasWidth + 'px',
        height: showGamepad ? gamepadHeight + 'px' : '1px',
        marginTop: showGamepad ? '10px' : '0px',
        position: 'relative',
        overflow: 'hidden',
      }}>
        <canvas
          style={{
            position: 'absolute',
            zIndex: 5,
            top: 0,
            left: 0,
            background: 'none',
            width: '100%',
            height: '100%',
            display: showGamepad ? 'block' : 'none',
            touchAction: 'none', // Prevent browser gestures and scrolling
          }}
          ref={gamepadRef}
          width={canvasWidth}
          height={gamepadHeight}
          className={string}
        />
      </div>
      <div>
        <input type="file" ref={fileRef} src={zipData ?? null} hidden />
      </div>
    </div>
  );
};

WebGLView.propTypes = {
  width: PropTypes.number.isRequired,
  height: PropTypes.number.isRequired,
  SpritzProvider: PropTypes.object.isRequired,
  class: PropTypes.string.isRequired,
};

export default WebGLView;
