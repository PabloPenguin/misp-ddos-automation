import { FileUploadJob } from '../types';

export interface AIProcessingOptions {
  enableAICleansing: boolean;
  autoCorrectIPs: boolean;
  normalizePorts: boolean;
  validateSeverity: boolean;
  enhancedReporting: boolean;
}

export interface AIProcessingResult {
  correctionsCount: number;
  dataQualityScore: number;
  suggestedImprovements: string[];
  confidenceLevel: 'high' | 'medium' | 'low';
}

export interface GitHubConfig {
  owner: string;
  repo: string;
  token?: string;
}

export class AIEnhancedFileProcessingService {
  private githubConfig: GitHubConfig = {
    owner: 'PabloPenguin',
    repo: 'misp-ddos-automation',
  };

  private defaultAIOptions: AIProcessingOptions = {
    enableAICleansing: true,
    autoCorrectIPs: true,
    normalizePorts: true,
    validateSeverity: true,
    enhancedReporting: true,
  };

  // Set GitHub configuration
  setGitHubConfig(config: Partial<GitHubConfig>) {
    this.githubConfig = { ...this.githubConfig, ...config };
  }

  // Upload file with AI-enhanced processing
  async uploadAndProcessWithAI(
    file: File, 
    aiOptions: Partial<AIProcessingOptions> = {}
  ): Promise<FileUploadJob> {
    const processingId = this.generateProcessingId();
    const options = { ...this.defaultAIOptions, ...aiOptions };
    
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

      // Step 1: Pre-upload AI validation (client-side preview)
      uploadJob.progress = 10;
      const preValidation = await this.preValidateFileWithAI(file);
      
      if (preValidation.confidenceLevel === 'low') {
        console.warn('⚠️ AI detected potential data quality issues:', preValidation.suggestedImprovements);
      }

      // Step 2: Validate file structure
      uploadJob.progress = 25;
      uploadJob.status = 'processing';
      await this.validateFile(file);

      // Step 3: Upload file to GitHub for server-side AI processing
      uploadJob.progress = 40;
      const fileUrl = await this.uploadFileToGitHub(file, processingId);

      // Step 4: Trigger AI-enhanced GitHub Actions workflow
      uploadJob.progress = 60;
      await this.triggerAIProcessingWorkflow(fileUrl, file.name, processingId, options);

      // Step 5: Initial completion (server-side processing continues)
      uploadJob.progress = 80;
      uploadJob.status = 'processing';
      uploadJob.ai_processing = {
        enabled: options.enableAICleansing,
        options: options,
        estimated_corrections: preValidation.correctionsCount,
      };

      return uploadJob;
    } catch (error) {
      console.error('AI-enhanced upload failed:', error);
      return {
        id: processingId,
        filename: file.name,
        size: file.size,
        status: 'failed',
        progress: 0,
        created_at: new Date().toISOString(),
        completed_at: new Date().toISOString(),
        error_message: error instanceof Error ? error.message : 'AI processing failed',
        events_created: 0,
        events_failed: 0,
      };
    }
  }

  // Client-side AI preview validation
  private async preValidateFileWithAI(file: File): Promise<AIProcessingResult> {
    try {
      const content = await this.readFileContent(file);
      let dataIssues = 0;
      let totalRecords = 0;
      const suggestions: string[] = [];

      if (file.name.toLowerCase().endsWith('.csv')) {
        const lines = content.split('\n').filter(line => line.trim());
        totalRecords = Math.max(0, lines.length - 1); // Exclude header
        
        // Quick AI-like validation patterns
        const ipPattern = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
        const portPattern = /^(?:[1-9][0-9]{0,3}|[1-5][0-9]{4}|6[0-4][0-9]{3}|65[0-4][0-9]{2}|655[0-2][0-9]|6553[0-5])$/;
        
        for (let i = 1; i < lines.length; i++) {
          const row = lines[i].split(',');
          
          // Check IP format issues
          if (row.length > 2) {
            const attackerIPs = row[2]?.split(';').map(ip => ip.trim()) || [];
            const victimIPs = row[3]?.split(';').map(ip => ip.trim()) || [];
            
            [...attackerIPs, ...victimIPs].forEach(ip => {
              if (ip && !ipPattern.test(ip)) {
                dataIssues++;
              }
            });
          }
          
          // Check port format issues
          if (row.length > 4) {
            const ports = row[4]?.split(';').map(p => p.trim()) || [];
            ports.forEach(port => {
              if (port && !portPattern.test(port)) {
                dataIssues++;
              }
            });
          }
        }
      } else if (file.name.toLowerCase().endsWith('.json')) {
        const data = JSON.parse(content);
        const events = Array.isArray(data) ? data : [data];
        totalRecords = events.length;
        
        events.forEach(event => {
          // Check for common data quality issues
          if (!event.title || event.title.length < 10) {
            dataIssues++;
          }
          if (!event.attacker_ips || event.attacker_ips.length === 0) {
            dataIssues++;
          }
          if (!event.severity || !['low', 'medium', 'high', 'critical'].includes(event.severity)) {
            dataIssues++;
          }
        });
      }

      // Generate AI-like suggestions
      if (dataIssues > 0) {
        suggestions.push(`${dataIssues} data quality issues detected that will be auto-corrected`);
      }
      if (totalRecords > 100) {
        suggestions.push('Large dataset detected - processing may take 2-3 minutes');
      }
      if (dataIssues / Math.max(totalRecords, 1) > 0.3) {
        suggestions.push('Consider reviewing source data quality for future uploads');
      }

      const qualityScore = Math.max(0, 100 - (dataIssues / Math.max(totalRecords, 1)) * 100);
      const confidenceLevel = qualityScore > 80 ? 'high' : qualityScore > 60 ? 'medium' : 'low';

      return {
        correctionsCount: dataIssues,
        dataQualityScore: Math.round(qualityScore),
        suggestedImprovements: suggestions,
        confidenceLevel,
      };
    } catch (error) {
      console.error('Pre-validation failed:', error);
      return {
        correctionsCount: 0,
        dataQualityScore: 0,
        suggestedImprovements: ['Unable to analyze file - will process with server-side AI'],
        confidenceLevel: 'low',
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
      throw new Error('Invalid file type. Only CSV and JSON files are supported for AI processing.');
    }

    // Check file size (100MB limit for AI processing)
    const maxSize = 100 * 1024 * 1024; // 100MB
    if (file.size > maxSize) {
      throw new Error('File size exceeds 100MB limit for AI processing.');
    }

    // Read and validate file content structure
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
      throw new Error(`CSV missing required columns: ${missingColumns.join(', ')}. AI can help with data mapping if column names are similar.`);
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

      // AI-enhanced validation with suggestions
      const requiredFields = ['title', 'description', 'attacker_ips', 'victim_ips', 'attack_type', 'severity'];
      let totalMissingFields = 0;
      
      for (let i = 0; i < Math.min(events.length, 5); i++) { // Check first 5 events
        const event = events[i];
        const missingFields = requiredFields.filter(field => !(field in event));
        totalMissingFields += missingFields.length;
        
        if (missingFields.length > 0) {
          console.warn(`Event ${i + 1} missing fields: ${missingFields.join(', ')} - AI will attempt to infer or provide defaults`);
        }
      }

      if (totalMissingFields > events.length * 2) { // More than 2 missing fields per event on average
        throw new Error('JSON events have too many missing required fields. Please review the data structure.');
      }
    } catch (error) {
      if (error instanceof SyntaxError) {
        throw new Error('Invalid JSON format. AI cannot process malformed JSON files.');
      }
      throw error;
    }
  }

  // Upload file to GitHub for AI processing
  private async uploadFileToGitHub(file: File, processingId: string): Promise<string> {
    const content = await this.readFileContent(file);
    const encodedContent = btoa(unescape(encodeURIComponent(content))); // Proper UTF-8 encoding
    
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filePath = `temp/ai-processing/${timestamp}-${processingId}-${file.name}`;
    const apiUrl = `https://api.github.com/repos/${this.githubConfig.owner}/${this.githubConfig.repo}/contents/${filePath}`;
    
    const response = await fetch(apiUrl, {
      method: 'PUT',
      headers: {
        'Authorization': `token ${this.githubConfig.token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message: `🤖 AI Processing Upload: ${file.name} (${processingId})`,
        content: encodedContent,
        branch: 'main',
      }),
    });

    if (!response.ok) {
      throw new Error(`Failed to upload file for AI processing: ${response.status} ${response.statusText}`);
    }

    const result = await response.json();
    return result.content.download_url;
  }

  // Trigger AI-enhanced GitHub Actions workflow
  private async triggerAIProcessingWorkflow(
    fileUrl: string, 
    fileName: string, 
    processingId: string, 
    aiOptions: AIProcessingOptions
  ): Promise<void> {
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
          enable_ai_cleansing: aiOptions.enableAICleansing.toString(),
        },
      }),
    });

    if (!response.ok) {
      throw new Error(`Failed to trigger AI processing workflow: ${response.status} ${response.statusText}`);
    }
  }

  // Get enhanced processing status with AI insights
  async getAIProcessingStatus(processingId: string): Promise<FileUploadJob | null> {
    try {
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
        run.name === 'AI-Enhanced DDoS Data Processing' && 
        (run.head_commit?.message?.includes(processingId) || 
         run.display_title?.includes(processingId))
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

      const progress = workflowRun.status === 'completed' ? 100 : 
                     workflowRun.status === 'in_progress' ? 75 : 25;

      return {
        id: processingId,
        filename: 'Processing...', // Would be stored elsewhere in real implementation
        size: 0,
        status: statusMap[workflowRun.status] || 'pending',
        progress: progress,
        created_at: workflowRun.created_at,
        completed_at: workflowRun.updated_at,
        ai_processing: {
          enabled: true,
          workflow_url: workflowRun.html_url,
          conclusion: workflowRun.conclusion,
        },
      };
    } catch (error) {
      console.error('Failed to get AI processing status:', error);
      return null;
    }
  }

  // Generate unique processing ID
  private generateProcessingId(): string {
    return `ai-ddos-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
}

// Export singleton instance
export const aiFileProcessingService = new AIEnhancedFileProcessingService();