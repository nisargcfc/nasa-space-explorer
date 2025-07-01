import React from 'react';
import { Box, CircularProgress, Typography } from '@mui/material';
import { motion } from 'framer-motion';

const LoadingSpinner = ({ message = 'Loading...', size = 60 }) => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <Box
        display="flex"
        flexDirection="column"
        alignItems="center"
        justifyContent="center"
        minHeight="400px"
        gap={2}
      >
        <CircularProgress size={size} thickness={4} />
        <Typography variant="body1" color="text.secondary">
          {message}
        </Typography>
      </Box>
    </motion.div>
  );
};

export default LoadingSpinner; 