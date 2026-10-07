/**
 * ---------------------------------------------------------------
 *                AI Service - Core Provider Abstraction
 * ---------------------------------------------------------------
 * Copyright (c) 2022-2025 Kyle Derby MacInnis
 *
 * Provides a unified interface for AI providers. Local-first: Ollama,
 * llama.cpp server, and LM Studio work with no API key and no account.
 * Cloud providers (OpenAI, Anthropic, Google) are opt-in and require
 * your own key.
 *
 * IMPORTANT: Direct browser calls to OpenAI/Anthropic APIs will fail
 * due to CORS restrictions. For cloud providers in production use,
 * you should either:
 *   1. Use the "Custom" provider with a proxy server endpoint
 *   2. Use a CORS-enabled proxy service
 *   3. Run the AI calls through a backend server
 *
 * Local providers run on localhost and are not subject to CORS issues.
 */

// Supported AI providers.
// Local-first: Ollama / llama.cpp / LM Studio need no API key and no
// account. Cloud providers are opt-in "advanced" (own key required).
export const AI_PROVIDERS = {
  OLLAMA: 'ollama',
  LLAMACPP: 'llamacpp',
  LMSTUDIO: 'lmstudio',
  OPENAI: 'openai',
  ANTHROPIC: 'anthropic',
  GOOGLE: 'google',
  LOCAL: 'local',
  CUSTOM: 'custom',
};

/**
 * Provider metadata driving the UI: grouping, key requirements,
 * default endpoints, and health-check paths.
 */
export const PROVIDER_META = {
  [AI_PROVIDERS.OLLAMA]: {
    label: 'Ollama (local)',
    group: 'local',
    requiresKey: false,
    defaultEndpoint: 'http://localhost:11434',
    chatPath: '/v1/chat/completions',
    healthPath: '/api/tags',
    description: 'Local models via Ollama. No account, no API key. Install from ollama.com, then `ollama pull <model>`.',
  },
  [AI_PROVIDERS.LLAMACPP]: {
    label: 'llama.cpp server (local)',
    group: 'local',
    requiresKey: false,
    defaultEndpoint: 'http://localhost:8080',
    chatPath: '/v1/chat/completions',
    healthPath: '/v1/models',
    description: 'Local models via a llama.cpp server (--server). No account, no API key.',
  },
  [AI_PROVIDERS.LMSTUDIO]: {
    label: 'LM Studio (local)',
    group: 'local',
    requiresKey: false,
    defaultEndpoint: 'http://localhost:1234',
    chatPath: '/v1/chat/completions',
    healthPath: '/v1/models',
    description: 'Local models via LM Studio with its local server enabled. No account, no API key.',
  },
  [AI_PROVIDERS.OPENAI]: {
    label: 'OpenAI (cloud)',
    group: 'cloud',
    requiresKey: true,
    description: 'Requires your own OpenAI API key and account. Billed by OpenAI.',
  },
  [AI_PROVIDERS.ANTHROPIC]: {
    label: 'Anthropic (cloud)',
    group: 'cloud',
    requiresKey: true,
    description: 'Requires your own Anthropic API key and account. Billed by Anthropic.',
  },
  [AI_PROVIDERS.GOOGLE]: {
    label: 'Google Gemini (cloud)',
    group: 'cloud',
    requiresKey: true,
    description: 'Requires your own Google API key and account. Billed by Google.',
  },
  [AI_PROVIDERS.CUSTOM]: {
    label: 'Custom endpoint',
    group: 'advanced',
    requiresKey: false,
    description: 'Any OpenAI-compatible endpoint (e.g. a proxy server).',
  },
  [AI_PROVIDERS.LOCAL]: {
    label: 'Legacy local',
    group: 'advanced',
    requiresKey: false,
    description: 'Legacy alias — prefer Ollama / llama.cpp / LM Studio.',
  },
};

// API endpoints for each provider
const ENDPOINTS = {
  [AI_PROVIDERS.OPENAI]: {
    chat: 'https://api.openai.com/v1/chat/completions',
    image: 'https://api.openai.com/v1/images/generations',
    audio: 'https://api.openai.com/v1/audio/speech',
  },
  [AI_PROVIDERS.ANTHROPIC]: {
    chat: 'https://api.anthropic.com/v1/messages',
  },
  [AI_PROVIDERS.GOOGLE]: {
    chat: 'https://generativelanguage.googleapis.com/v1beta/models',
  },
};

