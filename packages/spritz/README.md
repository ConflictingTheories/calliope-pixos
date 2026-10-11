# The Elemental Trials - Complete Example Game

A fully-featured example game showcasing all PixoSpritz engine capabilities.

## 🎮 Game Overview

**The Elemental Trials** is a complete RPG adventure that demonstrates every feature of the PixoSpritz engine. The player takes on the role of a hero who must complete four elemental trials to unlock the path to the Dark Lord and save the kingdom.

## 📖 Story

Long ago, the Dark Lord was sealed away by four Elemental Guardians. Now, a thousand years later, the seal weakens. A brave hero must complete the trials of Fire, Water, Earth, and Air to renew the seal and save the world.

## 🗺️ Game Zones

### Village Hub (`village-hub`)

- **Tileset**: village
- **Mode**: explore
- **Music**: fields.mp3
- **Features**:
  - Village Elder NPC (quest guidance)
  - Knight Guard NPC (combat tips)
  - Dungeon Portal (leads to trials)
  - Treasure Chests with items
  - Fireplace with particle effects
  - Dynamic lighting (sun, fire)
  - Main menu system

### Dungeon Entrance (`dungeon-entrance`)

- **Tileset**: sewer
- **Mode**: explore
- **Music**: dungeon-beat.mp3
- **Features**:
  - Four colored portals (one per element)
  - Dungeon Guide NPC (progress tracker)
  - Boss door (unlocks when all trials complete)
  - Return portal to village
  - Elemental light effects

### Fire Chamber (`fire-chamber`)

- **Tileset**: sewer
- **Mode**: tactics
- **Music**: brass-loop.mp3
- **Features**:
  - Fire Elemental boss
  - Lava spurt effects
  - Fire particle effects
  - Red/orange lighting
  - Fire chest with rewards
  - Inferno shader

### Water Chamber (`water-chamber`)

- **Tileset**: common
- **Mode**: tactics
- **Music**: ocean-waves.mp3
- **Features**:
  - Water Elemental boss
  - Water bubble effects
  - Blue underwater lighting
  - Ocean shader
  - Coral decorations

### Earth Chamber (`earth-chamber`)

- **Tileset**: village
- **Mode**: tactics
- **Music**: jungle-rhythm.mp3
- **Features**:
  - Earth Elemental boss
  - Trees and vegetation
  - Brown/green lighting
  - Forest shader
  - Boulder objects

### Air Chamber (`air-chamber`)

- **Tileset**: common
- **Mode**: tactics
- **Music**: icy-passage.mp3
- **Features**:
  - Air Elemental boss
  - Wind particle effects
  - White/blue sky lighting
  - Clouds shader
  - Floating platforms

### Boss Arena (`boss-arena`)

- **Tileset**: sewer
- **Mode**: fight
- **Music**: deep-unknown-beat.mp3
- **Features**:
  - Dark Lord final boss
  - All four elemental guardians
  - Corner lights for each element
  - Cosmic shader
  - Victory portal
  - Boss treasure chest
  - Pillars and throne objects
  - Boss fight menu

## 🎬 Cutscenes

| Cutscene    | File              | Description                        |
| ----------- | ----------------- | ---------------------------------- |
| Game Intro  | `game-intro.pxc`  | Story setup, meet Elder and Knight |
| Fire Trial  | `fire-trial.pxc`  | Fire Elemental battle and victory  |
| Water Trial | `water-trial.pxc` | Water Elemental battle and victory |
| Earth Trial | `earth-trial.pxc` | Earth Elemental battle and victory |
| Air Trial   | `air-trial.pxc`   | Air Elemental battle and victory   |
| Final Boss  | `final-boss.pxc`  | Dark Lord confrontation            |
| Victory     | `victory.pxc`     | Celebration and credits            |

## 🎵 Audio Used

### Background Music

- `fields.mp3` - Village theme
- `dungeon-beat.mp3` - Dungeon exploration
- `brass-loop.mp3` - Fire trial battle
- `ocean-waves.mp3` - Water trial
- `jungle-rhythm.mp3` - Earth trial
- `icy-passage.mp3` - Air trial
- `deep-unknown-beat.mp3` - Boss battle
- `dawns-peak.mp3` - Victory theme
- `calm-escape.mp3` - Peaceful moments
- `opening.mp3` - Story intro
- `lonely-mountain.mp3` - Reflective moments

### Sound Effects

- `organ.mp3` - Dramatic reveals
- `dungeon-beat.mp3` - Battle starts

## 👾 Sprites Used

### Characters

- `characters/male` - The Hero
- `characters/female` - Village Elder, Witch

### NPCs

- `npc/air-knight` - Knight Guard, Dungeon Guide, Dark Lord

### Monsters

- `monsters/fire_elemental` - Fire trial boss
- `monsters/water_elemental` - Water trial boss
- `monsters/earth_elemental` - Earth trial boss
- `monsters/air_elemental` - Air trial boss

