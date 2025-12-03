# 🎮 PixoSpritz Comprehensive Technical Roadmap

## The Ultimate Game Creation Platform

**Version:** 2.0 (December 2025)  
**Status:** COMPREHENSIVE OVERHAUL PLAN  
**Goal:** Make PixoSpritz the GREATEST game creation platform ever built

---

## 📊 Executive Summary

This document represents a complete technical audit and strategic roadmap for PixoSpritz. It covers:
- **8 Editor Components** (analyzed, issues documented, solutions proposed)
- **15 Engine Systems** (bugs identified, performance bottlenecks, API cleanup)
- **Scripting Runtime** (Lua implementation, missing features, debugging)
- **Cutscene System** (DSL capabilities, editor UX, professional features)
- **Networking Infrastructure** (security vulnerabilities, scalability, production readiness)

---

## 🏗️ PART 1: EDITOR OVERHAUL

### 1.1 Design System Consolidation ✅ STARTED

**Current State:** Inconsistent styling across editors (inline styles, separate CSS files, hardcoded colors)

**Solution:** Unified design system (implemented in `design-system.css`)

```
Priority: HIGH (affects all editors)
Status: 60% complete
Files: packages/editor/src/styles/design-system.css
```

#### Remaining Work:
- [ ] Migrate all inline styles to CSS variables
- [ ] Create component library (EditorToolbar, EditorPanel, EditorCanvas)
- [ ] Implement responsive breakpoints consistently
- [ ] Add high-contrast / accessibility mode

---

### 1.2 Shared Components Extraction

**Problem:** Duplicate implementations across editors

| Duplicated Code | Locations | Solution |
|-----------------|-----------|----------|
| Matrix math | `webgl-utils.js`, `tileset-editor`, `math/` | Consolidate to `@pixospritz/math` |
| Camera controls | 5 editors | Create `useCameraControls()` hook |
| Undo/Redo | Every editor | Create `useHistory()` hook |
| Save button | Every editor | Create `EditorToolbar` component |
| Canvas rendering | 4 editors | Create `WebGLCanvas` wrapper |
| Monaco integration | 2 editors | Create `MonacoWrapper` with config |

**Implementation Plan:**

```javascript
// packages/editor/src/shared/hooks/useHistory.js
export function useHistory(initialState, options = {}) {
  const [history, setHistory] = useState([initialState]);
  const [index, setIndex] = useState(0);
  const maxHistory = options.maxHistory || 50;
  
  const current = useMemo(() => history[index], [history, index]);
  const canUndo = index > 0;
  const canRedo = index < history.length - 1;
  
  const push = useCallback((state) => {
    setHistory(prev => [...prev.slice(0, index + 1), state].slice(-maxHistory));
    setIndex(i => Math.min(i + 1, maxHistory - 1));
  }, [index, maxHistory]);
  
  const undo = useCallback(() => canUndo && setIndex(i => i - 1), [canUndo]);
  const redo = useCallback(() => canRedo && setIndex(i => i + 1), [canRedo]);
  
  return { current, push, undo, redo, canUndo, canRedo };
}
```

---

### 1.3 Editor-by-Editor Improvements

#### 🗺️ MAP EDITOR (Priority: HIGH)

**Current Issues:**
- Two separate editors (2D table-based, 3D WebGL) - confusing
- No copy/paste for regions
- No fill tool
- No auto-tiling
- History stack unbounded (memory leak)

**Required Improvements:**

| Feature | Effort | Impact |
|---------|--------|--------|
| Unify to single 3D editor | 2 weeks | HIGH |
| Add Copy/Paste regions | 2 days | HIGH |
| Add Fill tool | 1 day | MEDIUM |
| Add Layer visibility toggles | 1 day | MEDIUM |
| Auto-tiling system | 1 week | HIGH |
| Minimap for large maps | 2 days | MEDIUM |
| Cap history stack at 100 | 1 hour | LOW |
| Add keyboard shortcut help modal | 2 hours | MEDIUM |

**Auto-Tiling System Design:**
```javascript
// Auto-tile rule definition
const AUTOTILE_RULES = {
  'grass-edge-top': {
    matches: { above: 'water', current: 'grass' },
    tile: 'grass_water_edge_n'
  },
  'grass-corner-nw': {
    matches: { above: 'water', left: 'water', aboveLeft: 'water', current: 'grass' },
    tile: 'grass_water_corner_nw'
  }
};
```

