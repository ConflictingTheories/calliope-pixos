/*
 * Entry point for the Pixospritz editor.  This file mounts
 * the App component on the document body and applies global
 * styles.
 */
import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './app.jsx';

const root = ReactDOM.createRoot(document.body);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);