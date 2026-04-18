
/* This file contains utility functions for the Amazon scraper application. */





// this function fetches the account information from ScraperAPI and updates the UI
// with the number of requests left and cost per request.
export async function fetchAccountInfo(infoElement) {

    try {
        const response = await fetch("http://localhost:3000/api/scraperapi/account");
        const data = await response.json();

        // sometimes the request limit is 5000 or 1000, so we need to set it to 1000 for the calculation
        const requestLimit = data.requestLimit === 5000 ? 1000 : data.requestLimit;
        
        // get the request count from the response
        const requestCount = data.requestCount;

        // set the cost per request to 5, as per the ScraperAPI documentation
        const costPerRequest = 5;

        // check if there is an error in the response
        if (data.error) {
            throw new Error(data.error);
        }

        // calculate the requests left by subtracting the request count from the request limit and dividing by the cost per request
        const requestsLeft = requestLimit - (requestCount / costPerRequest);

        // update the infoElement with the requests left and cost per request
        updateRequestInfo(infoElement, requestsLeft, costPerRequest);

        // show the infoElement
        infoElement.classList.remove('hidden');

    } catch (error) {

        // handle the error and show a message to the user
        console.error('Error fetching account info:', error.message);

    }
}


// this function renders the star rating based on the rating value passed to it.
export function renderStars(rating) {

    const numericRating = parseFloat(rating);

    if (isNaN(numericRating)) return 'N/A';

    const fullStars = Math.floor(numericRating);
    const hasHalfStar = numericRating % 1 >= 0.5;
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

    return `
      <div class="star-rating">
        <div class="stars">
          <div class="stars-inner" style="width: ${numericRating * 20}%"></div>
        </div>
      </div>
    `;
}



// this function updates the results count in the UI based on the count passed to it.
export function updateResultsCount(itemCount, resultsCount, count) {

    itemCount.textContent = '';

    if (count > 0) {
        resultsCount.classList.remove('hidden');

    } else {
        resultsCount.classList.add('hidden');

    }

    itemCount.textContent = count !== 0 ? `${count === 1 ? `Showing ${count} item` : `Showing ${count} items`}` : '';

}



// this function updates the time taken for the scraping process in the UI based on the time passed to it.
export function updateTimeTaken(timeTaken, time) {
    timeTaken.textContent = `Scraping finished in ${time} seconds`;
}


// this function resets the timer and starts it again.
export function resetAndStartTimer(scrapingStatus, resultsDiv, timerElement, seconds, timerInterval) {
    // Clear any existing timer interval
    if (timerInterval) {
        clearInterval(timerInterval);
    }

    // Reset and show timer
    seconds = 0;
    timerElement.textContent = '(0.00s)';
    scrapingStatus.classList.remove('hidden');
    resultsDiv.innerHTML = '';

    // Start timer
    let milliseconds = 0;
    timerInterval = setInterval(() => {
        milliseconds += 100;
        const secondsDecimal = (milliseconds / 1000).toFixed(2);
        timerElement.textContent = `(${secondsDecimal}s)`;
    }, 100);

    return timerInterval; // Return the new interval ID
}



// this function updates the request info in the UI based on the requests left and cost per request passed to it.
export function updateRequestInfo(infoElement, requestsLeft, costPerRequest) {

    infoElement.textContent = '';

    infoElement.textContent = `You have ${requestsLeft * costPerRequest} credits left in this billing period. 
    With those remaining credits, you can make ${requestsLeft} requests (scrapes) this month.`;

}


// this function checks if the proxy is available and disables the toggle if not.
export async function checkProxyAvailability(proxyToggle) {
    try {
      const response = await fetch('http://localhost:3000/api/check-proxy');
      const data = await response.json();
  
      if (!data.proxyAvailable) {
        proxyToggle.classList.add('hidden');
      }

    } catch (error) {
      console.error('Error checking proxy availability:', error.message);
    }
  }