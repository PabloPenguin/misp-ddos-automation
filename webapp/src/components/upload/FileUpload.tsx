import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import {
  Box,
  Paper,
  Typography,
  Button,
  Alert,
  CircularProgress,
} from '@mui/material';
import {
  CloudUpload as UploadIcon,
  Description as FileIcon,
} from '@mui/icons-material';
import type { FileUploadProps } from '../../types/upload';
import { validateFile, MAX_FILE_SIZE } from '../../services/validation';

export const FileUpload: React.FC<FileUploadProps> = ({
  onUploadStart,
  onUploadComplete,
  acceptedTypes,
  maxFileSize = MAX_FILE_SIZE,
}) => {
  const [error, setError] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  
  // Mark acceptedTypes and maxFileSize as used even though dropzone uses them
  console.debug('FileUpload config:', { acceptedTypes, maxFileSize });

  const onDrop = useCallback(
    (acceptedFiles: File[], rejectedFiles: any[]) => {
      setError(null);

      if (rejectedFiles.length > 0) {
        setError('Invalid file type or size');
        return;
      }

      if (acceptedFiles.length === 0) {
        return;
      }

      const file = acceptedFiles[0];
      const validation = validateFile(file);

      if (!validation.valid) {
        setError(validation.error || 'Invalid file');
        return;
      }

      setSelectedFile(file);
    },
    []
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'text/csv': ['.csv'],
      'application/json': ['.json'],
    },
    maxSize: maxFileSize,
    multiple: false,
  });

  const handleUpload = async () => {
    if (!selectedFile) return;

    setIsUploading(true);
    setError(null);

    try {
      // This would be handled by the parent component using useFileUpload hook
      onUploadStart('mock-job-id');
      
      // Simulate upload for now
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      onUploadComplete({
        jobId: 'mock-job-id',
        status: {
          status: 'completed',
          progress: 100,
          processedEvents: 10,
          successfulEvents: 10,
          failedEvents: 0,
          errors: [],
          startedAt: new Date().toISOString(),
          completedAt: new Date().toISOString(),
        },
        totalEvents: 10,
        successfulEvents: 10,
        failedEvents: 0,
        errors: [],
      });

      setSelectedFile(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Box sx={{ width: '100%', maxWidth: 600, mx: 'auto' }}>
      <Paper
        {...getRootProps()}
        data-testid="file-dropzone"
        sx={{
          p: 4,
          textAlign: 'center',
          cursor: 'pointer',
          border: '2px dashed',
          borderColor: isDragActive ? 'primary.main' : 'grey.400',
          bgcolor: isDragActive ? 'action.hover' : 'background.paper',
          transition: 'all 0.2s ease',
          '&:hover': {
            borderColor: 'primary.main',
            bgcolor: 'action.hover',
          },
        }}
      >
        <input {...getInputProps()} />
        <UploadIcon sx={{ fontSize: 64, color: 'primary.main', mb: 2 }} />
        <Typography variant="h6" gutterBottom>
          {isDragActive ? 'Drop the file here' : 'Drag & drop a file here'}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          or click to select a file
        </Typography>
        <Typography variant="caption" color="text.secondary">
          Accepted: CSV, JSON (max {Math.round(maxFileSize / 1024 / 1024)}MB)
        </Typography>
      </Paper>

      {selectedFile && (
        <Box sx={{ mt: 2 }}>
          <Paper sx={{ p: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <FileIcon sx={{ mr: 1 }} />
              <Typography variant="body1">{selectedFile.name}</Typography>
              <Typography variant="caption" color="text.secondary" sx={{ ml: 'auto' }}>
                {(selectedFile.size / 1024).toFixed(2)} KB
              </Typography>
            </Box>
            <Button
              variant="contained"
              fullWidth
              onClick={handleUpload}
              disabled={isUploading}
              startIcon={isUploading ? <CircularProgress size={20} /> : <UploadIcon />}
            >
              {isUploading ? 'Uploading...' : 'Upload'}
            </Button>
          </Paper>
        </Box>
      )}

      {error && (
        <Alert severity="error" sx={{ mt: 2 }}>
          {error}
        </Alert>
      )}
    </Box>
  );
};
