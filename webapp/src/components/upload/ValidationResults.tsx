import React from 'react';
import {
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Alert,
  Box,
} from '@mui/material';
import {
  Error as ErrorIcon,
  Warning as WarningIcon,
} from '@mui/icons-material';
import type { ValidationError } from '../../types/upload';

interface ValidationResultsProps {
  errors: ValidationError[];
  warnings?: ValidationError[];
}

export const ValidationResults: React.FC<ValidationResultsProps> = ({
  errors,
  warnings = [],
}) => {
  const allIssues = [
    ...errors.map(e => ({ ...e, severity: 'error' as const })),
    ...warnings.map(w => ({ ...w, severity: 'warning' as const })),
  ].sort((a, b) => (a.line || 0) - (b.line || 0));

  if (allIssues.length === 0) {
    return (
      <Alert severity="success">
        No validation errors found!
      </Alert>
    );
  }

  return (
    <Paper sx={{ p: 2 }}>
      <Box sx={{ mb: 2 }}>
        <Typography variant="h6" gutterBottom>
          Validation Results
        </Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          {errors.length > 0 && (
            <Chip
              icon={<ErrorIcon />}
              label={`${errors.length} Error${errors.length !== 1 ? 's' : ''}`}
              color="error"
              size="small"
            />
          )}
          {warnings.length > 0 && (
            <Chip
              icon={<WarningIcon />}
              label={`${warnings.length} Warning${warnings.length !== 1 ? 's' : ''}`}
              color="warning"
              size="small"
            />
          )}
        </Box>
      </Box>

      <TableContainer>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Severity</TableCell>
              <TableCell>Line</TableCell>
              <TableCell>Field</TableCell>
              <TableCell>Message</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {allIssues.map((issue, index) => (
              <TableRow key={index}>
                <TableCell>
                  <Chip
                    size="small"
                    label={issue.severity}
                    color={issue.severity === 'error' ? 'error' : 'warning'}
                    icon={issue.severity === 'error' ? <ErrorIcon /> : <WarningIcon />}
                  />
                </TableCell>
                <TableCell>{issue.line || '-'}</TableCell>
                <TableCell>
                  <Typography variant="body2" fontFamily="monospace">
                    {issue.field || '-'}
                  </Typography>
                </TableCell>
                <TableCell>{issue.message}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Paper>
  );
};
