import React, { useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  LinearProgress,
  Alert,
  Button,
  List,
  ListItem,
  ListItemText,
  Chip,
} from '@mui/material';
import {
  CheckCircle as SuccessIcon,
  Error as ErrorIcon,
  Cancel as CancelIcon,
} from '@mui/icons-material';
import type { ProgressTrackerProps } from '../../types/upload';
import { useJobStatus, useCancelJob } from '../../hooks/useFileUpload';

export const ProgressTracker: React.FC<ProgressTrackerProps> = ({
  jobId,
  onComplete,
}) => {
  const { status, isLoading, error } = useJobStatus(jobId, true);
  const { cancel, isCancelling } = useCancelJob();

  useEffect(() => {
    if (status && (status.status === 'completed' || status.status === 'failed')) {
      onComplete({
        jobId,
        status,
        totalEvents: status.processedEvents,
        successfulEvents: status.successfulEvents,
        failedEvents: status.failedEvents,
        errors: status.errors,
      });
    }
  }, [status, jobId, onComplete]);

  const handleCancel = () => {
    cancel(jobId);
  };

  if (isLoading && !status) {
    return (
      <Box sx={{ p: 2 }}>
        <Typography>Loading...</Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error">
        Error loading job status: {error.message}
      </Alert>
    );
  }

  if (!status) {
    return null;
  }

  const isProcessing = status.status === 'processing' || status.status === 'pending';
  const isCompleted = status.status === 'completed';
  const isFailed = status.status === 'failed';

  return (
    <Paper sx={{ p: 3 }}>
      <Box sx={{ mb: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
          <Typography variant="h6">
            Processing Status
          </Typography>
          <Chip
            label={status.status.toUpperCase()}
            color={isCompleted ? 'success' : isFailed ? 'error' : 'primary'}
            size="small"
          />
        </Box>
        
        {isProcessing && (
          <Box sx={{ mt: 2 }}>
            <LinearProgress variant="determinate" value={status.progress} />
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              {status.progress}% complete
            </Typography>
          </Box>
        )}
      </Box>

      <Box sx={{ mb: 2 }}>
        <List dense>
          <ListItem>
            <ListItemText
              primary="Processed Events"
              secondary={status.processedEvents}
            />
          </ListItem>
          <ListItem>
            <ListItemText
              primary={
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <SuccessIcon color="success" sx={{ mr: 1, fontSize: 20 }} />
                  Successful
                </Box>
              }
              secondary={status.successfulEvents}
            />
          </ListItem>
          <ListItem>
            <ListItemText
              primary={
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <ErrorIcon color="error" sx={{ mr: 1, fontSize: 20 }} />
                  Failed
                </Box>
              }
              secondary={status.failedEvents}
            />
          </ListItem>
        </List>
      </Box>

      {status.errors.length > 0 && (
        <Alert severity="warning" sx={{ mb: 2 }}>
          <Typography variant="body2" fontWeight="bold">
            Errors ({status.errors.length}):
          </Typography>
          <List dense>
            {status.errors.slice(0, 5).map((err, idx) => (
              <ListItem key={idx} sx={{ py: 0 }}>
                <Typography variant="caption">
                  {err.line && `Line ${err.line}: `}
                  {err.message}
                </Typography>
              </ListItem>
            ))}
            {status.errors.length > 5 && (
              <Typography variant="caption" color="text.secondary">
                ...and {status.errors.length - 5} more errors
              </Typography>
            )}
          </List>
        </Alert>
      )}

      {isProcessing && (
        <Button
          variant="outlined"
          color="error"
          startIcon={<CancelIcon />}
          onClick={handleCancel}
          disabled={isCancelling}
          fullWidth
        >
          {isCancelling ? 'Cancelling...' : 'Cancel Processing'}
        </Button>
      )}

      {isCompleted && (
        <Alert severity="success" icon={<SuccessIcon />}>
          Processing completed successfully!
        </Alert>
      )}

      {isFailed && (
        <Alert severity="error" icon={<ErrorIcon />}>
          Processing failed. Please check the errors above.
        </Alert>
      )}
    </Paper>
  );
};
