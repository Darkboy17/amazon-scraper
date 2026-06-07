import { createApiClient } from './api/apiClient.js';
import { createSessionManager } from './auth/sessionManager.js';
import { API_BASE_URL } from './config/appConfig.js';
import { getAppElements } from './dom/elements.js';
import './style.css';
import { clearAuthError, escapeHTML, showAuthError, showAuthMessage } from './ui/messages.js';
import {
  formatDuration,
  markSelectedRun,
  renderProducts,
  renderRecentRuns,
  renderResultMetrics,
} from './ui/renderers.js';
import { initializeTheme } from './ui/theme.js';
import { resetAndStartTimer } from './utils.js';

document.addEventListener('DOMContentLoaded', () => {
  const elements = getAppElements();
  const apiClient = createApiClient(API_BASE_URL);
  const sessionManager = createSessionManager(apiClient, {
    onRefresh: (nextSession) => showSignedInState(nextSession.user),
    onExpired: () => {
      showSignedOutState();
      showAuthError(elements, 'Session expired. Sign in again.');
    },
  });

  let authMode = 'sign-in';
  let timerInterval;
  let proxyAvailable = false;
  let proxyQuota = null;

  initializeTheme(elements);
  bindAuthEvents();
  bindDashboardEvents();
  initializeSession();

  /**
   * Authentication events stay grouped so tab, form, and logout behavior is easy to audit.
   */
  function bindAuthEvents() {
    elements.signInTab.addEventListener('click', () => setAuthMode('sign-in'));
    elements.signUpTab.addEventListener('click', () => setAuthMode('sign-up'));

    elements.authForm.addEventListener('submit', async (event) => {
      event.preventDefault();
      clearAuthError(elements);
      elements.authSubmit.disabled = true;
      elements.authSubmit.textContent = authMode === 'sign-in' ? 'Signing in...' : 'Creating...';

      try {
        const authPath = authMode === 'sign-in' ? '/api/auth/sign-in' : '/api/auth/sign-up';
        const authSession = await apiClient.request(authPath, {
          method: 'POST',
          body: {
            email: elements.emailInput.value.trim(),
            password: elements.passwordInput.value,
          },
        });

        if (authSession.requiresSignIn || authSession.requiresEmailConfirmation) {
          setAuthMode('sign-in');
          elements.authForm.reset();
          showAuthMessage(elements, authSession.message || 'Account created. Please sign in.', 'success');
          return;
        }

        sessionManager.setSession(authSession);
        elements.authForm.reset();
        showSignedInState(authSession.user);
        await Promise.all([loadUserWorkspace(), checkProxyAvailability()]);
      } catch (error) {
        showAuthError(elements, error.message);
      } finally {
        elements.authSubmit.disabled = false;
        elements.authSubmit.textContent = authMode === 'sign-in' ? 'Sign in' : 'Create account';
      }
    });

    elements.signOutBtn.addEventListener('click', showLogoutDialog);
    elements.cancelLogoutBtn.addEventListener('click', hideLogoutDialog);
    elements.confirmLogoutBtn.addEventListener('click', () => {
      hideLogoutDialog();
      signUserOut();
    });

    elements.logoutDialog.addEventListener('click', (event) => {
      if (event.target === elements.logoutDialog) {
        hideLogoutDialog();
      }
    });

    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape' && !elements.logoutDialog.classList.contains('hidden')) {
        hideLogoutDialog();
      }
    });
  }

  /**
   * Dashboard events are separate from auth so scrape/history behavior can evolve independently.
   */
  function bindDashboardEvents() {
    elements.scrapeForm.addEventListener('submit', async (event) => {
      event.preventDefault();
      await runScrape();
    });

    elements.recentRuns.addEventListener('click', async (event) => {
      const runRow = event.target.closest('.run-row');

      if (runRow?.dataset.scrapeId) {
        await loadSavedScrape(runRow.dataset.scrapeId);
      }
    });

    elements.recentRuns.addEventListener('keydown', async (event) => {
      if (event.key !== 'Enter' && event.key !== ' ') {
        return;
      }

      const runRow = event.target.closest('.run-row');

      if (runRow?.dataset.scrapeId) {
        event.preventDefault();
        await loadSavedScrape(runRow.dataset.scrapeId);
      }
    });
  }

  async function initializeSession() {
    const session = sessionManager.getSession();

    if (!session?.refreshToken) {
      showSignedOutState();
      return;
    }

    showSignedInState(session.user);

    try {
      await sessionManager.refreshSession();
      await Promise.all([loadUserWorkspace(), checkProxyAvailability()]);
    } catch (error) {
      sessionManager.clearSession();
      showSignedOutState();
      showAuthError(elements, 'Session expired. Sign in again.');
    }
  }

  function setAuthMode(mode) {
    authMode = mode;
    const isSignIn = mode === 'sign-in';

    elements.signInTab.classList.toggle('active', isSignIn);
    elements.signUpTab.classList.toggle('active', !isSignIn);
    elements.authSubmit.textContent = isSignIn ? 'Sign in' : 'Create account';
    elements.passwordInput.autocomplete = isSignIn ? 'current-password' : 'new-password';
    clearAuthError(elements);
  }

  function showSignedOutState() {
    proxyQuota = null;
    proxyAvailable = false;
    elements.authPanel.classList.remove('hidden');
    elements.dashboard.classList.add('hidden');
    elements.resultsDiv.classList.add('results-empty');
    elements.resultsDiv.innerHTML = 'No run selected.';
    elements.recentRuns.innerHTML = '<p class="muted">No saved runs yet.</p>';
  }

  function showSignedInState(user) {
    elements.authPanel.classList.add('hidden');
    elements.dashboard.classList.remove('hidden');
    elements.userEmail.textContent = user?.email || 'Authenticated user';
  }

  function showLogoutDialog() {
    elements.logoutDialog.classList.remove('hidden');
    elements.cancelLogoutBtn.focus();
  }

  function hideLogoutDialog() {
    elements.logoutDialog.classList.add('hidden');
    elements.signOutBtn.focus();
  }

  function signUserOut() {
    sessionManager.clearSession();
    showSignedOutState();
  }

  async function loadUserWorkspace() {
    try {
      const profile = await sessionManager.authFetch('/api/users/me');
      const runs = profile.recentScrapes || [];

      renderRecentRuns(elements, runs);
      elements.totalRuns.textContent = String(profile.recentScrapeCount || runs.length);
      updateProxyQuota(profile.proxyQuota);

      if (runs[0]) {
        elements.lastResultCount.textContent = String(runs[0].resultCount || 0);
        elements.lastDuration.textContent = formatDuration(runs[0].durationMs || 0);
      }
    } catch (error) {
      elements.recentRuns.innerHTML = `<p class="message error">${escapeHTML(error.message)}</p>`;
    }
  }

  async function checkProxyAvailability() {
    try {
      const data = await apiClient.rawJson('/api/check-proxy');
      proxyAvailable = Boolean(data.proxyAvailable);
      updateProxyControl();
    } catch (error) {
      proxyAvailable = false;
      elements.proxyStatus.textContent = 'Offline';
      updateProxyControl();
    }
  }

  function updateProxyQuota(nextQuota) {
    if (nextQuota) {
      proxyQuota = {
        limit: Number(nextQuota.limit || 10),
        used: Number(nextQuota.used || 0),
        remaining: Number(nextQuota.remaining ?? 10),
      };
    }

    updateProxyControl();
  }

  function updateProxyControl() {
    if (!proxyAvailable) {
      elements.proxyToggle.checked = false;
      elements.proxyToggle.disabled = true;
      elements.proxySwitch.classList.add('disabled');
      elements.proxySwitch.title = 'Proxy scraping is unavailable.';
      elements.proxyCreditsLabel.textContent = 'Proxy unavailable';
      elements.proxyStatus.textContent = 'Unavailable';
      return;
    }

    if (!proxyQuota) {
      elements.proxyToggle.checked = false;
      elements.proxyToggle.disabled = true;
      elements.proxySwitch.classList.add('disabled');
      elements.proxySwitch.title = 'Checking proxy scrape credits.';
      elements.proxyCreditsLabel.textContent = 'Checking proxy credits';
      elements.proxyStatus.textContent = 'Checking';
      return;
    }

    const remaining = Math.max(0, Number(proxyQuota.remaining ?? proxyQuota.limit ?? 10));
    const exhausted = remaining <= 0;

    elements.proxyCreditsLabel.textContent = `${remaining} proxy ${remaining === 1 ? 'scrape' : 'scrapes'} left`;
    elements.proxyStatus.textContent = `${remaining} left`;

    if (exhausted) {
      elements.proxyToggle.checked = false;
      elements.proxyToggle.disabled = true;
      elements.proxySwitch.classList.add('disabled');
      elements.proxySwitch.title = 'You are out of proxy scrape credits.';
      return;
    }

    elements.proxyToggle.disabled = false;
    elements.proxySwitch.classList.remove('disabled');
    elements.proxySwitch.title = `${remaining} proxy ${remaining === 1 ? 'scrape' : 'scrapes'} left.`;
  }

  async function runScrape() {
    const keyword = elements.keywordInput.value.trim();

    if (!keyword) {
      elements.resultsDiv.classList.add('results-empty');
      elements.resultsDiv.innerHTML = '<p class="message error">Enter a keyword before running a scrape.</p>';
      return;
    }

    const startedAt = performance.now();
    elements.infoElement.textContent = '';
    elements.infoElement.classList.add('hidden');
    elements.resultsCount.classList.add('hidden');
    elements.scrapeBtn.disabled = true;
    elements.scrapeBtn.textContent = 'Running...';
    timerInterval = resetAndStartTimer(
      elements.scrapingStatus,
      elements.resultsDiv,
      elements.timerElement,
      timerInterval,
    );

    try {
      const useProxy = elements.proxyToggle.checked && !elements.proxyToggle.disabled;
      const payload = await sessionManager.authFetch(
        `/api/scrape?keyword=${encodeURIComponent(keyword)}&useProxy=${useProxy}`,
      );
      const products = Array.isArray(payload) ? payload : payload.products || [];
      const duration = ((performance.now() - startedAt) / 1000).toFixed(2);

      renderProducts(elements, products);
      renderResultMetrics(elements, products, duration);
      updateProxyQuota(payload.proxyQuota);

      await loadUserWorkspace();
    } catch (error) {
      elements.resultsDiv.classList.add('results-empty');
      elements.resultsDiv.innerHTML = `<p class="message error">${escapeHTML(error.message)}</p>`;
    } finally {
      clearInterval(timerInterval);
      elements.scrapingStatus.classList.add('hidden');
      elements.scrapeBtn.disabled = false;
      elements.scrapeBtn.textContent = 'Run scrape';
    }
  }

  async function loadSavedScrape(scrapeId) {
    elements.resultsDiv.classList.add('results-empty');
    elements.resultsDiv.innerHTML = 'Loading saved scrape...';
    elements.resultsCount.classList.add('hidden');

    try {
      const scrape = await sessionManager.authFetch(`/api/scrapes/${encodeURIComponent(scrapeId)}`);
      const products = Array.isArray(scrape.products) ? scrape.products : [];
      const duration = (Number(scrape.durationMs || 0) / 1000).toFixed(2);

      renderProducts(elements, products);
      renderResultMetrics(elements, products, duration);
      elements.lastResultCount.textContent = String(scrape.resultCount || products.length);
      elements.lastDuration.textContent = formatDuration(scrape.durationMs || 0);
      markSelectedRun(elements, scrapeId);
    } catch (error) {
      elements.resultsDiv.classList.add('results-empty');
      elements.resultsDiv.innerHTML = `<p class="message error">${escapeHTML(error.message)}</p>`;
    }
  }
});
