import React, { useState, useEffect } from 'react';
import {
  Container,
  Grid,
  Card,
  CardContent,
  Typography,
  Box,
  Chip,
  Button,
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Alert,
  LinearProgress,
  Skeleton,
  ToggleButton,
  ToggleButtonGroup,
  Tooltip,
  Divider,
} from '@mui/material';
import {
  Warning,
  CheckCircle,
  Speed,
  Straighten,
  Schedule,
  Info,
  Close,
  TrendingUp,
  Visibility,
  FilterList,
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  ScatterChart,
  Scatter,
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
import { format, subDays, addDays } from 'date-fns';
import { useNEO } from '../hooks/useNASAData';

const NEOTracker = () => {
  const [selectedAsteroid, setSelectedAsteroid] = useState(null);
  const [timeRange, setTimeRange] = useState(7); // days
  const [viewMode, setViewMode] = useState('grid');
  const [hazardFilter, setHazardFilter] = useState('all'); // all, hazardous, safe

  // Calculate date range (NASA NEO API limited to 7 days max)
  const today = new Date();
  const startDate = subDays(today, Math.min(timeRange, 7));
  const endDate = today; // NASA NEO API doesn't support future dates

  const { data: neoData, loading, error } = useNEO(
    format(startDate, 'yyyy-MM-dd'),
    format(endDate, 'yyyy-MM-dd')
  );

  // Process NEO data for visualizations
  const processedData = React.useMemo(() => {
    if (!neoData?.asteroids_by_date) return { asteroids: [], dailyData: [], hazardData: [], stats: { total: 0, hazardous: 0, largest: 0, fastest: 0, closest: 0 } };

    const allAsteroids = [];
    const dailyData = [];
    
    Object.entries(neoData.asteroids_by_date).forEach(([date, asteroids]) => {
      allAsteroids.push(...asteroids.map(asteroid => ({
        ...asteroid,
        date,
        diameter_avg: asteroid.diameter_meters ? (asteroid.diameter_meters.min + asteroid.diameter_meters.max) / 2 : 0,
        velocity_kmh: asteroid.close_approach?.velocity_kmh || 0,
        distance_km: asteroid.close_approach?.miss_distance_km || 0,
        danger_score: calculateDangerScore(asteroid),
      })));

      dailyData.push({
        date: format(new Date(date), 'MM/dd'),
        total: asteroids.length,
        hazardous: asteroids.filter(a => a.is_potentially_hazardous).length,
        avgSize: asteroids.length > 0 ? asteroids.reduce((sum, a) => sum + (a.diameter_meters?.max || 0), 0) / asteroids.length : 0,
        closestDistance: asteroids.length > 0 ? Math.min(...asteroids.map(a => a.close_approach?.miss_distance_km || Infinity)) : 0,
      });
    });

    // Filter asteroids based on hazard filter
    const filteredAsteroids = allAsteroids.filter(asteroid => {
      if (hazardFilter === 'hazardous') return asteroid.is_potentially_hazardous;
      if (hazardFilter === 'safe') return !asteroid.is_potentially_hazardous;
      return true;
    });

    // Hazard distribution data
    const hazardData = [
      { name: 'Safe', value: allAsteroids.filter(a => !a.is_potentially_hazardous).length, color: '#4caf50' },
      { name: 'Potentially Hazardous', value: allAsteroids.filter(a => a.is_potentially_hazardous).length, color: '#f44336' }
    ];

    return { 
      asteroids: filteredAsteroids.sort((a, b) => b.danger_score - a.danger_score),
      dailyData: dailyData.sort((a, b) => new Date(a.date) - new Date(b.date)),
      hazardData,
      stats: {
        total: allAsteroids.length,
        hazardous: allAsteroids.filter(a => a.is_potentially_hazardous).length,
        largest: allAsteroids.length > 0 ? Math.max(...allAsteroids.map(a => a.diameter_avg || 0)) : 0,
        fastest: allAsteroids.length > 0 ? Math.max(...allAsteroids.map(a => a.velocity_kmh || 0)) : 0,
        closest: allAsteroids.length > 0 ? Math.min(...allAsteroids.map(a => a.distance_km || Infinity)) : 0,
      }
    };
  }, [neoData, hazardFilter]);

  function calculateDangerScore(asteroid) {
    const sizeFactor = (asteroid.diameter_meters?.max || 0) / 1000; // Size in km
    const speedFactor = (asteroid.close_approach?.velocity_kmh || 0) / 100000; // Normalized speed
    const distanceFactor = 1 / ((asteroid.close_approach?.miss_distance_km || 1000000000) / 1000000); // Inverse distance
    const hazardMultiplier = asteroid.is_potentially_hazardous ? 2 : 1;
    
    return (sizeFactor + speedFactor + distanceFactor) * hazardMultiplier;
  }

  const formatNumber = (num) => {
    return new Intl.NumberFormat().format(Math.round(num));
  };

  const StatCard = ({ title, value, icon, color, subtitle }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card sx={{ height: '100%' }}>
        <CardContent>
          <Box display="flex" alignItems="center" justifyContent="space-between">
            <Box>
              <Typography color="text.secondary" variant="subtitle2">
                {title}
              </Typography>
              <Typography variant="h4" fontWeight="bold" color={color}>
                {value}
              </Typography>
              {subtitle && (
                <Typography variant="caption" color="text.secondary">
                  {subtitle}
                </Typography>
              )}
            </Box>
            <Box sx={{ color, opacity: 0.7 }}>
              {icon}
            </Box>
          </Box>
        </CardContent>
      </Card>
    </motion.div>
  );

  const AsteroidCard = ({ asteroid }) => (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ scale: 1.02 }}
      transition={{ duration: 0.3 }}
    >
      <Card 
        sx={{ 
          cursor: 'pointer',
          '&:hover': { boxShadow: 4 },
          borderLeft: `4px solid ${asteroid.is_potentially_hazardous ? '#f44336' : '#4caf50'}`
        }}
        onClick={() => setSelectedAsteroid(asteroid)}
      >
        <CardContent>
          <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={1}>
            <Typography variant="h6" noWrap>
              {asteroid.name}
            </Typography>
            <Chip
              icon={asteroid.is_potentially_hazardous ? <Warning /> : <CheckCircle />}
              label={asteroid.is_potentially_hazardous ? 'Hazardous' : 'Safe'}
              color={asteroid.is_potentially_hazardous ? 'error' : 'success'}
              size="small"
            />
          </Box>
          
          <Grid container spacing={1}>
            <Grid item xs={6}>
              <Box display="flex" alignItems="center" gap={0.5}>
                <Straighten fontSize="small" color="action" />
                <Typography variant="body2">
                  {formatNumber(asteroid.diameter_avg)} m
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={6}>
              <Box display="flex" alignItems="center" gap={0.5}>
                <Speed fontSize="small" color="action" />
                <Typography variant="body2">
                  {formatNumber(asteroid.velocity_kmh)} km/h
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12}>
              <Box display="flex" alignItems="center" gap={0.5}>
                <Schedule fontSize="small" color="action" />
                <Typography variant="body2">
                  Distance: {formatNumber(asteroid.distance_km)} km
                </Typography>
              </Box>
            </Grid>
          </Grid>

          <Box mt={1}>
            <Typography variant="caption" color="text.secondary">
              Closest approach: {format(new Date(asteroid.date), 'MMM dd, yyyy')}
            </Typography>
          </Box>

          {/* Danger score bar */}
          <Box mt={1}>
            <Typography variant="caption">
              Risk Level: {asteroid.danger_score.toFixed(2)}
            </Typography>
            <LinearProgress 
              variant="determinate" 
              value={Math.min(asteroid.danger_score * 20, 100)} 
              color={asteroid.is_potentially_hazardous ? 'error' : 'success'}
              sx={{ mt: 0.5 }}
            />
          </Box>
        </CardContent>
      </Card>
    </motion.div>
  );

  if (loading) {
    return (
      <Container maxWidth="xl" sx={{ mt: 4 }}>
        <Grid container spacing={3}>
          {[...Array(8)].map((_, i) => (
            <Grid item xs={12} sm={6} md={3} key={i}>
              <Skeleton variant="rectangular" height={150} />
            </Grid>
          ))}
        </Grid>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="xl" sx={{ mt: 4 }}>
        <Alert severity="error">
          Failed to load NEO data: {error}
        </Alert>
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
            Near Earth Object Tracker
          </Typography>
          <Typography variant="h5" color="text.secondary">
            Monitor asteroids and their proximity to Earth in real-time
          </Typography>
        </Box>
      </motion.div>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Asteroids"
            value={processedData.stats.total}
            icon={<Visibility fontSize="large" />}
            color="primary.main"
            subtitle={`Past ${timeRange} days`}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Potentially Hazardous"
            value={processedData.stats.hazardous}
            icon={<Warning fontSize="large" />}
            color="error.main"
            subtitle="Require monitoring"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Largest Asteroid"
            value={`${formatNumber(processedData.stats.largest)} m`}
            icon={<Straighten fontSize="large" />}
            color="warning.main"
            subtitle="Maximum diameter"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Closest Approach"
            value={`${formatNumber(processedData.stats.closest)} km`}
            icon={<Speed fontSize="large" />}
            color="info.main"
            subtitle="Minimum distance"
          />
        </Grid>
      </Grid>

      {/* Charts */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {/* Daily Activity Chart */}
        <Grid item xs={12} lg={8}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Daily Asteroid Activity
              </Typography>
              <Box sx={{ width: '100%', height: 300 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={processedData.dailyData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <RechartsTooltip />
                    <Area
                      type="monotone"
                      dataKey="total"
                      stackId="1"
                      stroke="#2196f3"
                      fill="#2196f3"
                      fillOpacity={0.6}
                      name="Total Asteroids"
                    />
                    <Area
                      type="monotone"
                      dataKey="hazardous"
                      stackId="2"
                      stroke="#f44336"
                      fill="#f44336"
                      fillOpacity={0.8}
                      name="Potentially Hazardous"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Hazard Distribution */}
        <Grid item xs={12} lg={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Risk Distribution
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={processedData.hazardData}
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={80}
                    dataKey="value"
                    labelLine={false}
                    label={false}
                  >
                    {processedData.hazardData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <RechartsTooltip 
                    formatter={(value, name) => [value, name]}
                    labelFormatter={() => ''}
                  />
                </PieChart>
              </ResponsiveContainer>
              {/* Custom Legend */}
              <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, mt: 1 }}>
                {processedData.hazardData.map((entry, index) => (
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
                      {entry.name}: {entry.value}
                    </Typography>
                  </Box>
                ))}
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Filters */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item>
            <Typography variant="subtitle1">Time Range:</Typography>
          </Grid>
          <Grid item>
            <ToggleButtonGroup
              value={timeRange}
              exclusive
              onChange={(e, value) => value && setTimeRange(value)}
              size="small"
            >
              <ToggleButton value={1}>1 Day</ToggleButton>
              <ToggleButton value={3}>3 Days</ToggleButton>
              <ToggleButton value={7}>7 Days</ToggleButton>
            </ToggleButtonGroup>
          </Grid>
          <Grid item>
            <Typography variant="subtitle1">Filter:</Typography>
          </Grid>
          <Grid item>
            <ToggleButtonGroup
              value={hazardFilter}
              exclusive
              onChange={(e, value) => value && setHazardFilter(value)}
              size="small"
            >
              <ToggleButton value="all">All</ToggleButton>
              <ToggleButton value="hazardous">Hazardous</ToggleButton>
              <ToggleButton value="safe">Safe</ToggleButton>
            </ToggleButtonGroup>
          </Grid>
        </Grid>
      </Paper>

      {/* Asteroids List */}
      <Typography variant="h5" gutterBottom>
        Asteroid Details ({processedData.asteroids.length} objects)
      </Typography>
      
      <Grid container spacing={2}>
        <AnimatePresence>
          {processedData.asteroids.map((asteroid) => (
            <Grid item xs={12} sm={6} md={4} lg={3} key={asteroid.id}>
              <AsteroidCard asteroid={asteroid} />
            </Grid>
          ))}
        </AnimatePresence>
      </Grid>

      {/* Asteroid Detail Modal */}
      <Dialog
        open={!!selectedAsteroid}
        onClose={() => setSelectedAsteroid(null)}
        maxWidth="md"
        fullWidth
      >
        {selectedAsteroid && (
          <>
            <DialogTitle>
              <Box display="flex" justifyContent="space-between" alignItems="center">
                <Typography variant="h5">
                  {selectedAsteroid.name}
                </Typography>
                <IconButton onClick={() => setSelectedAsteroid(null)}>
                  <Close />
                </IconButton>
              </Box>
            </DialogTitle>
            <DialogContent>
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Typography variant="h6" gutterBottom>
                    Physical Characteristics
                  </Typography>
                  <TableContainer component={Paper} variant="outlined">
                    <Table size="small">
                      <TableBody>
                        <TableRow>
                          <TableCell>Minimum Diameter</TableCell>
                          <TableCell>{formatNumber(selectedAsteroid.diameter_meters.min)} m</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell>Maximum Diameter</TableCell>
                          <TableCell>{formatNumber(selectedAsteroid.diameter_meters.max)} m</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell>Potentially Hazardous</TableCell>
                          <TableCell>
                            <Chip
                              icon={selectedAsteroid.is_potentially_hazardous ? <Warning /> : <CheckCircle />}
                              label={selectedAsteroid.is_potentially_hazardous ? 'Yes' : 'No'}
                              color={selectedAsteroid.is_potentially_hazardous ? 'error' : 'success'}
                              size="small"
                            />
                          </TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Grid>

                <Grid item xs={12} md={6}>
                  <Typography variant="h6" gutterBottom>
                    Orbital Data
                  </Typography>
                  <TableContainer component={Paper} variant="outlined">
                    <Table size="small">
                      <TableBody>
                        <TableRow>
                          <TableCell>Velocity</TableCell>
                          <TableCell>{formatNumber(selectedAsteroid.velocity_kmh)} km/h</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell>Miss Distance</TableCell>
                          <TableCell>{formatNumber(selectedAsteroid.distance_km)} km</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell>Closest Approach</TableCell>
                          <TableCell>{format(new Date(selectedAsteroid.date), 'PPP')}</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell>Risk Score</TableCell>
                          <TableCell>
                            <Box display="flex" alignItems="center" gap={1}>
                              <LinearProgress 
                                variant="determinate" 
                                value={Math.min(selectedAsteroid.danger_score * 20, 100)} 
                                color={selectedAsteroid.is_potentially_hazardous ? 'error' : 'success'}
                                sx={{ flexGrow: 1 }}
                              />
                              <Typography variant="body2">
                                {selectedAsteroid.danger_score.toFixed(2)}
                              </Typography>
                            </Box>
                          </TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Grid>
              </Grid>
            </DialogContent>
          </>
        )}
      </Dialog>
    </Container>
  );
};

export default NEOTracker;