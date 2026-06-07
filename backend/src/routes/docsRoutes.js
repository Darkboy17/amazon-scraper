import { Router } from 'express';
import { openApiSpec } from '../docs/openApiSpec.js';
import { getSwaggerHtml } from '../docs/swaggerHtml.js';

export const docsRoutes = Router();

docsRoutes.get('/api/docs/openapi.json', (req, res) => {
  res.json(openApiSpec);
});

docsRoutes.get('/api/docs', (req, res) => {
  res.type('html').send(getSwaggerHtml());
});

docsRoutes.get('/docs', (req, res) => {
  res.type('html').send(getSwaggerHtml());
});

docsRoutes.get('/api-docs', (req, res) => {
  res.redirect('/docs');
});
