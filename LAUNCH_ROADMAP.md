# 🚀 PixoSpritz Launch Roadmap

## The Vision: Making Game Creation as Easy as Making a Meme

**PixoSpritz isn't competing with Unity or Unreal on technical features.** We're competing on ACCESSIBILITY and SPEED-TO-FUN. 

Our users don't want to learn C# or Blueprints. They want to:
1. **Describe a game** → Get a playable prototype in minutes
2. **Clone/remix** existing games → Customize without coding
3. **Share instantly** → One-click publish to gallery
4. **Play anywhere** → Browser, offline, embedded

---

## 🎯 Competitive Positioning

| Feature | RPG Maker | Unity | Unreal | **PixoSpritz** |
|---------|-----------|-------|--------|----------------|
| Learning Curve | Medium | Steep | Very Steep | **Minimal** |
| Time to First Game | Days | Weeks | Months | **Minutes** |
| AI Generation | ❌ | Plugin | Plugin | **Built-in** |
| Web-native | ❌ | Export | Export | **Native** |
| Remix/Clone Games | ❌ | ❌ | ❌ | **Core Feature** |
| Cost | $80+ | Free-ish | Free-ish | **Free** |
| Package Size | 500MB+ | 100MB+ | 1GB+ | **<10MB** |
| Offline Play | ❌ | ✅ | ✅ | **✅ (PWA)** |

**Our Moat:** The combination of AI generation + remix culture + web-native + tiny packages. Nobody else has this.

---

## 🔥 Critical Launch Fixes (This Week)

### 1. Code Quality Issues (2-4 hours)

- [ ] **Fix deprecated lifecycle** in `ImagePreview.jsx` 
  - Replace `componentWillReceiveProps` with `getDerivedStateFromProps` or hooks
  
- [ ] **Remove debug console.logs** in production code
  - `MapEditor.jsx`, `CutscenePlayer.jsx`, others
  
- [ ] **Fix undefined mtlUrl bug** in `ObjModelViewer.jsx`
  - Add null check before fetch

### 2. AI Generator Polish (4-8 hours)

- [ ] **Better error messages** when API key is missing/invalid
- [ ] **Rate limit handling** with clear countdown UI (partially done)
- [ ] **Generation previews** before committing to save
- [ ] **Template prompts** - "Make it like Pokémon but with..."

### 3. User Experience (8-16 hours)

- [ ] **First-time user wizard** - guide through creating first game
- [ ] **Quick-start templates** - pre-built game starters
- [ ] **In-editor help system** - contextual tips and tutorials

---

## 🎮 Game Template Library ✅ IMPLEMENTED

10 complete, polished game templates users can generate and modify:

### Implemented Templates

| Template | Category | Complexity | Time |
|----------|----------|------------|------|
| 👋 Hello World | Fantasy | Starter | 1-2 min |
| 🪙 Coin Collector | Fantasy | Starter | 2-3 min |
| 💎 Crystal Quest | Fantasy | Standard | 5-7 min |
| 🏪 Merchant Life | Fantasy | Standard | 5-7 min |
| 👻 Haunted Mansion | Horror | Standard | 5-7 min |
| ⚔️ Epic Adventure | Fantasy | Advanced | 10-15 min |
| 🚀 Space Odyssey | Sci-Fi | Advanced | 10-15 min |
| 💕 Coffee Shop Romance | Modern | Standard | 5-7 min |
| 🔢 Math Quest | Educational | Starter | 3-4 min |

### Template Features
- **One-click generation** - Select template, hit generate
- **Filterable by category** - Fantasy, Sci-Fi, Horror, Educational
- **Complexity levels** - Starter (5 assets), Standard (10-15), Advanced (20+)
- **Tag-based search** - Find templates by keywords
- **Featured templates** - Curated best-of showcase

File: `packages/editor/src/ai-generator/services/game-templates.js`

---

## 🧠 AI Enhancement Roadmap

### Phase 1: Better Prompts (Now)
```javascript
// Add smart prompt enhancement
function enhancePrompt(userPrompt, modality) {
  const enhancements = {
    sprite: `${userPrompt}. Style: 16-bit pixel art, clear silhouette, 
             32x48 character with 8-direction walk cycle, idle animation.`,
    cutscene: `${userPrompt}. Format as PixoSpritz .pxc cutscene with 
               @char for characters, @backdrop for scenes, proper dialogue tags.`,
    game: `${userPrompt}. Include: manifest.json, initial zone, player sprite,
           at least one NPC, one enemy, intro cutscene, and basic quest script.`
  };
  return enhancements[modality] || userPrompt;
}
```

