import { DDoSEvent, MISPEvent, MISPEventResponse } from '../types';

// MISP Instance Configuration
const MISP_CONFIG = {
  baseUrl: 'https://server1.tailaa85d9.ts.net',
  // API key should be set via environment variable in production
  // For GitHub Pages, we'll need to handle this through GitHub Actions
  defaultHeaders: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  }
};

export interface MISPCredentials {
  apiKey: string;
  baseUrl?: string;
}

export class MISPApiService {
  private credentials: MISPCredentials | null = null;

  setCredentials(credentials: MISPCredentials) {
    this.credentials = credentials;
  }

  private async makeRequest(endpoint: string, options: RequestInit = {}): Promise<any> {
    if (!this.credentials) {
      throw new Error('MISP credentials not configured. Please set them in Settings.');
    }

    const url = `${this.credentials.baseUrl || MISP_CONFIG.baseUrl}${endpoint}`;
    
    const response = await fetch(url, {
      ...options,
      mode: 'cors',
      credentials: 'omit',
      headers: {
        ...MISP_CONFIG.defaultHeaders,
        'Authorization': this.credentials.apiKey,
        'X-API-Key': this.credentials.apiKey,
        ...options.headers,
      },
    });

    if (!response.ok) {
      throw new Error(`MISP API Error: ${response.status} ${response.statusText}`);
    }

    return response.json();
  }

  // Test MISP connection
  async testConnection(): Promise<{ success: boolean; error?: string; details?: any }> {
    try {
      console.log('🔧 Testing MISP connection to:', this.credentials?.baseUrl || MISP_CONFIG.baseUrl);
      console.log('🔑 Using API key:', this.credentials?.apiKey ? `${this.credentials.apiKey.substring(0, 8)}...` : 'Not set');
      
      const response = await this.makeRequest('/users/view/me.json');
      console.log('✅ MISP connection test successful:', response);
      
      return { 
        success: true, 
        details: {
          user_id: response.User?.id,
          email: response.User?.email,
          role: response.User?.role_id
        }
      };
    } catch (error) {
      console.error('❌ MISP connection test failed:', error);
      
      let errorMessage = 'Unknown connection error';
      let isCorsError = false;
      
      if (error instanceof TypeError && error.message.includes('fetch')) {
        isCorsError = true;
        errorMessage = 'CORS Error: MISP server does not allow browser access. This is normal for MISP instances.';
      } else if (error instanceof Error) {
        errorMessage = error.message;
        if (error.message.includes('CORS') || error.message.includes('cross-origin')) {
          isCorsError = true;
        }
      }
      
      console.log('🔍 Error analysis:', {
        isCorsError,
        errorType: error?.constructor?.name,
        message: errorMessage
      });
      
      return { 
        success: false, 
        error: errorMessage,
        details: { 
          error: error,
          isCorsError,
          suggestion: isCorsError ? 
            'Use the CLI for direct MISP access, or configure CORS on your MISP server' : 
            'Check your API key and MISP server status'
        }
      };
    }
  }

  // Create a MISP event from DDoS data
  async createDDoSEvent(ddosData: DDoSEvent): Promise<MISPEventResponse> {
    try {
      // Build MISP event following the DDoS Playbook
      const mispEvent = {
        info: ddosData.title,
        threat_level_id: this.mapSeverityToThreatLevel(ddosData.severity),
        analysis: '2', // Complete
        distribution: '1', // This community only
        published: false,
        Attribute: this.buildAttributes(ddosData),
        Tag: this.buildTags(ddosData),
      };

      const response = await this.makeRequest('/events/add.json', {
        method: 'POST',
        body: JSON.stringify({ Event: mispEvent }),
      });

      return {
        event_id: response.Event.id,
        success: true,
        message: 'DDoS event created successfully',
        misp_url: `${this.credentials?.baseUrl || MISP_CONFIG.baseUrl}/events/view/${response.Event.id}`,
      };
    } catch (error) {
      console.error('Failed to create MISP event:', error);
      return {
        event_id: '',
        success: false,
        message: error instanceof Error ? error.message : 'Unknown error occurred',
      };
    }
  }

  // Get MISP events with TLP filtering
  async getEvents(limit: number = 50, excludeTlpRed: boolean = true): Promise<MISPEvent[]> {
    try {
      const response = await this.makeRequest(`/events/index/limit:${limit}.json`);
      let events = response.map((event: any) => this.transformMISPEvent(event.Event));
      
      // Filter out TLP:RED events if requested
      if (excludeTlpRed) {
        events = events.filter((event: MISPEvent) => !this.isTlpRedEvent(event));
        console.log(`Filtered events: ${response.length} -> ${events.length} (excluded TLP:RED)`);
      }
      
      return events;
    } catch (error) {
      console.error('Failed to fetch MISP events:', error);
      return [];
    }
  }

