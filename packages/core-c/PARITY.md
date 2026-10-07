# C Port Parity Checklist

**Goal:** The native C port (`packages/core-c`) must support everything the JS engine supports, or have an explicit "not planned" decision.

**Version:** 1.0.1 (must match JS)

---

## Rendering

| Feature | JS | C | Status |
|---------|----|---|--------|
| Sprite rendering | ✅ | ❌ | TODO |
| Tile map rendering | ✅ | ❌ | TODO |
| Texture atlas | ✅ | ❌ | TODO |
| OBJ loading | ✅ | ❌ | TODO |
| OBJ materials (MTL) | ✅ | ❌ | TODO |
| OBJ textures | ✅ | ❌ | TODO |
| GLTF loading | ✅ | ❌ | TODO |
| GLTF rendering | ✅ | ❌ | TODO |
| GLTF PBR materials | ✅ | ❌ | TODO |
| Point lights | ✅ | ❌ | TODO |
| Custom shaders | ✅ | ❌ | TODO |
| Post-processing | ❌ | ❌ | Not planned |

## Scene & World

| Feature | JS | C | Status |
|---------|----|---|--------|
| Zone loading | ✅ | ❌ | TODO |
| Portal system | ✅ | ❌ | TODO |
| Avatar manager | ✅ | ❌ | TODO |
| Behavior system | ✅ | ❌ | TODO |
| Mode manager | ✅ | ❌ | TODO |

## Scripting

| Feature | JS | C | Status |
|---------|----|---|--------|
| PixoScript | ✅ | ❌ | DECISION NEEDED: Port PixoScript to C, or use Lua? |
| Sandbox | ✅ | ❌ | TODO (depends on scripting decision) |
| Mode scripts (setup/update) | ✅ | ❌ | TODO |
| Object script hooks | ✅ | ❌ | TODO |

## Data Formats

| Feature | JS | C | Status |
|---------|----|---|--------|
| Pixozine loading | ✅ | ❌ | TODO |
| Manifest validation | ✅ | ❌ | TODO |
| Migrate-on-load | ✅ | ❌ | TODO |

## Priority Order

### Phase 1: Core (must have for v1.0)
1. Sprite/tile rendering
2. Zone loading
3. Pixozine loading
4. Basic scripting (decision: PixoScript-in-C or Lua)

### Phase 2: Features (v1.1)
5. OBJ + materials + textures
6. Portal system
7. Avatar manager
8. Behavior system
9. Mode manager

### Phase 3: Advanced (v1.2+)
10. GLTF loading + rendering
11. Point lights
12. Custom shaders

## Decision Log

| Date | Decision | Rationale |
|------|----------|-----------|
| | Scripting: PixoScript vs Lua | |
| | Post-processing: implement or skip | |
| | Network/multiplayer: in scope? | |

---

**Rule:** No JS feature ships without a C parity entry (✅ implemented, 🚧 in progress, or ❌ explicitly deferred with reason).
