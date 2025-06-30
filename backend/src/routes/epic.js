import express from 'express';
import nasaService from '../services/nasaService.js';

const router = express.Router();

// Get latest EPIC images
router.get('/', async (req, res, next) => {
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

// Get available dates for EPIC images
router.get('/dates', async (req, res, next) => {
  try {
    // This endpoint would typically fetch available dates
    // For now, we'll return information about EPIC
    res.json({
      info: 'EPIC provides daily images of Earth since 2015',
      first_available: '2015-09-01',
      update_frequency: 'Daily (when operational)',
      typical_images_per_day: '12-24',
      note: 'Use /api/epic?date=YYYY-MM-DD to get images for a specific date'
    });
  } catch (error) {
    next(error);
  }
});

export default router;