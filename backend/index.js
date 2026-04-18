import express from 'express';
import axios from 'axios';
import cors from 'cors';
import { JSDOM } from 'jsdom';
import 'dotenv/config';

// initialize express app
const app = express();

//  setup CORS middleware to allow cross-origin requests
app.use(cors());

// get the port from environment variables or use 3000 as default
const PORT = process.env.PORT || 3000;

// get the ScraperAPI key from environment variables
const SCRAPER_API_KEY = process.env.SCRAPER_API_KEY;

// set the ScraperAPI URL
const SCRAPER_API_URL = 'https://api.scraperapi.com/';


// endpoint to scrape Amazon products based on a keyword and whether to use a proxy or not
app.get('/api/scrape', async (req, res) => {

  // get the keyword and useProxy from the query parameters
  const { keyword, useProxy } = req.query;

  // check if keyword is provided
  // if not, return a 400 error with a message
  if (!keyword) {
    return res.status(400).json({ error: 'Keyword is required' });
  }

  // Encode the Amazon URL (same as in your curl example)
  const amazonURL = `https://www.amazon.com/s?k=${encodeURIComponent(keyword)}`;

  // If useProxy is true, use ScraperAPI to scrape the Amazon page
  // Otherwise, use the Amazon URL directly
  const scraperAPIRequest = `${SCRAPER_API_URL}?api_key=${SCRAPER_API_KEY}&url=${encodeURIComponent(amazonURL)}&device_type=desktop`;

  // Use the ScraperAPI URL if useProxy is true, otherwise use the Amazon URL directly
  // This is the URL that will be used to make the request
  const URL = useProxy === 'true' ? scraperAPIRequest : amazonURL;

  try {

    // Make a GET request to the URL using axios
    // The headers are set to mimic a real browser request
    const response = await axios.get(URL, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120 Safari/537.36',
        'Accept-Language': 'en-US,en;q=0.9',
        'Accept-Encoding': 'gzip, deflate, br',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8',
        'Connection': 'keep-alive',
        'Referer': 'https://www.google.com/',
      },
      decompress: true, // auto-handle gzip/deflate encoding
      maxRedirects: 5,  // follow redirects up to 5 times
      validateStatus: function (status) {
        return status >= 200 && status < 400; // Resolve only if status code is less than 400
      }
    });


    // create a new JSDOM instance with the response data
    // This will parse the HTML and create a DOM structure that we can query
    const dom = new JSDOM(response.data);

    // get the document from the JSDOM instance
    // This is the same as using document.querySelector in a browser
    const document = dom.window.document;

    // initialize an empty array to store the products
    const products = [];

    // query the document for the main results container
    // This is the container that holds all the product items
    const resultsContainer = document.querySelector(
      ".s-main-slot.s-result-list.s-search-results.sg-row"
    );

    // check if the results container exists
    // If it doesn't, return a 404 error with a message
    if (!resultsContainer) {
      return res.status(404).json({ error: "No results found" });
    }

    // query the results container for all the product items
    // Each product item is a div with the data-component-type attribute set to s-search-result
    const items = resultsContainer.querySelectorAll("div[data-component-type='s-search-result']");

    // loop through each item and extract the relevant information
    // For each item, we query for the title, rating, reviews, and image
    items.forEach((item) => {

      const titleEl = item.querySelector("a h2 span");
      const title = titleEl?.textContent.trim() || "N/A";

      const ratingEl = item.querySelector("i span.a-icon-alt");
      const rating = ratingEl?.textContent.split(" ")[0] || "N/A";

      const reviewsEl = item.querySelector("a[aria-label] span.a-size-base.s-underline-text");
      const reviews = reviewsEl?.textContent.trim() || "N/A";

      const imageEl = item.querySelector("img.s-image");
      const image = imageEl?.src || "N/A";

      // update the products array with the extracted information
      products.push({
        title,
        rating,
        reviews,
        image,
      });

    });

    // send the products array as a JSON response
    res.json(products);

  } catch (error) {

    // If an error occurs, log the error message and send a 503 response with an error message
    // This could be due to network issues, invalid URL, or other reasons
    console.error("Scraping failed:", error.message);
    res.status(503).json({ error: "Failed to scrape Amazon" });

  }
});


// Optional:

// endpoint to check the ScraperAPI account usage and limits if using the proxy
app.get('/api/scraperapi/account', async (req, res) => {
  try {
    // Make a GET request to the ScraperAPI account endpoint
    const response = await axios.get(`https://api.scraperapi.com/account?api_key=${SCRAPER_API_KEY}`);
    
    // Send the account details as a JSON response
    res.json(response.data);
  } catch (error) {
    // If an error occurs, log the error message and send a 503 response with an error message
    console.error("Failed to fetch ScraperAPI account details:", error.message);
    res.status(503).json({ error: "Failed to fetch ScraperAPI account details" });
  }
});

//  endpoint to check if env file has api key for proxy
// This endpoint checks if the ScraperAPI key is set in the environment variables
app.get('/api/check-proxy', (req, res) => {
  const hasApiKey = !!process.env.SCRAPER_API_KEY; // check if api key exists
  res.json({ proxyAvailable: hasApiKey });
});

// Start the server and listen on the specified port
// Log a message to indicate the server is running
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});