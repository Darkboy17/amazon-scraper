/**
 * Frontend configuration lives in one module so feature code does not depend
 * directly on import.meta.env or hard-coded storage keys.
 */
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';
export const SESSION_STORAGE_KEY = 'amazonScraper.session';
export const THEME_STORAGE_KEY = 'amazonScraper.theme';
export const REFRESH_BUFFER_MS = 5 * 60 * 1000;
