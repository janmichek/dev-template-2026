import { handle } from 'hono/vercel';
import { app } from '../server/app';

// Preview and production deployments run the API as a Vercel Function.
export const config = { runtime: 'edge' };

export default handle(app);
