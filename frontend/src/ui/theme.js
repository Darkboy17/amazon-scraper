import { THEME_STORAGE_KEY } from '../config/appConfig.js';

/**
 * Handles theme persistence and system-theme fallback in one UI-focused module.
 */
export function initializeTheme(elements) {
  const systemThemeQuery = window.matchMedia('(prefers-color-scheme: dark)');
  const storedTheme = localStorage.getItem(THEME_STORAGE_KEY);
  const nextTheme = storedTheme || (systemThemeQuery.matches ? 'dark' : 'light');

  applyTheme(nextTheme, elements);

  elements.themeToggle?.addEventListener('click', () => {
    const nextStoredTheme = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark';
    localStorage.setItem(THEME_STORAGE_KEY, nextStoredTheme);
    applyTheme(nextStoredTheme, elements);
  });

  systemThemeQuery.addEventListener('change', (event) => {
    if (!localStorage.getItem(THEME_STORAGE_KEY)) {
      applyTheme(event.matches ? 'dark' : 'light', elements);
    }
  });
}

function applyTheme(theme, elements) {
  const isDark = theme === 'dark';
  const normalizedTheme = isDark ? 'dark' : 'light';

  document.documentElement.dataset.theme = normalizedTheme;

  if (!elements.themeToggle) {
    return;
  }

  elements.themeToggle.setAttribute('aria-pressed', String(isDark));
  elements.themeToggle.setAttribute('aria-label', `Switch to ${isDark ? 'light' : 'dark'} mode`);
  elements.themeToggle.title = `Switch to ${isDark ? 'light' : 'dark'} mode`;

  if (elements.themeToggleText) {
    elements.themeToggleText.textContent = isDark ? 'Dark' : 'Light';
  }
}
