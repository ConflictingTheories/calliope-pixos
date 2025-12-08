import React, { useState, useEffect, useRef, forwardRef, useImperativeHandle } from 'react';

// Dynamically import html2canvas for DOM-to-canvas capture
let html2canvasModule = null;
async function getHtml2Canvas() {
  if (!html2canvasModule) {
    try {
      html2canvasModule = (await import('html2canvas')).default;
    } catch (err) {
      console.warn('html2canvas not available:', err);
      return null;
    }
  }
  return html2canvasModule;
}

/**
 * React CutscenePlayer component closely modeled on demos/cutscene-editor.html.
 * Plays SpritzCut DSL script with backdrop, portraits, cutins, dialogue box, and controls.
 * Supports Play, Stop, and Skip imperative commands via forwarded ref.
 * Props:
 *  - scriptText: string SpritzCut DSL script
 *  - speed: number ms per character (default 60)
 *  - autoAdvance: boolean (default false)
 *  - onPlayStart: function callback when play starts
 *  - onPlayStop: function callback when play ends or stops
 *  - assetLoader: function(path) => Promise<url> for loading assets from ZIP
 */

// Generate placeholder images as data URLs matching demo style
function generatePlaceholder(name, color = '#112430') {
  const displayName = name.toUpperCase();
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512"><rect width="100%" height="100%" fill="${color}"/><text x="50%" y="50%" font-size="72" fill="#7dd3fc" text-anchor="middle" dominant-baseline="middle" font-family="system-ui, sans-serif" font-weight="bold">${displayName}</text></svg>`;
  return 'data:image/svg+xml;utf8,' + encodeURIComponent(svg);
}

function generateBackdropPlaceholder(name) {
  const displayName = name.toUpperCase();
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1600" height="900"><rect width="100%" height="100%" fill="#08202a"/><text x="50%" y="80%" font-size="64" fill="#aee6ff" text-anchor="middle" font-family="system-ui, sans-serif" font-weight="bold">${displayName}</text></svg>`;
  return 'data:image/svg+xml;utf8,' + encodeURIComponent(svg);
}

function parseBracket(s) {
  const out = {};
  if (!s) return out;
  s = s.trim();
  if (!s.startsWith('[')) return out;
  s = s.slice(1, -1).trim();
  if (!s) return out;
  const parts = s.split(',').map(p => p.trim()).filter(Boolean);
  parts.forEach(p => {
    if (p.includes('=')) {
      const [k, v] = p.split(/=(.+)/);
      const val = v.replace(/^"|"$/g, '').trim();
      if (/^\d+$/.test(val)) out[k] = parseInt(val, 10);
      else if (/^\d+\.\d+$/.test(val)) out[k] = parseFloat(val);
      else if (val === 'true' || val === 'false') out[k] = (val === 'true');
      else out[k] = val;
    } else out[p] = true;
  });
  return out;
}

