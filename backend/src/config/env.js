import 'dotenv/config';
import { isPublicSupabaseKey } from '../utils/jwt.js';

/**
 * Centralizes environment parsing so services do not reach into process.env.
 */
export const PORT = process.env.PORT || 3000;
export const SCRAPER_API_KEY = process.env.SCRAPER_API_KEY;
export const SCRAPER_API_URL = 'https://api.scraperapi.com/';
export const PROXY_SCRAPE_LIMIT = 10;

export const RAW_SUPABASE_URL = process.env.SUPABASE_URL;
export const SUPABASE_URL = normalizeSupabaseUrl(RAW_SUPABASE_URL);
export const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;
export const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
export const supabaseConfigured = Boolean(
  SUPABASE_URL
  && SUPABASE_ANON_KEY
  && SUPABASE_SERVICE_ROLE_KEY,
);

export const corsOrigins = process.env.CORS_ORIGIN
  ? process.env.CORS_ORIGIN.split(',')
  : true;

/**
 * Accepts accidental Supabase REST URLs and stores only the project origin.
 */
export function normalizeSupabaseUrl(rawUrl) {
  if (!rawUrl) {
    return rawUrl;
  }

  try {
    const url = new URL(rawUrl.trim());
    return url.origin;
  } catch (error) {
    return rawUrl.trim();
  }
}

/**
 * Produces operator-friendly configuration errors for health checks and auth guards.
 */
export function getSupabaseConfigError() {
  if (!RAW_SUPABASE_URL || !SUPABASE_ANON_KEY || !SUPABASE_SERVICE_ROLE_KEY) {
    return 'Supabase is not configured on the server';
  }

  if (!SUPABASE_URL.includes('.supabase.co')) {
    return 'SUPABASE_URL must be your project base URL, for example https://your-project-ref.supabase.co';
  }

  if (isPublicSupabaseKey(SUPABASE_SERVICE_ROLE_KEY)) {
    return 'SUPABASE_SERVICE_ROLE_KEY must be the secret service_role key, not the anon or publishable key';
  }

  return null;
}
