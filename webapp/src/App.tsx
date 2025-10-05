import { useState } from 'react';
import {
  Box,
  CssBaseline,
  ThemeProvider,
  createTheme,
  Container,
  Toolbar,
} from '@mui/material';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ErrorBoundary } from './components/common/ErrorBoundary';
import { Header } from './components/common/Header';
import { Navigation } from './components/common/Navigation';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { FileUpload } from './components/upload/FileUpload';
import { ProgressTracker } from './components/upload/ProgressTracker';
import { ValidationResults } from './components/upload/ValidationResults';
import type { ProcessingResult } from './types/upload';

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
  },
});

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

function App() {
  const [currentJobId, setCurrentJobId] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<any[]>([]);

  const handleUploadStart = (jobId: string) => {
    setCurrentJobId(jobId);
    setValidationErrors([]);
  };

  const handleUploadComplete = (result: ProcessingResult) => {
    setValidationErrors(result.errors);
    // After a delay, clear the current job
    setTimeout(() => {
      setCurrentJobId(null);
    }, 5000);
  };

  return (
    <ThemeProvider theme={theme}>
      <QueryClientProvider client={queryClient}>
        <ErrorBoundary>
          <CssBaseline />
          <ProtectedRoute>
            <Box sx={{ display: 'flex' }}>
              <Header />
              <Navigation />
              <Box
                component="main"
                sx={{
                  flexGrow: 1,
                  p: 3,
                  width: { sm: `calc(100% - 240px)` },
                  ml: { sm: '240px' },
                }}
              >
                <Toolbar />
                <Container maxWidth="lg">
                  <Box sx={{ my: 4 }}>
                    <FileUpload
                      onUploadStart={handleUploadStart}
                      onUploadComplete={handleUploadComplete}
                      acceptedTypes={['.csv', '.json']}
                      maxFileSize={100 * 1024 * 1024}
                    />

                    {currentJobId && (
                      <Box sx={{ mt: 4 }}>
                        <ProgressTracker
                          jobId={currentJobId}
                          onComplete={handleUploadComplete}
                        />
                      </Box>
                    )}

                    {validationErrors.length > 0 && (
                      <Box sx={{ mt: 4 }}>
                        <ValidationResults errors={validationErrors} />
                      </Box>
                    )}
                  </Box>
                </Container>
              </Box>
            </Box>
          </ProtectedRoute>
        </ErrorBoundary>
      </QueryClientProvider>
    </ThemeProvider>
  );
}

export default App;
