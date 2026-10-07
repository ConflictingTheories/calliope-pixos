# C Port Parity Checklist

**Goal:** The native C port (`packages/core-c`) must support everything the JS engine supports, or have an explicit "not planned" decision.

**Version:** 1.0.1 (must match JS)

**Note (2026-10-07):** This checklist was corrected after actual code inspection. The C port has 67 .c files and is more complete than previously assumed.

---

## Rendering

| Feature | JS | C | Status |
|---------|----|---|--------|
| Sprite rendering | ✅ | ✅ | Implemented (`scene/sprite.c`) |
| Tile map rendering | ✅ | ✅ | Implemented (`scene/tileset.c`) |
| Texture atlas | ✅ | ✅ | Implemented (`resource/texture.c`) |
| Shader system | ✅ | ✅ | Implemented (`rendering/shader.c`) |
| Point lights | ✅ | ✅ | Implemented (`rendering/light_manager.c`) |
| OBJ loading | ✅ | ✅ | Implemented (`resource/obj_loader.c`) |
| OBJ materials (MTL) | ✅ | ✅ | Implemented (`resource/obj_loader.c`) |
| GLTF loading | ✅ | ✅ | Implemented (`resource/gltf_loader.c`) |
| GLTF rendering | ✅ | ✅ | Implemented (`rendering/gltf_renderer.c`) |
| Custom shaders | ✅ | ✅ | Implemented (`rendering/shader.c`) |
| Post-processing | ❌ | ❌ | Not planned |

## Scene & World

| Feature | JS | C | Status |
|---------|----|---|--------|
| Zone loading | ✅ | ✅ | Implemented (`scene/zone.c`) |
| World management | ✅ | ✅ | Implemented (`scene/world.c`) |
| Portals | ✅ | ✅ | Implemented (`scene/portal.c`) — 2026-10-07 |
| Behaviors | ✅ | ✅ | Implemented (`scene/behavior.c`) — 2026-10-07 |
| Avatar | ✅ | ✅ | Implemented (`scene/avatar.c`) |
| Portal system | ✅ | ✅ | Implemented (`scene/portal.c`) |
| Avatar manager | ✅ | ✅ | Implemented (`scene/avatar.c`) |
| Behavior system | ✅ | ✅ | Implemented (`scene/behavior.c`) |
| Mode manager | ✅ | ❌ | TODO |

## Scripting

| Feature | JS | C | Status |
|---------|----|---|--------|
| PixoScript/Lua | ✅ | ✅ | Lua 5.4 vendored, ENABLE_LUA=ON |
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
