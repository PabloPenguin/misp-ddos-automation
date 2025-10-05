export interface FileUploadProps {
  onUploadStart: (jobId: string) => void;
  onUploadComplete: (result: ProcessingResult) => void;
  acceptedTypes: string[];
  maxFileSize: number;
}

export interface ProcessingOptions {
  dryRun?: boolean;
  batchSize?: number;
  skipValidation?: boolean;
}

export interface UploadResponse {
  jobId: string;
  status: JobStatus;
  totalEvents: number;
  estimatedDuration: number;
}

export interface JobStatus {
  status: 'pending' | 'processing' | 'completed' | 'failed';
  progress: number;
  processedEvents: number;
  successfulEvents: number;
  failedEvents: number;
  errors: ValidationError[];
  startedAt: string;
  completedAt?: string;
}

export interface ProcessingResult {
  jobId: string;
  status: JobStatus;
  totalEvents: number;
  successfulEvents: number;
  failedEvents: number;
  errors: ValidationError[];
}

export interface ValidationError {
  line?: number;
  field?: string;
  message: string;
  severity: 'error' | 'warning';
}

export interface ProgressTrackerProps {
  jobId: string;
  onComplete: (result: ProcessingResult) => void;
}