---

#### 🎨 SPRITE EDITOR (Priority: HIGH - Currently Too Basic)

**Current Issues:**
- No animation preview
- Fixed 32x32 size
- Hardcoded 8-color palette
- No drawing tools (line, rect, circle, fill)
- No layers
- No import from images

**Required Improvements:**

| Feature | Effort | Impact |
|---------|--------|--------|
| Animation preview panel | 3 days | CRITICAL |
| Configurable sprite size | 1 day | HIGH |
| Custom palette editor | 2 days | HIGH |
| Drawing tools (line, rect, circle) | 3 days | HIGH |
| Fill (flood fill) tool | 1 day | HIGH |
| Onion skinning | 2 days | MEDIUM |
| Layer support | 1 week | MEDIUM |
| Import PNG/GIF | 2 days | HIGH |
| Export as PNG spritesheet | 1 day | HIGH |
| Mirror mode for symmetry | 1 day | MEDIUM |

**Animation Preview Component:**
```jsx
function AnimationPreview({ frames, fps = 8 }) {
  const [currentFrame, setCurrentFrame] = useState(0);
  
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentFrame(f => (f + 1) % frames.length);
    }, 1000 / fps);
    return () => clearInterval(interval);
  }, [frames.length, fps]);
  
  return (
    <div className="animation-preview">
      <canvas ref={renderFrame(frames[currentFrame])} />
      <div className="controls">
        <Slider value={fps} onChange={setFps} min={1} max={30} />
        <span>{fps} FPS</span>
      </div>
    </div>
  );
}
```

---

#### 🎬 CUTSCENE EDITOR (Priority: MEDIUM - Good but needs polish)

**Current Issues:**
- No timeline view with scrubbing
- No branching/choices
- Limited camera controls
- No screen shake effects
- Visual mode can confuse beginners

**Required Improvements:**

| Feature | Effort | Impact |
|---------|--------|--------|
| Visual timeline with scrubbing | 1 week | HIGH |
| Branching dialogue nodes | 1 week | HIGH |
| Screen shake command | 2 days | MEDIUM |
| Camera pan/zoom commands | 3 days | HIGH |
| Asset browser integration | 2 days | MEDIUM |
| Inline error highlighting | 1 day | MEDIUM |
| Choice menu designer | 3 days | HIGH |

**New DSL Commands Needed:**
```
@camera pan [x=100,y=50,duration=1000]
@camera zoom [level=1.5,duration=500]
@camera shake [intensity=5,duration=300]
@choice
  > "Go left" -> left_path.pxc
  > "Go right" -> right_path.pxc
  > "Stay here" {
    HERO: I'll wait a bit.
  }
@endchoice
```

---

#### 📝 SCRIPT EDITOR (Priority: HIGH - Currently Just Monaco Wrapper)

**Current Issues:**
- No PixoScript autocompletion
- No API documentation hover
- No error markers
- No debugging support
- No console output panel

**Required Improvements:**

| Feature | Effort | Impact |
|---------|--------|--------|
| PixoScript language definition | 3 days | HIGH |
| API autocompletion | 1 week | CRITICAL |
| Hover documentation | 3 days | HIGH |
| Error/lint markers | 3 days | HIGH |
| Console output panel | 2 days | HIGH |
| Breakpoint support (debug mode) | 1 week | MEDIUM |
| Snippet library | 2 days | MEDIUM |

**Monaco Language Configuration:**
```javascript
monaco.languages.register({ id: 'pixoscript' });

monaco.languages.setMonarchTokensProvider('pixoscript', {
  keywords: ['local', 'function', 'if', 'then', 'else', 'elseif', 'end', 
             'for', 'while', 'do', 'repeat', 'until', 'return', 'and', 
             'or', 'not', 'nil', 'true', 'false', 'in'],
  
  pixosApi: ['pixos.load_zone', 'pixos.set_flag', 'pixos.get_flag',
             'pixos.run_cutscene', 'pixos.sprite_dialogue', 'pixos.sync'],
  
  tokenizer: {
    root: [
      [/pixos\.\w+/, 'pixos-api'],
      [/[a-zA-Z_]\w*/, { cases: { '@keywords': 'keyword', '@default': 'identifier' } }],
      [/"[^"]*"/, 'string'],
      [/'[^']*'/, 'string'],
      [/--\[\[[\s\S]*?\]\]/, 'comment'],
      [/--.*$/, 'comment'],
    ]
  }
});

monaco.languages.registerCompletionItemProvider('pixoscript', {
  provideCompletionItems: (model, position) => {
    const suggestions = PIXOS_API.map(fn => ({
      label: fn.name,
      kind: monaco.languages.CompletionItemKind.Function,
      insertText: fn.snippet,
      documentation: fn.docs
    }));
    return { suggestions };
  }
});
```

