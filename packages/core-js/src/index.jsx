/*                                                 *\
** ----------------------------------------------- **
**          Calliope - Pixos Game Engine   	       **
** ----------------------------------------------- **
**  Copyright (c) 2020-2025 - Kyle Derby MacInnis  **
**                                                 **
** PixoSpritz Dual License - see LICENSE.          **
** Free for education, non-commercial use, and     **
** individual non-profit artists (CC-BY-NC-SA-4.0) **
** Commercial use requires a purchased license.    **
** ----------------------------------------------- **
\*                                                 */

import React, { Component } from 'react';
import { collect } from 'react-recollect';
// WebGL Component
import WebGLView from '@Components/WebGLView.jsx';
// Pixos Spritz Provider
import SpritzProvider from '@Spritz/player.js';
// Style Plugin
import './css/pixos.css';

class Pixos extends Component {
  constructor(props) {
    super(props);
    this.state = {
      spritz: new SpritzProvider(),
      updated: Date.now(),
      zipData: props.zipData,
    };
  }

  // Update world on Edit - convert to static lifecycle method
  static getDerivedStateFromProps(nextProps, prevState) {
    if (JSON.stringify(prevState.networkString) !== JSON.stringify(nextProps.networkString)) {
      return {
        networkString: nextProps.networkString,
        updated: Date.now(),
      };
    }
    return null;
  }

  // Render World as Passed in String or FlatLand (Default)
  render() {
    const { updated, spritz, zipData } = this.state;
    return (
      <div style={{ margin: 0, minHeight: '480px', maxHeight: '1080px' }}>
        <WebGLView
          class="pixos"
          key={`pixos-${updated}`}
          width={480}
          height={640}
          SpritzProvider={spritz}
          zipData={zipData ?? ''}
          manifest={this.props.manifest}
        />
      </div>
    );
  }
}

export default collect(Pixos);
