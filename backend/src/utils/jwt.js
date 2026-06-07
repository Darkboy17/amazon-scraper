/**
 * JWT helpers keep token inspection isolated from auth business logic.
 * The API only decodes public metadata here; signature validation remains with Supabase.
 */
export function decodeJwtPayload(token) {
  try {
    const [, payload] = token.split('.');

    if (!payload) {
      return null;
    }

    const base64 = payload.replace(/-/g, '+').replace(/_/g, '/');
    return JSON.parse(Buffer.from(base64, 'base64').toString('utf8'));
  } catch (error) {
    return null;
  }
}

/**
 * Detects Supabase anon/publishable keys so operators do not accidentally use
 * a public key in the service-role slot.
 */
export function isPublicSupabaseKey(key) {
  if (!key) {
    return false;
  }

  if (key.startsWith('sb_publishable_')) {
    return true;
  }

  const payload = decodeJwtPayload(key);
  return payload?.role === 'anon';
}
