/*                                                 *\
** ----------------------------------------------- **
**          Calliope - Pixos Game Engine   	       **
** ----------------------------------------------- **
**  Copyright (c) 2020-2022 - Kyle Derby MacInnis  **
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
import Keyboard from '@Engine/utils/keyboard.jsx';
import { minecraftia } from '@Engine/core/hud.jsx';
//
const WebGLView = ({ width, height, SceneProvider, class: string }) => {
  // Canvas
  const ref = useRef();
  const hudRef = useRef();
  const gamepadRef = useRef();
  const mmRef = useRef();
  const recordBtnRef = useRef();
  const recordingRef = useRef();
  const mergeCanvasRef = useRef();
  const previewRef = useRef();
  const chunks = []; // recording

  // keyboard & touch
  let keyboard = new Keyboard();
  let onKeyEvent = SceneProvider.onKeyEvent;
  let onTouchEvent = SceneProvider.onTouchEvent;
  let engine = null;

  // recording stream & media tracks
  let [isRecording, setRecording] = useState(false);
  let [recorder, setRecorder] = useState();
  let [cStream, setStream] = useState();

  // Resize
  const [screenSize, getDimension] = useState({
    dynamicWidth: window.innerWidth,
    dynamicHeight: window.innerHeight,
  });

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

  // convert stream to video
  function streamToVideo(stream, ref) {
    let video = document.createElement('video');
    if (ref) {
      video = ref.current;
    }
    video.srcObject = stream;
    video.style.width = stream.width;
    video.style.height = stream.height;
    video.play();
    return video;
  }

  // stop recording and display recording
  function stopRecording(recorder) {
    recordingRef.current.pause();
    recorder?.stop();
  }

  // record gameplay to video stream
  function startRecording(cStream, recorder) {
    setRecorder(recorder);
    setStream(cStream);

    // start
    recorder.start();
    recorder.onstart = () => {
      setRecording(true);
      streamToVideo(cStream, previewRef);
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

  // Provide Draggable Preview to move window around
  function dragElement(ref) {
    try {
      let pos1 = 0,
        pos2 = 0,
        pos3 = 0,
        pos4 = 0;

      ref.current.onmousedown = dragMouseDown;

      function dragMouseDown(e) {
        e.preventDefault();
        pos3 = e.clientX;
        pos4 = e.clientY;
        ref.current.onmouseup = closeDragElement;
        ref.current.onmousemove = elementDrag;
      }

      function elementDrag(e) {
        e.preventDefault();
        pos1 = pos3 - e.clientX;
        pos2 = pos4 - e.clientY;
        pos3 = e.clientX;
        pos4 = e.clientY;
        ref.current.style.top = ref.current.offsetTop - pos2 + 'px';
        ref.current.style.left = ref.current.offsetLeft - pos1 + 'px';
      }

      function closeDragElement() {
        ref.current.onmouseup = null;
        ref.current.onmousemove = null;
      }
    } catch (e) {
      console.error(e);
    }
  }

  useEffect(async () => {
    // handle resize
    window.addEventListener('resize', setDimension);
    // setup canvases
    const canvas = ref.current;
    const hud = hudRef.current;
    const mipmap = mmRef.current;
    const gamepad = gamepadRef.current;

    // merge streams canvas
    const mergeCanvas = mergeCanvasRef.current;
    let mergeContext = mergeCanvas.getContext('2d');

    cStream = mergeCanvas.captureStream(30);
    recorder = new MediaRecorder(cStream);
    
    // streams
    let gameVideo = streamToVideo(canvas.captureStream());
    let hudVideo = streamToVideo(hud.captureStream());
    
    // merge hud + canvas into preview (for recording / screen capture)
    (function mergeStreams() {
      mergeContext.drawImage(gameVideo, 0, 0, mergeCanvas.width, mergeCanvas.height);
      mergeContext.drawImage(hudVideo, 0, 0, mergeCanvas.width, mergeCanvas.height);
      requestAnimationFrame(mergeStreams);
    })();

    // allow dragging preview around
    dragElement(previewRef);

    // Webgl Engine
    engine = new glEngine(canvas, hud, mipmap, gamepad, width, height);

    // load fonts
    await loadFonts();

    // Initialize Scene
    await engine.init(SceneProvider, keyboard);

    // render loop
    engine.render();

    // cleanup
    return () => {
      window.removeEventListener('resize', setDimension);
      engine.close();
    };
  }, [SceneProvider]);

  let canvasHeight = (screenSize.dynamicWidth * 3) / 4 > 900 ? 900 : screenSize.dynamicHeight - 200;
  let canvasWidth = screenSize.dynamicWidth > 1440 ? 1440 : screenSize.dynamicWidth;
  let showGamepad = screenSize.dynamicWidth <= 900;

  return (
    <div>
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
          height={canvasHeight + 200}
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
        {/* Movie Preview Canvas / Recording */}
        <canvas width={canvasWidth} height={canvasHeight} ref={mergeCanvasRef} style={{ display: 'none' }}></canvas>
      </div>
      <div>
        {/* Preview Video */}
        <video style={{ position: 'absolute', zIndex: 10000 }} ref={previewRef}></video>
        {/* Recording Video */}
        <video style={{ display: isRecording ? 'none' : 'block' }} ref={recordingRef}></video>
        {/* Recording Buttons */}
        <button style={{ display: isRecording ? 'none' : 'block' }} ref={recordBtnRef} onClick={() => startRecording(cStream, recorder)}>
          Record Gameplay
        </button>
        <button style={{ display: isRecording ? 'block' : 'none' }} ref={recordBtnRef} onClick={() => stopRecording(recorder)}>
          Stop Recording
        </button>
      </div>
    </div>
  );
};

WebGLView.propTypes = {
  width: PropTypes.number.isRequired,
  height: PropTypes.number.isRequired,
  SceneProvider: PropTypes.object.isRequired,
  class: PropTypes.string.isRequired,
};

export default WebGLView;
