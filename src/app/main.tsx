import * as Sentry from '@sentry/react';
import React from 'react';
import ReactDOM from 'react-dom/client';
import '@radix-ui/themes/styles.css';
import '../index.css';
import { App } from './App';

// Without a DSN (local dev, tests) Sentry stays off
const dsn = import.meta.env['VITE_SENTRY_DSN'];
if (dsn !== undefined && dsn !== '') {
  Sentry.init({ dsn, environment: import.meta.env['MODE'] });
}

// React 19 does not rethrow render errors to window.onerror, so report them from the root hooks
const reportError = (error: unknown, info: { componentStack?: string | undefined }) => {
  Sentry.captureReactException(error, { componentStack: info.componentStack ?? null });
};

const container = document.getElementById('root');
if (container === null) {
  throw new Error('Missing #root element');
}

const root = ReactDOM.createRoot(container, {
  onUncaughtError: reportError,
  onCaughtError: reportError,
  onRecoverableError: reportError,
});
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