---

#### 🧊 GEOMETRY EDITOR (Priority: LOW - Functional)

**Improvements Needed:**
- [ ] Visual vertex dragging (3D gizmos)
- [ ] Import OBJ/GLTF files
- [ ] Primitive templates (cube, cylinder, plane)
- [ ] UV unwrap helper visualization
- [ ] Normal visualization toggle

---

#### 📦 ZIP MANAGER (Priority: LOW - Well Implemented)

**Improvements Needed:**
- [ ] Drag-drop file import from desktop
- [ ] File search within package
- [ ] Bulk rename with patterns
- [ ] File diff/comparison view

---

#### ✨ AI GENERATOR (Priority: MEDIUM - Good but can improve)

**Improvements Needed:**
- [ ] Generation cost estimation before starting
- [ ] Progress ETA during generation
- [ ] Cancel generation mid-process
- [ ] Generation history / versioning
- [ ] Style consistency options
- [ ] Seed for reproducible generation

---

### 1.4 Keyboard Shortcuts System

**Global Shortcuts (All Editors):**
```javascript
const GLOBAL_SHORTCUTS = {
  'Ctrl+S': 'Save current file',
  'Ctrl+Z': 'Undo',
  'Ctrl+Shift+Z': 'Redo',
  'Ctrl+Y': 'Redo (alt)',
  'F1': 'Show help',
  'Escape': 'Cancel current operation'
};
```

**Per-Editor Shortcuts:**
```javascript
const MAP_EDITOR_SHORTCUTS = {
  'P': 'Paint tool',
  'E': 'Erase tool',
  'I': 'Eyedropper/pick tool',
  'F': 'Fill tool',
  'R': 'Reset camera',
  'G': 'Toggle grid',
  'L': 'Toggle layer panel',
  '[': 'Previous layer',
  ']': 'Next layer'
};
```

**Help Modal Component:**
```jsx
function ShortcutHelpModal({ shortcuts, isOpen, onClose }) {
  return (
    <Modal open={isOpen} onClose={onClose}>
      <Modal.Header>Keyboard Shortcuts</Modal.Header>
      <Modal.Body>
        <table className="shortcuts-table">
          {Object.entries(shortcuts).map(([key, action]) => (
            <tr key={key}>
              <td><kbd>{key}</kbd></td>
              <td>{action}</td>
            </tr>
          ))}
        </table>
      </Modal.Body>
    </Modal>
  );
}
```

---

## ⚙️ PART 2: ENGINE FIXES & IMPROVEMENTS

### 2.1 Critical Bugs (Must Fix)

| Bug | Location | Severity | Fix |
|-----|----------|----------|-----|
| Duplicate `set()` method | `ModeManager.js:200` | HIGH | Remove duplicate, keep async version |
| Picker frustum not working | `RenderManager.js:469` | MEDIUM | Fix 1x1 pixel framebuffer optimization |
| Projection Y-flip workaround | `RenderManager.js:533` | LOW | Investigate coordinate system mismatch |
| Number.prototype.clamp pollution | `camera.js:28` | LOW | Use utility function instead |
| play_cutscene not working | `PixoScriptLibrary.js:202` | HIGH | Implement properly or remove |

---

### 2.2 Performance Optimizations

#### Rendering Pipeline

| Optimization | Current | Target | Impact |
|--------------|---------|--------|--------|
| Frustum culling | Not implemented | Cull off-screen tiles | 30-50% fewer draw calls |
| Particle batching | 1 draw per particle | Instanced rendering | 10x particle count |
| Light uniform updates | All 32 every frame | Only active lights | Minor |
| Picker pass | Full screen | 1x1 pixel (fix bug) | 90% reduction |
| Level of detail | None | Distance-based | Large map performance |

