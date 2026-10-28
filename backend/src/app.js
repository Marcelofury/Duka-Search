import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { createItem, deleteItem, listItems } from './controllers/itemController.js';
import { initTypesenseSchema } from './config/typesense.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'dukasearch-backend',
    timestamp: new Date().toISOString(),
  });
});

app.get('/api/items', listItems);
app.post('/api/items', createItem);
app.delete('/api/items/:id', deleteItem);

// Server initialization
if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, async () => {
    console.log(`🚀 DukaSearch API Server running on http://localhost:${PORT}`);
    try {
      await initTypesenseSchema();
    } catch (err) {
      console.warn('⚠️ Typesense schema initialization skipped or failed:', err.message);
    }
  });
}

export default app;
