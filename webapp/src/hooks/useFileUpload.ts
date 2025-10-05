import { useMutation, useQuery } from '@tanstack/react-query';
import { apiClient } from '../services/api';
import type { ProcessingOptions, ProcessingResult } from '../types/upload';

interface UseFileUploadOptions {
  onUploadStart?: (jobId: string) => void;
  onUploadComplete?: (result: ProcessingResult) => void;
  onError?: (error: Error) => void;
}

export const useFileUpload = (options?: UseFileUploadOptions) => {
  const uploadMutation = useMutation({
    mutationFn: async ({ file, fileOptions }: { file: File; fileOptions?: ProcessingOptions }) => {
      const extension = file.name.split('.').pop()?.toLowerCase();
      
      if (extension === 'csv') {
        return apiClient.uploadCSV(file, fileOptions);
      } else if (extension === 'json') {
        return apiClient.uploadJSON(file, fileOptions);
      } else {
        throw new Error('Unsupported file type');
      }
    },
    onSuccess: (data) => {
      if (options?.onUploadStart) {
        options.onUploadStart(data.jobId);
      }
    },
    onError: (error: Error) => {
      if (options?.onError) {
        options.onError(error);
      }
    },
  });

  const upload = (file: File, fileOptions?: ProcessingOptions) => {
    return uploadMutation.mutate({ file, fileOptions });
  };

  return {
    upload,
    isUploading: uploadMutation.isPending,
    error: uploadMutation.error,
    data: uploadMutation.data,
  };
};

export const useJobStatus = (jobId: string | null, enabled = true, pollingInterval = 2000) => {
  const query = useQuery({
    queryKey: ['jobStatus', jobId],
    queryFn: () => {
      if (!jobId) throw new Error('Job ID is required');
      return apiClient.getJobStatus(jobId);
    },
    enabled: enabled && !!jobId,
    refetchInterval: (query) => {
      // Stop polling if job is completed or failed
      const data = query.state.data;
      if (data?.status === 'completed' || data?.status === 'failed') {
        return false;
      }
      return pollingInterval;
    },
  });

  return {
    status: query.data,
    isLoading: query.isLoading,
    error: query.error,
  };
};

export const useCancelJob = () => {
  const cancelMutation = useMutation({
    mutationFn: (jobId: string) => apiClient.cancelJob(jobId),
  });

  return {
    cancel: cancelMutation.mutate,
    isCancelling: cancelMutation.isPending,
    error: cancelMutation.error,
  };
};
