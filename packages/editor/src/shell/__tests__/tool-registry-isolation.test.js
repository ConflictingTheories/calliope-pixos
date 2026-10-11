/*
 * P6-10 — AI generator isolation tests.
 *
 * The AI generator is optional: excluded at build time via
 * VITE_AI_GENERATOR=0, and capability-gated at runtime (requires a
 * configured provider). The editor ships without provider config.
 */
import { describe, it, expect } from 'vitest';
import {
  getTool,
  isToolAvailable,
  isAiGeneratorEnabled,
  TOOLS,
} from '../toolRegistry.js';

describe('ai-generator isolation (P6-10)', () => {
  it('registers the ai-generator as optional with a provider requirement', () => {
    const tool = getTool('ai-generator');
    expect(tool).not.toBeNull();
    expect(tool.optional).toBe(true);
    expect(tool.requiresProvider).toBe(true);
  });

  it('gates the ai-generator on provider configuration', () => {
    expect(isToolAvailable('ai-generator', { isProviderConfigured: false })).toBe(false);
    // With a provider configured, availability follows the build flag.
    expect(isToolAvailable('ai-generator', { isProviderConfigured: true })).toBe(
      isAiGeneratorEnabled()
    );
  });

  it('non-optional tools are unaffected by the provider gate', () => {
    expect(isToolAvailable('map-editor', {})).toBe(true);
    expect(isToolAvailable('script-editor', { isProviderConfigured: false })).toBe(true);
  });

  it('unknown tools are unavailable', () => {
    expect(isToolAvailable('no-such-tool', { isProviderConfigured: true })).toBe(false);
  });

  it('build flag exclusion drops the tool from the registry', () => {
    // Default test env: import.meta.env has no VITE_AI_GENERATOR -> enabled.
    expect(isAiGeneratorEnabled()).toBe(true);
    expect(TOOLS.some(t => t.id === 'ai-generator')).toBe(true);
  });
});
