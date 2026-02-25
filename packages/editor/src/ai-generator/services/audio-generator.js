/**
 * ---------------------------------------------------------------
 *                AI Generator - Audio Generator
 * ---------------------------------------------------------------
 * Copyright (c) 2022-2025 Kyle Derby MacInnis
 *
 * Handles generation of audio content including sound effects,
 * music, and voice/speech synthesis.
 */

import aiService from './ai-service.js';

/**
 * Available voice options for TTS
 */
export const VOICES = {
  ALLOY: 'alloy', // Neutral, balanced
  ECHO: 'echo', // Warm, smooth
  FABLE: 'fable', // British, expressive
  ONYX: 'onyx', // Deep, authoritative
  NOVA: 'nova', // Friendly, upbeat
  SHIMMER: 'shimmer', // Clear, youthful
};

/**
 * Audio format options
 */
export const AUDIO_FORMATS = {
  MP3: 'mp3',
  WAV: 'wav',
  OGG: 'ogg',
  OPUS: 'opus',
  AAC: 'aac',
  FLAC: 'flac',
};

/**
 * Generate speech from text using TTS
 * @param {string} text - Text to convert to speech
 * @param {object} options - Generation options
 * @returns {Promise<ArrayBuffer>} Audio data
 */
export async function generateSpeech(text, options = {}) {
  const voice = options.voice || VOICES.ALLOY;
  const format = options.format || AUDIO_FORMATS.MP3;
  const speed = options.speed || 1.0;

  const audioData = await aiService.generateAudio(text, {
    voice,
    format,
    speed,
  });

  return audioData;
}

/**
 * Generate dialogue audio for a character
 * @param {string} dialogue - The dialogue text
 * @param {object} characterConfig - Character voice settings
 * @returns {Promise<ArrayBuffer>} Audio data
 */
export async function generateDialogueAudio(dialogue, characterConfig = {}) {
  // Map character traits to voices
  const voiceMapping = {
    male: VOICES.ONYX,
    female: VOICES.NOVA,
    child: VOICES.SHIMMER,
    elder: VOICES.FABLE,
    neutral: VOICES.ALLOY,
    villain: VOICES.ECHO,
  };

  const voice = characterConfig.voice || voiceMapping[characterConfig.type] || VOICES.ALLOY;
  const speed = characterConfig.speed || 1.0;

  return generateSpeech(dialogue, { voice, speed });
}

/**
 * Generate multiple dialogue lines and return as a collection
 * @param {Array<{text: string, character: object}>} dialogues - Array of dialogue entries
 * @param {function} onProgress - Progress callback
 * @returns {Promise<Array<{text: string, audio: ArrayBuffer}>>}
 */
export async function generateDialogueCollection(dialogues, onProgress = null) {
  const results = [];

  for (let i = 0; i < dialogues.length; i++) {
    const { text, character } = dialogues[i];

    if (onProgress) {
      onProgress({
        current: i + 1,
        total: dialogues.length,
        text,
      });
    }

    try {
      const audio = await generateDialogueAudio(text, character);
      results.push({ text, audio, success: true });
    } catch (error) {
      results.push({ text, audio: null, success: false, error: error.message });
    }
  }

  return results;
}

/**
 * Convert ArrayBuffer to Base64
 * @param {ArrayBuffer} buffer - Audio buffer
 * @returns {string} Base64 encoded string
 */
export function arrayBufferToBase64(buffer) {
  let binary = '';
  const bytes = new Uint8Array(buffer);
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

/**
 * Convert Base64 to ArrayBuffer
 * @param {string} base64 - Base64 encoded string
 * @returns {ArrayBuffer}
 */
export function base64ToArrayBuffer(base64) {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes.buffer;
}

/**
 * Create a Blob from audio ArrayBuffer
 * @param {ArrayBuffer} buffer - Audio data
 * @param {string} format - Audio format
 * @returns {Blob}
 */
export function createAudioBlob(buffer, format = 'mp3') {
  const mimeTypes = {
    mp3: 'audio/mpeg',
    wav: 'audio/wav',
    ogg: 'audio/ogg',
    opus: 'audio/opus',
    aac: 'audio/aac',
    flac: 'audio/flac',
  };

  return new Blob([buffer], { type: mimeTypes[format] || 'audio/mpeg' });
}

/**
 * Create a data URI from audio buffer
 * @param {ArrayBuffer} buffer - Audio data
 * @param {string} format - Audio format
 * @returns {string} Data URI
 */
export function createAudioDataUri(buffer, format = 'mp3') {
  const mimeTypes = {
    mp3: 'audio/mpeg',
    wav: 'audio/wav',
    ogg: 'audio/ogg',
    opus: 'audio/opus',
    aac: 'audio/aac',
    flac: 'audio/flac',
  };

  const base64 = arrayBufferToBase64(buffer);
  return `data:${mimeTypes[format] || 'audio/mpeg'};base64,${base64}`;
}

/**
 * Estimate the duration of generated speech
 * @param {string} text - Text to be spoken
 * @param {number} speed - Speech speed multiplier
 * @returns {number} Estimated duration in seconds
 */
export function estimateSpeechDuration(text, speed = 1.0) {
  // Average speaking rate is about 150 words per minute
  // or about 2.5 words per second
  const words = text.split(/\s+/).length;
  const baseDuration = words / 2.5;
  return baseDuration / speed;
}

/**
 * Generate a placeholder/silent audio of specified duration
 * This is useful for creating silent pauses or placeholders
 * @param {number} duration - Duration in seconds
 * @param {number} sampleRate - Sample rate (default 44100)
 * @returns {ArrayBuffer} WAV audio data
 */
export function generateSilentAudio(duration, sampleRate = 44100) {
  const numChannels = 1;
  const numSamples = Math.floor(duration * sampleRate);
  const bytesPerSample = 2; // 16-bit
  const dataSize = numSamples * numChannels * bytesPerSample;
  const fileSize = 44 + dataSize;

  const buffer = new ArrayBuffer(fileSize);
  const view = new DataView(buffer);

  // WAV header
  const writeString = (offset, str) => {
    for (let i = 0; i < str.length; i++) {
      view.setUint8(offset + i, str.charCodeAt(i));
    }
  };

  writeString(0, 'RIFF');
  view.setUint32(4, fileSize - 8, true);
  writeString(8, 'WAVE');
  writeString(12, 'fmt ');
  view.setUint32(16, 16, true); // Subchunk1Size
  view.setUint16(20, 1, true); // AudioFormat (PCM)
  view.setUint16(22, numChannels, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * numChannels * bytesPerSample, true); // ByteRate
  view.setUint16(32, numChannels * bytesPerSample, true); // BlockAlign
  view.setUint16(34, bytesPerSample * 8, true); // BitsPerSample
  writeString(36, 'data');
  view.setUint32(40, dataSize, true);

  // Data is already zeros (silent)

  return buffer;
}

export default {
  VOICES,
  AUDIO_FORMATS,
  generateSpeech,
  generateDialogueAudio,
  generateDialogueCollection,
  arrayBufferToBase64,
  base64ToArrayBuffer,
  createAudioBlob,
  createAudioDataUri,
  estimateSpeechDuration,
  generateSilentAudio,
};