// Default models for each provider.
// Local providers default to the hardware-recommended model; the UI
// overrides these per the model catalog.
const DEFAULT_MODELS = {
  [AI_PROVIDERS.OLLAMA]: {
    chat: 'llama3.1:8b',
    image: null, // local image needs an SD-compatible endpoint (see localImageEndpoint)
    audio: null, // local audio needs a TTS endpoint (see localAudioEndpoint)
  },
  [AI_PROVIDERS.LLAMACPP]: {
    chat: 'default',
    image: null,
    audio: null,
  },
  [AI_PROVIDERS.LMSTUDIO]: {
    chat: 'default',
    image: null,
    audio: null,
  },
  [AI_PROVIDERS.OPENAI]: {
    chat: 'gpt-4o',
    image: 'dall-e-3',
    audio: 'tts-1',
  },
  [AI_PROVIDERS.ANTHROPIC]: {
    chat: 'claude-3-5-sonnet-20241022',
  },
  [AI_PROVIDERS.GOOGLE]: {
    chat: 'gemini-pro',
  },
};

// Rate limit configuration
const RATE_LIMIT_CONFIG = {
  maxRetries: 5,
  baseDelayMs: 60000, // 1 minute base delay for rate limits
  maxDelayMs: 300000, // 5 minutes max delay
};

/**
 * Sleep for a given number of milliseconds
 * @param {number} ms - Milliseconds to sleep
 * @returns {Promise<void>}
 */
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Parse rate limit retry delay from error message or headers
 * @param {Response} response - Fetch response
 * @param {object} errorBody - Parsed error body
 * @returns {number} - Delay in milliseconds
 */
function parseRateLimitDelay(response, errorBody) {
  // Check for Retry-After header
  const retryAfter = response.headers.get('Retry-After');
  if (retryAfter) {
    const seconds = parseInt(retryAfter, 10);
    if (!isNaN(seconds)) {
      return seconds * 1000;
    }
  }

  // Try to extract from error message (e.g., "Please retry after X seconds")
  const message = errorBody?.error?.message || '';
  const match = message.match(/retry after (\d+)/i);
  if (match) {
    return parseInt(match[1], 10) * 1000;
  }

  // Default to base delay
  return RATE_LIMIT_CONFIG.baseDelayMs;
}

/**
 * Check if an error is a rate limit error
 * @param {Response} response - Fetch response
 * @param {object} errorBody - Parsed error body
 * @returns {boolean}
 */
function isRateLimitError(response, errorBody) {
  if (response.status === 429) return true;
  const message = errorBody?.error?.message || '';
  return message.toLowerCase().includes('rate limit');
}

/**
 * AI Service class for managing AI provider connections and requests
 */
export class AIService {
  constructor() {
    this.config = {
      provider: AI_PROVIDERS.OLLAMA, // local-first: no key, no account needed
      apiKey: '',
      customEndpoint: '',
      localEndpoint: '', // override for ollama/llamacpp/lmstudio base URL
      localImageEndpoint: '', // SD-compatible image endpoint (optional)
      localAudioEndpoint: '', // TTS endpoint (optional)
      models: { ...DEFAULT_MODELS[AI_PROVIDERS.OLLAMA] },
    };
    this.loadConfig();
  }

  /**
   * Load configuration from localStorage
   */
  loadConfig() {
    try {
      const saved = localStorage.getItem('pixospritz-ai-config');
      if (saved) {
        const parsed = JSON.parse(saved);
        this.config = { ...this.config, ...parsed };
      }
    } catch {
      // Failed to load AI config, use defaults
    }
  }

  /**
   * Save configuration to localStorage
   */
  saveConfig() {
    try {
      localStorage.setItem('pixospritz-ai-config', JSON.stringify(this.config));
    } catch {
      // Failed to save AI config
    }
  }

  /**
   * Update configuration
   * @param {object} newConfig - Configuration updates
   */
  updateConfig(newConfig) {
    this.config = { ...this.config, ...newConfig };
    this.saveConfig();
  }

  /**
   * Get current configuration
   * @returns {object}
   */
  getConfig() {
    return { ...this.config };
  }

  /**
   * Check if the service is ready to generate.
   * Local providers need no API key — just a running server.
   * @returns {boolean}
   */
  isConfigured() {
    const meta = PROVIDER_META[this.config.provider];
    if (meta && !meta.requiresKey) return true;
    return Boolean(this.config.apiKey);
  }

