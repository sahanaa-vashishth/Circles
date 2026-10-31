import express from 'express';
import { createServer as createViteServer } from 'vite';
import dotenv from 'dotenv';
import apiRoutes from './src/backend/routes/index.ts';

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// API routes mounted at /api
app.use('/api', apiRoutes);

async function startServer() {
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static('dist'));
    app.get('*', (_req, res) => {
      res.sendFile('dist/index.html', { root: '.' });
    });
  } else {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[Orbit] Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
