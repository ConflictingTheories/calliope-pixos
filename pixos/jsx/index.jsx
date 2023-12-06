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

import React, { Component } from 'react';
import { collect } from 'react-recollect';
// WebGL Component
import WebGLView from '@Components/WebGLView.jsx';
// Pixos Spritz Provider
import SpritzProvider from '@Spritz/player.jsx';
// Style Plugin
import '../css/pixos.css';

class Pixos extends Component {
  constructor(props) {
    super(props);
    this.state = {
      spritz: new SpritzProvider(),
      updated: Date.now(),
      zipData: props.zipData,
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
    const { updated, spritz, zipData } = this.state;
    return (
      <div style={{ margin: 0, minHeight: '480px', maxHeight: '1080px' }}>
        <WebGLView class="pixos" key={`pixos-${updated}`} width={'480px'} height={'640px'} SpritzProvider={spritz} zipData={zipData ?? ''} />
      </div>
    );
  }
}

export default collect(Pixos);
