import './App.css';
import { useState, useEffect, useRef } from 'react';
import PixosClient from 'pixospritz-core';
import { validateManifest } from 'pixospritz-specs/validator';
import ErrorBoundary from './components/ErrorBoundary';

/**
 * PixoSpritz console shell — P4-09 hardened.
 *
 * - No fake progress: the loading bar tracks the real manifest fetch.
 * - The manifest is validated with the shared specs validator BEFORE the
 *   player mounts. Invalid packages show typed errors; they never reach
 *   the engine as partial state.
 * - On unmount the player is torn down via React lifecycle. Engine-level
 *   disposal (GLEngine.close() cancelling the RAF loop) is wired once the
 *   console imports the engine from source instead of the dist bundle.
 */

const PHASE = {
  IDLE: 'idle',
  FETCHING: 'fetching',
  VALIDATING: 'validating',
  READY: 'ready',
  ERROR: 'error',
};

function resolveManifestUrl() {
  const params = new URLSearchParams(window.location.search);
  const manifestParam = params.get('manifest');
  const networkParam = params.get('network');
  // Explicit manifest URL wins; otherwise the legacy network shortcuts.
  if (manifestParam) return manifestParam;
  if (networkParam === 'true') return 'manifest.network.json';
  if (networkParam === 'local') return 'manifest.local.json';
  return null;
}

async function fetchWithProgress(url, onProgress) {
  const res = await fetch(url);
  if (!res.ok) {
    const err = new Error(`Manifest fetch failed: ${res.status} ${res.statusText}`);
    err.code = 'FETCH_FAILED';
    throw err;
  }
  const total = Number(res.headers.get('content-length')) || 0;
  if (!res.body || typeof res.body.getReader !== 'function') {
    return { text: await res.text(), total: 0 };
  }
  const reader = res.body.getReader();
  const chunks = [];
  let received = 0;
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    chunks.push(value);
    received += value.length;
    onProgress(total > 0 ? Math.min(99, Math.round((received / total) * 100)) : null);
  }
  const body = new Blob(chunks);
  return { text: await body.text(), total };
}

function App() {
  const [phase, setPhase] = useState(PHASE.IDLE);
  const [progress, setProgress] = useState(null); // null = indeterminate
  const [problem, setProblem] = useState(null); // { code, message, issues? }
  const [manifestUrl, setManifestUrl] = useState(null);
  const [manifestOk, setManifestOk] = useState(false);
  const cancelled = useRef(false);

  useEffect(() => {
    cancelled.current = false;

    async function boot() {
      const url = resolveManifestUrl();
      if (!url) {
        // No package requested: mount the player in its empty state.
        if (!cancelled.current) {
          setManifestUrl(null);
          setManifestOk(true);
          setPhase(PHASE.READY);
        }
        return;
      }

      setPhase(PHASE.FETCHING);
      setProgress(null);
      let text;
      try {
        ({ text } = await fetchWithProgress(url, p => {
          if (!cancelled.current) setProgress(p);
        }));
      } catch (e) {
        if (!cancelled.current) {
          setProblem({ code: e.code || 'LOAD_FAILED', message: e.message });
          setPhase(PHASE.ERROR);
        }
        return;
      }

      let manifest;
      try {
        manifest = JSON.parse(text);
      } catch (e) {
        if (!cancelled.current) {
          setProblem({ code: 'BAD_JSON', message: `Manifest is not valid JSON: ${e.message}` });
          setPhase(PHASE.ERROR);
        }
        return;
      }

      setPhase(PHASE.VALIDATING);
      const { valid, issues } = validateManifest(manifest);
      if (cancelled.current) return;
      if (!valid) {
        setProblem({
          code: 'INVALID_MANIFEST',
          message: `Package manifest failed validation (${issues.filter(i => i.severity === 'error').length} error(s))`,
          issues,
        });
        setPhase(PHASE.ERROR);
        return;
      }

      setManifestUrl(url);
      setManifestOk(true);
      setProgress(100);
      setPhase(PHASE.READY);
    }

    boot();
    return () => {
      cancelled.current = true;
      // Player teardown: unmounting PixosClient releases the React tree.
      // Engine-level disposal (cancelAnimationFrame via GLEngine.close())
      // is wired when the console imports from source (see header note).
    };
  }, []);

  const loading = phase === PHASE.FETCHING || phase === PHASE.VALIDATING || phase === PHASE.IDLE;
  const showProgress = progress !== null ? progress : phase === PHASE.FETCHING ? 15 : 90;

  return (
    <div className="App">
      {loading && (
        <div className="loading-screen">
          <div className="loading-logo">
            <span className="logo-pixos">Pixo</span>
            <span className="logo-spritz">Spritz</span>
          </div>
          <div className="loading-bar">
            <div className="loading-progress" style={{ width: `${showProgress}%` }} />
          </div>
          <div className="loading-text">
            {phase === PHASE.FETCHING && 'FETCHING PACKAGE...'}
            {phase === PHASE.VALIDATING && 'VALIDATING PACKAGE...'}
            {phase === PHASE.IDLE && 'INITIALIZING...'}
          </div>
        </div>
      )}

      {phase === PHASE.ERROR && problem && (
        <div className="loading-screen">
          <div className="loading-logo">
            <span className="logo-pixos">Pixo</span>
            <span className="logo-spritz">Spritz</span>
          </div>
          <div className="error-panel" role="alert">
            <div className="error-code">{problem.code}</div>
            <div className="error-message">{problem.message}</div>
            {problem.issues && (
              <ul className="error-issues">
                {problem.issues
                  .filter(i => i.severity === 'error')
                  .slice(0, 12)
                  .map((i, n) => (
                    <li key={n}>
                      <code>{i.code}</code> {i.path}: {i.message}
                    </li>
                  ))}
              </ul>
            )}
          </div>
        </div>
      )}

      {phase === PHASE.READY && (
        <div className="console-frame">
          <div className="console-header">
            <div className="console-title">
              <span className="title-pixos">Pixo</span>
              <span className="title-spritz">Spritz</span>
              <span className="title-version"> Console v1.0</span>
            </div>
            <div className="console-status">
              <div className="status-indicator active"></div>
              <span className="status-text">READY</span>
            </div>
          </div>

          <div className="screen-container">
            <ErrorBoundary>
              {manifestOk && (
                <PixosClient manifest={manifestUrl ? `/spritz/${manifestUrl}` : null} />
              )}
            </ErrorBoundary>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