function parseScript(text) {
  const lines = text.replace(/\r\n/g, '\n').split('\n');
  const scene = { meta: {}, chars: {}, resources: [], events: [] };
  let i = 0;
  while (i < lines.length) {
    let raw = lines[i].trim();
    if (!raw || raw.startsWith('#')) {
      i++;
      continue;
    }
    const dlg = raw.match(/^(\*?)([A-Za-z0-9_]+)\s*:\s*(.*)$/);
    if (dlg) {
      const isCut = !!dlg[1];
      const name = dlg[2];
      let tail = dlg[3].trim();
      let meta = {};
      if (tail.startsWith('[')) {
        const ci = tail.indexOf(']');
        if (ci !== -1) {
          meta = parseBracket(tail.slice(0, ci + 1));
          tail = tail.slice(ci + 1).trim();
        }
      }
      if (tail.startsWith('"""')) {
        let content = tail.slice(3);
        if (content.includes('"""')) content = content.split('"""')[0];
        else {
          i++;
          while (i < lines.length && !lines[i].includes('"""')) {
            content += lines[i] + '\n';
            i++;
          }
          if (i < lines.length) content += lines[i].split('"""')[0];
        }
        scene.events.push({
          type: isCut ? 'cutin' : 'dialogue',
          actor: name,
          payload: { text: content.trim(), meta },
          blocking: true,
        });
        i++;
        continue;
      }
      if (lines[i + 1] && lines[i + 1].trim().startsWith('"""')) {
        i++;
        let content = '';
        if (lines[i].trim().startsWith('"""')) {
          let rest = lines[i].replace(/.*?"""/, '');
          if (rest.includes('"""')) content = rest.split('"""')[0];
          else {
            i++;
            while (i < lines.length && !lines[i].includes('"""')) {
              content += lines[i] + '\n';
              i++;
            }
            if (i < lines.length) content += lines[i].split('"""')[0];
          }
        }
        scene.events.push({
          type: isCut ? 'cutin' : 'dialogue',
          actor: name,
          payload: { text: content.trim(), meta },
          blocking: true,
        });
        i++;
        continue;
      }
      scene.events.push({ type: isCut ? 'cutin' : 'dialogue', actor: name, payload: { text: tail, meta }, blocking: true });
      i++;
      continue;
    }
    if (raw.startsWith('@')) {
      const m = raw.match(/^@([a-zA-Z_]+)\s*(.*)$/);
      if (!m) {
        i++;
        continue;
      }
      const cmd = m[1];
      let rest = m[2].trim();
      let bracket = null;
      const br = rest.match(/\[[^\]]*\]$/);
      if (br) {
        bracket = parseBracket(br[0]);
        rest = rest.slice(0, rest.length - br[0].length).trim();
      }
      if (cmd === 'backdrop') {
        scene.resources.push(rest || bracket.file || '');
        scene.events.push({
          type: 'backdrop',
          payload: { file: rest || bracket.file || '', options: bracket || {} },
          blocking: !!(bracket && bracket.blocking),
        });
      } else if (cmd === 'char') {
        const parts = rest.split(/\s+/);
        const name = parts[0];
        const attrs = {};
        parts.slice(1).forEach(p => {
          if (p.includes('=')) {
            const [k, v] = p.split(/=(.+)/);
            attrs[k] = v.replace(/^"|"$/g, '');
          }
        });
        Object.assign(attrs, bracket || {});
        scene.chars[name] = attrs;
        if (attrs.sprite) scene.resources.push(attrs.sprite);
      } else if (cmd === 'action') {
        const parts = rest.match(/(?:[^\s\[]+|\[[^\]]*\])/g) || [];
        const name = parts[0];
        const verb = parts[1];
        const args = parseBracket(parts.slice(2).join('') || '');
        scene.events.push({
          type: 'action',
          actor: name,
          payload: { verb, args },
          blocking: !!args.blocking,
        });
      } else if (cmd === 'do') {
        const hook = rest.trim();
        const args = bracket || {};
        scene.events.push({
          type: 'hook',
          payload: { hook, args },
          blocking: !!args.blocking,
        });
        if (args.name) scene.resources.push(args.name);
      } else if (cmd === 'transition') {
        const name = rest.split(/\s+/)[0] || '';
        scene.events.push({
          type: 'transition',
          payload: { name, params: bracket || {} },
          blocking: !(bracket && bracket.nonblocking),
        });
      } else if (cmd === 'end') {
        scene.events.push({ type: 'end', payload: {}, blocking: false });
      }
      i++;
      continue;
    }
    if (raw.startsWith('waitInput')) {
      scene.events.push({ type: 'waitInput', payload: {}, blocking: true });
      i++;
      continue;
    }
    if (raw.startsWith('wait ')) {
      const mm = raw.match(/^wait\s+(\d+)/);
      if (mm) scene.events.push({ type: 'wait', payload: { ms: parseInt(mm[1], 10) }, blocking: true });
      i++;
      continue;
    }
    scene.events.push({ type: 'raw', payload: { text: raw }, blocking: false });
    i++;
  }
  return scene;
}

