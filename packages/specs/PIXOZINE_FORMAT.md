# Pixozine Package Format — Specification v1.1.0

A **pixozine** is the distributable content unit of the PixoSpritz ecosystem: an
interactive, playable package (game, interactive zine, playable story) authored in
SVRN publishing tooling and played by the PixoSpritz runtime.

This document is the normative spec. It replaces the aspirational "spritz"
format notes (`packages/core-js/src/spritz/readme.md`). Internal identifiers from
earlier drafts (`manifest.json`, `.pxz`, `initialZones`, …) are kept stable; only
user-facing naming moves to pixozine terminology.

**Version history:** v1.0.0 — initial versioned spec. v1.1.0 — adds the
`playables` array (playable embed blocks, §8); additive-only, old packages
migrate with no changes (§2.2).

## 1. Package layout

A pixozine is a ZIP archive (`.pxz` extension, MIME `application/x-pixozine+zip`)
with this layout:

```
example.pxz
├── manifest.json          # REQUIRED — package manifest (this spec, §2)
├── maps/                  # zone/map JSON files (map.schema.json)
├── sprites/               # sprite sheets + sprite JSON (sprite.schema.json)
├── tilesets/              # tileset images + JSON
├── audio/                 # music / sfx
├── scripts/               # pixoscript (.pxs) sources
├── cutscenes/             # cutscene definitions (.pxc)
├── shaders/               # custom GLSL
└── assets/                # thumbnails, icons, splash, misc media
```

Paths inside the archive use forward slashes, are relative, and must not escape
the archive root (`..` segments are rejected by the validator, P1-03).

## 2. Manifest (`manifest.json`)

Validated by `packages/specs/formats/manifest.schema.json`.

| Field | Required | Meaning |
|---|---|---|
| `format` | no (default `"pixozine"`) | Package kind identifier. Reserved for future kinds. |
| `formatVersion` | no (default `"1.0.0"`) | **Package format version** (semver). Absent in pre-1.0 packages; the migration runner (P1-04) fills it. |
| `title` | yes | User-facing title. |
| `version` | yes | Content version (semver). Independent of `formatVersion`. |
| `initialZones` | yes (≥1) | Entry-point zone IDs for a new game. |
| `author`, `description`, `website`, `license` | no | Provenance metadata. |
| `maps`, `sprites`, `tilesets`, `models`, `textures`, `audio`, `shaders`, `scripts`, `cutscenes`, `callbacks`, `triggers` | no | Declared asset ID lists (see §4 semantic checks). |
| `thumbnail`, `icon`, `splash` | no | Media paths (must be declared in the archive). |
| `settings` | no | Default settings (`resolution`, `fullscreen`, volumes, `language`). |
| `saveConfig` | no | Save slots / autosave configuration. |
| `requirements` | no | `webgl` (1|2), `audio`, `localStorage`, `indexedDB` flags. |
| `scriptApiVersion` | no | Host scripting API version the package targets (see §5). |
| `capabilities` | no | Capability names the package's scripts require (see §5). |
| `playables` | no (default `[]`) | Playable embed blocks: PixoSpritz game bundles playable inside this pixozine (added in v1.1.0, see §8). |
| `data` | no | Namespaced custom data (`additionalProperties: true`). |

### 2.1 Versioning

- `formatVersion` identifies the **format**, `version` identifies the **content**.
- Runtimes must reject packages whose `formatVersion` major is newer than the
  highest major they implement, with a typed error (never partial state).
- Minor/patch bumps are additive-only: older runtimes ignore unknown fields.

### 2.2 Compatibility policy — decided 2026-10-06 (P1-02)

The pixozine format is **backwards compatible and evolvable**:

- **Migrate-on-load is the default.** Packages older than the current format
  version are migrated at load time by the migration runner
  (`packages/specs/src/migrations/index.js`), then validated. There are no
  packages in the wild yet, so there is no migration risk in practice.
- **Major versions and legacy support are deferred.** v1 is the only major.
  When a v2 format is introduced, the support window for v1 packages will be
  decided then.
- **Newer majors are rejected.** Runtimes must refuse packages whose
  `formatVersion` major exceeds the highest implemented major, with a typed
  error — never partial state (see §2.1).
- **Minor/patch bumps are additive-only.** Unknown fields are allowed but
  reported as `unknown-field` info issues by the validator.

The policy is implemented in `packages/specs/src/compat.js`
(`DEFAULT_COMPAT_POLICY`, wired as the validator's default `compatPolicy`
option). Override per-call with an explicit `{ compatPolicy }`, or disable
with `compatPolicy: null`.

