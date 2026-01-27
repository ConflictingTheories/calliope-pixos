/**
 * ---------------------------------------------------------------
 *                 PixoSpritz – BranchingDialogue Component
 * ---------------------------------------------------------------
 * Copyright (c) 2022-2025 Kyle Derby MacInnis
 *
 * Visual branching dialogue editor for cutscenes. Supports:
 * - Dialogue nodes with text
 * - Choice nodes with multiple branches
 * - Condition nodes (if/else logic)
 * - Visual node connections
 * - Preview dialogue flow
 */

import React, { useState, useCallback, useRef, useEffect, useMemo } from 'react';
import { Button, ButtonGroup, Input, Modal, SelectPicker } from '../ui';
import './branching-dialogue.css';

// Node type definitions
const NODE_TYPES = {
  dialogue: { label: 'Dialogue', icon: '💬', color: '#7dd3fc' },
  choice: { label: 'Choice', icon: '🔀', color: '#fbbf24' },
  condition: { label: 'Condition', icon: '❓', color: '#a78bfa' },
  action: { label: 'Action', icon: '⚡', color: '#34d399' },
  end: { label: 'End', icon: '🏁', color: '#f87171' },
};

// Default node data by type
const DEFAULT_NODE_DATA = {
  dialogue: { speaker: '', text: '', portrait: '' },
  choice: {
    prompt: '',
    options: [
      { text: 'Option 1', targetId: null },
      { text: 'Option 2', targetId: null },
    ],
  },
  condition: { variable: '', operator: '==', value: '', trueTargetId: null, falseTargetId: null },
  action: { command: '' },
  end: {},
};

/**
 * Generate unique node ID
 */
