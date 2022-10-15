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
  const viewRef = useRef();
  const previewRef = useRef();
  const chunks = []; // recording

  let keyboard = new Keyboard();
  let onKeyEvent = SceneProvider.onKeyEvent;
  let onTouchEvent = SceneProvider.onTouchEvent;
  let engine = null;

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

  useEffect(async () => {
    // handle resize
    window.addEventListener('resize', setDimension);
    // setup canvases
    const canvas = ref.current;
    const hud = hudRef.current;
    const mipmap = mmRef.current;
    const gamepad = gamepadRef.current;

    // streams
    let gameVideo = streamToVideo(ref.current.captureStream());
    let hudVideo = streamToVideo(hudRef.current.captureStream());

    // preview canvas
    let previewCanvas = viewRef.current;
    let context = previewCanvas.getContext('2d');

    // merge hud + canvas into preview (for recording / screen capture)
    (function draw() {
      context.drawImage(gameVideo, 0, 0, previewCanvas.width, previewCanvas.height);
      // 200x150 - 4:3 - update
      let w = 200;
      let h = 150;
      context.drawImage(hudVideo, previewCanvas.width - w, previewCanvas.height - h, w, h);
      requestAnimationFrame(draw);
    })();

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
        <canvas ref={viewRef}></canvas>
      </div>
      <div>
        {/* Preview Video */}
        <video ref={previewRef}></video>
        {/* Recording Video */}
        <video ref={recordingRef}></video>
        {/* Button */}
        <button
          ref={recordBtnRef}
          onClick={() => {
            recordBtnRef.current.textContent = 'stop recording';
            let cStream = viewRef.current.captureStream(30);
            let recorder = new MediaRecorder(cStream);

            // start
            recorder.start();
            recorder.onstart = () => {
              // capture output from merge & preview
              streamToVideo(cStream, previewRef);
            };

            recorder.ondataavailable = (e) => {
              e.data.size && chunks.push(e.data);
            };

            // handle export and display video
            recorder.onstop = function exportStream(e) {
              if (chunks.length) {
                let blob = new Blob(chunks);
                let vidURL = URL.createObjectURL(blob);
                let vid = recordingRef.current;
                vid.controls = true;
                vid.src = vidURL;
                vid.onend = function () {
                  URL.revokeObjectURL(vidURL);
                };
              }
            };

            // stop
            recordBtnRef.current.onclick = () => {
              recordingRef.current.pause();
              recorder.stop();
            };
          }}
        >
          record
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
