/**
 * ---------------------------------------------------------------
 *            AI Generator - Setup Panel
 * ---------------------------------------------------------------
 * Copyright (c) 2022-2025 Kyle Derby MacInnis
 *
 * Local-first provider setup: choose a local model server
 * (Ollama / llama.cpp / LM Studio — no key, no account) or opt
 * in to a cloud provider with your own key. Shows hardware tier,
 * recommended models, and project-context controls.
 */

import React, { useState, useEffect, useCallback } from 'react';
import { Button, Input, SelectPicker, Message, Toggle, Divider } from '../ui';
import {
  aiService,
  AI_PROVIDERS,
  PROVIDER_META,
  profileHardware,
  recommendModels,
  modelsForTier,
} from './services/index.js';

const LOCAL_PROVIDERS = [AI_PROVIDERS.OLLAMA, AI_PROVIDERS.LLAMACPP, AI_PROVIDERS.LMSTUDIO];
const CLOUD_PROVIDERS = [AI_PROVIDERS.OPENAI, AI_PROVIDERS.ANTHROPIC, AI_PROVIDERS.GOOGLE, AI_PROVIDERS.CUSTOM];

function providerOptions() {
  const local = LOCAL_PROVIDERS.map(id => ({
    label: `${PROVIDER_META[id].label} — no key needed`,
    value: id,
    groupBy: 'local',
  }));
  const cloud = CLOUD_PROVIDERS.map(id => ({
    label: `${PROVIDER_META[id].label} — own key`,
    value: id,
    groupBy: 'cloud',
  }));
  return [...local, ...cloud];
}

