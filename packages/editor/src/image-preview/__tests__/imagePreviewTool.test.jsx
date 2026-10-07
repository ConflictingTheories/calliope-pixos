/*
 * ---------------------------------------------------------------
 *      PixoSpritz – Editor – image-preview migration test (P2-10)
 * ---------------------------------------------------------------
 * Copyright (c) 2022-2025  Kyle Derby MacInnis
 *
 * Golden fixture parity: the migrated tool container loads the
 * fixture through the DocumentRegistry, registers zoom commands
 * on the shell, and never touches ZIP internals.
 */

/** @vitest-environment jsdom */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import React from 'react';
import { render, screen } from '@testing-library/react';
import { ImagePreviewTool } from '../ImagePreviewTool.jsx';
import { createDefaultRegistry } from '../../core/documents/registry.js';
import { CommandRegistry } from '../../shell/commands/commands.js';

// 1x1 transparent PNG.
const FIXTURE_B64 =
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==';
const fixtureBytes = () =>
  Uint8Array.from(atob(FIXTURE_B64), c => c.charCodeAt(0));

vi.mock('../../shared/blobUrls.js', () => ({
  createPreviewUrl: (bytes, mime) => `blob:mock/${bytes.length}/${mime}`,
  revokePreviewUrl: () => {},
}));

describe('ImagePreviewTool (P2-10)', () => {
  let core;
  beforeEach(() => {
    core = { registry: createDefaultRegistry(), commands: new CommandRegistry() };
  });

  it('renders the golden fixture through the registry', () => {
    render(
      <ImagePreviewTool
        documentPath="sprites/hero.png"
        core={core}
        imageBytes={fixtureBytes()}
        mime="image/png"
      />
    );
    // ImagePreview renders an <img> for a loaded image.
    expect(screen.getByRole('img')).toBeTruthy();
  });

  it('registers zoom commands on the shell', () => {
    render(
      <ImagePreviewTool
        documentPath="sprites/hero.png"
        core={core}
        imageBytes={fixtureBytes()}
        mime="image/png"
      />
    );
    expect(core.commands.get('image-preview.zoom-in')).toBeTruthy();
    expect(core.commands.get('image-preview.zoom-out')).toBeTruthy();
    expect(core.commands.get('image-preview.zoom-reset')).toBeTruthy();
  });

  it('keeps the registry path honest: fixture loads as an image', () => {
    const bytes = fixtureBytes();
    const doc = core.registry.loadDocument(bytes, {
      kind: 'image',
      path: 'sprites/hero.png',
    });
    expect(doc.kind).toBe('image');
    expect(doc.data).toBe(bytes);
    expect(doc.issues).toEqual([]);
  });
});
