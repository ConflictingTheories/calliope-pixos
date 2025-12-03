# Audio

This directory contains all audio files used in the game, including background music and sound effects.

## Background Music

| File | Description | Usage |
|------|-------------|-------|
| `brass-loop.mp3` | Triumphant brass fanfare | Fire Chamber |
| `calm-escape.mp3` | Peaceful ambient music | Safe zones |
| `dawns-peak.mp3` | Hopeful morning theme | Victory scenes |
| `deep-unknown-beat.mp3` | Ominous dark rhythm | Boss Arena |
| `dial-in.mp3` | Electronic tension | Tech areas |
| `distorted-communication.mp3` | Glitchy ambiance | Corrupted zones |
| `dungeon-beat.mp3` | Dungeon exploration | Dungeon Entrance |
| `fields.mp3` | Open countryside | Village Hub |
| `icy-passage.mp3` | Cold, airy atmosphere | Air Chamber |
| `jungle-rhythm.mp3` | Tribal earth beats | Earth Chamber |
| `lonely-mountain.mp3` | Solitary, epic | Mountain areas |
| `menu.mp3` | Main menu music | Title screen |
| `ocean-waves.mp3` | Flowing water sounds | Water Chamber |
| `opening.mp3` | Epic introduction | Game intro cutscene |
| `organ.mp3` | Gothic organ music | Dark temples |
| `sewer-beat.mp3` | Industrial underground | Sewer areas |

## Audio Format

- **Format**: MP3 (128-320 kbps)
- **Sample Rate**: 44.1 kHz
- **Channels**: Stereo preferred
- **Looping**: Files should loop seamlessly for background music

## Usage in Maps

Audio is assigned in map.json:
```json
{
  "audioSrc": "fields.mp3"
}
```

## Usage in Cutscenes

Cutscenes can play audio:
```
@do music("opening.mp3")
@do sound("door_open.mp3")
```

## Engine Audio Features

The PixoSpritz audio engine supports:
- **BPM Analysis**: Automatic beat detection for rhythm-based effects
- **Crossfade**: Smooth transitions between tracks
- **Spatial Audio**: 3D positioned sound sources
- **Volume Control**: Per-channel volume settings
- **Looping**: Seamless background music loops

## Adding New Audio

1. Export audio as MP3 format
2. Ensure clean loop points for background music
3. Place file in this directory
4. Reference in map.json or cutscene scripts
5. For BPM-synced effects, ensure consistent tempo

## Sound Effect Triggers

Sound effects can be triggered via scripts:
```lua
-- In .pxs trigger scripts
play_sound("door_open.mp3")
play_music("dungeon-beat.mp3", { fadeIn = 2.0 })
stop_music({ fadeOut = 1.0 })
```
