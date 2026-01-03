/*
 * ---------------------------------------------------------------
 *            PixoSpritz – Editor – Console Panel
 * ---------------------------------------------------------------
 * Copyright (c) 2022-2025  Kyle Derby MacInnis
 *
 * Interactive console panel for script output, debugging, and
 * command execution. Integrates with the Script Editor for
 * real-time feedback during script development.
 */

import React, { useState, useRef, useEffect, useCallback } from 'react';
import './console-panel.css';

/**
 * Console message types for styling
 */
export const ConsoleMessageType = {
  INFO: 'info',
  WARN: 'warn',
  ERROR: 'error',
  SUCCESS: 'success',
  DEBUG: 'debug',
  OUTPUT: 'output',
  COMMAND: 'command',
};

/**
 * ConsolePanel component provides a terminal-like interface for
 * viewing script output, logs, and executing commands.
 *
 * @param {object} props
 * @param {Array} props.messages - Array of console messages to display
 * @param {function(string):void} props.onCommand - Callback when user executes a command
 * @param {boolean} props.isRunning - Whether a script is currently executing
 * @param {function():void} props.onClear - Callback to clear console
 * @param {function():void} props.onStop - Callback to stop script execution
 */
export default function ConsolePanel({
  messages = [],
  onCommand,
  isRunning = false,
  onClear,
  onStop,
}) {
  const [inputValue, setInputValue] = useState('');
  const [commandHistory, setCommandHistory] = useState([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [filter, setFilter] = useState('all');
  const [autoScroll, setAutoScroll] = useState(true);

  const consoleRef = useRef(null);
  const inputRef = useRef(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (autoScroll && consoleRef.current) {
      consoleRef.current.scrollTop = consoleRef.current.scrollHeight;
    }
  }, [messages, autoScroll]);

  // Handle scroll to detect user scrolling up
  const handleScroll = useCallback(() => {
    if (!consoleRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = consoleRef.current;
    const isAtBottom = scrollHeight - scrollTop - clientHeight < 50;
    setAutoScroll(isAtBottom);
  }, []);

  /**
   * Execute entered command
   */
  const executeCommand = useCallback(() => {
    const command = inputValue.trim();
    if (!command) return;

    // Add to history
    setCommandHistory(prev => [...prev, command]);
    setHistoryIndex(-1);
    setInputValue('');

    // Execute callback
    if (onCommand) {
      onCommand(command);
    }
  }, [inputValue, onCommand]);

  /**
   * Handle keyboard navigation in input
   */
  const handleKeyDown = useCallback((e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      executeCommand();
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (commandHistory.length > 0) {
        const newIndex = historyIndex === -1
          ? commandHistory.length - 1
          : Math.max(0, historyIndex - 1);
        setHistoryIndex(newIndex);
        setInputValue(commandHistory[newIndex] || '');
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (historyIndex >= 0) {
        const newIndex = historyIndex + 1;
        if (newIndex >= commandHistory.length) {
          setHistoryIndex(-1);
          setInputValue('');
        } else {
          setHistoryIndex(newIndex);
          setInputValue(commandHistory[newIndex] || '');
        }
      }
    } else if (e.key === 'l' && e.ctrlKey) {
      e.preventDefault();
      if (onClear) onClear();
    }
  }, [executeCommand, commandHistory, historyIndex, onClear]);

  /**
   * Filter messages based on selected type
   */
  const filteredMessages = messages.filter(msg => {
    if (filter === 'all') return true;
    if (filter === 'errors') return msg.type === ConsoleMessageType.ERROR;
    if (filter === 'warnings') return msg.type === ConsoleMessageType.WARN;
    if (filter === 'debug') return msg.type === ConsoleMessageType.DEBUG;
    return true;
  });

  /**
   * Format timestamp for display
   */
  const formatTime = (timestamp) => {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', {
      hour12: false,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      fractionalSecondDigits: 3,
    });
  };

  /**
   * Get icon for message type
   */
  const getIcon = (type) => {
    switch (type) {
      case ConsoleMessageType.ERROR: return '✖';
      case ConsoleMessageType.WARN: return '⚠';
      case ConsoleMessageType.SUCCESS: return '✔';
      case ConsoleMessageType.DEBUG: return '🔍';
      case ConsoleMessageType.COMMAND: return '>';
      case ConsoleMessageType.OUTPUT: return '←';
      default: return 'ℹ';
    }
  };

  return (
    <div className="console-panel">
      {/* Toolbar */}
      <div className="console-toolbar">
        <div className="console-toolbar-left">
          <span className="console-title">Console</span>
          {isRunning && (
            <span className="console-running">
              <span className="spinner" /> Running...
            </span>
          )}
        </div>

        <div className="console-toolbar-center">
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="console-filter"
          >
            <option value="all">All Messages</option>
            <option value="errors">Errors Only</option>
            <option value="warnings">Warnings Only</option>
            <option value="debug">Debug Only</option>
          </select>
        </div>

        <div className="console-toolbar-right">
          <button
            className="console-btn"
            onClick={() => setAutoScroll(!autoScroll)}
            title={autoScroll ? 'Disable auto-scroll' : 'Enable auto-scroll'}
          >
            {autoScroll ? '⬇' : '⏸'}
          </button>
          {isRunning && onStop && (
            <button
              className="console-btn console-btn-stop"
              onClick={onStop}
              title="Stop execution"
            >
              ■
            </button>
          )}
          {onClear && (
            <button
              className="console-btn"
              onClick={onClear}
              title="Clear console (Ctrl+L)"
            >
              🗑
            </button>
          )}
        </div>
      </div>

      {/* Messages */}
      <div
        ref={consoleRef}
        className="console-messages"
        onScroll={handleScroll}
      >
        {filteredMessages.length === 0 ? (
          <div className="console-empty">
            <span className="console-empty-icon">📝</span>
            <span>No console output yet.</span>
            <span className="console-hint">Run a script or enter a command below.</span>
          </div>
        ) : (
          filteredMessages.map((msg, idx) => (
            <div
              key={msg.id || idx}
              className={`console-message console-${msg.type || 'info'}`}
            >
              <span className="console-icon">{getIcon(msg.type)}</span>
              <span className="console-time">{formatTime(msg.timestamp)}</span>
              <span className="console-text">
                {msg.source && (
                  <span className="console-source">[{msg.source}]</span>
                )}
                {msg.text}
              </span>
              {msg.line && (
                <span className="console-line">Line {msg.line}</span>
              )}
            </div>
          ))
        )}
      </div>

      {/* Input */}
      <div className="console-input-container">
        <span className="console-prompt">{'>'}</span>
        <input
          ref={inputRef}
          type="text"
          className="console-input"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Enter command or Lua expression..."
          disabled={isRunning}
        />
        <button
          className="console-run-btn"
          onClick={executeCommand}
          disabled={isRunning || !inputValue.trim()}
          title="Execute (Enter)"
        >
          ▶
        </button>
      </div>
    </div>
  );
}

