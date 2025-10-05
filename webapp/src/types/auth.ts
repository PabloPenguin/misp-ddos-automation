export interface User {
  id: string;
  username: string;
  email: string;
  role: UserRole;
}

export const UserRole = {
  ANALYST: 'analyst',
  ADMIN: 'admin',
  VIEWER: 'viewer',
} as const;

export type UserRole = typeof UserRole[keyof typeof UserRole];

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export interface AuthResponse {
  user: User;
  token: string;
  refreshToken: string;
}
