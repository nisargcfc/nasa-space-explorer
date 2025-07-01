import express from 'express';
import nasaService from '../services/nasaService.js';
import { cacheMiddleware } from '../middleware/cache.js';

const router = express.Router();

// Get Near Earth Objects for a date range
router.get('/', cacheMiddleware('neo'), async (req, res, next) => {
  try {
    const { start_date, end_date } = req.query;
    
    // Default to today and 7 days from now if not provided
    const today = new Date();
    const weekFromNow = new Date();
    weekFromNow.setDate(today.getDate() + 7);
    
    const startDate = start_date || today.toISOString().split('T')[0];
    const endDate = end_date || weekFromNow.toISOString().split('T')[0];
    
    // Validate date format
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(startDate) || !dateRegex.test(endDate)) {
      return res.status(400).json({
        error: 'Invalid date format. Use YYYY-MM-DD'
      });
    }
    
    // NASA API only allows 7 days maximum
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end - start);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays > 7) {
      return res.status(400).json({
        error: 'Date range cannot exceed 7 days'
      });
    }
    
    const data = await nasaService.getNEO(startDate, endDate);
    
    // Process and enhance the data
    const processedData = {
      element_count: data.element_count,
      links: data.links,
      start_date: startDate,
      end_date: endDate,
      asteroids_by_date: {},
      potentially_hazardous_count: 0,
      closest_approach: null,
      largest_asteroid: null
    };
    
    // Process each date's asteroids
    Object.entries(data.near_earth_objects).forEach(([date, asteroids]) => {
      processedData.asteroids_by_date[date] = asteroids.map(asteroid => {
        const diameter = asteroid.estimated_diameter.meters;
        const closeApproach = asteroid.close_approach_data[0];
        
        // Track potentially hazardous
        if (asteroid.is_potentially_hazardous_asteroid) {
          processedData.potentially_hazardous_count++;
        }
        
        // Track closest approach
        if (!processedData.closest_approach || 
            parseFloat(closeApproach.miss_distance.kilometers) < 
            parseFloat(processedData.closest_approach.miss_distance.kilometers)) {
          processedData.closest_approach = {
            name: asteroid.name,
            date: closeApproach.close_approach_date_full,
            miss_distance: closeApproach.miss_distance,
            velocity: closeApproach.relative_velocity
          };
        }
        
        // Track largest asteroid
        if (!processedData.largest_asteroid || 
            diameter.estimated_diameter_max > 
            processedData.largest_asteroid.diameter) {
          processedData.largest_asteroid = {
            name: asteroid.name,
            diameter: diameter.estimated_diameter_max,
            is_hazardous: asteroid.is_potentially_hazardous_asteroid
          };
        }
        
        return {
          id: asteroid.id,
          name: asteroid.name,
          nasa_jpl_url: asteroid.nasa_jpl_url,
          is_potentially_hazardous: asteroid.is_potentially_hazardous_asteroid,
          diameter_meters: {
            min: diameter.estimated_diameter_min,
            max: diameter.estimated_diameter_max
          },
          close_approach: {
            date: closeApproach.close_approach_date_full,
            miss_distance_km: parseFloat(closeApproach.miss_distance.kilometers),
            velocity_kmh: parseFloat(closeApproach.relative_velocity.kilometers_per_hour)
          }
        };
      });
    });
    
    res.json(processedData);
  } catch (error) {
    next(error);
  }
});

// Get details for a specific asteroid
router.get('/:asteroidId', cacheMiddleware('neo'), async (req, res, next) => {
  try {
    const { asteroidId } = req.params;
    
    if (!asteroidId || isNaN(asteroidId)) {
      return res.status(400).json({
        error: 'Invalid asteroid ID'
      });
    }
    
    const data = await nasaService.getAsteroidById(asteroidId);
    res.json(data);
  } catch (error) {
    next(error);
  }
});

export default router;