**Frustum Culling Implementation:**
```javascript
class FrustumCuller {
  constructor(camera, projectionMatrix) {
    this.planes = this.extractPlanes(projectionMatrix, camera.viewMatrix);
  }
  
  isVisible(aabb) {
    for (const plane of this.planes) {
      if (this.distanceToPlane(plane, aabb) < 0) {
        return false;
      }
    }
    return true;
  }
  
  extractPlanes(proj, view) {
    const vp = mat4.multiply([], proj, view);
    // Extract 6 frustum planes from view-projection matrix
    return [
      this.normalizePlane([vp[3]+vp[0], vp[7]+vp[4], vp[11]+vp[8], vp[15]+vp[12]]), // Left
      this.normalizePlane([vp[3]-vp[0], vp[7]-vp[4], vp[11]-vp[8], vp[15]-vp[12]]), // Right
      // ... bottom, top, near, far
    ];
  }
}
```

#### Particle System Instancing

```glsl
// Instanced particle vertex shader
attribute vec3 a_position;
attribute vec3 a_instancePosition;
attribute vec4 a_instanceColor;
attribute float a_instanceSize;

void main() {
  vec3 worldPos = a_position * a_instanceSize + a_instancePosition;
  // Billboard rotation here
  gl_Position = u_projection * u_view * vec4(worldPos, 1.0);
  v_color = a_instanceColor;
}
```

---

### 2.3 New Engine Features

#### Screen Shake Effect
```javascript
class CameraEffects {
  static shake(camera, intensity = 5, duration = 300) {
    const startTime = performance.now();
    const originalTarget = [...camera.target];
    
    const update = () => {
      const elapsed = performance.now() - startTime;
      if (elapsed > duration) {
        camera.target = originalTarget;
        return;
      }
      
      const decay = 1 - (elapsed / duration);
      const offsetX = (Math.random() - 0.5) * 2 * intensity * decay;
      const offsetY = (Math.random() - 0.5) * 2 * intensity * decay;
      camera.target = [
        originalTarget[0] + offsetX,
        originalTarget[1] + offsetY,
        originalTarget[2]
      ];
      
      requestAnimationFrame(update);
    };
    
    requestAnimationFrame(update);
  }
}
```

#### Camera Smooth Follow
```javascript
class SmoothFollow {
  constructor(camera, target, options = {}) {
    this.camera = camera;
    this.target = target;
    this.smoothing = options.smoothing || 0.1;
    this.offset = options.offset || [0, 5, 10];
  }
  
  update(deltaTime) {
    const targetPos = vec3.add([], this.target.position, this.offset);
    const currentPos = this.camera.position;
    
    this.camera.position = vec3.lerp(
      [], 
      currentPos, 
      targetPos, 
      this.smoothing * deltaTime * 60
    );
    
    this.camera.lookAt(this.target.position);
  }
}
```

---

### 2.4 Transition System Enhancement

**New Transition Types:**
```javascript
const TRANSITIONS = {
  // Existing
  fade: 'Fade to black and back',
  blur: 'Gaussian blur transition',
  cross: 'Cross-fade between scenes',
  crossBlur: 'Cross-fade with blur',
  swirl: 'Spiral/vortex effect',
  
  // New
  wipe_left: 'Horizontal wipe from left',
  wipe_right: 'Horizontal wipe from right',
  wipe_up: 'Vertical wipe from bottom',
  wipe_down: 'Vertical wipe from top',
  pixelate: 'Pixelation transition',
  dissolve: 'Random pixel dissolve',
  circle: 'Circular reveal/hide',
  diamond: 'Diamond-shaped transition'
};
```

**Easing Functions:**
```javascript
const EASING = {
  linear: t => t,
  easeIn: t => t * t,
  easeOut: t => t * (2 - t),
  easeInOut: t => t < 0.5 ? 2*t*t : -1+(4-2*t)*t,
  elastic: t => Math.sin(-13 * Math.PI/2 * (t + 1)) * Math.pow(2, -10 * t) + 1,
  bounce: t => {
    if (t < 1/2.75) return 7.5625*t*t;
    if (t < 2/2.75) return 7.5625*(t-=1.5/2.75)*t+.75;
    if (t < 2.5/2.75) return 7.5625*(t-=2.25/2.75)*t+.9375;
    return 7.5625*(t-=2.625/2.75)*t+.984375;
  }
};
```

---

## 📜 PART 3: SCRIPTING SYSTEM IMPROVEMENTS

### 3.1 Missing Lua Features to Implement

