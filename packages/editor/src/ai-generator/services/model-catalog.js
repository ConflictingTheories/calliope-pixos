/**
 * ---------------------------------------------------------------
 *            AI Generator - Local Model Catalog
 * ---------------------------------------------------------------
 * Copyright (c) 2022-2025 Kyle Derby MacInnis
 *
 * Curated local models per hardware tier and modality. These are
 * recommendations, not requirements: the user can always override
 * in the UI, and any OpenAI-compatible model works with the local
 * providers.
 *
 * REVIEW NOTE (for Kyle): model names are a best-effort curation
 * as of late 2026 and will drift. Treat the catalog as a starting
 * point — the structure (tier + modality + pull/install hint) is
 * the durable part; the specific tags should be refreshed
 * periodically.
 */

import { HARDWARE_TIERS } from './hardware-profiler.js';

/**
 * @typedef {object} ModelEntry
 * @property {string} id - stable catalog id
 * @property {string} modality - 'text' | 'image' | 'audio'
 * @property {string} tier - HARDWARE_TIERS tier this model targets
 * @property {string} provider - 'ollama' | 'local-sd' | 'local-tts'
 * @property {string} ref - pull/install reference (e.g. ollama tag)
 * @property {string} params - approximate parameter count / size class
 * @property {string} why - one-line rationale shown in the UI
 * @property {string} [endpointHint] - where the model is expected to serve
 */

export const MODEL_CATALOG = [
  // ---- Text (chat / structured generation) — served via Ollama ----
  {
    id: 'qwen2.5:3b',
    modality: 'text',
    tier: HARDWARE_TIERS.SMALL,
    provider: 'ollama',
    ref: 'ollama pull qwen2.5:3b',
    params: '~3B',
    why: 'Strong instruction-following for its size; runs comfortably in ~4 GB RAM.',
  },
  {
    id: 'llama3.1:8b',
    modality: 'text',
    tier: HARDWARE_TIERS.MEDIUM,
    provider: 'ollama',
    ref: 'ollama pull llama3.1:8b',
    params: '~8B',
    why: 'Best balance of quality and speed on 16 GB machines; good JSON discipline for tool calls.',
  },
  {
    id: 'qwen2.5:14b',
    modality: 'text',
    tier: HARDWARE_TIERS.LARGE,
    provider: 'ollama',
    ref: 'ollama pull qwen2.5:14b',
    params: '~14B',
    why: 'Noticeably better planning and schema adherence when you have 32 GB+ or a discrete GPU.',
  },
  // ---- Image — served via a local SD-compatible server (ComfyUI / SD WebUI API) ----
  {
    id: 'sd-1.5-turbo-ish',
    modality: 'image',
    tier: HARDWARE_TIERS.SMALL,
    provider: 'local-sd',
    ref: 'SD 1.5 class checkpoint (e.g. via ComfyUI)',
    params: '~1B UNet',
    why: '512px sprites on modest hardware; fast iteration for pixel-art concepts.',
    endpointHint: 'Configure a local SD-compatible image endpoint in AI settings.',
  },
  {
    id: 'sdxl-turbo',
    modality: 'image',
    tier: HARDWARE_TIERS.MEDIUM,
    provider: 'local-sd',
    ref: 'SDXL-Turbo checkpoint (e.g. via ComfyUI)',
    params: '~3.5B UNet',
    why: '1024px output in few steps; good detail for tilesets and backdrops.',
    endpointHint: 'Configure a local SD-compatible image endpoint in AI settings.',
  },
  {
    id: 'sdxl-base',
    modality: 'image',
    tier: HARDWARE_TIERS.LARGE,
    provider: 'local-sd',
    ref: 'SDXL base + refiner (e.g. via ComfyUI)',
    params: '~6.6B total',
    why: 'Highest fidelity local option when VRAM/RAM allows full pipelines.',
    endpointHint: 'Configure a local SD-compatible image endpoint in AI settings.',
  },
  // ---- Audio — served via a local TTS server ----
  {
    id: 'piper-voice',
    modality: 'audio',
    tier: HARDWARE_TIERS.SMALL,
    provider: 'local-tts',
    ref: 'Piper TTS voice (e.g. en_US-lessac-medium)',
    params: '~110M',
    why: 'Tiny, fast, fully offline neural voices — ideal for dialogue lines.',
    endpointHint: 'Configure a local TTS endpoint in AI settings.',
  },
  {
    id: 'piper-voice-hd',
    modality: 'audio',
    tier: HARDWARE_TIERS.MEDIUM,
    provider: 'local-tts',
    ref: 'Piper TTS high-quality voice',
    params: '~110M',
    why: 'Same tiny footprint with higher-quality voice models.',
    endpointHint: 'Configure a local TTS endpoint in AI settings.',
  },
  {
    id: 'xtts-v2',
    modality: 'audio',
    tier: HARDWARE_TIERS.LARGE,
    provider: 'local-tts',
    ref: 'Coqui XTTS-v2 server',
    params: '~500M',
    why: 'Voice cloning and multilingual TTS when you have headroom.',
    endpointHint: 'Configure a local TTS endpoint in AI settings.',
  },
];

/**
 * Models for a tier + modality, ordered with the tier default first.
 * Falls back to the nearest lower tier when a tier has no entry.
 */
export function modelsForTier(tier, modality) {
  const order = [HARDWARE_TIERS.SMALL, HARDWARE_TIERS.MEDIUM, HARDWARE_TIERS.LARGE];
  const idx = order.indexOf(tier);
  for (let i = idx; i >= 0; i--) {
    const found = MODEL_CATALOG.filter(m => m.tier === order[i] && m.modality === modality);
    if (found.length > 0) return found;
  }
  return [];
}

/**
 * Recommended default models for a hardware profile.
 * @param {object} profile - from profileHardware()
 * @returns {object} { text, image, audio } model entries (or null)
 */
export function recommendModels(profile) {
  const tier = profile?.tier ?? HARDWARE_TIERS.SMALL;
  return {
    text: modelsForTier(tier, 'text')[0] ?? null,
    image: modelsForTier(tier, 'image')[0] ?? null,
    audio: modelsForTier(tier, 'audio')[0] ?? null,
    tier,
  };
}

export function getModelById(id) {
  return MODEL_CATALOG.find(m => m.id === id) ?? null;
}
