/*                                                 *\
** ----------------------------------------------- **
**             Pixospritz - Editor   	             **
** ----------------------------------------------- **
**  Copyright (c) 2022-2025 - Kyle Derby MacInnis  **
**                                                 **
**    Any unauthorized distribution or transfer    **
**       of this work is strictly prohibited.      **
**                                                 **
**               All Rights Reserved.              **
** ----------------------------------------------- **
\*                                                 */

import React, { Component } from 'react';
import { collect, store } from 'react-recollect';

class ImagePreview extends Component {
  constructor(props) {
    super(props);
    this.state = {
      src: props?.src || '',
      content: props?.content || null,
    };
  }

  componentWillReceiveProps(nextProps) {
    if (this.props != nextProps) {
      this.setState({
        content: nextProps.content,
        src: nextProps.src,
      });
    }
  }

  async componentDidMount() {
    // TODO -- Fetch image based on src from zip
    //
    // ie) if external image src is provided.

    //Fetch Source and Render Content
    if (this.state.src && this.state.src !== '') {
      const response = await fetch('/content/' + this.state.src);
      // 2) filter on 200 OK
      if (response.status === 200 || response.status === 0) {
        let content = (await response.blob()).readAsDataURL(b);
        this.setState({ content });
      } else {
        return Promise.reject(new Error(response.statusText));
      }
    }
  }

  componentWillUnmount() {}

  render() {
    const { content } = this.state;
    let res = null;
    try {
      res = (
        <React.Fragment>
          <hr />
            <img src={content} />
          <hr />
        </React.Fragment>
      );
    } catch (e) {
      console.error(e);
    }
    return res;
  }
}

export default collect(ImagePreview);
