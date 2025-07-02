import axios from 'axios';
import { 
  fallbackAPOD, 
  fallbackMarsPhotos, 
  fallbackNEOData, 
  fallbackSearchResults,
  fallbackRoverManifest,
  isRateLimited,
  getFallbackAPOD
} from '../utils/fallbackData.js';

class NASAService {
  constructor() {
    this.apiKey = process.env.NASA_API_KEY || 'DEMO_KEY';
    this.baseURL = 'https://api.nasa.gov';
    
    // Debug: Log which API key is being used
    console.log(`🔑 NASA Service initialized with API key: ${this.apiKey.substring(0, 8)}...`);
    
    // Create axios instance with defaults
    this.client = axios.create({
      baseURL: this.baseURL,
      timeout: 30000, // 30 seconds
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }
    });

    // Add response interceptor for error handling
    this.client.interceptors.response.use(
      response => response,
      error => {
        if (error.response) {
          // NASA API returned an error
          console.error(`NASA API Error: ${error.response.status} - ${error.response.data.msg || error.response.statusText}`);
        } else if (error.request) {
          // Request was made but no response
          console.error('NASA API: No response received');
        } else {
          console.error('NASA API: Request setup error');
        }
        throw error;
      }
    );
  }

  // Astronomy Picture of the Day
  async getAPOD(date) {
    try {
      const response = await this.client.get('/planetary/apod', {
        params: {
          api_key: this.apiKey,
          date: date,
          thumbs: true // Include video thumbnails
        }
      });
      return response.data;
    } catch (error) {
      if (isRateLimited(error)) {
        console.warn('NASA API rate limited, using fallback APOD data');
        const fallbackData = getFallbackAPOD(date);
        return { ...fallbackData, _isFallbackData: true };
      }
      throw this.handleError(error, 'APOD');
    }
  }

  // Get multiple APODs for a date range
  async getAPODRange(startDate, endDate) {
    try {
      const response = await this.client.get('/planetary/apod', {
        params: {
          api_key: this.apiKey,
          start_date: startDate,
          end_date: endDate,
          thumbs: true
        }
      });
      return response.data;
    } catch (error) {
      if (isRateLimited(error)) {
        console.warn('NASA API rate limited, using fallback APOD range data');
        
        // Generate fallback data for the requested date range
        const start = new Date(startDate);
        const end = new Date(endDate);
        const fallbackArray = [];
        
        for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
          const dateStr = d.toISOString().split('T')[0];
          const fallbackData = getFallbackAPOD(dateStr);
          fallbackArray.push({ ...fallbackData, _isFallbackData: true });
        }
        
        return fallbackArray;
      }
      throw this.handleError(error, 'APOD Range');
    }
  }

  // Mars Rover Photos
  async getMarsPhotos(sol = 1000, camera = null, rover = 'curiosity') {
    try {
      const params = {
        api_key: this.apiKey,
        sol: sol
      };
      
      if (camera) {
        params.camera = camera;
      }

      const response = await this.client.get(
        `/mars-photos/api/v1/rovers/${rover}/photos`,
        { params }
      );
      
      return response.data;
    } catch (error) {
      if (isRateLimited(error)) {
        console.warn('NASA API rate limited, using fallback Mars photos data');
        return { ...fallbackMarsPhotos, _isFallbackData: true };
      }
      throw this.handleError(error, 'Mars Photos');
    }
  }

  // Get available cameras for a rover
  async getRoverManifest(rover = 'curiosity') {
    try {
      const response = await this.client.get(
        `/mars-photos/api/v1/manifests/${rover}`,
        {
          params: { api_key: this.apiKey }
        }
      );
      return response.data;
    } catch (error) {
      if (isRateLimited(error)) {
        console.warn('NASA API rate limited, using fallback rover manifest data');
        return { ...fallbackRoverManifest, _isFallbackData: true };
      }
      throw this.handleError(error, 'Rover Manifest');
    }
  }

  // Near Earth Objects
  async getNEO(startDate, endDate) {
    try {
      // Calculate the difference in days
      const start = new Date(startDate);
      const end = new Date(endDate);
      const diffTime = Math.abs(end - start);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      // NASA NEO API has a 7-day maximum range
      if (diffDays > 7) {
        throw new Error('Date range cannot exceed 7 days');
      }
      
      const response = await this.client.get('/neo/rest/v1/feed', {
        params: {
          api_key: this.apiKey,
          start_date: startDate,
          end_date: endDate,
          detailed: true
        }
      });
      return response.data;
    } catch (error) {
      if (isRateLimited(error)) {
        console.warn('NASA API rate limited, using fallback NEO data');
        return { ...fallbackNEOData, _isFallbackData: true };
      }
      throw this.handleError(error, 'NEO');
    }
  }

  // Get specific asteroid details
  async getAsteroidById(asteroidId) {
    try {
      const response = await this.client.get(`/neo/rest/v1/neo/${asteroidId}`, {
        params: { api_key: this.apiKey }
      });
      return response.data;
    } catch (error) {
      throw this.handleError(error, 'Asteroid Details');
    }
  }

  // NASA Image and Video Library Search
  async searchImages(query, mediaType = null) {
    try {
      const params = {
        q: query,
        media_type: mediaType || 'image',
        page_size: 100
      };

      // Different base URL for images API
      const response = await axios.get('https://images-api.nasa.gov/search', {
        params,
        timeout: 30000
      });
      
      return response.data;
    } catch (error) {
      throw this.handleError(error, 'Image Search');
    }
  }

  // Get asset manifest for an image
  async getImageAssets(nasaId) {
    try {
      const response = await axios.get(
        `https://images-api.nasa.gov/asset/${nasaId}`,
        { timeout: 30000 }
      );
      return response.data;
    } catch (error) {
      throw this.handleError(error, 'Image Assets');
    }
  }

  // Error handler
  handleError(error, endpoint) {
    if (error.response) {
      // NASA API returned an error response
      const status = error.response.status;
      const message = error.response.data?.msg || error.response.data?.error_message || error.response.statusText;
      
      if (status === 429) {
        throw new Error(`NASA API rate limit exceeded. Please try again later.`);
      } else if (status === 403) {
        throw new Error(`NASA API key is invalid or missing. Please check your configuration.`);
      } else if (status === 404) {
        throw new Error(`${endpoint}: Requested data not found.`);
      } else {
        throw new Error(`${endpoint} API Error (${status}): ${message}`);
      }
    } else if (error.request) {
      throw new Error(`${endpoint}: Unable to reach NASA API. Please check your connection.`);
    } else {
      throw new Error(`${endpoint}: ${error.message}`);
    }
  }
}

// Export singleton instance
export default new NASAService();