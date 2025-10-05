import React from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import {

  Paper,
  TextField,
  Button,
  Grid,
  MenuItem,
  Typography,
  CircularProgress,
} from '@mui/material';
import { Save as SaveIcon } from '@mui/icons-material';
import { eventSchema } from '../../services/validation';
import type { EventFormProps, DDoSEvent } from '../../types/events';

const protocols = ['TCP', 'UDP', 'ICMP', 'HTTP', 'HTTPS'];
const attackTypes = [
  'SYN Flood',
  'UDP Flood',
  'ICMP Flood',
  'HTTP Flood',
  'DNS Amplification',
  'NTP Amplification',
];

export const EventForm: React.FC<EventFormProps> = ({
  onSubmit,
  initialValues,
  isLoading = false,
}) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<any>({
    resolver: yupResolver(eventSchema) as any,
    defaultValues: initialValues || {
      timestamp: new Date().toISOString().slice(0, 16),
      sourceIp: '',
      sourcePort: 0,
      destinationIp: '',
      destinationPort: 0,
      protocol: 'TCP',
      attackType: 'SYN Flood',
    },
  });

  const handleFormSubmit = (data: Partial<DDoSEvent>) => {
    onSubmit(data as DDoSEvent);
  };

  return (
    <Paper sx={{ p: 3 }}>
      <Typography variant="h6" gutterBottom>
        {initialValues ? 'Edit Event' : 'Create New Event'}
      </Typography>

      <form onSubmit={handleSubmit(handleFormSubmit)}>
        <Grid container spacing={2}>
          <Grid size={{ xs: 12 }}>
            <TextField
              {...register('timestamp')}
              label="Timestamp"
              type="datetime-local"
              fullWidth
              error={!!errors.timestamp}
              helperText={String(errors.timestamp?.message || "")}
              disabled={isLoading}
              InputLabelProps={{ shrink: true }}
            />
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <TextField
              {...register('sourceIp')}
              label="Source IP"
              fullWidth
              error={!!errors.sourceIp}
              helperText={String(errors.sourceIp?.message || "")}
              disabled={isLoading}
              placeholder="192.168.1.1"
            />
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <TextField
              {...register('sourcePort', { valueAsNumber: true })}
              label="Source Port"
              type="number"
              fullWidth
              error={!!errors.sourcePort}
              helperText={String(errors.sourcePort?.message || "")}
              disabled={isLoading}
              inputProps={{ min: 0, max: 65535 }}
            />
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <TextField
              {...register('destinationIp')}
              label="Destination IP"
              fullWidth
              error={!!errors.destinationIp}
              helperText={String(errors.destinationIp?.message || "")}
              disabled={isLoading}
              placeholder="10.0.0.1"
            />
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <TextField
              {...register('destinationPort', { valueAsNumber: true })}
              label="Destination Port"
              type="number"
              fullWidth
              error={!!errors.destinationPort}
              helperText={String(errors.destinationPort?.message || "")}
              disabled={isLoading}
              inputProps={{ min: 0, max: 65535 }}
            />
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <TextField
              {...register('protocol')}
              label="Protocol"
              select
              fullWidth
              error={!!errors.protocol}
              helperText={String(errors.protocol?.message || "")}
              disabled={isLoading}
            >
              {protocols.map((protocol) => (
                <MenuItem key={protocol} value={protocol}>
                  {protocol}
                </MenuItem>
              ))}
            </TextField>
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <TextField
              {...register('attackType')}
              label="Attack Type"
              select
              fullWidth
              error={!!errors.attackType}
              helperText={String(errors.attackType?.message || "")}
              disabled={isLoading}
            >
              {attackTypes.map((type) => (
                <MenuItem key={type} value={type}>
                  {type}
                </MenuItem>
              ))}
            </TextField>
          </Grid>

          <Grid size={{ xs: 12, md: 4 }}>
            <TextField
              {...register('duration', { valueAsNumber: true })}
              label="Duration (seconds)"
              type="number"
              fullWidth
              error={!!errors.duration}
              helperText={String(errors.duration?.message || "")}
              disabled={isLoading}
              inputProps={{ min: 0 }}
            />
          </Grid>

          <Grid size={{ xs: 12, md: 4 }}>
            <TextField
              {...register('bandwidth', { valueAsNumber: true })}
              label="Bandwidth (Mbps)"
              type="number"
              fullWidth
              error={!!errors.bandwidth}
              helperText={String(errors.bandwidth?.message || "")}
              disabled={isLoading}
              inputProps={{ min: 0 }}
            />
          </Grid>

          <Grid size={{ xs: 12, md: 4 }}>
            <TextField
              {...register('packetsPerSecond', { valueAsNumber: true })}
              label="Packets/Second"
              type="number"
              fullWidth
              error={!!errors.packetsPerSecond}
              helperText={String(errors.packetsPerSecond?.message || "")}
              disabled={isLoading}
              inputProps={{ min: 0 }}
            />
          </Grid>

          <Grid size={{ xs: 12 }}>
            <TextField
              {...register('description')}
              label="Description"
              multiline
              rows={3}
              fullWidth
              error={!!errors.description}
              helperText={String(errors.description?.message || "")}
              disabled={isLoading}
              placeholder="Additional details about the attack..."
            />
          </Grid>

          <Grid size={{ xs: 12 }}>
            <Button
              type="submit"
              variant="contained"
              fullWidth
              size="large"
              disabled={isLoading}
              startIcon={isLoading ? <CircularProgress size={20} /> : <SaveIcon />}
            >
              {isLoading ? 'Saving...' : 'Save Event'}
            </Button>
          </Grid>
        </Grid>
      </form>
    </Paper>
  );
};
