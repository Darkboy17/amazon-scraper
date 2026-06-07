/**
 * Extracts stable diagnostic fields from third-party errors without leaking
 * raw objects into API responses.
 */
export function getErrorDetails(error) {
  const rawCode = error.response?.data?.error?.message
    || error.response?.data?.error_description
    || error.status
    || error.code
    || error.message
    || '';
  const code = typeof rawCode === 'string' ? rawCode : JSON.stringify(rawCode);
  const message = typeof error.message === 'string' ? error.message : '';

  return {
    code,
    message,
    status: error.status,
  };
}