### Furniture

- `furniture/door` - Zone transitions
- `furniture/portal` - Elemental portals
- `furniture/fireplace` - Decorative
- `furniture/tree` - Decorative

### Effects

- `effects/fireplace` - Fire particles
- `effects/spurt` - Lava/water spurts

### Chests

- `objects/chests/wood` - Basic chest
- `objects/chests/blue` - Water chest
- `objects/chests/red` - Fire chest
- `objects/chests/metal` - Boss chest

## 🎮 Game Modes

### Explore Mode

- Free movement and interaction
- Used in village and dungeon entrance
- Standard NPC dialogue

### Tactics Mode

- Turn-based elemental trials
- Tile/sprite selection with effects
- Click to select, particles on action

### Fight Mode

- Action combat for boss battle
- Real-time movement and attacks

## 💾 Game Flags

| Flag                   | Purpose                        |
| ---------------------- | ------------------------------ |
| `intro_played`         | Tracks if intro cutscene shown |
| `fire_trial_complete`  | Fire trial completion          |
| `water_trial_complete` | Water trial completion         |
| `earth_trial_complete` | Earth trial completion         |
| `air_trial_complete`   | Air trial completion           |
| `boss_door_opened`     | Boss chamber accessible        |
| `boss_defeated`        | Game complete                  |

## 📜 Scripts/Triggers

### Zone Scripts

- `village_hub_load.pxs` - Village initialization
- `dungeon_entrance_load.pxs` - Dungeon hub setup
- `fire_chamber_load.pxs` - Fire trial logic
- `water_chamber_load.pxs` - Water trial logic
- `earth_chamber_load.pxs` - Earth trial logic
- `air_chamber_load.pxs` - Air trial logic
- `boss_arena_load.pxs` - Final boss setup

### Sprite Scripts

- `village_elder.pxs` - Elder NPC dialogue
- `knight_guard.pxs` - Knight NPC dialogue
- `dungeon_guide.pxs` - Progress tracker

### Menu Scripts

- `start_game.pxs` - Begin game
- `options.pxs` - Show options
- `start_boss_fight.pxs` - Initiate boss battle
- `retreat_from_boss.pxs` - Leave boss arena

### Event Scripts

- `start_fire_battle.pxs` - Fire trial start
- `start_water_battle.pxs` - Water trial start
- `start_earth_battle.pxs` - Earth trial start
- `start_air_battle.pxs` - Air trial start
- `start_final_battle.pxs` - Boss battle start
- `victory_celebration.pxs` - Game complete

## ✨ Features Demonstrated

### Visual

- [x] Dynamic lighting (multiple lights per zone)
- [x] Light scattering coefficients
- [x] Particle effects (flame, water, earth, air, magic)
- [x] Skybox shaders (inferno, ocean, forest, clouds, cosmic, sunset)
- [x] Sprite animations
- [x] 3D objects (cube, chair, bed, book, apple, robot, etc.)
- [x] Backdrop transitions

### Audio

- [x] Background music (BGM)
- [x] Sound effects (SFX)
- [x] Music transitions between zones

### Gameplay

- [x] Zone transitions via portals
- [x] NPC dialogues
- [x] Game flags/state management
- [x] Inventory system
- [x] Quest progression
- [x] Multiple game modes
- [x] Menu system

### Cutscenes

- [x] Character portraits
- [x] Cutin animations
- [x] Multiple backdrops
- [x] Transitions (fade, wipe, blur)
- [x] BGM/SFX in cutscenes
- [x] Character movement
- [x] Wait commands
- [x] Input waits

## 🚀 How to Play

1. Start the game - the intro cutscene plays automatically
2. Explore the village, talk to NPCs
3. Enter the dungeon portal
4. Complete all four elemental trials (any order)
5. Return to dungeon when all trials complete
6. Enter the boss chamber
7. Defeat the Dark Lord
8. Enjoy the victory celebration!

## 🔧 Technical Notes

- Initial zone: `village-hub`
- All assets are preloaded via manifest.json
- Game state persists via flags
- Portals use enhanced transition effects
- Each zone has unique lighting and shader settings

## Contents

- `audio/` - Sound effects and music
- `sprites/` - Character and object sprites
- `textures/` - Texture images
- `tilesets/` - Tileset definitions
- `maps/` - Game maps
- `models/` - 3D OBJ models
- `cutscenes/` - Cutscene scripts (.pxc)
- `callbacks/` - Script callbacks (.pxs)
- `triggers/` - Trigger scripts
- `modes/` - Game mode configurations

## Usage

These assets are used by the console and editor packages for demos and testing.

```javascript
// Example: Load a sprite
const sprite = await engine.loadSprite('/assets/sprites/hero.json');

// Example: Load a map
const map = await engine.loadMap('/assets/maps/town.json');
```

## License

Assets are licensed under CC-BY-NC-SA-4.0