| Feature | Priority | Effort | Notes |
|---------|----------|--------|-------|
| Coroutines | HIGH | 1 week | Use async generators |
| Source maps | HIGH | 3 days | Error line mapping |
| Debug library | MEDIUM | 1 week | sethook, getinfo, traceback |
| UTF-8 library | LOW | 2 days | String operations |
| `_ENV` environments | LOW | 3 days | Sandboxing |

**Coroutine Implementation Using Async Generators:**
```javascript
// Lua-style coroutine using async generators
class Coroutine {
  constructor(generatorFn) {
    this.generator = generatorFn();
    this.status = 'suspended';
  }
  
  async resume(...args) {
    if (this.status === 'dead') {
      throw new LuaError('cannot resume dead coroutine');
    }
    
    this.status = 'running';
    const result = await this.generator.next(args);
    
    if (result.done) {
      this.status = 'dead';
    } else {
      this.status = 'suspended';
    }
    
    return result.value;
  }
  
  static create(fn) {
    return new Coroutine(fn);
  }
  
  static yield(value) {
    // This would be a special token the interpreter handles
    return { __yield: true, value };
  }
}
```

---

### 3.2 Script Debugging System

**Debug Mode Architecture:**
```javascript
class ScriptDebugger {
  constructor() {
    this.breakpoints = new Map(); // file:line -> boolean
    this.watches = new Map(); // variable -> current value
    this.callStack = [];
    this.isPaused = false;
    this.stepMode = null; // 'into', 'over', 'out', null
  }
  
  addBreakpoint(file, line) {
    this.breakpoints.set(`${file}:${line}`, true);
  }
  
  // Called before each statement execution
  beforeStatement(file, line, scope) {
    this.currentFile = file;
    this.currentLine = line;
    
    if (this.breakpoints.get(`${file}:${line}`) || this.stepMode) {
      this.isPaused = true;
      this.emit('paused', { file, line, scope, callStack: this.callStack });
      return this.waitForResume();
    }
  }
  
  async waitForResume() {
    return new Promise(resolve => {
      this.resumeCallback = resolve;
    });
  }
  
  continue() {
    this.stepMode = null;
    this.isPaused = false;
    this.resumeCallback?.();
  }
  
  stepInto() {
    this.stepMode = 'into';
    this.resumeCallback?.();
  }
  
  stepOver() {
    this.stepMode = 'over';
    this.targetDepth = this.callStack.length;
    this.resumeCallback?.();
  }
  
  stepOut() {
    this.stepMode = 'out';
    this.targetDepth = this.callStack.length - 1;
    this.resumeCallback?.();
  }
}
```

---

### 3.3 PixoScript API Documentation

**Auto-Generated Documentation Format:**
```javascript
const PIXOS_API_DOCS = {
  'pixos.load_zone': {
    signature: 'load_zone(zone_name: string) -> void',
    description: 'Loads a zone from the package and transitions to it.',
    params: [
      { name: 'zone_name', type: 'string', description: 'Path to zone JSON file' }
    ],
    returns: 'Promise that resolves when zone is loaded',
    example: `
      pixos.sync({
        pixos.load_zone('maps/dungeon.json')
      })
    `,
    category: 'Zone Management'
  },
  
  'pixos.sprite_dialogue': {
    signature: 'sprite_dialogue(sprite_id: string, text: string, options?: table) -> void',
    description: 'Shows a dialogue bubble above a sprite.',
    params: [
      { name: 'sprite_id', type: 'string', description: 'ID of the sprite' },
      { name: 'text', type: 'string', description: 'Dialogue text to show' },
      { name: 'options', type: 'table', optional: true, description: 'Options like duration, style' }
    ],
    example: `
      pixos.sprite_dialogue('npc_elder', 'Welcome, young adventurer!')
    `,
    category: 'Dialogue'
  }
  // ... all other functions
};
```

---

## 🌐 PART 4: NETWORKING & MULTIPLAYER

### 4.1 Security Fixes (CRITICAL)

| Vulnerability | Fix | Priority |
|---------------|-----|----------|
| No authentication | Implement JWT tokens | P0 |
| No rate limiting | Add per-client throttle (60 msg/sec) | P0 |
| No input validation | JSON Schema validation | P0 |
| No TLS | Enable WSS with certificates | P0 |
| Action injection | Server-side game rule validation | P1 |

