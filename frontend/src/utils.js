export async function fetchAccountInfo(infoElement, apiBaseUrl, getToken) {
  try {
    const token = await getToken();
    const response = await fetch(`${apiBaseUrl}/api/scraperapi/account`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    const data = await response.json();

    if (!response.ok || data.error) {
      throw new Error(data.error || 'Failed to fetch ScraperAPI account details');
    }

    const requestLimit = data.requestLimit === 5000 ? 1000 : data.requestLimit;
    const requestCount = data.requestCount || 0;
    const costPerRequest = 5;
    const requestsLeft = Math.max(0, requestLimit - (requestCount / costPerRequest));

    updateRequestInfo(infoElement, requestsLeft, costPerRequest);
    infoElement.classList.remove('hidden');
  } catch (error) {
    infoElement.textContent = error.message;
    infoElement.classList.remove('hidden');
    infoElement.classList.remove('success');
    infoElement.classList.add('error');
  }
}

/**
 * Converts numeric product ratings into the layered-star markup used by CSS.
 */
export function renderStars(rating) {
  const numericRating = parseFloat(rating);

  if (Number.isNaN(numericRating)) {
    return '';
  }

  const ratingWidth = Math.min(100, Math.max(0, numericRating * 20));

  return `
    <div class="star-rating" aria-label="${numericRating.toFixed(1)} out of 5">
      <div class="stars">
        <div class="stars-inner" style="width: ${ratingWidth}%"></div>
      </div>
    </div>
  `;
}

/**
 * Keeps the result-count badge hidden when no products are present.
 */
export function updateResultsCount(itemCount, resultsCount, count) {
  if (count > 0) {
    resultsCount.classList.remove('hidden');
  } else {
    resultsCount.classList.add('hidden');
  }

  itemCount.textContent = count === 1 ? '1 item' : `${count} items`;
}

export function updateTimeTaken(timeTaken, time) {
  timeTaken.textContent = `${time}s`;
}

/**
 * Resets result output and starts the user-visible scrape timer.
 */
export function resetAndStartTimer(scrapingStatus, resultsDiv, timerElement, timerInterval) {
  if (timerInterval) {
    clearInterval(timerInterval);
  }

  timerElement.textContent = '(0.00s)';
  scrapingStatus.classList.remove('hidden');
  resultsDiv.classList.add('results-empty');
  resultsDiv.innerHTML = 'Run in progress...';

  let milliseconds = 0;
  return setInterval(() => {
    milliseconds += 100;
    timerElement.textContent = `(${(milliseconds / 1000).toFixed(2)}s)`;
  }, 100);
}

export function updateRequestInfo(infoElement, requestsLeft, costPerRequest) {
  infoElement.classList.remove('error');
  infoElement.classList.add('success');
  infoElement.textContent = `${Math.floor(requestsLeft * costPerRequest)} credits left, about ${Math.floor(requestsLeft)} proxy runs available.`;
}

/**
 * Formats persisted scrape timestamps for compact dashboard rows.
 */
export function formatTimestamp(timestamp) {
  if (!timestamp) {
    return 'Just now';
  }

  const seconds = timestamp._seconds || timestamp.seconds;
  const date = seconds ? new Date(seconds * 1000) : new Date(timestamp);

  if (Number.isNaN(date.getTime())) {
    return 'Just now';
  }

  return new Intl.DateTimeFormat(undefined, {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
}
