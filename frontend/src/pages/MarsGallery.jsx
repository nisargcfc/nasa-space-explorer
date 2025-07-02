import React, { useState, useEffect, useCallback } from 'react';
import {
  Container,
  Grid,
  Card,
  CardMedia,
  CardContent,
  Typography,
  Box,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Chip,
  Button,
  Dialog,
  DialogContent,
  IconButton,
  Skeleton,
  Paper,
  ToggleButton,
  ToggleButtonGroup,
} from '@mui/material';
import {
  ViewModule,
  ViewList,
  Close,
  CameraAlt,
  CalendarToday,
  Rocket,
  FilterList,
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';
import { useMarsPhotos } from '../hooks/useNASAData';
import { nasaAPI } from '../services/api';
import FallbackNotice from '../components/common/FallbackNotice';

const MarsGallery = () => {
  const [sol, setSol] = useState(1000);
  const [selectedRover, setSelectedRover] = useState('curiosity');
  const [selectedCamera, setSelectedCamera] = useState('');
  const [page, setPage] = useState(1);
  const [allPhotos, setAllPhotos] = useState([]);
  const [selectedPhoto, setSelectedPhoto] = useState(null);
  const [viewMode, setViewMode] = useState('grid');
  const [roverManifest, setRoverManifest] = useState(null);
  const [usingFallbackData, setUsingFallbackData] = useState(false);

  const { data, loading } = useMarsPhotos(sol, selectedCamera || null, selectedRover, page);

  // Rover cameras configuration
  const roverCameras = {
    curiosity: [
      { value: '', label: 'All Cameras' },
      { value: 'FHAZ', label: 'Front Hazard Avoidance' },
      { value: 'RHAZ', label: 'Rear Hazard Avoidance' },
      { value: 'MAST', label: 'Mast Camera' },
      { value: 'CHEMCAM', label: 'Chemistry Camera' },
      { value: 'MAHLI', label: 'Hand Lens Imager' },
      { value: 'MARDI', label: 'Descent Imager' },
      { value: 'NAVCAM', label: 'Navigation Camera' },
    ],
    perseverance: [
      { value: '', label: 'All Cameras' },
      { value: 'NAVCAM_LEFT', label: 'Navigation - Left' },
      { value: 'NAVCAM_RIGHT', label: 'Navigation - Right' },
      { value: 'MCZ_LEFT', label: 'Mast Zoom - Left' },
      { value: 'MCZ_RIGHT', label: 'Mast Zoom - Right' },
      { value: 'FRONT_HAZCAM_LEFT_A', label: 'Front Hazard - Left' },
      { value: 'FRONT_HAZCAM_RIGHT_A', label: 'Front Hazard - Right' },
    ],
  };

  useEffect(() => {
    // Fetch rover manifest for max sol info
    const fetchManifest = async () => {
      try {
        const response = await nasaAPI.getRoverManifest(selectedRover);
        setRoverManifest(response.data.photo_manifest);
      } catch (error) {
        console.error('Error fetching manifest:', error);
      }
    };
    fetchManifest();
  }, [selectedRover]);

  useEffect(() => {
    if (data?.photos) {
      if (page === 1) {
        setAllPhotos(data.photos);
      } else {
        setAllPhotos(prev => [...prev, ...data.photos]);
      }
    }
  }, [data, page]);

  useEffect(() => {
    // Check for fallback data
    setUsingFallbackData(data?._isFallbackData || false);
  }, [data]);

  const handleFilterChange = () => {
    setPage(1);
    setAllPhotos([]);
  };

  const loadMore = () => {
    if (data?.totalPages > page) {
      setPage(prev => prev + 1);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
      {/* Fallback Notice */}
      <FallbackNotice show={usingFallbackData} />
      
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Box sx={{ mb: 4, textAlign: 'center' }}>
          <Typography variant="h2" component="h1" gutterBottom fontWeight="bold">
            Mars Rover Photos
          </Typography>
          <Typography variant="h5" color="text.secondary">
            Explore the Martian surface through the eyes of NASA's rovers
          </Typography>
        </Box>
      </motion.div>

      {/* Filters */}
      <Paper sx={{ p: 3, mb: 4 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={6} md={3}>
            <FormControl fullWidth>
              <InputLabel>Rover</InputLabel>
              <Select
                value={selectedRover}
                label="Rover"
                onChange={(e) => {
                  setSelectedRover(e.target.value);
                  setSelectedCamera('');
                  handleFilterChange();
                }}
              >
                <MenuItem value="curiosity">Curiosity</MenuItem>
                <MenuItem value="perseverance">Perseverance</MenuItem>
                <MenuItem value="opportunity">Opportunity</MenuItem>
                <MenuItem value="spirit">Spirit</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <TextField
              fullWidth
              label="Sol (Martian Day)"
              type="number"
              value={sol}
              onChange={(e) => setSol(e.target.value)}
              onBlur={handleFilterChange}
              InputProps={{
                inputProps: { 
                  min: 0, 
                  max: roverManifest?.max_sol || 5000 
                }
              }}
              helperText={roverManifest ? `Max: ${roverManifest.max_sol}` : ''}
            />
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <FormControl fullWidth>
              <InputLabel>Camera</InputLabel>
              <Select
                value={selectedCamera}
                label="Camera"
                onChange={(e) => {
                  setSelectedCamera(e.target.value);
                  handleFilterChange();
                }}
              >
                {(roverCameras[selectedRover] || roverCameras.curiosity).map(cam => (
                  <MenuItem key={cam.value} value={cam.value}>
                    {cam.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Box display="flex" justifyContent="space-between" alignItems="center">
              <ToggleButtonGroup
                value={viewMode}
                exclusive
                onChange={(e, newMode) => newMode && setViewMode(newMode)}
                size="small"
              >
                <ToggleButton value="grid">
                  <ViewModule />
                </ToggleButton>
                <ToggleButton value="list">
                  <ViewList />
                </ToggleButton>
              </ToggleButtonGroup>
              
              {data && (
                <Chip
                  icon={<CameraAlt />}
                  label={`${allPhotos.length} of ${data.total} photos`}
                  color="primary"
                />
              )}
            </Box>
          </Grid>
        </Grid>

        {/* Rover Info */}
        {roverManifest && (
          <Box sx={{ mt: 2, display: 'flex', gap: 2, flexWrap: 'wrap' }}>
            <Chip
              icon={<Rocket />}
              label={`Status: ${roverManifest.status}`}
              color={roverManifest.status === 'active' ? 'success' : 'default'}
              size="small"
            />
            <Chip
              icon={<CalendarToday />}
              label={`Launch: ${format(new Date(roverManifest.launch_date), 'MMM d, yyyy')}`}
              size="small"
              variant="outlined"
            />
            <Chip
              label={`Landing: ${format(new Date(roverManifest.landing_date), 'MMM d, yyyy')}`}
              size="small"
              variant="outlined"
            />
            <Chip
              label={`Total Photos: ${roverManifest.total_photos.toLocaleString()}`}
              size="small"
              variant="outlined"
            />
          </Box>
        )}
      </Paper>

      {/* Photos Grid/List */}
      <AnimatePresence mode="wait">
        <motion.div
          key={viewMode}
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {viewMode === 'grid' ? (
            <Grid container spacing={2}>
              {loading && allPhotos.length === 0 ? (
                [...Array(12)].map((_, i) => (
                  <Grid item xs={12} sm={6} md={4} lg={3} key={i}>
                    <Skeleton variant="rectangular" height={250} />
                  </Grid>
                ))
              ) : (
                allPhotos.map((photo, index) => (
                  <Grid item xs={12} sm={6} md={4} lg={3} key={photo.id}>
                    <motion.div variants={itemVariants}>
                      <Card
                        sx={{
                          cursor: 'pointer',
                          height: '100%',
                          '&:hover': {
                            transform: 'translateY(-4px)',
                            boxShadow: 4,
                          },
                          transition: 'all 0.3s ease',
                        }}
                        onClick={() => setSelectedPhoto(photo)}
                      >
                        <CardMedia
                          component="img"
                          height="250"
                          image={photo.img_src}
                          alt={`Mars ${photo.camera.full_name}`}
                          loading="lazy"
                        />
                        <CardContent>
                          <Typography variant="subtitle2" fontWeight="bold" noWrap>
                            {photo.camera.full_name}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            Sol {photo.sol} • {format(new Date(photo.earth_date), 'MMM d, yyyy')}
                          </Typography>
                        </CardContent>
                      </Card>
                    </motion.div>
                  </Grid>
                ))
              )}
            </Grid>
          ) : (
            <Box>
              {allPhotos.map((photo, index) => (
                <motion.div key={photo.id} variants={itemVariants}>
                  <Paper
                    sx={{
                      p: 2,
                      mb: 2,
                      cursor: 'pointer',
                      '&:hover': {
                        backgroundColor: 'action.hover',
                      },
                    }}
                    onClick={() => setSelectedPhoto(photo)}
                  >
                    <Grid container spacing={2} alignItems="center">
                      <Grid item xs={12} sm={3}>
                        <Box
                          component="img"
                          src={photo.img_src}
                          alt={photo.camera.full_name}
                          sx={{
                            width: '100%',
                            height: 150,
                            objectFit: 'cover',
                            borderRadius: 1,
                          }}
                        />
                      </Grid>
                      <Grid item xs={12} sm={9}>
                        <Typography variant="h6" fontWeight="bold">
                          {photo.camera.full_name}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" paragraph>
                          Captured on Sol {photo.sol} ({format(new Date(photo.earth_date), 'MMMM d, yyyy')})
                        </Typography>
                        <Box display="flex" gap={1}>
                          <Chip label={`Rover: ${photo.rover.name}`} size="small" />
                          <Chip label={`Camera: ${photo.camera.name}`} size="small" variant="outlined" />
                          <Chip label={`Photo ID: ${photo.id}`} size="small" variant="outlined" />
                        </Box>
                      </Grid>
                    </Grid>
                  </Paper>
                </motion.div>
              ))}
            </Box>
          )}
        </motion.div>
      </AnimatePresence>

      {/* Load More Button */}
      {data && data.totalPages > page && (
        <Box sx={{ mt: 4, textAlign: 'center' }}>
          <Button
            variant="contained"
            size="large"
            onClick={loadMore}
            disabled={loading}
          >
            {loading ? 'Loading...' : `Load More (Page ${page + 1} of ${data.totalPages})`}
          </Button>
        </Box>
      )}

      {/* Photo Detail Dialog */}
      <Dialog
        open={Boolean(selectedPhoto)}
        onClose={() => setSelectedPhoto(null)}
        maxWidth="lg"
        fullWidth
      >
        {selectedPhoto && (
          <DialogContent sx={{ p: 0 }}>
            <Box sx={{ position: 'relative' }}>
              <IconButton
                sx={{
                  position: 'absolute',
                  top: 8,
                  right: 8,
                  backgroundColor: 'rgba(0,0,0,0.5)',
                  color: 'white',
                  '&:hover': {
                    backgroundColor: 'rgba(0,0,0,0.7)',
                  },
                }}
                onClick={() => setSelectedPhoto(null)}
              >
                <Close />
              </IconButton>
              
              <img
                src={selectedPhoto.img_src}
                alt={selectedPhoto.camera.full_name}
                style={{
                  width: '100%',
                  height: 'auto',
                  display: 'block',
                }}
              />
              
              <Box sx={{ p: 3 }}>
                <Typography variant="h5" gutterBottom fontWeight="bold">
                  {selectedPhoto.camera.full_name}
                </Typography>
                
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2" color="text.secondary">
                      <strong>Rover:</strong> {selectedPhoto.rover.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      <strong>Sol:</strong> {selectedPhoto.sol}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      <strong>Earth Date:</strong> {format(new Date(selectedPhoto.earth_date), 'MMMM d, yyyy')}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2" color="text.secondary">
                      <strong>Camera:</strong> {selectedPhoto.camera.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      <strong>Photo ID:</strong> {selectedPhoto.id}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      <strong>Status:</strong> {selectedPhoto.rover.status}
                    </Typography>
                  </Grid>
                </Grid>
                
                <Box sx={{ mt: 2 }}>
                  <Button
                    variant="contained"
                    fullWidth
                    href={selectedPhoto.img_src}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Open Full Resolution
                  </Button>
                </Box>
              </Box>
            </Box>
          </DialogContent>
        )}
      </Dialog>
    </Container>
  );
};

export default MarsGallery;