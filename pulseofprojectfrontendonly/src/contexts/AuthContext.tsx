import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import type { UserRole } from '../utils/permissions';

const API_BASE_URL = import.meta.env.VITE_DJANGO_API_URL || 'http://127.0.0.1:8000/api';

interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
  permissions: string[];
  ward?: string;
  constituency?: string;
  is_super_admin?: boolean;
  organization_id?: string;
  status?: 'active' | 'inactive' | 'suspended';
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  signup: (email: string, password: string, name: string, role?: string) => Promise<boolean>;
  logout: () => void;
  isLoading: boolean;
  isInitializing: boolean;
  hasPermission: (permission: string) => boolean;
  isWorker: () => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

// Token management
const TOKEN_KEY = 'pulseofpeople_access_token';
const REFRESH_TOKEN_KEY = 'pulseofpeople_refresh_token';

const getAccessToken = () => localStorage.getItem(TOKEN_KEY);
const getRefreshToken = () => localStorage.getItem(REFRESH_TOKEN_KEY);
const setTokens = (access: string, refresh: string) => {
  localStorage.setItem(TOKEN_KEY, access);
  localStorage.setItem(REFRESH_TOKEN_KEY, refresh);
};
const clearTokens = () => {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
};

// API helper with automatic token refresh
const apiCall = async (endpoint: string, options: RequestInit = {}) => {
  let token = getAccessToken();

  const makeRequest = async (accessToken: string | null) => {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (accessToken) {
      headers['Authorization'] = `Bearer ${accessToken}`;
    }

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
    });

    return response;
  };

  let response = await makeRequest(token);

  // If unauthorized, try to refresh token
  if (response.status === 401 && getRefreshToken()) {
    console.log('[Auth] Token expired, refreshing...');

    try {
      const refreshResponse = await fetch(`${API_BASE_URL}/auth/refresh/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refresh: getRefreshToken() }),
      });

      if (refreshResponse.ok) {
        const { access } = await refreshResponse.json();
        localStorage.setItem(TOKEN_KEY, access);
        console.log('[Auth] Token refreshed successfully');

        // Retry original request with new token
        response = await makeRequest(access);
      } else {
        // Refresh failed, clear tokens
        console.log('[Auth] Token refresh failed, logging out');
        clearTokens();
        window.location.href = '/login';
      }
    } catch (error) {
      console.error('[Auth] Token refresh error:', error);
      clearTokens();
      window.location.href = '/login';
    }
  }

  return response;
};

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);

  // Check for existing session on mount
  useEffect(() => {
    checkSession();
  }, []);

  const checkSession = async () => {
    console.log('[Auth] Checking for existing session...');

    const token = getAccessToken();
    if (!token) {
      console.log('[Auth] No token found');
      setIsInitializing(false);
      return;
    }

    try {
      // Fetch current user profile
      const response = await apiCall('/profile/me/');

      if (response.ok) {
        const data = await response.json();
        console.log('[Auth] Session valid, user:', data.email, 'role:', data.role);

        setUser({
          id: data.id.toString(),
          name: data.username || data.email.split('@')[0],
          email: data.email,
          role: (data.role || 'user') as UserRole,
          permissions: data.permissions || [],
          avatar: data.avatar_url,
          is_super_admin: data.role === 'superadmin',
          organization_id: data.organization?.toString(),
          status: 'active',
        });
      } else {
        console.log('[Auth] Session invalid');
        clearTokens();
      }
    } catch (error) {
      console.error('[Auth] Session check error:', error);
      clearTokens();
    } finally {
      setIsInitializing(false);
    }
  };

  const login = async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    console.log('[Auth] Attempting login for:', email);

    try {
      // Attempt login with username first
      let response = await fetch(`${API_BASE_URL}/auth/login/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: email, password }),
      });

      // If that fails, try with email
      if (!response.ok) {
        response = await fetch(`${API_BASE_URL}/auth/login/`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password }),
        });
      }

      if (!response.ok) {
        const error = await response.json();
        console.error('[Auth] Login failed:', error);
        setIsLoading(false);
        return false;
      }

      const { access, refresh } = await response.json();
      setTokens(access, refresh);
      console.log('[Auth] Login successful, tokens stored');

      // Fetch user profile
      const profileResponse = await apiCall('/profile/me/');
      if (profileResponse.ok) {
        const data = await profileResponse.json();

        setUser({
          id: data.id.toString(),
          name: data.username || data.email.split('@')[0],
          email: data.email,
          role: (data.role || 'user') as UserRole,
          permissions: data.permissions || [],
          avatar: data.avatar_url,
          is_super_admin: data.role === 'superadmin',
          organization_id: data.organization?.toString(),
          status: 'active',
        });

        console.log('[Auth] User profile loaded, role:', data.role);
        setIsLoading(false);
        return true;
      }

      setIsLoading(false);
      return false;
    } catch (error) {
      console.error('[Auth] Login error:', error);
      setIsLoading(false);
      return false;
    }
  };

  const signup = async (
    email: string,
    password: string,
    name: string,
    role: string = 'user'
  ): Promise<boolean> => {
    setIsLoading(true);
    console.log('[Auth] Attempting signup for:', email);

    try {
      const [firstName, ...lastNameParts] = name.split(' ');
      const lastName = lastNameParts.join(' ');

      const response = await fetch(`${API_BASE_URL}/auth/register/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: email.split('@')[0],
          email,
          password,
          password_confirm: password,
          first_name: firstName,
          last_name: lastName,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        console.error('[Auth] Signup failed:', error);
        setIsLoading(false);
        return false;
      }

      console.log('[Auth] Signup successful, logging in...');

      // Auto-login after signup
      const loginSuccess = await login(email, password);
      setIsLoading(false);
      return loginSuccess;
    } catch (error) {
      console.error('[Auth] Signup error:', error);
      setIsLoading(false);
      return false;
    }
  };

  const logout = () => {
    console.log('[Auth] Logging out...');
    clearTokens();
    setUser(null);
    window.location.href = '/login';
  };

  const hasPermission = (permission: string): boolean => {
    if (!user) return false;

    // Superadmin has all permissions
    if (user.is_super_admin) return true;

    // Check if user has wildcard permission
    if (user.permissions.includes('*')) return true;

    // Check specific permission
    return user.permissions.includes(permission);
  };

  const isWorker = (): boolean => {
    return user?.role === 'volunteer' || user?.role === 'user';
  };

  const value: AuthContextType = {
    user,
    login,
    signup,
    logout,
    isLoading,
    isInitializing,
    hasPermission,
    isWorker,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

// Export API helper for use in services
export { apiCall, API_BASE_URL };
