# Cutscene Examples - Full Showcase

This directory contains comprehensive cutscene examples that demonstrate the full capabilities of the Pixospritz Cutscene Editor.

## Available Cutscenes

### 1. epic-quest.pxc (★ RECOMMENDED SHOWCASE)
**The Elemental Challenge** - A hero's journey through the first of four elemental trials.

**Features Demonstrated:**
- ✅ Multiple scene transitions with fade effects
- ✅ Character portraits with expressions (smile, worried, shocked, tired, neutral)
- ✅ Dramatic cutin moments
- ✅ Extensive audio integration (9 different tracks)
- ✅ Character positioning (left/right)
- ✅ Action animations (character movement)
- ✅ Multiple backdrop changes (room.gif, sewer.gif, room.png, sewer-lava.gif, darkness.gif)
- ✅ Story pacing with wait commands
- ✅ Multi-line dialogue blocks
- ✅ User input prompts (waitInput)

**Characters:**
- HERO (characters/male) - The brave protagonist
- WITCH (characters/female) - The mystical guide
- AIR_KNIGHT (npc/air-knight) - The elemental guardian

**Audio Used:**
- opening.mp3 - Opening atmosphere
- organ.mp3 - Ominous moments
- distorted-communication.mp3 - Supernatural events
- calm-escape.mp3 - Peaceful transitions
- icy-passage.mp3 - Temple atmosphere
- brass-loop.mp3 - Heroic theme
- dungeon-beat.mp3 - Combat sequences
- deep-unknown-beat.mp3 - Dark tension
- dawns-peak.mp3 - Victory/resolution
- ocean-waves.mp3 - Calm ending
- lonely-mountain.mp3 - Epic conclusion

**Backdrops:**
- textures/room.gif - Starting chamber
- textures/sewer.gif - Dark underground
- textures/room.png - Air temple interior
- textures/sewer-lava.gif - Battle arena
- textures/darkness.gif - Dramatic finale

**Duration:** ~3-4 minutes
**Scenes:** 5 distinct scenes with clear narrative progression

---

### 2. elemental-gathering.pxc (★ ADVANCED SHOWCASE)
**The Tavern Summit** - Four elemental spirits meet with a hero to discuss prophecy.

**Features Demonstrated:**
- ✅ Multi-character dialogue (5 distinct characters)
- ✅ Direct portrait references (using portrait files without sprite JSON)
- ✅ Character alternation (left/right positioning)
- ✅ Atmospheric audio layering
- ✅ Prophetic/dramatic storytelling
- ✅ Quest setup and world-building
- ✅ Consistent pacing across long dialogue

**Characters:**
- HERO (characters/male) - The mortal champion
- FIRE (fire_portrait.gif) - Spirit of Flame
- WATER (water_portrait.gif) - Spirit of Water
- EARTH (earth_portrait.gif) - Spirit of Earth
- AIR (air_portrait.gif) - Spirit of Air

**Audio Used:**
- menu.mp3 - Tavern ambiance
- distorted-communication.mp3 - Spirit appearance
- organ.mp3 - Ominous revelation
- ocean-waves.mp3 - Water spirit theme
- deep-unknown-beat.mp3 - Dark prophecy
- icy-passage.mp3 - Mystical atmosphere
- calm-escape.mp3 - Resolution
- dawns-peak.mp3 - Quest beginning
- lonely-mountain.mp3 - Epic sendoff

**Backdrops:**
- textures/room.png - Mystic tavern
- textures/darkness.gif - Spirit realm transition

**Duration:** ~3-4 minutes
**Scenes:** Single location with multiple character interactions

---

### 3. shakespeare.pxc (CLASSIC LITERATURE)
**Macbeth - The Murder of Duncan** - A thrilling adaptation of Shakespeare's tragedy.

**Features:**
- Classic dramatic dialogue
- Placeholder sprites (data: references)
- Multi-line Shakespearean verse
- Scene transitions

---

### 4. showcase-demo.pxc (BASIC DEMO)
**Quick Feature Showcase** - Brief demonstration of core features.

**Features:**
- Basic backdrop usage
- Portrait display
- Sound effect triggers
- Simple cutin example

---

### 5. demo.pxc (MINIMAL EXAMPLE)
**Harbor Scene** - Compact example showing minimal DSL syntax.

**Features:**
- Clean layout
- Action chaining
- Compact dialogue format

---

## How to Use These Examples

### In the Editor

