import React, { useState, useEffect } from 'react';
import { Alert, AlertTitle, IconButton, Collapse } from '@mui/material';
import { Close, Info } from '@mui/icons-material';

const FallbackNotice = ({ show = false, onClose }) => {
  const [open, setOpen] = useState(false);
  
  useEffect(() => {
    setOpen(show);
  }, [show]);

  const handleClose = () => {
    setOpen(false);
    if (onClose) onClose();
  };

  return (
    <Collapse in={open}>
      <Alert 
        severity="info" 
        icon={<Info />}
        action={
          <IconButton
            aria-label="close"
            color="inherit"
            size="small"
            onClick={handleClose}
          >
            <Close fontSize="inherit" />
          </IconButton>
        }
        sx={{ 
          mb: 2,
          borderRadius: 2,
          backgroundColor: 'rgba(33, 150, 243, 0.1)',
          border: '1px solid rgba(33, 150, 243, 0.3)',
        }}
      >
        <AlertTitle>Demo Mode Active</AlertTitle>
        NASA API is temporarily rate-limited. Showing sample data to demonstrate functionality. 
        The application works normally with live NASA data when API limits reset.
      </Alert>
    </Collapse>
  );
};

export default FallbackNotice; 