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

  function isRaining() {
    if (engine !== null) {
      console.log(engine);
      return engine.store["garden-tome"].rain;
    } else return true;
  }

  function isSnowing() {
    if (engine !== null) {
      return engine.store["garden-tome"].snow;
    } else return false;
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
    engine = new glEngine(canvas, hud, mipmap, gamepad, width, height);
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

  let canvasHeight = (screenSize.dynamicWidth * 3) / 4 > 768 ? 768 : screenSize.dynamicHeight - 200;

  return (
    <div
      style={{
        position: "relative",
        padding: "none",
        background: "slategrey",
        width: "100%",
        // maxWidth: width,
        // maxHeight: canvasHeight + 200,
      }}
      onKeyDownCapture={(e) => onKeyEvent(e.nativeEvent)}
      onKeyUpCapture={(e) => onKeyEvent(e.nativeEvent)}
      tabIndex={0}
    >
      {/* // WEBGL - For 3D Rendering */}
      <canvas
        style={{
          position: "absolute",
          zIndex: 1,
          top: 0,
          left: 0,
          // maxWidth: 800
          maxHeight: "100vh",
        }}
        ref={ref}
        width={screenSize.dynamicWidth > 1024 ? 1024 : screenSize.dynamicWidth}
        height={canvasHeight}
        className={string}
      />
      {/* HUD - For Dialogue / Menus / Overlays */}
      <canvas
        style={{
          position: "absolute",
          zIndex: 2,
          top: 0,
          left: 0,
          background: "none",
          // maxWidth: 800
          maxHeight: "100vh",
        }}
        ref={hudRef}
        width={screenSize.dynamicWidth > 1024 ? 1024 : screenSize.dynamicWidth}
        height={canvasHeight}
        className={string}
      />
      {/* Gamepad - For controls on Mobile Only*/}
      <canvas
        style={{
          position: "relative",
          zIndex: 5,
          top: 0,
          left: 0,
          background: "none",
          display: screenSize.dynamicWidth <= 768 ? "block" : "none",
          // maxWidth: 800,
          maxHeight: "100vh",
        }}
        ref={gamepadRef}
        hidden={screenSize.dynamicWidth > 768}
        width={screenSize.dynamicWidth > 1024 ? 1024 : screenSize.dynamicWidth}
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
      <canvas style={{ display: "none" }} ref={mmRef} width={256} height={256} />
      {/* RAIN EFFECT  - referenced from https://codepen.io/arickle/pen/XKjMZY*/}
      {isRaining() && (
        <div className="rain back-row">
          {[
            { right: "2%", bottom: "103%", "animation-delay": "0.75s", "animation-duration": "0.575s" },
            { right: "6%", bottom: "107%", "animation-delay": "0.80s", "animation-duration": "0.580s" },
            { right: "13%", bottom: "107%", "animation-delay": "0.55s", "animation-duration": "0.555s" },
            { right: "15%", bottom: "103%", "animation-delay": "0.77s", "animation-duration": "0.577s" },
            { right: "19%", bottom: "107%", "animation-delay": "0.63s", "animation-duration": "0.563s" },
            { right: "24%", bottom: "109%", "animation-delay": "0.63s", "animation-duration": "0.563s" },
            { right: "36%", bottom: "107%", "animation-delay": "0.80s", "animation-duration": "0.580s" },
            { right: "44%", bottom: "107%", "animation-delay": "0.55s", "animation-duration": "0.555s" },
            { right: "23%", bottom: "103%", "animation-delay": "0.27s", "animation-duration": "0.527s" },
            { right: "54%", bottom: "107%", "animation-delay": "0.33s", "animation-duration": "0.533s" },
            { right: "99%", bottom: "109%", "animation-delay": "0.63s", "animation-duration": "0.563s" },
            { right: "9%", bottom: "105%", "animation-delay": "0.13s", "animation-duration": "0.512s" },
            { right: "52%", bottom: "103%", "animation-delay": "0.27s", "animation-duration": "0.527s" },
            { right: "66%", bottom: "107%", "animation-delay": "0.33s", "animation-duration": "0.533s" },
            { right: "28%", bottom: "107%", "animation-delay": "0.55s", "animation-duration": "0.555s" },
            { right: "23%", bottom: "103%", "animation-delay": "0.28s", "animation-duration": "0.528s" },
            { right: "34%", bottom: "107%", "animation-delay": "0.33s", "animation-duration": "0.533s" },
            { right: "99%", bottom: "109%", "animation-delay": "0.63s", "animation-duration": "0.563s" },
            { right: "9%", bottom: "105%", "animation-delay": "0.19s", "animation-duration": "0.519s" },
            { right: "52%", bottom: "103%", "animation-delay": "0.27s", "animation-duration": "0.527s" },
            { right: "66%", bottom: "107%", "animation-delay": "0.21s", "animation-duration": "0.521s" },
            { right: "71%", bottom: "109%", "animation-delay": "0.63s", "animation-duration": "0.563s" },
            { right: "79%", bottom: "103%", "animation-delay": "0.17s", "animation-duration": "0.517s" },
            { right: "85%", bottom: "101%", "animation-delay": "0.11s", "animation-duration": "0.511s" },
            { right: "89%", bottom: "109%", "animation-delay": "0.13s", "animation-duration": "0.512s" },
          ].map((x) => (
            <div className="drop" style={{ ...x }}>
              <div
                className="stem"
                style={{ "animation-delay": x["animation-delay"], "animation-duration": x["animation-duration"] }}
              ></div>
              <div
                className="splat"
                style={{ "animation-delay": x["animation-delay"], "animation-duration": x["animation-duration"] }}
              ></div>
            </div>
          ))}
        </div>
      )}{" "}
      {/* SNOW EFFECT  - referenced from https://codepen.io/arickle/pen/XKjMZY*/}
      {isSnowing() && (
        <div className="snow back-row">
          {[
            { right: "2%", bottom: "103%", "animation-delay": "1.75s", "animation-duration": "1.575s" },
            { right: "6%", bottom: "107%", "animation-delay": "2.80s", "animation-duration": "1.580s" },
            { right: "13%", bottom: "107%", "animation-delay": "1.55s", "animation-duration": "2.555s" },
            { right: "15%", bottom: "103%", "animation-delay": "1.77s", "animation-duration": "1.577s" },
            { right: "19%", bottom: "107%", "animation-delay": "1.63s", "animation-duration": "2.563s" },
            { right: "22%", bottom: "109%", "animation-delay": "1.63s", "animation-duration": "2.563s" },
            { right: "36%", bottom: "107%", "animation-delay": "1.80s", "animation-duration": "1.580s" },
            { right: "44%", bottom: "107%", "animation-delay": "2.55s", "animation-duration": "2.555s" },
            { right: "23%", bottom: "103%", "animation-delay": "1.27s", "animation-duration": "1.527s" },
            { right: "54%", bottom: "107%", "animation-delay": "1.33s", "animation-duration": "1.533s" },
            { right: "45%", bottom: "109%", "animation-delay": "1.63s", "animation-duration": "1.563s" },
            { right: "91%", bottom: "105%", "animation-delay": "1.13s", "animation-duration": "1.512s" },
            { right: "52%", bottom: "103%", "animation-delay": "1.27s", "animation-duration": "1.527s" },
            { right: "66%", bottom: "107%", "animation-delay": "1.33s", "animation-duration": "2.533s" },
            { right: "28%", bottom: "107%", "animation-delay": "1.55s", "animation-duration": "1.555s" },
            { right: "23%", bottom: "103%", "animation-delay": "2.28s", "animation-duration": "2.528s" },
            { right: "34%", bottom: "107%", "animation-delay": "1.33s", "animation-duration": "2.533s" },
            { right: "99%", bottom: "109%", "animation-delay": "1.63s", "animation-duration": "1.563s" },
            { right: "9%", bottom: "105%", "animation-delay": "2.19s", "animation-duration": "1.519s" },
            { right: "52%", bottom: "103%", "animation-delay": "1.27s", "animation-duration": "1.527s" },
            { right: "66%", bottom: "107%", "animation-delay": "1.21s", "animation-duration": "1.521s" },
            { right: "71%", bottom: "109%", "animation-delay": "2.63s", "animation-duration": "1.563s" },
            { right: "79%", bottom: "103%", "animation-delay": "1.17s", "animation-duration": "2.517s" },
            { right: "85%", bottom: "101%", "animation-delay": "1.11s", "animation-duration": "1.511s" },
            { right: "89%", bottom: "109%", "animation-delay": "1.13s", "animation-duration": "2.512s" },
          ].map((x) => (
            <div className="flake" style={{ ...x }}>
              <div
                className="stem"
                style={{ "animation-delay": x["animation-delay"], "animation-duration": x["animation-duration"] }}
              ></div>
            </div>
          ))}
        </div>
      )}{" "}
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
