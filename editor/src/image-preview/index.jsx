/*
 * ---------------------------------------------------------------
 *                 Pixospritz – Editor – Image Preview
 * ---------------------------------------------------------------
 * Copyright (c) 2022‑2025  Kyle Derby MacInnis
 *
 * This component simply renders an image using a provided data
 * URI.  It receives the encoded image via the `content` prop
 * and updates whenever that prop changes.  If no content is
 * provided the component renders nothing.  Wrapping markup is
 * styled with horizontal rules and padding to match the other
 * preview components.
 */

import React, { Component } from 'react';
import { collect } from 'react-recollect';

class ImagePreview extends Component {
  constructor(props) {
    super(props);
    this.state = {
      content: props?.content || null,
    };
  }

  componentWillReceiveProps(nextProps) {
    if (this.props.content !== nextProps.content) {
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
        <img src={content} style={{ maxWidth: '100%' }} />
        <hr />
      </div>
    );
  }
}

export default collect(ImagePreview);