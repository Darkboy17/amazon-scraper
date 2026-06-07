import cors from 'cors';
import express from 'express';
import { corsOrigins } from './config/env.js';
import { authRoutes } from './routes/authRoutes.js';
import { docsRoutes } from './routes/docsRoutes.js';
import { proxyRoutes } from './routes/proxyRoutes.js';
import { scrapeRoutes } from './routes/scrapeRoutes.js';
import { systemRoutes } from './routes/systemRoutes.js';
import { userRoutes } from './routes/userRoutes.js';

/**
 * Composes middleware and route modules into a single Express app.
 */
export function createApp() {
  const app = express();

  app.use(cors({ origin: corsOrigins }));
  app.use(express.json());

  app.use(systemRoutes);
  app.use(docsRoutes);
  app.use('/api/auth', authRoutes);
  app.use('/api/users', userRoutes);
  app.use('/api', scrapeRoutes);
  app.use('/api', proxyRoutes);

  return app;
}
