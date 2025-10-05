import React from 'react';
import {
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  IconButton,
  Typography,
  CircularProgress,
  Alert,
  Tooltip,
} from '@mui/material';
import {
  Visibility as ViewIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';
import type { EventListProps } from '../../types/events';

export const EventList: React.FC<EventListProps> = ({
  events,
  onEventSelect,
  isLoading = false,
}) => {
  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (events.length === 0) {
    return (
      <Alert severity="info">
        No events found. Upload a file or create an event to get started.
      </Alert>
    );
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  return (
    <Paper>
      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Timestamp</TableCell>
              <TableCell>Source IP</TableCell>
              <TableCell>Destination IP</TableCell>
              <TableCell>Attack Type</TableCell>
              <TableCell>Protocol</TableCell>
              <TableCell>Status</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {events.map((event) => (
              <TableRow
                key={event.id}
                hover
                sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
              >
                <TableCell>
                  <Typography variant="body2">
                    {formatDate(event.timestamp)}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="body2" fontFamily="monospace">
                    {event.sourceIp}:{event.sourcePort}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="body2" fontFamily="monospace">
                    {event.destinationIp}:{event.destinationPort}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Chip
                    label={event.attackType}
                    color="error"
                    size="small"
                  />
                </TableCell>
                <TableCell>
                  <Chip
                    label={event.protocol}
                    variant="outlined"
                    size="small"
                  />
                </TableCell>
                <TableCell>
                  <Chip
                    label={event.eventId ? 'Synced' : 'Local'}
                    color={event.eventId ? 'success' : 'default'}
                    size="small"
                  />
                </TableCell>
                <TableCell align="right">
                  <Tooltip title="View Details">
                    <IconButton
                      size="small"
                      onClick={() => onEventSelect(event)}
                      color="primary"
                    >
                      <ViewIcon />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Delete">
                    <IconButton
                      size="small"
                      color="error"
                    >
                      <DeleteIcon />
                    </IconButton>
                  </Tooltip>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Paper>
  );
};
