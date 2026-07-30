import React from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './App';
import './assets/styles/main.css';

const container = document.getElementById('root');

if (!container) {
  console.error('Root element not found!');
  document.body.innerHTML = '<h1>Error: Root element not found!</h1>';
} else {
  try {
    const root = createRoot(container);
    root.render(
      <React.StrictMode>
        <App />
      </React.StrictMode>
    );
  } catch (error) {
    console.error('Error rendering App:', error);
    document.body.innerHTML = `
      <h1>Error!</h1>
      <pre style="color:red;font-size:14px;">${error.message}</pre>
      <pre style="font-size:12px;">${error.stack}</pre>
    `;
  }
}
