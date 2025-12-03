import './App.css';
import { useState, useEffect } from 'react';
// In development, the alias 'calliope-pixos' maps to the source directory
import PixosClient from 'calliope-pixos';

function App() {
  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState(0);

  const urlParams = new URLSearchParams(window.location.search);
  const isNetworked = urlParams.get('network') === 'true';
  const manifest = isNetworked ? 'manifest.network.json' : 'manifest.local.json';

  useEffect(() => {
    // Simulate loading progress
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(() => {
            setLoading(false);
          }, 500);
          return 100;
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
          <PixosClient manifest={`/spritz/${manifest}`} loading={loading} />
        </div>
      </div>
    </div>
  );
}

export default App;
