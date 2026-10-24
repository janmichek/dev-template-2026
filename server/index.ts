import { serveStatic } from 'hono/bun';
import { app } from './app';

// Serve the production React build from this same server so
// one Docker container handles both API and UI on :3001.
app.use('*', serveStatic({ root: './build' }));
app.get('*', serveStatic({ path: './build/index.html' }));

export default { port: 3001, fetch: app.fetch };
