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
 */
export default class PxcPlayer {
  constructor(engine, callbacks = {}) {
    this.engine = engine;
    this.callbacks = {
      onDialogueShow: callbacks.onDialogueShow || null,
      onBackdropChange: callbacks.onBackdropChange || null,
      onCutsceneEnd: callbacks.onEnd || callbacks.onCutsceneEnd || null,
    };
    
    this.characters = {};
    this.currentBackdrop = null;
    this.isPlaying = false;
    this.isPaused = false;
    
    // Audio refs
    this.bgmAudio = null;
    this.sfxAudio = null;
    this.voiceAudio = null;
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
          url: remaining || args.url,
          options: args
        };

      case 'char':
        const charName = remaining.split(/\s+/)[0];
        return {
          type: 'char',
          name: charName,
          sprite: args.sprite
        };

      case 'do':
        const action = remaining.split(/\s+/)[0];
        return {
          type: 'hook',
          action: action,
          args: args
        };

      case 'transition':
        return {
          type: 'transition',
          effect: remaining || args.effect || 'fade',
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
   * Parse bracket metadata [key=value,key2=value2]
   */
  parseBracket(bracketContent) {
    const result = {};
    const pairs = bracketContent.split(',');
    
    for (const pair of pairs) {
      const [key, ...valueParts] = pair.split('=');
      const value = valueParts.join('=').trim();
      result[key.trim()] = value || true;
    }
    
    return result;
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
    const events = this.parseScript(scriptText);

    console.log('[PxcPlayer] Playing cutscene with', events.length, 'events');

    for (const event of events) {
      if (!this.isPlaying) break;
      await this.handleEvent(event);
    }

    this.isPlaying = false;
    this.cleanup();
    
    if (this.callbacks.onCutsceneEnd) {
      this.callbacks.onCutsceneEnd();
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
        this.defineCharacter(event.name, event.sprite);
        break;

      case 'dialogue':
        await this.showDialogue(event);
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
  defineCharacter(name, sprite) {
    this.characters[name] = { sprite };
    console.log('[PxcPlayer] Defined character:', name, sprite);
  }

  /**
   * Show dialogue
   */
  async showDialogue(event) {
    const char = this.characters[event.actor];
    const sprite = char ? char.sprite : null;

    console.log('[PxcPlayer] Dialogue:', event.actor, event.text);

    // If voice-over in metadata, play it first and block
    if (event.meta.voice) {
      await this.playVoiceBlocking(event.meta.voice);
    }

    // Show dialogue via callback
    if (this.callbacks.onDialogueShow) {
      this.callbacks.onDialogueShow({
        actor: event.actor,
        text: event.text,
        sprite,
        expression: event.meta.expression || 'neutral',
        position: event.meta.position || 'center',
        isCutin: event.isCutin,
        meta: event.meta
      });
    }

    // Wait for dialogue to be dismissed (simplified - could add input handling)
    await this.wait(100);
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
    
    if (this.engine && this.engine.assetLoader) {
      this.engine.assetLoader.load(audioPath).then(audioUrl => {
        this.bgmAudio = new Audio(audioUrl);
        this.bgmAudio.loop = true;
        this.bgmAudio.volume = 0.7;
        this.bgmAudio.play().catch(e => console.warn('[PxcPlayer] BGM autoplay blocked:', e));
      }).catch(e => console.error('[PxcPlayer] Failed to load BGM:', e));
    }
  }

  /**
   * Play sound effect (one-shot)
   */
  playSfx(audioPath) {
    console.log('[PxcPlayer] Playing SFX:', audioPath);
    
    if (this.engine && this.engine.assetLoader) {
      this.engine.assetLoader.load(audioPath).then(audioUrl => {
        const sfx = new Audio(audioUrl);
        sfx.volume = 0.8;
        sfx.play().catch(e => console.warn('[PxcPlayer] SFX autoplay blocked:', e));
      }).catch(e => console.error('[PxcPlayer] Failed to load SFX:', e));
    }
  }

  /**
   * Play voice-over (blocking - waits for completion)
   */
  async playVoiceBlocking(audioPath) {
    console.log('[PxcPlayer] Playing Voice:', audioPath);
    
    return new Promise((resolve) => {
      if (this.engine && this.engine.assetLoader) {
        this.engine.assetLoader.load(audioPath).then(audioUrl => {
          this.voiceAudio = new Audio(audioUrl);
          this.voiceAudio.volume = 1.0;
          this.voiceAudio.onended = () => resolve();
          this.voiceAudio.play().catch(e => {
            console.warn('[PxcPlayer] Voice autoplay blocked:', e);
            resolve();
          });
        }).catch(e => {
          console.error('[PxcPlayer] Failed to load voice:', e);
          resolve();
        });
      } else {
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
    
    if (this.engine && this.engine.renderManager) {
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
   * Wait for user input
   */
  waitForInput() {
    return new Promise(resolve => {
      // Simplified - in real implementation, hook into input system
      const handler = () => {
        document.removeEventListener('click', handler);
        document.removeEventListener('keydown', handler);
        resolve();
      };
      document.addEventListener('click', handler);
      document.addEventListener('keydown', handler);
    });
  }

  /**
   * Cleanup resources
   */
  cleanup() {
    this.stopAll();
    this.characters = {};
    this.currentBackdrop = null;
  }

  /**
   * Stop playback
   */
  stop() {
    this.isPlaying = false;
    this.cleanup();
  }
}
