/*
 * ---------------------------------------------------------------
 *           PixoSpritz – Editor – AssetTree
 * ---------------------------------------------------------------
 * Copyright (c) 2022-2025  Kyle Derby MacInnis
 *
 * (UX Phase 2, backlog 2.8 / finding A2.1) Hierarchical asset
 * tree replacing the flat 60vh file list.  Builds folders from
 * zip entry paths, with search filter, type badges, and empty
 * states.  The Bridge-style pattern (concept audit §1.3): assets
 * are organized, findable, and typed — the first step toward a
 * real asset model with usage tracking.
 */

import React, { useMemo, useState, useCallback } from 'react';
import { Input, Placeholder } from '../../ui';
import './AssetTree.css';

/** Map file extensions to asset types for badges + filtering. */
const TYPE_MAP = [
  { type: 'sprite', label: 'SPR', exts: ['spr', 'png', 'ase', 'aseprite'] },
  { type: 'map', label: 'MAP', exts: ['json'], match: /map/i },
  { type: 'script', label: 'PXS', exts: ['pxs', 'lua', 'js'] },
  { type: 'tileset', label: 'TILE', exts: ['tsx', 'tmx'] },
  { type: 'audio', label: 'AUD', exts: ['wav', 'mp3', 'ogg', 'm4a'] },
  { type: 'model', label: '3D', exts: ['glb', 'gltf', 'obj'] },
  { type: 'cutscene', label: 'CUT', exts: ['cutscene', 'yaml', 'yml'] },
];

export function assetTypeFor(name) {
  const lower = name.toLowerCase();
  const ext = lower.split('.').pop();
  for (const t of TYPE_MAP) {
    if (t.exts.includes(ext)) {
      if (t.match && !t.match.test(lower) && t.type === 'map') continue;
      return t;
    }
  }
  if (lower.endsWith('.json')) return { type: 'data', label: 'JSON' };
  return { type: 'file', label: ext.toUpperCase().slice(0, 4) || 'FILE' };
}

/** Build a folder tree from flat zip entry names. */
function buildTree(entries) {
  const root = { name: '', children: new Map(), files: [] };
  for (const entry of entries) {
    const parts = entry.name.split('/').filter(Boolean);
    let node = root;
    for (let i = 0; i < parts.length - 1; i++) {
      if (!node.children.has(parts[i])) {
        node.children.set(parts[i], { name: parts[i], children: new Map(), files: [] });
      }
      node = node.children.get(parts[i]);
    }
    node.files.push(entry);
  }
  return root;
}

function TreeNode({ node, depth, query, onOpen, expanded, toggle }) {
  const q = query.trim().toLowerCase();
  const folders = [...node.children.values()].sort((a, b) => a.name.localeCompare(b.name));
  const files = [...node.files].sort((a, b) => a.name.localeCompare(b.name.name || b.name));

  const visibleFiles = q
    ? files.filter(f => f.name.toLowerCase().includes(q))
    : files;
  const visibleFolders = folders.filter(f => {
    if (!q) return true;
    // Show folder if it or any descendant matches.
    const walk = n => {
      if (n.name.toLowerCase().includes(q)) return true;
      if (n.files.some(fl => fl.name.toLowerCase().includes(q))) return true;
      return [...n.children.values()].some(walk);
    };
    return walk(f);
  });

  if (q && visibleFiles.length === 0 && visibleFolders.length === 0 && depth === 0) {
    return null;
  }

  return (
    <>
      {visibleFolders.map(folder => {
        const path = `${depth}:${folder.name}`;
        const isOpen = q ? true : expanded.has(path);
        return (
          <div key={path} className="asset-tree__folder-wrap">
            <div
              className="asset-tree__row asset-tree__folder"
              style={{ paddingLeft: 8 + depth * 14 }}
              onClick={() => toggle(path)}
              onKeyDown={e => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  toggle(path);
                }
              }}
              tabIndex={0}
              role="treeitem"
              aria-expanded={isOpen}
            >
              <span className="asset-tree__chevron" aria-hidden="true">
                {isOpen ? '▾' : '▸'}
              </span>
              <span className="asset-tree__folder-icon" aria-hidden="true">📁</span>
              <span className="asset-tree__name">{folder.name}</span>
            </div>
            {isOpen && (
              <TreeNode
                node={folder}
                depth={depth + 1}
                query={query}
                onOpen={onOpen}
                expanded={expanded}
                toggle={toggle}
              />
            )}
          </div>
        );
      })}
      {visibleFiles.map(entry => {
        const t = assetTypeFor(entry.name);
        const base = entry.name.split('/').pop();
        return (
          <div
            key={entry.name}
            className={`asset-tree__row asset-tree__file asset-tree__file--${t.type}`}
            style={{ paddingLeft: 8 + depth * 14 }}
            onClick={() => onOpen(entry)}
            onKeyDown={e => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onOpen(entry);
              }
            }}
            tabIndex={0}
            role="treeitem"
            title={entry.name}
          >
            <span className="asset-tree__type" aria-hidden="true">{t.label}</span>
            <span className="asset-tree__name">{base}</span>
          </div>
        );
      })}
    </>
  );
}

/**
 * Hierarchical asset tree with search.
 * @param {{entries: Array<{name:string}>, onOpen: (entry)=>void}} props
 */
export function AssetTree({ entries, onOpen }) {
  const [query, setQuery] = useState('');
  const [expanded, setExpanded] = useState(new Set());

  const tree = useMemo(() => buildTree(entries), [entries]);

  const toggle = useCallback(path => {
    setExpanded(prev => {
      const next = new Set(prev);
      if (next.has(path)) next.delete(path);
      else next.add(path);
      return next;
    });
  }, []);

  const q = query.trim().toLowerCase();
  const matchCount = q
    ? entries.filter(e => e.name.toLowerCase().includes(q)).length
    : entries.length;

  return (
    <div className="asset-tree">
      <div className="asset-tree__search">
        <Input
          size="sm"
          placeholder="Search assets…"
          value={query}
          onChange={setQuery}
          aria-label="Search assets"
        />
        {q && (
          <span className="asset-tree__count" aria-live="polite">
            {matchCount} match{matchCount === 1 ? '' : 'es'}
          </span>
        )}
      </div>
      <div
        className="asset-tree__list"
        role="tree"
        aria-label="Project assets"
      >
        {entries.length === 0 ? (
          <div className="asset-tree__empty">
            <Placeholder.Paragraph rows={3} active={false} />
            <p className="asset-tree__empty-text">
              No assets yet. Import files or create a new project to begin.
            </p>
          </div>
        ) : (
          <TreeNode
            node={tree}
            depth={0}
            query={query}
            onOpen={onOpen}
            expanded={expanded}
            toggle={toggle}
          />
        )}
        {entries.length > 0 && q && matchCount === 0 && (
          <div className="asset-tree__empty">
            <p className="asset-tree__empty-text">
              No assets match “{query}”. Try a different search.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default AssetTree;
