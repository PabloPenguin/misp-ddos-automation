import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  Divider,
  Chip,
  Grid,
  IconButton,
} from '@mui/material';
import {
  Close as CloseIcon,
  ContentCopy as CopyIcon,
} from '@mui/icons-material';
import type { EventDetailProps } from '../../types/events';

export const EventDetail: React.FC<EventDetailProps> = ({ event, onClose }) => {
  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const InfoRow = ({ label, value, copyable = false }: { label: string; value: string | number; copyable?: boolean }) => (
    <Box sx={{ mb: 2 }}>
      <Typography variant="caption" color="text.secondary" display="block">
        {label}
      </Typography>
      <Box sx={{ display: 'flex', alignItems: 'center' }}>
        <Typography variant="body1" fontFamily={copyable ? 'monospace' : 'inherit'}>
          {value}
        </Typography>
        {copyable && (
          <IconButton size="small" onClick={() => handleCopy(String(value))} sx={{ ml: 1 }}>
            <CopyIcon fontSize="small" />
          </IconButton>
        )}
      </Box>
    </Box>
  );

  return (
    <Dialog open onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Typography variant="h6">Event Details</Typography>
          <IconButton onClick={onClose} size="small">
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>
      
      <DialogContent dividers>
        <Grid container spacing={3}>
          <Grid size={{ xs: 12, md: 6 }}>
            <Typography variant="subtitle2" gutterBottom>
              Source Information
            </Typography>
            <InfoRow label="Source IP" value={event.sourceIp} copyable />
            <InfoRow label="Source Port" value={event.sourcePort} />
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <Typography variant="subtitle2" gutterBottom>
              Destination Information
            </Typography>
            <InfoRow label="Destination IP" value={event.destinationIp} copyable />
            <InfoRow label="Destination Port" value={event.destinationPort} />
          </Grid>

          <Grid size={{ xs: 12 }}>
            <Divider sx={{ my: 1 }} />
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <InfoRow label="Timestamp" value={new Date(event.timestamp).toLocaleString()} />
            <InfoRow label="Protocol" value={event.protocol} />
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <InfoRow label="Attack Type" value={event.attackType} />
            {event.eventId && <InfoRow label="MISP Event ID" value={event.eventId} copyable />}
          </Grid>

          {(event.duration || event.bandwidth || event.packetsPerSecond) && (
            <>
              <Grid size={{ xs: 12 }}>
                <Divider sx={{ my: 1 }} />
                <Typography variant="subtitle2" gutterBottom>
                  Attack Metrics
                </Typography>
              </Grid>
              {event.duration && (
                <Grid size={{ xs: 12, md: 4 }}>
                  <InfoRow label="Duration (seconds)" value={event.duration} />
                </Grid>
              )}
              {event.bandwidth && (
                <Grid size={{ xs: 12, md: 4 }}>
                  <InfoRow label="Bandwidth (Mbps)" value={event.bandwidth} />
                </Grid>
              )}
              {event.packetsPerSecond && (
                <Grid size={{ xs: 12, md: 4 }}>
                  <InfoRow label="Packets/Second" value={event.packetsPerSecond} />
                </Grid>
              )}
            </>
          )}

          {event.description && (
            <>
              <Grid size={{ xs: 12 }}>
                <Divider sx={{ my: 1 }} />
              </Grid>
              <Grid size={{ xs: 12 }}>
                <Typography variant="subtitle2" gutterBottom>
                  Description
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {event.description}
                </Typography>
              </Grid>
            </>
          )}

          {event.tags && event.tags.length > 0 && (
            <>
              <Grid size={{ xs: 12 }}>
                <Divider sx={{ my: 1 }} />
              </Grid>
              <Grid size={{ xs: 12 }}>
                <Typography variant="subtitle2" gutterBottom>
                  Tags
                </Typography>
                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                  {event.tags.map((tag, index) => (
                    <Chip key={index} label={tag} size="small" />
                  ))}
                </Box>
              </Grid>
            </>
          )}
        </Grid>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
};
