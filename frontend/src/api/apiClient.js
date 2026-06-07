/**
 * Creates a small fetch wrapper that normalizes JSON parsing and API errors.
 */
export function createApiClient(apiBaseUrl) {
  async function request(path, options = {}) {
    const response = await fetch(`${apiBaseUrl}${path}`, {
      method: options.method || 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...(options.headers || {}),
      },
      body: options.body ? JSON.stringify(options.body) : undefined,
    });
    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      throw new Error(data.error || 'Request failed');
    }

    return data;
  }

  async function rawJson(path, options = {}) {
    const response = await fetch(`${apiBaseUrl}${path}`, options);
    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      throw new Error(data.error || 'Request failed');
    }

    return data;
  }

  return {
    baseUrl: apiBaseUrl,
    request,
    rawJson,
  };
}