function generateNodeId() {
  return `node_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * BranchingDialogue - Visual node-based dialogue editor
 *
 * @param {Object} props
 * @param {Object[]} props.nodes - Array of dialogue nodes
 * @param {function} props.onNodesChange - Callback when nodes change
 * @param {function} props.onExport - Callback to export as DSL
 */
function BranchingDialogue({ nodes = [], onNodesChange, onExport, className = '' }) {
  const canvasRef = useRef(null);
  const [selectedNodeId, setSelectedNodeId] = useState(null);
  const [draggingNodeId, setDraggingNodeId] = useState(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [connecting, setConnecting] = useState(null); // { fromId, outputIndex }
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [showNodeModal, setShowNodeModal] = useState(false);
  const [newNodeType, setNewNodeType] = useState('dialogue');
  const [isPanning, setIsPanning] = useState(false);
  const panStart = useRef({ x: 0, y: 0 });

  // Initialize with a start node if empty
  useEffect(() => {
    if (nodes.length === 0) {
      const startNode = {
        id: generateNodeId(),
        type: 'dialogue',
        x: 100,
        y: 100,
        data: { ...DEFAULT_NODE_DATA.dialogue },
        nextId: null,
      };
      onNodesChange?.([startNode]);
    }
  }, [nodes.length, onNodesChange]);

  // Get selected node
  const selectedNode = useMemo(
    () => nodes.find(n => n.id === selectedNodeId),
    [nodes, selectedNodeId]
  );

  // Add a new node
  const addNode = useCallback(
    type => {
      const newNode = {
        id: generateNodeId(),
        type,
        x: 200 + Math.random() * 200,
        y: 200 + Math.random() * 200,
        data: { ...DEFAULT_NODE_DATA[type] },
        nextId: null,
      };
      onNodesChange?.([...nodes, newNode]);
      setSelectedNodeId(newNode.id);
      setShowNodeModal(false);
    },
    [nodes, onNodesChange]
  );

  // Delete selected node
  const deleteNode = useCallback(
    nodeId => {
      if (nodes.length <= 1) return;

      // Remove node and clear any connections to it
      const updated = nodes
        .filter(n => n.id !== nodeId)
        .map(n => {
          const updated = { ...n };
          if (updated.nextId === nodeId) updated.nextId = null;
          if (updated.data?.trueTargetId === nodeId) updated.data.trueTargetId = null;
          if (updated.data?.falseTargetId === nodeId) updated.data.falseTargetId = null;
          if (updated.data?.options) {
            updated.data.options = updated.data.options.map(opt =>
              opt.targetId === nodeId ? { ...opt, targetId: null } : opt
            );
          }
          return updated;
        });

      onNodesChange?.(updated);
      if (selectedNodeId === nodeId) setSelectedNodeId(null);
    },
    [nodes, onNodesChange, selectedNodeId]
  );

  // Update node data
  const updateNode = useCallback(
    (nodeId, updates) => {
      const updated = nodes.map(n => (n.id === nodeId ? { ...n, ...updates } : n));
      onNodesChange?.(updated);
    },
    [nodes, onNodesChange]
  );

  // Update node nested data
  const updateNodeData = useCallback(
    (nodeId, dataUpdates) => {
      const updated = nodes.map(n =>
        n.id === nodeId ? { ...n, data: { ...n.data, ...dataUpdates } } : n
      );
      onNodesChange?.(updated);
    },
    [nodes, onNodesChange]
  );

  // Handle node drag
  const handleNodeMouseDown = useCallback(
    (e, nodeId) => {
      e.stopPropagation();
      const node = nodes.find(n => n.id === nodeId);
      if (!node) return;

      setDraggingNodeId(nodeId);
      setSelectedNodeId(nodeId);
      setDragOffset({
        x: e.clientX - node.x * zoom - pan.x,
        y: e.clientY - node.y * zoom - pan.y,
      });
    },
    [nodes, zoom, pan]
  );

  // Handle canvas mouse move
  const handleCanvasMouseMove = useCallback(
    e => {
      if (draggingNodeId) {
        const newX = (e.clientX - dragOffset.x - pan.x) / zoom;
        const newY = (e.clientY - dragOffset.y - pan.y) / zoom;
        updateNode(draggingNodeId, { x: Math.max(0, newX), y: Math.max(0, newY) });
      } else if (isPanning) {
        setPan({
          x: e.clientX - panStart.current.x,
          y: e.clientY - panStart.current.y,
        });
      }
    },
    [draggingNodeId, dragOffset, pan, zoom, updateNode, isPanning]
  );

  // Handle canvas mouse up
  const handleCanvasMouseUp = useCallback(() => {
    setDraggingNodeId(null);
    setIsPanning(false);
  }, []);

  // Handle canvas pan start
  const handleCanvasPanStart = useCallback(
    e => {
      if (e.target === canvasRef.current) {
        setIsPanning(true);
        panStart.current = { x: e.clientX - pan.x, y: e.clientY - pan.y };
      }
    },
    [pan]
  );

  // Handle zoom
  const handleWheel = useCallback(e => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? -0.1 : 0.1;
    setZoom(z => Math.max(0.25, Math.min(2, z + delta)));
  }, []);

  // Start connection from output
  const startConnection = useCallback((fromId, outputIndex) => {
    setConnecting({ fromId, outputIndex });
  }, []);

  // Complete connection to node
  const completeConnection = useCallback(
    toId => {
      if (!connecting || connecting.fromId === toId) {
        setConnecting(null);
        return;
      }

      const fromNode = nodes.find(n => n.id === connecting.fromId);
      if (!fromNode) {
        setConnecting(null);
        return;
      }

      // Handle different connection types
      if (fromNode.type === 'choice') {
        updateNodeData(connecting.fromId, {
          options: fromNode.data.options.map((opt, i) =>
            i === connecting.outputIndex ? { ...opt, targetId: toId } : opt
          ),
        });
      } else if (fromNode.type === 'condition') {
        if (connecting.outputIndex === 0) {
          updateNodeData(connecting.fromId, { trueTargetId: toId });
        } else {
          updateNodeData(connecting.fromId, { falseTargetId: toId });
        }
      } else {
        updateNode(connecting.fromId, { nextId: toId });
      }

      setConnecting(null);
    },
    [connecting, nodes, updateNode, updateNodeData]
  );

  // Draw connection lines
  const renderConnections = useCallback(() => {
    const lines = [];

    for (const node of nodes) {
      const startX = node.x + 140;
      const startY = node.y + 30;

      // Single output connection
      if (node.nextId) {
        const target = nodes.find(n => n.id === node.nextId);
        if (target) {
          lines.push({
            key: `${node.id}-next`,
            x1: startX,
            y1: startY,
            x2: target.x,
            y2: target.y + 30,
            color: NODE_TYPES[node.type]?.color || '#666',
          });
        }
      }

      // Choice outputs
      if (node.type === 'choice' && node.data?.options) {
        node.data.options.forEach((opt, i) => {
          if (opt.targetId) {
            const target = nodes.find(n => n.id === opt.targetId);
            if (target) {
              lines.push({
                key: `${node.id}-opt-${i}`,
                x1: startX,
                y1: startY + i * 24,
                x2: target.x,
                y2: target.y + 30,
                color: '#fbbf24',
              });
            }
          }
        });
      }

      // Condition outputs
      if (node.type === 'condition') {
        if (node.data?.trueTargetId) {
          const target = nodes.find(n => n.id === node.data.trueTargetId);
          if (target) {
            lines.push({
              key: `${node.id}-true`,
              x1: startX,
              y1: startY,
              x2: target.x,
              y2: target.y + 30,
              color: '#34d399',
            });
          }
        }
        if (node.data?.falseTargetId) {
          const target = nodes.find(n => n.id === node.data.falseTargetId);
          if (target) {
            lines.push({
              key: `${node.id}-false`,
              x1: startX,
              y1: startY + 24,
              x2: target.x,
              y2: target.y + 30,
              color: '#f87171',
            });
          }
        }
      }
    }

    return lines.map(line => (
      <line
        key={line.key}
        x1={line.x1}
        y1={line.y1}
        x2={line.x2}
        y2={line.y2}
        stroke={line.color}
        strokeWidth={2}
        markerEnd="url(#arrowhead)"
      />
    ));
  }, [nodes]);

  // Export to DSL format
  const handleExport = useCallback(() => {
    let dsl = '# Branching Dialogue Export\n\n';

    // Find start node (first dialogue node)
    const startNode = nodes.find(n => n.type === 'dialogue');
    if (!startNode) {
      onExport?.('# No dialogue found');
      return;
    }

    const visited = new Set();
    const queue = [startNode.id];

    while (queue.length > 0) {
      const nodeId = queue.shift();
      if (visited.has(nodeId)) continue;
      visited.add(nodeId);

      const node = nodes.find(n => n.id === nodeId);
      if (!node) continue;

      dsl += `# Node: ${nodeId.slice(0, 8)}\n`;

      if (node.type === 'dialogue') {
        const { speaker, text } = node.data;
        dsl += `${speaker || 'SPEAKER'}: ${text || ''}\n`;
        if (node.nextId) queue.push(node.nextId);
      } else if (node.type === 'choice') {
        dsl += `@choice\n`;
        node.data.options?.forEach((opt, i) => {
          dsl += `  - ${opt.text}\n`;
          if (opt.targetId) queue.push(opt.targetId);
        });
        dsl += `@endchoice\n`;
      } else if (node.type === 'condition') {
        const { variable, operator, value } = node.data;
        dsl += `@if ${variable} ${operator} ${value}\n`;
        if (node.data.trueTargetId) queue.push(node.data.trueTargetId);
        if (node.data.falseTargetId) queue.push(node.data.falseTargetId);
        dsl += `@endif\n`;
      } else if (node.type === 'action') {
        dsl += `${node.data.command || '@action'}\n`;
        if (node.nextId) queue.push(node.nextId);
      } else if (node.type === 'end') {
        dsl += `@end\n`;
      }

      dsl += '\n';
    }

    onExport?.(dsl);
  }, [nodes, onExport]);

  // Render node
  const renderNode = node => {
    const typeInfo = NODE_TYPES[node.type] || NODE_TYPES.dialogue;
    const isSelected = node.id === selectedNodeId;

    return (
      <div
        key={node.id}
        className={`bd-node ${isSelected ? 'bd-node--selected' : ''}`}
        style={{
          left: node.x,
          top: node.y,
          borderColor: typeInfo.color,
        }}
        onMouseDown={e => handleNodeMouseDown(e, node.id)}
        onClick={e => {
          e.stopPropagation();
          if (connecting) {
            completeConnection(node.id);
          } else {
            setSelectedNodeId(node.id);
          }
        }}
      >
        <div className="bd-node__header" style={{ background: typeInfo.color + '33' }}>
          <span className="bd-node__icon">{typeInfo.icon}</span>
          <span className="bd-node__type">{typeInfo.label}</span>
          <button
            className="bd-node__delete"
            onClick={e => {
              e.stopPropagation();
              deleteNode(node.id);
            }}
            title="Delete node"
          >
            ×
          </button>
        </div>

        <div className="bd-node__body">
          {node.type === 'dialogue' && (
            <>
              <div className="bd-node__speaker">{node.data.speaker || 'Speaker?'}</div>
              <div className="bd-node__text">{node.data.text || 'Enter dialogue...'}</div>
            </>
          )}

          {node.type === 'choice' && (
            <div className="bd-node__options">
              {node.data.options?.map((opt, i) => (
                <div key={i} className="bd-node__option">
                  <span className="bd-node__option-text">{opt.text}</span>
                  <button
                    className="bd-node__output"
                    onClick={e => {
                      e.stopPropagation();
                      startConnection(node.id, i);
                    }}
                    style={{ background: opt.targetId ? '#fbbf24' : 'transparent' }}
                  >
                    →
                  </button>
                </div>
              ))}
            </div>
          )}

          {node.type === 'condition' && (
            <div className="bd-node__condition">
              <div className="bd-node__condition-expr">
                {node.data.variable || 'var'} {node.data.operator} {node.data.value || '?'}
              </div>
              <div className="bd-node__condition-branches">
                <button
                  className="bd-node__output bd-node__output--true"
                  onClick={e => {
                    e.stopPropagation();
                    startConnection(node.id, 0);
                  }}
                  style={{ background: node.data.trueTargetId ? '#34d399' : 'transparent' }}
                >
                  ✓
                </button>
                <button
                  className="bd-node__output bd-node__output--false"
                  onClick={e => {
                    e.stopPropagation();
                    startConnection(node.id, 1);
                  }}
                  style={{ background: node.data.falseTargetId ? '#f87171' : 'transparent' }}
                >
                  ✗
                </button>
              </div>
            </div>
          )}

          {node.type === 'action' && (
            <div className="bd-node__command">{node.data.command || '@command'}</div>
          )}

          {node.type === 'end' && <div className="bd-node__end">Scene End</div>}
        </div>

        {/* Output connector (for non-choice, non-condition nodes) */}
        {node.type !== 'choice' && node.type !== 'condition' && node.type !== 'end' && (
          <button
            className="bd-node__output bd-node__output--main"
            onClick={e => {
              e.stopPropagation();
              startConnection(node.id, 0);
            }}
            style={{ background: node.nextId ? typeInfo.color : 'transparent' }}
          >
            →
          </button>
        )}
      </div>
    );
  };

  return (
    <div className={`branching-dialogue ${className}`}>
      {/* Toolbar */}
      <div className="bd-toolbar">
        <ButtonGroup size="xs">
          <Button onClick={() => setShowNodeModal(true)}>+ Add Node</Button>
          <Button onClick={handleExport} disabled={nodes.length === 0}>
            Export DSL
          </Button>
        </ButtonGroup>
        <div className="bd-toolbar__zoom">
          <Button size="xs" onClick={() => setZoom(z => Math.max(0.25, z - 0.1))}>
            −
          </Button>
          <span>{Math.round(zoom * 100)}%</span>
          <Button size="xs" onClick={() => setZoom(z => Math.min(2, z + 0.1))}>
            +
          </Button>
        </div>
      </div>

      {/* Canvas */}
      <div
        ref={canvasRef}
        className="bd-canvas"
        onMouseMove={handleCanvasMouseMove}
        onMouseUp={handleCanvasMouseUp}
        onMouseLeave={handleCanvasMouseUp}
        onMouseDown={handleCanvasPanStart}
        onWheel={handleWheel}
      >
        <div
          className="bd-canvas__content"
          style={{
            transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
            transformOrigin: '0 0',
          }}
        >
          {/* Connection lines */}
          <svg className="bd-connections">
            <defs>
              <marker
                id="arrowhead"
                markerWidth="10"
                markerHeight="7"
                refX="9"
                refY="3.5"
                orient="auto"
              >
                <polygon points="0 0, 10 3.5, 0 7" fill="#666" />
              </marker>
            </defs>
            {renderConnections()}
          </svg>

          {/* Nodes */}
          {nodes.map(renderNode)}
        </div>

        {/* Connection in progress indicator */}
        {connecting && (
          <div className="bd-connecting-hint">
            Click a node to connect, or click canvas to cancel
          </div>
        )}
      </div>

      {/* Node Properties Panel */}
      {selectedNode && (
        <div className="bd-properties">
          <div className="bd-properties__header">
            <span>
              {NODE_TYPES[selectedNode.type]?.icon} {NODE_TYPES[selectedNode.type]?.label}
            </span>
          </div>
          <div className="bd-properties__body">
            {selectedNode.type === 'dialogue' && (
              <>
                <div className="bd-field">
                  <label>Speaker:</label>
                  <Input
                    size="sm"
                    value={selectedNode.data.speaker || ''}
                    onChange={val => updateNodeData(selectedNodeId, { speaker: val.toUpperCase() })}
                  />
                </div>
                <div className="bd-field">
                  <label>Text:</label>
                  <Input
                    as="textarea"
                    rows={3}
                    value={selectedNode.data.text || ''}
                    onChange={val => updateNodeData(selectedNodeId, { text: val })}
                  />
                </div>
              </>
            )}

            {selectedNode.type === 'choice' && (
              <>
                <div className="bd-field">
                  <label>Prompt:</label>
                  <Input
                    size="sm"
                    value={selectedNode.data.prompt || ''}
                    onChange={val => updateNodeData(selectedNodeId, { prompt: val })}
                  />
                </div>
                <div className="bd-field">
                  <label>Options:</label>
                  {selectedNode.data.options?.map((opt, i) => (
                    <div key={i} className="bd-option-edit">
                      <Input
                        size="sm"
                        value={opt.text}
                        onChange={val => {
                          const newOpts = [...selectedNode.data.options];
                          newOpts[i] = { ...newOpts[i], text: val };
                          updateNodeData(selectedNodeId, { options: newOpts });
                        }}
                      />
                      <Button
                        size="xs"
                        onClick={() => {
                          const newOpts = selectedNode.data.options.filter((_, idx) => idx !== i);
                          updateNodeData(selectedNodeId, { options: newOpts });
                        }}
                      >
                        ×
                      </Button>
                    </div>
                  ))}
                  <Button
                    size="xs"
                    onClick={() => {
                      const newOpts = [
                        ...(selectedNode.data.options || []),
                        { text: 'New Option', targetId: null },
                      ];
                      updateNodeData(selectedNodeId, { options: newOpts });
                    }}
                  >
                    + Add Option
                  </Button>
                </div>
              </>
            )}

            {selectedNode.type === 'condition' && (
              <>
                <div className="bd-field">
                  <label>Variable:</label>
                  <Input
                    size="sm"
                    value={selectedNode.data.variable || ''}
                    onChange={val => updateNodeData(selectedNodeId, { variable: val })}
                  />
                </div>
                <div className="bd-field">
                  <label>Operator:</label>
                  <SelectPicker
                    size="sm"
                    data={[
                      { label: '==', value: '==' },
                      { label: '!=', value: '!=' },
                      { label: '>', value: '>' },
                      { label: '<', value: '<' },
                      { label: '>=', value: '>=' },
                      { label: '<=', value: '<=' },
                    ]}
                    value={selectedNode.data.operator || '=='}
                    onChange={val => updateNodeData(selectedNodeId, { operator: val })}
                    cleanable={false}
                    searchable={false}
                    style={{ width: '100%' }}
                  />
                </div>
                <div className="bd-field">
                  <label>Value:</label>
                  <Input
                    size="sm"
                    value={selectedNode.data.value || ''}
                    onChange={val => updateNodeData(selectedNodeId, { value: val })}
                  />
                </div>
              </>
            )}

            {selectedNode.type === 'action' && (
              <div className="bd-field">
                <label>Command:</label>
                <Input
                  size="sm"
                  value={selectedNode.data.command || ''}
                  onChange={val => updateNodeData(selectedNodeId, { command: val })}
                  placeholder="@action command"
                />
              </div>
            )}
          </div>
        </div>
      )}

      {/* Add Node Modal */}
      <Modal open={showNodeModal} onClose={() => setShowNodeModal(false)} size="xs">
        <Modal.Header>
          <Modal.Title>Add Node</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="bd-add-nodes">
            {Object.entries(NODE_TYPES).map(([type, info]) => (
              <button
                key={type}
                className="bd-add-node-btn"
                onClick={() => addNode(type)}
                style={{ borderColor: info.color }}
              >
                <span className="bd-add-node-btn__icon">{info.icon}</span>
                <span className="bd-add-node-btn__label">{info.label}</span>
              </button>
            ))}
          </div>
        </Modal.Body>
      </Modal>
    </div>
  );
}

export default BranchingDialogue;
export { NODE_TYPES, DEFAULT_NODE_DATA, generateNodeId };
