// Simple in-memory rate limiter
const requestCounts = new Map();
const WINDOW_MS = 60 * 1000; // 1 minute
const MAX_REQUESTS = 30; // 30 requests per minute per IP

export const rateLimiter = (req, res, next) => {
  const ip = req.ip || req.connection.remoteAddress;
  const now = Date.now();
  
  // Clean up old entries
  for (const [key, data] of requestCounts.entries()) {
    if (now - data.firstRequest > WINDOW_MS) {
      requestCounts.delete(key);
    }
  }
  
  // Get or create request count for this IP
  let requestData = requestCounts.get(ip);
  if (!requestData) {
    requestData = { count: 0, firstRequest: now };
    requestCounts.set(ip, requestData);
  }
  
  // Check if we're within the time window
  if (now - requestData.firstRequest > WINDOW_MS) {
    requestData.count = 1;
    requestData.firstRequest = now;
  } else {
    requestData.count++;
  }
  
  // Check rate limit
  if (requestData.count > MAX_REQUESTS) {
    return res.status(429).json({
      error: 'Too many requests',
      message: 'Please slow down your requests. Try again in a minute.',
      retryAfter: Math.ceil((requestData.firstRequest + WINDOW_MS - now) / 1000)
    });
  }
  
  // Add rate limit headers
  res.setHeader('X-RateLimit-Limit', MAX_REQUESTS);
  res.setHeader('X-RateLimit-Remaining', Math.max(0, MAX_REQUESTS - requestData.count));
  res.setHeader('X-RateLimit-Reset', new Date(requestData.firstRequest + WINDOW_MS).toISOString());
  
  next();
};

// API-specific rate limiter for NASA endpoints
export const nasaRateLimiter = (req, res, next) => {
  // Be more aggressive with NASA API calls
  const MAX_NASA_REQUESTS = 10; // Only 10 NASA API calls per minute
  
  const ip = req.ip || req.connection.remoteAddress;
  const key = `nasa:${ip}`;
  const now = Date.now();
  
  let requestData = requestCounts.get(key);
  if (!requestData) {
    requestData = { count: 0, firstRequest: now };
    requestCounts.set(key, requestData);
  }
  
  if (now - requestData.firstRequest > WINDOW_MS) {
    requestData.count = 1;
    requestData.firstRequest = now;
  } else {
    requestData.count++;
  }
  
  if (requestData.count > MAX_NASA_REQUESTS) {
    console.log(`Rate limit hit for ${ip}: ${requestData.count} NASA requests`);
    return res.status(429).json({
      error: 'NASA API rate limit protection',
      message: 'Too many requests to NASA API. Please wait before trying again.',
      retryAfter: 60
    });
  }
  
  next();
};