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

import Editor from '@monaco-editor/react';

// RSuite UI Library
import { Panel, Row, Col, Container } from 'rsuite';

class ScriptEditor extends Component {
  constructor(props) {
    super(props);
    this.state = {
      content: props.content || 'please start your edits :)',
      lang: props.lang || 'lua',
      type: props.type || 'script-only',
    };
    this.saveChanges = this.saveChanges.bind(this);
  }

  componentWillReceiveProps(nextProps) {
    if (this.props != nextProps) {
      this.setState({
        content: nextProps.content,
      });
    }
  }

  // Write Content Back out to File
  async saveChanges() {
    // todo --> 
    console.log('todo - Save Changes');
  }

  render() {
    const { content } = this.state;
    let res = null;
    let size = this.state.type === 'script-only' ? 24 : 12;

    return (
      <Container>
        <Row>
          <Col sm={size} md={size} lg={size}>
            <Panel
              bordered
              bodyFill
              style={{
                height: '86vh',
                overflow: 'overlay',
                background: '#121216',
                width: '100%',
              }}
            >
              <Container style={{ minHeight: '80vh' }}>
                <Editor theme="vs-dark" height="86vh" defaultLanguage={this.state.lang} defaultValue="" />
              </Container>
            </Panel>
          </Col>
          {this.state.type === 'script-only' ? null : (
            <Col sm={12} md={12} lg={12}>
              <Panel
                bordered
                style={{
                  height: '86vh',
                  overflow: 'overlay',
                  background: '#121216',
                  width: '100%',
                }}
              >
                {content}
              </Panel>
            </Col>
          )}
        </Row>
        <Row style={{padding:'10px'}}>
          <button onClick={() => this.saveChanges()}>Save Changes</button>
        </Row>
      </Container>
    );
  }
}

export default collect(ScriptEditor);
