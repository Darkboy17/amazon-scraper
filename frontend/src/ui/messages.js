/**
 * Escapes dynamic strings before inserting them into template-generated HTML.
 */
export function escapeHTML(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

export function showAuthError(elements, message) {
  showAuthMessage(elements, message, 'error');
}

export function showAuthMessage(elements, message, type = 'error') {
  elements.authError.textContent = message;
  elements.authError.classList.toggle('error', type === 'error');
  elements.authError.classList.toggle('success', type === 'success');
  elements.authError.classList.remove('hidden');
}

export function clearAuthError(elements) {
  elements.authError.textContent = '';
  elements.authError.classList.remove('success');
  elements.authError.classList.add('error');
  elements.authError.classList.add('hidden');
}
