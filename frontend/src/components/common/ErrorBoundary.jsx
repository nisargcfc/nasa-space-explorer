import React from 'react';
import { Alert, AlertTitle, Button, Box, Typography, Container } from '@mui/material';
import { Refresh, BugReport } from '@mui/icons-material';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // Log error details
    console.error('Error caught by boundary:', error, errorInfo);
    
    this.setState({
      error: error,
      errorInfo: errorInfo
    });

    // In production, you could send this to an error reporting service
    if (process.env.NODE_ENV === 'production') {
      // Example: Sentry.captureException(error);
    }
  }

  handleReload = () => {
    window.location.reload();
  };

  handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <Container maxWidth="md" sx={{ mt: 8 }}>
          <Box textAlign="center">
            <Alert 
              severity="error" 
              sx={{ 
                mb: 3,
                textAlign: 'left'
              }}
            >
              <AlertTitle>
                <Box display="flex" alignItems="center" gap={1}>
                  <BugReport />
                  Oops! Something went wrong
                </Box>
              </AlertTitle>
              
              <Typography variant="body1" gutterBottom>
                We're sorry, but something unexpected happened. Our team has been notified.
              </Typography>

              {process.env.NODE_ENV === 'development' && this.state.error && (
                <Box sx={{ mt: 2, p: 2, bgcolor: 'grey.100', borderRadius: 1 }}>
                  <Typography variant="subtitle2" color="error" gutterBottom>
                    Error Details (Development Mode):
                  </Typography>
                  <Typography variant="body2" component="pre" sx={{ fontSize: '0.8rem', whiteSpace: 'pre-wrap' }}>
                    {this.state.error.toString()}
                  </Typography>
                  {this.state.errorInfo.componentStack && (
                    <Typography variant="body2" component="pre" sx={{ fontSize: '0.8rem', whiteSpace: 'pre-wrap', mt: 1 }}>
                      {this.state.errorInfo.componentStack}
                    </Typography>
                  )}
                </Box>
              )}
            </Alert>

            <Box display="flex" gap={2} justifyContent="center">
              <Button
                variant="contained"
                startIcon={<Refresh />}
                onClick={this.handleReload}
                color="primary"
              >
                Reload Page
              </Button>
              
              <Button
                variant="outlined"
                onClick={this.handleReset}
              >
                Try Again
              </Button>
            </Box>

            <Typography variant="body2" color="text.secondary" sx={{ mt: 3 }}>
              If this problem persists, please contact support or try refreshing the page.
            </Typography>
          </Box>
        </Container>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary; 