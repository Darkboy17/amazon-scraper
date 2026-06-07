import { REFRESH_BUFFER_MS, SESSION_STORAGE_KEY } from '../config/appConfig.js';

/**
 * Owns token storage and refresh scheduling so UI code only asks for valid tokens.
 */
export function createSessionManager(apiClient, handlers = {}) {
  let session = readStoredSession();
  let refreshTimer;
  let refreshPromise;

  function getSession() {
    return session;
  }

  function setSession(nextSession) {
    session = nextSession;
    localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(nextSession));
    scheduleSilentRefresh();
  }

  function clearSession() {
    session = null;
    localStorage.removeItem(SESSION_STORAGE_KEY);
    clearTimeout(refreshTimer);
    refreshTimer = null;
  }

  async function getValidIdToken() {
    if (!session?.idToken || !session?.refreshToken) {
      throw new Error('Authentication required');
    }

    if (Date.now() >= Number(session.expiresAt || 0) - REFRESH_BUFFER_MS) {
      await refreshSession();
    }

    return session.idToken;
  }

  async function refreshSession() {
    if (!session?.refreshToken) {
      throw new Error('No refresh token available');
    }

    if (refreshPromise) {
      return refreshPromise;
    }

    refreshPromise = apiClient.request('/api/auth/refresh', {
      method: 'POST',
      body: {
        refreshToken: session.refreshToken,
      },
    })
      .then((nextSession) => {
        setSession(nextSession);
        handlers.onRefresh?.(nextSession);
        return nextSession;
      })
      .finally(() => {
        refreshPromise = null;
      });

    return refreshPromise;
  }

  async function authFetch(path, options = {}, hasRetried = false) {
    const idToken = await getValidIdToken();
    const response = await fetch(`${apiClientBaseUrl(apiClient)}${path}`, {
      ...options,
      headers: {
        ...(options.headers || {}),
        Authorization: `Bearer ${idToken}`,
      },
    });
    const data = await response.json().catch(() => ({}));

    if (response.status === 401 && !hasRetried) {
      try {
        await refreshSession();
        return authFetch(path, options, true);
      } catch (error) {
        clearSession();
        handlers.onExpired?.();
        throw new Error('Session expired. Sign in again.');
      }
    }

    if (!response.ok) {
      throw new Error(data.error || 'Request failed');
    }

    return data;
  }

  function scheduleSilentRefresh() {
    clearTimeout(refreshTimer);

    if (!session?.expiresAt || !session?.refreshToken) {
      return;
    }

    const delay = Math.max(30_000, Number(session.expiresAt) - Date.now() - REFRESH_BUFFER_MS);
    refreshTimer = setTimeout(async () => {
      try {
        await refreshSession();
      } catch (error) {
        clearSession();
        handlers.onExpired?.();
      }
    }, delay);
  }

  scheduleSilentRefresh();

  return {
    authFetch,
    clearSession,
    getSession,
    getValidIdToken,
    refreshSession,
    setSession,
  };
}

function apiClientBaseUrl(apiClient) {
  return apiClient.baseUrl || '';
}

function readStoredSession() {
  try {
    const stored = localStorage.getItem(SESSION_STORAGE_KEY);
    return stored ? JSON.parse(stored) : null;
  } catch (error) {
    localStorage.removeItem(SESSION_STORAGE_KEY);
    return null;
  }
}
