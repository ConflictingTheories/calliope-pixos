/*                                                 *\
** ----------------------------------------------- **
**          Calliope - Pixos Game Engine   	       **
** ----------------------------------------------- **
**  Copyright (c) 2020-2023 - Kyle Derby MacInnis  **
**                                                 **
**    Any unauthorized distribution or transfer    **
**       of this work is strictly prohibited.      **
**                                                 **
**               All Rights Reserved.              **
** ----------------------------------------------- **
\*                                                 */

import React, { useEffect, useRef, useState } from 'react';
import PropTypes from 'prop-types';

import glEngine from '@Engine/core/index.jsx';
import { minecraftia } from '@Engine/core/hud.jsx';
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

  // Screen capture from spritz and hud
  function captureVideoStreams(canvas, hud, recorder, cStream, mergeCanvas, mergeContext) {
    // stream video output (single canvas element?)
    cStream = mergeCanvas.captureStream();
    engine.streamToVideo(cStream, previewRef);

    // setup recorder (todo -- move into the engine to access audio streams)
    recorder = new MediaRecorder(cStream);

    // capture streams
    let gameVideo = engine.streamToVideo(canvas.captureStream());
    let hudVideo = engine.streamToVideo(hud.captureStream());

    // merge hud + canvas into preview (for recording / screen capture)
    (function mergeStreams() {
      mergeContext.drawImage(gameVideo, 0, 0, mergeCanvas.width, mergeCanvas.height); // game
      mergeContext.drawImage(hudVideo, 0, 0, mergeCanvas.width, mergeCanvas.height); // hud
      requestAnimationFrame(mergeStreams);
    })();
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

    // merge streams canvas
    const mergeCanvas = mergeCanvasRef.current;
    let mergeContext = mergeCanvas.getContext('2d');

    // Webgl Engine
    engine = new glEngine(canvas, hud, mipmap, gamepad, fileUpload, width, height);

    // screen capture
    // dragElement(previewBoxRef);
    captureVideoStreams(canvas, hud, recorder, cStream, mergeCanvas, mergeContext);

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
  let recordBtnStyle = {
    display: isRecording ? 'none' : 'block',
    position: 'absolute',
    top: 0,
    left: 0,
    zIndex: 100,
    height: '2.5rem',
    padding: '0.5rem',
    opacity: 0.8,
  };
  let showRecordBtnStyle = {
    display: showRecording ? 'none' : 'block',
    position: 'absolute',
    top: 0,
    right: 0,
    zIndex: 100,
    height: '2.5rem',
    padding: '0.5rem',
    opacity: 0.8,
  };

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
        {/* Preview & Recording */}
        <div style={{ display: !showRecording ? 'none' : 'block' }} ref={previewBoxRef}>
          <video style={{ display: isRecording ? 'block' : 'none' }} width={canvasWidth / 2} height={canvasHeight / 2} ref={previewRef}></video>
          <video style={{ display: isRecording ? 'none' : 'block' }} width={canvasWidth / 2} height={canvasHeight / 2} ref={recordingRef}></video>
        </div>
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
        {/* Recording Buttons - todo - style and include video controls */}
        <button style={recordBtnStyle} ref={recordBtnRef} onClick={() => startRecording(cStream, recorder)}>
          Record Gameplay
        </button>
        <button style={{ ...recordBtnStyle, display: isRecording ? 'block' : 'none' }} ref={recordBtnRef} onClick={() => stopRecording(recorder)}>
          Stop Recording
        </button>
        <button style={{ ...showRecordBtnStyle }} ref={previewBtnRef} onClick={() => showPreview()}>
          Show Recording
        </button>
        <button style={{ ...showRecordBtnStyle, display: showRecording ? 'block' : 'none' }} ref={previewBtnRef} onClick={() => hidePreview()}>
          Show Game
        </button>
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