export default function SetupPanel({ contextFlags, onContextFlagsChange }) {
  const [config, setConfig] = useState(() => aiService.getConfig());
  const [health, setHealth] = useState(null);
  const [checking, setChecking] = useState(false);
  const [profile, setProfile] = useState(null);
  const [recommended, setRecommended] = useState(null);

  const meta = PROVIDER_META[config.provider] ?? {};
  const isLocal = meta.group === 'local';

  useEffect(() => {
    let cancelled = false;
    profileHardware().then(p => {
      if (cancelled) return;
      setProfile(p);
      setRecommended(recommendModels(p));
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const update = useCallback(
    patch => {
      aiService.updateConfig(patch);
      setConfig(aiService.getConfig());
    },
    []
  );

  const checkHealth = useCallback(async () => {
    setChecking(true);
    setHealth(null);
    const result = await aiService.checkLocalHealth();
    setHealth(result);
    setChecking(false);
  }, []);

  const setModel = useCallback(
    kind => value => {
      update({ models: { ...aiService.getConfig().models, [kind]: value } });
    },
    [update]
  );

  return (
    <div className="ai-setup-panel">
      {/* Provider */}
      <section className="ai-setup-section">
        <h4>Provider</h4>
        <SelectPicker
          data={providerOptions()}
          value={config.provider}
          onChange={value => update({ provider: value })}
          groupBy="groupBy"
          cleanable={false}
          searchable={false}
          style={{ width: '100%' }}
          renderMenuGroup={label => (
            <span>{label === 'local' ? 'Local — no key, no account' : 'Cloud — your own key (advanced)'}</span>
          )}
        />
        <p className="ai-setup-hint">{meta.description}</p>

        {isLocal && (
          <>
            <label>Server URL (override)</label>
            <Input
              value={config.localEndpoint || ''}
              placeholder={meta.defaultEndpoint}
              onChange={value => update({ localEndpoint: value })}
            />
            <div className="ai-setup-row">
              <Button size="sm" onClick={checkHealth} loading={checking}>
                Check connection
              </Button>
              {health && (
                <span className={health.ok ? 'ai-health-ok' : 'ai-health-bad'}>
                  {health.ok
                    ? `Connected — ${health.models.length} model(s): ${health.models.slice(0, 5).join(', ')}${health.models.length > 5 ? '…' : ''}`
                    : `Not reachable: ${health.error}`}
                </span>
              )}
            </div>
            <label>Local image endpoint (SD-compatible, optional)</label>
            <Input
              value={config.localImageEndpoint || ''}
              placeholder="http://localhost:7860/…"
              onChange={value => update({ localImageEndpoint: value })}
            />
            <label>Local TTS endpoint (optional)</label>
            <Input
              value={config.localAudioEndpoint || ''}
              placeholder="http://localhost:8000/…"
              onChange={value => update({ localAudioEndpoint: value })}
            />
          </>
        )}

        {!isLocal && meta.requiresKey && (
          <>
            <label>{meta.label} API key</label>
            <Input
              type="password"
              value={config.apiKey || ''}
              placeholder="Your own key — billed by the provider, no PixoSpritz subscription"
              onChange={value => update({ apiKey: value })}
            />
          </>
        )}

        {!isLocal && config.provider === AI_PROVIDERS.CUSTOM && (
          <>
            <label>Custom endpoint URL</label>
            <Input
              value={config.customEndpoint || ''}
              placeholder="https://your-proxy/v1/chat/completions"
              onChange={value => update({ customEndpoint: value })}
            />
          </>
        )}
      </section>

      <Divider />

      {/* Hardware + models */}
      <section className="ai-setup-section">
        <h4>Hardware &amp; models</h4>
        {profile ? (
          <div className="ai-hardware-card">
            <div>
              <strong>{profile.tierLabel}</strong>
            </div>
            <div className="ai-setup-hint">
              {profile.ramGB != null ? `${profile.ramGB} GB RAM` : 'RAM unknown'}
              {profile.cpuCores != null ? ` · ${profile.cpuCores} cores` : ''}
              {profile.gpu.webgpu ? ' · WebGPU available' : ''}
            </div>
            {profile.notes.map((n, i) => (
              <div key={i} className="ai-setup-hint">
                {n}
              </div>
            ))}
          </div>
        ) : (
          <p className="ai-setup-hint">Detecting hardware…</p>
        )}

        {recommended && (
          <>
            {['text', 'image', 'audio'].map(modality => {
              const rec = recommended[modality];
              return (
                <div key={modality} className="ai-model-row">
                  <label style={{ textTransform: 'capitalize' }}>{modality} model</label>
                  {modality === 'text' ? (
                    <Input
                      value={config.models?.chat || ''}
                      placeholder={rec ? rec.id : 'model tag'}
                      onChange={setModel('chat')}
                    />
                  ) : (
                    <p className="ai-setup-hint">
                      {rec ? `${rec.id} — ${rec.why}` : '—'}
                      <br />
                      Selected by your local server's endpoint above; install the model there.
                    </p>
                  )}
                  {modality === 'text' && rec && (
                    <p className="ai-setup-hint">
                      Recommended: {rec.id} — {rec.why}
                    </p>
                  )}
                </div>
              );
            })}
            <p className="ai-setup-hint">
              Recommendations follow your hardware tier; any model tag works. Image/audio
              need their local endpoints above (or a cloud provider).
            </p>
          </>
        )}
      </section>

      <Divider />

      {/* Context controls */}
      <section className="ai-setup-section">
        <h4>What the model sees</h4>
        <p className="ai-setup-hint">
          You control exactly what project context is sent with each generation. Nothing
          is included silently.
        </p>
        <div className="ai-context-toggles">
          <Toggle
            checked={!!contextFlags.includeCurrentFile}
            onChange={value => onContextFlagsChange({ ...contextFlags, includeCurrentFile: value })}
          >
            Current file
          </Toggle>
          <Toggle
            checked={!!contextFlags.includeProject}
            onChange={value => onContextFlagsChange({ ...contextFlags, includeProject: value })}
          >
            Project file listing
          </Toggle>
          <Toggle
            checked={!!contextFlags.includeAssets}
            onChange={value => onContextFlagsChange({ ...contextFlags, includeAssets: value })}
          >
            Asset inventory
          </Toggle>
        </div>
      </section>

      {!isLocal && (
        <Message type="info" showIcon>
          Cloud providers use your own API key and are billed by the provider. PixoSpritz
          has no subscription and never sees your key.
        </Message>
      )}
    </div>
  );
}
