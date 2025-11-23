# Cutscene System Documentation

## Overview
The Cutscene Tool provides a complete system for creating interactive storytelling sequences with visual and audio elements. This document showcases the full capabilities of the editor.

## Features

### Visual Elements
- **Backdrops**: Full-screen background images that set the scene
- **Portraits**: Character images displayed in dialogue boxes
- **Cutins**: Large character images for dramatic moments
- **Expressions**: Emoji overlays showing character emotions

### Audio
- **Background Music**: Looping audio tracks for atmosphere
- **Sound Effects**: One-shot sounds triggered by events

### Animations & Transitions
- **Fade In/Out**: Smooth backdrop transitions
- **Wipe**: Clear screen transitions
- **Character Movement**: Animate portrait positions

### DSL Syntax

#### Comments
```
# This is a comment
# Comments are ignored by the parser
```

#### Character Definitions
```
@char NAME sprite=path/to/sprite
```
Example:
```
@char HERO sprite=characters/male
@char WITCH sprite=characters/female
@char AIR_KNIGHT sprite=npc/air-knight
```

#### Backdrops
```
@backdrop path/to/image [fadeIn=duration_ms]
```
Example:
```
@backdrop textures/room.gif [fadeIn=800]
@backdrop textures/sewer.gif [fadeIn=700]
```

#### Dialogue
```
SPEAKER: [expression=emotion,position=location] Dialogue text
```
Example:
```
HERO: [expression=smile,position=left] Hello there!
WITCH: [expression=worried,position=right] We need your help!
```

**Multi-line Dialogue:**
```
SPEAKER: [expression=emotion,position=location]
"""
This is a longer dialogue
that spans multiple lines.
"""
```

**Expressions:**
- `smile` - 😊 Happy/Friendly
- `sad` - 😢 Sad/Disappointed
- `annoyed` - 😠 Angry/Annoyed
- `shocked` - 😨 Shocked/Surprised
- `neutral` - 😐 Neutral/Calm
- `smirk` - 😏 Confident/Sly
- `worried` - 😰 Worried/Anxious
- `tired` - 😴 Tired/Exhausted

**Positions:**
- `left` - Left side of screen
- `right` - Right side of screen
- `center` - Center of screen

#### Cutins (Dramatic Moments)
```
*SPEAKER: [cutin=size=large,expression=emotion] Dramatic text
```
Example:
```
*HERO: [cutin=size=large,expression=shocked]
"""
What was that sound?!
Something feels wrong...
"""
```

#### Sound Effects
```
@do playSfx [name=audio/filename.mp3]
```
Example:
```
@do playSfx [name=audio/opening.mp3]
@do playSfx [name=audio/calm-escape.mp3]
```

**Available Audio Files:**
- `brass-loop.mp3` - Heroic theme
- `calm-escape.mp3` - Peaceful ambient
- `dawns-peak.mp3` - Victory/Success
- `deep-unknown-beat.mp3` - Mysterious/Dark
- `dial-in.mp3` - Alert/Notification
- `distorted-communication.mp3` - Eerie/Supernatural
- `dungeon-beat.mp3` - Combat/Action
- `fields.mp3` - Outdoor/Nature
- `icy-passage.mp3` - Cold/Temple atmosphere
- `jungle-rhythm.mp3` - Tropical/Adventure
- `lonely-mountain.mp3` - Epic/Dramatic
- `menu.mp3` - UI/Menu sounds
- `ocean-waves.mp3` - Relaxing/Water
- `opening.mp3` - Opening theme
- `organ.mp3` - Ominous/Dramatic
- `sewer-beat.mp3` - Underground/Dark

#### Actions
```
@action ACTOR verb [param=value,duration=ms]
```
Example:
```
@action HERO moveTo [x=40,duration=600]
```

#### Transitions
```
@transition name [duration=ms]
```
Examples:
```
@transition fadeOutBackdrop [duration=600]
@transition wipe [duration=500]
```

#### Wait Commands
```
wait milliseconds
```
Example:
```
wait 1000
wait 500
```

**Wait for User Input:**
```
waitInput
```
Waits for player to click or press a key before continuing.

#### End Cutscene
```
@end
```
Marks the end of the cutscene.

## Complete Example: Epic Quest

See `/example/spritz/cutscenes/epic-quest.pxc` for a comprehensive example that demonstrates:

1. **Character Introductions** - Establishing the hero and supporting cast
2. **Scene Transitions** - Smooth backdrop changes with fade effects
3. **Emotional Moments** - Cutin images with expressive dialogue
4. **Audio Integration** - Background music and sound effects
5. **Action Sequences** - Character movement and combat
6. **Story Progression** - Multiple scenes building a narrative

### Story Structure

**Scene 1: The Hero's Chamber**
- Peaceful morning interrupted by ominous sounds
- Uses calm backdrop with sudden organ music
- Introduces tension through worried expressions

**Scene 2: Meeting the Witch**
- Dark sewer setting with distorted communication sounds
- Witch explains the threat and quest
- Uses position parameters for character placement

**Scene 3: The Air Temple**
- Icy atmospheric music
- First trial introduction
- Dramatic cutin for the Air Knight's challenge

**Scene 4: The Battle**
- Intense dungeon music
- Lava backdrop for dramatic effect
- Character expressions showing struggle and determination

