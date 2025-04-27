import { fetchAccountInfo, renderStars, updateResultsCount, updateTimeTaken, resetAndStartTimer } from './utils';
import './style.css';

/* A listener for the DOMContentLoaded event
  This ensures that the script runs after the DOM is fully loaded
  This is important because we need to access elements in the DOM
  and we want to make sure they are available before we try to access them */
document.addEventListener('DOMContentLoaded', () => {

  // Add event listeners to various elements in the DOM
  const scrapeBtn = document.getElementById('scrapeBtn');
  const keywordInput = document.getElementById('keyword');
  const resultsDiv = document.getElementById('results');
  const scrapingStatus = document.getElementById('scrapingStatus');
  const timerElement = document.getElementById('timer');
  const proxyToggle = document.getElementById('proxyToggle');
  const resultsCount = document.getElementById('resultsCount');
  const itemCount = document.getElementById('itemCount');
  const timeTaken = document.getElementById('timeTaken');
  const infoElement = document.getElementById("requestInfo");


  // API key for ScraperAPI
  const apiKey = import.meta.env.VITE_SCRAPER_API_KEY;

  // set infoElement to hidden
  infoElement.classList.add('hidden');

  // Global variables for timer
  let startTime;
  let timerInterval;
  let seconds = 0;

  // useProxy variable to store the state of the proxy toggle
  var useProxy;

  // Proxy toggle event listener
  // This event listener will reload the page when the proxy toggle is changed
  // This is to ensure that the proxy toggle state is reflected in the UI
  // and the API request is made with the correct proxy setting
  proxyToggle.addEventListener('click', async () => {

    useProxy = proxyToggle.checked;

  });

  // listen for the scrapeBtn click event
  scrapeBtn.addEventListener('click', async () => {

    // set the useProxy variable to the state of the proxy toggle
    useProxy = proxyToggle.checked;

    // reset the infoElement and hide it
    infoElement.textContent = '';
    infoElement.classList.add('hidden');

    // reset the resultsDiv and hide the results of the scrape
    resultsCount.classList.add('hidden');

    // for measuring time taken to scrape
    startTime = performance.now();

    // Get the keyword from the input field
    const keyword = keywordInput.value.trim();

    // If keyword is empty, show an error message
    if (!keyword) {
      resultsDiv.innerHTML = '<p class="error">Please enter a keyword.</p>';
      return;
    }

    // Reset and start the timer, and update the timerInterval variable
    timerInterval = resetAndStartTimer(scrapingStatus, resultsDiv, timerElement, seconds, timerInterval)

    // Try to fetch the products from the API
    try {

      // Ensure proxyToggle exists and get its value
      const endpoint = `http://localhost:3000/api/scrape?keyword=${encodeURIComponent(keyword)}&useProxy=${useProxy}`;

      // get the results from the API
      const response = await fetch(endpoint);
      const products = await response.json();

      // if the response is not ok, throw an error
      if (products.error) {
        throw new Error(products.error);
      }

      // Check if the products array is not empty
      if (products.length > 0) {

        resultsDiv.innerHTML = products.map(product => `
          <div class="product">
          <h3>${product.title}</h3>
          <div class="rating-container">
              <span class="rating">${renderStars(product.rating)}</span>
              <span class="reviews">(${product.reviews} reviews)</span>
          </div>
          <div class="image-container">
            <img src="${product.image}" alt="${product.title}"> 
          </div>
          </div>
        `).join('');

        // Update the results count and item count
        updateResultsCount(itemCount, resultsCount, products.length);

        // Get the time taken to scrape
        const duration = ((performance.now() - startTime) / 1000).toFixed(2);

        // Update the time taken
        updateTimeTaken(timeTaken, duration);

      } else {

        // If no products are found, display a message
        resultsDiv.innerHTML = '<p class="error">No products found.</p>';

      }

    } catch (error) {

      // Handle errors and display them in the resultsDiv
      resultsDiv.innerHTML = `<p class="error">You have been Rate-Limited. 
      Please try again after a while or toggle "Use Proxy" above to continue scraping.</p>`;

    } finally {

      // clear the timer interval
      clearInterval(timerInterval);

      // hide the scraping status
      scrapingStatus.classList.add('hidden');

      // Reset keyword input
      keywordInput.innerHTML = '';

      // check if the proxyToggle is checked and if so, show the infoElement and fetch the account info
      if (proxyToggle.checked) {
        infoElement.classList.remove('hidden');
        infoElement.innerHTML = '<div id="fetchAccountStatus"><span class="spinner_variation"></span>Updating Credits Usage...</div>';
        await fetchAccountInfo(infoElement, apiKey);
      }
    }

  });

});