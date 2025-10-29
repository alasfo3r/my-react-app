import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import './App.css';
import App from './App.jsx';
import client from './components/Apolloclient.js';
import { ApolloProvider } from '@apollo/client';
import DebugErrorBoundary from './DebugErrorBoundary.jsx';

window.onerror = (msg, src, line, col, err) => {
  console.error('[window.onerror]', { msg, src, line, col, err });
};
window.onunhandledrejection = (event) => {
  console.error('[unhandledrejection]', event.reason);
};

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <ApolloProvider client={client}>
    <DebugErrorBoundary>
      <App />
    </DebugErrorBoundary>
  </ApolloProvider>
);
