import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Alert,
} from '@mui/material';
import sampleData from '../data/sampleData.json';

interface DashboardStats {
  totalEvents: number;
  publishedEvents: number;
  unpublishedEvents: number;
  highThreatEvents: number;
}

const Dashboard: React.FC = () => {
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
      console.log('🎯 Loading sample MISP data...');
      
      const events = sampleData.events;
      
      setStats({
        totalEvents: events.length,
        publishedEvents: events.filter(e => e.published).length,
        unpublishedEvents: events.filter(e => !e.published).length,
        highThreatEvents: events.filter(e => e.threat_level_id === "2").length,
      });
      
      setLastUpdated(sampleData.lastUpdated);
      setLoading(false);
      
      console.log('✅ Sample data loaded successfully');
    };
    
    loadSampleData();
  }, []);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <Typography variant="h6" color="primary">
          Loading MISP Dashboard...
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom sx={{ color: 'primary.main', fontWeight: 'bold' }}>
        🛡️ MISP DDoS Automation Dashboard
      </Typography>
      
      <Alert severity="info" sx={{ mb: 3 }}>
        📊 Displaying sample DDoS threat intelligence data for demonstration purposes
      </Alert>

      <Grid container spacing={3}>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ background: 'linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%)' }}>
            <CardContent>
              <Typography color="primary" gutterBottom>
                Total Events
              </Typography>
              <Typography variant="h4" sx={{ color: '#FFD700', fontWeight: 'bold' }}>
                {stats.totalEvents}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ background: 'linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%)' }}>
            <CardContent>
              <Typography color="primary" gutterBottom>
                Published Events
              </Typography>
              <Typography variant="h4" sx={{ color: '#FFD700', fontWeight: 'bold' }}>
                {stats.publishedEvents}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ background: 'linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%)' }}>
            <CardContent>
              <Typography color="primary" gutterBottom>
                High Threat Events
              </Typography>
              <Typography variant="h4" sx={{ color: '#FF6B6B', fontWeight: 'bold' }}>
                {stats.highThreatEvents}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ background: 'linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%)' }}>
            <CardContent>
              <Typography color="primary" gutterBottom>
                Unpublished Events
              </Typography>
              <Typography variant="h4" sx={{ color: '#4ECDC4', fontWeight: 'bold' }}>
                {stats.unpublishedEvents}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12}>
          <Card sx={{ background: 'linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%)' }}>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ color: 'primary.main' }}>
                🎯 Recent DDoS Threat Intelligence
              </Typography>
              
              {sampleData.events.map((event) => (
                <Box key={event.id} sx={{ mb: 2, p: 2, border: '1px solid #333', borderRadius: 1 }}>
                  <Typography variant="subtitle1" sx={{ color: '#FFD700', fontWeight: 'bold' }}>
                    {event.info}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Date: {event.date} | Threat Level: {event.threat_level_id} | Published: {event.published ? '✅' : '❌'}
                  </Typography>
                  <Box sx={{ mt: 1 }}>
                    {event.tags.map((tag) => (
                      <Typography 
                        key={tag}
                        component="span"
                        sx={{ 
                          display: 'inline-block',
                          backgroundColor: '#333',
                          color: '#FFD700',
                          px: 1,
                          py: 0.5,
                          mr: 1,
                          borderRadius: 1,
                          fontSize: '0.75rem'
                        }}
                      >
                        {tag}
                      </Typography>
                    ))}
                  </Box>
                </Box>
              ))}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Box sx={{ mt: 3, textAlign: 'center' }}>
        <Typography variant="caption" color="text.secondary">
          Last Updated: {new Date(lastUpdated).toLocaleString()}
        </Typography>
      </Box>
    </Box>
  );
};

export default Dashboard;