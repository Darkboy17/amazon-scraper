import { getSupabaseConfigError, supabaseConfigured } from '../config/env.js';
import { supabaseAdmin, supabaseAuth } from '../database/supabaseClient.js';
import { getErrorDetails } from '../utils/errors.js';

/**
 * Guards routes that require Supabase and writes a consistent response on failure.
 */
export function requireSupabase(res) {
  const configError = getSupabaseConfigError();

  if (configError || !supabaseConfigured) {
    res.status(500).json({ error: configError || 'Supabase is not configured on the server' });
    return false;
  }

  return true;
}

/**
 * Maps Supabase's user payload into the small user contract used by the frontend.
 */
export function mapSupabaseUser(user) {
  return {
    uid: user.id,
    email: user.email || null,
    displayName: user.user_metadata?.name || user.user_metadata?.full_name || null,
    emailVerified: Boolean(user.email_confirmed_at),
  };
}

function buildSessionResponse(session, user) {
  const expiresIn = Number(session.expires_in || 3600);

  return {
    idToken: session.access_token,
    refreshToken: session.refresh_token,
    expiresIn,
    expiresAt: session.expires_at ? session.expires_at * 1000 : Date.now() + expiresIn * 1000,
    user: mapSupabaseUser(user),
  };
}

function normalizeAuthError(error) {
  const { message, status } = getErrorDetails(error);
  const lowerMessage = message.toLowerCase();

  if (lowerMessage.includes('invalid login credentials') || status === 400) {
    return 'Email or password is incorrect';
  }

  if (lowerMessage.includes('already registered') || lowerMessage.includes('already exists')) {
    return 'That email already has an account';
  }

  if (lowerMessage.includes('password')) {
    return 'Use at least six characters for the password';
  }

  if (lowerMessage.includes('refresh token') || status === 401) {
    return 'Session is no longer valid';
  }

  if (lowerMessage.includes('relation') || lowerMessage.includes('schema cache')) {
    return 'Supabase database tables are not set up yet';
  }

  return 'Authentication failed';
}

function logAuthError(action, error) {
  const { code, message, status } = getErrorDetails(error);
  console.error(`${action} failed:`, {
    code,
    status,
    message,
  });
}

/**
 * Keeps profile records warm whenever a user authenticates or accesses the API.
 */
export async function upsertUserProfile(user) {
  const { error } = await supabaseAdmin
    .from('user_profiles')
    .upsert({
      id: user.uid,
      email: user.email,
      display_name: user.displayName,
      updated_at: new Date().toISOString(),
      last_seen_at: new Date().toISOString(),
    }, {
      onConflict: 'id',
    });

  if (error) {
    throw error;
  }
}

export async function validateAccessToken(token) {
  const { data, error } = await supabaseAuth.auth.getUser(token);

  if (error || !data.user) {
    throw error || new Error('Supabase user not found');
  }

  return mapSupabaseUser(data.user);
}

export async function signInWithPassword(email, password) {
  try {
    const { data, error } = await supabaseAuth.auth.signInWithPassword({ email, password });

    if (error || !data.session || !data.user) {
      throw error || new Error('Supabase did not return a session');
    }

    const session = buildSessionResponse(data.session, data.user);
    await upsertUserProfile(session.user);

    return session;
  } catch (error) {
    logAuthError('Sign in', error);
    const normalizedError = new Error(normalizeAuthError(error));
    normalizedError.statusCode = 401;
    throw normalizedError;
  }
}

export async function signUpWithPassword(email, password) {
  try {
    const { data, error } = await supabaseAuth.auth.signUp({ email, password });

    if (error || !data.user) {
      throw error || new Error('Supabase did not return a user');
    }

    const user = mapSupabaseUser(data.user);
    await upsertUserProfile(user);

    return {
      requiresSignIn: true,
      requiresEmailConfirmation: !data.session,
      message: data.session
        ? 'Account created. Please sign in to open your dashboard.'
        : 'Account created. Check your email to confirm it, then sign in.',
      user,
    };
  } catch (error) {
    logAuthError('Sign up', error);
    const message = normalizeAuthError(error);
    const normalizedError = new Error(message);
    normalizedError.statusCode = message === 'That email already has an account' ? 409 : 400;
    throw normalizedError;
  }
}

export async function refreshAuthSession(refreshToken) {
  try {
    const { data, error } = await supabaseAuth.auth.refreshSession({
      refresh_token: refreshToken,
    });

    if (error || !data.session || !data.user) {
      throw error || new Error('Supabase did not return a refreshed session');
    }

    const session = buildSessionResponse(data.session, data.user);
    await upsertUserProfile(session.user);

    return session;
  } catch (error) {
    logAuthError('Session refresh', error);
    const normalizedError = new Error(normalizeAuthError(error));
    normalizedError.statusCode = 401;
    throw normalizedError;
  }
}