  /**
   * Base URL for the active local provider (override-aware).
   * @returns {string|null}
   */
  getLocalBaseUrl() {
    const meta = PROVIDER_META[this.config.provider];
    if (!meta || meta.group !== 'local') return null;
    const base = (this.config.localEndpoint || meta.defaultEndpoint).replace(/\/$/, '');
    return base;
  }

  /**
   * Health-check a local provider: is the server up, and which
   * models does it advertise? Never throws — returns a status object.
   * @returns {Promise<{ok:boolean, models:string[], error?:string}>}
   */
  async checkLocalHealth() {
    const meta = PROVIDER_META[this.config.provider];
    if (!meta || meta.group !== 'local') {
      return { ok: false, models: [], error: 'not a local provider' };
    }
    const base = this.getLocalBaseUrl();
    try {
      const res = await fetch(base + meta.healthPath, { method: 'GET' });
      if (!res.ok) {
        return { ok: false, models: [], error: `server responded ${res.status}` };
      }
      const data = await res.json().catch(() => ({}));
      // Ollama: { models: [{ name }] }; OpenAI-compat: { data: [{ id }] }
      const models = (data.models ?? data.data ?? [])
        .map(m => m.name ?? m.id)
        .filter(Boolean);
      return { ok: true, models };
    } catch (err) {
      return {
        ok: false,
        models: [],
        error: `cannot reach ${base} — is the server running? (${err?.message ?? 'network error'})`,
      };
    }
  }

  /**
   * Get headers for API requests
   * @returns {object}
   */
  getHeaders() {
    const headers = {
      'Content-Type': 'application/json',
    };

    switch (this.config.provider) {
      case AI_PROVIDERS.OPENAI:
        headers['Authorization'] = `Bearer ${this.config.apiKey}`;
        break;
      case AI_PROVIDERS.ANTHROPIC:
        headers['x-api-key'] = this.config.apiKey;
        headers['anthropic-version'] = '2023-06-01';
        break;
      case AI_PROVIDERS.GOOGLE:
        // Google uses query param for API key
        break;
      default:
        headers['Authorization'] = `Bearer ${this.config.apiKey}`;
    }

    return headers;
  }

  /**
   * Make a chat completion request with optional structured output
   * @param {string} prompt - The user prompt
   * @param {string} [systemPrompt] - Optional system prompt
   * @param {object} [schema] - Optional JSON schema for structured output
   * @param {object} [options] - Additional options
   * @returns {Promise<object>}
   */
  async chatCompletion(prompt, systemPrompt = null, schema = null, options = {}) {
    const { provider } = this.config;
    const meta = PROVIDER_META[provider];

    if (meta?.requiresKey && !this.config.apiKey) {
      throw new Error(
        `API key not configured for ${meta.label}. Local providers (Ollama, llama.cpp, LM Studio) need no key.`
      );
    }

    switch (provider) {
      case AI_PROVIDERS.OLLAMA:
      case AI_PROVIDERS.LLAMACPP:
      case AI_PROVIDERS.LMSTUDIO:
        return this.localChatCompletion(prompt, systemPrompt, schema, options);
      case AI_PROVIDERS.OPENAI:
        return this.openAIChatCompletion(prompt, systemPrompt, schema, options);
      case AI_PROVIDERS.ANTHROPIC:
        return this.anthropicChatCompletion(prompt, systemPrompt, schema, options);
      case AI_PROVIDERS.GOOGLE:
        return this.googleChatCompletion(prompt, systemPrompt, schema, options);
      case AI_PROVIDERS.CUSTOM:
        return this.customChatCompletion(prompt, systemPrompt, schema, options);
      default:
        throw new Error(`Unsupported provider: ${provider}`);
    }
  }

