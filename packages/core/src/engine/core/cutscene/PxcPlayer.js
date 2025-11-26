/*                                                 *\
** ----------------------------------------------- **
**          Calliope - Pixos Game Engine   	       **
** ----------------------------------------------- **
**  Copyright (c) 2020-2025 - Kyle Derby MacInnis  **
**                                                 **
**    Any unauthorized distribution or transfer    **
**       of this work is strictly prohibited.      **
**                                                 **
**               All Rights Reserved.              **
** ----------------------------------------------- **
\*                                                 */

/**
 * PxcPlayer - .pxc Cutscene Player
 * Plays SpritzCut DSL format cutscenes with audio, backdrops, and dialogue
 * 
 * This is the enhanced engine version that renders directly to the HUD canvas
 * and integrates with the engine's resource loading system.
 */
export default class PxcPlayer {
  constructor(engine, callbacks = {}) {
    this.engine = engine;
    this.callbacks = {
      onDialogueShow: callbacks.onDialogueShow || null,
      onDialogueHide: callbacks.onDialogueHide || null,
      onBackdropChange: callbacks.onBackdropChange || null,
      onCutsceneStart: callbacks.onStart || callbacks.onCutsceneStart || null,
      onCutsceneEnd: callbacks.onEnd || callbacks.onCutsceneEnd || null,
    };
    
    // Character definitions from @char commands
    this.characters = {};
    
    // Visual state
    this.currentBackdrop = null;
    this.backdropImage = null;
    this.portraitImage = null;
    this.cutinImage = null;
    this.currentSpeaker = '';
    this.currentText = '';
    this.displayedText = '';
    this.isTyping = false;
    
    // Playback state
    this.isPlaying = false;
    this.isPaused = false;
    this.skipRequested = false;
    
    // Configuration
    this.typewriterSpeed = 40; // ms per character
    this.autoAdvance = false;
    this.autoAdvanceDelay = 1500; // ms to wait after text completes
    
    // Audio refs
    this.bgmAudio = null;
    this.sfxAudio = null;
    this.voiceAudio = null;
    
    // Resource cache
    this.resourceCache = {};
    
    // Dialogue box styling
    this.dialogueStyle = {
      boxColor: 'rgba(20, 30, 50, 0.9)',
      borderColor: '#4a9eff',
      textColor: '#ffffff',
      speakerColor: '#4af0ff',
      font: '20px minecraftia',
      speakerFont: '16px minecraftia',
      padding: 20,
      portraitSize: 100,
    };
  }

