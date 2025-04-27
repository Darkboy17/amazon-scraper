
# Amazon Web Scraper

A simple full-stack application that allows users to input a keyword, scrape product information from Amazon, and display the results beautifully.

Built using **HTML, CSS, Vanilla JavaScript with Vite (Frontend)** and **Bun (Backend/API)**.

----------

## 📁 Project Structure

```
.
├── backend/       # Node.js Express server (API)
├── frontend/      # Vite.js Frontend (UI)
```

----------

## 📊 Features

-   Input a keyword and scrape product listings.
    
-   Toggle between using a proxy (**ScraperAPI**) or direct scraping.
    
-   Real-time scraping status updates and timer.
    
-   Star rating rendering for products.
    
-   API key usage monitoring (ScraperAPI credits left).
    
-   Fully responsive and modern UI.    

----------

## 🎓 Tech Stack

-   **Frontend:** Vite.js, Vanilla JS, HTML, CSS
    
-   **Backend:** Bun
    
> Note: To bypass Amazon's strict scraping policies, I have used ScraperAPI for implementing a proxy for your convenience. You may not need this, but my IP got blacklisted by Amazon after a few scrapes. So, just in case you face the same issue too, this feature is a life-saver.

----------

## 🚀 Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/Darkboy17/amazon-scraper.git
cd amazon-scraper
```

### 2. Environment Setup
> Note: This is optional. But if you face rate-limiting, you will definitely need this. So, signup for an account on www.scraperapi.com and get the API key.
> 
Create a `.env` at the root level of the backend directory and paste the following

```bash
SCRAPER_API_KEY=your_scraperapi_key
PORT=3000
```

> **Note:** If the app does not find a .env file in the backend directory with content as shown above, **"Use Proxy"** feature will not be available.

### 3. Development Mode

#### Start Backend

```bash
cd backend
npm install
npm run dev

```

#### Start Frontend

```bash
cd frontend
npm install
npm run dev

```

Frontend usually runs on `localhost:5173`, backend on `localhost:3000`.

----------

## 🚩 Important Notes
   
-   **Proxy Toggling:** Frontend allows switching between direct scraping and ScraperAPI proxy.
    
-   **ScraperAPI:** Free tier has usage limits; you must manage your API key responsibly.
    

----------


## API Endpoints

-   `GET /api/scrape?keyword=KEYWORD&useProxy=true|false`
    
    -   Scrapes product data based on keyword
        
-   `GET /api/account`
    
    -   Fetches remaining credits from ScraperAPI

----------

## 💚 Contributing

Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.

----------


## 😊 Author

Developed with ❤️ by [Kordor Pyrbot](https://github.com/Darkboy17).

Feel free to reach out on opcodegenerator@gmail.com
