import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Alert,
  Paper,
  Chip,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  LinearProgress,
} from '@mui/material';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  ChartOptions,
} from 'chart.js';
import { Bar, Line, Doughnut, Pie } from 'react-chartjs-2';
import {
  Warning as WarningIcon,
  Security as SecurityIcon,
  Timeline as TimelineIcon,
  Assessment as AssessmentIcon,
} from '@mui/icons-material';
import sampleData from '../data/sampleData.json';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

interface DashboardStats {
  totalEvents: number;
  publishedEvents: number;
  unpublishedEvents: number;
  highThreatEvents: number;
}

const VisualDashboard: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats>({
    totalEvents: 0,
    publishedEvents: 0,
    unpublishedEvents: 0,
    highThreatEvents: 0,
  });
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<string>('');

  useEffect(() => {
    // Load sample data
    const loadSampleData = () => {
      console.log('🎯 Loading visual MISP dashboard...');
      
      const events = sampleData.events;
      
      setStats({
        totalEvents: events.length,
        publishedEvents: events.filter(e => e.published).length,
        unpublishedEvents: events.filter(e => !e.published).length,
        highThreatEvents: events.filter(e => e.threat_level_id === "2").length,
      });
      
      setLastUpdated(sampleData.lastUpdated);
      setLoading(false);
      
      console.log('✅ Visual dashboard loaded with charts');
    };
    
    setTimeout(loadSampleData, 1000); // Add slight delay for loading effect
  }, []);

  // Chart configurations with cybersecurity theme
  const barOptions: ChartOptions<'bar'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { 
        labels: { color: '#FFD700' }
      },
      title: { 
        color: '#FFD700',
        font: { size: 14 }
      }
    },
    scales: {
      x: { 
        ticks: { color: '#FFD700' },
        grid: { color: '#333' }
      },
      y: { 
        ticks: { color: '#FFD700' },
        grid: { color: '#333' }
      }
    }
  };

  const lineOptions: ChartOptions<'line'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { 
        labels: { color: '#FFD700' }
      }
    },
    scales: {
      x: { 
        ticks: { color: '#FFD700' },
        grid: { color: '#333' }
      },
      y: { 
        ticks: { color: '#FFD700' },
        grid: { color: '#333' }
      }
    }
  };

  const doughnutOptions: ChartOptions<'doughnut'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { 
        labels: { color: '#FFD700' },
        position: 'bottom'
      }
    }
  };

  const pieOptions: ChartOptions<'pie'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { 
        labels: { color: '#FFD700' },
        position: 'bottom'
      }
    }
  };

  // Threat Level Distribution Chart
  const threatLevelData = {
    labels: ['High Risk', 'Medium Risk', 'Low Risk'],
    datasets: [{
      data: [2, 1, 0],
      backgroundColor: ['#FF6B6B', '#FFD700', '#4ECDC4'],
      borderColor: ['#FF4444', '#FFC000', '#2E8B7F'],
      borderWidth: 2,
    }]
  };

  // Attack Type Distribution Chart
  const attackTypeData = {
    labels: ['DDoS Volumetric', 'UDP Amplification', 'HTTP Flood', 'DNS Reflection'],
    datasets: [{
      label: 'Attack Incidents',
      data: [5, 3, 2, 1],
      backgroundColor: '#FFD700',
      borderColor: '#FFC000',
      borderWidth: 2,
    }]
  };

  // Timeline Chart - Events over time
  const timelineData = {
    labels: ['Oct 5', 'Oct 6', 'Oct 7'],
    datasets: [{
      label: 'DDoS Events',
      data: [1, 1, 1],
      borderColor: '#FF6B6B',
      backgroundColor: 'rgba(255, 107, 107, 0.1)',
      fill: true,
      tension: 0.4,
    }]
  };

  // TLP Distribution Chart
  const tlpData = {
    labels: ['TLP:AMBER', 'TLP:WHITE', 'TLP:GREEN'],
    datasets: [{
      data: [1, 1, 1],
      backgroundColor: ['#FFC000', '#FFFFFF', '#4ECDC4'],
      borderColor: ['#FFB000', '#CCCCCC', '#2E8B7F'],
      borderWidth: 2,
    }]
  };

  if (loading) {
    return (
      <Box display="flex" flexDirection="column" justifyContent="center" alignItems="center" minHeight="60vh">
        <Typography variant="h6" color="primary" gutterBottom>
          Loading MISP Visual Dashboard...
        </Typography>
        <Box sx={{ width: '300px', mt: 2 }}>
          <LinearProgress sx={{ 
            backgroundColor: '#333',
            '& .MuiLinearProgress-bar': { backgroundColor: '#FFD700' }
          }} />
        </Box>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3, backgroundColor: '#000', minHeight: '100vh' }}>
      <Typography variant="h3" gutterBottom sx={{ 
        color: '#FFD700', 
        fontWeight: 'bold',
        textAlign: 'center',
        textShadow: '2px 2px 4px rgba(0,0,0,0.8)'
      }}>
        🛡️ MISP DDoS Threat Intelligence Dashboard
      </Typography>
      
      <Alert severity="info" sx={{ mb: 3, backgroundColor: '#1a1a1a', color: '#FFD700' }}>
        📊 Real-time DDoS threat intelligence visualization - Sample data for demonstration
      </Alert>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ 
            background: 'linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%)',
            border: '1px solid #FFD700',
            '&:hover': { boxShadow: '0 0 20px rgba(255, 215, 0, 0.3)' }
          }}>
            <CardContent sx={{ textAlign: 'center' }}>
              <SecurityIcon sx={{ fontSize: 40, color: '#FFD700', mb: 1 }} />
              <Typography color="primary" gutterBottom>
                Total Threats
              </Typography>
              <Typography variant="h3" sx={{ color: '#FFD700', fontWeight: 'bold' }}>
                {stats.totalEvents}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ 
            background: 'linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%)',
            border: '1px solid #4ECDC4'
          }}>
            <CardContent sx={{ textAlign: 'center' }}>
              <AssessmentIcon sx={{ fontSize: 40, color: '#4ECDC4', mb: 1 }} />
              <Typography color="primary" gutterBottom>
                Published Events
              </Typography>
              <Typography variant="h3" sx={{ color: '#4ECDC4', fontWeight: 'bold' }}>
                {stats.publishedEvents}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ 
            background: 'linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%)',
            border: '1px solid #FF6B6B'
          }}>
            <CardContent sx={{ textAlign: 'center' }}>
              <WarningIcon sx={{ fontSize: 40, color: '#FF6B6B', mb: 1 }} />
              <Typography color="primary" gutterBottom>
                High Threat Events
              </Typography>
              <Typography variant="h3" sx={{ color: '#FF6B6B', fontWeight: 'bold' }}>
                {stats.highThreatEvents}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ 
            background: 'linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%)',
            border: '1px solid #FFC000'
          }}>
            <CardContent sx={{ textAlign: 'center' }}>
              <TimelineIcon sx={{ fontSize: 40, color: '#FFC000', mb: 1 }} />
              <Typography color="primary" gutterBottom>
                Active Investigations
              </Typography>
              <Typography variant="h3" sx={{ color: '#FFC000', fontWeight: 'bold' }}>
                {stats.unpublishedEvents}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Charts Grid */}
      <Grid container spacing={3}>
        {/* Threat Level Distribution */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ 
            p: 3, 
            backgroundColor: '#1a1a1a', 
            border: '1px solid #333',
            height: '400px'
          }}>
            <Typography variant="h6" gutterBottom sx={{ color: '#FFD700', textAlign: 'center' }}>
              🎯 Threat Level Distribution
            </Typography>
            <Box sx={{ height: '300px' }}>
              <Doughnut data={threatLevelData} options={doughnutOptions} />
            </Box>
          </Paper>
        </Grid>

        {/* Attack Type Distribution */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ 
            p: 3, 
            backgroundColor: '#1a1a1a', 
            border: '1px solid #333',
            height: '400px'
          }}>
            <Typography variant="h6" gutterBottom sx={{ color: '#FFD700', textAlign: 'center' }}>
              ⚔️ Attack Type Analysis
            </Typography>
            <Box sx={{ height: '300px' }}>
              <Bar data={attackTypeData} options={barOptions} />
            </Box>
          </Paper>
        </Grid>

        {/* Timeline Chart */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ 
            p: 3, 
            backgroundColor: '#1a1a1a', 
            border: '1px solid #333',
            height: '400px'
          }}>
            <Typography variant="h6" gutterBottom sx={{ color: '#FFD700', textAlign: 'center' }}>
              📈 DDoS Events Timeline
            </Typography>
            <Box sx={{ height: '300px' }}>
              <Line data={timelineData} options={lineOptions} />
            </Box>
          </Paper>
        </Grid>

        {/* TLP Distribution */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ 
            p: 3, 
            backgroundColor: '#1a1a1a', 
            border: '1px solid #333',
            height: '400px'
          }}>
            <Typography variant="h6" gutterBottom sx={{ color: '#FFD700', textAlign: 'center' }}>
              🔒 TLP Classification
            </Typography>
            <Box sx={{ height: '300px' }}>
              <Pie data={tlpData} options={pieOptions} />
            </Box>
          </Paper>
        </Grid>

        {/* Recent Threats List */}
        <Grid item xs={12}>
          <Paper sx={{ 
            p: 3, 
            backgroundColor: '#1a1a1a', 
            border: '1px solid #333'
          }}>
            <Typography variant="h6" gutterBottom sx={{ color: '#FFD700' }}>
              🚨 Recent DDoS Threat Intelligence
            </Typography>
            
            <List>
              {sampleData.events.map((event) => (
                <ListItem key={event.id} sx={{ 
                  mb: 2, 
                  backgroundColor: '#2d2d2d', 
                  borderRadius: 2,
                  border: '1px solid #444'
                }}>
                  <ListItemIcon>
                    <WarningIcon sx={{ color: event.threat_level_id === "2" ? '#FF6B6B' : '#FFD700' }} />
                  </ListItemIcon>
                  <ListItemText
                    primary={
                      <Typography sx={{ color: '#FFD700', fontWeight: 'bold' }}>
                        {event.info}
                      </Typography>
                    }
                    secondary={
                      <Box>
                        <Typography variant="body2" sx={{ color: '#ccc' }}>
                          📅 {event.date} | 🎯 Threat Level {event.threat_level_id} | 
                          {event.published ? ' ✅ Published' : ' 🔄 Under Investigation'}
                        </Typography>
                        <Box sx={{ mt: 1 }}>
                          {event.tags.map((tag) => (
                            <Chip 
                              key={tag}
                              label={tag}
                              size="small"
                              sx={{ 
                                mr: 1,
                                backgroundColor: '#333',
                                color: '#FFD700',
                                border: '1px solid #FFD700'
                              }}
                            />
                          ))}
                        </Box>
                      </Box>
                    }
                  />
                </ListItem>
              ))}
            </List>
          </Paper>
        </Grid>
      </Grid>

      <Box sx={{ mt: 4, textAlign: 'center', p: 2, backgroundColor: '#1a1a1a', borderRadius: 2 }}>
        <Typography variant="body2" sx={{ color: '#ccc' }}>
          🕐 Last Updated: {new Date(lastUpdated).toLocaleString()} | 
          📊 Data Source: MISP Threat Intelligence Platform | 
          🔄 Auto-refresh: Every 30 minutes
        </Typography>
      </Box>
    </Box>
  );
};

export default VisualDashboard;