  /**
   * Parse .pxc script into events
   */
  parseScript(scriptText) {
    const lines = scriptText.split('\n');
    const events = [];
    let currentDialogue = null;
    let multilineMode = false;
    let multilineText = [];

    for (let i = 0; i < lines.length; i++) {
      let line = lines[i].trim();
      
      // Skip empty lines and comments
      if (!line || line.startsWith('#')) continue;

      // Multi-line dialogue end
      if (multilineMode && line.includes('"""')) {
        line = line.replace('"""', '').trim();
        if (line) multilineText.push(line);
        
        currentDialogue.text = multilineText.join('\n');
        events.push(currentDialogue);
        currentDialogue = null;
        multilineMode = false;
        multilineText = [];
        continue;
      }

      // Multi-line dialogue content
      if (multilineMode) {
        multilineText.push(line);
        continue;
      }

      // Commands
      if (line.startsWith('@')) {
        const event = this.parseCommand(line);
        if (event) events.push(event);
        continue;
      }

      // Special commands without @
      if (line.startsWith('wait ')) {
        events.push({
          type: 'wait',
          duration: parseInt(line.replace('wait', '').trim())
        });
        continue;
      }

      if (line === 'waitInput' || line === 'wait_input') {
        events.push({ type: 'waitInput' });
        continue;
      }

      // Dialogue lines
      if (line.includes(':')) {
        const isCutin = line.startsWith('*');
        if (isCutin) line = line.substring(1).trim();

        const [speaker, ...rest] = line.split(':');
        const remaining = rest.join(':').trim();

        // Parse bracket metadata
        const bracketMatch = remaining.match(/^\[([^\]]+)\]/);
        const meta = bracketMatch ? this.parseBracket(bracketMatch[1]) : {};
        let text = bracketMatch ? remaining.substring(bracketMatch[0].length).trim() : remaining;

        // Check for multi-line start
        if (text.startsWith('"""')) {
          text = text.replace('"""', '').trim();
          multilineMode = true;
          multilineText = text ? [text] : [];
          currentDialogue = {
            type: 'dialogue',
            actor: speaker.trim(),
            text: '', // Will be filled when multiline ends
            isCutin,
            meta
          };
          continue;
        }

        // Single line dialogue
        events.push({
          type: 'dialogue',
          actor: speaker.trim(),
          text: text.replace(/^["']|["']$/g, ''),
          isCutin,
          meta
        });
      }
    }

    return events;
  }

  /**
   * Parse command line
   */
  parseCommand(line) {
    const parts = line.substring(1).trim().split(/\s+/);
    const cmd = parts[0];
    const rest = parts.slice(1).join(' ');

    // Parse bracket args
    const bracketMatch = rest.match(/\[([^\]]+)\]/);
    const args = bracketMatch ? this.parseBracket(bracketMatch[1]) : {};
    const remaining = bracketMatch ? rest.replace(bracketMatch[0], '').trim() : rest;

    switch (cmd) {
      case 'backdrop':
        return {
          type: 'backdrop',
          url: remaining || args.url || args.file,
          options: args
        };

      case 'char':
        const charParts = remaining.split(/\s+/);
        const charName = charParts[0];
        // Parse inline attributes like sprite=path
        const charArgs = { ...args };
        charParts.slice(1).forEach(p => {
          if (p.includes('=')) {
            const [k, v] = p.split(/=(.+)/);
            charArgs[k] = v.replace(/^"|"$/g, '');
          }
        });
        return {
          type: 'char',
          name: charName,
          sprite: charArgs.sprite,
          portrait: charArgs.portrait,
          options: charArgs
        };

      case 'action':
        // @action CharName verb [args]
        const actionParts = remaining.match(/(?:[^\s\[]+|\[[^\]]*\])/g) || [];
        const actorName = actionParts[0];
        const verb = actionParts[1];
        return {
          type: 'action',
          actor: actorName,
          verb: verb,
          args: args
        };

      case 'do':
        const hookAction = remaining.split(/\s+/)[0];
        return {
          type: 'hook',
          action: hookAction,
          args: args
        };

      case 'transition':
        return {
          type: 'transition',
          effect: remaining || args.effect || 'fade',
          direction: args.direction || 'out',
          options: args
        };

      case 'end':
        return { type: 'end' };

      default:
        console.warn('[PxcPlayer] Unknown command:', cmd);
        return null;
    }
  }

  /**
   * Parse bracket metadata [key=value,key2=value2,flag]
   */
  parseBracket(bracketContent) {
    const result = {};
    const pairs = bracketContent.split(',');
    
    for (const pair of pairs) {
      const trimmed = pair.trim();
      if (trimmed.includes('=')) {
        const [key, ...valueParts] = trimmed.split('=');
        let value = valueParts.join('=').trim().replace(/^"|"$/g, '');
        // Type coercion
        if (/^\d+$/.test(value)) value = parseInt(value, 10);
        else if (/^\d+\.\d+$/.test(value)) value = parseFloat(value);
        else if (value === 'true') value = true;
        else if (value === 'false') value = false;
        result[key.trim()] = value;
      } else {
        result[trimmed] = true;
      }
    }
    
    return result;
  }

  /**
   * Load an asset (image, audio) via engine resource system
   */
  async loadAsset(path, isBackdrop = false) {
    if (!path) return null;
    
    // Check cache first
    if (this.resourceCache[path]) {
      return this.resourceCache[path];
    }

    // Handle data: URIs - generate placeholder
    if (path.startsWith('data:')) {
      const name = path.replace('data:', '');
      const placeholder = this.generatePlaceholder(name, isBackdrop);
      this.resourceCache[path] = placeholder;
      return placeholder;
    }

    // Try loading via engine's resource manager
    if (this.engine && this.engine.resourceManager) {
      try {
        const url = await this.engine.resourceManager.loadResource(path);
        if (url) {
          this.resourceCache[path] = url;
          return url;
        }
      } catch (err) {
        console.warn(`[PxcPlayer] Failed to load asset: ${path}`, err);
      }
    }

    // Try loading via spritz world's zip
    if (this.engine?.spritz?.world?.zip) {
      try {
        const zipEntry = this.engine.spritz.world.zip.getEntry(path);
        if (zipEntry) {
          const blob = await zipEntry.async('blob');
          const url = URL.createObjectURL(blob);
          this.resourceCache[path] = url;
          return url;
        }
      } catch (err) {
        console.warn(`[PxcPlayer] Failed to load from zip: ${path}`, err);
      }
    }

    // Fallback to placeholder
    const name = path.split('/').pop() || (isBackdrop ? 'BACKDROP' : 'SPRITE');
    const placeholder = this.generatePlaceholder(name, isBackdrop);
    this.resourceCache[path] = placeholder;
    return placeholder;
  }

