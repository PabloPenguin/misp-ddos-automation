import { FileUploadJob } from '../types';

export interface MockProcessingResult {
  success: boolean;
  eventsCreated: number;
  eventsFailed: number;
  processingTime: number;
  aiCorrections: number;
  message: string;
}

export class LocalFileProcessingService {
  // Process files locally without GitHub integration for development
  async uploadAndProcessLocally(file: File): Promise<FileUploadJob> {
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
      uploadJob.progress = 20;
      await this.validateFile(file);
      uploadJob.status = 'processing';

      // Step 2: Simulate AI processing
      uploadJob.progress = 50;
      const content = await this.readFileContent(file);
      const processingResult = await this.simulateAIProcessing(content, file.name);

      // Step 3: Simulate MISP event creation
      uploadJob.progress = 80;
      await this.simulateMISPCreation(processingResult);

      // Step 4: Complete processing
      uploadJob.progress = 100;
      uploadJob.status = 'completed';
      uploadJob.completed_at = new Date().toISOString();
      uploadJob.events_created = processingResult.eventsCreated;
      uploadJob.events_failed = processingResult.eventsFailed;
      uploadJob.ai_processing = {
        enabled: true,
        corrections_made: processingResult.aiCorrections,
        data_quality_score: 85 + Math.floor(Math.random() * 15), // Simulate 85-100% quality
      };

      console.log(`✅ Local processing completed: ${processingResult.eventsCreated} events created`);
      return uploadJob;

    } catch (error) {
      console.error('Local processing failed:', error);
      return {
        id: processingId,
        filename: file.name,
        size: file.size,
        status: 'failed',
        progress: 0,
        created_at: new Date().toISOString(),
        completed_at: new Date().toISOString(),
        error_message: error instanceof Error ? error.message : 'Local processing failed',
        events_created: 0,
        events_failed: 1,
      };
    }
  }

  // Validate uploaded file structure and content
  private async validateFile(file: File): Promise<void> {
    // Check file type
    const allowedTypes = ['text/csv', 'application/json', 'text/plain'];
    const allowedExtensions = ['.csv', '.json'];
    
    const hasValidType = allowedTypes.includes(file.type);
    const hasValidExtension = allowedExtensions.some(ext => file.name.toLowerCase().endsWith(ext));
    
    if (!hasValidType && !hasValidExtension) {
      throw new Error('Invalid file type. Only CSV and JSON files are supported.');
    }

    // Check file size (100MB limit)
    const maxSize = 100 * 1024 * 1024; // 100MB
    if (file.size > maxSize) {
      throw new Error('File size exceeds 100MB limit.');
    }

    // Validate content structure
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

      // Validate required fields
      const requiredFields = ['title', 'description', 'attacker_ips', 'victim_ips', 'attack_type', 'severity'];
      
      for (let i = 0; i < Math.min(events.length, 5); i++) { // Check first 5 events
        const event = events[i];
        const missingFields = requiredFields.filter(field => !(field in event));
        
        if (missingFields.length > 3) { // Allow some flexibility
          throw new Error(`Event ${i + 1} missing too many required fields: ${missingFields.join(', ')}`);
        }
      }
    } catch (error) {
      if (error instanceof SyntaxError) {
        throw new Error('Invalid JSON format.');
      }
      throw error;
    }
  }

  // Simulate AI processing of file content
  private async simulateAIProcessing(content: string, fileName: string): Promise<MockProcessingResult> {
    // Simulate processing delay
    await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));

    let eventsCreated = 0;
    let eventsFailed = 0;
    let aiCorrections = 0;

    try {
      if (fileName.toLowerCase().endsWith('.csv')) {
        const lines = content.split('\n').filter(line => line.trim());
        const dataRows = lines.slice(1); // Skip header
        
        eventsCreated = Math.max(1, dataRows.length - Math.floor(dataRows.length * 0.1)); // 90% success rate
        eventsFailed = dataRows.length - eventsCreated;
        aiCorrections = Math.floor(dataRows.length * 0.3); // 30% of records need AI correction
        
      } else if (fileName.toLowerCase().endsWith('.json')) {
        const data = JSON.parse(content);
        const events = Array.isArray(data) ? data : [data];
        
        eventsCreated = Math.max(1, events.length - Math.floor(events.length * 0.1)); // 90% success rate
        eventsFailed = events.length - eventsCreated;
        aiCorrections = Math.floor(events.length * 0.25); // 25% of records need AI correction
      }

      return {
        success: true,
        eventsCreated,
        eventsFailed,
        processingTime: 2000 + Math.random() * 3000,
        aiCorrections,
        message: `Successfully processed ${eventsCreated} events with ${aiCorrections} AI corrections`,
      };

    } catch (error) {
      return {
        success: false,
        eventsCreated: 0,
        eventsFailed: 1,
        processingTime: 1000,
        aiCorrections: 0,
        message: `Processing failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      };
    }
  }

  // Simulate MISP event creation
  private async simulateMISPCreation(processingResult: MockProcessingResult): Promise<void> {
    // Simulate MISP API calls
    await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 1000));

    if (!processingResult.success) {
      throw new Error('Cannot create MISP events: Processing failed');
    }

    // Log simulated MISP event creation
    console.log(`🎯 Simulated MISP event creation:`);
    console.log(`   - Events created: ${processingResult.eventsCreated}`);
    console.log(`   - Events failed: ${processingResult.eventsFailed}`);
    console.log(`   - AI corrections: ${processingResult.aiCorrections}`);
    console.log(`   - DDoS Playbook compliant tags applied`);
    console.log(`   - Galaxy Clusters: mitre-attack-pattern:T1498`);
  }

  // Generate unique processing ID
  private generateProcessingId(): string {
    return `local-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  // Get processing status (for local processing, this is immediate)
  async getProcessingStatus(processingId: string): Promise<FileUploadJob | null> {
    // For local processing, status is immediately available
    // This method is mainly for compatibility with the interface
    return null;
  }
}

// Export singleton instance
export const localFileProcessingService = new LocalFileProcessingService();