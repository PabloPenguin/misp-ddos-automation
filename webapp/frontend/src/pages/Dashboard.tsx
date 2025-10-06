import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Grid,
  Paper,
  Typography,
  Card,
  CardContent,
  Chip,
  Alert,
  CircularProgress,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Switch,
  FormControlLabel,
  Tooltip,
  IconButton,
} from '@mui/material';
import {
  Warning as WarningIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  Refresh as RefreshIcon,
  Shield as ShieldIcon,
  Timeline as TimelineIcon,
  Assessment as AssessmentIcon,
  Public as PublicIcon,
} from '@mui/icons-material';
import { cachedDataService, CachedDashboardData } from '../services/cachedDataService';
import { MISPEvent } from '../types';
import sampleData from '../data/sampleData.json';
import {
  ThreatLevelPieChart,
  AttackTypeBarChart,
  DailyEventsLineChart,
  TlpDistributionDoughnutChart,
  ChartContainer,
} from '../components/charts/InteractiveCharts';

// Simplified dashboard without charts for now - will add after installing dependencies

interface DashboardStats {
  totalEvents: number;
  eventsToday: number;
  eventsThisWeek: number;
  highThreatEvents: number;
  publishedEvents: number;
  unpublishedEvents: number;
  tlpRedFiltered: number;
}

interface EventMetrics {
  dailyEvents: { date: string; count: number }[];
  threatLevelDistribution: { level: string; count: number; color: string }[];
  attackTypeDistribution: { type: string; count: number }[];
  tlpDistribution: { tlp: string; count: number; color: string }[];
}