  // Get events with advanced filtering options
  async getEventsWithFilter(options: {
    limit?: number;
    excludeTlpRed?: boolean;
    tags?: string[];
    dateFrom?: string;
    dateTo?: string;
  } = {}): Promise<MISPEvent[]> {
    try {
      const { 
        limit = 50, 
        excludeTlpRed = true, 
        tags = [],
        dateFrom,
        dateTo 
      } = options;

      // Build search parameters
      const searchParams = new URLSearchParams();
      searchParams.set('limit', limit.toString());
      
      if (tags.length > 0) {
        searchParams.set('tags', tags.join(','));
      }
      
      if (dateFrom) {
        searchParams.set('from', dateFrom);
      }
      
      if (dateTo) {
        searchParams.set('to', dateTo);
      }

      const response = await this.makeRequest(`/events/index.json?${searchParams.toString()}`);
      let events = response.map((event: any) => this.transformMISPEvent(event.Event));
      
      // Filter out TLP:RED events if requested
      if (excludeTlpRed) {
        const originalCount = events.length;
        events = events.filter((event: MISPEvent) => !this.isTlpRedEvent(event));
        console.log(`TLP filtering: ${originalCount} -> ${events.length} events (excluded TLP:RED)`);
      }
      
      return events;
    } catch (error) {
      console.error('Failed to fetch filtered MISP events:', error);
      return [];
    }
  }

  // Get specific event details
  async getEvent(eventId: string): Promise<MISPEvent | null> {
    try {
      const response = await this.makeRequest(`/events/view/${eventId}.json`);
      return this.transformMISPEvent(response.Event);
    } catch (error) {
      console.error('Failed to fetch MISP event:', error);
      return null;
    }
  }

  // Helper methods
  private mapSeverityToThreatLevel(severity: string): string {
    const mapping: Record<string, string> = {
      'critical': '1', // High
      'high': '1',     // High
      'medium': '2',   // Medium
      'low': '3',      // Low
    };
    return mapping[severity] || '4'; // Undefined
  }

  private buildAttributes(ddosData: DDoSEvent): any[] {
    const attributes = [];

    // Add attacker IPs
    ddosData.attacker_ips.forEach(ip => {
      attributes.push({
        category: 'Network activity',
        type: 'ip-src',
        value: ip,
        to_ids: true,
        comment: 'DDoS attack source IP',
      });
    });

    // Add victim IPs
    ddosData.victim_ips.forEach(ip => {
      attributes.push({
        category: 'Network activity',
        type: 'ip-dst',
        value: ip,
        to_ids: true,
        comment: 'DDoS attack target IP',
      });
    });

    // Add attack ports
    ddosData.attack_ports.forEach(port => {
      attributes.push({
        category: 'Network activity',
        type: 'port',
        value: port,
        to_ids: false,
        comment: 'DDoS attack target port',
      });
    });

    // Add description as comment
    if (ddosData.description) {
      attributes.push({
        category: 'Other',
        type: 'comment',
        value: ddosData.description,
        to_ids: false,
      });
    }

    return attributes;
  }

  private buildTags(ddosData: DDoSEvent): string[] {
    const tags = [];

    // Mandatory MISP Galaxy Cluster tag for DDoS (following playbook)
    tags.push('misp-galaxy:mitre-attack-pattern="Network Denial of Service - T1498"');

    // DDoS type-specific tags
    switch (ddosData.attack_type) {
      case 'direct-flood':
        tags.push('ddos:type="volumetric"');
        break;
      case 'amplification':
        tags.push('ddos:type="reflection"');
        break;
      case 'other':
        tags.push('ddos:type="application-layer"');
        break;
    }

    // Severity-based TLP tags
    switch (ddosData.severity) {
      case 'critical':
      case 'high':
        tags.push('tlp:amber');
        break;
      case 'medium':
        tags.push('tlp:green');
        break;
      case 'low':
        tags.push('tlp:white');
        break;
    }

    return tags;
  }

  // Check if an event is marked as TLP:RED
  private isTlpRedEvent(event: MISPEvent): boolean {
    return event.tags.some(tag => 
      tag.name.toLowerCase().includes('tlp:red') || 
      tag.name.toLowerCase().includes('tlp-red')
    );
  }

  private transformMISPEvent(event: any): MISPEvent {
    return {
      id: event.id,
      title: `Event ${event.id}`,
      info: event.info,
      date: event.date,
      threat_level: event.threat_level_id,
      analysis: event.analysis,
      distribution: event.distribution,
      published: event.published === '1',
      tags: event.Tag?.map((tag: any) => ({
        name: tag.name,
        colour: tag.colour || '#cccccc',
      })) || [],
      attributes: event.Attribute?.map((attr: any) => ({
        type: attr.type,
        value: attr.value,
        category: attr.category,
        to_ids: attr.to_ids === '1',
      })) || [],
      galaxy_clusters: event.Galaxy?.map((galaxy: any) => ({
        name: galaxy.name,
        type: galaxy.type,
        description: galaxy.description,
      })) || [],
      created_at: event.timestamp,
      updated_at: event.timestamp,
    };
  }
}

// Create singleton instance
export const mispApi = new MISPApiService();