  /**
   * Local chat completion via an OpenAI-compatible endpoint
   * (Ollama /v1, llama.cpp server /v1, LM Studio /v1).
   */
  async localChatCompletion(prompt, systemPrompt, schema, options) {
    const meta = PROVIDER_META[this.config.provider];
    const base = this.getLocalBaseUrl();
    const url = base + meta.chatPath;

    const messages = [];
    if (systemPrompt) {
      messages.push({ role: 'system', content: systemPrompt });
    }
    messages.push({ role: 'user', content: prompt });

    const body = {
      model: options.model || this.config.models.chat || 'default',
      messages,
      temperature: options.temperature ?? 0.7,
      max_tokens: options.maxTokens ?? 4096,
      stream: false,
    };

    // Best-effort structured output: many local servers honor json_object.
    if (schema) {
      body.response_format = { type: 'json_object' };
      messages[messages.length - 1].content +=
        `\n\nRespond with JSON matching this schema:\n${JSON.stringify(schema)}`;
    }

    let response;
    try {
      response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
    } catch (err) {
      throw new Error(
        `Cannot reach the local model server at ${url}. ` +
          `Start it first (${meta.label}: ${meta.description})`
      );
    }

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.error?.message || `${meta.label} error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content ?? data.message?.content ?? '';

    if (schema && content) {
      try {
        const jsonMatch = typeof content === 'string' ? content.match(/\{[\s\S]*\}/) : null;
        return jsonMatch ? JSON.parse(jsonMatch[0]) : content;
      } catch {
        return content;
      }
    }
    return content;
  }

  /**
   * OpenAI Chat Completion
   */
  async openAIChatCompletion(prompt, systemPrompt, schema, options) {
    const messages = [];

    if (systemPrompt) {
      messages.push({ role: 'system', content: systemPrompt });
    }
    messages.push({ role: 'user', content: prompt });

    const body = {
      model: options.model || this.config.models.chat,
      messages,
      temperature: options.temperature ?? 0.7,
      max_tokens: options.maxTokens ?? 4096,
    };

    // Add structured output if schema provided
    if (schema) {
      body.response_format = {
        type: 'json_schema',
        json_schema: {
          name: schema.name || 'response',
          strict: true,
          schema: schema,
        },
      };
    }

    let response;
    try {
      response = await fetch(ENDPOINTS[AI_PROVIDERS.OPENAI].chat, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify(body),
      });
    } catch (err) {
      // CORS or network error
      if (err.message?.includes('Failed to fetch') || err.name === 'TypeError') {
        throw new Error(
          'Unable to reach OpenAI API. This is likely due to CORS restrictions. ' +
            'Direct browser calls to OpenAI are blocked. Please use the "Custom" provider ' +
            'with a proxy server, or run the editor from a server that proxies API requests.'
        );
      }
      throw err;
    }

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.error?.message || `OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices[0]?.message?.content;

    // Parse JSON if structured output was requested
    if (schema && content) {
      try {
        return JSON.parse(content);
      } catch {
        // Failed to parse as JSON, return raw content
        return content;
      }
    }

    return content;
  }

  /**
   * Anthropic Chat Completion
   */
  async anthropicChatCompletion(prompt, systemPrompt, schema, options) {
    const messages = [{ role: 'user', content: prompt }];

    const body = {
      model: options.model || this.config.models.chat || 'claude-3-5-sonnet-20241022',
      max_tokens: options.maxTokens ?? 4096,
      messages,
    };

    if (systemPrompt) {
      body.system = systemPrompt;
    }

    // For structured output with Anthropic, include schema in system prompt
    if (schema) {
      const schemaPrompt = `\n\nYou must respond with valid JSON matching this schema:\n${JSON.stringify(schema, null, 2)}`;
      body.system = (body.system || '') + schemaPrompt;
    }

    const response = await fetch(ENDPOINTS[AI_PROVIDERS.ANTHROPIC].chat, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.error?.message || `Anthropic API error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.content[0]?.text;

    // Parse JSON if structured output was requested
    if (schema && content) {
      try {
        // Extract JSON from the response (Anthropic may wrap it in text)
        const jsonMatch = content.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          return JSON.parse(jsonMatch[0]);
        }
      } catch {
        // Failed to parse as JSON
      }
    }

    return content;
  }

  /**
   * Google Chat Completion (Gemini)
   */
  async googleChatCompletion(prompt, systemPrompt, schema, options) {
    const model = options.model || this.config.models.chat || 'gemini-pro';
    const url = `${ENDPOINTS[AI_PROVIDERS.GOOGLE].chat}/${model}:generateContent?key=${this.config.apiKey}`;

    const parts = [];
    if (systemPrompt) {
      parts.push({ text: systemPrompt });
    }
    parts.push({ text: prompt });

    if (schema) {
      parts.push({
        text: `\n\nRespond with valid JSON matching this schema:\n${JSON.stringify(schema, null, 2)}`,
      });
    }

    const body = {
      contents: [{ parts }],
      generationConfig: {
        temperature: options.temperature ?? 0.7,
        maxOutputTokens: options.maxTokens ?? 4096,
      },
    };

    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.error?.message || `Google API error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.candidates[0]?.content?.parts[0]?.text;

    if (schema && content) {
      try {
        const jsonMatch = content.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          return JSON.parse(jsonMatch[0]);
        }
      } catch {
        // Failed to parse as JSON
      }
    }

    return content;
  }

