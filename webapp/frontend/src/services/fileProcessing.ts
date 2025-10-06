import { FileUploadJob } from '../types';

export interface GitHubConfig {
  owner: string;
  repo: string;
  token?: string;
}

export class FileProcessingService {
  private githubConfig: GitHubConfig = {
    owner: 'PabloPenguin',
    repo: 'misp-ddos-automation',
  };

  // Set GitHub configuration
  setGitHubConfig(config: Partial<GitHubConfig>) {
    this.githubConfig = { ...this.githubConfig, ...config };
  }

  // Upload file and trigger processing
  async uploadAndProcess(file: File): Promise<FileUploadJob> {
    const processingId = this.generateProcessingId();
    
    try {
      // Create upload job record
      const uploadJob: FileUploadJob = {
        id: processingId,
        filename: file.name,
        size: file.size,
        status: 'pending',
        progress: 0,
        created_at: new Date().toISOString(),
      };

      // Step 1: Validate file
      await this.validateFile(file);
      uploadJob.progress = 25;
      uploadJob.status = 'processing';

      // Step 2: Upload file to GitHub (as a GitHub Issue or Gist for processing)
      const fileUrl = await this.uploadFileToGitHub(file, processingId);
      uploadJob.progress = 50;

      // Step 3: Trigger GitHub Actions workflow
      await this.triggerProcessingWorkflow(fileUrl, file.name, processingId);
      uploadJob.progress = 75;

      // Step 4: Monitor processing status
      uploadJob.progress = 100;
      uploadJob.status = 'completed';
      uploadJob.completed_at = new Date().toISOString();

      return uploadJob;
    } catch (error) {
      return {
        id: processingId,
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
    }
  }

  // Validate uploaded file
  private async validateFile(file: File): Promise<void> {
    // Check file type
    const allowedTypes = ['text/csv', 'application/json', 'text/plain'];
    const allowedExtensions = ['.csv', '.json'];
    
    const hasValidType = allowedTypes.includes(file.type);
    const hasValidExtension = allowedExtensions.some(ext => file.name.toLowerCase().endsWith(ext));
    
    if (!hasValidType && !hasValidExtension) {
      throw new Error('Invalid file type. Only CSV and JSON files are allowed.');
    }

    // Check file size (50MB limit)
    const maxSize = 50 * 1024 * 1024; // 50MB
    if (file.size > maxSize) {
      throw new Error('File size exceeds 50MB limit.');
    }

    // Read and validate file content
    const content = await this.readFileContent(file);
    
    if (file.name.toLowerCase().endsWith('.csv')) {
      await this.validateCSVContent(content);
    } else if (file.name.toLowerCase().endsWith('.json')) {
      await this.validateJSONContent(content);
    }
  }

  // Read file content as text
  private readFileContent(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsText(file);
    });
  }

  // Validate CSV content structure
  private async validateCSVContent(content: string): Promise<void> {
    const lines = content.split('\n').filter(line => line.trim());
    if (lines.length < 2) {
      throw new Error('CSV file must contain at least a header and one data row.');
    }

    const header = lines[0].toLowerCase();
    const requiredColumns = ['title', 'description', 'attacker_ips', 'victim_ips', 'attack_type', 'severity'];
    
    const missingColumns = requiredColumns.filter(col => !header.includes(col));
    if (missingColumns.length > 0) {
      throw new Error(`CSV missing required columns: ${missingColumns.join(', ')}`);
    }
  }

  // Validate JSON content structure
  private async validateJSONContent(content: string): Promise<void> {
    try {
      const data = JSON.parse(content);
      
      // Support both single event and array of events
      const events = Array.isArray(data) ? data : [data];
      
      if (events.length === 0) {
        throw new Error('JSON file must contain at least one event.');
      }

      // Validate each event has required fields
      const requiredFields = ['title', 'description', 'attacker_ips', 'victim_ips', 'attack_type', 'severity'];
      
      for (let i = 0; i < events.length; i++) {
        const event = events[i];
        const missingFields = requiredFields.filter(field => !(field in event));
        
        if (missingFields.length > 0) {
          throw new Error(`Event ${i + 1} missing required fields: ${missingFields.join(', ')}`);
        }
      }
    } catch (error) {
      if (error instanceof SyntaxError) {
        throw new Error('Invalid JSON format.');
      }
      throw error;
    }
  }

  // Upload file to GitHub for processing
  private async uploadFileToGitHub(file: File, processingId: string): Promise<string> {
    // For GitHub Pages deployment, we'll use GitHub's API to create a temporary file
    // In a real implementation, you might use a different storage service
    
    const content = await this.readFileContent(file);
    const encodedContent = btoa(content); // Base64 encode
    
    const apiUrl = `https://api.github.com/repos/${this.githubConfig.owner}/${this.githubConfig.repo}/contents/temp/${processingId}-${file.name}`;
    
    const response = await fetch(apiUrl, {
      method: 'PUT',
      headers: {
        'Authorization': `token ${this.githubConfig.token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message: `Upload DDoS data file for processing: ${file.name}`,
        content: encodedContent,
        branch: 'temp-uploads',
      }),
    });

    if (!response.ok) {
      throw new Error(`Failed to upload file to GitHub: ${response.statusText}`);
    }

    const result = await response.json();
    return result.content.download_url;
  }

  // Trigger GitHub Actions workflow for processing
  private async triggerProcessingWorkflow(fileUrl: string, fileName: string, processingId: string): Promise<void> {
    const apiUrl = `https://api.github.com/repos/${this.githubConfig.owner}/${this.githubConfig.repo}/actions/workflows/process-ddos-data.yml/dispatches`;
    
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Authorization': `token ${this.githubConfig.token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        ref: 'main',
        inputs: {
          file_url: fileUrl,
          file_name: fileName,
          processing_id: processingId,
        },
      }),
    });

    if (!response.ok) {
      throw new Error(`Failed to trigger processing workflow: ${response.statusText}`);
    }
  }

  // Generate unique processing ID
  private generateProcessingId(): string {
    return `ddos-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  // Get processing status
  async getProcessingStatus(processingId: string): Promise<FileUploadJob | null> {
    try {
      // In a real implementation, this would query GitHub Actions API
      // or a database to get the current status
      const apiUrl = `https://api.github.com/repos/${this.githubConfig.owner}/${this.githubConfig.repo}/actions/runs`;
      
      const response = await fetch(apiUrl, {
        headers: {
          'Authorization': `token ${this.githubConfig.token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        return null;
      }

      const data = await response.json();
      
      // Find workflow run with our processing ID
      const workflowRun = data.workflow_runs.find((run: any) => 
        run.name === 'Process DDoS Data Files' && 
        run.head_commit?.message?.includes(processingId)
      );

      if (!workflowRun) {
        return null;
      }

      // Map GitHub Actions status to our status
      const statusMap: Record<string, FileUploadJob['status']> = {
        'queued': 'pending',
        'in_progress': 'processing',
        'completed': 'completed',
        'failure': 'failed',
        'cancelled': 'failed',
      };

      return {
        id: processingId,
        filename: 'unknown', // Would be stored in a database normally
        size: 0,
        status: statusMap[workflowRun.status] || 'pending',
        progress: workflowRun.status === 'completed' ? 100 : 50,
        created_at: workflowRun.created_at,
        completed_at: workflowRun.updated_at,
      };
    } catch (error) {
      console.error('Failed to get processing status:', error);
      return null;
    }
  }
}

// Create singleton instance
export const fileProcessingService = new FileProcessingService();