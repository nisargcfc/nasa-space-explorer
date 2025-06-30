import axios from 'axios';

class NASAService {
  constructor() {
    this.apiKey = process.env.NASA_API_KEY || 'DEMO_KEY';
    this.baseURL = 'https://api.nasa.gov';
    
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
      throw this.handleError(error, 'Rover Manifest');
    }
  }

  // Near Earth Objects
  async getNEO(startDate, endDate) {
    try {
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

  // Earth Polychromatic Imaging Camera
  async getEPIC(date = null) {
    try {
      const endpoint = date 
        ? `/EPIC/api/natural/date/${date}`
        : '/EPIC/api/natural';
        
      const response = await this.client.get(endpoint, {
        params: { api_key: this.apiKey }
      });
      
      // Add full image URLs to each item
      const data = response.data;
      if (Array.isArray(data) && data.length > 0) {
        return data.map(item => ({
          ...item,
          image_url: this.getEPICImageURL(item.date, item.image)
        }));
      }
      
      return data;
    } catch (error) {
      throw this.handleError(error, 'EPIC');
    }
  }

  // Helper to construct EPIC image URLs
  getEPICImageURL(date, imageName) {
    const [year, month, day] = date.split(' ')[0].split('-');
    return `https://api.nasa.gov/EPIC/archive/natural/${year}/${month}/${day}/png/${imageName}.png?api_key=${this.apiKey}`;
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