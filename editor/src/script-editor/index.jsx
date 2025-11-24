/*
 * ---------------------------------------------------------------
 *                 Pixospritz – Editor – Script Editor
 * ---------------------------------------------------------------
 * Copyright (c) 2022‑2025  Kyle Derby MacInnis
 *
 * This component provides a text editor for viewing and editing
 * scripts and text files contained within a Pixospritz package.
 * It leverages the Monaco Editor via the @monaco-editor/react
 * wrapper.  The editor supports multiple languages (Lua, JSON,
 * plain text, etc.) and exposes a simple save button to write
 * changes back to the underlying entry.  Saving is currently
 * stubbed out – integration with the zip manager is left as
 * future work.  The component updates its internal state when
 * new props are received and re-renders accordingly.
 */

import React, { Component } from 'react';
import { collect } from 'react-recollect';
import Editor from '@monaco-editor/react';
import { Panel, Row, Col, Container } from 'rsuite';

/**
 * ScriptEditor component allows editing and viewing of script and text files
 * with syntax highlighting and language support via Monaco Editor.
 *
 * @extends React.Component
 */
class ScriptEditor extends Component {
  /**
   * Creates an instance of ScriptEditor.
   * @param {object} props - React props
   * @param {string} props.content - Initial content to display in editor
   * @param {string} props.lang - Programming language identifier for syntax highlighting
   * @param {string} props.type - Layout type; 'script-only' uses full width, otherwise split panes
   * @param {function(string):void} [props.onSave] - Optional callback to save edited content
   */
  constructor(props) {
    super(props);
    /**
     * @type {{content: string, lang: string, type: string}}
     */
    this.state = {
      content: props.content || 'please start your edits :)',
      lang: props.lang || 'lua',
      type: props.type || 'script-only',
    };
    this.saveChanges = this.saveChanges.bind(this);
  }

  /**
   * Update component state when new props arrive.
   * @param {object} nextProps - Incoming props
   */
  componentWillReceiveProps(nextProps) {
    if (this.props !== nextProps) {
      this.setState({
        content: nextProps.content,
        lang: nextProps.lang,
      });
    }
  }

  /**
   * Saves the current content state by invoking the onSave callback if provided.
   */
  async saveChanges() {
    if (this.props.onSave) {
      this.props.onSave(this.state.content);
    } else {
      console.log('TODO: Save changes back into the package');
    }
  }

  /**
   * Renders the ScriptEditor JSX UI.
   * @returns {JSX.Element} Rendered component
   */
  render() {
    const { content, lang, type } = this.state;
    // Determine layout based on the type – when editing scripts only
    // we use the full width; otherwise we show two panes.
    const size = type === 'script-only' ? 24 : 12;
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
                background: 'var(--bg-primary)',
                width: '100%',
              }}
            >
              <Container style={{ minHeight: '80vh' }}>
                <Editor
                  theme="vs-dark"
                  height="86vh"
                  value={content}
                  language={lang}
                  defaultValue={content}
                  onChange={(value) => this.setState({ content: value })}
                />
              </Container>
            </Panel>
          </Col>
          {type === 'script-only' ? null : (
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
        <Row style={{ padding: '10px' }}>
          <button onClick={() => this.saveChanges()}>Save Changes</button>
        </Row>
      </Container>
    );
  }
}

export default collect(ScriptEditor);
