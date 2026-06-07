/**
 * Normalizes scraped text so parser services can work with predictable strings.
 */
export function normalizeText(value) {
  return value?.replace(/\s+/g, ' ').trim() || '';
}
