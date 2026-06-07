import { requireSupabase, validateAccessToken } from '../services/authService.js';

/**
 * Validates Supabase bearer tokens and attaches the normalized user to req.user.
 */
export async function authenticateUser(req, res, next) {
  if (!requireSupabase(res)) {
    return;
  }

  const authHeader = req.get('authorization') || '';
  const [, token] = authHeader.match(/^Bearer (.+)$/) || [];

  if (!token) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  try {
    req.user = await validateAccessToken(token);
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Invalid or expired authentication token' });
  }
}
