import React, { useState } from 'react';
import {
  Container,
  Grid,
  Card,
  CardMedia,
  CardContent,
  Typography,
  Box,
  TextField,
  InputAdornment,
  Chip,
  ToggleButton,
  ToggleButtonGroup,
  Skeleton,
  Dialog,
  DialogContent,
  IconButton,
  Button,
} from '@mui/material';
import {
  Search as SearchIcon,
  Image,
  VideoLibrary,
  AudioFile,
  Close,
  CalendarToday,
  LocationOn,
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import { useSearch } from '../hooks/useNASAData';
import { format } from 'date-fns';

const ImageSearch = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [mediaType, setMediaType] = useState('image');
  const [selectedItem, setSelectedItem] = useState(null);
  
  const { data: searchResults, loading } = useSearch(searchQuery, mediaType, 1, 800);

  const popularSearches = [
    'Apollo 11',
    'Mars',
    'Hubble',
    'Earth',
    'Saturn',
    'ISS',
    'Moon Landing',
    'Nebula',
    'Galaxy',
    'Astronaut',
  ];

  const handleQuickSearch = (term) => {
    setSearchQuery(term);
  };

  const getMediaIcon = (type) => {
    switch (type) {
      case 'video':
        return <VideoLibrary />;
      case 'audio':
        return <AudioFile />;
      default:
        return <Image />;
    }
  };

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Box sx={{ mb: 6, textAlign: 'center' }}>
          <Typography variant="h2" component="h1" gutterBottom fontWeight="bold">
            NASA Media Library
          </Typography>
          <Typography variant="h5" color="text.secondary" sx={{ mb: 4 }}>
            Search through millions of images, videos, and audio files
          </Typography>

          {/* Search Bar */}
          <Box sx={{ maxWidth: 600, mx: 'auto', mb: 3 }}>
            <TextField
              fullWidth
              variant="outlined"
              placeholder="Search for space content..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
                sx: {
                  fontSize: '1.2rem',
                  py: 1,
                }
              }}
            />
          </Box>

          {/* Media Type Toggle */}
          <ToggleButtonGroup
            value={mediaType}
            exclusive
            onChange={(e, newType) => newType && setMediaType(newType)}
            sx={{ mb: 3 }}
          >
            <ToggleButton value="image">
              <Image sx={{ mr: 1 }} /> Images
            </ToggleButton>
            <ToggleButton value="video">
              <VideoLibrary sx={{ mr: 1 }} /> Videos
            </ToggleButton>
            <ToggleButton value="audio">
              <AudioFile sx={{ mr: 1 }} /> Audio
            </ToggleButton>
          </ToggleButtonGroup>

          {/* Popular Searches */}
          {!searchQuery && (
            <Box>
              <Typography variant="subtitle1" color="text.secondary" gutterBottom>
                Popular Searches:
              </Typography>
              <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center', flexWrap: 'wrap' }}>
                {popularSearches.map((term) => (
                  <Chip
                    key={term}
                    label={term}
                    onClick={() => handleQuickSearch(term)}
                    sx={{ cursor: 'pointer' }}
                    color="primary"
                    variant="outlined"
                  />
                ))}
              </Box>
            </Box>
          )}
        </Box>
      </motion.div>

      {/* Results Count */}
      {searchResults && searchQuery && (
        <Box sx={{ mb: 2 }}>
          <Typography variant="h6">
            Found {searchResults.total_hits.toLocaleString()} results for "{searchQuery}"
          </Typography>
        </Box>
      )}

      {/* Search Results */}
      <Grid container spacing={3}>
        {loading ? (
          [...Array(12)].map((_, i) => (
            <Grid item xs={12} sm={6} md={4} lg={3} key={i}>
              <Skeleton variant="rectangular" height={250} />
              <Skeleton variant="text" sx={{ mt: 1 }} />
              <Skeleton variant="text" width="60%" />
            </Grid>
          ))
        ) : searchResults?.results ? (
          <AnimatePresence>
            {searchResults.results.map((item, index) => (
              <Grid item xs={12} sm={6} md={4} lg={3} key={item.nasa_id}>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Card
                    sx={{
                      height: '100%',
                      cursor: 'pointer',
                      '&:hover': {
                        transform: 'translateY(-4px)',
                        boxShadow: 4,
                      },
                      transition: 'all 0.3s ease',
                    }}
                    onClick={() => setSelectedItem(item)}
                  >
                    <Box sx={{ position: 'relative' }}>
                      <CardMedia
                        component="img"
                        height="200"
                        src={item.thumbnail}
                        alt={item.title}
                        sx={{ objectFit: 'cover' }}
                      />
                      <Chip
                        icon={getMediaIcon(item.media_type)}
                        label={item.media_type}
                        size="small"
                        sx={{
                          position: 'absolute',
                          top: 8,
                          right: 8,
                          backgroundColor: 'rgba(0,0,0,0.7)',
                        }}
                      />
                    </Box>
                    <CardContent>
                      <Typography variant="subtitle1" fontWeight="bold" noWrap>
                        {item.title}
                      </Typography>
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                        }}
                      >
                        {item.description}
                      </Typography>
                      {item.date_created && (
                        <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 1 }}>
                          {format(new Date(item.date_created), 'MMM d, yyyy')}
                        </Typography>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
              </Grid>
            ))}
          </AnimatePresence>
        ) : searchQuery && !loading && (
          <Grid item xs={12}>
            <Box sx={{ textAlign: 'center', py: 8 }}>
              <Typography variant="h6" color="text.secondary">
                No results found for "{searchQuery}"
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                Try a different search term or media type
              </Typography>
            </Box>
          </Grid>
        )}
      </Grid>

      {/* Detail Dialog */}
      <Dialog
        open={Boolean(selectedItem)}
        onClose={() => setSelectedItem(null)}
        maxWidth="md"
        fullWidth
      >
        {selectedItem && (
          <DialogContent>
            <Box sx={{ position: 'relative' }}>
              <IconButton
                sx={{
                  position: 'absolute',
                  top: -8,
                  right: -8,
                  backgroundColor: 'background.paper',
                  boxShadow: 2,
                }}
                onClick={() => setSelectedItem(null)}
              >
                <Close />
              </IconButton>

              {selectedItem.media_type === 'video' ? (
                <video
                  controls
                  style={{ width: '100%', height: 'auto' }}
                  src={selectedItem.thumbnail}
                />
              ) : (
                <img
                  src={selectedItem.thumbnail}
                  alt={selectedItem.title}
                  style={{ width: '100%', height: 'auto' }}
                />
              )}

              <Box sx={{ mt: 3 }}>
                <Typography variant="h5" gutterBottom fontWeight="bold">
                  {selectedItem.title}
                </Typography>

                <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                  <Chip
                    icon={getMediaIcon(selectedItem.media_type)}
                    label={selectedItem.media_type}
                    color="primary"
                    size="small"
                  />
                  {selectedItem.date_created && (
                    <Chip
                      icon={<CalendarToday />}
                      label={format(new Date(selectedItem.date_created), 'MMM d, yyyy')}
                      size="small"
                      variant="outlined"
                    />
                  )}
                  {selectedItem.center && (
                    <Chip
                      label={selectedItem.center}
                      size="small"
                      variant="outlined"
                    />
                  )}
                </Box>

                <Typography variant="body1" paragraph>
                  {selectedItem.description}
                </Typography>

                {selectedItem.keywords && selectedItem.keywords.length > 0 && (
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="subtitle2" gutterBottom>
                      Keywords:
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                      {selectedItem.keywords.slice(0, 10).map((keyword, i) => (
                        <Chip
                          key={i}
                          label={keyword}
                          size="small"
                          variant="outlined"
                          onClick={() => {
                            setSearchQuery(keyword);
                            setSelectedItem(null);
                          }}
                          sx={{ cursor: 'pointer' }}
                        />
                      ))}
                    </Box>
                  </Box>
                )}

                <Button
                  variant="contained"
                  fullWidth
                  href={`https://images.nasa.gov/details-${selectedItem.nasa_id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  View on NASA Website
                </Button>
              </Box>
            </Box>
          </DialogContent>
        )}
      </Dialog>
    </Container>
  );
};

export default ImageSearch;