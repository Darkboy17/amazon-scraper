import axios from 'axios';
import { JSDOM } from 'jsdom';
import { SCRAPER_API_KEY, SCRAPER_API_URL } from '../config/env.js';
import { normalizeText } from '../utils/text.js';

function extractRating(item) {
  const ratingText = normalizeText(
    item.querySelector('i span.a-icon-alt')?.textContent
    || item.querySelector('span.a-icon-alt')?.textContent,
  );
  const match = ratingText.match(/([0-5](?:\.\d+)?)\s*out of/i);

  return match?.[1] || ratingText.split(' ')[0] || 'N/A';
}

function parseReviewCount(text) {
  const normalized = normalizeText(text);
  const labelledMatch = normalized.match(/([\d,.]+)\s*(?:ratings?|reviews?)/i);

  if (labelledMatch) {
    return labelledMatch[1];
  }

  const bareNumber = normalized.match(/^\(?([\d,.]+)\)?$/);

  if (bareNumber) {
    return bareNumber[1];
  }

  return null;
}

function extractReviewCount(item) {
  const reviewSelectors = [
    'a[href*="customerReviews"] span.a-size-base',
    'a[href*="#customerReviews"] span.a-size-base',
    'a[href*="/product-reviews/"] span.a-size-base',
    'a[aria-label*="ratings"] span',
    'a[aria-label*="reviews"] span',
    'span.a-size-base.s-underline-text',
  ];

  for (const selector of reviewSelectors) {
    const count = parseReviewCount(item.querySelector(selector)?.textContent);

    if (count) {
      return count;
    }
  }

  const ariaLabelElements = Array.from(item.querySelectorAll('[aria-label]'));

  for (const element of ariaLabelElements) {
    const ariaLabel = element.getAttribute('aria-label') || '';

    if (/out of 5/i.test(ariaLabel)) {
      continue;
    }

    const count = parseReviewCount(ariaLabel);

    if (count) {
      return count;
    }
  }

  return 'N/A';
}

function buildAmazonUrl(keyword) {
  return `https://www.amazon.com/s?k=${encodeURIComponent(keyword)}`;
}

function buildScraperApiUrl(keyword) {
  const amazonURL = buildAmazonUrl(keyword);
  return `${SCRAPER_API_URL}?api_key=${SCRAPER_API_KEY}&url=${encodeURIComponent(amazonURL)}&device_type=desktop`;
}

function parseProducts(html) {
  const dom = new JSDOM(html);
  const document = dom.window.document;
  const products = [];
  const resultsContainer = document.querySelector(
    '.s-main-slot.s-result-list.s-search-results.sg-row',
  );

  if (!resultsContainer) {
    return null;
  }

  const items = resultsContainer.querySelectorAll("div[data-component-type='s-search-result']");

  items.forEach((item) => {
    const titleEl = item.querySelector('a h2 span');
    const imageEl = item.querySelector('img.s-image');

    products.push({
      title: titleEl?.textContent.trim() || 'N/A',
      rating: extractRating(item),
      reviews: extractReviewCount(item),
      image: imageEl?.src || 'N/A',
    });
  });

  return products;
}

/**
 * Fetches and parses Amazon search results, optionally through ScraperAPI.
 */
export async function scrapeAmazonProducts(keyword, shouldUseProxy) {
  const url = shouldUseProxy ? buildScraperApiUrl(keyword) : buildAmazonUrl(keyword);
  const response = await axios.get(url, {
    headers: {
      'User-Agent':
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120 Safari/537.36',
      'Accept-Language': 'en-US,en;q=0.9',
      'Accept-Encoding': 'gzip, deflate, br',
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8',
      'Connection': 'keep-alive',
      'Referer': 'https://www.google.com/',
    },
    decompress: true,
    maxRedirects: 5,
    validateStatus(status) {
      return status >= 200 && status < 400;
    },
  });

  return parseProducts(response.data);
}
