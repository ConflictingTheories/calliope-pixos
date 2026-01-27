/*
 * Entry point for the Pixospritz editor.  This file mounts
 * the App component on the document body and applies global
 * styles.
 */
import React from 'react';
import ReactDOM from 'react-dom/client';

// Custom UI component styles
import './ui/theme.css';

import './index.css';
import './shared/editor-styles.css';
import App from './app.jsx';

// Create root container if it doesn't exist
let rootElement = document.getElementById('root');
if (!rootElement) {
  rootElement = document.createElement('div');
  rootElement.id = 'root';
  document.body.appendChild(rootElement);
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
