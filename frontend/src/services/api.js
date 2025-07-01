import axios from 'axios';

// Create axios instance with base configuration
const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5001/api',
  timeout: 30000,
});

// Request interceptor to add any auth headers if needed in future
API.interceptors.request.use(
  (config) => {
    // You can add auth headers here if needed
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors globally
API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      // Server responded with error status
      console.error('API Error:', error.response.data);
      
      // You can add toast notifications here
      if (error.response.status === 429) {
        console.error('Rate limit exceeded. Please try again later.');
      } else if (error.response.status === 500) {
        console.error('Server error. Please try again later.');
      } else if (error.response.status === 404) {
        console.error('Resource not found.');
      }
    } else if (error.request) {
      // Request made but no response
      console.error('Network Error: Cannot connect to server. Please ensure the backend is running.');
    } else {
      // Request setup error
      console.error('Error:', error.message);
    }
    
    return Promise.reject(error);
  }
);

// NASA API endpoints
export const nasaAPI = {
  // APOD endpoints
  getAPOD: (date) => API.get('/apod', { params: { date } }),
  getAPODRange: (startDate, endDate) => 
    API.get('/apod/range', { params: { start_date: startDate, end_date: endDate } }),
  getRandomAPOD: () => API.get('/apod/random'),
  
  // Mars Rover endpoints
  getMarsPhotos: (params) => API.get('/mars', { params }),
  getRoverManifest: (rover) => API.get(`/mars/manifest/${rover}`),
  getRoverCameras: (rover) => API.get(`/mars/cameras/${rover}`),
  
  // NEO endpoints
  getNEO: (startDate, endDate) => 
    API.get('/neo', { params: { start_date: startDate, end_date: endDate } }),
  getAsteroidDetails: (asteroidId) => API.get(`/neo/${asteroidId}`),
  
  // EPIC endpoints
  getEPIC: (date) => API.get('/epic', { params: { date } }),
  getEPICDates: () => API.get('/epic/dates'),
  
  // Search endpoints
  searchImages: (query, mediaType = 'image', page = 1) => 
    API.get('/search', { params: { q: query, media_type: mediaType, page } }),
  getImageAssets: (nasaId) => API.get(`/search/asset/${nasaId}`),
};

export default API;