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
  const recordBtnRef = useRef();
  const previewBtnRef = useRef();
  const recordingRef = useRef();
  const mergeCanvasRef = useRef();
  const previewRef = useRef();
  const previewBoxRef = useRef();

  // keyboard & touch
  let onKeyEvent = SpritzProvider.onKeyEvent;
  let onTouchEvent = SpritzProvider.onTouchEvent;
  let engine = null;

  // recording stream & media tracks
  let chunks = []; // recording
  let [isRecording, setRecording] = useState(false);
  let [showRecording, setPreview] = useState(false);
  let [recorder, setRecorder] = useState();
  let [cStream, setStream] = useState();

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

  function stopRecording(recorder) {
    recordingRef.current.pause();
    recorder?.stop();
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
  function startRecording(cStream, recorder) {
    setRecorder(recorder);
    setStream(cStream);

    // start
    recorder.start();
    recorder.onstart = () => {
      setRecording(true);
    };

    // capture output from merge & preview
    recorder.ondataavailable = (e) => {
      e.data.size && chunks.push(e.data);
    };

    // handle export and display video
    recorder.onstop = function exportStream(e) {
      if (chunks.length) {
        setRecording(false);
        // generate blob
        let blob = new Blob(chunks);
        let vidURL = URL.createObjectURL(blob);
        // output recording video
        let vid = recordingRef.current;
        vid.controls = true;
        vid.src = vidURL;
        vid.onend = function () {
          URL.revokeObjectURL(vidURL);
        };
        // clear buffer
        chunks = [];
      }
    };
  }
  function hidePreview() {
    setPreview(false);
  }
  function showPreview() {
    setPreview(true);
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

    // render loop
    engine.render();

    // cleanup
    return () => {
      stopTouchScrolling(canvas);
      stopTouchScrolling(gamepad);
      stopTouchScrolling(hud);
      window.removeEventListener('resize', setDimension);
      engine.close();
    };
  }, [SpritzProvider]);

  let wrapperHeight = (screenSize.dynamicWidth * 3) / 4 > 1080 ? 1080 : screenSize.dynamicHeight;
  let canvasHeight = (screenSize.dynamicWidth * 3) / 4 > 1080 ? wrapperHeight : wrapperHeight - 200;
  let canvasWidth = screenSize.dynamicWidth > 1920 ? 1920 : screenSize.dynamicWidth;
  let showGamepad = screenSize.dynamicWidth <= 900;

  return (
    <div style={{ marginLeft: 'auto', marginRight: 'auto' }}>
      <div
        style={{
          position: 'relative',
          padding: 'none',
          background: 'slategrey',
          height: canvasHeight + 'px',
          width: canvasWidth + 'px',
        }}
        onKeyDownCapture={(e) => onKeyEvent(e.nativeEvent)}
        onKeyUpCapture={(e) => onKeyEvent(e.nativeEvent)}
        tabIndex={0}
      >
        {/* Game */}
        <div style={{ display: showRecording ? 'none' : 'block' }}>
          {/* // WEBGL - For 3D Rendering */}
          <canvas
            style={{
              position: 'absolute',
              zIndex: 1,
              top: 0,
              left: 0,
              maxHeight: '100vh',
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
              maxHeight: '100vh',
            }}
            ref={hudRef}
            width={canvasWidth}
            height={canvasHeight}
            className={string}
            onMouseUp={!showGamepad ? (e) => onTouchEvent(e.nativeEvent) : null}
            onMouseDown={!showGamepad ? (e) => onTouchEvent(e.nativeEvent) : null}
            onMouseMove={!showGamepad ? (e) => onTouchEvent(e.nativeEvent) : null}
          />
          {/* Gamepad - For controls on Mobile Only*/}
          <canvas
            style={{
              position: 'relative',
              zIndex: 5,
              top: 0,
              left: 0,
              background: 'none',
              display: showGamepad ? 'block' : 'none',
              maxHeight: '100vh',
            }}
            ref={gamepadRef}
            hidden={!showGamepad}
            width={canvasWidth}
            height={wrapperHeight}
            className={string}
            onMouseUp={(e) => onTouchEvent(e.nativeEvent)}
            onMouseDown={(e) => onTouchEvent(e.nativeEvent)}
            onMouseMove={(e) => onTouchEvent(e.nativeEvent)}
            onTouchMoveCapture={(e) => onTouchEvent(e.nativeEvent)}
            onTouchCancelCapture={(e) => onTouchEvent(e.nativeEvent)}
            onTouchStartCapture={(e) => onTouchEvent(e.nativeEvent)}
            onTouchEndCapture={(e) => onTouchEvent(e.nativeEvent)}
          />
          {/* MIPMAP - For Sprite Text / Speech / Titles */}
          <canvas style={{ display: 'none' }} ref={mmRef} width={256} height={256} />
          {/* Merged Preview Canvas / Recording Source*/}
          <canvas
            width={canvasWidth}
            height={canvasHeight}
            ref={mergeCanvasRef}
            style={{
              display: 'none',
            }}
          ></canvas>
        </div>
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