1. **Open the Editor**: Launch the Pixospritz editor
2. **Load ZIP**: Open the spritz package ZIP file (example/spritz/)
3. **Navigate**: Go to cutscenes/ folder
4. **Open File**: Double-click `epic-quest.pxc` or `elemental-gathering.pxc`
5. **Preview**: Click the **Play** button to watch the cutscene
6. **Edit**: Switch between Text and Visual modes to edit
7. **Experiment**: Adjust speed slider, try different expressions, add new dialogue

### Creating Your Own

1. **Start with a Template**: Copy one of the showcase examples
2. **Replace Assets**: Update character sprites and backdrop paths
3. **Write Dialogue**: Use the Quick Insert buttons for common commands
4. **Test Frequently**: Click Play after major changes
5. **Adjust Pacing**: Fine-tune wait times and transitions
6. **Add Audio**: Layer music and sound effects for atmosphere

## Asset Requirements

### For Characters
- **Option A**: Sprite JSON file (e.g., `characters/male.json`)
  - Must include `portraitSrc` field pointing to portrait image
- **Option B**: Direct portrait reference (e.g., `fire_portrait.gif`)
  - Place in `textures/` directory

### For Backdrops
- Place image files in `textures/` directory
- Supported formats: .gif, .png, .jpg, .jpeg
- Recommended size: 1600x900 or larger

### For Audio
- Place audio files in `audio/` directory
- Supported formats: .mp3, .wav, .ogg
- Use descriptive filenames

## Best Practices from Examples

### From epic-quest.pxc:
1. **Build Tension Gradually**: Start calm, increase intensity
2. **Use Cutins Sparingly**: Reserve for dramatic moments
3. **Match Audio to Mood**: Each scene has appropriate music
4. **Vary Expressions**: Show emotional range through expressions
5. **Clear Scene Breaks**: Use comments and transitions between scenes

### From elemental-gathering.pxc:
1. **Character Alternation**: Switch left/right positions for natural conversation flow
2. **Consistent Pacing**: Maintain rhythm in multi-character dialogue
3. **World-Building**: Use dialogue to establish lore and setting
4. **Audio Layering**: Different sounds for different characters/moments

## Technical Notes

### Sprite Loading
The cutscene player automatically:
- Extracts `portraitSrc` from sprite JSON files
- Falls back to sprite `src` if no portrait defined
- Handles direct portrait references (no JSON needed)
- Generates placeholders for missing assets

### Asset Paths
All paths are relative to the spritz package root:
- `characters/male` → `sprites/characters/male.json`
- `textures/room.gif` → `textures/room.gif`
- `audio/brass-loop.mp3` → `audio/brass-loop.mp3`
- `fire_portrait` → searches `textures/fire_portrait.gif`

### Performance Tips
- Preload audio with `@do playSfx` before playing
- Use appropriate wait times (800-1500ms for scene changes)
- Keep backdrop images optimized (< 2MB recommended)
- Test on target devices for performance

## Customization Ideas

Based on these examples, you could create:
- **Tutorial Cutscenes**: Step-by-step game instructions
- **Character Backstories**: Flashback sequences
- **Boss Introductions**: Dramatic villain reveals
- **Victory Celebrations**: End-of-level rewards
- **Dialogue Trees**: Branching conversations (using multiple .pxc files)
- **Environmental Storytelling**: Show world changes over time
- **Flashback Sequences**: Past events with different backdrops
- **Dream Sequences**: Surreal atmosphere with darkness.gif

## Troubleshooting

**Portraits not loading?**
- Check if sprite JSON has `portraitSrc` field
- Try direct portrait reference (e.g., `hero_portrait`)
- Verify file exists in `textures/` directory

**Audio not playing?**
- Ensure file is in `audio/` directory
- Check file format (.mp3 recommended)
- Verify browser audio support (some browsers require user interaction first)

**Slow playback?**
- Reduce backdrop image sizes
- Use compressed audio formats
- Adjust speed slider in editor

## Credits

**Epic Quest** - Original story showcasing full capabilities
**Elemental Gathering** - Advanced multi-character example
**Shakespeare** - Classic literature adaptation
**Demo examples** - Basic feature demonstrations

## License

These examples are provided as templates for the Pixospritz engine.
Feel free to use, modify, and build upon them for your projects.

---

**Happy Storytelling!** 🎬✨

For more information, see `CUTSCENE_GUIDE.md` in the editor directory.
