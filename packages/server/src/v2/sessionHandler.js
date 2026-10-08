/**
 * Live Session Handler — multiplayer live experiences.
 *
 * A live session is a creator-hosted multiplayer event inside a zone:
 * - host: the creator running the session (commentary, cues, live art)
 * - player: active participant with an avatar
 * - spectator: watcher without an avatar (can still receive commentary/cues)
 *
 * Sessions enable: live play with creator commentary, live art performances
 * (host edits the world while the audience watches), guided tours, and
 * community events — all inside a spritz.
 */

/** Session roles */
export const SessionRoles = {
  HOST: 'host',
  PLAYER: 'player',
  SPECTATOR: 'spectator',
};

export default class SessionHandler {
  /**
   * @param {import('./clientManager.js').default} clientManager
   * @param {import('./zoneHandler.js').default} zoneHandler
   */
  constructor(clientManager, zoneHandler) {
    /** @type {Map<string, object>} sessionId -> session */
    this.sessions = new Map();
    /** @type {Map<string, string>} clientId -> sessionId */
    this.clientSessions = new Map();
    this.clientManager = clientManager;
    this.zoneHandler = zoneHandler;
  }

  generateSessionId() {
    return `sess_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
  }

  getSession(sessionId) {
    return this.sessions.get(sessionId);
  }

  getClientSession(clientId) {
    const sessionId = this.clientSessions.get(clientId);
    return sessionId ? this.sessions.get(sessionId) : null;
  }

  /**
   * Host creates a live session.
   */
  handleCreateSession(clientId, payload) {
    const client = this.clientManager.getClient(clientId);
    if (!client) return;

    const { zoneId, title, description } = payload || {};
    if (!zoneId) {
      client.sendMessage('error', { code: 'INVALID_SESSION', message: 'zoneId required' });
      return;
    }

    // Leave any existing session first
    this.handleLeaveSession(clientId, {});

    const sessionId = this.generateSessionId();
    const session = {
      id: sessionId,
      hostId: clientId,
      zoneId,
      title: title || 'Live Session',
      description: description || '',
      live: true,
      startedAt: Date.now(),
      /** @type {Map<string, string>} clientId -> role */
      participants: new Map([[clientId, SessionRoles.HOST]]),
    };
    this.sessions.set(sessionId, session);
    this.clientSessions.set(clientId, sessionId);

    client.sendMessage('session-created', {
      sessionId,
      zoneId,
      title: session.title,
      role: SessionRoles.HOST,
    });
    console.log(`[Session] ${clientId} created live session ${sessionId} in zone ${zoneId}`);
  }

  /**
   * Join a session as player or spectator.
   */
  handleJoinSession(clientId, payload) {
    const client = this.clientManager.getClient(clientId);
    if (!client) return;

    const { sessionId, role } = payload || {};
    const session = this.sessions.get(sessionId);
    if (!session || !session.live) {
      client.sendMessage('error', { code: 'SESSION_NOT_FOUND', message: 'Session not found or ended' });
      return;
    }

    // Leave any existing session first
    this.handleLeaveSession(clientId, {});

    const assignedRole =
      role === SessionRoles.SPECTATOR ? SessionRoles.SPECTATOR : SessionRoles.PLAYER;
    session.participants.set(clientId, assignedRole);
    this.clientSessions.set(clientId, sessionId);

    client.sendMessage('session-joined', {
      sessionId,
      zoneId: session.zoneId,
      title: session.title,
      role: assignedRole,
      hostId: session.hostId,
    });

    // Notify everyone in the session
    this.broadcastToSession(sessionId, {
      type: 'session-participant-joined',
      payload: { sessionId, clientId, role: assignedRole },
    }, clientId);
    console.log(`[Session] ${clientId} joined ${sessionId} as ${assignedRole}`);
  }

  /**
   * Leave the current session.
   */
  handleLeaveSession(clientId, _payload) {
    const sessionId = this.clientSessions.get(clientId);
    if (!sessionId) return;
    const session = this.sessions.get(sessionId);
    if (!session) {
      this.clientSessions.delete(clientId);
      return;
    }

    const wasHost = session.hostId === clientId;
    session.participants.delete(clientId);
    this.clientSessions.delete(clientId);

    const client = this.clientManager.getClient(clientId);
    if (client) client.sendMessage('session-left', { sessionId });

    if (wasHost) {
      // Host left: end the session for everyone
      this.endSession(sessionId, 'host-left');
    } else {
      this.broadcastToSession(sessionId, {
        type: 'session-participant-left',
        payload: { sessionId, clientId },
      });
    }
    console.log(`[Session] ${clientId} left ${sessionId}`);
  }

  /**
   * Host ends the session.
   */
  handleEndSession(clientId, _payload) {
    const session = this.getClientSession(clientId);
    if (!session || session.hostId !== clientId) return;
    this.endSession(session.id, 'host-ended');
  }

  endSession(sessionId, reason) {
    const session = this.sessions.get(sessionId);
    if (!session) return;
    session.live = false;
    this.broadcastToSession(sessionId, {
      type: 'session-ended',
      payload: { sessionId, reason },
    });
    for (const pid of session.participants.keys()) {
      this.clientSessions.delete(pid);
    }
    this.sessions.delete(sessionId);
    console.log(`[Session] ${sessionId} ended (${reason})`);
  }

  /**
   * Host broadcasts commentary (text) to all session participants.
   * This is the "creator providing commentary" channel.
   */
  handleSessionCommentary(clientId, payload) {
    const session = this.getClientSession(clientId);
    if (!session || !session.live) return;
    if (session.hostId !== clientId) {
      const client = this.clientManager.getClient(clientId);
      if (client) client.sendMessage('error', { code: 'NOT_HOST', message: 'Only the host can send commentary' });
      return;
    }
    const { text } = payload || {};
    if (!text || typeof text !== 'string') return;
    this.broadcastToSession(sessionIdOf(session), {
      type: 'session-commentary',
      payload: { sessionId: session.id, hostId: clientId, text: text.slice(0, 2000), at: Date.now() },
    });
  }

  /**
   * Host triggers a world cue — a directed change all participants see.
   * Cues: { kind: 'effect'|'lighting'|'spawn'|'camera'|'audio', ...params }
   * This powers live art: the host paints/changes the world live.
   */
  handleSessionCue(clientId, payload) {
    const session = this.getClientSession(clientId);
    if (!session || !session.live) return;
    if (session.hostId !== clientId) {
      const client = this.clientManager.getClient(clientId);
      if (client) client.sendMessage('error', { code: 'NOT_HOST', message: 'Only the host can trigger cues' });
      return;
    }
    const { cue } = payload || {};
    if (!cue || typeof cue !== 'object') return;
    this.broadcastToSession(sessionIdOf(session), {
      type: 'session-cue',
      payload: { sessionId: session.id, hostId: clientId, cue, at: Date.now() },
    });
  }

  /**
   * Host changes a participant's role.
   */
  handleSessionRole(clientId, payload) {
    const session = this.getClientSession(clientId);
    if (!session || !session.live) return;
    if (session.hostId !== clientId) return;
    const { targetClientId, role } = payload || {};
    if (!session.participants.has(targetClientId)) return;
    if (![SessionRoles.PLAYER, SessionRoles.SPECTATOR].includes(role)) return;
    session.participants.set(targetClientId, role);
    this.broadcastToSession(session.id, {
      type: 'session-role-changed',
      payload: { sessionId: session.id, clientId: targetClientId, role },
    });
  }

  /**
   * Handle disconnect: remove from session, end if host.
   */
  handleDisconnect(clientId) {
    this.handleLeaveSession(clientId, {});
  }

  broadcastToSession(sessionId, message, excludeClientId = null) {
    const session = this.sessions.get(sessionId);
    if (!session) return;
    for (const pid of session.participants.keys()) {
      if (pid === excludeClientId) continue;
      const client = this.clientManager.getClient(pid);
      if (client && client.isReady()) {
        try {
          client.sendMessage(message.type, message.payload);
        } catch (e) {
          console.warn(`[Session] Failed to send to ${pid}:`, e);
        }
      }
    }
  }

  /**
   * List live sessions (for discovery).
   */
  handleListSessions(clientId, _payload) {
    const client = this.clientManager.getClient(clientId);
    if (!client) return;
    const list = [...this.sessions.values()]
      .filter(s => s.live)
      .map(s => ({
        sessionId: s.id,
        title: s.title,
        description: s.description,
        zoneId: s.zoneId,
        hostId: s.hostId,
        participantCount: s.participants.size,
        startedAt: s.startedAt,
      }));
    client.sendMessage('session-list', { sessions: list });
  }
}

function sessionIdOf(session) {
  return session.id;
}
