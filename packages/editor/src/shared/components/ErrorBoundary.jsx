/*
 * ---------------------------------------------------------------
 *           PixoSpritz – Editor – ErrorBoundary
 * ---------------------------------------------------------------
 * Copyright (c) 2022-2025  Kyle Derby MacInnis
 *
 * (UX Phase 2, backlog 2.1 / finding A1.2) Per-tool crash
 * containment.  A crash in any tool (malformed asset preview,
 * script editor blowup) shows a crash card for that tool instead
 * of white-screening the entire app and losing unsaved work.
 *
 * Usage:
 *   <ErrorBoundary toolName="Sprite editor" onReset={...}>
 *     <SpriteEditorTool ... />
 *   </ErrorBoundary>
 */

import React from 'react';
import { Button } from '../../ui';
import './ErrorBoundary.css';

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({ errorInfo });
    // Report to the debug logger; the app stays alive.
    if (typeof console !== 'undefined' && console.error) {
      console.error(`[ErrorBoundary:${this.props.toolName || 'tool'}]`, error, errorInfo);
    }
    if (typeof this.props.onError === 'function') {
      this.props.onError(error, errorInfo);
    }
  }

  handleReset = () => {
    this.setState({ error: null, errorInfo: null });
    if (typeof this.props.onReset === 'function') {
      this.props.onReset();
    }
  };

  render() {
    const { error, errorInfo } = this.state;
    if (!error) return this.props.children;

    const toolName = this.props.toolName || 'This tool';
    return (
      <div className="error-boundary" role="alert" aria-live="assertive">
        <div className="error-boundary__card">
          <div className="error-boundary__icon" aria-hidden="true">⚠</div>
          <h3 className="error-boundary__title">{toolName} ran into a problem</h3>
          <p className="error-boundary__message">
            The tool crashed, but the rest of the editor is fine and your
            open documents are untouched.
          </p>
          <div className="error-boundary__actions">
            <Button appearance="primary" onClick={this.handleReset}>
              Reload tool
            </Button>
            <Button
              appearance="ghost"
              onClick={() => {
                const body = encodeURIComponent(
                  `Tool: ${toolName}\nError: ${error && error.message}\n\n${(errorInfo && errorInfo.componentStack) || ''}`
                );
                window.open(
                  `https://github.com/ConflictingTheories/calliope-pixos/issues/new?title=${encodeURIComponent(`[editor crash] ${toolName}`)}&body=${body}`,
                  '_blank',
                  'noopener'
                );
              }}
            >
              Report issue
            </Button>
          </div>
          <details className="error-boundary__details">
            <summary>Technical details</summary>
            <pre className="error-boundary__stack">
              {String((error && error.stack) || (error && error.message) || error)}
            </pre>
          </details>
        </div>
      </div>
    );
  }
}

export default ErrorBoundary;
