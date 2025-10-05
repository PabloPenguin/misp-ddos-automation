import { Component } from 'react';
import type { ReactNode } from 'react';
import { Alert, AlertTitle, Button, Box, Container } from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
    };
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <Container maxWidth="md">
          <Box sx={{ mt: 4 }}>
            <Alert
              severity="error"
              action={
                <Button
                  color="inherit"
                  size="small"
                  startIcon={<RefreshIcon />}
                  onClick={this.handleReset}
                >
                  Retry
                </Button>
              }
            >
              <AlertTitle>Something went wrong</AlertTitle>
              {this.state.error?.message || 'An unexpected error occurred'}
            </Alert>
          </Box>
        </Container>
      );
    }

    return this.props.children;
  }
}
