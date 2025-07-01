import express from 'express';
import nasaService from '../services/nasaService.js';
import { cacheMiddleware } from '../middleware/cache.js';

const router = express.Router();

// Get latest EPIC images
router.get('/', cacheMiddleware('epic'), async (req, res, next) => {
  try {
    const { date } = req.query;
    
    // If date provided, validate format
    if (date && !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      return res.status(400).json({
        error: 'Invalid date format. Use YYYY-MM-DD'
      });
    }
    
    const data = await nasaService.getEPIC(date);
    
    // If no images found
    if (!data || data.length === 0) {
      return res.json({
        message: 'No images available for this date',
        date: date || 'latest',
        images: []
      });
    }
    
    // Process and return the data
    res.json({
      date: date || data[0].date,
      image_count: data.length,
      images: data
    });
  } catch (error) {
    next(error);
  }
});

// Get available dates for EPIC images (with cache)
router.get('/dates', cacheMiddleware('epic'), async (req, res, next) => {
  try {
    const data = await nasaService.getEPICDates();
    res.json(data);
  } catch (error) {
    next(error);
  }
});

export default router;