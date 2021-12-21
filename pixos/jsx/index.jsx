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

import React, { Component } from "react";
import { collect } from "react-recollect";
// WebGL Component
import WebGLView from "./components/WebGLView.jsx";
// Pixos Scene Provider
import SceneProvider from "./scene/index.jsx";
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
    console.log(nextProps);
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
      <>
        <WebGLView class="pixos" key={`pixos-${updated}`} width={640} height={480} SceneProvider={scene} />
      </>
    );
  }
}

export default collect(Pixos);
