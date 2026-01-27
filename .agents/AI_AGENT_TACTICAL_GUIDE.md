# 🛠️ AI AGENT TACTICAL IMPLEMENTATION GUIDE

**Companion to:** AI_AGENT_GAMEPLAN.md  
**Purpose:** Deep technical details for implementing each task  
**Status:** DETAILED EXECUTION REFERENCE

---

## TABLE OF CONTENTS

1. [Code Organization Patterns](#code-organization-patterns)
2. [Package Dependencies & Integration](#package-dependencies--integration)
3. [Testing Strategies](#testing-strategies)
4. [Common Patterns to Reuse](#common-patterns-to-reuse)
5. [File Structure Recommendations](#file-structure-recommendations)
6. [Integration Checkpoints](#integration-checkpoints)

---

## CODE ORGANIZATION PATTERNS

### Editor Component Structure

```javascript
// packages/editor/src/editors/[EditorName].jsx
import React, { useState, useCallback, useRef } from 'react';
import { useHistory } from '../hooks/useHistory';
import { useSelection } from '../hooks/useSelection';
import { useAssetLibrary } from '../hooks/useAssetLibrary';
import { EditorToolbar } from '../components/shared/EditorToolbar';
import { EditorPanel } from '../components/shared/EditorPanel';
import { PropertyPanel } from '../components/shared/PropertyPanel';
import styles from './[EditorName].module.css';

export const [EditorName] = ({ project, onSave }) => {
  // 1. State management
  const [viewport, setViewport] = useState({});
  const { canUndo, canRedo, undo, redo, recordAction } = useHistory();
  const { selection, select, deselect, selectAll } = useSelection();
  const { assets, loadAsset } = useAssetLibrary();

  // 2. WebGL/Canvas reference
  const canvasRef = useRef(null);
  const rendererRef = useRef(null);

  // 3. Lifecycle & initialization
  React.useEffect(() => {
    const renderer = initializeRenderer(canvasRef.current);
    rendererRef.current = renderer;
    return () => renderer.dispose();
  }, []);

  // 4. Event handlers (use useCallback to prevent re-renders)
  const handleToolChange = useCallback(tool => {
    setCurrentTool(tool);
  }, []);

  const handleSave = useCallback(() => {
    const data = serializeToJSON();
    recordAction({ type: 'save', data });
    onSave(data);
  }, [recordAction, onSave]);

  // 5. Render method
  return (
    <div className={styles.container}>
      <EditorToolbar tools={AVAILABLE_TOOLS} onToolChange={handleToolChange} />
      <div className={styles.workspace}>
        <EditorPanel position="left" title="Assets">
          {/* Asset panel content */}
        </EditorPanel>
        <EditorPanel position="center" title="Viewport" className={styles.viewport}>
          <WebGLCanvas ref={canvasRef} />
        </EditorPanel>
        <PropertyPanel title="Properties" data={selectionData} />
      </div>
    </div>
  );
};

export default [EditorName];
```

### Engine System Structure

```javascript
// packages/core-js/src/engine/systems/[SystemName].js
export class [SystemName] {
  constructor(config = {}) {
    this.config = {
      enabled: true,
      debug: false,
      ...config
    };
    this.initialized = false;
    this.listeners = new Map();
  }

  // Lifecycle
  async initialize() {
    if (this.initialized) return;
    // Setup code
    this.initialized = true;
  }

  async dispose() {
    if (!this.initialized) return;
    // Cleanup code
    this.initialized = false;
  }

  // Event system
  on(eventType, callback) {
    if (!this.listeners.has(eventType)) {
      this.listeners.set(eventType, []);
    }
    this.listeners.get(eventType).push(callback);
    return () => this.off(eventType, callback);
  }

  off(eventType, callback) {
    const listeners = this.listeners.get(eventType) || [];
    const index = listeners.indexOf(callback);
    if (index > -1) listeners.splice(index, 1);
  }

  emit(eventType, data) {
    const listeners = this.listeners.get(eventType) || [];
    listeners.forEach(cb => {
      try {
        cb(data);
      } catch (err) {
        console.error(`Error in ${eventType} listener:`, err);
      }
    });
  }

  // Main update loop
  update(deltaTime) {
    if (!this.initialized || !this.config.enabled) return;
    // Update logic
  }

  // Public API
  // ... system-specific methods
}
```

### Hooks for Editor

```javascript
// packages/editor/src/hooks/useHistory.js
import { useState, useCallback } from 'react';

export const useHistory = (initialState = null) => {
  const [history, setHistory] = useState([initialState]);
  const [currentIndex, setCurrentIndex] = useState(0);

  const recordAction = useCallback(
    action => {
      const newHistory = history.slice(0, currentIndex + 1);
      newHistory.push(action);
      setHistory(newHistory);
      setCurrentIndex(newHistory.length - 1);
    },
    [history, currentIndex]
  );

  const undo = useCallback(() => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  }, [currentIndex]);

  const redo = useCallback(() => {
    if (currentIndex < history.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  }, [currentIndex, history.length]);

  return {
    current: history[currentIndex],
    history,
    currentIndex,
    canUndo: currentIndex > 0,
    canRedo: currentIndex < history.length - 1,
    recordAction,
    undo,
    redo,
  };
};

// packages/editor/src/hooks/useSelection.js
export const useSelection = () => {
  const [selected, setSelected] = useState(new Set());

  const select = useCallback(item => {
    setSelected(prev => new Set([...prev, item]));
  }, []);

  const deselect = useCallback(item => {
    setSelected(prev => {
      const next = new Set(prev);
      next.delete(item);
      return next;
    });
  }, []);

  const selectAll = useCallback(items => {
    setSelected(new Set(items));
  }, []);

  const clearSelection = useCallback(() => {
    setSelected(new Set());
  }, []);

  const toggleSelection = useCallback(item => {
    setSelected(prev => {
      const next = new Set(prev);
      if (next.has(item)) {
        next.delete(item);
      } else {
        next.add(item);
      }
      return next;
    });
  }, []);

  return {
    selected,
    select,
    deselect,
    selectAll,
    clearSelection,
    toggleSelection,
    isSelected: item => selected.has(item),
    count: selected.size,
  };
};
```

---

## PACKAGE DEPENDENCIES & INTEGRATION

### Dependency Chain (what imports what)

```
┌─ pixospritz-core
│  ├── imports: pixospritz-math
│  ├── imports: pixoscript
│  └── exports: RenderManager, ActionQueue, GamePad, etc.
│
├─ pixoscript
│  ├── imports: pixospritz-math
│  └── exports: ScriptEngine, Parser, Runtime
│
├─ pixospritz-math
│  └── exports: Vector2, Vector3, Matrix4, Quaternion
│
├─ pixospritz-editor
│  ├── imports: pixospritz-core
│  ├── imports: pixoscript
│  ├── imports: pixospritz-math
│  └── exports: (UI components)
│
├─ pixospritz-console
│  ├── imports: pixospritz-core
│  ├── imports: pixoscript
│  └── exports: GamePlayer
│
└─ pixospritz-server
   ├── imports: pixoscript
   ├── imports: pixospritz-math
   └── exports: GameServer, ZoneManager
```

### Integration Points When Adding Features

**When adding to core:**

- Update `packages/core-js/src/index.js` to export new classes
- Add tests in `packages/core-js/__tests__/`
- Document API in `packages/core-js/documentation/`
- Update `PENDING.md` with completion

**When adding to script:**

- Update `packages/script/src/stdlib/` with new functions
- Add type definitions in `packages/script/src/types/`
- Add tests in `packages/script/__tests__/`
- Update scripting API docs

**When adding to editor:**

- Create component in `packages/editor/src/[feature]/`
- Add to editor menu/toolbar
- Add shortcuts if applicable
- Update editor README

**When adding to server:**

- Create system in `packages/server/src/systems/`
- Add WebSocket message handler
- Add tests for protocol
- Update server docs

---

## TESTING STRATEGIES

### Unit Testing Template

```javascript
// packages/[package]/__tests__/[feature].test.js
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { MyClass } from '../src/MyClass';

describe('MyClass', () => {
  let instance;

  beforeEach(() => {
    instance = new MyClass();
  });

  afterEach(() => {
    instance?.dispose();
  });

  describe('initialization', () => {
    it('should initialize with default config', () => {
      expect(instance.config.enabled).toBe(true);
    });

    it('should accept custom config', () => {
      const custom = new MyClass({ enabled: false });
      expect(custom.config.enabled).toBe(false);
    });
  });

  describe('update', () => {
    it('should update when enabled', () => {
      const spy = vi.fn();
      instance.on('updated', spy);
      instance.update(0.016);
      expect(spy).toHaveBeenCalled();
    });

    it('should not update when disabled', () => {
      instance.config.enabled = false;
      const spy = vi.fn();
      instance.on('updated', spy);
      instance.update(0.016);
      expect(spy).not.toHaveBeenCalled();
    });
  });

  describe('event system', () => {
    it('should emit events', () => {
      const handler = vi.fn();
      instance.on('test', handler);
      instance.emit('test', { data: 'value' });
      expect(handler).toHaveBeenCalledWith({ data: 'value' });
    });

    it('should allow unsubscribing', () => {
      const handler = vi.fn();
      const unsubscribe = instance.on('test', handler);
      unsubscribe();
      instance.emit('test', {});
      expect(handler).not.toHaveBeenCalled();
    });
  });
});
```

### E2E Testing Template

```javascript
// packages/editor/__tests__/e2e/create-game.test.js
import { test, expect } from '@playwright/test';

test.describe('Creating a game', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3000');
  });

  test('should create a new project', async ({ page }) => {
    // Click "New Project"
    await page.click('button:has-text("New Project")');

    // Fill in project name
    await page.fill('input[placeholder="Project name"]', 'Test Game');

    // Verify project created
    await expect(page.locator('text=Test Game')).toBeVisible();
  });

  test('should add a sprite to project', async ({ page }) => {
    // Create project first
    await page.click('button:has-text("New Project")');
    await page.fill('input[placeholder="Project name"]', 'Test Game');

    // Go to sprite editor
    await page.click('button:has-text("Sprites")');

    // Create new sprite
    await page.click('button:has-text("New Sprite")');
    await page.fill('input[placeholder="Sprite name"]', 'Player');

    // Verify sprite created
    await expect(page.locator('text=Player')).toBeVisible();
  });
});
```

---

## COMMON PATTERNS TO REUSE

### Undo/Redo Pattern

```javascript
// Usage in any component:
const { current, recordAction, undo, redo, canUndo, canRedo } = useHistory();

// Record action:
recordAction({
  type: 'sprite-move',
  spriteId: 'sprite-1',
  from: { x: 0, y: 0 },
  to: { x: 10, y: 10 },
  undo: () => {
    /* restore sprite position */
  },
  redo: () => {
    /* apply move */
  },
});

// Later: Perform undo/redo
undo(); // Goes back one action
redo(); // Goes forward one action
```

### Event Emitter Pattern

```javascript
// Any system can emit/listen to events:
system.on('sprite:created', sprite => {
  console.log('Sprite created:', sprite);
});

system.emit('sprite:created', { id: 'sprite-1', name: 'Player' });

// Multiple listeners, error handling built-in
```

### Asset Pipeline Pattern

```javascript
// Load asset with caching
const { assets, loadAsset, unloadAsset } = useAssetLibrary();

// Request asset (cached if already loaded)
const spriteSheet = await loadAsset('sprites/player.json', 'sprite');

// Use asset
render(spriteSheet);

// Unload when done
unloadAsset('sprites/player.json');
```

### Modal Dialog Pattern

```javascript
// Show modal from any component:
const { showModal, closeModal } = useModal();

showModal({
  title: 'Export Sprite',
  content: <ExportForm />,
  actions: [
    { label: 'Cancel', onClick: closeModal },
    {
      label: 'Export',
      onClick: () => {
        /* export */ closeModal();
      },
    },
  ],
});
```

---

## FILE STRUCTURE RECOMMENDATIONS

### Organizational Principles

1. **Feature-based structure** (preferred for editor)

   ```
   packages/editor/src/
   ├── features/
   │   ├── sprite-editor/
   │   │   ├── components/
   │   │   │   ├── ToolPanel.jsx
   │   │   │   ├── Canvas.jsx
   │   │   │   └── Properties.jsx
   │   │   ├── hooks/
   │   │   │   └── useSpritePaint.js
   │   │   ├── utils/
   │   │   │   └── spriteUtils.js
   │   │   └── index.js
   │   └── map-editor/
   │       └── (similar structure)
   ├── shared/
   │   ├── components/
   │   │   └── (shared UI components)
   │   └── hooks/
   │       └── (shared hooks)
   └── systems/
       └── (global systems)
   ```

2. **System-based structure** (preferred for engine)
   ```
   packages/core-js/src/engine/
   ├── systems/
   │   ├── RenderSystem.js
   │   ├── AudioSystem.js
   │   └── InputSystem.js
   ├── entities/
   │   ├── Entity.js
   │   └── Actor.js
   ├── components/
   │   ├── Transform.js
   │   ├── Sprite.js
   │   └── Collider.js
   ├── resources/
   │   └── ResourceManager.js
   └── index.js
   ```

### Common File Patterns

**Index files** - Re-export public API:

```javascript
// packages/core-js/src/engine/index.js
export { RenderManager } from './systems/RenderManager';
export { AudioSystem } from './systems/AudioSystem';
export { Entity } from './entities/Entity';
// ... all public exports
```

**Config files** - Centralize constants:

```javascript
// packages/editor/src/config/constants.js
export const GRID_SIZE = 16;
export const TOOL_TYPES = {
  BRUSH: 'brush',
  ERASER: 'eraser',
  FILL: 'fill',
};
export const COLORS = {
  PRIMARY: '#ff6b9d',
  SECONDARY: '#4ecdc4',
};
```

**Utils files** - Helper functions:

```javascript
// packages/core-js/src/engine/utils/mathUtils.js
export const clamp = (value, min, max) => Math.max(min, Math.min(max, value));
export const lerp = (a, b, t) => a + (b - a) * t;
export const distance = (p1, p2) => Math.sqrt((p1.x - p2.x) ** 2 + (p1.y - p2.y) ** 2);
```

---

## INTEGRATION CHECKPOINTS

### Before Starting Each Phase

**Checkpoint: Phase 0 Completion**

- [ ] All React deprecation warnings fixed
- [ ] No console.log statements in production code
- [ ] OBJ loader integrated and tested
- [ ] JWT auth working on server
- [ ] Rate limiting prevents spam
- [ ] TLS/WSS configured
- [ ] Input validation active
- [ ] Reconnection handling works

**Checkpoint: Phase 1 Kickoff**

- [ ] Design system CSS complete and tested
- [ ] Shared component library working
- [ ] All hooks properly exported and documented
- [ ] Global keyboard shortcut system implemented
- [ ] No build warnings

### During Phase Implementation

**Checkpoint: Feature Complete**

- [ ] Code written and peer reviewed
- [ ] 90%+ test coverage for feature
- [ ] Acceptance criteria verified
- [ ] Documentation updated
- [ ] Performance benchmarked (if relevant)
- [ ] No console errors/warnings

**Checkpoint: Integration**

- [ ] All dependencies resolved
- [ ] Integrated with existing systems
- [ ] Works with other concurrent features
- [ ] Build succeeds without warnings
- [ ] Test suite passes

### Before Phase Completion

**Checkpoint: Phase Integration**

- [ ] All tasks in phase complete
- [ ] Cross-feature integration tested
- [ ] Documentation complete
- [ ] Performance metrics met
- [ ] Ready for next phase

---

## EXAMPLE: Implementing a Task From Start to Finish

### Example Task: Task 1.1.1 - Unified Design System

**Step 1: Setup**

```bash
# Create the file
touch packages/editor/src/design-system/design-system.css
touch packages/editor/src/design-system/index.js
```

**Step 2: Define tokens**

```css
/* packages/editor/src/design-system/design-system.css */
:root {
  /* Colors */
  --color-primary: #ff6b9d;
  --color-secondary: #4ecdc4;
  --color-accent: #ffd93d;
  --color-bg-dark: #1a1a2e;
  --color-bg-light: #f5f5f5;

  /* Typography */
  --font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  --font-size-sm: 0.75rem;
  --font-size-base: 1rem;
  --font-size-lg: 1.125rem;
  --font-size-xl: 1.5rem;

  /* Spacing */
  --space-xs: 0.25rem;
  --space-sm: 0.5rem;
  --space-md: 1rem;
  --space-lg: 1.5rem;
  --space-xl: 2rem;

  /* Shadows */
  --shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.05);
  --shadow-md: 0 4px 6px rgba(0, 0, 0, 0.1);
  --shadow-lg: 0 10px 15px rgba(0, 0, 0, 0.2);

  /* Border radius */
  --radius-sharp: 0;
  --radius-sm: 0.25rem;
  --radius-md: 0.5rem;
  --radius-pill: 9999px;

  /* Transitions */
  --transition-fast: 150ms;
  --transition-normal: 300ms;
  --transition-slow: 500ms;
}
```

**Step 3: Create component library starter**

```javascript
// packages/editor/src/design-system/index.js
export const designTokens = {
  colors: {
    primary: 'var(--color-primary)',
    secondary: 'var(--color-secondary)',
    accent: 'var(--color-accent)',
  },
  spacing: {
    xs: 'var(--space-xs)',
    sm: 'var(--space-sm)',
    md: 'var(--space-md)',
    lg: 'var(--space-lg)',
    xl: 'var(--space-xl)',
  },
  transitions: {
    fast: 'var(--transition-fast)',
    normal: 'var(--transition-normal)',
    slow: 'var(--transition-slow)',
  },
};
```

**Step 4: Create shared component**

```javascript
// packages/editor/src/components/shared/EditorToolbar.jsx
import React from 'react';
import styles from './EditorToolbar.module.css';

export const EditorToolbar = ({ tools, onToolChange, currentTool }) => {
  return (
    <div className={styles.toolbar}>
      {tools.map(tool => (
        <button
          key={tool.id}
          className={`${styles.tool} ${currentTool === tool.id ? styles.active : ''}`}
          onClick={() => onToolChange(tool.id)}
          title={tool.label}
          aria-label={tool.label}
        >
          {tool.icon}
        </button>
      ))}
    </div>
  );
};
```

**Step 5: Create tests**

```javascript
// packages/editor/__tests__/design-system.test.js
import { describe, it, expect } from 'vitest';
import { designTokens } from '../src/design-system';

describe('Design System', () => {
  it('should have all required color tokens', () => {
    expect(designTokens.colors.primary).toBeDefined();
    expect(designTokens.colors.secondary).toBeDefined();
    expect(designTokens.colors.accent).toBeDefined();
  });

  it('should have all required spacing tokens', () => {
    expect(designTokens.spacing.xs).toBeDefined();
    expect(designTokens.spacing.sm).toBeDefined();
    expect(designTokens.spacing.md).toBeDefined();
  });
});
```

**Step 6: Document**

````markdown
# Design System

## Color Tokens

- `--color-primary`: #ff6b9d (main brand color)
- `--color-secondary`: #4ecdc4 (secondary actions)
- `--color-accent`: #ffd93d (highlights)

## Usage in Components

```jsx
import { designTokens } from 'design-system';

<div style={{ color: designTokens.colors.primary }}>Primary text</div>;
```
````

## Migration Checklist

- [ ] EditorToolbar using tokens
- [ ] EditorPanel using tokens
- [ ] All editors using tokens

```

**Step 7: Update PENDING.md**
```

- [x] Task 1.1.1: Unified Design System (COMPLETED)
  - CSS tokens defined
  - Component library starter created
  - Tests written
  - Documentation complete

````

**Step 8: Commit**
```bash
git add packages/editor/src/design-system/
git add packages/editor/__tests__/design-system.test.js
git commit -m "feat: implement unified design system with CSS tokens

- Define color, typography, spacing, shadow, and radius tokens
- Create design-system/index.js for token access
- Add EditorToolbar component using tokens
- Add comprehensive tests
- Update documentation with usage guide

Closes #TASK-1.1.1"
````

---

## RAPID ITERATION TIPS

### Development Workflow

```bash
# 1. Create feature branch
git checkout -b feat/task-number-name

# 2. Watch tests while developing
npm run test:watch --workspace=[package-name]

# 3. Watch build while developing
npm run dev --workspace=[package-name]

# 4. Test in isolation
npm test -- [task-name].test.js

# 5. Commit with conventional commit
git commit -m "feat: [task]: description"

# 6. Push and request review
git push origin feat/task-number-name
```

### Common Commands

```bash
# Install deps
npm install

# Build all packages
npm run build

# Build specific package
npm run build --workspace=core

# Run tests
npm test

# Run tests in watch mode
npm test -- --watch

# Run specific test file
npm test -- sprite-editor.test.js

# Check for lint errors
npm run lint

# Fix lint errors
npm run lint --fix

# Check test coverage
npm test -- --coverage

# Start editor dev server
npm run dev --workspace=editor
```

---

**This tactical guide should be referenced while executing each task in the gameplan.**  
**Updated:** January 2, 2026