const Dashboard: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [events, setEvents] = useState<MISPEvent[]>([]);
  const [stats, setStats] = useState<DashboardStats>({
    totalEvents: 0,
    eventsToday: 0,
    eventsThisWeek: 0,
    highThreatEvents: 0,
    publishedEvents: 0,
    unpublishedEvents: 0,
    tlpRedFiltered: 0,
  });
  const [metrics, setMetrics] = useState<EventMetrics>({
    dailyEvents: [],
    threatLevelDistribution: [],
    attackTypeDistribution: [],
    tlpDistribution: [],
  });
  const [tlpFilterEnabled, setTlpFilterEnabled] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<string>('');
  const [dataAge, setDataAge] = useState<number | null>(null);

  const fetchDashboardData = async (showProgress = false) => {
    if (showProgress) setRefreshing(true);
    setError(null);

    try {
      // Check if cached data is available
      const isAvailable = await cachedDataService.isDataAvailable();
      if (!isAvailable) {
        setError('No cached data available. Data will be refreshed automatically by GitHub Actions.');
        return;
      }

      // Fetch cached dashboard data
      const cachedData: CachedDashboardData = await cachedDataService.getDashboardData();
      
      // Update state with cached data
      setEvents(cachedData.events);
      setStats(cachedData.stats);
      setMetrics(cachedData.metrics);
      setLastUpdated(cachedData.lastUpdated);
      
      // Get data age
      const age = await cachedDataService.getDataAge();
      setDataAge(age);

      console.log('✅ Dashboard data loaded from cache', {
        events: cachedData.events.length,
        lastUpdated: cachedData.lastUpdated,
        dataAge: age
      });

    } catch (err) {
      console.error('Failed to fetch cached dashboard data:', err);
      console.log('🔄 Loading fallback sample data...');
      
      try {
        // Use embedded sample data as fallback
        const fallbackEvents = sampleData.events;
        
        setStats({
          totalEvents: fallbackEvents.length,
          publishedEvents: fallbackEvents.filter(e => e.published).length,
          unpublishedEvents: fallbackEvents.filter(e => !e.published).length,
          tlpRedFiltered: 0,
          eventsToday: 1,
          eventsThisWeek: 3,
          highThreatEvents: 2,
        });

        setLastUpdated(sampleData.lastUpdated || new Date().toISOString());
        setDataAge(0);
        
        console.log('✅ Fallback sample data loaded successfully');
        setError('Using sample data for demonstration. Live data will be available when connected to MISP instance.');
        
      } catch (fallbackErr) {
        console.error('Failed to load fallback sample data:', fallbackErr);
        setError('Failed to load dashboard data. Please check your connection or try refreshing.');
      }
    } finally {
      setLoading(false);
      if (showProgress) setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [tlpFilterEnabled]);

  // Simplified display components (charts will be added after installing dependencies)

  const StatCard: React.FC<{
    title: string;
    value: number;
    icon: React.ReactNode;
    color: string;
    trend?: string;
  }> = ({ title, value, icon, color, trend }) => (
    <Card 
      sx={{ 
        height: '100%', 
        background: `linear-gradient(135deg, ${color}22, ${color}11)`,
        cursor: 'pointer',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        position: 'relative',
        overflow: 'hidden',
        '&:hover': {
          transform: 'translateY(-8px) scale(1.02)',
          boxShadow: `0 20px 40px rgba(0, 0, 0, 0.4), 0 0 30px ${color}40`,
          background: `linear-gradient(135deg, ${color}33, ${color}22)`,
          '& .stat-value': {
            transform: 'scale(1.1)',
            color: '#FFD700',
          },
          '& .stat-icon': {
            transform: 'rotate(360deg) scale(1.2)',
            filter: 'drop-shadow(0 0 20px #FFD700)',
          },
          '&::before': {
            opacity: 1,
          },
        },
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: `linear-gradient(45deg, transparent, ${color}20, transparent)`,
          transform: 'translateX(-100%)',
          transition: 'transform 0.6s ease',
          opacity: 0,
        },
        '&:hover::before': {
          transform: 'translateX(100%)',
          opacity: 1,
        },
      }}
    >
      <CardContent>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Box>
            <Typography 
              color="textSecondary" 
              gutterBottom 
              variant="body2"
              sx={{
                fontFamily: 'Roboto Mono, monospace',
                fontWeight: 500,
                letterSpacing: '0.5px',
              }}
            >
              {title}
            </Typography>
            <Typography 
              variant="h3" 
              component="div" 
              className="stat-value"
              sx={{ 
                color, 
                fontWeight: 'bold',
                fontFamily: 'Roboto Mono, monospace',
                transition: 'all 0.3s ease',
                textShadow: `0 0 10px ${color}40`,
              }}
            >
              {value.toLocaleString()}
            </Typography>
            {trend && (
              <Typography 
                variant="body2" 
                color="textSecondary"
                sx={{
                  fontFamily: 'Roboto Mono, monospace',
                  fontSize: '0.75rem',
                  opacity: 0.8,
                }}
              >
                {trend}
              </Typography>
            )}
          </Box>
          <Box 
            className="stat-icon"
            sx={{ 
              color, 
              fontSize: '3rem',
              transition: 'all 0.6s cubic-bezier(0.4, 0, 0.2, 1)',
              filter: `drop-shadow(0 4px 8px ${color}30)`,
            }}
          >
            {icon}
          </Box>
        </Box>
      </CardContent>
    </Card>
  );

  if (loading) {
    return (
      <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
          <CircularProgress size={60} />
          <Typography variant="h6" sx={{ ml: 2 }}>
            Loading MISP Dashboard...
          </Typography>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography 
          variant="h4" 
          component="h1" 
          fontWeight="bold"
          sx={{
            fontFamily: 'Roboto Mono, monospace',
            background: 'linear-gradient(45deg, #FFD700, #FFA000, #FFD700)',
            backgroundSize: '200% 200%',
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            color: 'transparent',
            animation: 'gradient-shift 3s ease infinite',
            textShadow: '0 0 30px rgba(255, 215, 0, 0.5)',
            position: 'relative',
            '@keyframes gradient-shift': {
              '0%': { backgroundPosition: '0% 50%' },
              '50%': { backgroundPosition: '100% 50%' },
              '100%': { backgroundPosition: '0% 50%' },
            },
            '&::after': {
              content: '"MISP DDoS Analytics Dashboard"',
              position: 'absolute',
              top: 0,
              left: 0,
              color: '#FFD700',
              zIndex: -1,
              filter: 'blur(10px)',
              opacity: 0.3,
            },
          }}
        >
          🛡️ MISP DDoS Analytics Dashboard
        </Typography>
        <Box display="flex" alignItems="center" gap={2}>
          <FormControlLabel
            control={
              <Switch
                checked={tlpFilterEnabled}
                onChange={(e) => setTlpFilterEnabled(e.target.checked)}
                color="primary"
                sx={{
                  '& .MuiSwitch-track': {
                    backgroundColor: tlpFilterEnabled ? '#FFD700' : '#666666',
                    opacity: 1,
                    boxShadow: tlpFilterEnabled ? '0 0 10px rgba(255, 215, 0, 0.5)' : 'none',
                    transition: 'all 0.3s ease',
                  },
                  '& .MuiSwitch-thumb': {
                    boxShadow: tlpFilterEnabled ? '0 0 15px rgba(255, 215, 0, 0.8)' : '0 2px 4px rgba(0,0,0,0.3)',
                    transition: 'all 0.3s ease',
                  },
                }}
              />
            }
            label={
              <Box display="flex" alignItems="center" gap={1}>
                <ShieldIcon 
                  sx={{ 
                    color: tlpFilterEnabled ? '#FFD700' : '#666666',
                    filter: tlpFilterEnabled ? 'drop-shadow(0 0 8px #FFD700)' : 'none',
                    transition: 'all 0.3s ease',
                  }} 
                />
                <Typography 
                  sx={{
                    fontFamily: 'Roboto Mono, monospace',
                    fontWeight: tlpFilterEnabled ? 600 : 400,
                    color: tlpFilterEnabled ? '#FFD700' : 'text.secondary',
                    textShadow: tlpFilterEnabled ? '0 0 10px rgba(255, 215, 0, 0.3)' : 'none',
                    transition: 'all 0.3s ease',
                  }}
                >
                  Filter TLP:RED
                </Typography>
              </Box>
            }
          />
          <Tooltip title="Refresh Data" arrow>
            <IconButton
              onClick={() => fetchDashboardData(true)}
              disabled={refreshing}
              color="primary"
              sx={{
                position: 'relative',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                '&:hover': {
                  transform: 'scale(1.1) rotate(180deg)',
                  boxShadow: '0 0 20px rgba(255, 215, 0, 0.5)',
                  '&::before': {
                    opacity: 1,
                    transform: 'scale(1.5)',
                  },
                },
                '&::before': {
                  content: '""',
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  width: '100%',
                  height: '100%',
                  background: 'radial-gradient(circle, rgba(255, 215, 0, 0.3) 0%, transparent 70%)',
                  borderRadius: '50%',
                  transform: 'translate(-50%, -50%) scale(0)',
                  transition: 'all 0.3s ease',
                  opacity: 0,
                  zIndex: -1,
                },
                animation: refreshing ? 'refresh-spin 1s linear infinite' : 'none',
                '@keyframes refresh-spin': {
                  '0%': { transform: 'rotate(0deg)' },
                  '100%': { transform: 'rotate(360deg)' },
                },
              }}
            >
              {refreshing ? (
                <CircularProgress 
                  size={24} 
                  sx={{ 
                    color: '#FFD700',
                    filter: 'drop-shadow(0 0 10px #FFD700)',
                  }} 
                />
              ) : (
                <RefreshIcon 
                  sx={{ 
                    filter: 'drop-shadow(0 2px 4px rgba(255, 215, 0, 0.3))',
                  }} 
                />
              )}
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      {/* Data Freshness Indicator */}
      {lastUpdated && (
        <Alert 
          severity={dataAge !== null && dataAge > 60 ? "warning" : "info"} 
          sx={{ 
            mb: 3,
            position: 'relative',
            overflow: 'hidden',
            '&::before': {
              content: '""',
              position: 'absolute',
              top: 0,
              left: '-100%',
              width: '100%',
              height: '100%',
              background: 'linear-gradient(90deg, transparent, rgba(255, 215, 0, 0.1), transparent)',
              animation: 'shimmer 3s infinite',
            },
            '@keyframes shimmer': {
              '0%': { left: '-100%' },
              '100%': { left: '100%' },
            },
            border: '1px solid #FFD700',
            borderRadius: '8px',
            boxShadow: '0 4px 20px rgba(255, 215, 0, 0.2)',
          }}
          icon={
            <AssessmentIcon 
              sx={{
                animation: 'pulse 2s infinite',
                '@keyframes pulse': {
                  '0%': { 
                    transform: 'scale(1)',
                    filter: 'drop-shadow(0 0 5px #FFD700)',
                  },
                  '50%': { 
                    transform: 'scale(1.1)',
                    filter: 'drop-shadow(0 0 15px #FFD700)',
                  },
                  '100%': { 
                    transform: 'scale(1)',
                    filter: 'drop-shadow(0 0 5px #FFD700)',
                  },
                },
              }}
            />
          }
        >
          <Box display="flex" alignItems="center" justifyContent="space-between" width="100%">
            <Typography 
              variant="body2"
              sx={{
                fontFamily: 'Roboto Mono, monospace',
                fontWeight: 500,
              }}
            >
              Data last updated: {new Date(lastUpdated).toLocaleString()}
              {dataAge !== null && (
                <> ({dataAge < 60 ? `${dataAge} minutes ago` : `${Math.floor(dataAge / 60)} hours ago`})</>
              )}
            </Typography>
            <Typography 
              variant="body2" 
              sx={{ 
                fontStyle: 'italic',
                fontFamily: 'Roboto Mono, monospace',
                color: '#FFD700',
                textShadow: '0 0 10px rgba(255, 215, 0, 0.3)',
              }}
            >
              🛡️ TLP:RED events filtered for security
            </Typography>
          </Box>
        </Alert>
      )}

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Statistics Cards */}
      <Grid container spacing={3} mb={3}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Events"
            value={stats.totalEvents}
            icon={<AssessmentIcon />}
            color="#1976d2"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Events Today"
            value={stats.eventsToday}
            icon={<TimelineIcon />}
            color="#2e7d32"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="High Threat"
            value={stats.highThreatEvents}
            icon={<WarningIcon />}
            color="#ed6c02"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Published"
            value={stats.publishedEvents}
            icon={<PublicIcon />}
            color="#9c27b0"
          />
        </Grid>
      </Grid>

      {/* Analytics Sections */}
      <Grid container spacing={3}>
        {/* Interactive Threat Level Chart */}
        <Grid item xs={12} lg={6}>
          <Paper sx={{ height: 450 }}>
            <ChartContainer title="Threat Level Distribution" height={380}>
              <ThreatLevelPieChart data={metrics.threatLevelDistribution} />
            </ChartContainer>
          </Paper>
        </Grid>

        {/* Interactive Attack Type Chart */}
        <Grid item xs={12} lg={6}>
          <Paper sx={{ height: 450 }}>
            <ChartContainer title="Attack Type Distribution" height={380}>
              <AttackTypeBarChart data={metrics.attackTypeDistribution} />
            </ChartContainer>
          </Paper>
        </Grid>

        {/* Interactive Daily Events Chart */}
        <Grid item xs={12} lg={6}>
          <Paper sx={{ height: 450 }}>
            <ChartContainer title="Daily Events Trend" height={380}>
              <DailyEventsLineChart data={metrics.dailyEvents} />
            </ChartContainer>
          </Paper>
        </Grid>

        {/* TLP Distribution Chart */}
        <Grid item xs={12} lg={6}>
          <Paper sx={{ height: 450 }}>
            <ChartContainer title="TLP Distribution" height={380}>
              <TlpDistributionDoughnutChart data={metrics.tlpDistribution} />
            </ChartContainer>
          </Paper>
        </Grid>

        {/* Legacy Threat Level Distribution (Hidden) */}
        <Grid item xs={12} lg={6} sx={{ display: 'none' }}>
          <Paper sx={{ p: 3, height: 400 }}>
            <Typography variant="h6" gutterBottom>
              Threat Level Distribution (Legacy)
            </Typography>
            <Box sx={{ mt: 2 }}>
              {metrics.threatLevelDistribution.map((item, index) => (
                <Box key={index} sx={{ mb: 2 }}>
                  <Box display="flex" justifyContent="space-between" alignItems="center">
                    <Typography variant="body1">{item.level}</Typography>
                    <Chip 
                      label={item.count} 
                      sx={{ 
                        backgroundColor: item.color,
                        color: item.color === '#ffeb3b' ? '#000' : '#fff'
                      }} 
                    />
                  </Box>
                  <Box sx={{ width: '100%', mt: 1 }}>
                    <Box
                      sx={{
                        height: 8,
                        backgroundColor: '#f5f5f5',
                        borderRadius: 4,
                        overflow: 'hidden',
                      }}
                    >
                      <Box
                        sx={{
                          height: '100%',
                          backgroundColor: item.color,
                          width: `${stats.totalEvents > 0 ? (item.count / stats.totalEvents) * 100 : 0}%`,
                          borderRadius: 4,
                        }}
                      />
                    </Box>
                  </Box>
                </Box>
              ))}
            </Box>
          </Paper>
        </Grid>

        {/* Attack Types */}
        <Grid item xs={12} lg={6}>
          <Paper sx={{ p: 3, height: 400 }}>
            <Typography variant="h6" gutterBottom>
              Attack Type Distribution
            </Typography>
            <Box sx={{ mt: 2 }}>
              {metrics.attackTypeDistribution.length > 0 ? (
                metrics.attackTypeDistribution.map((item, index) => (
                  <Box key={index} sx={{ mb: 2 }}>
                    <Box display="flex" justifyContent="space-between" alignItems="center">
                      <Typography variant="body1" sx={{ textTransform: 'capitalize' }}>
                        {item.type}
                      </Typography>
                      <Chip 
                        label={item.count} 
                        color="primary"
                        variant="outlined"
                      />
                    </Box>
                    <Box sx={{ width: '100%', mt: 1 }}>
                      <Box
                        sx={{
                          height: 8,
                          backgroundColor: '#f5f5f5',
                          borderRadius: 4,
                          overflow: 'hidden',
                        }}
                      >
                        <Box
                          sx={{
                            height: '100%',
                            backgroundColor: '#1976d2',
                            width: `${stats.totalEvents > 0 ? (item.count / stats.totalEvents) * 100 : 0}%`,
                            borderRadius: 4,
                          }}
                        />
                      </Box>
                    </Box>
                  </Box>
                ))
              ) : (
                <Typography variant="body2" color="textSecondary">
                  No attack type data available
                </Typography>
              )}
            </Box>
          </Paper>
        </Grid>

        {/* Recent Events List */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, height: 400 }}>
            <Typography variant="h6" gutterBottom>
              Recent Events
            </Typography>
            <Box sx={{ maxHeight: 320, overflow: 'auto' }}>
              <List>
                {events.slice(0, 10).map((event, index) => (
                  <ListItem key={event.id} divider={index < 9}>
                    <ListItemIcon>
                      {event.threat_level === '1' ? (
                        <ErrorIcon color="error" />
                      ) : event.threat_level === '2' ? (
                        <WarningIcon color="warning" />
                      ) : (
                        <CheckCircleIcon color="success" />
                      )}
                    </ListItemIcon>
                    <ListItemText
                      primary={event.info}
                      secondary={
                        <Box>
                          <Typography variant="body2" color="textSecondary">
                            {event.date} • Event #{event.id}
                          </Typography>
                          <Box mt={0.5}>
                            {event.tags.slice(0, 3).map((tag) => (
                              <Chip
                                key={tag.name}
                                label={tag.name}
                                size="small"
                                sx={{ mr: 0.5, mt: 0.5, fontSize: '0.7rem' }}
                                color={
                                  tag.name.includes('tlp:red') ? 'error' :
                                  tag.name.includes('tlp:amber') ? 'warning' :
                                  tag.name.includes('tlp:green') ? 'success' :
                                  'default'
                                }
                              />
                            ))}
                          </Box>
                        </Box>
                      }
                    />
                    {event.published && (
                      <Chip
                        label="Published"
                        size="small"
                        color="primary"
                        variant="outlined"
                      />
                    )}
                  </ListItem>
                ))}
              </List>
            </Box>
          </Paper>
        </Grid>
      </Grid>

      {/* Footer Info */}
      <Box mt={3}>
        <Paper sx={{ p: 2 }}>
          <Grid container spacing={2} alignItems="center">
            <Grid item>
              <ShieldIcon color="primary" />
            </Grid>
            <Grid item xs>
              <Typography variant="body2" color="textSecondary">
                <strong>Security Notice:</strong> This dashboard automatically filters out TLP:RED events to maintain confidentiality. 
                {tlpFilterEnabled && ` TLP filtering is currently enabled.`}
              </Typography>
            </Grid>
            <Grid item>
              <Chip
                label={`${stats.totalEvents} Events Displayed`}
                color="primary"
                variant="outlined"
              />
            </Grid>
          </Grid>
        </Paper>
      </Box>
    </Container>
  );
};

export default Dashboard;