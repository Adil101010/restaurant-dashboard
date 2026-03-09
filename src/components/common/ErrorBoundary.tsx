import React, { Component, type ReactNode } from 'react';
import { Box, Typography, Button, Paper } from '@mui/material';
import { ErrorOutline, Refresh } from '@mui/icons-material';


interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}


interface State {
  hasError: boolean;
  error: Error | null;
}


class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }


  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }


  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error('ErrorBoundary caught:', error, info);
  }


  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };


  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback;

      return (
        <Box
          display="flex"
          alignItems="center"
          justifyContent="center"
          minHeight="60vh"
          p={3}
        >
          <Paper
            elevation={0}
            sx={{
              p: 5,
              textAlign: 'center',
              borderRadius: 3,
              border: '1px solid',
              borderColor: 'error.light',
              maxWidth: 420,
            }}
          >
            <ErrorOutline sx={{ fontSize: 56, color: 'error.main', mb: 2 }} />

            <Typography variant="h6" fontWeight={700} gutterBottom>
              Something went wrong
            </Typography>

            <Typography variant="body2" color="text.secondary" mb={3}>
              {this.state.error?.message || 'An unexpected error occurred.'}
            </Typography>

            <Box display="flex" gap={2} justifyContent="center">
              <Button
                variant="contained"
                startIcon={<Refresh />}
                onClick={this.handleReset}
                sx={{ borderRadius: 2 }}
              >
                Try Again
              </Button>
              <Button
                variant="outlined"
                onClick={() => window.location.reload()}
                sx={{ borderRadius: 2 }}
              >
                Reload Page
              </Button>
            </Box>
          </Paper>
        </Box>
      );
    }

    return this.props.children;
  }
}


export default ErrorBoundary;