/**
 * Hook for managing console state
 */
export function useConsole() {
  const [messages, setMessages] = useState([]);
  const [isRunning, setIsRunning] = useState(false);
  const messageIdRef = useRef(0);

  const log = useCallback((text, type = ConsoleMessageType.INFO, options = {}) => {
    const message = {
      id: ++messageIdRef.current,
      text: String(text),
      type,
      timestamp: Date.now(),
      ...options,
    };
    setMessages(prev => [...prev, message]);
    return message.id;
  }, []);

  const info = useCallback((text, options) => log(text, ConsoleMessageType.INFO, options), [log]);
  const warn = useCallback((text, options) => log(text, ConsoleMessageType.WARN, options), [log]);
  const error = useCallback((text, options) => log(text, ConsoleMessageType.ERROR, options), [log]);
  const success = useCallback((text, options) => log(text, ConsoleMessageType.SUCCESS, options), [log]);
  const debug = useCallback((text, options) => log(text, ConsoleMessageType.DEBUG, options), [log]);

  const output = useCallback((text, options) => {
    return log(text, ConsoleMessageType.OUTPUT, options);
  }, [log]);

  const command = useCallback((text) => {
    return log(text, ConsoleMessageType.COMMAND, {});
  }, [log]);

  const clear = useCallback(() => {
    setMessages([]);
  }, []);

  const startExecution = useCallback(() => {
    setIsRunning(true);
  }, []);

  const stopExecution = useCallback(() => {
    setIsRunning(false);
  }, []);

  return {
    messages,
    isRunning,
    log,
    info,
    warn,
    error,
    success,
    debug,
    output,
    command,
    clear,
    startExecution,
    stopExecution,
  };
}
