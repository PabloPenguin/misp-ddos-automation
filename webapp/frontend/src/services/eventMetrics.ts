import { MISPEvent } from '../types';

export interface EventMetrics {
  totalEvents: number;
  eventsByThreatLevel: {
    high: number;
    medium: number;
    low: number;
    undefined: number;
  };
  eventsByMonth: Array<{
    month: string;
    count: number;
  }>;
  eventsByType: Array<{
    type: string;
    count: number;
  }>;
  tlpDistribution: Array<{
    level: string;
    count: number;
    color: string;
  }>;
  publishedVsUnpublished: {
    published: number;
    unpublished: number;
  };
  recentEvents: MISPEvent[];
}

export class EventMetricsService {
  /**
   * Calculate comprehensive metrics from MISP events
   */
  static calculateMetrics(events: MISPEvent[]): EventMetrics {
    const totalEvents = events.length;

    // Threat level distribution
    const eventsByThreatLevel = {
      high: events.filter(e => e.threat_level === '1').length,
      medium: events.filter(e => e.threat_level === '2').length,
      low: events.filter(e => e.threat_level === '3').length,
      undefined: events.filter(e => e.threat_level === '4').length,
    };

    // Events by month (last 12 months)
    const eventsByMonth = this.calculateMonthlyStats(events);

    // Attack types from tags
    const eventsByType = this.calculateAttackTypes(events);

    // TLP distribution
    const tlpDistribution = this.calculateTlpDistribution(events);

    // Published vs unpublished
    const publishedVsUnpublished = {
      published: events.filter(e => e.published).length,
      unpublished: events.filter(e => !e.published).length,
    };

    // Recent events (last 10)
    const recentEvents = events
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 10);

    return {
      totalEvents,
      eventsByThreatLevel,
      eventsByMonth,
      eventsByType,
      tlpDistribution,
      publishedVsUnpublished,
      recentEvents,
    };
  }

  private static calculateMonthlyStats(events: MISPEvent[]): Array<{ month: string; count: number }> {
    const monthCounts: Record<string, number> = {};
    const now = new Date();
    
    // Generate last 12 months
    for (let i = 11; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      monthCounts[monthKey] = 0;
    }

    // Count events by month
    events.forEach(event => {
      const eventDate = new Date(event.date);
      const monthKey = `${eventDate.getFullYear()}-${String(eventDate.getMonth() + 1).padStart(2, '0')}`;
      if (monthCounts.hasOwnProperty(monthKey)) {
        monthCounts[monthKey]++;
      }
    });

    return Object.entries(monthCounts).map(([month, count]) => ({
      month: this.formatMonthLabel(month),
      count,
    }));
  }

  private static calculateAttackTypes(events: MISPEvent[]): Array<{ type: string; count: number }> {
    const typeCounts: Record<string, number> = {};

    events.forEach(event => {
      event.tags.forEach(tag => {
        if (tag.name.includes('ddos:type=')) {
          const type = tag.name.replace('ddos:type=', '').replace(/"/g, '');
          typeCounts[type] = (typeCounts[type] || 0) + 1;
        }
        // Also check for MITRE ATT&CK patterns
        else if (tag.name.includes('mitre-attack-pattern')) {
          const type = this.extractAttackType(tag.name);
          if (type) {
            typeCounts[type] = (typeCounts[type] || 0) + 1;
          }
        }
      });
    });

    return Object.entries(typeCounts)
      .map(([type, count]) => ({ type, count }))
      .sort((a, b) => b.count - a.count);
  }

  private static calculateTlpDistribution(events: MISPEvent[]): Array<{ level: string; count: number; color: string }> {
    const tlpCounts: Record<string, number> = {};

    events.forEach(event => {
      let hasTlp = false;
      event.tags.forEach(tag => {
        const tagName = tag.name.toLowerCase();
        if (tagName.includes('tlp:')) {
          const tlpLevel = tagName.replace('tlp:', '');
          tlpCounts[tlpLevel] = (tlpCounts[tlpLevel] || 0) + 1;
          hasTlp = true;
        }
      });

      // If no TLP tag found, count as undefined
      if (!hasTlp) {
        tlpCounts['undefined'] = (tlpCounts['undefined'] || 0) + 1;
      }
    });

    const tlpColors: Record<string, string> = {
      'red': '#f44336',
      'amber': '#ff9800',
      'green': '#4caf50',
      'white': '#e0e0e0',
      'undefined': '#9e9e9e',
    };

    return Object.entries(tlpCounts).map(([level, count]) => ({
      level: level.toUpperCase(),
      count,
      color: tlpColors[level] || '#9e9e9e',
    }));
  }

  private static extractAttackType(attackPattern: string): string | null {
    if (attackPattern.includes('T1498.001')) return 'Direct Flood';
    if (attackPattern.includes('T1498.002')) return 'Amplification';
    if (attackPattern.includes('T1498')) return 'Network DoS';
    return null;
  }

  private static formatMonthLabel(monthKey: string): string {
    const [year, month] = monthKey.split('-');
    const date = new Date(parseInt(year), parseInt(month) - 1);
    return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
  }

  /**
   * Filter events by date range
   */
  static filterEventsByDateRange(events: MISPEvent[], startDate: Date, endDate: Date): MISPEvent[] {
    return events.filter(event => {
      const eventDate = new Date(event.date);
      return eventDate >= startDate && eventDate <= endDate;
    });
  }

  /**
   * Filter events by threat level
   */
  static filterEventsByThreatLevel(events: MISPEvent[], threatLevels: string[]): MISPEvent[] {
    return events.filter(event => threatLevels.includes(event.threat_level));
  }

  /**
   * Filter events by TLP level (excluding TLP:RED by default)
   */
  static filterEventsByTLP(events: MISPEvent[], excludeTlpRed: boolean = true): MISPEvent[] {
    if (!excludeTlpRed) return events;

    return events.filter(event => {
      return !event.tags.some(tag => 
        tag.name.toLowerCase().includes('tlp:red')
      );
    });
  }

  /**
   * Get trending events (events with increasing frequency)
   */
  static getTrendingEvents(events: MISPEvent[], days: number = 7): MISPEvent[] {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);

    const recentEvents = events.filter(event => new Date(event.date) >= cutoffDate);
    
    // Simple trending algorithm: events with high threat level from recent period
    return recentEvents
      .filter(event => event.threat_level === '1' || event.threat_level === '2')
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 5);
  }

  /**
   * Calculate event velocity (events per day over time period)
   */
  static calculateEventVelocity(events: MISPEvent[], days: number = 30): number {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);

    const recentEvents = events.filter(event => new Date(event.date) >= cutoffDate);
    return recentEvents.length / days;
  }

  /**
   * Get security posture score (0-100) based on event metrics
   */
  static calculateSecurityPosture(metrics: EventMetrics): number {
    // Simple scoring algorithm
    let score = 100;

    // Reduce score based on high threat events
    const highThreatRatio = metrics.eventsByThreatLevel.high / metrics.totalEvents;
    score -= highThreatRatio * 30;

    // Reduce score based on unpublished events (indicates backlog)
    const unpublishedRatio = metrics.publishedVsUnpublished.unpublished / metrics.totalEvents;
    score -= unpublishedRatio * 20;

    // Reduce score if there are TLP:RED events (indicates sensitive threats)
    const tlpRedEvents = metrics.tlpDistribution.find(t => t.level === 'RED');
    if (tlpRedEvents && tlpRedEvents.count > 0) {
      score -= (tlpRedEvents.count / metrics.totalEvents) * 25;
    }

    return Math.max(0, Math.min(100, score));
  }
}