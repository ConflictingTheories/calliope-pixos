/**
 * ---------------------------------------------------------------
 *                AI Service - Core Provider Abstraction
 * ---------------------------------------------------------------
 * Copyright (c) 2022-2025 Kyle Derby MacInnis
 *
 * Provides a unified interface for multiple AI providers including
 * OpenAI, Anthropic, and local/custom endpoints. Supports structured
 * outputs, image generation, audio generation, and text completion.
 */

// Supported AI providers
export const AI_PROVIDERS = {
  OPENAI: 'openai',
  ANTHROPIC: 'anthropic',
  GOOGLE: 'google',
  LOCAL: 'local',
  CUSTOM: 'custom',
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

// Default models for each provider
const DEFAULT_MODELS = {
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
      provider: AI_PROVIDERS.OPENAI,
      apiKey: '',
      customEndpoint: '',
      models: { ...DEFAULT_MODELS[AI_PROVIDERS.OPENAI] },
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
   * Check if the service is configured with an API key
   * @returns {boolean}
   */
  isConfigured() {
    return Boolean(this.config.apiKey);
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
    const { provider, apiKey } = this.config;

    if (!apiKey) {
      throw new Error('API key not configured. Please set your API key in the AI settings.');
    }

    switch (provider) {
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

    const response = await fetch(ENDPOINTS[AI_PROVIDERS.OPENAI].chat, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(body),
    });

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
      messages[messages.length - 1].content += `\n\nRespond with JSON matching: ${JSON.stringify(schema)}`;
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
      const response = await fetch(ENDPOINTS[AI_PROVIDERS.OPENAI].image, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify(body),
      });

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
   * Generate audio using text-to-speech API with retry logic
   * @param {string} text - Text to convert to speech
   * @param {object} [options] - Generation options
   * @param {function} [options.onRetry] - Callback for retry status updates
   * @returns {Promise<ArrayBuffer>} - Audio data
   */
  async generateAudio(text, options = {}) {
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
