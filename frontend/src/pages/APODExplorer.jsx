import React, { useState, useEffect } from 'react';
import {
  Container,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Typography,
  Box,
  IconButton,
  Dialog,
  DialogContent,
  Chip,
  Button,
  Skeleton,
  Paper,
  Fab,
  Tooltip,
} from '@mui/material';
import {
  ChevronLeft,
  ChevronRight,
  CalendarToday,
  Download,
  Share,
  Fullscreen,
  Star,
  StarBorder,
  Shuffle,
  Close,
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import { format, addDays, subDays, startOfMonth, endOfMonth, eachDayOfInterval, isAfter } from 'date-fns';
import { useAPOD } from '../hooks/useNASAData';
import { nasaAPI } from '../services/api';
import FallbackNotice from '../components/common/FallbackNotice';

const APODExplorer = () => {
  // Set default date to today's date to match Dashboard
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [fullscreenOpen, setFullscreenOpen] = useState(false);
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [favorites, setFavorites] = useState([]);
  const [usingFallbackData, setUsingFallbackData] = useState(false);
  
  const { data: apodData, loading, error } = useAPOD(format(selectedDate, 'yyyy-MM-dd'));

  useEffect(() => {
    // Load favorites from localStorage
    const saved = localStorage.getItem('apod_favorites');
    if (saved) {
      setFavorites(JSON.parse(saved));
    }
  }, []);

  useEffect(() => {
    // Check for fallback data
    setUsingFallbackData(apodData?._isFallbackData || false);
  }, [apodData]);

  const toggleFavorite = () => {
    if (!apodData) return;
    
    const isFav = favorites.some(f => f.date === apodData.date);
    const newFavorites = isFav
      ? favorites.filter(f => f.date !== apodData.date)
      : [...favorites, {
          date: apodData.date,
          title: apodData.title,
          url: apodData.url,
          thumbnail_url: apodData.thumbnail_url || apodData.url
        }];
    
    setFavorites(newFavorites);
    localStorage.setItem('apod_favorites', JSON.stringify(newFavorites));
  };

  const navigateDate = (direction) => {
    const newDate = direction === 'next' 
      ? addDays(selectedDate, 1)
      : subDays(selectedDate, 1);
    
    if (!isAfter(newDate, new Date())) {
      setSelectedDate(newDate);
    }
  };

  const selectRandomDate = () => {
    const start = new Date('1995-06-16');
    const end = new Date();
    const randomTime = start.getTime() + Math.random() * (end.getTime() - start.getTime());
    setSelectedDate(new Date(randomTime));
  };

  const handleShare = async () => {
    if (navigator.share && apodData) {
      try {
        await navigator.share({
          title: apodData.title,
          text: `Check out this amazing NASA image: ${apodData.title}`,
          url: window.location.href
        });
      } catch (error) {
        navigator.clipboard.writeText(`${apodData.title} - ${window.location.href}`);
      }
    }
  };

  const handleDownload = () => {
    if (apodData?.hdurl || apodData?.url) {
      const link = document.createElement('a');
      link.href = apodData.hdurl || apodData.url;
      link.download = `NASA_APOD_${apodData.date}_${apodData.title.replace(/\s+/g, '_')}.jpg`;
      link.target = '_blank';
      link.click();
    }
  };

  const isFavorite = apodData && favorites.some(f => f.date === apodData.date);

  const CalendarView = () => {
    const [monthAPODs, setMonthAPODs] = useState({});
    const monthStart = startOfMonth(selectedDate);
    const monthEnd = endOfMonth(selectedDate);
    const days = eachDayOfInterval({ start: monthStart, end: monthEnd });

    useEffect(() => {
      // Fetch thumbnails for the month
      const fetchMonthData = async () => {
        try {
          // Don't fetch future dates - cap the end date to today
          const today = new Date();
          const actualEnd = monthEnd > today ? today : monthEnd;
          
          // Only fetch if we have valid date range
          if (monthStart <= actualEnd) {
            const response = await nasaAPI.getAPODRange(
              format(monthStart, 'yyyy-MM-dd'),
              format(actualEnd, 'yyyy-MM-dd')
            );
            const dataMap = {};
            response.data.forEach(apod => {
              dataMap[apod.date] = apod;
            });
            setMonthAPODs(dataMap);
          }
        } catch (error) {
          console.error('Error fetching month data:', error);
          // Don't spam the API on errors
        }
      };
      
      // Add a small delay to prevent rapid API calls when navigating months
      const timeoutId = setTimeout(fetchMonthData, 300);
      return () => clearTimeout(timeoutId);
    }, [selectedDate]);

    return (
      <Dialog 
        open={calendarOpen} 
        onClose={() => setCalendarOpen(false)}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            backgroundColor: 'background.paper',
            backgroundImage: 'none',
          }
        }}
      >
        <DialogContent>
          <Box sx={{ p: 2 }}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
              <Typography variant="h5" fontWeight="bold">
                Select a Date
              </Typography>
              <IconButton onClick={() => setCalendarOpen(false)}>
                <Close />
              </IconButton>
            </Box>
            
            <Typography variant="h6" gutterBottom align="center">
              {format(selectedDate, 'MMMM yyyy')}
            </Typography>
            
            <Grid container spacing={1}>
              {days.map(day => {
                const dateStr = format(day, 'yyyy-MM-dd');
                const dayAPOD = monthAPODs[dateStr];
                const isSelected = format(day, 'yyyy-MM-dd') === format(selectedDate, 'yyyy-MM-dd');
                const isFuture = isAfter(day, new Date());

                return (
                  <Grid item xs={1.7} key={dateStr}>
                    <motion.div
                      whileHover={!isFuture ? { scale: 1.1 } : {}}
                      whileTap={!isFuture ? { scale: 0.95 } : {}}
                    >
                      <Paper
                        sx={{
                          p: 0.5,
                          cursor: isFuture ? 'not-allowed' : 'pointer',
                          opacity: isFuture ? 0.3 : 1,
                          border: isSelected ? '2px solid' : '1px solid transparent',
                          borderColor: isSelected ? 'primary.main' : 'divider',
                          position: 'relative',
                          height: 60,
                          overflow: 'hidden',
                          backgroundImage: dayAPOD?.thumbnail_url || dayAPOD?.url 
                            ? `url(${dayAPOD.thumbnail_url || dayAPOD.url})`
                            : 'none',
                          backgroundSize: 'cover',
                          backgroundPosition: 'center',
                          '&:hover': {
                            borderColor: !isFuture ? 'primary.main' : 'divider',
                          }
                        }}
                        onClick={() => {
                          if (!isFuture) {
                            setSelectedDate(day);
                            setCalendarOpen(false);
                          }
                        }}
                      >
                        <Typography 
                          variant="caption" 
                          sx={{ 
                            position: 'absolute',
                            top: 2,
                            left: 2,
                            backgroundColor: 'rgba(0,0,0,0.7)', 
                            px: 0.5,
                            borderRadius: 0.5,
                            fontWeight: isSelected ? 'bold' : 'normal'
                          }}
                        >
                          {format(day, 'd')}
                        </Typography>
                      </Paper>
                    </motion.div>
                  </Grid>
                );
              })}
            </Grid>
          </Box>
        </DialogContent>
      </Dialog>
    );
  };

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
      <CalendarView />
      
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
            Astronomy Picture of the Day
          </Typography>
          <Box display="flex" justifyContent="center" alignItems="center" gap={2}>
            <Chip
              icon={<CalendarToday />}
              label={format(selectedDate, 'EEEE, MMMM d, yyyy')}
              color="primary"
              onClick={() => setCalendarOpen(true)}
              sx={{ cursor: 'pointer', fontSize: '1.1rem', py: 2.5 }}
            />
            <Tooltip title="Random Date">
              <IconButton onClick={selectRandomDate} color="primary">
                <Shuffle />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>
      </motion.div>

      <Grid container spacing={4}>
        {/* Main Image Section */}
        <Grid item xs={12} lg={8}>
          <AnimatePresence mode="wait">
            <motion.div
              key={selectedDate.toISOString()}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.3 }}
            >
              <Card sx={{ position: 'relative' }}>
                {loading ? (
                  <Skeleton variant="rectangular" height={600} />
                ) : error ? (
                  <Box sx={{ p: 4, textAlign: 'center' }}>
                    <Typography color="error">Error loading image</Typography>
                  </Box>
                ) : apodData && (
                  <>
                    {apodData.media_type === 'video' ? (
                      <Box sx={{ position: 'relative', paddingTop: '56.25%' }}>
                        <iframe
                          src={apodData.url}
                          title={apodData.title}
                          style={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            width: '100%',
                            height: '100%',
                            border: 'none'
                          }}
                          allowFullScreen
                        />
                      </Box>
                    ) : (
                      <CardMedia
                        component="img"
                        image={apodData.url}
                        alt={apodData.title}
                        sx={{
                          width: '100%',
                          height: 'auto',
                          maxHeight: '70vh',
                          objectFit: 'contain',
                          cursor: 'zoom-in'
                        }}
                        onClick={() => setFullscreenOpen(true)}
                      />
                    )}
                    
                    {/* Action Buttons */}
                    <Box sx={{ 
                      position: 'absolute', 
                      top: 16, 
                      right: 16, 
                      display: 'flex', 
                      gap: 1 
                    }}>
                      <Fab 
                        size="small" 
                        onClick={toggleFavorite}
                        sx={{
                          backgroundColor: isFavorite ? 'secondary.main' : 'background.paper',
                          '&:hover': {
                            backgroundColor: isFavorite ? 'secondary.dark' : 'action.hover'
                          }
                        }}
                      >
                        {isFavorite ? <Star /> : <StarBorder />}
                      </Fab>
                      <Fab size="small" onClick={handleShare}>
                        <Share />
                      </Fab>
                      <Fab size="small" onClick={handleDownload}>
                        <Download />
                      </Fab>
                      {apodData.media_type !== 'video' && (
                        <Fab size="small" onClick={() => setFullscreenOpen(true)}>
                          <Fullscreen />
                        </Fab>
                      )}
                    </Box>
                  </>
                )}
              </Card>

              {/* Navigation Controls */}
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
                <Button
                  startIcon={<ChevronLeft />}
                  onClick={() => navigateDate('prev')}
                  variant="contained"
                  size="large"
                >
                  Previous Day
                </Button>
                <Button
                  endIcon={<ChevronRight />}
                  onClick={() => navigateDate('next')}
                  disabled={format(selectedDate, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd')}
                  variant="contained"
                  size="large"
                >
                  Next Day
                </Button>
              </Box>
            </motion.div>
          </AnimatePresence>
        </Grid>

        {/* Info Section */}
        <Grid item xs={12} lg={4}>
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card sx={{ mb: 3 }}>
              <CardContent>
                {loading ? (
                  <>
                    <Skeleton variant="text" height={40} />
                    <Skeleton variant="text" height={30} sx={{ mb: 2 }} />
                    <Skeleton variant="rectangular" height={200} />
                  </>
                ) : apodData && (
                  <>
                    <Typography variant="h4" gutterBottom fontWeight="bold">
                      {apodData.title}
                    </Typography>
                    
                    {apodData.copyright && (
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                        © {apodData.copyright}
                      </Typography>
                    )}

                    <Typography variant="body1" paragraph>
                      {apodData.explanation}
                    </Typography>

                    {apodData.hdurl && (
                      <Button
                        fullWidth
                        variant="outlined"
                        startIcon={<Download />}
                        onClick={handleDownload}
                        sx={{ mt: 2 }}
                      >
                        Download HD Version
                      </Button>
                    )}
                  </>
                )}
              </CardContent>
            </Card>

            {/* Favorites Section */}
            {favorites.length > 0 && (
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom fontWeight="bold">
                    Your Favorites ({favorites.length})
                  </Typography>
                  <Grid container spacing={1}>
                    {favorites.slice(0, 6).map(fav => (
                      <Grid item xs={4} key={fav.date}>
                        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                          <Paper
                            sx={{
                              position: 'relative',
                              paddingTop: '100%',
                              cursor: 'pointer',
                              overflow: 'hidden',
                              backgroundImage: `url(${fav.thumbnail_url || fav.url})`,
                              backgroundSize: 'cover',
                              backgroundPosition: 'center',
                            }}
                            onClick={() => setSelectedDate(new Date(fav.date))}
                          >
                            <Typography
                              variant="caption"
                              sx={{
                                position: 'absolute',
                                bottom: 0,
                                left: 0,
                                right: 0,
                                backgroundColor: 'rgba(0,0,0,0.7)',
                                p: 0.5,
                                textAlign: 'center'
                              }}
                            >
                              {format(new Date(fav.date), 'MMM d')}
                            </Typography>
                          </Paper>
                        </motion.div>
                      </Grid>
                    ))}
                  </Grid>
                </CardContent>
              </Card>
            )}
          </motion.div>
        </Grid>
      </Grid>

      {/* Fullscreen Dialog */}
      <Dialog
        fullScreen
        open={fullscreenOpen}
        onClose={() => setFullscreenOpen(false)}
        sx={{ backgroundColor: 'black' }}
      >
        <Box
          sx={{
            position: 'relative',
            width: '100%',
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: 'black'
          }}
          onClick={() => setFullscreenOpen(false)}
        >
          {apodData && (
            <img
              src={apodData.hdurl || apodData.url}
              alt={apodData.title}
              style={{
                maxWidth: '100%',
                maxHeight: '100%',
                objectFit: 'contain'
              }}
            />
          )}
          <IconButton
            sx={{
              position: 'absolute',
              top: 16,
              right: 16,
              color: 'white',
              backgroundColor: 'rgba(0,0,0,0.5)',
              '&:hover': {
                backgroundColor: 'rgba(0,0,0,0.7)'
              }
            }}
            onClick={() => setFullscreenOpen(false)}
          >
            <Close />
          </IconButton>
        </Box>
      </Dialog>
    </Container>
  );
};

export default APODExplorer;