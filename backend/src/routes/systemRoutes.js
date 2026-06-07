import { Router } from 'express';
import {
  getSupabaseConfigError,
  RAW_SUPABASE_URL,
  SUPABASE_URL,
  supabaseConfigured,
} from '../config/env.js';
import { isProxyAvailable } from '../services/proxyService.js';
import { getWelcomeHtml } from '../views/welcomeHtml.js';

export const systemRoutes = Router();

systemRoutes.get('/', (req, res) => {
  res.type('html').send(getWelcomeHtml());
});

systemRoutes.get('/api/welcome', (req, res) => {
  res.json({
    message: 'Welcome to the Amazon Scraper API',
    docs: '/docs',
    openapi: '/api/docs/openapi.json',
    health: '/api/health',
    timestamp: new Date().toISOString(),
  });
});

systemRoutes.get('/api/health', (req, res) => {
  res.json({
    ok: true,
    authProvider: 'supabase',
    supabaseConfigured,
    supabaseUrl: SUPABASE_URL,
    supabaseUrlNormalized: RAW_SUPABASE_URL !== SUPABASE_URL,
    supabaseConfigError: getSupabaseConfigError(),
    proxyAvailable: isProxyAvailable(),
  });
});
