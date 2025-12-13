/**
 * ---------------------------------------------------------------
 *               PixoSpritz – Multiplayer Server
 * ---------------------------------------------------------------
 * Copyright (c) 2022-2025 Kyle Derby MacInnis
 *
 * WebSocket server for multiplayer functionality.
 * Handles zone synchronization, avatar updates, and action broadcasting.
 */

import API from './v2/api.js';

const Api = new API();

// Start the WebSocket server
Api.listen();

const port = process.env.PORT || 8080;
console.log(`[PixoSpritz Server] WebSocket server started on port ${port}`);

// Process action queue every 100ms
const queueInterval = setInterval(() => Api.processActionQueue(), 100);

// Graceful shutdown handlers
process.on('SIGTERM', () => {
  console.log('[PixoSpritz Server] SIGTERM received, shutting down...');
  clearInterval(queueInterval);
  Api.shutdown();
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('[PixoSpritz Server] SIGINT received, shutting down...');
  clearInterval(queueInterval);
  Api.shutdown();
  process.exit(0);
});