  /**
   * Generate a placeholder image as data URL
   */
  generatePlaceholder(name, isBackdrop = false) {
    const displayName = (name || 'UNKNOWN').toUpperCase();
    if (isBackdrop) {
      const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1600" height="900"><rect width="100%" height="100%" fill="#08202a"/><text x="50%" y="80%" font-size="64" fill="#aee6ff" text-anchor="middle" font-family="system-ui, sans-serif" font-weight="bold">${displayName}</text></svg>`;
      return 'data:image/svg+xml;utf8,' + encodeURIComponent(svg);
    } else {
      const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512"><rect width="100%" height="100%" fill="#112430"/><text x="50%" y="50%" font-size="72" fill="#7dd3fc" text-anchor="middle" dominant-baseline="middle" font-family="system-ui, sans-serif" font-weight="bold">${displayName}</text></svg>`;
      return 'data:image/svg+xml;utf8,' + encodeURIComponent(svg);
    }
  }

  /**
   * Load an image from URL and return Image object
   */
  async loadImage(url) {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = (err) => reject(err);
      img.src = url;
    });
  }

  /**
   * Play cutscene from script text
   */
  async playCutscene(scriptText) {
    if (this.isPlaying) {
      console.warn('[PxcPlayer] Cutscene already playing');
      return;
    }

    this.isPlaying = true;
    this.skipRequested = false;
    const events = this.parseScript(scriptText);

    console.log('[PxcPlayer] Playing cutscene with', events.length, 'events');

    // Notify start callback
    if (this.callbacks.onCutsceneStart) {
      this.callbacks.onCutsceneStart();
    }

    for (const event of events) {
      if (!this.isPlaying) break;
      if (this.skipRequested) break;
      await this.handleEvent(event);
    }

    this.isPlaying = false;
    this.cleanup();
    
    if (this.callbacks.onCutsceneEnd) {
      this.callbacks.onCutsceneEnd();
    }
  }

  /**
   * Play cutscene from file path (loads from zip/resources)
   */
  async playCutsceneFile(filePath) {
    try {
      let scriptText = null;
      
      // Try loading from zip
      if (this.engine?.spritz?.world?.zip) {
        const zipEntry = this.engine.spritz.world.zip.getEntry(filePath);
        if (zipEntry) {
          scriptText = await zipEntry.async('string');
        }
      }
      
      // Try loading via fetch
      if (!scriptText) {
        const response = await fetch(filePath);
        scriptText = await response.text();
      }
      
      if (scriptText) {
        await this.playCutscene(scriptText);
      } else {
        console.error('[PxcPlayer] Could not load cutscene file:', filePath);
      }
    } catch (err) {
      console.error('[PxcPlayer] Error loading cutscene:', err);
    }
  }

  /**
   * Handle individual event
   */
  async handleEvent(event) {
    switch (event.type) {
      case 'backdrop':
        await this.showBackdrop(event.url, event.options);
        break;

      case 'char':
        await this.defineCharacter(event.name, event.sprite, event.portrait, event.options);
        break;

      case 'dialogue':
        await this.showDialogue(event);
        break;

      case 'action':
        await this.doAction(event.actor, event.verb, event.args);
        break;

      case 'hook':
        await this.doHook(event.action, event.args);
        break;

      case 'transition':
        await this.doTransition(event.effect, event.options);
        break;

      case 'wait':
        await this.wait(event.duration);
        break;

      case 'waitInput':
        await this.waitForInput();
        break;

      case 'end':
        this.isPlaying = false;
        break;

      default:
        console.warn('[PxcPlayer] Unknown event type:', event.type);
    }
  }

  /**
   * Show backdrop
   */
  async showBackdrop(url, options = {}) {
    this.currentBackdrop = url;
    console.log('[PxcPlayer] Backdrop:', url, options);
    
    try {
      const imageUrl = await this.loadAsset(url, true);
      this.backdropImage = await this.loadImage(imageUrl);
      
      // Set backdrop in HUD for rendering
      if (this.engine?.hud) {
        this.engine.hud.setBackdrop(this.backdropImage);
      }
    } catch (err) {
      console.warn('[PxcPlayer] Failed to load backdrop:', url, err);
    }
    
    if (this.callbacks.onBackdropChange) {
      this.callbacks.onBackdropChange(url, options);
    }

    // If fadeIn specified, wait for it
    if (options.fadeIn) {
      await this.wait(parseInt(options.fadeIn));
    }
  }

  /**
   * Define character
   */
  async defineCharacter(name, sprite, portrait, options = {}) {
    this.characters[name] = { sprite, portrait, options };
    console.log('[PxcPlayer] Defined character:', name, sprite, portrait);
    
    // Pre-load character portrait if available
    const portraitPath = portrait || sprite;
    if (portraitPath) {
      try {
        const portraitUrl = await this.loadAsset(portraitPath, false);
        this.characters[name].portraitImage = await this.loadImage(portraitUrl);
      } catch (err) {
        console.warn('[PxcPlayer] Failed to load portrait for', name, err);
      }
    }
  }

  /**
   * Show dialogue with typewriter effect
   */
  async showDialogue(event) {
    const char = this.characters[event.actor];
    const sprite = char?.sprite || event.meta?.sprite;
    const portrait = char?.portrait || event.meta?.portrait;

    this.currentSpeaker = event.actor;
    this.currentText = event.text;
    this.displayedText = '';
    this.isTyping = true;

    console.log('[PxcPlayer] Dialogue:', event.actor, event.text);

    // Load portrait if specified
    let portraitImg = char?.portraitImage || null;
    if (!portraitImg && (portrait || sprite)) {
      try {
        const portraitUrl = await this.loadAsset(portrait || sprite, false);
        portraitImg = await this.loadImage(portraitUrl);
      } catch (err) {
        console.warn('[PxcPlayer] Failed to load portrait:', portrait || sprite, err);
      }
    }

    if (event.isCutin) {
      this.cutinImage = portraitImg;
      this.portraitImage = null;
    } else {
      this.portraitImage = portraitImg;
      this.cutinImage = null;
    }

    // Start voice-over if specified
    let voicePromise = null;
    if (event.meta?.voice) {
      voicePromise = this.playVoiceBlocking(event.meta.voice);
    }

    // Typewriter effect
    await this.typeText(event.text);

    // Wait for voice to complete if playing
    if (voicePromise) {
      await voicePromise;
    }

    // Notify callback
    if (this.callbacks.onDialogueShow) {
      this.callbacks.onDialogueShow({
        actor: event.actor,
        text: event.text,
        sprite,
        portrait: portraitImg,
        expression: event.meta?.expression || 'neutral',
        position: event.meta?.position || 'center',
        isCutin: event.isCutin,
        meta: event.meta
      });
    }

    // Auto-advance or wait for input
    if (this.autoAdvance) {
      await this.wait(this.autoAdvanceDelay);
    } else {
      await this.waitForInput();
    }

    this.isTyping = false;
    
    if (this.callbacks.onDialogueHide) {
      this.callbacks.onDialogueHide();
    }
  }

  /**
   * Typewriter text effect - renders to HUD canvas
   */
  async typeText(text) {
    const chars = text.split('');
    this.displayedText = '';
    
    for (let i = 0; i < chars.length; i++) {
      if (!this.isPlaying || this.skipRequested) {
        this.displayedText = text; // Show full text on skip
        break;
      }
      
      this.displayedText += chars[i];
      
      // Render the current state to HUD
      this.renderDialogue();
      
      // Calculate delay (longer for punctuation)
      let delay = this.typewriterSpeed;
      if (/[.,!?;:]/.test(chars[i])) {
        delay += this.typewriterSpeed * 1.5;
      }
      
      await this.wait(delay);
    }
    
    // Final render
    this.renderDialogue();
  }

  /**
   * Render dialogue box to HUD canvas
   */
  renderDialogue() {
    if (!this.engine?.hud?.ctx) return;
    
    const ctx = this.engine.hud.ctx;
    const canvas = ctx.canvas;
    const style = this.dialogueStyle;
    
    // Use HUD's scrollText for consistent rendering
    if (this.engine.hud.scrollText) {
      const options = {
        portrait: this.portraitImage ? { image: this.portraitImage } : null,
        fontStyle: style.textColor,
        background: style.boxColor,
        border: {
          lineWidth: 2,
          style: style.borderColor,
          corner: 'round',
        },
      };
      
      // Draw cutscene elements (backdrop) first
      if (this.engine.hud.drawCutsceneElements) {
        this.engine.hud.drawCutsceneElements();
      }
      
      // Draw speaker name
      ctx.font = style.speakerFont;
      ctx.fillStyle = style.speakerColor;
      ctx.textAlign = 'left';
      const boxY = (2 * canvas.height) / 3;
      ctx.fillText(this.currentSpeaker, style.padding + (this.portraitImage ? style.portraitSize + 10 : 0), boxY - 25);
      
      // Draw dialogue text with scrollbox
      this.engine.hud.scrollText(this.displayedText, false, options);
    }
  }

  /**
   * Do action (animation, movement, etc.)
   */
  async doAction(actor, verb, args = {}) {
    console.log('[PxcPlayer] Action:', actor, verb, args);
    
    switch (verb) {
      case 'moveTo':
        // Animate portrait movement
        await this.wait(args.duration || 300);
        break;
      case 'fadeIn':
        await this.wait(args.duration || 500);
        break;
      case 'fadeOut':
        await this.wait(args.duration || 500);
        break;
      case 'shake':
        await this.wait(args.duration || 200);
        break;
      default:
        console.warn('[PxcPlayer] Unknown action verb:', verb);
    }
  }

  /**
   * Execute hook action
   */
  async doHook(action, args) {
    console.log('[PxcPlayer] Hook:', action, args);

    switch (action) {
      case 'playBgm':
        this.playBgm(args.name);
        break;

      case 'playSfx':
        this.playSfx(args.name);
        break;

      case 'playVoice':
        await this.playVoiceBlocking(args.name);
        break;

      case 'stopBgm':
        this.stopBgm();
        break;

      case 'stopAll':
        this.stopAll();
        break;

      case 'setFlag':
        if (this.engine?.store && args.name) {
          this.engine.store.set(args.name, args.value ?? true);
        }
        break;

      case 'runScript':
        // Execute a PixoScript
        if (this.engine?.spritz?.interpreter && args.name) {
          try {
            await this.engine.spritz.interpreter.runScript(args.name);
          } catch (err) {
            console.warn('[PxcPlayer] Script execution failed:', args.name, err);
          }
        }
        break;

      default:
        console.warn('[PxcPlayer] Unknown hook action:', action);
    }
  }

  /**
   * Play background music (looping)
   */
  playBgm(audioPath) {
    this.stopBgm(); // Stop previous BGM
    
    console.log('[PxcPlayer] Playing BGM:', audioPath);
    
    this.loadAsset(audioPath).then(audioUrl => {
      if (!audioUrl) return;
      this.bgmAudio = new Audio(audioUrl);
      this.bgmAudio.loop = true;
      this.bgmAudio.volume = 0.7;
      this.bgmAudio.play().catch(e => console.warn('[PxcPlayer] BGM autoplay blocked:', e));
    }).catch(e => console.error('[PxcPlayer] Failed to load BGM:', e));
  }

  /**
   * Play sound effect (one-shot)
   */
  playSfx(audioPath) {
    console.log('[PxcPlayer] Playing SFX:', audioPath);
    
    this.loadAsset(audioPath).then(audioUrl => {
      if (!audioUrl) return;
      const sfx = new Audio(audioUrl);
      sfx.volume = 0.8;
      sfx.play().catch(e => console.warn('[PxcPlayer] SFX autoplay blocked:', e));
    }).catch(e => console.error('[PxcPlayer] Failed to load SFX:', e));
  }

  /**
   * Play voice-over (blocking - waits for completion)
   */
  async playVoiceBlocking(audioPath) {
    console.log('[PxcPlayer] Playing Voice:', audioPath);
    
    return new Promise(async (resolve) => {
      try {
        const audioUrl = await this.loadAsset(audioPath);
        if (!audioUrl) {
          resolve();
          return;
        }
        
        // Stop previous voice
        if (this.voiceAudio) {
          this.voiceAudio.pause();
        }
        
        this.voiceAudio = new Audio(audioUrl);
        this.voiceAudio.volume = 1.0;
        this.voiceAudio.onended = () => {
          this.voiceAudio = null;
          resolve();
        };
        this.voiceAudio.onerror = () => {
          this.voiceAudio = null;
          resolve();
        };
        
        this.voiceAudio.play().catch(e => {
          console.warn('[PxcPlayer] Voice autoplay blocked:', e);
          resolve();
        });
      } catch (err) {
        console.error('[PxcPlayer] Failed to load voice:', err);
        resolve();
      }
    });
  }

  /**
   * Stop background music
   */
  stopBgm() {
    if (this.bgmAudio) {
      this.bgmAudio.pause();
      this.bgmAudio = null;
    }
  }

  /**
   * Stop all audio
   */
  stopAll() {
    this.stopBgm();
    if (this.sfxAudio) {
      this.sfxAudio.pause();
      this.sfxAudio = null;
    }
    if (this.voiceAudio) {
      this.voiceAudio.pause();
      this.voiceAudio = null;
    }
  }

  /**
   * Transition effect
   */
  async doTransition(effect, options = {}) {
    console.log('[PxcPlayer] Transition:', effect, options);
    
    if (this.engine?.renderManager) {
      const duration = options.duration || 500;
      const direction = options.direction || 'out';
      await this.engine.renderManager.startTransition({ effect, direction, duration });
    } else {
      await this.wait(options.duration || 500);
    }
  }

  /**
   * Wait for duration
   */
  wait(duration) {
    return new Promise(resolve => setTimeout(resolve, duration));
  }

  /**
   * Wait for user input (click, key, or touch)
   */
  waitForInput() {
    return new Promise(resolve => {
      const handler = (e) => {
        // Ignore if modifier keys are held
        if (e.ctrlKey || e.altKey || e.metaKey) return;
        
        document.removeEventListener('click', handler);
        document.removeEventListener('keydown', handler);
        document.removeEventListener('touchend', handler);
        resolve();
      };
      
      document.addEventListener('click', handler);
      document.addEventListener('keydown', handler);
      document.addEventListener('touchend', handler);
    });
  }

  /**
   * Skip current dialogue/event
   */
  skip() {
    this.skipRequested = true;
  }

  /**
   * Pause playback
   */
  pause() {
    this.isPaused = true;
  }

  /**
   * Resume playback
   */
  resume() {
    this.isPaused = false;
  }

  /**
   * Cleanup resources
   */
  cleanup() {
    this.stopAll();
    this.characters = {};
    this.currentBackdrop = null;
    this.backdropImage = null;
    this.portraitImage = null;
    this.cutinImage = null;
    this.currentSpeaker = '';
    this.currentText = '';
    this.displayedText = '';
    
    // Clear HUD backdrop
    if (this.engine?.hud) {
      this.engine.hud.setBackdrop(null);
      this.engine.hud.setCutouts([]);
    }
    
    // Revoke object URLs from cache
    Object.values(this.resourceCache).forEach(url => {
      if (url && typeof url === 'string' && url.startsWith('blob:')) {
        URL.revokeObjectURL(url);
      }
    });
    this.resourceCache = {};
  }

  /**
   * Stop playback
   */
  stop() {
    this.isPlaying = false;
    this.cleanup();
  }

  /**
   * Set typewriter speed
   */
  setSpeed(msPerChar) {
    this.typewriterSpeed = msPerChar;
  }

  /**
   * Enable/disable auto-advance
   */
  setAutoAdvance(enabled, delay = 1500) {
    this.autoAdvance = enabled;
    this.autoAdvanceDelay = delay;
  }

  /**
   * Set dialogue styling
   */
  setDialogueStyle(style) {
    Object.assign(this.dialogueStyle, style);
  }
}
