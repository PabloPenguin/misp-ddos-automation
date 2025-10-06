import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import { CssBaseline, Container } from '@mui/material';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Components
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import DashboardPage from './pages/DashboardPage';
import EventsPage from './pages/EventsPage';
import SettingsPage from './pages/SettingsPage';

// Theme configuration
import { blackYellowTheme } from './theme/blackYellowTheme';

// Query client configuration
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider theme={blackYellowTheme}>
        <CssBaseline />
        <Router basename="/misp-ddos-automation">
          <div style={{ display: 'flex', minHeight: '100vh' }}>
            <Sidebar />
            <div style={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
              <Header />
              <Container 
                component="main" 
                sx={{ 
                  flexGrow: 1, 
                  py: 3,
                  px: { xs: 2, sm: 3 }
                }}
              >
                <Routes>
                  <Route path="/" element={<DashboardPage />} />
                  <Route path="/events" element={<EventsPage />} />
                  <Route path="/settings" element={<SettingsPage />} />
                </Routes>
              </Container>
            </div>
          </div>
        </Router>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;