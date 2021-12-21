/*                                                 *\
** ----------------------------------------------- **
**             Calliope - Site Generator   	       **
** ----------------------------------------------- **
**  Copyright (c) 2020-2021 - Kyle Derby MacInnis  **
**                                                 **
**    Any unauthorized distribution or transfer    **
**       of this work is strictly prohibited.      **
**                                                 **
**               All Rights Reserved.              **
** ----------------------------------------------- **
\*                                                 */

import React, { useEffect, useRef, useState } from "react";
import PropTypes from "prop-types";
import glEngine from "../engine/core/index.jsx";
import Keyboard from "../engine/utils/keyboard.jsx";
import { minecraftia } from "../engine/core/hud.jsx";
//
const WebGLView = ({ width, height, SceneProvider, class: string }) => {
  // Canvas
  const ref = useRef();
  const hudRef = useRef();
  const gamepadRef = useRef();
  const mmRef = useRef();
  let keyboard = new Keyboard();
  let onKeyEvent = SceneProvider.onKeyEvent;
  let onTouchEvent = SceneProvider.onTouchEvent;

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

  useEffect(async () => {
    // handle resize
    window.addEventListener("resize", setDimension);
    // setup canvases
    const canvas = ref.current;
    const hud = hudRef.current;
    const mipmap = mmRef.current;
    const gamepad = gamepadRef.current;
    // Webgl Engine
    const engine = new glEngine(canvas, hud, mipmap, gamepad, width, height);
    // load fonts
    await loadFonts();
    // Initialize Scene
    await engine.init(SceneProvider, keyboard);
    // render loop
    engine.render();
    // cleanup
    return () => {
      window.removeEventListener("resize", setDimension);
      engine.close();
    };
  }, [SceneProvider]);

  return (
    <div
      style={{
        position: "relative",
        padding: "none",
        background: "slategrey",
        width: "100%",
        maxWidth: width,
        maxHeight: height + 200,
      }}
      onKeyDownCapture={(e) => onKeyEvent(e.nativeEvent)}
      onKeyUpCapture={(e) => onKeyEvent(e.nativeEvent)}
      tabIndex={0}
    >
      {/* // WEBGL - For 3D Rendering */}
      <canvas
        style={{ position: "absolute", zIndex: 1, top: 0, left: 0 }}
        ref={ref}
        maxWidth={800}
        maxHeight={600}
        width={screenSize.dynamicWidth > 800 ? 800 : screenSize.dynamicWidth}
        height={(screenSize.dynamicWidth * 3) / 4 > 600 ? 600 : (screenSize.dynamicWidth * 3) / 4}
        className={string}
      />
      {/* HUD - For Dialogue / Menus / Overlays */}
      <canvas
        style={{ position: "absolute", zIndex: 2, top: 0, left: 0, background: "none" }}
        ref={hudRef}
        maxWidth={800}
        maxHeight={600}
        width={screenSize.dynamicWidth > 800 ? 800 : screenSize.dynamicWidth}
        height={(screenSize.dynamicWidth * 3) / 4 > 600 ? 600 : (screenSize.dynamicWidth * 3) / 4}
        className={string}
      />
      {/* Gamepad - For controls on Mobile Only*/}
      <canvas
        style={{ position: "relative", zIndex: 5, top: 0, left: 0, background: "none" }}
        ref={gamepadRef}
        maxWidth={800}
        maxHeight={600}
        width={screenSize.dynamicWidth > 800 ? 800 : screenSize.dynamicWidth}
        height={(screenSize.dynamicWidth * 3) / 4 > 600 ? 800 : (screenSize.dynamicWidth * 3) / 4 + 200}
        className={string}
        onMouseUp={(e) => onTouchEvent(e.nativeEvent)}
        onMouseDown={(e) => onTouchEvent(e.nativeEvent)}
        onMouseMove={(e) => onTouchEvent(e.nativeEvent)}
        onTouchMoveCapture={(e) => {
          e.preventDefault();
          onTouchEvent(e.nativeEvent);
        }}
        onTouchCancelCapture={(e) => {
          e.preventDefault();
          onTouchEvent(e.nativeEvent);
        }}
        onTouchStartCapture={(e) => {
          e.preventDefault();
          onTouchEvent(e.nativeEvent);
        }}
        onTouchEndCapture={(e) => {
          e.preventDefault();
          onTouchEvent(e.nativeEvent);
        }}
      />
      {/* MIPMAP - For Sprite Text / Speech / Titles */}
      <canvas style={{ display: "none" }} ref={mmRef} width={256} height={256} />
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
