# Cutscene Demo - Quick Reference

## 🎮 How to Run

1. Start the game: `yarn start` (from `/example` directory)
2. Main menu appears → Click through menu options
3. Final menu button triggers `triggers/menu/main.pxs`
4. Menu closes → Intro cutscene plays (first time only)
5. Demo zone loads → Welcome cutscene plays (first time only)

## 🗺️ Demo Zone Layout

```
┌─────────────────────┐
│ ░ ░ ░ ░ ░ ░ ░ ░ ░ ░ │
│ ░ ░   NPC   ░ ░ ░ ░ │  NPC = Quest Giver (epic-quest.pxc)
│ ░ ░ ░ ░ ░ ░ ░ ░ ░ ░ │
│ ░ ░ ░ ░ ░ ░ ░ ░ ░ ░ │
│ ░ ░ ░ PLAYER ░ ░ ░ ░│  PLAYER = Starting position
│ ░ ░ ░ ░ ░ ░ ░ ░ ░ T │  T = Tile trigger (voice-demo.pxc)
│ ░ ░ ░ ░ ░ ░ ░ ░ ░ ░ │
└─────────────────────┘
```

## 📜 Cutscene Triggers

### 1. Intro Cutscene (Menu Close)
- **File**: `triggers/menu/on_close.pxs`
- **When**: First time menu closes
- **Type**: Inline cutscene
- **Features**: BGM, narrator, backdrop
- **Flag**: `game_intro_played`

### 2. Welcome Cutscene (Zone Load)
- **File**: `triggers/zone/cutscene_demo_intro.pxs`
- **When**: First time zone loads
- **Type**: Inline cutscene
- **Features**: Instructions, narrator
- **Flag**: `cutscene_demo_intro_seen`

### 3. Epic Quest (NPC Interaction)
- **File**: `triggers/sprite/npc_quest_giver.pxs`
- **When**: Talk to Quest NPC
- **Cutscene**: `cutscenes/epic-quest.pxc`
- **Features**: 5 scenes, BGM, SFX, multiple characters, cutins
- **Flag**: `quest_epic_accepted`

### 4. Voice Demo (Tile Trigger)
- **File**: `triggers/tile/cutscene_trigger_tile.pxs`
- **When**: Walk on tile at [12, 5]
- **Cutscene**: `cutscenes/voice-demo.pxc`
- **Features**: Voice-overs, dialogue metadata
- **Flag**: `tile_cutscene_story-trigger-tile_played`

## 🎵 Audio Files Used

```
audio/opening.mp3     → Intro BGM
audio/battle.mp3      → Epic quest battle theme
audio/victory.mp3     → Victory fanfare
audio/door.mp3        → Door sound effect
audio/organ.mp3       → Dramatic organ
audio/swords.mp3      → Sword clash
audio/explosion.mp3   → Explosion effect
audio/powerup.mp3     → Power-up sound
audio/portal.mp3      → Portal whoosh
audio/temple_ambient.mp3 → Temple atmosphere
audio/gathering.mp3   → Gathering scene music
```

## 🖼️ Textures Used

```
textures/room.gif     → Interior room
textures/castle.gif   → Castle exterior
textures/forest.gif   → Forest scene
textures/cave.gif     → Cave interior
textures/temple.gif   → Ancient temple
```

## 🔄 Flow Diagram

```
[Game Start]
     ↓
[Main Menu] → triggers/menu/main.pxs
     ↓
[Menu Close] → triggers/menu/on_close.pxs
     ↓
[Intro Cutscene] (inline, first time only)
     ↓
[Load cutscene-demo zone]
     ↓
[Zone Load] → triggers/zone/cutscene_demo_intro.pxs
     ↓
[Welcome Cutscene] (inline, first time only)
     ↓
[Explore Mode Active]
     ↓
   ┌─────────────────┬─────────────────┐
   ↓                 ↓                 ↓
[Talk to NPC]    [Walk to Tile]   [Use Portal]
   ↓                 ↓                 ↓
[Epic Quest]     [Voice Demo]     [To Hallway]
```

## 🐛 Debugging

### Check if cutscenes are registered:
```javascript
console.log(engine.assetLoader);
```

### Check flags:
```lua
pixos.log(pixos.has_flag('game_intro_played'));
pixos.log(pixos.has_flag('cutscene_demo_intro_seen'));
pixos.log(pixos.has_flag('quest_epic_accepted'));
```

### Manual trigger:
```lua
-- In browser console or debug mode
pixos.sync({ pixos.play_pxc_cutscene('cutscenes/epic-quest.pxc') });
```

## 📝 Testing Checklist

- [ ] Menu appears on game start
- [ ] Menu close triggers intro cutscene
- [ ] Intro cutscene plays BGM
- [ ] Demo zone loads after intro
- [ ] Welcome cutscene explains features
- [ ] NPC is visible at position [7, 2]
- [ ] Talking to NPC plays epic-quest.pxc
- [ ] Epic quest has BGM and SFX
- [ ] Walking to [12, 5] triggers voice-demo
- [ ] Voice-demo plays voice-over
- [ ] Flags prevent repeated playback
- [ ] Portal to hallway works

## 🔧 Troubleshooting

### Cutscene doesn't play
1. Check browser console for errors
2. Verify asset paths in manifest.json
3. Check if .pxc file exists in cutscenes/
4. Verify trigger script has no syntax errors

### No audio
1. Check browser autoplay policy (requires user interaction)
2. Verify audio files exist in audio/
3. Check audio file formats (.mp3, .ogg, .wav)
4. Open browser console for audio errors

### Flags not working
1. Check if engine.store is initialized
2. Verify flag names match exactly
3. Check pixos.has_flag() and pixos.set_flag() calls

### Zone doesn't load
1. Verify manifest.json includes zone in "maps"
2. Check map.json and cells.json exist
3. Verify initialZones points to correct zone
4. Check for JSON syntax errors

## 📚 Documentation

- Full API: `/build/engine/core/CUTSCENE_USAGE.md`
- Demo guide: `/example/spritz/CUTSCENE_DEMO.md`
- Example cutscenes: `/example/spritz/cutscenes/*.pxc`
- Example triggers: `/example/spritz/triggers/**/*.pxs`
