import NodeCache from 'node-cache';

// In-memory cache instances for different API endpoints
const caches = {
  apod: new NodeCache({ stdTTL: 3600 }), // 1 hour
  mars: new NodeCache({ stdTTL: 7200 }), // 2 hours  
  neo: new NodeCache({ stdTTL: 3600 }), // 1 hour
  search: new NodeCache({ stdTTL: 7200 }), // 2 hours
};

// Cache middleware factory
export const cacheMiddleware = (cacheType) => {
  return (req, res, next) => {
    // Don't cache errors
    if (res.headersSent) return next();
    
    const cache = caches[cacheType];
    if (!cache) return next();

    // Generate cache key from request
    const key = `${req.originalUrl || req.url}`;
    
    // Check if we have cached data
    const cachedData = cache.get(key);
    if (cachedData) {
      console.log(`Cache hit for: ${key}`);
      return res.json(cachedData);
    }

    // Store the original res.json function
    const originalJson = res.json.bind(res);

    // Override res.json to cache successful responses
    res.json = function(data) {
      // Only cache successful responses
      if (res.statusCode === 200) {
        cache.set(key, data);
        console.log(`Cached: ${key}`);
      }
      return originalJson(data);
    };

    next();
  };
};

// Function to clear cache (useful for testing)
export const clearCache = (cacheType) => {
  if (cacheType && caches[cacheType]) {
    caches[cacheType].flushAll();
  } else {
    Object.values(caches).forEach(cache => cache.flushAll());
  }
};

// Get cache stats
export const getCacheStats = () => {
  const stats = {};
  Object.entries(caches).forEach(([name, cache]) => {
    stats[name] = {
      keys: cache.keys().length,
      hits: cache.getStats().hits,
      misses: cache.getStats().misses,
      hitRate: cache.getStats().hits / (cache.getStats().hits + cache.getStats().misses) || 0
    };
  });
  return stats;
};