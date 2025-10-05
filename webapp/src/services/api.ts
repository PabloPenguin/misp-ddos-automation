import type { UploadResponse, JobStatus, ProcessingOptions } from '../types/upload';
import type { DDoSEvent, PaginatedEvents, EventFilters } from '../types/events';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';

class ApiClient {
  private baseURL: string;
  private token: string | null = null;

  constructor(baseURL: string = API_BASE_URL) {
    this.baseURL = baseURL;
  }

  setToken(token: string | null) {
    this.token = token;
  }

  private getHeaders(): HeadersInit {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    return headers;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    const response = await fetch(url, {
      ...options,
      headers: {
        ...this.getHeaders(),
        ...options.headers,
      },
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'An error occurred' }));
      throw new Error(error.message || `HTTP ${response.status}`);
    }

    return response.json();
  }

  // File Upload endpoints
  async uploadCSV(file: File, options?: ProcessingOptions): Promise<UploadResponse> {
    const formData = new FormData();
    formData.append('file', file);
    if (options) {
      formData.append('options', JSON.stringify(options));
    }

    const response = await fetch(`${this.baseURL}/upload/csv`, {
      method: 'POST',
      headers: {
        ...(this.token && { Authorization: `Bearer ${this.token}` }),
      },
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Upload failed' }));
      throw new Error(error.message || 'Upload failed');
    }

    return response.json();
  }

  async uploadJSON(file: File, options?: ProcessingOptions): Promise<UploadResponse> {
    const formData = new FormData();
    formData.append('file', file);
    if (options) {
      formData.append('options', JSON.stringify(options));
    }

    const response = await fetch(`${this.baseURL}/upload/json`, {
      method: 'POST',
      headers: {
        ...(this.token && { Authorization: `Bearer ${this.token}` }),
      },
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Upload failed' }));
      throw new Error(error.message || 'Upload failed');
    }

    return response.json();
  }

  async getJobStatus(jobId: string): Promise<JobStatus> {
    return this.request<JobStatus>(`/upload/${jobId}`);
  }

  async cancelJob(jobId: string): Promise<void> {
    await this.request(`/upload/${jobId}`, { method: 'DELETE' });
  }

  // Event Management endpoints
  async getEvents(filters?: EventFilters, page = 1, pageSize = 20): Promise<PaginatedEvents> {
    const params = new URLSearchParams({
      page: page.toString(),
      pageSize: pageSize.toString(),
      ...(filters && Object.entries(filters).reduce((acc, [key, value]) => {
        if (value) acc[key] = value.toString();
        return acc;
      }, {} as Record<string, string>)),
    });

    return this.request<PaginatedEvents>(`/events?${params}`);
  }

  async getEvent(eventId: string): Promise<DDoSEvent> {
    return this.request<DDoSEvent>(`/events/${eventId}`);
  }

  async createEvent(event: Omit<DDoSEvent, 'id'>): Promise<DDoSEvent> {
    return this.request<DDoSEvent>('/events', {
      method: 'POST',
      body: JSON.stringify(event),
    });
  }

  async deleteEvent(eventId: string): Promise<void> {
    await this.request(`/events/${eventId}`, { method: 'DELETE' });
  }

  // System endpoints
  async healthCheck(): Promise<{ status: string; checks: Record<string, boolean> }> {
    return this.request('/health');
  }

  async getMispStatus(): Promise<{ connected: boolean; version?: string }> {
    return this.request('/misp/status');
  }
}

export const apiClient = new ApiClient();
