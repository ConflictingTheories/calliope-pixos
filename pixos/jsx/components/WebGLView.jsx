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

import React, { useEffect, useRef } from "react";
import PropTypes from "prop-types";
import glEngine from "../engine/core/index.jsx";
import { Mouse } from "../engine/utils/enums.jsx";
import Keyboard from "../engine/utils/keyboard.jsx";
import { minecraftia } from "../engine/core/hud.jsx";
import MobileTouch from "../engine/utils/mobile.jsx";
//
const WebGLView = ({ width, height, SceneProvider, class: string }) => {
  const ref = useRef();
  const hudRef = useRef();
  const gamepadRef = useRef();
  const mmRef = useRef();
  let keyboard = new Keyboard();
  let touchHandler = new MobileTouch();
  let onKeyEvent = SceneProvider.onKeyEvent;
  let onTouchEvent = SceneProvider.onTouchEvent;

  // load fonts
  async function loadFonts() {
    await minecraftia.load();
    document.fonts.add(minecraftia);
  }

  useEffect(async () => {
    const canvas = ref.current;
    const hud = hudRef.current;
    const mipmap = mmRef.current;
    const gamepad = gamepadRef.current;
    // Webgl Engine
    const engine = new glEngine(canvas, hud, mipmap, gamepad, width, height);
    // load fonts
    await loadFonts();
    // Initialize Scene
    await engine.init(SceneProvider, keyboard, touchHandler);
    // render loop
    engine.render();
    // cleanup
    return () => {
      engine.close();
    };
  }, [SceneProvider]);

  return (
    <div
      style={{ position: "relative", padding:'none' }}
      onKeyDownCapture={(e) => onKeyEvent(e.nativeEvent)}
      onKeyUpCapture={(e) => onKeyEvent(e.nativeEvent)}
      tabIndex={0}
    >
      {/* // WEBGL - For 3D Rendering */}
      <canvas
        style={{ position: "absolute", zIndex: 1, top: 0, left: 0 }}
        ref={ref}
        width={width}
        height={height}
        className={string}
      />
      {/* HUD - For Dialogue / Menus / Overlays */}
      <canvas
        style={{ position: "absolute", zIndex: 2, top: 0, left: 0, background: "none" }}
        ref={hudRef}
        width={width}
        height={height}
        className={string}
      />
      {/* Gamepad - For controls on Mobile Only*/}
      <canvas
        style={{position: "absolute", zIndex: 5, top: 0, left: 0, background: "none" }}
        ref={gamepadRef}
        width={width}
        height={height + 200}
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
