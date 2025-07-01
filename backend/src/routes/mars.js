import express from 'express';
import nasaService from '../services/nasaService.js';
import { cacheMiddleware } from '../middleware/cache.js';

const router = express.Router();

// Get Mars rover photos
router.get('/', cacheMiddleware('mars'), async (req, res, next) => {
  try {
    const { 
      sol = 1000, 
      camera = null, 
      rover = 'curiosity',
      page = 1 
    } = req.query;
    
    // Validate inputs
    if (isNaN(sol) || sol < 0) {
      return res.status(400).json({
        error: 'Invalid sol value. Must be a non-negative number.'
      });
    }
    
    const validRovers = ['curiosity', 'opportunity', 'spirit', 'perseverance'];
    if (!validRovers.includes(rover.toLowerCase())) {
      return res.status(400).json({
        error: `Invalid rover. Must be one of: ${validRovers.join(', ')}`
      });
    }
    
    const data = await nasaService.getMarsPhotos(sol, camera, rover);
    
    // Implement simple pagination
    const perPage = 25;
    const startIndex = (page - 1) * perPage;
    const endIndex = startIndex + perPage;
    const paginatedPhotos = data.photos.slice(startIndex, endIndex);
    
    res.json({
      photos: paginatedPhotos,
      total: data.photos.length,
      page: parseInt(page),
      totalPages: Math.ceil(data.photos.length / perPage),
      sol: parseInt(sol),
      rover: rover,
      camera: camera
    });
  } catch (error) {
    next(error);
  }
});

// Get rover manifest (mission details and available sols)
router.get('/manifest/:rover', cacheMiddleware('mars'), async (req, res, next) => {
  try {
    const { rover } = req.params;
    
    const validRovers = ['curiosity', 'opportunity', 'spirit', 'perseverance'];
    if (!validRovers.includes(rover.toLowerCase())) {
      return res.status(400).json({
        error: `Invalid rover. Must be one of: ${validRovers.join(', ')}`
      });
    }
    
    const data = await nasaService.getRoverManifest(rover);
    res.json(data);
  } catch (error) {
    next(error);
  }
});

// Get available cameras for a rover (no cache)
router.get('/cameras/:rover', async (req, res, next) => {
  try {
    const { rover } = req.params;
    
    // Camera abbreviations and full names
    const roverCameras = {
      curiosity: [
        { abbrev: 'FHAZ', name: 'Front Hazard Avoidance Camera' },
        { abbrev: 'RHAZ', name: 'Rear Hazard Avoidance Camera' },
        { abbrev: 'MAST', name: 'Mast Camera' },
        { abbrev: 'CHEMCAM', name: 'Chemistry and Camera Complex' },
        { abbrev: 'MAHLI', name: 'Mars Hand Lens Imager' },
        { abbrev: 'MARDI', name: 'Mars Descent Imager' },
        { abbrev: 'NAVCAM', name: 'Navigation Camera' }
      ],
      opportunity: [
        { abbrev: 'FHAZ', name: 'Front Hazard Avoidance Camera' },
        { abbrev: 'RHAZ', name: 'Rear Hazard Avoidance Camera' },
        { abbrev: 'NAVCAM', name: 'Navigation Camera' },
        { abbrev: 'PANCAM', name: 'Panoramic Camera' },
        { abbrev: 'MINITES', name: 'Miniature Thermal Emission Spectrometer' }
      ],
      spirit: [
        { abbrev: 'FHAZ', name: 'Front Hazard Avoidance Camera' },
        { abbrev: 'RHAZ', name: 'Rear Hazard Avoidance Camera' },
        { abbrev: 'NAVCAM', name: 'Navigation Camera' },
        { abbrev: 'PANCAM', name: 'Panoramic Camera' },
        { abbrev: 'MINITES', name: 'Miniature Thermal Emission Spectrometer' }
      ],
      perseverance: [
        { abbrev: 'EDL_RUCAM', name: 'Rover Up-Look Camera' },
        { abbrev: 'EDL_RDCAM', name: 'Rover Down-Look Camera' },
        { abbrev: 'EDL_DDCAM', name: 'Descent Stage Down-Look Camera' },
        { abbrev: 'EDL_PUCAM1', name: 'Parachute Up-Look Camera A' },
        { abbrev: 'EDL_PUCAM2', name: 'Parachute Up-Look Camera B' },
        { abbrev: 'NAVCAM_LEFT', name: 'Navigation Camera - Left' },
        { abbrev: 'NAVCAM_RIGHT', name: 'Navigation Camera - Right' },
        { abbrev: 'MCZ_LEFT', name: 'Mast Camera Zoom - Left' },
        { abbrev: 'MCZ_RIGHT', name: 'Mast Camera Zoom - Right' },
        { abbrev: 'FRONT_HAZCAM_LEFT_A', name: 'Front Hazard Avoidance Camera - Left' },
        { abbrev: 'FRONT_HAZCAM_RIGHT_A', name: 'Front Hazard Avoidance Camera - Right' },
        { abbrev: 'REAR_HAZCAM_LEFT', name: 'Rear Hazard Avoidance Camera - Left' },
        { abbrev: 'REAR_HAZCAM_RIGHT', name: 'Rear Hazard Avoidance Camera - Right' }
      ]
    };
    
    const cameras = roverCameras[rover.toLowerCase()];
    if (!cameras) {
      return res.status(400).json({
        error: 'Invalid rover name'
      });
    }
    
    res.json({ rover, cameras });
  } catch (error) {
    next(error);
  }
});

export default router;