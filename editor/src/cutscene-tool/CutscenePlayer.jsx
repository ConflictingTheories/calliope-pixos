import React, { useState, useEffect, useRef, forwardRef, useImperativeHandle } from 'react';

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
 */

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
        const parts = rest.match(/(?:[^\s\[]+|\[[^\]]*\])/g) || [];
        const hook = parts[0];
        const args = parseBracket(parts.slice(1).join('') || '');
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

const CutscenePlayer = forwardRef(({ scriptText, speed = 60, autoAdvance = false, onPlayStart, onPlayStop }, ref) => {
  const [scene, setScene] = useState(null);
  const [portraitSrc, setPortraitSrc] = useState(null);
  const [cutinSrc, setCutinSrc] = useState(null);
  const [backdropSrc, setBackdropSrc] = useState(null);
  const [speaker, setSpeaker] = useState('—');
  const [dialogueText, setDialogueText] = useState('(press Play)');
  const [playing, setPlaying] = useState(false);
  const [cutinVisible, setCutinVisible] = useState(false);
  const [portraitVisible, setPortraitVisible] = useState(false);
  const stopFlag = useRef(false);

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
  }));

  function resetDisplay() {
    setBackdropSrc(null);
    setPortraitSrc(null);
    setCutinSrc(null);
    setSpeaker('—');
    setDialogueText('(press Play)');
    setCutinVisible(false);
    setPortraitVisible(false);
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

  function showBackdrop(ev) {
    return new Promise(resolve => {
      const file = ev.payload.file;
      setBackdropSrc(file);
      if (ev.payload.options && ev.payload.options.fadeIn) {
        // Simulate fade-in with timeout
        setTimeout(resolve, ev.payload.options.fadeIn);
      } else {
        resolve();
      }
    });
  }

  function showDialogue(ev) {
    return new Promise(resolve => {
      const { actor, payload } = ev;
      const text = payload.text || '';
      const sprite = (payload.meta && payload.meta.sprite) || (scene.chars[actor] && scene.chars[actor].sprite) || null;
      if (ev.type === 'dialogue') {
        setPortraitSrc(sprite);
        setPortraitVisible(true);
        setCutinVisible(false);
      } else if (ev.type === 'cutin') {
        setCutinSrc(sprite);
        setCutinVisible(true);
        setPortraitVisible(false);
      }
      setSpeaker(actor);
      setDialogueText('');
      let i = 0;
      const baseSpeed = typeof speed === 'function' ? speed() : speed;
      function typeStep() {
        if (stopFlag.current) {
          resolve();
          return;
        }
        if (i < text.length) {
          setDialogueText(prev => prev + text.charAt(i));
          i++;
          let delay = baseSpeed;
          if (/[.,!?]/.test(text.charAt(i - 1))) {
            delay += Math.round(baseSpeed * 1.2);
          }
          setTimeout(typeStep, delay);
        } else {
          if (autoAdvance) setTimeout(resolve, 400);
          else resolve();
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

  function doHook(ev) {
    if (ev.payload.hook === 'playSfx') {
      // Could add sound effect playback here
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
          backgroundImage: backdropSrc ? `url(${backdropSrc})` : 'none',
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
          opacity: cutinVisible ? 1 : 0,
          transform: cutinVisible ? 'none' : 'translateY(-8px)',
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
    </div>
  );
});

export default CutscenePlayer;
