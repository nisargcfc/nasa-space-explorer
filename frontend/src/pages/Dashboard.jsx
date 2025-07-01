import React, { useState, useEffect } from 'react';
import {
  Container,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Typography,
  Box,
  CircularProgress,
  Chip,
  IconButton,
  Tooltip,
  Paper,
  Skeleton,
  Button,
  useTheme,
} from '@mui/material';
import {
  Rocket,
  CameraAlt,
  Public,
  Warning,
  TrendingUp,
  CalendarToday,
  Explore,
  Speed,
  Satellite,
  ArrowForward,
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
} from 'recharts';
import { useNavigate } from 'react-router-dom';
import { format, subDays } from 'date-fns';
import { nasaAPI } from '../services/api';
import FallbackNotice from '../components/common/FallbackNotice';

const Dashboard = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const [loading, setLoading] = useState(true);
  const [usingFallbackData, setUsingFallbackData] = useState(false);
  const [dashboardData, setDashboardData] = useState({
    apod: null,
    marsPhotos: [],
    neoData: null,
    epicImages: [],
    stats: {
      totalImages: 0,
      activeRovers: 3,
      nearEarthObjects: 0,
      potentiallyHazardous: 0,
    },
  });

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Get dates for NEO data (limit to 7 days)
      const today = new Date();
      const daysAgo = subDays(today, 3); // Use 3 days to stay within API limits
      
      // Fetch all data in parallel
      const [apodRes, marsRes, neoRes, epicRes] = await Promise.allSettled([
        nasaAPI.getAPOD(),
        nasaAPI.getMarsPhotos({ sol: 1000, page: 1 }),
        nasaAPI.getNEO(
          format(daysAgo, 'yyyy-MM-dd'),
          format(today, 'yyyy-MM-dd')
        ),
        nasaAPI.getEPIC(),
      ]);

      // Process results with better error handling
      const processedData = {
        apod: apodRes.status === 'fulfilled' ? apodRes.value.data : null,
        marsPhotos: marsRes.status === 'fulfilled' ? (marsRes.value.data.photos || []) : [],
        neoData: neoRes.status === 'fulfilled' ? neoRes.value.data : null,
        epicImages: epicRes.status === 'fulfilled' ? (epicRes.value.data.images || epicRes.value.data || []) : [],
        stats: {
          totalImages: marsRes.status === 'fulfilled' ? (marsRes.value.data.total || marsRes.value.data.photos?.length || 0) : 0,
          activeRovers: 3,
          nearEarthObjects: neoRes.status === 'fulfilled' ? (neoRes.value.data.element_count || 0) : 0,
          potentiallyHazardous: neoRes.status === 'fulfilled' ? (neoRes.value.data.potentially_hazardous_count || 0) : 0,
        },
      };

      // Log any failed requests for debugging
      if (apodRes.status === 'rejected') console.warn('APOD failed:', apodRes.reason);
      if (marsRes.status === 'rejected') console.warn('Mars data failed:', marsRes.reason);
      if (neoRes.status === 'rejected') console.warn('NEO data failed:', neoRes.reason);
      if (epicRes.status === 'rejected') console.warn('EPIC data failed:', epicRes.reason);

      // Detect if we're using fallback data
      const isFallback = 
        (processedData.apod?.date === "2024-06-15" && processedData.apod?.title === "A Prominent Solar Filament") ||
        (processedData.marsPhotos?.[0]?.id === 1000000) ||
        (processedData.neoData?.asteroids_by_date?.["2024-06-15"]?.some(a => a.id === "54016112"));
      
      setUsingFallbackData(isFallback);
      setDashboardData(processedData);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Process NEO data for charts
  const processNEOChartData = () => {
    if (!dashboardData.neoData?.asteroids_by_date) return [];
    
    return Object.entries(dashboardData.neoData.asteroids_by_date).map(([date, asteroids]) => ({
      date: format(new Date(date), 'MMM dd'),
      count: asteroids.length,
      hazardous: asteroids.filter(a => a.is_potentially_hazardous).length,
      avgSize: Math.round(
        asteroids.reduce((sum, a) => sum + a.diameter_meters.max, 0) / asteroids.length
      ),
    }));
  };

  // Process data for pie chart
  const roverDistribution = [
    { name: 'Curiosity', value: 45, color: '#2196f3' },
    { name: 'Perseverance', value: 35, color: '#f50057' },
    { name: 'Opportunity', value: 20, color: '#ff9800' },
  ];

  // Animation variants
  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  if (loading) {
    return (
      <Container maxWidth="xl" sx={{ mt: 4 }}>
        <Grid container spacing={3}>
          {[...Array(8)].map((_, i) => (
            <Grid item xs={12} sm={6} md={3} key={i}>
              <Skeleton variant="rectangular" height={150} sx={{ borderRadius: 2 }} />
            </Grid>
          ))}
        </Grid>
      </Container>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
      {/* Fallback Notice */}
      <FallbackNotice show={usingFallbackData} />
      
      {/* Hero Section */}
      <motion.div
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        <Box
          sx={{
            mb: 6,
            p: 4,
            borderRadius: 3,
            background: `linear-gradient(135deg, ${theme.palette.primary.dark}22 0%, ${theme.palette.secondary.dark}22 100%)`,
            border: `1px solid ${theme.palette.primary.main}44`,
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          <Box sx={{ position: 'relative', zIndex: 1 }}>
            <Typography variant="h2" component="h1" gutterBottom fontWeight="bold">
              Welcome to NASA Space Explorer
            </Typography>
            <Typography variant="h5" color="text.secondary" sx={{ mb: 3 }}>
              Your gateway to the cosmos - Explore real-time data from NASA's missions
            </Typography>
            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
              <Chip
                icon={<Satellite />}
                label={`${dashboardData.stats.totalImages.toLocaleString()} Images`}
                color="primary"
                sx={{ fontSize: '1rem', py: 2 }}
              />
              <Chip
                icon={<Warning />}
                label={`${dashboardData.stats.potentiallyHazardous} Hazardous Asteroids`}
                color="error"
                sx={{ fontSize: '1rem', py: 2 }}
              />
              <Chip
                icon={<Speed />}
                label="Real-time Data"
                color="success"
                sx={{ fontSize: '1rem', py: 2 }}
              />
            </Box>
          </Box>
          
          {/* Animated background elements */}
          <Box
            sx={{
              position: 'absolute',
              top: -100,
              right: -100,
              width: 300,
              height: 300,
              borderRadius: '50%',
              background: `radial-gradient(circle, ${theme.palette.primary.main}22 0%, transparent 70%)`,
              animation: 'pulse 4s ease-in-out infinite',
            }}
          />
        </Box>
      </motion.div>

      {/* Stats Cards */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <Grid container spacing={3} sx={{ mb: 4 }}>
          {[
            {
              icon: <CameraAlt sx={{ fontSize: 40 }} />,
              label: 'Mars Photos Today',
              value: dashboardData.marsPhotos.length,
              color: theme.palette.primary.main,
              trend: '+12%',
            },
            {
              icon: <Rocket sx={{ fontSize: 40 }} />,
              label: 'Active Rovers',
              value: dashboardData.stats.activeRovers,
              color: theme.palette.secondary.main,
              trend: 'Operational',
            },
            {
              icon: <Warning sx={{ fontSize: 40 }} />,
              label: 'Near Earth Objects',
              value: dashboardData.stats.nearEarthObjects,
              color: theme.palette.warning.main,
              trend: 'This Week',
            },
            {
              icon: <Public sx={{ fontSize: 40 }} />,
              label: 'Earth Images',
              value: dashboardData.epicImages.length,
              color: theme.palette.success.main,
              trend: 'Latest',
            },
          ].map((stat, index) => (
            <Grid item xs={12} sm={6} md={3} key={index}>
              <motion.div variants={cardVariants}>
                <Card
                  sx={{
                    height: '100%',
                    background: `linear-gradient(135deg, ${stat.color}11 0%, ${stat.color}22 100%)`,
                    border: `1px solid ${stat.color}44`,
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      transform: 'translateY(-5px)',
                      boxShadow: `0 10px 30px ${stat.color}44`,
                    },
                  }}
                >
                  <CardContent>
                    <Box display="flex" justifyContent="space-between" alignItems="flex-start">
                      <Box>
                        <Typography color="text.secondary" gutterBottom variant="body2">
                          {stat.label}
                        </Typography>
                        <Typography variant="h3" fontWeight="bold">
                          {stat.value.toLocaleString()}
                        </Typography>
                        <Chip
                          label={stat.trend}
                          size="small"
                          sx={{
                            mt: 1,
                            backgroundColor: `${stat.color}22`,
                            color: stat.color,
                            fontWeight: 'bold',
                          }}
                        />
                      </Box>
                      <Box sx={{ color: stat.color }}>{stat.icon}</Box>
                    </Box>
                  </CardContent>
                </Card>
              </motion.div>
            </Grid>
          ))}
        </Grid>
      </motion.div>

      {/* Main Content Grid */}
      <Grid container spacing={3}>
        {/* APOD Section */}
        <Grid item xs={12} lg={8}>
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
              {dashboardData.apod && (
                <>
                  <Box sx={{ position: 'relative' }}>
                    <CardMedia
                      component={dashboardData.apod.media_type === 'video' ? 'iframe' : 'img'}
                      height="400"
                      image={dashboardData.apod.url}
                      src={dashboardData.apod.url}
                      alt={dashboardData.apod.title}
                      sx={{ objectFit: 'cover' }}
                    />
                    <Box
                      sx={{
                        position: 'absolute',
                        bottom: 0,
                        left: 0,
                        right: 0,
                        background: 'linear-gradient(to top, rgba(0,0,0,0.9) 0%, transparent 100%)',
                        p: 3,
                      }}
                    >
                      <Typography variant="h4" fontWeight="bold" gutterBottom>
                        {dashboardData.apod.title}
                      </Typography>
                      <Typography variant="body2" sx={{ opacity: 0.9 }}>
                        {dashboardData.apod.explanation.substring(0, 150)}...
                      </Typography>
                    </Box>
                  </Box>
                  <CardContent sx={{ flexGrow: 1 }}>
                    <Box display="flex" justifyContent="space-between" alignItems="center" sx={{ mt: 2 }}>
                      <Box>
                        <Typography variant="h6" gutterBottom>
                          Astronomy Picture of the Day
                        </Typography>
                        <Chip
                          icon={<CalendarToday />}
                          label={dashboardData.apod.date}
                          variant="outlined"
                          size="small"
                        />
                      </Box>
                      <Button
                        variant="contained"
                        endIcon={<ArrowForward />}
                        onClick={() => navigate('/apod')}
                        sx={{ ml: 2 }}
                      >
                        Explore APOD
                      </Button>
                    </Box>
                  </CardContent>
                </>
              )}
            </Card>
          </motion.div>
        </Grid>

        {/* Charts Section */}
        <Grid item xs={12} lg={4}>
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Card sx={{ height: '100%', p: 2 }}>
              <Typography variant="h6" gutterBottom>
                NEO Activity This Week
              </Typography>
              <ResponsiveContainer width="100%" height={350}>
                <AreaChart data={processNEOChartData()}>
                  <defs>
                    <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={theme.palette.primary.main} stopOpacity={0.8} />
                      <stop offset="95%" stopColor={theme.palette.primary.main} stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="colorHazardous" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={theme.palette.error.main} stopOpacity={0.8} />
                      <stop offset="95%" stopColor={theme.palette.error.main} stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                  <XAxis dataKey="date" stroke="#999" />
                  <YAxis stroke="#999" />
                  <RechartsTooltip
                    contentStyle={{
                      backgroundColor: theme.palette.background.paper,
                      border: `1px solid ${theme.palette.divider}`,
                      borderRadius: 8,
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="count"
                    stroke={theme.palette.primary.main}
                    fillOpacity={1}
                    fill="url(#colorCount)"
                  />
                  <Area
                    type="monotone"
                    dataKey="hazardous"
                    stroke={theme.palette.error.main}
                    fillOpacity={1}
                    fill="url(#colorHazardous)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </Card>
          </motion.div>
        </Grid>

        {/* Mars Photos Grid */}
        <Grid item xs={12}>
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <Paper sx={{ p: 3 }}>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                <Box>
                  <Typography variant="h5" fontWeight="bold">
                    Latest Mars Rover Photos
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Captured on Sol {dashboardData.marsPhotos[0]?.sol || 'N/A'}
                  </Typography>
                </Box>
                <Button
                  variant="outlined"
                  endIcon={<ArrowForward />}
                  onClick={() => navigate('/mars')}
                  sx={{ ml: 3, flexShrink: 0 }}
                >
                  View All Photos
                </Button>
              </Box>
              
              <Grid container spacing={2}>
                <AnimatePresence>
                  {dashboardData.marsPhotos.slice(0, 6).map((photo, index) => (
                    <Grid item xs={12} sm={6} md={4} lg={2} key={photo.id}>
                      <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        transition={{ delay: index * 0.1 }}
                        whileHover={{ scale: 1.05 }}
                      >
                        <Card
                          sx={{
                            cursor: 'pointer',
                            height: '100%',
                            '&:hover': {
                              boxShadow: `0 8px 24px ${theme.palette.primary.main}44`,
                            },
                          }}
                          onClick={() => navigate('/mars')}
                        >
                          <CardMedia
                            component="img"
                            height="150"
                            image={photo.img_src}
                            alt={`Mars photo ${photo.id}`}
                            sx={{ objectFit: 'cover' }}
                          />
                          <CardContent sx={{ p: 1.5 }}>
                            <Typography variant="caption" display="block" noWrap fontWeight="bold">
                              {photo.camera.full_name}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {format(new Date(photo.earth_date), 'MMM dd, yyyy')}
                            </Typography>
                          </CardContent>
                        </Card>
                      </motion.div>
                    </Grid>
                  ))}
                </AnimatePresence>
              </Grid>
            </Paper>
          </motion.div>
        </Grid>

        {/* Additional Visualizations */}
        <Grid item xs={12} md={6}>
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.6 }}
          >
            <Card sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Rover Mission Distribution
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={roverDistribution}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={70}
                    fill="#8884d8"
                    dataKey="value"
                    label={false}
                  >
                    {roverDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <RechartsTooltip
                    contentStyle={{
                      backgroundColor: theme.palette.background.paper,
                      border: `1px solid ${theme.palette.divider}`,
                      borderRadius: 8,
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
              {/* Custom Legend */}
              <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, mt: 1 }}>
                {roverDistribution.map((entry, index) => (
                  <Box key={index} sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <Box
                      sx={{
                        width: 12,
                        height: 12,
                        borderRadius: '50%',
                        backgroundColor: entry.color,
                      }}
                    />
                    <Typography variant="caption">
                      {entry.name}: {entry.value}%
                    </Typography>
                  </Box>
                ))}
              </Box>
            </Card>
          </motion.div>
        </Grid>

        {/* Quick Actions */}
        <Grid item xs={12} md={6}>
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.7 }}
          >
            <Card sx={{ p: 3, height: '100%' }}>
              <Typography variant="h6" gutterBottom>
                Quick Explore
              </Typography>
              <Grid container spacing={2}>
                {[
                  {
                    title: 'Track Asteroids',
                    desc: 'Monitor potentially hazardous objects',
                    icon: <Warning />,
                    path: '/neo',
                    color: theme.palette.warning.main,
                  },
                  {
                    title: 'Earth from Space',
                    desc: 'View our planet from EPIC camera',
                    icon: <Public />,
                    path: '/earth',
                    color: theme.palette.success.main,
                  },
                  {
                    title: 'Search Archives',
                    desc: 'Explore NASA\'s media library',
                    icon: <Explore />,
                    path: '/search',
                    color: theme.palette.info.main,
                  },
                  {
                    title: 'Daily Picture',
                    desc: 'Discover today\'s cosmic wonder',
                    icon: <CameraAlt />,
                    path: '/apod',
                    color: theme.palette.secondary.main,
                  },
                ].map((action, index) => (
                  <Grid item xs={12} sm={6} key={index}>
                    <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                      <Paper
                        sx={{
                          p: 2,
                          cursor: 'pointer',
                          border: `1px solid ${action.color}44`,
                          backgroundColor: `${action.color}11`,
                          transition: 'all 0.3s ease',
                          '&:hover': {
                            backgroundColor: `${action.color}22`,
                            borderColor: action.color,
                          },
                        }}
                        onClick={() => navigate(action.path)}
                      >
                        <Box display="flex" alignItems="center" gap={2}>
                          <Box sx={{ color: action.color }}>{action.icon}</Box>
                          <Box>
                            <Typography variant="subtitle1" fontWeight="bold">
                              {action.title}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {action.desc}
                            </Typography>
                          </Box>
                        </Box>
                      </Paper>
                    </motion.div>
                  </Grid>
                ))}
              </Grid>
            </Card>
          </motion.div>
        </Grid>
      </Grid>
    </Container>
  );
};

export default Dashboard;