#### P1-02 note: format inventory deferred

P1-02 originally called for an inventory of package formats in the wild
before locking the policy. With zero pixozine packages in existence, a deep
inventory would be speculative: there is nothing to be compatible *with*
yet. The inventory is deferred until real-world packages exist; the
migrate-on-load default above is designed to absorb whatever the inventory
finds.

## 3. Related schemas

- `map.schema.json` — zone/map documents (`tileset`, `bounds` required).
- `sprite.schema.json` — sprite descriptors (`type`, `src`, `sheetSize`, `tileSize` required).
- `save.schema.json` — save-game documents (`version`, `format`, `gameId`, `timestamp`, `player` required).

All four schemas compile into the single validator (`packages/specs/src/validator.js`,
P1-03) exposing `validateManifest` / `validateMap` / `validateSave` /
`validateSprite` with structured issue codes.

## 4. Semantic rules (enforced by P1-06)

1. Every ID referenced (`initialZones`, `maps`, `sprites`, …) is declared once.
2. `initialZones` ⊆ declared maps; every entry point is reachable.
3. Declared media paths exist in the archive; archive paths don't escape root.
4. `settings.resolution` is a sane `[w, h]` pair when present.
5. Scripts/cutscenes referenced by maps exist in the archive.

Violations yield path-addressed, stable issue codes (never bare strings).

## 5. Scripting (see also P4-07 / P4-08)

- Scripts are pixoscript (`.pxs`) sources.
- The host scripting API is versioned (`scriptApiVersion`, default `"1.0.0"`).
  Packages declare required `capabilities`; the runtime grants only those.
- Published scripts execute behind the **script execution boundary**: a
  message-passing API with time/error termination and no ambient host access.
- The **trust policy** is **sandbox-by-default** (decided 2026-10-06, ADR-0004): published scripts run with default-deny capabilities; host access (network, storage) requires explicit grants. The boundary mechanism enforces the policy.

## 6. Inspection without execution

Any tool may **inspect** a pixozine (validate, migrate, list assets, build the
asset graph) without executing its scripts. The runtime's inspection mode must
never evaluate script sources.

## 7. Determinism

The asset graph (`packages/specs/src/asset-graph.js`, P1-07) is deterministic:
nodes sorted by ID, FNV-1a content hashes. Two builds of the same source tree
produce the same graph.

## 8. Playable embeds (added in format v1.1.0)

A **playable embed block** lets a pixozine contain playable PixoSpritz content —
a game, a playable tutorial step, an interactive diagram — built by the
PixoSpritz editor and published to SVRN. This is what makes PixoSpritz SVRN's
interactive layer in the tooling: the editor's "Publish to SVRN" export target
produces the bundle; the zine references it here.

Each entry of the `playables` array is a block with:

| Field | Required | Meaning |
|---|---|---|
| `id` | yes | Unique playable ID within this package. |
| `title` | yes | User-facing title. |
| `description` | no | Short description shown alongside the embed. |
| `poster` | no | Archive-relative image path shown before the player loads. |
| `playerVersion` | yes | **Pinned** PixoSpritz player version (semver, e.g. `"1.0.0"`) the bundle was built for. The runtime loads exactly this player version for the embed — no "it worked on my machine". |
| `bundle.uri` | yes | Game bundle location: an archive-relative path (checked against the archive like other media) or an absolute `https:` URL for remote bundles. |
| `bundle.manifestHash` | yes | Integrity hash of the bundle manifest: FNV-1a (8 lowercase hex chars, matching the asset graph) or SHA-256 (64 lowercase hex chars). The runtime verifies before executing. |
| `dimensions.width` / `dimensions.height` | no | Embed viewport in CSS pixels. |
| `dimensions.aspect` | no | Aspect-ratio hint (`"16:9"`) used when width/height are absent. |
| `fallback.title` / `fallback.body` / `fallback.image` | no | Content shown when the player cannot load (unsupported platform, blocked scripts, failed integrity check). A playable without a fallback renders a generic "content unavailable" notice. |

Rules:

- Playable IDs share the package's ID-uniqueness namespace (semantic check).
- `playerVersion` must be full semver (`major.minor.patch`); the runtime
  resolves the exact pinned player, never "latest".
- Remote (`https:`) bundle URIs skip archive path checks but the hash is
  still verified after download.
- Scripts inside an embedded bundle execute under the same script execution
  boundary and trust policy as the host package (§5) — embeds never widen
  the host's granted capabilities.
