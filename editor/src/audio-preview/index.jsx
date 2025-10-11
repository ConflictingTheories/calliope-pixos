/*
 * ---------------------------------------------------------------
 *                 Pixospritz – Editor – Audio Preview
 * ---------------------------------------------------------------
 * Copyright (c) 2022‑2025  Kyle Derby MacInnis
 *
 * This component provides a simple audio player for previewing
 * sound effects and music contained within a Pixospritz package.
 * Given a data URI encoded audio file, the component renders
 * an HTML5 audio element with playback controls.  If no audio
 * content is provided the component will render nothing.
 */

import React, { Component } from 'react';
import { collect } from 'react-recollect';

/**
 * AudioPreview displays an audio element for a provided data URI.
 *
 * Props:
 *  - content (string): A data URI containing the encoded audio
 *    file.  Supported formats include mp3, wav and ogg.  If
 *    content is undefined or null the component will render
 *    nothing.
 */
class AudioPreview extends Component {
  constructor(props) {
    super(props);
          console.log({props})

    this.state = {
      content: props?.content || null,
    };
  }

  componentWillReceiveProps(nextProps) {
    if (this.props !== nextProps) {
      console.log({nextProps})
      this.setState({ content: nextProps.content });
    }
  }

  render() {
    const { content } = this.state;
    if (!content) {
      return null;
    }
    return (
      <div style={{ padding: '1rem' }}>
        <hr />
        <audio
          controls
          src={content}
          style={{ width: '100%' }}
        >
          Your browser does not support the <code>audio</code> element.
        </audio>
        <hr />
      </div>
    );
  }
}

export default collect(AudioPreview);