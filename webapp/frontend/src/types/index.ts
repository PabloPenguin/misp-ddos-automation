// MISP Event Types
export interface DDoSEvent {
  id?: string;
  title: string;
  description: string;
  attacker_ips: string[];
  victim_ips: string[];
  attack_ports: string[];
  attack_type: 'direct-flood' | 'amplification' | 'other';
  severity: 'low' | 'medium' | 'high' | 'critical';
  timestamp?: string;
  additional_attributes?: Record<string, any>;
}

// File Upload Types
export interface FileUploadJob {
  id: string;
  filename: string;
  size: number;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  progress: number;
  created_at: string;
  completed_at?: string;
  error_message?: string;
  events_created?: number;
  events_failed?: number;
  ai_processing?: {
    enabled: boolean;
    options?: any;
    estimated_corrections?: number;
    workflow_url?: string;
    conclusion?: string;
    corrections_made?: number;
    data_quality_score?: number;
  };
}

// API Response Types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  per_page: number;
  total_pages: number;
}

// Form Types
export interface UploadFormData {
  file: File;
  auto_process: boolean;
  notify_completion: boolean;
}

export interface EventFormData {
  title: string;
  description: string;
  attacker_ips: string;
  victim_ips: string;
  attack_ports: string;
  attack_type: DDoSEvent['attack_type'];
  severity: DDoSEvent['severity'];
}

// User & Auth Types
export interface User {
  id: string;
  username: string;
  email: string;
  role: 'analyst' | 'admin' | 'viewer';
  created_at: string;
  last_login?: string;
}

export interface AuthTokens {
  access_token: string;
  refresh_token: string;
  token_type: string;
  expires_in: number;
}

// MISP Integration Types
export interface MISPEvent {
  id: string;
  title: string;
  info: string;
  date: string;
  threat_level: '1' | '2' | '3' | '4';
  analysis: '0' | '1' | '2';
  distribution: '0' | '1' | '2' | '3';
  published: boolean;
  tags: Array<{
    name: string;
    colour: string;
  }>;
  attributes: Array<{
    type: string;
    value: string;
    category: string;
    to_ids: boolean;
  }>;
  galaxy_clusters?: Array<{
    name: string;
    type: string;
    description: string;
  }>;
  created_at: string;
  updated_at: string;
}

export interface MISPEventResponse {
  event_id: string;
  success: boolean;
  message: string;
  misp_url?: string;
}

// Statistics Types
export interface DashboardStats {
  total_events: number;
  events_this_month: number;
  active_uploads: number;
  recent_activity: Array<{
    id: string;
    type: 'upload' | 'event_created' | 'error';
    message: string;
    timestamp: string;
  }>;
}

// Configuration Types
export interface AppConfig {
  misp_url: string;
  max_file_size: number;
  allowed_file_types: string[];
  features: {
    auto_processing: boolean;
    email_notifications: boolean;
    advanced_search: boolean;
  };
}