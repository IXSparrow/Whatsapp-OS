import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';

if (fs.existsSync(path.resolve(process.cwd(), '.env.local'))) {
  dotenv.config({ path: path.resolve(process.cwd(), '.env.local'), override: true });
} else {
  dotenv.config({ override: true });
}

import express from 'express';
import { createServer as createViteServer } from 'vite';
import { createServer as createHttpServer } from 'http';
import { Server } from 'socket.io';
import { env } from './src/lib/env';

// Import Routes
import whatsappRoutes from './src/server/routes/whatsapp';
import leadsRoutes from './src/server/routes/leads';
import campaignsRoutes from './src/server/routes/campaigns';
import conversationsRoutes from './src/server/routes/conversations';
import agentsRoutes from './src/server/routes/agents';
import analyticsRoutes from './src/server/routes/analytics';
import leadEngineRoutes from './src/server/routes/leadEngine';
import outreachRoutes from './src/server/routes/outreach';
import { setIoInstance } from './src/server/campaigns/runner';

async function startServer() {
  const app = express();
  app.use(express.json());
  const PORT = 3000;

  const httpServer = createHttpServer(app);
  const io = new Server(httpServer, {
    cors: { origin: '*' }
  });
  setIoInstance(io);

  // Attach socket io to req to be used in routes if needed
  app.use((req, res, next) => {
    (req as any).io = io;
    next();
  });

  io.on('connection', (socket) => {
    console.log('Client connected:', socket.id);
    socket.on('disconnect', () => console.log('Client disconnected:', socket.id));
  });

  // Mount API Routes
  app.use('/api/whatsapp', whatsappRoutes);
  app.use('/api/leads', leadsRoutes);
  app.use('/api/campaigns', campaignsRoutes);
  app.use('/api/conversations', conversationsRoutes);
  app.use('/api/ai-agents', agentsRoutes);
  app.use('/api/analytics', analyticsRoutes);
  app.use('/api/lead-engine', leadEngineRoutes);
  app.use('/api/outreach', outreachRoutes);

  // Legacy mappings to avoid breaking old UI parts that weren't migrated
  app.use('/api/ai/stats', analyticsRoutes);
  app.use('/api/all-leads', leadsRoutes);
  app.use('/api/ai/agents', agentsRoutes);
  app.use('/api/ai/campaigns', campaignsRoutes);
  app.use('/api/ai/conversations', conversationsRoutes);

  // Vite / Static Handling
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  httpServer.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Premium UI & API running on http://localhost:${PORT}`);
  });
}

startServer(); // Reloading server to register the newly added sync-vault backend endpoint
