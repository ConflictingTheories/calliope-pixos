import './App.css';
import { useState, useEffect } from 'react';
import PixosClient from 'pixospritz-core';
import ErrorBoundary from './components/ErrorBoundary';

function App() {
  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState(0);
  const [preMountClient, setPreMountClient] = useState(false);

  const urlParams = new URLSearchParams(window.location.search);
  const networkParam = urlParams.get('network');
  const manifestParam = urlParams.get('manifest');

  // Only auto-load if explicitly requested via manifest or network params
  const manifest =
    manifestParam ||
    (networkParam === 'true'
      ? 'manifest.network.json'
      : networkParam === 'local'
        ? 'manifest.local.json'
        : null);

  useEffect(() => {
    // Simulate loading progress
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          // Mount PixosClient 100ms before loading finishes
          setTimeout(() => setPreMountClient(true), 400);
          setTimeout(() => setLoading(false), 500);
          return 100;
        }
        // Pre-mount PixosClient when 100ms left
        if (prev === 90) {
          setTimeout(() => setPreMountClient(true), 100);
        }
        return prev + 10;
      });
    }, 200);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="App">
      {loading && (
        <div className={`loading-screen ${progress === 100 ? 'fade-out' : ''}`}>
          <div className="loading-logo">
            <span className="logo-pixos">Pixo</span>
            <span className="logo-spritz">Spritz</span>
          </div>
          <div className="loading-bar">
            <div className="loading-progress" style={{ width: `${progress}%` }} />
          </div>
          <div className="loading-text">INITIALIZING SYSTEM...</div>
        </div>
      )}

      <div className="console-frame">
        <div className="console-header">
          <div className="console-title">
            <span className="title-pixos">Pixo</span>
            <span className="title-spritz">Spritz</span>
            <span className="title-version"> Console v1.0</span>
          </div>
          <div className="console-status">
            <div className={`status-indicator ${!loading ? 'active' : ''}`}></div>
            <span className="status-text">{loading ? 'LOADING' : 'READY'}</span>
          </div>
        </div>

        <div className="screen-container">
          <ErrorBoundary>
            {(preMountClient || !loading) && (
              <PixosClient manifest={manifest ? `/spritz/${manifest}` : null} loading={loading} />
            )}
          </ErrorBoundary>
        </div>
      </div>
    </div>
  );
}

export default App;
