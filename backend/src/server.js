import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import compression from 'compression';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { rateLimiter } from './middleware/rateLimiter.js';
import { cacheMiddleware, getCacheStats } from './middleware/cache.js';

// Import routes
import apodRouter from './routes/apod.js';
import marsRouter from './routes/mars.js';
import neoRouter from './routes/neo.js';
import searchRouter from './routes/search.js';

// Configure environment variables
dotenv.config();

// Get directory name in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Create Express app
const app = express();
const PORT = process.env.PORT || 5001;

// Middleware
app.use(helmet()); // Security headers

// Simplified CORS configuration for Railway deployment
const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:5173', 
  'https://nasa-space-explorer-frontend.vercel.app',
  'https://nasa-space-explorer-frontend-6p47x1aod.vercel.app',
  'https://nasa-space-explorer-frontend-cyh0rsjui.vercel.app',
  'https://nasa-space-explorer-frontend-ibtdt9vmp.vercel.app'
];

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    
    console.log('CORS blocked origin:', origin);
    const msg = 'The CORS policy for this site does not allow access from the specified origin.';
    return callback(new Error(msg), false);
  },
  credentials: true,
  optionsSuccessStatus: 200,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Origin', 'X-Requested-With', 'Content-Type', 'Accept', 'Authorization']
}));
app.use(compression()); // Compress responses
app.use(express.json()); // Parse JSON bodies
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded bodies
app.use(morgan('dev')); // Log requests

// Add general rate limiting middleware
app.use(rateLimiter);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV 
  });
});

// Debug endpoint to check API key (for development only)
app.get('/debug/api-key', (req, res) => {
  const apiKey = process.env.NASA_API_KEY || 'DEMO_KEY';
  res.json({ 
    apiKey: apiKey.substring(0, 8) + '...',
    usingDemo: apiKey === 'DEMO_KEY',
    environment: process.env.NODE_ENV
  });
});

// Cache stats endpoint
app.get('/api/cache/stats', (req, res) => {
  try {
    const stats = getCacheStats();
    res.json(stats);
  } catch (error) {
    res.json({ message: 'Cache stats not available', error: error.message });
  }
});

// API Routes
app.use('/api/apod', apodRouter);
app.use('/api/mars', marsRouter);
app.use('/api/neo', neoRouter);
app.use('/api/search', searchRouter);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ 
    error: 'Not Found', 
    message: `Cannot ${req.method} ${req.url}` 
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Error:', err);
  
  // Don't leak error details in production
  const isDev = process.env.NODE_ENV === 'development';
  
  res.status(err.status || 500).json({
    error: err.message || 'Internal Server Error',
    ...(isDev && { stack: err.stack }),
    timestamp: new Date().toISOString()
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`
🚀 NASA Space Explorer Backend
📡 Server running on http://localhost:${PORT}
🌍 Environment: ${process.env.NODE_ENV}
🔑 NASA API Key: ${process.env.NASA_API_KEY ? `Configured ✓ (${process.env.NASA_API_KEY.substring(0, 8)}...)` : 'Missing ✗'}
  `);
});