**JWT Authentication Implementation:**
```javascript
// packages/server/src/auth/jwt.js
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'change-in-production';

function generateToken(userId, options = {}) {
  return jwt.sign(
    { userId, type: 'access' },
    JWT_SECRET,
    { expiresIn: options.expiresIn || '24h' }
  );
}

function verifyToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (err) {
    return null;
  }
}

// WebSocket connection handler
wss.on('connection', (ws, req) => {
  const token = new URL(req.url, 'ws://localhost').searchParams.get('token');
  const payload = verifyToken(token);
  
  if (!payload) {
    ws.close(4001, 'Invalid or expired token');
    return;
  }
  
  ws.userId = payload.userId;
  // Continue with normal connection flow
});
```

**Rate Limiting:**
```javascript
class RateLimiter {
  constructor(maxRequests = 60, windowMs = 1000) {
    this.clients = new Map();
    this.maxRequests = maxRequests;
    this.windowMs = windowMs;
  }
  
  isAllowed(clientId) {
    const now = Date.now();
    const client = this.clients.get(clientId) || { count: 0, windowStart: now };
    
    if (now - client.windowStart > this.windowMs) {
      client.count = 1;
      client.windowStart = now;
    } else {
      client.count++;
    }
    
    this.clients.set(clientId, client);
    return client.count <= this.maxRequests;
  }
}

// Usage in message handler
wss.on('message', (ws, message) => {
  if (!rateLimiter.isAllowed(ws.clientId)) {
    ws.send(JSON.stringify({ type: 'error', message: 'Rate limit exceeded' }));
    return;
  }
  // Process message
});
```

---

### 4.2 Reconnection Handling

```javascript
class SessionManager {
  constructor() {
    this.sessions = new Map(); // sessionId -> session data
    this.sessionTimeout = 5 * 60 * 1000; // 5 minutes
  }
  
  createSession(userId, ws) {
    const sessionId = crypto.randomUUID();
    this.sessions.set(sessionId, {
      userId,
      ws,
      zoneId: null,
      avatar: null,
      lastSeen: Date.now()
    });
    return sessionId;
  }
  
  reconnect(sessionId, ws) {
    const session = this.sessions.get(sessionId);
    if (!session) return false;
    
    if (Date.now() - session.lastSeen > this.sessionTimeout) {
      this.sessions.delete(sessionId);
      return false;
    }
    
    session.ws = ws;
    session.lastSeen = Date.now();
    
    // Restore player to their zone
    if (session.zoneId) {
      this.rejoinZone(session);
    }
    
    return true;
  }
  
  rejoinZone(session) {
    const zone = zoneManager.getZone(session.zoneId);
    if (zone) {
      zone.addPlayer(session);
      this.broadcastToZone(session.zoneId, {
        type: 'player_rejoined',
        playerId: session.userId
      });
    }
  }
}
```

---

### 4.3 State Persistence (Redis)

```javascript
// packages/server/src/persistence/redis.js
const Redis = require('ioredis');

class PersistenceLayer {
  constructor() {
    this.redis = new Redis(process.env.REDIS_URL);
  }
  
  async saveZoneState(zoneId, state) {
    await this.redis.set(`zone:${zoneId}:state`, JSON.stringify(state));
  }
  
  async getZoneState(zoneId) {
    const data = await this.redis.get(`zone:${zoneId}:state`);
    return data ? JSON.parse(data) : null;
  }
  
  async savePlayerState(userId, state) {
    await this.redis.hset('players', userId, JSON.stringify(state));
  }
  
  async getPlayerState(userId) {
    const data = await this.redis.hget('players', userId);
    return data ? JSON.parse(data) : null;
  }
  
  async publishZoneUpdate(zoneId, update) {
    await this.redis.publish(`zone:${zoneId}:updates`, JSON.stringify(update));
  }
  
  subscribeToZoneUpdates(zoneId, callback) {
    const subscriber = this.redis.duplicate();
    subscriber.subscribe(`zone:${zoneId}:updates`);
    subscriber.on('message', (channel, message) => {
      callback(JSON.parse(message));
    });
    return subscriber;
  }
}
```

---

### 4.4 Delta Synchronization

