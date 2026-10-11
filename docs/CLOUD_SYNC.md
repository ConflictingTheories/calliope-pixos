# SVRN Cloud Sync Architecture

**Status:** Design doc (not yet implemented)
**Depends on:** Single SVRN identity (decided 2026-10-06); hub identity provider (not yet built)
**Related:** `packages/core-js/src/engine/core/trophies/` (trophy sync provider interface — first sync consumer)

---

## 1. Principles

1. **Offline-first.** The local device is the source of truth. Sync is a merge operation, never a load operation. Every feature works fully offline; sync makes it *better*, never *possible*.
2. **Identity-keyed.** The single SVRN identity is the sync key. All synced data is namespaced `(identityId, scope, key)`. No identity → local-only mode, zero behavior change.
3. **Monotonic where possible.** Data types that only grow (trophies, unlocks, achievements) merge by union — no conflicts, ever.
4. **Explicit over magical.** The user can see what's synced, when it last synced, and force a sync. Silent data loss is the unforgivable failure.

---

## 2. What syncs

| Scope | Contents | Size class | Notes |
|---|---|---|---|
| `trophies` | Unlocked trophy ids + timestamps per game | Tiny (KB) | Union merge; implemented via `TrophySyncProvider` |
| `saves` | Save-slot payloads (not binaries) | Small–medium | Per-slot; see §5 for conflicts |
| `settings` | Engine/editor preferences, keybindings, theme | Tiny | Per-field merge |
| `projects` | Project metadata + document structure | Small | Asset binaries excluded (see §7) |

### What explicitly does NOT sync

- **Large binaries** (spritesheets, audio, video, tileset textures). These stay local-first. Sync carries **content hashes** (FNV-1a/SHA-256, same as the `.svrn` bundle manifest) so devices can verify they hold identical bytes, and re-fetch from the canonical store (SVRN hub CDN, when it exists) on demand. Rationale: binaries are large, change rarely, and are content-addressable — syncing bytes is wasteful; syncing hashes is sufficient.
- **Session-ephemeral state** (cursor positions, undo stacks, preview URLs). Never leaves the device.
- **Secrets** (API keys for optional cloud AI providers). Never synced, never logged.

---

## 3. Identity model

- The SVRN identity provider issues a stable `identityId` + short-lived access tokens.
- All clients (PixoSpritz editor, zine editor, LightTable, web player) authenticate against the hub and receive the same `identityId`.
- Sync storage is keyed `(identityId, scope, key)` server-side. Clients never see other identities' data.
- **Signed-out behavior:** everything works locally. On sign-in, the first sync is a merge (local ∪ remote), never a overwrite — signing in must never delete local progress.

---

## 4. Sync protocol (sketch)

```
Client                          Hub
  |                               |
  |-- GET /sync/:scope/:key ------>|  (with local vector/version)
  |<-- { remote, remoteVersion } ---|
  |                               |
  |  merge(local, remote) → winner |
  |                               |
  |-- PUT /sync/:scope/:key ------>|  (with base version; 409 → re-pull)
  |<-- { ok, newVersion } ---------|
```

- Each synced record carries a `version` (monotonic counter) and `updatedAt`.
- PUT is conditional on `baseVersion`; a 409 means "someone else wrote first" → re-pull, re-merge, retry (bounded retries, then surface to user).
- Transport: HTTPS + JSON. No custom binary protocol in v1.

---

## 5. Conflict resolution — recommendation: per-type strategy, not one rule

One global strategy is wrong; the data types have different shapes. Recommended:

| Data type | Strategy | Justification |
|---|---|---|
| Trophies / unlocks | **Union** (monotonic) | Can only be added, never removed by gameplay. Earliest `unlockedAt` wins. Zero conflicts by construction. |
| Settings | **Per-field last-write-wins** | Fields are independent (theme vs. keybinding). LWW per field is simple and matches user intuition ("my last change sticks"). |
| Saves | **Versioned LWW + conflict copy** | Save slots are blobs; merging is meaningless. Last writer wins, but the loser is preserved as `slot-N-conflict-<timestamp>` and the user is notified. Never silently discard a save. |
| Projects | **LWW on metadata + hash-verified assets** | Project structure is small; last writer wins on structure, binaries resolved by content hash. |

**Why not CRDTs:** CRDTs are the right tool for collaborative real-time editing (two people typing in one doc). Sync here is single-user-multi-device with low write contention — CRDTs add implementation complexity and payload overhead for conflicts that, empirically, almost never occur. Revisit only if real-time co-editing becomes a feature.

**Why not naive global LWW:** it silently discards the loser's save — the unforgivable failure (§1.4). The conflict-copy rule for saves is the backstop.

---

## 6. Sync triggers

| Trigger | Scopes | Notes |
|---|---|---|
| Manual ("Sync now") | All | Always available; shows last-sync time |
| On trophy unlock | `trophies` | Debounced (2s, coalesces rapid unlocks) — see TrophyManager |
| On save | `saves` | Debounced; only the written slot |
| On settings change | `settings` | Debounced 5s |
| Periodic | All | Every 15 min while signed in and online; backoff on failure |
| On sign-in | All | Full merge; never destructive (§3) |

All triggers are no-ops when offline or signed out. Failures are logged and surfaced in the sync status UI — never thrown into the game loop.

---

## 7. Storage layout (client)

```
localStorage:
  pixos_trophies::<gameId>      # unlocked trophies (tiny)
  pixos_settings                # engine/editor settings (tiny)
  pixos_save_metadata           # save slot metadata (tiny)

IndexedDB (svrn_local):
  saves::<slotId>               # save payloads (medium)
  projects::<projectId>::meta   # project structure (small)
  assets::<contentHash>         # binary cache, content-addressed (large)
```

Server (hub, when built): `(identityId, scope, key) → { version, updatedAt, payload }` plus a content-addressed blob store for on-demand binary fetch.

---

## 8. Build order

1. ✅ Trophy sync provider interface (done — first consumer).
2. Settings sync (smallest scope, proves the protocol).
3. Save sync (needs the conflict-copy UX).
4. Project metadata sync.
5. Hub identity provider + server-side store (unblocks 2–4 for real).
6. Binary fetch-by-hash (CDN).

Items 2–4 can be built against a local stub provider today; they light up when the hub lands — same pattern as `SvrnHubTrophySyncProvider`.
