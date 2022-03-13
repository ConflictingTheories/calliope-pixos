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

import React, { Component } from "react";
import { collect } from "react-recollect";
// WebGL Component
import WebGLView from "@Components/WebGLView.jsx";
// Pixos Scene Provider
import SceneProvider from "@Scenes/peacefulGarden/index.jsx";
// Style Plugin
import "../less/pixos.css";

class Pixos extends Component {
  constructor(props) {
    super(props);
    this.state = {
      scene: new SceneProvider(),
      updated: Date.now(),
    };
  }

  // Update world on Edit
  componentWillReceiveProps(nextProps) {
    if (JSON.stringify(this.props.networkString) != JSON.stringify(nextProps.networkString)) {
      this.setState({
        networkString: nextProps.networkString,
        updated: Date.now(),
      });
    }
  }

  // Render World as Passed in String or FlatLand (Default)
  render() {
    const { updated, scene } = this.state;
    return (
      <div style={{ margin: 0, minHeight: "480px", maxHeight: "100vh" }}>
        <WebGLView class="pixos" key={`pixos-${updated}`} width={window.innerWidth} height={window.innerHeight} SceneProvider={scene} />
      </div>
    );
  }
}

export default collect(Pixos);