```javascript
class DeltaSync {
  constructor() {
    this.previousStates = new Map();
  }
  
  computeDelta(entityId, newState) {
    const previousState = this.previousStates.get(entityId);
    if (!previousState) {
      this.previousStates.set(entityId, { ...newState });
      return { full: true, state: newState };
    }
    
    const delta = {};
    let hasChanges = false;
    
    for (const key in newState) {
      if (!this.deepEqual(previousState[key], newState[key])) {
        delta[key] = newState[key];
        hasChanges = true;
      }
    }
    
    if (hasChanges) {
      this.previousStates.set(entityId, { ...newState });
      return { full: false, delta };
    }
    
    return null; // No changes
  }
  
  deepEqual(a, b) {
    if (a === b) return true;
    if (typeof a !== typeof b) return false;
    if (typeof a !== 'object') return false;
    
    const keysA = Object.keys(a);
    const keysB = Object.keys(b);
    if (keysA.length !== keysB.length) return false;
    
    return keysA.every(key => this.deepEqual(a[key], b[key]));
  }
}
```

---

## 🎬 PART 5: CUTSCENE SYSTEM ENHANCEMENTS

### 5.1 New DSL Commands

```
# Camera Controls
@camera pan [x=100,y=0,duration=1000,easing=easeOut]
@camera zoom [level=1.5,duration=500]
@camera shake [intensity=5,duration=300]
@camera follow [target=HERO,offset_y=50]

# Character Positioning
@char HERO position [x=100,y=200]
@char HERO animate [name=walk,loop=true]
@char HERO moveTo [x=300,duration=2000]
@char HERO face [direction=right]

# Screen Effects
@effect flash [color=#ffffff,duration=100]
@effect overlay [image=rain.gif,opacity=0.5]
@effect tint [color=#ff0000,duration=500]

# Branching
@choice prompt="What do you do?"
  > "Fight!" {
    HERO: Let's do this!
    @goto fight_scene
  }
  > "Run away" {
    HERO: I'm not ready for this...
    @goto escape_scene
  }
  > "Negotiate" -> negotiate.pxc
@endchoice

# Variables
@set quest_started = true
@set gold = gold + 100

@if has_item("key")
  GUARD: You may pass.
@else
  GUARD: The door is locked.
@endif

# Labels and Jumps
@label start
  NARRATOR: Once upon a time...
@label chapter1
  # ...
@goto start  # Jump to label

# Audio Enhancements
@do fadeMusic [duration=2000]
@do crossfadeMusic [to=battle.mp3,duration=1000]
```

---

### 5.2 Timeline Editor Design

```jsx
function CutsceneTimeline({ events, duration, onEventUpdate }) {
  const [playhead, setPlayhead] = useState(0);
  const [zoom, setZoom] = useState(1);
  const [selectedEvent, setSelectedEvent] = useState(null);
  
  const timeToPixels = (time) => time * zoom * 10; // 10px per second at zoom 1
  const pixelsToTime = (px) => px / (zoom * 10);
  
  return (
    <div className="timeline-editor">
      <div className="timeline-header">
        <button onClick={() => setZoom(z => z * 1.5)}>Zoom In</button>
        <button onClick={() => setZoom(z => z / 1.5)}>Zoom Out</button>
        <span>Duration: {duration}s</span>
      </div>
      
      <div className="timeline-ruler">
        {/* Time markers every second */}
        {Array.from({ length: Math.ceil(duration) }, (_, i) => (
          <div 
            key={i} 
            className="time-marker" 
            style={{ left: timeToPixels(i) }}
          >
            {i}s
          </div>
        ))}
      </div>
      
      <div className="timeline-tracks">
        <TimelineTrack name="Dialogue" type="dialogue" events={events} />
        <TimelineTrack name="Camera" type="camera" events={events} />
        <TimelineTrack name="Audio" type="audio" events={events} />
        <TimelineTrack name="Effects" type="effects" events={events} />
      </div>
      
      <div 
        className="playhead" 
        style={{ left: timeToPixels(playhead) }}
        onDrag={(e) => setPlayhead(pixelsToTime(e.clientX))}
      />
    </div>
  );
}
```

---

## 📊 PART 6: TESTING INFRASTRUCTURE

### 6.1 Unit Testing Setup

```javascript
// vitest.config.js
export default {
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./test/setup.js'],
    include: ['**/*.{test,spec}.{js,jsx,ts,tsx}'],
    coverage: {
      reporter: ['text', 'html'],
      exclude: ['node_modules/', 'test/']
    }
  }
};

// Example test: packages/script/src/parser.test.ts
import { describe, it, expect } from 'vitest';
import { parse } from './parser';

describe('PixoScript Parser', () => {
  it('parses simple assignment', () => {
    const result = parse('local x = 5');
    expect(result).toContain('let x = 5');
  });
  
  it('parses function definition', () => {
    const result = parse('function foo() return 1 end');
    expect(result).toContain('function foo()');
    expect(result).toContain('return 1');
  });
  
  it('handles table literals', () => {
    const result = parse('local t = {a=1, b=2}');
    expect(result).toContain('Table');
  });
  
  it('throws on syntax error', () => {
    expect(() => parse('function foo(')).toThrow();
  });
});
```

