import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import {
  Box,
  Paper,
  Typography,
  Button,
  LinearProgress,
  Alert,
  Card,
  CardContent,
  CardActions,
  Chip,
  IconButton,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  FormControlLabel,
  Switch,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Tooltip,
} from '@mui/material';
import {
  CloudUpload as UploadIcon,
  Delete as DeleteIcon,
  CheckCircle as SuccessIcon,
  Error as ErrorIcon,
  Schedule as PendingIcon,
  SmartToy as AIIcon,
  ExpandMore as ExpandMoreIcon,
  AutoFixHigh as AutoFixIcon,
  Assessment as AssessmentIcon,
} from '@mui/icons-material';
import { FileUploadJob } from '../types';
import { aiFileProcessingService, AIProcessingOptions } from '../services/aiFileProcessing';
import { localFileProcessingService } from '../services/localFileProcessing';

const UploadPage: React.FC = () => {
  const [files, setFiles] = useState<File[]>([]);
  const [uploadJobs, setUploadJobs] = useState<FileUploadJob[]>([]);
  const [autoProcess, setAutoProcess] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [aiOptions, setAIOptions] = useState<AIProcessingOptions>({
    enableAICleansing: true,
    autoCorrectIPs: true,
    normalizePorts: true,
    validateSeverity: true,
    enhancedReporting: true,
  });

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const validFiles = acceptedFiles.filter(file => {
      const isValidType = file.type === 'text/csv' || 
                         file.type === 'application/json' ||
                         file.name.endsWith('.csv') ||
                         file.name.endsWith('.json');
      const isValidSize = file.size <= 50 * 1024 * 1024; // 50MB limit
      return isValidType && isValidSize;
    });
    
    setFiles(prev => [...prev, ...validFiles]);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'text/csv': ['.csv'],
      'application/json': ['.json']
    },
    maxSize: 50 * 1024 * 1024, // 50MB
    multiple: true
  });

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleUpload = async () => {
    if (files.length === 0) return;
    
    setIsUploading(true);
    
    // Process each file through the real GitHub Actions workflow
    for (const file of files) {
      try {
        // Try AI-enhanced file processing first, fall back to local processing
        console.log('🤖 Starting AI-enhanced processing for:', file.name);
        let job: FileUploadJob;
        
        try {
          // Attempt GitHub Actions AI processing
          job = await aiFileProcessingService.uploadAndProcessWithAI(file, aiOptions);
          console.log('✅ Using GitHub Actions AI processing');
        } catch (githubError) {
          console.warn('⚠️ GitHub AI processing failed, using local processing:', githubError);
          // Fallback to local processing
          job = await localFileProcessingService.uploadAndProcessLocally(file);
          console.log('✅ Using local file processing');
        }
        
        setUploadJobs(prev => [...prev, job]);
        
        // Poll for status updates with AI insights (only for GitHub processing)
        const pollStatus = async () => {
          // Skip polling for local processing (it's immediate)
          if (job.id.startsWith('local-')) {
            console.log('📊 Local processing complete, no polling needed');
            return;
          }
          
          let attempts = 0;
          const maxAttempts = 60; // 10 minutes max for AI processing
          
          const interval = setInterval(async () => {
            attempts++;
            
            const status = await aiFileProcessingService.getAIProcessingStatus(job.id);
            if (status) {
              // Enhance status with AI information
              const enhancedStatus = {
                ...status,
                filename: file.name, // Preserve original filename
                size: file.size,
              };
              
              setUploadJobs(prev => prev.map(j => 
                j.id === job.id ? enhancedStatus : j
              ));
              
              if (status.status === 'completed' || status.status === 'failed' || attempts >= maxAttempts) {
                clearInterval(interval);
                
                if (status.status === 'completed') {
                  console.log('✅ GitHub AI processing completed for:', file.name);
                  if (status.ai_processing?.corrections_made) {
                    console.log(`🤖 AI made ${status.ai_processing.corrections_made} data quality improvements`);
                  }
                } else if (status.status === 'failed') {
                  console.error('❌ GitHub AI processing failed for:', file.name);
                }
              }
            }
          }, 15000); // Check every 15 seconds for AI processing
        };
        
        // Start polling for this job
        pollStatus();
        
      } catch (error) {
        // Handle upload failure
        const failedJob: FileUploadJob = {
          id: Math.random().toString(36).substr(2, 9),
          filename: file.name,
          size: file.size,
          status: 'failed',
          progress: 0,
          created_at: new Date().toISOString(),
          completed_at: new Date().toISOString(),
          error_message: error instanceof Error ? error.message : 'Upload failed',
          events_created: 0,
          events_failed: 0,
        };
        
        setUploadJobs(prev => [...prev, failedJob]);
      }
    }
    
    setFiles([]);
    setIsUploading(false);
  };

  const getStatusIcon = (status: FileUploadJob['status']) => {
    switch (status) {
      case 'completed': return <SuccessIcon sx={{ color: 'success.main' }} />;
      case 'failed': return <ErrorIcon sx={{ color: 'error.main' }} />;
      case 'processing': return <PendingIcon sx={{ color: 'warning.main' }} />;
      default: return <PendingIcon sx={{ color: 'info.main' }} />;
    }
  };

  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 600 }}>
        File Upload
      </Typography>
      <Typography variant="body1" color="text.secondary" paragraph>
        Upload CSV or JSON files containing DDoS event data. Files will be automatically processed and events created in MISP.
      </Typography>

      {/* Upload Area */}
      <Paper
        {...getRootProps()}
        sx={{
          p: 4,
          mb: 3,
          border: '2px dashed',
          borderColor: isDragActive ? 'primary.main' : 'grey.300',
          backgroundColor: isDragActive ? 'action.hover' : 'background.paper',
          cursor: 'pointer',
          transition: 'all 0.2s ease-in-out',
          '&:hover': {
            borderColor: 'primary.main',
            backgroundColor: 'action.hover',
          },
        }}
      >
        <input {...getInputProps()} />
        <Box textAlign="center">
          <UploadIcon sx={{ fontSize: 64, color: 'primary.main', mb: 2 }} />
          <Typography variant="h6" gutterBottom>
            {isDragActive ? 'Drop files here' : 'Drag & drop files here, or click to select'}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Supports CSV and JSON files up to 50MB each
          </Typography>
        </Box>
      </Paper>

      {/* Upload Options */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Upload Options
          </Typography>
          <FormControlLabel
            control={
              <Switch
                checked={autoProcess}
                onChange={(e) => setAutoProcess(e.target.checked)}
                color="primary"
              />
            }
            label="Automatically process files after upload"
          />
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            When enabled, files will be automatically processed and MISP events created. 
            The system will attempt GitHub Actions AI processing first, then fall back to local processing.
          </Typography>
          
          <Alert severity="info" sx={{ mt: 2 }}>
            <Typography variant="body2">
              <strong>🔄 Processing Modes:</strong>
            </Typography>
            <Typography variant="body2" component="ul" sx={{ mt: 1, pl: 2 }}>
              <li><strong>GitHub AI Processing:</strong> Full server-side AI analysis with MISP integration</li>
              <li><strong>Local Processing:</strong> Client-side validation with simulated results (development mode)</li>
            </Typography>
          </Alert>
        </CardContent>
      </Card>

      {/* AI Processing Options */}
      <Accordion sx={{ mb: 3 }}>
        <AccordionSummary 
          expandIcon={<ExpandMoreIcon />}
          sx={{ 
            backgroundColor: 'primary.main', 
            color: 'primary.contrastText',
            '&:hover': { backgroundColor: 'primary.dark' }
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <AIIcon />
            <Typography variant="h6">AI-Enhanced Processing Options</Typography>
          </Box>
        </AccordionSummary>
        <AccordionDetails>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Alert severity="info" sx={{ mb: 2 }}>
              <Typography variant="body2">
                <strong>🤖 AI-Powered Data Cleansing:</strong> Our AI automatically detects and corrects 
                common data quality issues including invalid IP addresses, malformed ports, and 
                inconsistent attack type classifications before creating MISP events.
              </Typography>
            </Alert>
            
            <FormControlLabel
              control={
                <Switch
                  checked={aiOptions.enableAICleansing}
                  onChange={(e) => setAIOptions(prev => ({ 
                    ...prev, 
                    enableAICleansing: e.target.checked 
                  }))}
                  color="primary"
                />
              }
              label={
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <AutoFixIcon color="primary" />
                  <Typography>Enable AI Data Cleansing</Typography>
                </Box>
              }
            />
            
            <FormControlLabel
              control={
                <Switch
                  checked={aiOptions.autoCorrectIPs}
                  onChange={(e) => setAIOptions(prev => ({ 
                    ...prev, 
                    autoCorrectIPs: e.target.checked 
                  }))}
                  color="primary"
                  disabled={!aiOptions.enableAICleansing}
                />
              }
              label="Auto-correct malformed IP addresses"
            />
            
            <FormControlLabel
              control={
                <Switch
                  checked={aiOptions.normalizePorts}
                  onChange={(e) => setAIOptions(prev => ({ 
                    ...prev, 
                    normalizePorts: e.target.checked 
                  }))}
                  color="primary"
                  disabled={!aiOptions.enableAICleansing}
                />
              }
              label="Normalize port numbers and ranges"
            />
            
            <FormControlLabel
              control={
                <Switch
                  checked={aiOptions.validateSeverity}
                  onChange={(e) => setAIOptions(prev => ({ 
                    ...prev, 
                    validateSeverity: e.target.checked 
                  }))}
                  color="primary"
                  disabled={!aiOptions.enableAICleansing}
                />
              }
              label="Auto-classify attack severity levels"
            />
            
            <FormControlLabel
              control={
                <Switch
                  checked={aiOptions.enhancedReporting}
                  onChange={(e) => setAIOptions(prev => ({ 
                    ...prev, 
                    enhancedReporting: e.target.checked 
                  }))}
                  color="primary"
                />
              }
              label={
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <AssessmentIcon color="primary" />
                  <Typography>Enhanced AI processing reports</Typography>
                </Box>
              }
            />
            
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              <strong>Note:</strong> AI processing may take 2-5 minutes depending on file size and complexity. 
              All corrections are logged and can be reviewed in the processing report.
            </Typography>
          </Box>
        </AccordionDetails>
      </Accordion>

      {/* File Queue */}
      {files.length > 0 && (
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Upload Queue ({files.length} files)
            </Typography>
            <List>
              {files.map((file, index) => (
                <ListItem key={index} divider>
                  <ListItemText
                    primary={file.name}
                    secondary={`${formatFileSize(file.size)} • ${file.type || 'Unknown type'}`}
                  />
                  <ListItemSecondaryAction>
                    <IconButton 
                      edge="end" 
                      onClick={() => removeFile(index)}
                      disabled={isUploading}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </ListItemSecondaryAction>
                </ListItem>
              ))}
            </List>
          </CardContent>
          <CardActions>
            <Button
              variant="contained"
              startIcon={<UploadIcon />}
              onClick={handleUpload}
              disabled={isUploading}
              size="large"
            >
              {isUploading ? 'Uploading...' : `Upload ${files.length} file${files.length > 1 ? 's' : ''}`}
            </Button>
            <Button
              variant="outlined"
              onClick={() => setFiles([])}
              disabled={isUploading}
            >
              Clear Queue
            </Button>
          </CardActions>
        </Card>
      )}

      {/* Upload History */}
      {uploadJobs.length > 0 && (
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Upload History
            </Typography>
            <List>
              {uploadJobs.map((job) => (
                <ListItem key={job.id} divider>
                  <Box sx={{ display: 'flex', alignItems: 'center', mr: 2 }}>
                    {getStatusIcon(job.status)}
                  </Box>
                  <ListItemText
                    primary={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography variant="body1">{job.filename}</Typography>
                        <Chip
                          label={job.status}
                          size="small"
                          color={
                            job.status === 'completed' ? 'success' :
                            job.status === 'failed' ? 'error' :
                            job.status === 'processing' ? 'warning' : 'default'
                          }
                        />
                        {job.ai_processing?.enabled && (
                          <Tooltip title="AI-Enhanced Processing">
                            <Chip
                              icon={<AIIcon />}
                              label="AI"
                              size="small"
                              color="primary"
                              variant="outlined"
                            />
                          </Tooltip>
                        )}
                        {job.id.startsWith('local-') && (
                          <Tooltip title="Local Processing Mode">
                            <Chip
                              label="Local"
                              size="small"
                              color="info"
                              variant="outlined"
                            />
                          </Tooltip>
                        )}
                      </Box>
                    }
                    secondary={
                      <Box>
                        <Typography variant="body2" color="text.secondary">
                          {formatFileSize(job.size)} • {new Date(job.created_at).toLocaleString()}
                        </Typography>
                        
                        {/* AI Processing Information */}
                        {job.ai_processing?.enabled && job.ai_processing?.corrections_made !== undefined && (
                          <Typography variant="body2" color="primary.main" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                            <AutoFixIcon fontSize="small" />
                            🤖 AI made {job.ai_processing.corrections_made} data quality improvements
                          </Typography>
                        )}
                        
                        {job.ai_processing?.data_quality_score !== undefined && (
                          <Typography variant="body2" color="info.main" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                            <AssessmentIcon fontSize="small" />
                            Data Quality Score: {job.ai_processing.data_quality_score}%
                          </Typography>
                        )}
                        
                        {job.events_created !== undefined && (
                          <Typography variant="body2" color="success.main">
                            ✓ {job.events_created} events created
                            {job.events_failed ? ` • ${job.events_failed} failed` : ''}
                          </Typography>
                        )}
                        
                        {job.ai_processing?.workflow_url && (
                          <Typography variant="body2">
                            <a 
                              href={job.ai_processing.workflow_url} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              style={{ color: 'inherit', textDecoration: 'underline' }}
                            >
                              View AI Processing Workflow →
                            </a>
                          </Typography>
                        )}
                        
                        {job.status === 'processing' && (
                          <Box sx={{ mt: 1 }}>
                            <LinearProgress 
                              variant="determinate" 
                              value={job.progress} 
                              sx={{ mb: 0.5 }}
                            />
                            <Typography variant="caption" color="text.secondary">
                              {job.ai_processing?.enabled ? 
                                'AI analyzing and cleansing data...' : 
                                'Processing...'
                              } ({job.progress}%)
                            </Typography>
                          </Box>
                        )}
                      </Box>
                    }
                  />
                </ListItem>
              ))}
            </List>
          </CardContent>
        </Card>
      )}

      {/* Help Information */}
      <Alert severity="info" sx={{ mt: 3 }}>
        <Typography variant="body2">
          <strong>🤖 AI-Enhanced File Processing:</strong> Our system automatically analyzes and improves 
          your data quality before creating MISP events. 
        </Typography>
        <Typography variant="body2" sx={{ mt: 1 }}>
          <strong>Supported formats:</strong> CSV files should include columns for title, description, attacker_ips, 
          victim_ips, attack_ports, attack_type, and severity. JSON files should contain an array of event objects 
          with the same structure.
        </Typography>
        <Typography variant="body2" sx={{ mt: 1 }}>
          <strong>AI Capabilities:</strong> Auto-corrects IP addresses, normalizes ports, validates severity levels, 
          and ensures DDoS Playbook compliance. All corrections are logged and reviewable.
        </Typography>
      </Alert>
    </Box>
  );
};

export default UploadPage;