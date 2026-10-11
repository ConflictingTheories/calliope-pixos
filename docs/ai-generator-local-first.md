# AI Generator — Local-First Architecture

Decision: the AI asset generator (`packages/editor/src/ai-generator/`) is a
**local-first, optional plugin**. It runs behind the `VITE_AI_GENERATOR` toggle,
has no hard dependency from the editor shell, and needs no API keys, accounts,
or subscriptions in its default configuration.

## Provider layer (`services/ai-service.js`)

Providers are grouped:

- **Local (default):** Ollama, llama.cpp server, LM Studio — all speak
  OpenAI-compatible chat APIs (`/v1/chat/completions`, `/v1/models`). Default
  provider is **Ollama** at `http://localhost:11434`. Local providers need no
  API key; `isConfigured()` returns true for them.
- **Cloud (opt-in, "advanced"):** OpenAI, Anthropic, Google, Custom. Demoted but
  not deleted — same code paths as before, clearly labeled as requiring the
  user's own key/subscription. PixoSpritz never sees or stores these keys
  anywhere but the local config.

New capabilities:
- `PROVIDER_META` — per-provider label, group, key requirement, default
  endpoint, chat/health paths, description.
- `getLocalBaseUrl()` — per-provider endpoint resolution with user override.
- `checkLocalHealth()` — never throws; returns `{ ok, models, error }`.
- `localChatCompletion()` — OpenAI-compatible POST, best-effort
  `response_format: { type: 'json_object' }` for providers that support it
  (Ollama yes; llama.cpp mostly yes; LM Studio yes).
- `localGenerateImage()` / `generateImage()` / `generateAudio()` route through
  the configured local image/TTS endpoint (SD- or TTS-compatible server) when
  set, and return clear "not configured" errors otherwise. Without a local
  image/audio endpoint, those modalities fall back to a cloud provider only if
  the user configured one.

## Hardware profiler + model catalog

`services/hardware-profiler.js`:
- `profileHardware(env)` — never throws. Node: `os.totalmem()` / `os.cpus()`
  (via injectable `env.nodeOs` for tests); browser:
  `navigator.hardwareConcurrency`, `navigator.deviceMemory`,
  `performance.memory`, `navigator.gpu` WebGPU adapter heuristic. Unknown
  values degrade gracefully to the conservative tier.
- `tierForHardware({ ramGB, discreteGpu })` — small (≤8 GB), medium (16 GB),
  large (32 GB+ or discrete GPU).

`services/model-catalog.js`:
- `MODEL_CATALOG` — curated text/image/audio models with `why` notes and
  per-tier membership (e.g. qwen2.5:3b → small, llama3.1:8b → medium,
  qwen2.5:14b → large).
- `recommendModels(profile)` → per-modality recommendation for the detected tier.

> ⚠️ **For Kyle's review:** model tags are best-guess curation (late 2026) and
> the RAM thresholds (8/16/32) are heuristic. Adjust in `model-catalog.js` and
> `hardware-profiler.js`.

## Tool layer (`services/ai-tools.js`)

MCP-style dispatch: every generation capability is a tool with
`name`, `description`, `inputSchema` (JSON Schema), and `handler`.
`validateToolArgs` enforces required fields, primitive types, and enums before
a handler runs; `runTool(name, args, ctx)` returns a uniform
`{ ok, tool, result | error }` envelope and never throws.

Tools: `generate_sprite`, `generate_sprite_config`, `generate_spritesheet_image`,
`generate_portrait`, `generate_tileset`, `generate_audio`, `generate_script`,
`generate_cutscene`, `create_pixozine_scaffold`, `list_project_assets`.

`services/asset-orchestrator.js` dispatches through `runTool` via
`this.callTool(name, args, onRetry)` instead of calling generator functions
directly. Orchestration (retries, file writing, progress) stays in the
orchestrator; model interaction goes through the tool registry.

## Context assembler (`services/context-assembler.js`)

`assembleContext({ includeCurrentFile, includeProject, includeAssets,
currentDocument, projectRepository, manifest, selection })` builds a budgeted
structured context:
- file content capped at 8k chars, asset listings at 120 entries, manifest at
  4k, total summary at 12k chars — each truncation is noted in the output.
- `describeInclusion()` renders a human-readable line ("current file + assets")
  so the UI can show exactly what the model will see.

## UI (`index.jsx`, `SetupPanel.jsx`)

- New **Setup** tab: provider picker (local group default, cloud group labeled
  "your own key (advanced)"), per-provider endpoint/key fields, connection
  check with detected model list, hardware tier card with recommended models
  and text-model override, and **explicit context toggles** (current file /
  project listing / assets) — the user controls what the model sees; nothing is
  included silently.
- `handleGenerate` assembles context once per run (per the toggles) and passes
  it to both orchestrators.

## Tests

`services/__tests__/`: `hardware-profiler.test.js` (tier mapping with injected
env), `ai-tools.test.js` (schema validation, registry shape, error envelope),
`context-assembler.test.js` (toggles, truncation, broken-repository resilience).
Run with the editor's vitest suite. **Note: not executed here** — no
`node_modules` in this environment; run `npm install && npm test` before merge.