### Phase 2: Asset Consistency (Week 2)
- **Style coherence** - All generated sprites match art style
- **Color palette extraction** - Maintain consistent palette across assets
- **Character sheet references** - Generate consistent characters across poses

### Phase 3: Intelligent Suggestions (Week 3-4)
- **"Did you mean..."** - Suggest fixes for incomplete prompts
- **Asset recommendations** - "Your game might need a shopkeeper NPC"
- **Balance suggestions** - "Consider adding a save point before boss"

---

## 📦 Package Format Enhancements

### Quick Export Formats
```javascript
const EXPORT_FORMATS = {
  'pxz': 'Full editable package',
  'pxz-locked': 'Encrypted, non-editable (for branded content)',
  'html': 'Single-file web embed (for blogs/sites)',
  'iframe': 'Embed code for any website',
  'pwa': 'Installable progressive web app'
};
```

### Sharing Integrations
- **Twitter/X Cards** - Auto-generate playable preview cards
- **Discord Rich Presence** - Share directly to Discord
- **Reddit Embed** - r/gamedev, r/indiegaming integration

---

## 🎨 Editor UX Improvements

### 1. Contextual Toolbars
Instead of one giant toolbar, show relevant tools based on selection:
- Selected sprite? Show animation, scale, rotation tools
- Selected tile? Show collision, height, texture tools
- Selected trigger? Show script editor, condition builder

### 2. Visual Script Builder (Future)
For users who don't want to write Lua:
```
[When player touches] → [Show dialogue "Hello!"] → [Give item "Key"]
```
Blocks that compile to PixoScript under the hood.

### 3. Live Preview Mode
- Edit sprite → See changes in running game instantly
- Edit cutscene → Preview plays in real-time
- Edit script → Hot-reload without restart

---

## 📊 Success Metrics (Launch Goals)

| Metric | Target (Month 1) | Target (Month 3) |
|--------|------------------|------------------|
| Published Games | 100 | 1,000 |
| Daily Active Editors | 500 | 5,000 |
| Games Played (total) | 10,000 | 100,000 |
| Game Completion Rate | 25% | 35% |
| Time to First Publish | < 10 min avg | < 5 min avg |

---

## 🛠️ Technical Debt Priorities

### High Priority (Before Launch)
1. **ImagePreview.jsx** - Deprecated lifecycle methods
2. **Console click handling** - Confirmed fixed, verify on mobile
3. **OBJ loader integration** - Complete ObjHelper.js integration
4. **Remove console.logs** - Clean production builds

### Medium Priority (Week 2)
1. **Component decomposition** - Break up MapEditor, CutscenePlayer
2. **Shared package extraction** - math, webgl-utils modules
3. **Performance optimization** - Picker pass 1x1 framebuffer

### Low Priority (Month 2)
1. **Undo/redo everywhere** - Currently partial coverage
2. **Syntax highlighting** - Better PixoScript editor
3. **Asset caching** - Reduce re-generation costs

---

## 🎯 Immediate Action Items

### Today
1. ✅ Complete codebase analysis
2. ⬜ Fix ImagePreview.jsx deprecated lifecycle
3. ⬜ Remove debug console.logs
4. ⬜ Fix ObjModelViewer.jsx mtlUrl bug

### This Week
1. ⬜ Add 3 demo templates to AI generator
2. ⬜ Create first-time user tutorial
3. ⬜ Polish AI generator error handling
4. ⬜ Test full game generation flow end-to-end

### Before Launch
1. ⬜ 5 polished demo games in gallery
2. ⬜ Documentation complete
3. ⬜ Mobile/touch testing
4. ⬜ Performance benchmarks
5. ⬜ Security review (especially for gallery uploads)

---

## 🌟 The Dream

Imagine a kid in 2025 who:
1. Opens PixoSpritz in their browser
2. Types "make a game about my cat fighting aliens"
3. Watches AI generate sprites, cutscenes, scripts
4. Hits "Play" and actually plays it
5. Shares the link with friends who remix it into something new

That's the platform we're building. That's why we win.

---

## Appendix: Code Files to Fix

```
packages/editor/src/image-preview/ImagePreview.jsx - deprecated lifecycle
packages/editor/src/map-editor/MapEditor.jsx - console.log statements
packages/editor/src/model-preview/ObjModelViewer.jsx - undefined mtlUrl
packages/editor/src/cutscene-tool/CutscenePlayer.jsx - console.log statements
```

---

*Last Updated: December 2, 2025*
*Author: Kyle Derby MacInnis + Claude*