**Scene 5: Victory and Wisdom**
- Triumphant music (dawns-peak.mp3)
- Character reflection and future setup
- Multiple backdrop transitions
- Ocean waves for peaceful conclusion

## Editor Features

### Text Mode
- Direct DSL editing
- Syntax highlighting (monospace font)
- Real-time parsing and preview

### Visual Mode
- Event-based editing
- Drag-and-drop reordering (via up/down buttons)
- Field-specific inputs for each event type
- Expression and position pickers

### Quick Insert Commands
Buttons for common DSL patterns:
- 🖼️ Backdrop
- 👤 Character
- 🔊 Sound FX
- ⏱️ Wait
- ⌨️ Wait Input
- 🌀 Transition
- ⚡ Action
- 💬 Comment

### Playback Controls
- **Play**: Start cutscene playback from beginning
- **Stop**: Halt playback immediately
- **Skip**: Jump to end
- **Speed Slider**: Adjust text reveal speed (8-200ms per character)
- **Auto-advance**: Automatically progress through dialogue

### History
- **Undo/Redo**: Full history tracking for all edits
- Keyboard shortcuts work in both text and visual modes

## Asset Structure

### Required Sprite Format
Sprites should be JSON files with this structure:
```json
{
  "type": "sprite",
  "src": "sprite-sheet.png",
  "portraitSrc": "portrait.gif",
  "sheetSize": [96, 384],
  "tileSize": [24, 48],
  ...
}
```

The cutscene player automatically extracts the `portraitSrc` field when loading sprite JSON files.

### Textures/Backdrops
Place backdrop images in `textures/` directory:
- `room.gif` - Indoor room
- `room.png` - Alternative room
- `sewer.gif` - Underground sewer
- `sewer-lava.gif` - Volcanic sewer
- `sewer-mud.gif` - Muddy sewer
- `darkness.gif` - Dark/black screen

## Best Practices

1. **Pacing**: Use `wait` commands between scenes (800-1500ms recommended)
2. **Audio**: Always preload audio with `@do playSfx` before major story beats
3. **Expressions**: Match expressions to dialogue tone for emotional impact
4. **Cutins**: Reserve cutins for dramatic reveals or important moments
5. **Transitions**: Use `fadeOutBackdrop` before major scene changes
6. **Comments**: Add comments to mark scene breaks and story beats
7. **Testing**: Use the Play button frequently to test pacing and flow

## Tips for Compelling Cutscenes

- **Build Tension**: Start calm, gradually increase intensity
- **Character Development**: Show emotion through expressions and dialogue
- **Environmental Storytelling**: Match backdrops to story mood
- **Sound Design**: Layer music with sound effects for depth
- **Reader Engagement**: Use `waitInput` at key decision or reflection points
- **Visual Variety**: Alternate between portraits and cutins to maintain interest
- **Rhythm**: Vary dialogue length and wait times to create natural pacing

## Troubleshooting

**Assets not loading?**
- Ensure asset paths match ZIP structure
- Check that sprite JSON files are in `sprites/` directory
- Verify audio files are in `audio/` directory
- Texture files should be in `textures/` directory

**Cutscene not playing?**
- Check for syntax errors in DSL (comments in text mode)
- Ensure all `"""` multiline quotes are properly closed
- Verify character names match between `@char` and dialogue lines

**Portraits not showing?**
- Confirm sprite path points to valid JSON file
- Check that sprite JSON has `portraitSrc` field
- Verify portrait image exists in ZIP

## Advanced Techniques

### Chaining Actions
```
@action HERO moveTo [x=40,duration=600] -> @do playSfx [name=seagull] | @transition fadeOutBackdrop [duration=500]
```

### Dynamic Expressions
Change expression mid-conversation:
```
HERO: [expression=smile,position=left] Everything will be fine!
HERO: [expression=worried,position=left] I hope...
```

### Parallel Audio
Layer multiple audio tracks for rich soundscapes:
```
@do playSfx [name=audio/ocean-waves.mp3]
wait 300
@do playSfx [name=audio/calm-escape.mp3]
```

### Scene Templates

**Dialogue Scene:**
```
@backdrop textures/room.gif [fadeIn=500]
@char SPEAKER1 sprite=characters/male
@char SPEAKER2 sprite=characters/female

SPEAKER1: [expression=neutral,position=left] Text
SPEAKER2: [expression=neutral,position=right] Response
```

**Action Scene:**
```
@backdrop textures/dungeon.gif [fadeIn=300]
@do playSfx [name=audio/dungeon-beat.mp3]

*HERO: [cutin=size=large,expression=shocked] Dramatic text!
@action HERO moveTo [x=50,duration=400]
```

**Transition Scene:**
```
@transition fadeOutBackdrop [duration=800]
wait 1000
@backdrop textures/next-scene.gif [fadeIn=800]
```

## Conclusion

The Cutscene Tool provides a powerful yet accessible way to create cinematic storytelling experiences. By combining visual elements, audio, and carefully paced dialogue, you can craft engaging narratives that enhance your game's story.

For the best showcase, load `/example/spritz/cutscenes/epic-quest.pxc` in the editor and explore how all features work together to create a compelling experience.

Happy storytelling! 🎬
