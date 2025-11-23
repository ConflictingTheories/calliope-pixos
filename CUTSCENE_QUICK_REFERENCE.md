# SpritzCut DSL Quick Reference Card

## Basic Syntax

### Comments
```
# This is a comment
```

### Character Definition
```
@char NAME sprite=path/to/sprite
```

### Backdrop
```
@backdrop path/to/image [fadeIn=duration]
```

### Dialogue
```
SPEAKER: [expression=emotion,position=location] Text
```

### Multi-line Dialogue
```
SPEAKER: [expression=emotion,position=location]
"""
Multiple
lines
"""
```

### Cutin (Dramatic Moment)
```
*SPEAKER: [cutin=size=large,expression=emotion] Text
```

### Sound Effect
```
@do playSfx [name=audio/file.mp3]
```

### Action
```
@action ACTOR verb [param=value,duration=ms]
```

### Transitions
```
@transition fadeOutBackdrop [duration=ms]
@transition wipe [duration=ms]
```

### Wait
```
wait 1000
waitInput
```

### End
```
@end
```

## Expressions
- `smile` 😊 | `sad` 😢 | `annoyed` 😠 | `shocked` 😨
- `neutral` 😐 | `smirk` 😏 | `worried` 😰 | `tired` 😴

## Positions
- `left` | `right` | `center`
- `top-left` | `top-right` | `top-center`

## Asset Paths

### Characters
```
@char HERO sprite=characters/male
@char WITCH sprite=characters/female
@char KNIGHT sprite=npc/air-knight
```

### Direct Portraits
```
@char FIRE sprite=fire_portrait
@char WATER sprite=water_portrait
```

### Backdrops
```
@backdrop textures/room.gif [fadeIn=800]
@backdrop textures/sewer.gif [fadeIn=600]
@backdrop textures/darkness.gif [fadeIn=1000]
```

### Audio
```
@do playSfx [name=audio/opening.mp3]
@do playSfx [name=audio/brass-loop.mp3]
@do playSfx [name=audio/dungeon-beat.mp3]
```

## Common Patterns

### Scene Start
```
@backdrop textures/room.gif [fadeIn=800]
@char HERO sprite=characters/male
@do playSfx [name=audio/opening.mp3]
wait 1000
```

### Dialogue Exchange
```
HERO: [expression=smile,position=left] Hello!
WITCH: [expression=neutral,position=right] Greetings.
```

### Dramatic Moment
```
@do playSfx [name=audio/organ.mp3]
*HERO: [cutin=size=large,expression=shocked]
"""
What's happening?!
"""
wait 1200
```

### Scene Transition
```
@transition fadeOutBackdrop [duration=600]
wait 800
@backdrop textures/next-scene.gif [fadeIn=700]
```

### Action Sequence
```
@do playSfx [name=audio/dungeon-beat.mp3]
@action HERO moveTo [x=40,duration=600]
wait 800
```

### User Pause
```
waitInput
```

## Available Assets

### Audio Files (16 total)
- `brass-loop.mp3` - Heroic
- `calm-escape.mp3` - Peaceful
- `dawns-peak.mp3` - Victory
- `deep-unknown-beat.mp3` - Dark
- `dial-in.mp3` - Alert
- `distorted-communication.mp3` - Eerie
- `dungeon-beat.mp3` - Combat
- `fields.mp3` - Outdoor
- `icy-passage.mp3` - Temple
- `jungle-rhythm.mp3` - Tropical
- `lonely-mountain.mp3` - Epic
- `menu.mp3` - UI
- `ocean-waves.mp3` - Water
- `opening.mp3` - Theme
- `organ.mp3` - Ominous
- `sewer-beat.mp3` - Underground

### Character Portraits
- `hero_portrait.gif`
- `witch_portrait.gif`
- `air_portrait.gif`
- `fire_portrait.gif`
- `water_portrait.gif`
- `earth_portrait.gif`
- `soldier_portrait.gif`
- `skull_portrait.gif`
- `spirit_portrait.gif`
- `succubus_portrait.gif`
- `potion_portrait.gif`

### Backdrops
- `room.gif` / `room.png`
- `sewer.gif` / `sewer.png`
- `sewer-lava.gif`
- `sewer-mud.gif`
- `darkness.gif`

## Tips

1. **Pacing**: 800-1500ms wait between scenes
2. **Audio**: Preload before major story beats
3. **Expressions**: Match dialogue tone
4. **Cutins**: Use sparingly for impact
5. **Comments**: Mark scene boundaries
6. **Testing**: Play frequently while editing

## Examples

See `/example/spritz/cutscenes/`:
- **epic-quest.pxc** - Full showcase
- **elemental-gathering.pxc** - Multi-character

## Documentation

- **Full Guide**: `editor/CUTSCENE_GUIDE.md`
- **Examples**: `example/spritz/cutscenes/README.md`
- **Summary**: `CUTSCENE_IMPLEMENTATION_SUMMARY.md`
