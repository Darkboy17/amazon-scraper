import { createClient } from '@supabase/supabase-js';
import {
  SUPABASE_ANON_KEY,
  SUPABASE_SERVICE_ROLE_KEY,
  SUPABASE_URL,
  supabaseConfigured,
} from '../config/env.js';

const serverAuthOptions = {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
};

/**
 * Public auth client validates user credentials and bearer tokens.
 */
export const supabaseAuth = supabaseConfigured
  ? createClient(SUPABASE_URL, SUPABASE_ANON_KEY, serverAuthOptions)
  : null;

/**
 * Service-role client performs trusted profile and scrape-history writes.
 */
export const supabaseAdmin = supabaseConfigured
  ? createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, serverAuthOptions)
  : null;
