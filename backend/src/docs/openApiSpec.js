/**
 * The OpenAPI document is colocated with docs concerns so route handlers stay small.
 */
export const openApiSpec = {
  openapi: '3.0.3',
  info: {
    title: 'Amazon Scraper API',
    version: '1.0.0',
    description: 'Backend API for Supabase authentication, Amazon product scraping, scrape history, and proxy status.',
  },
  servers: [
    {
      url: '/',
      description: 'Current server',
    },
  ],
  tags: [
    { name: 'System', description: 'Health, welcome, and configuration checks' },
    { name: 'Auth', description: 'Supabase-backed authentication endpoints' },
    { name: 'Users', description: 'Authenticated user workspace endpoints' },
    { name: 'Scrapes', description: 'Amazon scraping and saved scrape history' },
    { name: 'Proxy', description: 'ScraperAPI proxy status and account information' },
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
      },
    },
    schemas: {
      ErrorResponse: {
        type: 'object',
        properties: {
          error: { type: 'string', example: 'Authentication required' },
        },
      },
      Product: {
        type: 'object',
        properties: {
          title: { type: 'string', example: 'Wireless Mouse' },
          rating: { type: 'string', example: '4.5' },
          reviews: { type: 'string', example: '1,234' },
          image: { type: 'string', example: 'https://m.media-amazon.com/images/I/example.jpg' },
        },
      },
      ProxyQuota: {
        type: 'object',
        properties: {
          limit: { type: 'number', example: 10 },
          used: { type: 'number', example: 3 },
          remaining: { type: 'number', example: 7 },
        },
      },
      Scrape: {
        type: 'object',
        properties: {
          id: { type: 'string', example: '00000000-0000-0000-0000-000000000000' },
          keyword: { type: 'string', example: 'laptop stand' },
          useProxy: { type: 'boolean', example: true },
          resultCount: { type: 'number', example: 24 },
          durationMs: { type: 'number', example: 1830 },
          products: {
            type: 'array',
            items: { $ref: '#/components/schemas/Product' },
          },
          createdAt: { type: 'string', format: 'date-time' },
        },
      },
      Session: {
        type: 'object',
        properties: {
          idToken: { type: 'string' },
          refreshToken: { type: 'string' },
          expiresIn: { type: 'number', example: 3600 },
          expiresAt: { type: 'number', example: 1767225600000 },
        },
      },
    },
  },
  paths: {
    '/': {
      get: {
        tags: ['System'],
        summary: 'Styled API welcome page',
        responses: {
          200: { description: 'HTML welcome page with links to docs, health, and JSON welcome endpoints' },
        },
      },
    },
    '/api/welcome': {
      get: {
        tags: ['System'],
        summary: 'Welcome message',
        responses: {
          200: { description: 'API welcome details' },
        },
      },
    },
    '/api/health': {
      get: {
        tags: ['System'],
        summary: 'Health check',
        responses: {
          200: { description: 'Service health and backend configuration status' },
        },
      },
    },
    '/api/check-proxy': {
      get: {
        tags: ['Proxy'],
        summary: 'Check whether ScraperAPI proxy mode is configured',
        responses: {
          200: { description: 'Proxy availability' },
        },
      },
    },
    '/api/auth/sign-in': {
      post: {
        tags: ['Auth'],
        summary: 'Sign in with email and password',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['email', 'password'],
                properties: {
                  email: { type: 'string', format: 'email', example: 'user@example.com' },
                  password: { type: 'string', format: 'password', example: 'secret123' },
                },
              },
            },
          },
        },
        responses: {
          200: { description: 'Signed-in session', content: { 'application/json': { schema: { $ref: '#/components/schemas/Session' } } } },
          401: { description: 'Invalid credentials', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
        },
      },
    },
    '/api/auth/sign-up': {
      post: {
        tags: ['Auth'],
        summary: 'Create a new account',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['email', 'password'],
                properties: {
                  email: { type: 'string', format: 'email', example: 'user@example.com' },
                  password: { type: 'string', format: 'password', example: 'secret123' },
                },
              },
            },
          },
        },
        responses: {
          201: { description: 'Account created' },
          400: { description: 'Invalid sign-up request', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
          409: { description: 'Email already exists', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
        },
      },
    },
    '/api/auth/refresh': {
      post: {
        tags: ['Auth'],
        summary: 'Refresh a session',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['refreshToken'],
                properties: {
                  refreshToken: { type: 'string', example: 'refresh-token' },
                },
              },
            },
          },
        },
        responses: {
          200: { description: 'Refreshed session', content: { 'application/json': { schema: { $ref: '#/components/schemas/Session' } } } },
          401: { description: 'Invalid refresh token', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
        },
      },
    },
    '/api/users/me': {
      get: {
        tags: ['Users'],
        summary: 'Load the authenticated user workspace',
        security: [{ bearerAuth: [] }],
        responses: {
          200: { description: 'User profile, recent scrapes, and proxy quota' },
          401: { description: 'Missing or invalid token', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
        },
      },
    },
    '/api/scrapes/{id}': {
      get: {
        tags: ['Scrapes'],
        summary: 'Load a saved scrape by id',
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: {
          200: { description: 'Saved scrape', content: { 'application/json': { schema: { $ref: '#/components/schemas/Scrape' } } } },
          404: { description: 'Scrape not found', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
        },
      },
    },
    '/api/scrape': {
      get: {
        tags: ['Scrapes'],
        summary: 'Scrape Amazon products by keyword',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'keyword', in: 'query', required: true, schema: { type: 'string' }, example: 'wireless keyboard' },
          { name: 'useProxy', in: 'query', required: false, schema: { type: 'boolean' }, example: true },
        ],
        responses: {
          200: { description: 'Scraped products and saved scrape metadata' },
          400: { description: 'Missing keyword or unavailable proxy mode', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
          503: { description: 'Scrape failed', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
        },
      },
    },
    '/api/scraperapi/account': {
      get: {
        tags: ['Proxy'],
        summary: 'Fetch ScraperAPI account details',
        security: [{ bearerAuth: [] }],
        responses: {
          200: { description: 'ScraperAPI account response' },
          503: { description: 'Failed to fetch ScraperAPI account details', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
        },
      },
    },
  },
};
