class RateLimiter {
  constructor(maxRequests = 60, windowMs = 1000) {
    this.clients = new Map();
    this.maxRequests = maxRequests;
    this.windowMs = windowMs;
    setInterval(() => this.cleanup(), windowMs * 10);
  }

  isAllowed(clientId) {
    const now = Date.now();
    const client = this.clients.get(clientId) || { count: 0, windowStart: now };

    if (now - client.windowStart > this.windowMs) {
      client.count = 1;
      client.windowStart = now;
    } else {
      client.count++;
    }

    this.clients.set(clientId, client);
    return client.count <= this.maxRequests;
  }

  cleanup() {
    const now = Date.now();
    for (const [clientId, client] of this.clients.entries()) {
      if (now - client.windowStart > this.windowMs) {
        this.clients.delete(clientId);
      }
    }
  }
}

class MessageValidator {
  constructor(schema) {
    this.schema = schema;
  }

  validate(message) {
    if (!this.schema[message.type]) {
      return { valid: false, error: 'Unknown message type' };
    }
    // Basic validation, can be replaced with JSON-schema
    const schema_def = this.schema[message.type];
    for (const key in schema_def) {
      if (schema_def[key].required && message[key] === undefined) {
        return { valid: false, error: `Missing required field: ${key}` };
      }
      if (message[key] && typeof message[key] !== schema_def[key].type) {
        return { valid: false, error: `Invalid type for field: ${key}` };
      }
    }
    return { valid: true };
  }
}

class ConnectionTracker {
  constructor(maxConnections = 5) {
    this.connections = new Map();
    this.maxConnections = maxConnections;
  }

  add(ip) {
    const count = (this.connections.get(ip) || 0) + 1;
    if (count > this.maxConnections) {
      return false;
    }
    this.connections.set(ip, count);
    return true;
  }

  remove(ip) {
    const count = (this.connections.get(ip) || 1) - 1;
    if (count <= 0) {
      this.connections.delete(ip);
    } else {
      this.connections.set(ip, count);
    }
  }
}

module.exports = { RateLimiter, MessageValidator, ConnectionTracker };