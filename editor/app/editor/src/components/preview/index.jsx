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

import htmlParser from 'react-markdown/plugins/html-parser';
import Pixos from 'pixos-pixos';

const PixosPlayer = Pixos['pixos-pixos'].default;

const parseHtml = htmlParser({
  isValidNode: (node) => node.type !== 'script',
  processingInstructions: [
    /* ... */
  ],
});
class MarkdownPreview extends Component {
  constructor(props) {
    super(props);
    this.state = {
      src: props?.src || '',
      content: null,
    };
  }

  async componentDidMount() {
    // TODO -- Fetch zip based on src provider from router
    //
    // ie) if external zip src is provided.

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
        <React.Fragment className="pixos-preview">
          <hr />
          <PixosPlayer zipData={content} />
          <hr />
        </React.Fragment>
      );
    } catch (e) {
      console.error(e);
    }
    return res;
  }
}

export default collect(MarkdownPreview);
