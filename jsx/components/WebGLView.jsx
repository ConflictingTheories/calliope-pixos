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
import glEngine from "../engine/core.jsx";
import { Mouse } from "../engine/utils/enums.jsx";
import Keyboard from "../engine/utils/keyboard.jsx";
import { minecraftia } from "../engine/hud.jsx";
//
const WebGLView = ({ width, height, SceneProvider, class: string }) => {
  const ref = useRef();
  const hudRef = useRef();
  let keyboard = new Keyboard();
  let onMouseEvent = SceneProvider.onMouseEvent;
  let onKeyEvent = SceneProvider.onKeyEvent;

  useEffect(async () => {
    const canvas = ref.current;
    const hud = hudRef.current;
    // Webgl Engine
    const engine = new glEngine(canvas, hud, width, height);
    // load fonts
    await minecraftia.load();
    document.fonts.add(minecraftia);
    // Initialize Scene
    await engine.init(SceneProvider, keyboard);
    // render loop
    engine.render();
    // cleanup
    return () => {
      engine.close();
    };
  }, [SceneProvider]);

  return (
    <div         style={{ position:'relative' }}
    >
    {/* // WEBGL */}
    <canvas
        style={{ position:'absolute', zIndex: 1, top: 0, left: 0}}
        ref={ref}
        width={width}
        height={height}
        className={string}
      />
      {/* HUD */}
      <canvas
        style={{ zIndex: 2, top: 0, left: 0, background:'none' }}
        tabIndex={0}
        ref={hudRef}
        width={width}
        height={height}
        className={string}
        onKeyDownCapture={(e) => onKeyEvent(e.nativeEvent)}
        onKeyUpCapture={(e) => onKeyEvent(e.nativeEvent)}
        onContextMenu={(e) => onMouseEvent(e.nativeEvent.clientX, e.nativeEvent.clientY, Mouse.UP, true, e)}
        onMouseUp={(e) =>
          onMouseEvent(e.nativeEvent.clientX, e.nativeEvent.clientY, Mouse.UP, e.nativeEvent.button == 3, e)
        }
        onMouseDown={(e) =>
          onMouseEvent(e.nativeEvent.clientX, e.nativeEvent.clientY, Mouse.DOWN, e.nativeEvent.button == 3, e)
        }
        onMouseMove={(e) =>
          onMouseEvent(e.nativeEvent.clientX, e.nativeEvent.clientY, Mouse.MOVE, e.nativeEvent.button == 3, e)
        }
      />
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
