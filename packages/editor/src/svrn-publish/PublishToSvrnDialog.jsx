/**
 * PixoSpritz editor — "Publish to SVRN" dialog.
 *
 * Collects bundle metadata (title, creator, description, tags) and hands
 * it to the publish flow. The pinned player version is shown read-only:
 * SVRN serves exactly this runtime for the bundle.
 */

import { useState } from 'react';
import { Modal, Button, Input } from '../ui/index.js';
import { PINNED_PLAYER_VERSION } from './bundle.js';

export function PublishToSvrnDialog({ open, onClose, onPublish, busy = false }) {
  const [title, setTitle] = useState('');
  const [creator, setCreator] = useState('');
  const [description, setDescription] = useState('');
  const [tags, setTags] = useState('');
  const [error, setError] = useState('');

  function handlePublish() {
    if (!title.trim()) {
      setError('Give the bundle a title.');
      return;
    }
    setError('');
    onPublish({
      title: title.trim(),
      creator: creator.trim(),
      description: description.trim(),
      tags: tags
        .split(',')
        .map(t => t.trim())
        .filter(Boolean),
    });
  }

  function handleClose() {
    if (busy) return;
    setError('');
    onClose();
  }

  return (
    <Modal open={open} onClose={handleClose} size="md">
      <Modal.Header onClose={handleClose}>
        <h2 style={{ margin: 0, fontSize: 16 }}>Publish to SVRN</h2>
      </Modal.Header>
      <p style={{ margin: '0 0 12px', color: 'var(--text-secondary, #9a9aa5)', fontSize: 13 }}>
        Packages the current project as a versioned <code>.svrn</code> bundle
        (game files + manifest with content hashes, pinned to player{' '}
        <code>{PINNED_PLAYER_VERSION}</code>) and downloads it. When the SVRN
        hub launches, this same flow will upload the bundle straight to your
        creator profile — playable embeds included.
      </p>
      <div style={{ display: 'grid', gap: 10 }}>
        <label style={{ display: 'grid', gap: 4, fontSize: 13 }}>
          Title
          <Input
            value={title}
            onChange={e => setTitle(e.target.value)}
            placeholder="My game"
            disabled={busy}
          />
        </label>
        <label style={{ display: 'grid', gap: 4, fontSize: 13 }}>
          Creator
          <Input
            value={creator}
            onChange={e => setCreator(e.target.value)}
            placeholder="Your handle"
            disabled={busy}
          />
        </label>
        <label style={{ display: 'grid', gap: 4, fontSize: 13 }}>
          Description
          <Input
            value={description}
            onChange={e => setDescription(e.target.value)}
            placeholder="What is this?"
            disabled={busy}
          />
        </label>
        <label style={{ display: 'grid', gap: 4, fontSize: 13 }}>
          Tags (comma-separated)
          <Input
            value={tags}
            onChange={e => setTags(e.target.value)}
            placeholder="platformer, demo"
            disabled={busy}
          />
        </label>
        <p style={{ margin: 0, fontSize: 12, color: 'var(--text-secondary, #9a9aa5)' }}>
          Player version: <code>{PINNED_PLAYER_VERSION}</code> (pinned)
        </p>
        {error && (
          <p style={{ margin: 0, fontSize: 13, color: 'var(--color-danger, #e5484d)' }}>{error}</p>
        )}
      </div>
      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 16 }}>
        <Button onClick={handleClose} disabled={busy}>
          Cancel
        </Button>
        <Button appearance="primary" onClick={handlePublish} disabled={busy}>
          {busy ? 'Building bundle…' : 'Build .svrn bundle'}
        </Button>
      </div>
    </Modal>
  );
}

export default PublishToSvrnDialog;
