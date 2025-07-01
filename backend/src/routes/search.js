import express from 'express';
import nasaService from '../services/nasaService.js';
import { cacheMiddleware } from '../middleware/cache.js';

const router = express.Router();

// Search NASA Image and Video Library
router.get('/', cacheMiddleware('search'), async (req, res, next) => {
  try {
    const { 
      q, 
      media_type = 'image',
      page = 1 
    } = req.query;
    
    // Query is required
    if (!q || q.trim() === '') {
      return res.status(400).json({
        error: 'Search query (q) is required'
      });
    }
    
    // Validate media type
    const validMediaTypes = ['image', 'video', 'audio'];
    if (!validMediaTypes.includes(media_type)) {
      return res.status(400).json({
        error: `Invalid media_type. Must be one of: ${validMediaTypes.join(', ')}`
      });
    }
    
    const data = await nasaService.searchImages(q, media_type);
    
    // Process the results
    const items = data.collection.items.map(item => {
      const { data: metadata, links } = item;
      const info = metadata[0];
      
      return {
        nasa_id: info.nasa_id,
        title: info.title,
        description: info.description,
        keywords: info.keywords,
        date_created: info.date_created,
        center: info.center,
        media_type: info.media_type,
        thumbnail: links?.find(link => link.rel === 'preview')?.href,
        location: info.location
      };
    });
    
    // Implement pagination
    const perPage = 20;
    const startIndex = (page - 1) * perPage;
    const endIndex = startIndex + perPage;
    const paginatedItems = items.slice(startIndex, endIndex);
    
    res.json({
      query: q,
      media_type,
      total_hits: data.collection.metadata.total_hits,
      page: parseInt(page),
      total_pages: Math.ceil(items.length / perPage),
      results: paginatedItems
    });
  } catch (error) {
    next(error);
  }
});

// Get asset details for a specific NASA ID
router.get('/asset/:nasaId', cacheMiddleware('search'), async (req, res, next) => {
  try {
    const { nasaId } = req.params;
    
    if (!nasaId) {
      return res.status(400).json({
        error: 'NASA ID is required'
      });
    }
    
    const data = await nasaService.getImageAssets(nasaId);
    
    // Process asset links
    const assets = data.collection.items.map(item => ({
      href: item.href,
      title: item.href.split('/').pop(),
      size: item.href.includes('~orig') ? 'original' : 
            item.href.includes('~large') ? 'large' :
            item.href.includes('~medium') ? 'medium' :
            item.href.includes('~small') ? 'small' :
            item.href.includes('~thumb') ? 'thumbnail' : 'unknown'
    }));
    
    res.json({
      nasa_id: nasaId,
      assets: assets.sort((a, b) => {
        // Sort by size priority
        const sizePriority = {
          'original': 0,
          'large': 1,
          'medium': 2,
          'small': 3,
          'thumbnail': 4,
          'unknown': 5
        };
        return sizePriority[a.size] - sizePriority[b.size];
      })
    });
  } catch (error) {
    next(error);
  }
});

export default router;