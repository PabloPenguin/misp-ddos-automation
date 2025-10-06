import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  IconButton,
  TextField,
  InputAdornment,
  Pagination,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  Tooltip,
  Menu,
  MenuItem,
  LinearProgress,
  Switch,
  FormControlLabel,
} from '@mui/material';
import {
  Search as SearchIcon,
  Visibility as VisibleIcon,
  OpenInNew as OpenInNewIcon,
  Download as DownloadIcon,
  MoreVert as MoreVertIcon,
  Shield as ShieldIcon,
} from '@mui/icons-material';
import { MISPEvent } from '../types';
import { mispApi } from '../services/mispApi';
import { useSettings } from '../hooks/useSettings';

const EventsPage: React.FC = () => {
  const { settings } = useSettings();
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const [selectedEvent, setSelectedEvent] = useState<MISPEvent | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const [events, setEvents] = useState<MISPEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tlpFilterEnabled, setTlpFilterEnabled] = useState(true);

  const itemsPerPage = 10;

  // Load events from MISP API on component mount
  useEffect(() => {
    const loadEvents = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Set up MISP API credentials
        if (settings.apiKey) {
          mispApi.setCredentials({
            apiKey: settings.apiKey,
            baseUrl: settings.baseUrl,
          });
        }
        
        // Fetch events from MISP with TLP filtering
        const fetchedEvents = await mispApi.getEvents(50, tlpFilterEnabled);
        setEvents(fetchedEvents);
        
      } catch (err) {
        console.error('Failed to load MISP events:', err);
        setError(err instanceof Error ? err.message : 'Failed to load events. Please check your MISP configuration in Settings.');
        
        // Fallback to minimal mock data for demo if API fails
        setEvents([
    {
      id: '1658',
      title: 'Event 1658',
      info: 'DDoS Attack - Network Denial of Service against Financial Institution',
      date: '2024-10-27',
      threat_level: '2',
      analysis: '2',
      distribution: '1',
      published: true,
      attributes: [
        {
          category: 'Network activity',
          type: 'ip-src',
          value: '192.168.1.100',
          to_ids: true
        },
        {
          category: 'Network activity',
          type: 'ip-dst',
          value: '10.0.0.50',
          to_ids: true
        }
      ],
      tags: [
        { name: 'misp-galaxy:mitre-attack-pattern="Network Denial of Service - T1498"', colour: '#ff0000' },
        { name: 'ddos:type="volumetric"', colour: '#ff8800' },
        { name: 'tlp:amber', colour: '#ffa500' }
      ],
      created_at: '2024-10-27T14:30:00Z',
      updated_at: '2024-10-27T14:30:00Z'
    },
    {
      id: '1657',
      title: 'Event 1657',
      info: 'DDoS Attack - DNS Amplification against E-commerce Platform',
      date: '2024-10-26',
      threat_level: '3',
      analysis: '1',
      distribution: '1',
      published: true,
      attributes: [
        {
          category: 'Network activity',
          type: 'ip-src',
          value: '203.0.113.45',
          to_ids: true
        }
      ],
      tags: [
        { name: 'misp-galaxy:mitre-attack-pattern="Network Denial of Service - T1498"', colour: '#ff0000' },
        { name: 'ddos:type="reflection"', colour: '#0088ff' },
        { name: 'tlp:white', colour: '#ffffff' }
      ],
      created_at: '2024-10-26T09:15:00Z',
      updated_at: '2024-10-26T09:15:00Z'
    },
    {
      id: '1656',
      title: 'Event 1656',
      info: 'DDoS Attack - Application Layer Attack on Web Services',
      date: '2024-10-25',
      threat_level: '2',
      analysis: '2',
      distribution: '2',
      published: false,
      attributes: [
        {
          category: 'Network activity',
          type: 'url',
          value: 'https://example-target.com/api/heavy-endpoint',
          to_ids: false
        }
      ],
      tags: [
        { name: 'misp-galaxy:mitre-attack-pattern="Network Denial of Service - T1498"', colour: '#ff0000' },
          { name: 'ddos:type="application-layer"', colour: '#00ff88' },
          { name: 'tlp:green', colour: '#00ff00' }
        ],
        created_at: '2024-10-25T16:45:00Z',
        updated_at: '2024-10-25T16:45:00Z'
      },
        ]);
      } finally {
        setLoading(false);
      }
    };
    
    loadEvents();
  }, [tlpFilterEnabled]);

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
    setPage(1);
  };

  const handlePageChange = (_event: React.ChangeEvent<unknown>, value: number) => {
    setPage(value);
  };

  const handleViewEvent = (event: MISPEvent) => {
    setSelectedEvent(event);
    setDialogOpen(true);
  };

  const handleMenuClick = (event: React.MouseEvent<HTMLElement>, _eventId: string) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const getThreatLevelLabel = (level: string) => {
    const levels: Record<string, { label: string; color: 'error' | 'warning' | 'info' | 'success' }> = {
      '1': { label: 'High', color: 'error' },
      '2': { label: 'Medium', color: 'warning' },
      '3': { label: 'Low', color: 'info' },
      '4': { label: 'Undefined', color: 'success' },
    };
    return levels[level] || { label: 'Unknown', color: 'info' };
  };

  const getAnalysisLabel = (analysis: string) => {
    const labels: Record<string, string> = {
      '0': 'Initial',
      '1': 'Ongoing',
      '2': 'Complete',
    };
    return labels[analysis] || 'Unknown';
  };

  const filteredEvents = events.filter(event =>
    event.info.toLowerCase().includes(searchTerm.toLowerCase()) ||
    event.id.includes(searchTerm)
  );

  const paginatedEvents = filteredEvents.slice(
    (page - 1) * itemsPerPage,
    page * itemsPerPage
  );

  const totalPages = Math.ceil(filteredEvents.length / itemsPerPage);

  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 600 }}>
        MISP Events
      </Typography>
      <Typography variant="body1" color="text.secondary" paragraph>
        View and manage DDoS-related MISP events created through the automation system.
      </Typography>
      
      {loading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
          <LinearProgress sx={{ width: '100%' }} />
        </Box>
      )}
      
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Search and Filter Bar */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <TextField
              fullWidth
              variant="outlined"
              placeholder="Search events by title or ID..."
              value={searchTerm}
              onChange={handleSearchChange}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
            />
            <Tooltip title="Filter out TLP:RED events for security">
              <Box sx={{ display: 'flex', alignItems: 'center', minWidth: 200, border: '1px solid #ccc', borderRadius: 1, px: 2, py: 1 }}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={tlpFilterEnabled}
                      onChange={(e) => setTlpFilterEnabled(e.target.checked)}
                      color="primary"
                    />
                  }
                  label="Hide TLP:RED"
                  sx={{ margin: 0 }}
                />
                <Tooltip title="TLP:RED events contain sensitive information and are hidden by default">
                  <IconButton size="small" sx={{ ml: 1 }}>
                    <ShieldIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              </Box>
            </Tooltip>
          </Box>
        </CardContent>
      </Card>

      {/* Events Table */}
      <Card>
        <CardContent sx={{ p: 0 }}>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Event ID</TableCell>
                  <TableCell>Title</TableCell>
                  <TableCell>Date</TableCell>
                  <TableCell>Threat Level</TableCell>
                  <TableCell>Analysis</TableCell>
                  <TableCell>Published</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {paginatedEvents.map((event) => {
                  const threatLevel = getThreatLevelLabel(event.threat_level);
                  return (
                    <TableRow key={event.id} hover>
                      <TableCell>
                        <Typography variant="body2" fontWeight="medium">
                          #{event.id}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" sx={{ maxWidth: 300 }}>
                          {event.info}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {new Date(event.date).toLocaleDateString()}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={threatLevel.label}
                          color={threatLevel.color}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {getAnalysisLabel(event.analysis)}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={event.published ? 'Published' : 'Draft'}
                          color={event.published ? 'success' : 'default'}
                          size="small"
                          variant={event.published ? 'filled' : 'outlined'}
                        />
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <Tooltip title="View Details">
                            <IconButton
                              size="small"
                              onClick={() => handleViewEvent(event)}
                            >
                              <VisibleIcon />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Open in MISP">
                            <IconButton
                              size="small"
                              component="a"
                              href={`https://your-misp-instance.com/events/view/${event.id}`}
                              target="_blank"
                            >
                              <OpenInNewIcon />
                            </IconButton>
                          </Tooltip>
                          <IconButton
                            size="small"
                            onClick={(e) => handleMenuClick(e, event.id)}
                          >
                            <MoreVertIcon />
                          </IconButton>
                        </Box>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>

          {/* Pagination */}
          {totalPages > 1 && (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
              <Pagination
                count={totalPages}
                page={page}
                onChange={handlePageChange}
                color="primary"
              />
            </Box>
          )}
        </CardContent>
      </Card>

      {/* Event Details Dialog */}
      <Dialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          Event Details - #{selectedEvent?.id}
        </DialogTitle>
        <DialogContent>
          {selectedEvent && (
            <Box>
              <Typography variant="h6" gutterBottom>
                {selectedEvent.info}
              </Typography>
              
              <Alert severity="info" sx={{ mb: 2 }}>
                <strong>Event ID:</strong> {selectedEvent.id}
              </Alert>

              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle2" gutterBottom>
                  Event Information
                </Typography>
                <Typography variant="body2">
                  <strong>Date:</strong> {selectedEvent.date}<br />
                  <strong>Threat Level:</strong> {getThreatLevelLabel(selectedEvent.threat_level).label}<br />
                  <strong>Analysis:</strong> {getAnalysisLabel(selectedEvent.analysis)}<br />
                  <strong>Published:</strong> {selectedEvent.published ? 'Yes' : 'No'}
                </Typography>
              </Box>

              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle2" gutterBottom>
                  Attributes ({selectedEvent.attributes.length})
                </Typography>
                {selectedEvent.attributes.map((attr, index) => (
                  <Box key={index} sx={{ mb: 1, p: 1, bgcolor: 'grey.100', borderRadius: 1 }}>
                    <Typography variant="body2">
                      <strong>{attr.category}</strong> - {attr.type}: {attr.value}
                      <Typography variant="caption" display="block" sx={{ mt: 0.5 }}>
                        To IDS: {attr.to_ids ? 'Yes' : 'No'}
                      </Typography>
                    </Typography>
                  </Box>
                ))}
              </Box>

              <Box>
                <Typography variant="subtitle2" gutterBottom>
                  Tags ({selectedEvent.tags.length})
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  {selectedEvent.tags.map((tag, index) => (
                    <Chip
                      key={index}
                      label={tag.name}
                      size="small"
                      variant="outlined"
                      sx={{ fontSize: '0.75rem' }}
                    />
                  ))}
                </Box>
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Close</Button>
          <Button
            variant="contained"
            startIcon={<OpenInNewIcon />}
            href={`https://your-misp-instance.com/events/view/${selectedEvent?.id}`}
            target="_blank"
          >
            Open in MISP
          </Button>
        </DialogActions>
      </Dialog>

      {/* Context Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={handleMenuClose}>
          <VisibleIcon sx={{ mr: 1 }} />
          View Details
        </MenuItem>
        <MenuItem onClick={handleMenuClose}>
          <OpenInNewIcon sx={{ mr: 1 }} />
          Open in MISP
        </MenuItem>
        <MenuItem onClick={handleMenuClose}>
          <DownloadIcon sx={{ mr: 1 }} />
          Export Event
        </MenuItem>
      </Menu>
    </Box>
  );
};

export default EventsPage;