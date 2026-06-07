/**
 * Browser-friendly landing page for operators who visit the API base URL.
 */
export function getWelcomeHtml() {
  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Amazon Scraper API</title>
    <style>
      :root {
        color-scheme: light;
        font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
        color: #172033;
        background: #f6f8fb;
      }

      * {
        box-sizing: border-box;
      }

      body {
        min-height: 100vh;
        margin: 0;
        display: grid;
        place-items: center;
        padding: 32px;
        background:
          radial-gradient(circle at top left, rgba(46, 125, 246, 0.16), transparent 28rem),
          linear-gradient(135deg, #ffffff 0%, #eef3fa 100%);
      }

      main {
        width: min(100%, 760px);
        padding: 48px;
        border: 1px solid #dce4ef;
        border-radius: 8px;
        background: rgba(255, 255, 255, 0.9);
        box-shadow: 0 24px 60px rgba(23, 32, 51, 0.12);
      }

      .eyebrow {
        margin: 0 0 12px;
        color: #2e7df6;
        font-size: 0.78rem;
        font-weight: 700;
        letter-spacing: 0.08em;
        text-transform: uppercase;
      }

      h1 {
        margin: 0;
        font-size: clamp(2rem, 5vw, 3.5rem);
        line-height: 1.05;
      }

      p {
        margin: 18px 0 0;
        color: #4d5b70;
        font-size: 1.08rem;
        line-height: 1.7;
      }

      nav {
        display: flex;
        flex-wrap: wrap;
        gap: 12px;
        margin-top: 32px;
      }

      a {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        min-height: 44px;
        padding: 0 18px;
        border-radius: 8px;
        color: #172033;
        border: 1px solid #ccd7e5;
        font-weight: 700;
        text-decoration: none;
        transition: transform 160ms ease, border-color 160ms ease, background 160ms ease;
      }

      a.primary {
        color: #ffffff;
        border-color: #2e7df6;
        background: #2e7df6;
      }

      a:hover {
        transform: translateY(-1px);
        border-color: #2e7df6;
      }

      .meta {
        margin-top: 28px;
        padding-top: 22px;
        border-top: 1px solid #dce4ef;
        color: #6b778a;
        font-size: 0.95rem;
      }

      @media (max-width: 560px) {
        body {
          padding: 18px;
        }

        main {
          padding: 30px 24px;
        }

        nav {
          flex-direction: column;
        }

        a {
          width: 100%;
        }
      }
    </style>
  </head>
  <body>
    <main>
      <p class="eyebrow">Express API Online</p>
      <h1>Welcome to the Amazon Scraper API</h1>
      <p>
        Use this backend for Supabase authentication, Amazon keyword scraping,
        scrape history, and ScraperAPI proxy status.
      </p>
      <nav aria-label="API links">
        <a class="primary" href="/docs">Open Swagger Docs</a>
        <a href="/api/health">Health Check</a>
        <a href="/api/welcome">JSON Welcome</a>
      </nav>
      <p class="meta">API base URL: <strong>http://localhost:3000</strong></p>
    </main>
  </body>
</html>`;
}
