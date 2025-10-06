/**
 * Service for fetching cached MISP data from GitHub Actions
 * This replaces direct MISP API calls to avoid CORS issues
 */

export interface CachedDashboardData {
  lastUpdated: string;
  totalEvents: number;
  events: any[];
  stats: {
    totalEvents: number;
    eventsToday: number;
    eventsThisWeek: number;
    highThreatEvents: number;
    publishedEvents: number;
    unpublishedEvents: number;
    tlpRedFiltered: number;
  };
  metrics: {
    threatLevelDistribution: Array<{
      level: string;
      count: number;
      color: string;
    }>;
    attackTypeDistribution: Array<{
      type: string;
      count: number;
    }>;
    tlpDistribution: Array<{
      tlp: string;
      count: number;
      color: string;
    }>;
    dailyEvents: Array<{
      date: string;
      count: number;
    }>;
  };
}

export interface UpdateInfo {
  lastUpdated: string;
  source: string;
}

class CachedDataService {
  private baseUrl: string;

  constructor() {
    // Determine the base URL based on environment
    // Check if we're on GitHub Pages by looking at hostname
    const isGitHubPages = window.location.hostname.includes('github.io') || 
                         window.location.pathname.includes('misp-ddos-automation');
    
    this.baseUrl = isGitHubPages 
      ? '/misp-ddos-automation' // GitHub Pages path
      : ''; // Local development
  }

  /**
   * Fetch cached dashboard data from the public data directory
   */
  async getDashboardData(): Promise<CachedDashboardData> {
    try {
      console.log('🔄 Fetching cached dashboard data...');
      
      const response = await fetch(`${this.baseUrl}/data/dashboard-data.json`, {
        cache: 'no-cache', // Always fetch latest data
        headers: {
          'Accept': 'application/json',
        }
      });

      if (!response.ok) {
        // If cached data doesn't exist, return empty structure
        if (response.status === 404) {
          console.warn('⚠️ No cached dashboard data found, returning empty data');
          return this.getEmptyDashboardData();
        }
        throw new Error(`Failed to fetch cached data: ${response.status} ${response.statusText}`);
      }

      const data: CachedDashboardData = await response.json();
      console.log('✅ Cached dashboard data loaded successfully', {
        lastUpdated: data.lastUpdated,
        totalEvents: data.totalEvents
      });

      return data;
    } catch (error) {
      console.error('❌ Failed to fetch cached dashboard data:', error);
      
      // Return empty data structure on error
      return this.getEmptyDashboardData();
    }
  }

  /**
   * Get information about the last data update
   */
  async getLastUpdateInfo(): Promise<UpdateInfo | null> {
    try {
      const response = await fetch(`${this.baseUrl}/data/last-update.json`, {
        cache: 'no-cache',
        headers: {
          'Accept': 'application/json',
        }
      });

      if (!response.ok) {
        return null;
      }

      return await response.json();
    } catch (error) {
      console.error('Failed to fetch update info:', error);
      return null;
    }
  }

  /**
   * Check if cached data is available
   */
  async isDataAvailable(): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/data/dashboard-data.json`, {
        method: 'HEAD',
        cache: 'no-cache'
      });
      return response.ok;
    } catch {
      return false;
    }
  }

  /**
   * Get the age of cached data in minutes
   */
  async getDataAge(): Promise<number | null> {
    try {
      const updateInfo = await this.getLastUpdateInfo();
      if (!updateInfo) return null;

      const lastUpdate = new Date(updateInfo.lastUpdated);
      const now = new Date();
      const ageMs = now.getTime() - lastUpdate.getTime();
      return Math.floor(ageMs / (1000 * 60)); // Convert to minutes
    } catch {
      return null;
    }
  }

  /**
   * Return empty dashboard data structure
   */
  private getEmptyDashboardData(): CachedDashboardData {
    return {
      lastUpdated: new Date().toISOString(),
      totalEvents: 0,
      events: [],
      stats: {
        totalEvents: 0,
        eventsToday: 0,
        eventsThisWeek: 0,
        highThreatEvents: 0,
        publishedEvents: 0,
        unpublishedEvents: 0,
        tlpRedFiltered: 0,
      },
      metrics: {
        threatLevelDistribution: [
          { level: 'High', count: 0, color: '#f44336' },
          { level: 'Medium', count: 0, color: '#ff9800' },
          { level: 'Low', count: 0, color: '#ffeb3b' },
          { level: 'Undefined', count: 0, color: '#9e9e9e' },
        ],
        attackTypeDistribution: [],
        tlpDistribution: [],
        dailyEvents: [],
      },
    };
  }
}

export const cachedDataService = new CachedDataService();