### 6.2 E2E Testing with Playwright

```javascript
// e2e/editor.spec.js
import { test, expect } from '@playwright/test';

test.describe('PixoSpritz Editor', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:5173');
  });
  
  test('creates new project', async ({ page }) => {
    await page.click('button:has-text("New Project")');
    await expect(page.locator('.zip-manager')).toBeVisible();
  });
  
  test('AI generator creates sprite', async ({ page }) => {
    await page.click('[data-testid="ai-generator-tab"]');
    await page.fill('textarea[placeholder*="Describe"]', 'A red dragon');
    await page.click('button:has-text("Generate")');
    await expect(page.locator('.asset-card')).toBeVisible({ timeout: 60000 });
  });
  
  test('map editor places tile', async ({ page }) => {
    await page.click('[data-testid="map-editor-tab"]');
    await page.click('.tile-palette .tile:first-child');
    await page.click('.map-grid [data-cell="5,5"]');
    await expect(page.locator('[data-cell="5,5"]')).toHaveClass(/painted/);
  });
});
```

---

## 🗓️ PART 7: IMPLEMENTATION TIMELINE

### Phase 1: Critical Fixes (Week 1-2)
- [ ] Fix ModeManager duplicate method
- [ ] Fix picker frustum optimization  
- [ ] Implement rate limiting in server
- [ ] Add JWT authentication
- [ ] Enable TLS for WebSocket

### Phase 2: Editor Consistency (Week 3-4)
- [ ] Complete design system migration
- [ ] Extract shared hooks (useHistory, useCameraControls)
- [ ] Create EditorToolbar component
- [ ] Add keyboard shortcut help modals

### Phase 3: Sprite Editor Overhaul (Week 5-6)
- [ ] Add animation preview
- [ ] Add drawing tools
- [ ] Add custom palette editor
- [ ] Add PNG import/export

### Phase 4: Script Editor Enhancement (Week 7-8)
- [ ] PixoScript Monaco language definition
- [ ] API autocompletion
- [ ] Hover documentation
- [ ] Console output panel

### Phase 5: Engine Performance (Week 9-10)
- [ ] Implement frustum culling
- [ ] Add particle instancing
- [ ] Add screen shake effect
- [ ] Add new transition types

### Phase 6: Cutscene System (Week 11-12)
- [ ] Implement choice/branching
- [ ] Add camera commands
- [ ] Add screen effects
- [ ] Build timeline editor

### Phase 7: Networking Production (Week 13-14)
- [ ] Add reconnection handling
- [ ] Implement delta sync
- [ ] Add Redis persistence
- [ ] Deploy to production server

### Phase 8: Testing & Polish (Week 15-16)
- [ ] Add Vitest unit tests
- [ ] Add Playwright E2E tests
- [ ] Performance benchmarks
- [ ] Security audit

---

## 📈 Success Metrics

| Metric | Current | Target (3 months) | Target (6 months) |
|--------|---------|-------------------|-------------------|
| Editor load time | ~3s | <1.5s | <1s |
| Game package size | ~10MB | <5MB | <3MB |
| Multiplayer latency | N/A | <100ms | <50ms |
| Simultaneous players | ~50 | 500 | 5000 |
| Test coverage | 0% | 40% | 70% |
| Lighthouse score | ~70 | 85 | 95 |

---

## 🌟 The Vision Realized

When this roadmap is complete, PixoSpritz will be:

1. **The fastest way to create games** - From idea to playable in minutes
2. **The most accessible game engine** - No code required, AI-powered
3. **The most complete web-native engine** - Runs anywhere, works offline
4. **Production-ready for multiplayer** - Secure, scalable, persistent
5. **A joy to use** - Consistent, polished, keyboard-friendly

**This is how we make PixoSpritz the GOAT. Let's build it.**

---

*Document Version: 2.0*  
*Last Updated: December 2, 2025*  
*Authors: Kyle Derby MacInnis + Claude (Opus 4.5)*