  /**
   * Custom endpoint chat completion
   */
  async customChatCompletion(prompt, systemPrompt, schema, options) {
    if (!this.config.customEndpoint) {
      throw new Error('Custom endpoint not configured');
    }

    // Use OpenAI-compatible format for custom endpoints
    const messages = [];
    if (systemPrompt) {
      messages.push({ role: 'system', content: systemPrompt });
    }
    messages.push({ role: 'user', content: prompt });

    const body = {
      model: options.model || 'default',
      messages,
      temperature: options.temperature ?? 0.7,
      max_tokens: options.maxTokens ?? 4096,
    };

    if (schema) {
      body.response_format = { type: 'json_object' };
      messages[messages.length - 1].content +=
        `\n\nRespond with JSON matching: ${JSON.stringify(schema)}`;
    }

    const response = await fetch(this.config.customEndpoint, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.error?.message || `API error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || data.content || data.response;

    if (schema && content) {
      try {
        return typeof content === 'string' ? JSON.parse(content) : content;
      } catch {
        // Failed to parse as JSON
      }
    }

    return content;
  }

  /**
   * Generate an image using DALL-E or compatible API with retry logic
   * @param {string} prompt - Image description
   * @param {object} [options] - Generation options
   * @param {function} [options.onRetry] - Callback for retry status updates
   * @returns {Promise<string>} - Base64 image data or URL
   */
  async generateImage(prompt, options = {}) {
    const meta = PROVIDER_META[this.config.provider];

    // Local path: SD-compatible (or OpenAI-compatible) image endpoint.
    if (meta?.group === 'local') {
      const endpoint = this.config.localImageEndpoint;
      if (!endpoint) {
        throw new Error(
          'No local image endpoint configured. Set one in AI settings ' +
            '(e.g. a ComfyUI / SD WebUI API URL), or switch to a cloud provider. ' +
            'See the model catalog for per-tier recommendations.'
        );
      }
      return this.localGenerateImage(endpoint, prompt, options);
    }

    if (!this.config.apiKey) {
      throw new Error('API key not configured');
    }

    // Currently only OpenAI has direct image generation support
    if (this.config.provider !== AI_PROVIDERS.OPENAI) {
      throw new Error(`Image generation not supported for provider: ${this.config.provider}`);
    }

    const body = {
      model: options.model || this.config.models.image || 'dall-e-3',
      prompt,
      n: 1,
      size: options.size || '1024x1024',
      quality: options.quality || 'standard',
      response_format: 'b64_json',
    };

    let lastError = null;

    for (let attempt = 0; attempt < RATE_LIMIT_CONFIG.maxRetries; attempt++) {
      let response;
      try {
        response = await fetch(ENDPOINTS[AI_PROVIDERS.OPENAI].image, {
          method: 'POST',
          headers: this.getHeaders(),
          body: JSON.stringify(body),
        });
      } catch (err) {
        // CORS or network error
        if (err.message?.includes('Failed to fetch') || err.name === 'TypeError') {
          throw new Error(
            'Unable to reach OpenAI Image API. This is likely due to CORS restrictions. ' +
              'Direct browser calls to OpenAI are blocked. Please use a proxy server ' +
              'or run the editor from a server that proxies API requests.'
          );
        }
        throw err;
      }

      if (response.ok) {
        const data = await response.json();
        return data.data[0]?.b64_json;
      }

      const errorBody = await response.json().catch(() => ({}));

      // Check if it's a rate limit error
      if (isRateLimitError(response, errorBody) && attempt < RATE_LIMIT_CONFIG.maxRetries - 1) {
        const delay = Math.min(
          parseRateLimitDelay(response, errorBody) * Math.pow(1.5, attempt),
          RATE_LIMIT_CONFIG.maxDelayMs
        );

        // Notify about retry
        if (options.onRetry) {
          options.onRetry({
            attempt: attempt + 1,
            maxRetries: RATE_LIMIT_CONFIG.maxRetries,
            delayMs: delay,
            message: `Rate limited. Waiting ${Math.ceil(delay / 1000)}s before retry...`,
          });
        }

        await sleep(delay);
        continue;
      }

      lastError = errorBody.error?.message || `Image generation error: ${response.status}`;
      break;
    }

    throw new Error(lastError);
  }

  /**
   * Image generation against a user-configured local endpoint.
   * Accepts OpenAI-style `{ data: [{ b64_json | url }] }` responses.
   */
  async localGenerateImage(endpoint, prompt, options = {}) {
    const body = {
      prompt,
      n: 1,
      size: options.size || '1024x1024',
      ...(options.model ? { model: options.model } : {}),
    };
    let response;
    try {
      response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
    } catch (err) {
      throw new Error(
        `Cannot reach the local image endpoint at ${endpoint}. ${err?.message ?? ''}`.trim()
      );
    }
    if (!response.ok) {
      throw new Error(`Local image generation failed: ${response.status}`);
    }
    const data = await response.json().catch(() => ({}));
    const item = data.data?.[0];
    if (item?.b64_json) return item.b64_json;
    if (item?.url) {
      // Fetch remote URL and convert to base64 so callers keep one contract
      const img = await fetch(item.url);
      const buf = await img.arrayBuffer();
      let binary = '';
      const bytes = new Uint8Array(buf);
      for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i]);
      return btoa(binary);
    }
    throw new Error('Local image endpoint returned an unexpected response shape.');
  }

  /**
   * Generate audio using text-to-speech API with retry logic
   * @param {string} text - Text to convert to speech
   * @param {object} [options] - Generation options
   * @param {function} [options.onRetry] - Callback for retry status updates
   * @returns {Promise<ArrayBuffer>} - Audio data
   */
  async generateAudio(text, options = {}) {
    const meta = PROVIDER_META[this.config.provider];

    // Local path: user-configured TTS endpoint returning audio bytes.
    if (meta?.group === 'local') {
      const endpoint = this.config.localAudioEndpoint;
      if (!endpoint) {
        throw new Error(
          'No local TTS endpoint configured. Set one in AI settings ' +
            '(e.g. a Piper / Coqui XTTS server), or switch to a cloud provider.'
        );
      }
      let response;
      try {
        response = await fetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text, voice: options.voice ?? 'default', format: options.format ?? 'mp3' }),
        });
      } catch (err) {
        throw new Error(
          `Cannot reach the local TTS endpoint at ${endpoint}. ${err?.message ?? ''}`.trim()
        );
      }
      if (!response.ok) {
        throw new Error(`Local audio generation failed: ${response.status}`);
      }
      return await response.arrayBuffer();
    }

    if (!this.config.apiKey) {
      throw new Error('API key not configured');
    }

    if (this.config.provider !== AI_PROVIDERS.OPENAI) {
      throw new Error(`Audio generation not supported for provider: ${this.config.provider}`);
    }

    const body = {
      model: options.model || this.config.models.audio || 'tts-1',
      input: text,
      voice: options.voice || 'alloy',
      response_format: options.format || 'mp3',
    };

    let lastError = null;

    for (let attempt = 0; attempt < RATE_LIMIT_CONFIG.maxRetries; attempt++) {
      const response = await fetch(ENDPOINTS[AI_PROVIDERS.OPENAI].audio, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify(body),
      });

      if (response.ok) {
        return await response.arrayBuffer();
      }

      const errorBody = await response.json().catch(() => ({}));

      // Check if it's a rate limit error
      if (isRateLimitError(response, errorBody) && attempt < RATE_LIMIT_CONFIG.maxRetries - 1) {
        const delay = Math.min(
          parseRateLimitDelay(response, errorBody) * Math.pow(1.5, attempt),
          RATE_LIMIT_CONFIG.maxDelayMs
        );

        // Notify about retry
        if (options.onRetry) {
          options.onRetry({
            attempt: attempt + 1,
            maxRetries: RATE_LIMIT_CONFIG.maxRetries,
            delayMs: delay,
            message: `Rate limited. Waiting ${Math.ceil(delay / 1000)}s before retry...`,
          });
        }

        await sleep(delay);
        continue;
      }

      lastError = errorBody.error?.message || `Audio generation error: ${response.status}`;
      break;
    }

    throw new Error(lastError);
  }
}

// Export singleton instance
export const aiService = new AIService();
export default aiService;
