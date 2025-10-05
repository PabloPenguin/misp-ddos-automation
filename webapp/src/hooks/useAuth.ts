import { create } from 'zustand';
import type { LoginCredentials, AuthState } from '../types/auth';
import { authService } from '../services/auth';
import { apiClient } from '../services/api';

interface AuthStore extends AuthState {
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
  setLoading: (loading: boolean) => void;
}

export const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: true,

  login: async (credentials: LoginCredentials) => {
    set({ isLoading: true });
    try {
      const response = await authService.login(credentials);
      set({
        user: response.user,
        token: response.token,
        isAuthenticated: true,
        isLoading: false,
      });
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },

  logout: async () => {
    set({ isLoading: true });
    try {
      await authService.logout();
      set({
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
      });
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },

  checkAuth: async () => {
    const token = authService.getStoredToken();
    
    if (!token) {
      set({ isAuthenticated: false, isLoading: false });
      return;
    }

    try {
      apiClient.setToken(token);
      const user = await authService.getCurrentUser();
      set({
        user,
        token,
        isAuthenticated: true,
        isLoading: false,
      });
    } catch (error) {
      // Token is invalid, clear auth state
      await authService.logout();
      set({
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
      });
    }
  },

  setLoading: (loading: boolean) => {
    set({ isLoading: loading });
  },
}));

export const useAuth = () => {
  const { user, isAuthenticated, isLoading, login, logout, checkAuth } = useAuthStore();
  
  return {
    user,
    isAuthenticated,
    isLoading,
    login,
    logout,
    checkAuth,
  };
};
