import express from 'express';
import nasaService from '../services/nasaService.js';
import { cacheMiddleware } from '../middleware/cache.js';

const router = express.Router();

// Get APOD for a specific date
router.get('/', cacheMiddleware('apod'), async (req, res, next) => {
  try {
    const { date } = req.query;
    
    // Validate date format if provided
    if (date && !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      return res.status(400).json({
        error: 'Invalid date format. Use YYYY-MM-DD'
      });
    }
    
    const data = await nasaService.getAPOD(date);
    res.json(data);
  } catch (error) {
    next(error);
  }
});

// Get APOD for a date range
router.get('/range', cacheMiddleware('apod'), async (req, res, next) => {
  try {
    const { start_date, end_date } = req.query;
    
    if (!start_date || !end_date) {
      return res.status(400).json({
        error: 'Both start_date and end_date are required'
      });
    }
    
    // Validate date formats
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(start_date) || !dateRegex.test(end_date)) {
      return res.status(400).json({
        error: 'Invalid date format. Use YYYY-MM-DD'
      });
    }
    
    const data = await nasaService.getAPODRange(start_date, end_date);
    res.json(data);
  } catch (error) {
    next(error);
  }
});

// Get random APOD
router.get('/random', async (req, res, next) => {
  try {
    // APOD started on June 16, 1995
    const startDate = new Date('1995-06-16');
    const endDate = new Date();
    
    // Generate random date between start and today
    const randomTime = startDate.getTime() + Math.random() * (endDate.getTime() - startDate.getTime());
    const randomDate = new Date(randomTime);
    
    // Format as YYYY-MM-DD
    const dateString = randomDate.toISOString().split('T')[0];
    
    const data = await nasaService.getAPOD(dateString);
    res.json(data);
  } catch (error) {
    next(error);
  }
});

export default router;