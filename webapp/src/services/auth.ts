import type { LoginCredentials, AuthResponse, User } from '../types/auth';
import { apiClient } from './api';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';

class AuthService {
  private baseURL: string;

  constructor(baseURL: string = API_BASE_URL) {
    this.baseURL = baseURL;
  }

  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const response = await fetch(`${this.baseURL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(credentials),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Login failed' }));
      throw new Error(error.message || 'Login failed');
    }

    const authResponse: AuthResponse = await response.json();
    
    // Store token in localStorage
    localStorage.setItem('token', authResponse.token);
    localStorage.setItem('refreshToken', authResponse.refreshToken);
    
    // Set token in API client
    apiClient.setToken(authResponse.token);

    return authResponse;
  }

  async logout(): Promise<void> {
    const token = localStorage.getItem('token');
    
    if (token) {
      try {
        await fetch(`${this.baseURL}/auth/logout`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });
      } catch (error) {
        console.error('Logout error:', error);
      }
    }

    // Clear stored tokens
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    
    // Clear token from API client
    apiClient.setToken(null);
  }

  async refreshToken(): Promise<string> {
    const refreshToken = localStorage.getItem('refreshToken');
    
    if (!refreshToken) {
      throw new Error('No refresh token available');
    }

    const response = await fetch(`${this.baseURL}/auth/refresh`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ refreshToken }),
    });

    if (!response.ok) {
      throw new Error('Token refresh failed');
    }

    const { token } = await response.json();
    
    // Update stored token
    localStorage.setItem('token', token);
    
    // Update token in API client
    apiClient.setToken(token);

    return token;
  }

  async getCurrentUser(): Promise<User> {
    const token = localStorage.getItem('token');
    
    if (!token) {
      throw new Error('Not authenticated');
    }

    const response = await fetch(`${this.baseURL}/auth/me`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to get user info');
    }

    return response.json();
  }

  getStoredToken(): string | null {
    return localStorage.getItem('token');
  }

  isAuthenticated(): boolean {
    return !!this.getStoredToken();
  }
}

export const authService = new AuthService();
