import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import {
  createItem,
  deleteItem,
  getItem,
  listItems,
  updateItem,
} from './controllers/itemController.js';
import { initTypesenseSchema, typesenseClient } from './config/typesense.js';
import { searchItems } from './controllers/searchController.js';
import { requireAuth } from './middleware/auth.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(
  cors({
    origin: process.env.CORS_ORIGIN || '*',
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  }),
);
app.use(express.json({ limit: '1mb' }));

app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'dukasearch-backend',
    timestamp: new Date().toISOString(),
  });
});

app.get('/health/typesense', async (req, res) => {
  try {
    await typesenseClient.health.retrieve();
    return res.json({ status: 'ok' });
  } catch (error) {
    return res.status(503).json({
      status: 'unavailable',
      code: error.code || error.name,
      message: error.message,
    });
  }
});

app.get('/api/search', searchItems);
app.get('/api/items', listItems);
app.get('/api/items/:id', getItem);
app.post('/api/items', requireAuth, createItem);
app.put('/api/items/:id', requireAuth, updateItem);
app.patch('/api/items/:id', requireAuth, updateItem);
app.delete('/api/items/:id', requireAuth, deleteItem);

if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, async () => {
    console.log(`DukaSearch API Server running on http://localhost:${PORT}`);
    try {
      await initTypesenseSchema();
    } catch (err) {
      console.warn('Typesense schema initialization skipped or failed:', err.message);
    }
  });
}

export default app;