const CutscenePlayer = forwardRef(({ scriptText, speed = 60, autoAdvance = false, onPlayStart, onPlayStop, assetLoader, onExportProgress }, ref) => {
  const [scene, setScene] = useState(null);
  const [portraitSrc, setPortraitSrc] = useState(null);
  const [cutinSrc, setCutinSrc] = useState(null);
  const [backdropSrc, setBackdropSrc] = useState(null);
  const [speaker, setSpeaker] = useState('—');
  const [dialogueText, setDialogueText] = useState('(press Play)');
  const [playing, setPlaying] = useState(false);
  const [cutinVisible, setCutinVisible] = useState(false);
  const [portraitVisible, setPortraitVisible] = useState(false);
  const [currentExpression, setCurrentExpression] = useState(null);
  const [isExporting, setIsExporting] = useState(false);
  const stopFlag = useRef(false);
  const resourceCache = useRef({});
  const stageRef = useRef(null);
  const exportContextRef = useRef(null);

  useEffect(() => {
    if (scriptText) {
      setScene(parseScript(scriptText));
      resetDisplay();
    }
  }, [scriptText]);

  useImperativeHandle(ref, () => ({
    play() {
      internalPlay();
    },
    stop() {
      internalStop();
    },
    skip() {
      internalSkip();
    },
    async exportVideo() {
      return internalExport();
    },
    isExporting() {
      return isExporting;
    },
  }));

  function resetDisplay() {
    setBackdropSrc(null);
    setPortraitSrc(null);
    setCutinSrc(null);
    setSpeaker('—');
    setDialogueText('(press Play)');
    setCutinVisible(false);
    setPortraitVisible(false);
    setCurrentExpression(null);
  }

  // Load asset with fallback to placeholder
  async function loadAsset(path, isBackdrop = false) {
    if (!path) return null;
    
    // Check cache first
    if (resourceCache.current[path]) {
      return resourceCache.current[path];
    }

    // Handle data: URIs - generate placeholder with the name
    if (path.startsWith('data:')) {
      const name = path.replace('data:', '');
      const placeholder = isBackdrop 
        ? generateBackdropPlaceholder(name)
        : generatePlaceholder(name);
      resourceCache.current[path] = placeholder;
      return placeholder;
    }

    // If it's http(s):// URL, use it directly
    if (path.startsWith('http://') || path.startsWith('https://')) {
      resourceCache.current[path] = path;
      return path;
    }

    // Try to load from ZIP using assetLoader
    if (assetLoader && typeof assetLoader === 'function') {
      try {
        const url = await assetLoader(path);
        if (url) {
          resourceCache.current[path] = url;
          return url;
        }
      } catch (err) {
        console.warn(`Failed to load asset: ${path}`, err);
      }
    }

    // Fallback to placeholder
    const name = path.split('/').pop() || (isBackdrop ? 'BACKDROP' : 'SPRITE');
    const placeholder = isBackdrop 
      ? generateBackdropPlaceholder(name)
      : generatePlaceholder(name);
    
    resourceCache.current[path] = placeholder;
    return placeholder;
  }

  async function internalPlay() {
    if (!scene) return;
    if (onPlayStart) onPlayStart();
    stopFlag.current = false;
    setPlaying(true);
    resetDisplay();

    for (const ev of scene.events) {
      if (stopFlag.current) break;
      await handleEvent(ev);
    }
    setPlaying(false);
    if (onPlayStop) onPlayStop();
  }

  function internalStop() {
    stopFlag.current = true;
    setPlaying(false);
    // Stop all audio
    if (sfxRef.current) {
      sfxRef.current.pause();
      sfxRef.current = null;
    }
    if (bgmRef.current) {
      bgmRef.current.pause();
      bgmRef.current = null;
    }
    if (voiceRef.current) {
      voiceRef.current.pause();
      voiceRef.current = null;
    }
  }

  function internalSkip() {
    stopFlag.current = true;
    setPlaying(false);
    resetDisplay();
    setSpeaker('(skipped)');
    setDialogueText('');
    setPortraitVisible(false);
    setCutinVisible(false);
    setBackdropSrc(null);
    // Stop all audio
    if (sfxRef.current) {
      sfxRef.current.pause();
      sfxRef.current = null;
    }
    if (bgmRef.current) {
      bgmRef.current.pause();
      bgmRef.current = null;
    }
    if (voiceRef.current) {
      voiceRef.current.pause();
      voiceRef.current = null;
    }
  }

  // ==========================================================================
  // Video Export Functionality
  // ==========================================================================
  async function internalExport() {
    if (!scene || !stageRef.current) {
      console.warn('Cannot export: no scene or stage element');
      return null;
    }

    const html2canvas = await getHtml2Canvas();
    if (!html2canvas) {
      alert('Video export requires html2canvas library. Please install it with: npm install html2canvas');
      return null;
    }

    setIsExporting(true);
    if (onExportProgress) onExportProgress({ status: 'initializing', progress: 0, message: 'Setting up recording...' });

    try {
      // Create an offscreen canvas for recording
      const stageElement = stageRef.current;
      const width = stageElement.offsetWidth || 960;
      const height = stageElement.offsetHeight || 540;
      
      const recordCanvas = document.createElement('canvas');
      recordCanvas.width = width;
      recordCanvas.height = height;
      const recordCtx = recordCanvas.getContext('2d', { willReadFrequently: true });
      
      // Fill with initial black frame so the stream has content
      recordCtx.fillStyle = '#000';
      recordCtx.fillRect(0, 0, width, height);

      // Set up audio context for capturing audio
      let audioContext = null;
      let audioDestination = null;
      try {
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
        audioDestination = audioContext.createMediaStreamDestination();
      } catch (e) {
        console.warn('[Export] Audio context not available, exporting without audio');
      }
      
      // Store original Audio constructor
      const OriginalAudio = window.Audio;
      const audioElements = [];
      
      // Override Audio to capture audio streams during export
      if (audioContext && audioDestination) {
        window.Audio = function(src) {
          const audio = new OriginalAudio(src);
          audioElements.push(audio);
          
          // When audio loads, connect it to our destination
          audio.addEventListener('canplaythrough', () => {
            try {
              const source = audioContext.createMediaElementSource(audio);
              source.connect(audioDestination);
              source.connect(audioContext.destination); // Also play through speakers
            } catch (e) {
              // Already connected or error
            }
          }, { once: true });
          
          return audio;
        };
      }

      // Get canvas stream - use fixed framerate
      const canvasStream = recordCanvas.captureStream(30);
      
      // Combine video and audio streams
      const tracks = [...canvasStream.getVideoTracks()];
      if (audioDestination) {
        tracks.push(...audioDestination.stream.getAudioTracks());
      }
      const combinedStream = new MediaStream(tracks);

      // Set up MediaRecorder with fallback mime types
      let mimeType = 'video/webm';
      const mimeTypes = [
        'video/webm;codecs=vp9,opus',
        'video/webm;codecs=vp8,opus',
        'video/webm;codecs=vp9',
        'video/webm;codecs=vp8',
        'video/webm'
      ];
      for (const mt of mimeTypes) {
        if (MediaRecorder.isTypeSupported(mt)) {
          mimeType = mt;
          break;
        }
      }
      
      
      const mediaRecorder = new MediaRecorder(combinedStream, {
        mimeType,
        videoBitsPerSecond: 4000000, // 4 Mbps for better quality
      });
      
      const recordedChunks = [];
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          recordedChunks.push(event.data);
        }
      };
      
      mediaRecorder.onerror = (event) => {
        console.error('[Export] MediaRecorder error:', event);
      };

      // Start recording - request data frequently for more reliable capture
      mediaRecorder.start(50); // Collect data every 50ms
      
      if (onExportProgress) onExportProgress({ status: 'recording', progress: 5, message: 'Starting playback...' });

      // Frame capture state
      const frameCountRef = { value: 0 };
      let isRecording = true;
      let lastCaptureTime = 0;
      const targetFrameTime = 1000 / 30; // 30 FPS target
      
      // Optimized frame capture using rAF for better timing
      const captureFrame = async () => {
        if (!isRecording) return;
        
        const now = performance.now();
        if (now - lastCaptureTime < targetFrameTime * 0.8) {
          // Skip if too soon to maintain consistent framerate
          return;
        }
        lastCaptureTime = now;
        
        try {
          const capturedCanvas = await html2canvas(stageElement, {
            backgroundColor: '#000',
            scale: 1,
            useCORS: true,
            allowTaint: true,
            logging: false,
            imageTimeout: 0,
            removeContainer: true, // Clean up temp container
          });
          
          recordCtx.clearRect(0, 0, width, height);
          recordCtx.drawImage(capturedCanvas, 0, 0, width, height);
          
          frameCountRef.value++;
          if (frameCountRef.value % 10 === 0) {
          }
        } catch (err) {
          console.warn('Frame capture error:', err);
          // Draw fallback frame with current state indicator
          recordCtx.fillStyle = '#112430';
          recordCtx.fillRect(0, 0, width, height);
          recordCtx.fillStyle = '#7dd3fc';
          recordCtx.font = '24px system-ui';
          recordCtx.textAlign = 'center';
          recordCtx.fillText('Frame ' + frameCountRef.value, width/2, height/2);
        }
      };
      
      // Continuous frame capture loop using requestAnimationFrame for smoother capture
      let frameLoopId = null;
      const frameLoop = async () => {
        if (!isRecording) return;
        
        await captureFrame();
        
        // Use setTimeout for more consistent timing with html2canvas
        frameLoopId = setTimeout(frameLoop, targetFrameTime);
      };
      
      // Start capturing frames
      frameLoop();

      // Store export context for cleanup
      exportContextRef.current = {
        mediaRecorder,
        audioContext,
        audioElements,
        OriginalAudio,
        frameCountRef,
        stopRecording: () => { 
          isRecording = false;
          if (frameLoopId) clearTimeout(frameLoopId);
        }
      };

      // Play the cutscene for export (auto-advance enabled)
      const originalAutoAdvance = autoAdvance;
      stopFlag.current = false;
      setPlaying(true);
      resetDisplay();
      
      // Wait a moment for initial capture
      await waitMs(300);

      const totalEvents = scene.events.length;
      let processedEvents = 0;

      for (const ev of scene.events) {
        if (stopFlag.current) break;
        
        // For export, we auto-advance waitInput events
        if (ev.type === 'waitInput') {
          await waitMs(500); // Brief pause instead of waiting for input
        } else {
          await handleEvent(ev);
        }
        
        // Give html2canvas time to capture the state
        await waitMs(50);
        
        processedEvents++;
        if (onExportProgress) {
          const progress = 5 + Math.round((processedEvents / totalEvents) * 85);
          onExportProgress({ 
            status: 'recording', 
            progress, 
            message: `Processing event ${processedEvents} of ${totalEvents}`,
            event: processedEvents, 
            total: totalEvents 
          });
        }
      }

      // Wait a moment for final frames to be captured
      await waitMs(1000);

      // Stop the frame capture loop
      isRecording = false;
      exportContextRef.current.stopRecording();
      
      // Wait a bit for any pending frames
      await waitMs(200);
      
      // Request one final data collection before stopping
      if (mediaRecorder.state === 'recording') {
        mediaRecorder.requestData();
      }
      await waitMs(100);
      
      if (onExportProgress) onExportProgress({ status: 'processing', progress: 92, message: 'Processing video...' });
      

      // Stop media recorder and wait for final data
      return new Promise((resolve) => {
        mediaRecorder.onstop = async () => {
          
          // Calculate total size of chunks
          const totalSize = recordedChunks.reduce((acc, chunk) => acc + chunk.size, 0);
          
          // Restore original Audio constructor
          window.Audio = OriginalAudio;
          
          // Clean up audio
          audioElements.forEach(audio => {
            try { audio.pause(); } catch(e) {}
          });
          if (audioContext) {
            try { audioContext.close(); } catch(e) {}
          }

          // Stop all player audio
          if (sfxRef.current) { sfxRef.current.pause(); sfxRef.current = null; }
          if (bgmRef.current) { bgmRef.current.pause(); bgmRef.current = null; }
          if (voiceRef.current) { voiceRef.current.pause(); voiceRef.current = null; }

          if (onExportProgress) onExportProgress({ status: 'finalizing', progress: 95, message: 'Creating video file...' });

          // Create blob
          const blob = new Blob(recordedChunks, { type: mimeType });
          
          if (blob.size === 0) {
            console.error('[Export] Blob is empty!');
            setPlaying(false);
            setIsExporting(false);
            exportContextRef.current = null;
            if (onExportProgress) onExportProgress({ status: 'error', progress: 0, message: 'Export failed: No video data captured' });
            resolve({ success: false, error: 'No video data captured' });
            return;
          }
          
          // Create download link
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `cutscene-export-${Date.now()}.webm`;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          
          // Cleanup
          setTimeout(() => URL.revokeObjectURL(url), 60000);

          setPlaying(false);
          setIsExporting(false);
          exportContextRef.current = null;
          
          if (onExportProgress) onExportProgress({ 
            status: 'complete', 
            progress: 100, 
            message: `Export complete! ${frameCountRef.value} frames, ${(blob.size / 1024 / 1024).toFixed(2)} MB` 
          });
          
          resolve({ 
            success: true, 
            frames: frameCountRef.value,
            duration: recordedChunks.length * 0.05, // 50ms per chunk
            size: blob.size 
          });
        };

        mediaRecorder.stop();
      });

    } catch (error) {
      console.error('Export failed:', error);
      setIsExporting(false);
      
      // Stop recording loop
      if (exportContextRef.current?.stopRecording) {
        exportContextRef.current.stopRecording();
      }
      
      // Restore Audio if overridden
      if (exportContextRef.current?.OriginalAudio) {
        window.Audio = exportContextRef.current.OriginalAudio;
      }
      
      if (onExportProgress) onExportProgress({ status: 'error', progress: 0, message: error.message });
      return { success: false, error: error.message };
    }
  }

  async function handleEvent(ev) {
    if (ev.type === 'backdrop') return showBackdrop(ev);
    if (ev.type === 'dialogue' || ev.type === 'cutin') return showDialogue(ev);
    if (ev.type === 'action') return doAction(ev);
    if (ev.type === 'hook') return doHook(ev);
    if (ev.type === 'transition') return doTransition(ev);
    if (ev.type === 'waitInput') return waitInput();
    if (ev.type === 'wait') return waitMs(ev.payload.ms || 200);
    return Promise.resolve();
  }

  async function showBackdrop(ev) {
    const file = ev.payload.file;
    const url = await loadAsset(file, true);
    setBackdropSrc(url);
    if (ev.payload.options && ev.payload.options.fadeIn) {
      return new Promise(resolve => setTimeout(resolve, ev.payload.options.fadeIn));
    }
  }

  async function showDialogue(ev) {
    const { actor, payload } = ev;
    const text = payload.text || '';
    const meta = payload.meta || {};
    const sprite = meta.sprite || (scene.chars[actor] && scene.chars[actor].sprite) || null;
    const expression = meta.expression;
    const voiceFile = meta.voice;  // Check for voice-over in dialogue metadata
    
    // Start playing voice-over if specified
    let voicePromise = null;
    if (voiceFile) {
      voicePromise = (async () => {
        try {
          let soundUrl = null;
          if (assetLoader && typeof assetLoader === 'function') {
            soundUrl = await assetLoader(voiceFile);
          }
          if (!soundUrl) {
            console.warn('[CutscenePlayer] Could not load dialogue voice-over:', voiceFile);
            return;
          }

          if (voiceRef.current) {
            voiceRef.current.pause();
            voiceRef.current.currentTime = 0;
          }
          
          const audio = new Audio(soundUrl);
          voiceRef.current = audio;
          
          return new Promise((resolve) => {
            audio.onended = () => {
              voiceRef.current = null;
              resolve();
            };
            
            audio.onerror = (err) => {
              console.warn('[CutscenePlayer] Dialogue voice-over error:', voiceFile, err);
              voiceRef.current = null;
              resolve();
            };
            
            audio.play().then(() => {
            }).catch(err => {
              console.warn('[CutscenePlayer] Dialogue voice-over playback prevented:', voiceFile, err.message);
              resolve();
            });
          });
        } catch (err) {
          console.warn('[CutscenePlayer] Failed to play dialogue voice-over:', voiceFile, err);
        }
      })();
    }
    
    // Load sprite with fallback - handle JSON sprite files
    let spriteUrl = null;
    if (sprite) {
      // If sprite path points to a JSON file, load it and extract the portraitSrc
      if (sprite.endsWith('.json')) {
        try {
          const jsonUrl = await loadAsset(sprite, false);
          if (jsonUrl && assetLoader) {
            // Fetch the JSON content
            const response = await fetch(jsonUrl);
            const spriteData = await response.json();
            // Extract portraitSrc from the sprite data
            if (spriteData.portraitSrc) {
              // Load the actual portrait image
              const portraitPath = sprite.replace(/[^/]+$/, spriteData.portraitSrc);
              spriteUrl = await loadAsset(portraitPath, false);
            } else if (spriteData.src) {
              // Fallback to main sprite src
              const srcPath = sprite.replace(/[^/]+$/, spriteData.src);
              spriteUrl = await loadAsset(srcPath, false);
            }
          }
        } catch (err) {
          console.warn('Failed to load sprite JSON:', sprite, err);
          spriteUrl = await loadAsset(sprite, false);
        }
      } else if (sprite.match(/\.(gif|png|jpg|jpeg|webp)$/i)) {
        // Direct image reference
        spriteUrl = await loadAsset(sprite, false);
      } else {
        // No extension, might be a sprite reference, try common extensions
        // Check if it's a direct portrait reference or texture reference
        const isPortraitRef = sprite.includes('_portrait') || sprite.includes('portrait');
        const isSpriteRef = sprite.includes('characters/') || sprite.includes('npc/') || sprite.includes('monsters/');
        
        const tryPaths = isPortraitRef ? [
          // For direct portraits, try .gif first (most common)
          'textures/' + sprite + '.gif',
          sprite + '.gif',
          'textures/' + sprite + '.png',
          sprite + '.png',
          sprite
        ] : isSpriteRef ? [
          // For sprite references, try .json first
          sprite + '.json',
          'sprites/' + sprite + '.json',
          sprite + '.gif', 
          sprite + '.png',
          sprite
        ] : [
          // Unknown type, try image formats first
          sprite + '.gif',
          sprite + '.png',
          'textures/' + sprite + '.gif',
          sprite + '.json',
          sprite
        ];
        
        for (const tryPath of tryPaths) {
          try {
            const result = await loadAsset(tryPath, false);
            if (result && !result.includes('SPRITE') && !result.includes('BACKDROP')) {
              // Check if it's a JSON by trying to fetch and parse
              if (tryPath.endsWith('.json')) {
                try {
                  const response = await fetch(result);
                  const spriteData = await response.json();
                  if (spriteData.portraitSrc) {
                    const portraitPath = tryPath.replace(/[^/]+$/, spriteData.portraitSrc);
                    spriteUrl = await loadAsset(portraitPath, false);
                    break;
                  }
                } catch {
                  // Not valid JSON, continue
                }
              } else {
                spriteUrl = result;
                break;
              }
            }
          } catch {
            continue;
          }
        }
        
        // If still no sprite, use as-is for placeholder
        if (!spriteUrl) {
          spriteUrl = await loadAsset(sprite, false);
        }
      }
    }
    
    if (ev.type === 'dialogue') {
      setPortraitSrc(spriteUrl);
      setPortraitVisible(!!spriteUrl);
      setCutinVisible(false);
      setCurrentExpression(expression || null);
    } else if (ev.type === 'cutin') {
      setCutinSrc(spriteUrl);
      setCutinVisible(!!spriteUrl);
      setPortraitVisible(false);
      setCurrentExpression(expression || null);
    }
    setSpeaker(actor);
    setDialogueText('');
    
    return new Promise((resolve) => {
      let i = 0;
      const baseSpeed = typeof speed === 'function' ? speed() : speed;
      function typeStep() {
        if (stopFlag.current) {
          resolve();
          return;
        }
        if (i < text.length) {
          // Use slice instead of charAt to ensure we get the exact substring
          setDialogueText(text.slice(0, i + 1));
          i++;
          let delay = baseSpeed;
          if (/[.,!?]/.test(text.charAt(i - 1))) {
            delay += Math.round(baseSpeed * 1.2);
          }
          setTimeout(typeStep, delay);
        } else {
          // Text typing complete, now wait for voice-over if playing
          (async () => {
            if (voicePromise) {
              await voicePromise;
            }
            if (autoAdvance) setTimeout(resolve, 400);
            else resolve();
          })();
        }
      }
      typeStep();
    });
  }

  function doAction(ev) {
    return new Promise(resolve => {
      const { verb, args } = ev.payload;
      if (verb === 'moveTo') {
        // Animate portrait horizontal movement (simulated via CSS translateX)
        // For demo, just timeout for duration
        setTimeout(resolve, args.duration || 300);
      } else {
        resolve();
      }
    });
  }

  // Refs to hold currently playing audio instances
  const sfxRef = useRef(null);     // One-shot sound effects
  const bgmRef = useRef(null);     // Looping background music
  const voiceRef = useRef(null);   // Blocking voice-overs

  function doHook(ev) {
    const hookType = ev.payload.hook;
    const soundName = ev.payload.args?.name;
    
    if (!soundName) {
      console.warn('[CutscenePlayer] No sound name provided for hook:', hookType);
      return Promise.resolve();
    }

    // playBgm - Looping background music
    if (hookType === 'playBgm') {
      (async () => {
        try {
          let soundUrl = null;
          if (assetLoader && typeof assetLoader === 'function') {
            soundUrl = await assetLoader(soundName);
          }
          if (!soundUrl) {
            console.warn('[CutscenePlayer] Could not load BGM:', soundName);
            return;
          }

          // Stop any currently playing BGM
          if (bgmRef.current) {
            bgmRef.current.pause();
            bgmRef.current.currentTime = 0;
          }
          
          const audio = new Audio(soundUrl);
          audio.loop = true;  // Loop background music
          bgmRef.current = audio;
          
          audio.play().then(() => {
          }).catch(err => {
            console.warn('[CutscenePlayer] BGM playback prevented:', soundName, err.message);
          });
          
          audio.onerror = (err) => {
            console.warn('[CutscenePlayer] BGM error:', soundName, err);
            bgmRef.current = null;
          };
        } catch (err) {
          console.warn('[CutscenePlayer] Failed to play BGM:', soundName, err);
        }
      })();
      return Promise.resolve();  // Non-blocking
    }

    // playSfx - One-shot sound effect (non-blocking)
    if (hookType === 'playSfx') {
      (async () => {
        try {
          let soundUrl = null;
          if (assetLoader && typeof assetLoader === 'function') {
            soundUrl = await assetLoader(soundName);
          }
          if (!soundUrl) {
            console.warn('[CutscenePlayer] Could not load SFX:', soundName);
            return;
          }

          // Stop any currently playing SFX
          if (sfxRef.current) {
            sfxRef.current.pause();
            sfxRef.current.currentTime = 0;
          }
          
          const audio = new Audio(soundUrl);
          sfxRef.current = audio;
          
          audio.play().then(() => {
          }).catch(err => {
            console.warn('[CutscenePlayer] SFX playback prevented:', soundName, err.message);
          });
          
          audio.onended = () => {
            sfxRef.current = null;
          };
          audio.onerror = (err) => {
            console.warn('[CutscenePlayer] SFX error:', soundName, err);
            sfxRef.current = null;
          };
        } catch (err) {
          console.warn('[CutscenePlayer] Failed to play SFX:', soundName, err);
        }
      })();
      return Promise.resolve();  // Non-blocking
    }

    // playVoice - Voice-over (blocking, waits for completion)
    if (hookType === 'playVoice') {
      return new Promise(async (resolve) => {
        try {
          let soundUrl = null;
          if (assetLoader && typeof assetLoader === 'function') {
            soundUrl = await assetLoader(soundName);
          }
          if (!soundUrl) {
            console.warn('[CutscenePlayer] Could not load voice-over:', soundName);
            resolve();
            return;
          }

          // Stop any currently playing voice-over
          if (voiceRef.current) {
            voiceRef.current.pause();
            voiceRef.current.currentTime = 0;
          }
          
          const audio = new Audio(soundUrl);
          voiceRef.current = audio;
          
          // Resolve promise when audio ends (blocking)
          audio.onended = () => {
            voiceRef.current = null;
            resolve();
          };
          
          audio.onerror = (err) => {
            console.warn('[CutscenePlayer] Voice-over error:', soundName, err);
            voiceRef.current = null;
            resolve();
          };
          
          audio.play().then(() => {
          }).catch(err => {
            console.warn('[CutscenePlayer] Voice-over playback prevented:', soundName, err.message);
            resolve();
          });
        } catch (err) {
          console.warn('[CutscenePlayer] Failed to play voice-over:', soundName, err);
          resolve();
        }
      });
    }

    // stopBgm - Stop background music
    if (hookType === 'stopBgm') {
      if (bgmRef.current) {
        bgmRef.current.pause();
        bgmRef.current = null;
      }
      return Promise.resolve();
    }

    // stopAll - Stop all audio
    if (hookType === 'stopAll') {
      if (sfxRef.current) {
        sfxRef.current.pause();
        sfxRef.current = null;
      }
      if (bgmRef.current) {
        bgmRef.current.pause();
        bgmRef.current = null;
      }
      if (voiceRef.current) {
        voiceRef.current.pause();
        voiceRef.current = null;
      }
      return Promise.resolve();
    }

    return Promise.resolve();
  }

  function doTransition(ev) {
    return new Promise(resolve => {
      const name = ev.payload.name;
      const params = ev.payload.params || {};
      if (name === 'fadeOutBackdrop') {
        setBackdropSrc(null);
        setTimeout(resolve, params.duration || 300);
      } else if (name === 'wipe') {
        setCutinVisible(false);
        setPortraitVisible(false);
        setTimeout(resolve, params.duration || 300);
      } else {
        resolve();
      }
    });
  }

  function waitInput() {
    return new Promise(resolve => {
      const done = () => {
        window.removeEventListener('pointerdown', done);
        window.removeEventListener('keydown', done);
        resolve();
      };
      window.addEventListener('pointerdown', done);
      window.addEventListener('keydown', done);
    });
  }

  function waitMs(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  return (
    <div
      ref={stageRef}
      style={{
        position: 'relative',
        width: '100%',
        height: '100%',
        background: '#071426',
        borderRadius: 12,
        overflow: 'hidden',
        boxShadow: '0 16px 50px rgba(0,0,0,0.6)',
      }}
    >
      <div
        id="backdrop"
        style={{
          position: 'absolute',
          inset: 0,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          backgroundImage: backdropSrc ? `url("${backdropSrc}")` : 'none',
          transition: 'opacity 0.35s ease',
          opacity: backdropSrc ? 1 : 0,
        }}
      />
      <div
        className="world"
        style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          alignItems: 'flex-end',
          justifyContent: 'center',
          pointerEvents: 'none',
        }}
      >
        <div
          className="platform"
          style={{
            width: '60%',
            height: 200,
            background: 'linear-gradient(180deg, #092032, #071427)',
            opacity: 0.65,
            borderRadius: 6,
            marginBottom: 70,
          }}
        />
      </div>
      <div
        className="portrait"
        style={{
          position: 'absolute',
          left: 18,
          bottom: 110,
          width: 160,
          height: 160,
          borderRadius: 8,
          overflow: 'hidden',
          background: 'linear-gradient(180deg, #081827, #05101a)',
          boxShadow: '0 8px 24px rgba(0,0,0,.6)',
          transition: 'transform 0.25s, opacity 0.25s, z-index 0.1s',
          opacity: portraitVisible ? 1 : 0,
          transform: portraitVisible ? 'none' : 'translateY(10px)',
          zIndex: portraitVisible ? 10 : -1,
        }}
      >
        {portraitSrc && (
          <img
            src={portraitSrc}
            alt="portrait"
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
        )}
        {currentExpression && portraitVisible && (
          <div
            style={{
              position: 'absolute',
              bottom: 4,
              right: 4,
              fontSize: '32px',
              lineHeight: 1,
              background: 'rgba(0,0,0,0.6)',
              borderRadius: '50%',
              width: '40px',
              height: '40px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 2px 8px rgba(0,0,0,0.4)',
            }}
          >
            {currentExpression === 'smile' && '😊'}
            {currentExpression === 'sad' && '😢'}
            {currentExpression === 'annoyed' && '😠'}
            {currentExpression === 'shocked' && '😨'}
            {currentExpression === 'neutral' && '😐'}
            {currentExpression === 'smirk' && '😏'}
            {currentExpression === 'worried' && '😰'}
            {currentExpression === 'tired' && '😴'}
          </div>
        )}
      </div>
      <div
        className="cutin"
        style={{
          position: 'absolute',
          left: '6%',
          top: '6%',
          width: '88%',
          height: '62%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          pointerEvents: 'none',
          opacity: cutinVisible && cutinSrc ? 1 : 0,
          transform: cutinVisible && cutinSrc ? 'none' : 'translateY(-8px)',
          transition: 'opacity 0.3s, transform 0.35s',
          zIndex: 12,
        }}
      >
        {cutinSrc && (
          <div
            className="card"
            style={{
              width: '72%',
              height: '86%',
              borderRadius: 12,
              background: 'rgba(255,255,255,0.02)',
              boxShadow: '0 30px 60px rgba(0,0,0,0.5)',
              backgroundImage: `url(${cutinSrc})`,
              backgroundSize: 'contain',
              backgroundRepeat: 'no-repeat',
              backgroundPosition: 'center',
            }}
          />
        )}
      </div>
      <div
        className="dialogueBox"
        style={{
          position: 'absolute',
          left: 200,
          right: 20,
          bottom: 28,
          padding: '14px 16px',
          background:
            'linear-gradient(180deg, rgba(2,6,11,0.95), rgba(3,7,13,0.95))',
          borderRadius: 12,
          boxShadow: '0 12px 30px rgba(0,0,0,0.5)',
          color: '#7dd3fc',
        }}
      >
        <div style={{ fontWeight: 700, color: '#7dd3fc', marginBottom: 6 }}>
          {speaker}
        </div>
        <div
          style={{
            whiteSpace: 'pre-wrap',
            lineHeight: 1.38,
            fontSize: 16,
            minHeight: 46,
          }}
        >
          {dialogueText}
        </div>
      </div>
      <div
        className="stageControls"
        style={{
          position: 'absolute',
          right: 18,
          bottom: 14,
          display: 'flex',
          gap: 8,
        }}
      >
        <button
          type="button"
          className="btn"
          onClick={() => internalPlay()}
          disabled={playing}
          style={{
            background: 'transparent',
            border: '1px solid rgba(255,255,255,0.06)',
            color: '#7dd3fc',
            padding: '8px 10px',
            borderRadius: 8,
            cursor: 'pointer',
          }}
        >
          Play
        </button>
        <button
          type="button"
          className="btn"
          onClick={() => internalStop()}
          disabled={!playing}
          style={{
            background: 'transparent',
            border: '1px solid rgba(255,255,255,0.06)',
            color: '#7dd3fc',
            padding: '8px 10px',
            borderRadius: 8,
            cursor: 'pointer',
          }}
        >
          Stop
        </button>
        <button
          type="button"
          className="btn"
          onClick={() => internalSkip()}
          style={{
            background: 'transparent',
            border: '1px solid rgba(255,255,255,0.06)',
            color: '#7dd3fc',
            padding: '8px 10px',
            borderRadius: 8,
            cursor: 'pointer',
          }}
        >
          Skip
        </button>
      </div>
    </div>
  );
});

export default CutscenePlayer;
