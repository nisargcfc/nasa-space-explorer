import { useState, useEffect, useCallback } from 'react';
import { nasaAPI } from '../services/api';

// Generic hook for data fetching
const useNASAData = (fetchFunction, dependencies = []) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetchFunction();
      setData(response.data);
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'An error occurred');
      setData(null);
    } finally {
      setLoading(false);
    }
  }, dependencies);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, loading, error, refetch: fetchData };
};

// APOD Hook
export const useAPOD = (date) => {
  // Don't fetch if date is in the future (APOD started June 16, 1995)
  const today = new Date();
  const requestDate = date ? new Date(date) : today;
  const apodStartDate = new Date('1995-06-16');
  
  // Only fetch if date is valid and within range
  const shouldFetch = requestDate <= today && requestDate >= apodStartDate;
  
  return useNASAData(
    () => shouldFetch ? nasaAPI.getAPOD(date) : Promise.resolve({ data: null }),
    [date, shouldFetch]
  );
};

// APOD Range Hook
export const useAPODRange = (startDate, endDate) => {
  return useNASAData(() => nasaAPI.getAPODRange(startDate, endDate), [startDate, endDate]);
};

// Mars Photos Hook with pagination
export const useMarsPhotos = (sol = 1000, camera = null, rover = 'curiosity', page = 1) => {
  return useNASAData(
    () => nasaAPI.getMarsPhotos({ sol, camera, rover, page }),
    [sol, camera, rover, page]
  );
};

// NEO Hook
export const useNEO = (startDate, endDate) => {
  return useNASAData(() => nasaAPI.getNEO(startDate, endDate), [startDate, endDate]);
};

// EPIC Hook
export const useEPIC = (date = null) => {
  return useNASAData(() => nasaAPI.getEPIC(date), [date]);
};

// Search Hook with debouncing
export const useSearch = (query, mediaType = 'image', page = 1, delay = 500) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!query || query.trim() === '') {
      setData(null);
      return;
    }

    const timeoutId = setTimeout(async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await nasaAPI.searchImages(query, mediaType, page);
        setData(response.data);
      } catch (err) {
        setError(err.response?.data?.error || err.message);
        setData(null);
      } finally {
        setLoading(false);
      }
    }, delay);

    return () => clearTimeout(timeoutId);
  }, [query, mediaType, page, delay]);

  return { data, loading, error };
};

// Favorites Hook (using localStorage)
export const useFavorites = () => {
  const [favorites, setFavorites] = useState([]);

  useEffect(() => {
    const saved = localStorage.getItem('nasa_favorites');
    if (saved) {
      try {
        setFavorites(JSON.parse(saved));
      } catch (err) {
        console.error('Error loading favorites:', err);
      }
    }
  }, []);

  const addFavorite = useCallback((item) => {
    setFavorites(prev => {
      const newFavorites = [...prev, { ...item, savedAt: new Date().toISOString() }];
      localStorage.setItem('nasa_favorites', JSON.stringify(newFavorites));
      return newFavorites;
    });
  }, []);

  const removeFavorite = useCallback((id) => {
    setFavorites(prev => {
      const newFavorites = prev.filter(fav => fav.id !== id);
      localStorage.setItem('nasa_favorites', JSON.stringify(newFavorites));
      return newFavorites;
    });
  }, []);

  const isFavorite = useCallback((id) => {
    return favorites.some(fav => fav.id === id);
  }, [favorites]);

  return { favorites, addFavorite, removeFavorite, isFavorite };
};