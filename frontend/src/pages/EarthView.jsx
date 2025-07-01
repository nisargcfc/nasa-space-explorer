import React, { useState, useEffect } from 'react';
import {
  Container,
  Grid,
  Card,
  CardMedia,
  CardContent,
  Typography,
  Box,
  IconButton,
  Dialog,
  DialogContent,
  DialogTitle,
  Button,
  Paper,
  Skeleton,
  Alert,
  Chip,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  CircularProgress,
  Tooltip,
} from '@mui/material';
import {
  ChevronLeft,
  ChevronRight,
  CalendarToday,
  Download,
  Fullscreen,
  Close,
  Public,
  Camera,
  Schedule,
  Satellite,
  Refresh,
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import { format, subDays, addDays, parseISO, isValid } from 'date-fns';
import { useEPIC } from '../hooks/useNASAData';
import { nasaAPI } from '../services/api';

const EarthView = () => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [availableDates, setAvailableDates] = useState([]);
  const [selectedImage, setSelectedImage] = useState(null);
  const [fullscreenOpen, setFullscreenOpen] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [loadingDates, setLoadingDates] = useState(true);

  // Format date for API call
  const dateString = format(selectedDate, 'yyyy-MM-dd');
  const { data: epicImages, loading, error } = useEPIC(dateString);

  // Fetch available dates on component mount
  useEffect(() => {
    const fetchAvailableDates = async () => {
      try {
        setLoadingDates(true);
        const response = await nasaAPI.getEPICDates();
        if (response.data && Array.isArray(response.data)) {
          setAvailableDates(response.data.slice(0, 30)); // Get last 30 available dates
          // Set the most recent date as default
          if (response.data.length > 0) {
            const mostRecentDate = parseISO(response.data[0].date);
            if (isValid(mostRecentDate)) {
              setSelectedDate(mostRecentDate);
            }
          }
        }
      } catch (error) {
        console.error('Error fetching available dates:', error);
        // Fallback to recent dates if API fails
        const fallbackDates = [];
        for (let i = 0; i < 10; i++) {
          fallbackDates.push({
            date: format(subDays(new Date(), i), 'yyyy-MM-dd'),
            caption: `Earth imagery ${i === 0 ? 'today' : `${i} days ago`}`
          });
        }
        setAvailableDates(fallbackDates);
      } finally {
        setLoadingDates(false);
      }
    };

    fetchAvailableDates();
  }, []);

  // Update current image index when images change
  useEffect(() => {
    setCurrentImageIndex(0);
  }, [epicImages]);

  const navigateDate = (direction) => {
    if (availableDates.length === 0) return;
    
    const currentIndex = availableDates.findIndex(d => d.date === dateString);
    let newIndex;
    
    if (direction === 'next') {
      newIndex = currentIndex > 0 ? currentIndex - 1 : 0;
    } else {
      newIndex = currentIndex < availableDates.length - 1 ? currentIndex + 1 : availableDates.length - 1;
    }
    
    const newDate = parseISO(availableDates[newIndex].date);
    if (isValid(newDate)) {
      setSelectedDate(newDate);
    }
  };

  const navigateImage = (direction) => {
    if (!epicImages || epicImages.length === 0) return;
    
    if (direction === 'next') {
      setCurrentImageIndex(prev => (prev + 1) % epicImages.length);
    } else {
      setCurrentImageIndex(prev => (prev - 1 + epicImages.length) % epicImages.length);
    }
  };

  const handleImageClick = (image, index) => {
    setSelectedImage(image);
    setCurrentImageIndex(index);
    setFullscreenOpen(true);
  };

  const handleDownload = (image) => {
    if (image?.image_url) {
      const link = document.createElement('a');
      link.href = image.image_url;
      link.download = `Earth_${image.date}_${image.image}.png`;
      link.target = '_blank';
      link.click();
    }
  };

  const getImageUrl = (image) => {
    if (image?.image_url) return image.image_url;
    
    // Fallback URL construction if image_url is not available
    const [year, month, day] = image.date.split(' ')[0].split('-');
    return `https://api.nasa.gov/EPIC/archive/natural/${year}/${month}/${day}/png/${image.image}.png?api_key=DEMO_KEY`;
  };

  const currentImage = epicImages && epicImages[currentImageIndex];

  if (loadingDates) {
    return (
      <Container maxWidth="xl" sx={{ mt: 4 }}>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Box display="flex" justifyContent="center" alignItems="center" minHeight={400}>
              <CircularProgress size={60} />
            </Box>
          </Grid>
        </Grid>
      </Container>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Box sx={{ mb: 4, textAlign: 'center' }}>
          <Typography variant="h2" component="h1" gutterBottom fontWeight="bold">
            Earth View
          </Typography>
          <Typography variant="h5" color="text.secondary">
            Real-time Earth imagery from NASA's EPIC camera on DSCOVR satellite
          </Typography>
        </Box>
      </motion.div>

      {/* Date Navigation */}
      <Paper sx={{ p: 3, mb: 4 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item>
            <IconButton 
              onClick={() => navigateDate('prev')}
              disabled={!availableDates.length}
            >
              <ChevronLeft />
            </IconButton>
          </Grid>
          
          <Grid item xs>
            <FormControl fullWidth>
              <InputLabel>Select Date</InputLabel>
              <Select
                value={dateString}
                label="Select Date"
                onChange={(e) => {
                  const newDate = parseISO(e.target.value);
                  if (isValid(newDate)) {
                    setSelectedDate(newDate);
                  }
                }}
              >
                {availableDates.map((dateObj) => (
                  <MenuItem key={dateObj.date} value={dateObj.date}>
                    {format(parseISO(dateObj.date), 'MMMM dd, yyyy')}
                    {dateObj.caption && (
                      <Typography variant="caption" color="text.secondary" sx={{ ml: 1 }}>
                        ({dateObj.caption})
                      </Typography>
                    )}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          
          <Grid item>
            <IconButton 
              onClick={() => navigateDate('next')}
              disabled={!availableDates.length}
            >
              <ChevronRight />
            </IconButton>
          </Grid>
          
          <Grid item>
            <Button
              startIcon={<CalendarToday />}
              onClick={() => setSelectedDate(new Date())}
              variant="outlined"
            >
              Today
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {/* Error Handling */}
      {error && (
        <Alert severity="error" sx={{ mb: 4 }}>
          Failed to load Earth imagery: {error}
        </Alert>
      )}

      {/* Main Image Display */}
      {loading ? (
        <Grid container spacing={3}>
          <Grid item xs={12} md={8}>
            <Skeleton variant="rectangular" height={600} />
          </Grid>
          <Grid item xs={12} md={4}>
            <Skeleton variant="rectangular" height={150} />
            <Box mt={2}>
              <Skeleton variant="rectangular" height={300} />
            </Box>
          </Grid>
        </Grid>
      ) : epicImages && epicImages.length > 0 ? (
        <Grid container spacing={3}>
          {/* Main Image */}
          <Grid item xs={12} md={8}>
            <motion.div
              key={currentImageIndex}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
            >
              <Card sx={{ position: 'relative', overflow: 'hidden' }}>
                <CardMedia
                  component="img"
                  image={getImageUrl(currentImage)}
                  alt={`Earth on ${currentImage.date}`}
                  sx={{ 
                    height: 600, 
                    objectFit: 'cover',
                    cursor: 'pointer'
                  }}
                  onClick={() => handleImageClick(currentImage, currentImageIndex)}
                />
                
                {/* Image Navigation Overlay */}
                <Box
                  sx={{
                    position: 'absolute',
                    top: '50%',
                    left: 16,
                    transform: 'translateY(-50%)',
                    zIndex: 1,
                  }}
                >
                  <IconButton
                    onClick={() => navigateImage('prev')}
                    disabled={epicImages.length <= 1}
                    sx={{
                      bgcolor: 'rgba(0,0,0,0.5)',
                      color: 'white',
                      '&:hover': { bgcolor: 'rgba(0,0,0,0.7)' },
                    }}
                  >
                    <ChevronLeft />
                  </IconButton>
                </Box>
                
                <Box
                  sx={{
                    position: 'absolute',
                    top: '50%',
                    right: 16,
                    transform: 'translateY(-50%)',
                    zIndex: 1,
                  }}
                >
                  <IconButton
                    onClick={() => navigateImage('next')}
                    disabled={epicImages.length <= 1}
                    sx={{
                      bgcolor: 'rgba(0,0,0,0.5)',
                      color: 'white',
                      '&:hover': { bgcolor: 'rgba(0,0,0,0.7)' },
                    }}
                  >
                    <ChevronRight />
                  </IconButton>
                </Box>

                {/* Image Info Overlay */}
                <Box
                  sx={{
                    position: 'absolute',
                    bottom: 0,
                    left: 0,
                    right: 0,
                    bgcolor: 'rgba(0,0,0,0.7)',
                    color: 'white',
                    p: 2,
                  }}
                >
                  <Typography variant="h6">
                    Earth - {format(parseISO(currentImage.date), 'MMMM dd, yyyy')}
                  </Typography>
                  <Typography variant="body2">
                    Image {currentImageIndex + 1} of {epicImages.length}
                  </Typography>
                </Box>

                {/* Action Buttons */}
                <Box
                  sx={{
                    position: 'absolute',
                    top: 16,
                    right: 16,
                    display: 'flex',
                    gap: 1,
                  }}
                >
                  <Tooltip title="View Fullscreen">
                    <IconButton
                      onClick={() => handleImageClick(currentImage, currentImageIndex)}
                      sx={{
                        bgcolor: 'rgba(0,0,0,0.5)',
                        color: 'white',
                        '&:hover': { bgcolor: 'rgba(0,0,0,0.7)' },
                      }}
                    >
                      <Fullscreen />
                    </IconButton>
                  </Tooltip>
                  
                  <Tooltip title="Download Image">
                    <IconButton
                      onClick={() => handleDownload(currentImage)}
                      sx={{
                        bgcolor: 'rgba(0,0,0,0.5)',
                        color: 'white',
                        '&:hover': { bgcolor: 'rgba(0,0,0,0.7)' },
                      }}
                    >
                      <Download />
                    </IconButton>
                  </Tooltip>
                </Box>
              </Card>
            </motion.div>
          </Grid>

          {/* Sidebar */}
          <Grid item xs={12} md={4}>
            {/* Image Details */}
            <Card sx={{ mb: 2 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Image Details
                </Typography>
                
                <Box display="flex" alignItems="center" gap={1} mb={1}>
                  <Camera color="action" />
                  <Typography variant="body2">
                    <strong>Image ID:</strong> {currentImage.image}
                  </Typography>
                </Box>
                
                <Box display="flex" alignItems="center" gap={1} mb={1}>
                  <Schedule color="action" />
                  <Typography variant="body2">
                    <strong>Date:</strong> {format(parseISO(currentImage.date), 'PPP')}
                  </Typography>
                </Box>
                
                <Box display="flex" alignItems="center" gap={1} mb={1}>
                  <Satellite color="action" />
                  <Typography variant="body2">
                    <strong>Satellite:</strong> DSCOVR
                  </Typography>
                </Box>
                
                <Box display="flex" alignItems="center" gap={1}>
                  <Public color="action" />
                  <Typography variant="body2">
                    <strong>Camera:</strong> EPIC (Earth Polychromatic Imaging Camera)
                  </Typography>
                </Box>
              </CardContent>
            </Card>

            {/* Image Thumbnails */}
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Available Images ({epicImages.length})
                </Typography>
                
                <Grid container spacing={1}>
                  {epicImages.map((image, index) => (
                    <Grid item xs={6} key={image.image}>
                      <motion.div
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <Card
                          sx={{
                            cursor: 'pointer',
                            border: index === currentImageIndex ? '2px solid' : '1px solid transparent',
                            borderColor: index === currentImageIndex ? 'primary.main' : 'divider',
                          }}
                          onClick={() => setCurrentImageIndex(index)}
                        >
                          <CardMedia
                            component="img"
                            image={getImageUrl(image)}
                            alt={`Earth ${index + 1}`}
                            sx={{ height: 80, objectFit: 'cover' }}
                          />
                        </Card>
                      </motion.div>
                    </Grid>
                  ))}
                </Grid>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      ) : (
        <Alert severity="info">
          No Earth imagery available for {format(selectedDate, 'MMMM dd, yyyy')}. 
          Please select a different date.
        </Alert>
      )}

      {/* Fullscreen Modal */}
      <Dialog
        open={fullscreenOpen}
        onClose={() => setFullscreenOpen(false)}
        maxWidth={false}
        fullWidth
        PaperProps={{
          sx: {
            bgcolor: 'rgba(0,0,0,0.9)',
            backgroundImage: 'none',
          }
        }}
      >
        {selectedImage && (
          <>
            <DialogTitle>
              <Box display="flex" justifyContent="space-between" alignItems="center">
                <Typography variant="h5" color="white">
                  Earth - {format(parseISO(selectedImage.date), 'MMMM dd, yyyy')}
                </Typography>
                <IconButton onClick={() => setFullscreenOpen(false)} sx={{ color: 'white' }}>
                  <Close />
                </IconButton>
              </Box>
            </DialogTitle>
            <DialogContent sx={{ p: 0, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
              <img
                src={getImageUrl(selectedImage)}
                alt={`Earth on ${selectedImage.date}`}
                style={{
                  maxWidth: '100%',
                  maxHeight: '80vh',
                  objectFit: 'contain',
                }}
              />
            </DialogContent>
          </>
        )}
      </Dialog>
    </Container>
  );
};

export default EarthView;