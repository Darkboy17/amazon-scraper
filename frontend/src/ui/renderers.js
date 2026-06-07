import {
  formatTimestamp,
  renderStars,
  updateResultsCount,
  updateTimeTaken,
} from '../utils.js';
import { escapeHTML } from './messages.js';

export function formatDuration(durationMs) {
  return `${(Number(durationMs || 0) / 1000).toFixed(2)}s`;
}

/**
 * Renders scrape result cards while preserving the existing CSS class contract.
 */
export function renderProducts(elements, products) {
  if (!products.length) {
    elements.resultsDiv.classList.add('results-empty');
    elements.resultsDiv.innerHTML = '<p class="message error">No products found.</p>';
    return;
  }

  elements.resultsDiv.classList.remove('results-empty');
  elements.resultsDiv.innerHTML = products.map((product) => {
    const title = escapeHTML(product.title || 'Untitled product');
    const reviews = escapeHTML(product.reviews || 'N/A');
    const reviewsLabel = product.reviews && product.reviews !== 'N/A'
      ? `${reviews} reviews`
      : 'No review count found';
    const image = product.image && product.image !== 'N/A' ? product.image : '';

    return `
      <article class="product">
        <h3>${title}</h3>
        <div class="rating-container">
          <span class="rating">${renderStars(product.rating)}</span>
        </div>
        <div class="product-meta">
            <span class="reviews">${reviewsLabel}</span>
        </div>
        <div class="image-container">
          ${image ? `<img src="${escapeHTML(image)}" alt="${title}" loading="lazy" />` : '<div class="image-placeholder">No image</div>'}
        </div>
      </article>
    `;
  }).join('');
}

export function renderRecentRuns(elements, runs) {
  if (!runs.length) {
    elements.recentRuns.innerHTML = '<p class="muted">No saved runs yet.</p>';
    return;
  }

  elements.recentRuns.innerHTML = runs.map((run) => `
    <div class="run-row" data-scrape-id="${escapeHTML(run.id)}" role="button" tabindex="0" aria-label="Load ${escapeHTML(run.keyword || 'scrape')} scrape">
      <div>
        <strong>${escapeHTML(run.keyword || 'Untitled')}</strong>
        <span>${formatTimestamp(run.createdAt)}</span>
      </div>
      <div>
        <strong>${run.resultCount || 0}</strong>
        <span>${run.useProxy ? 'Proxy' : 'Direct'}</span>
      </div>
    </div>
  `).join('');
}

export function markSelectedRun(elements, scrapeId) {
  elements.recentRuns.querySelectorAll('.run-row').forEach((row) => {
    row.classList.toggle('active', row.dataset.scrapeId === scrapeId);
  });
}

export function renderResultMetrics(elements, products, duration) {
  updateResultsCount(elements.itemCount, elements.resultsCount, products.length);
  updateTimeTaken(elements.timeTaken, duration);
  elements.lastResultCount.textContent = String(products.length);
  elements.lastDuration.textContent = `${duration}s`;
}
