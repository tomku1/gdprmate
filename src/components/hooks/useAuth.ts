import { useStore } from '@nanostores/react';
import { authStore, setAuthenticated, setUnauthenticated, setLoading, mockAuthenticated, mockUnauthenticated } from '@/lib/store/authStore';
import type { User } from '@/lib/store/authStore';

export function useAuth() {
  const auth = useStore(authStore);
  
  const login = async (email: string, password: string) => {
    try {
      setLoading(true);
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Login failed');
      }
      
      const userData = await response.json();
      setAuthenticated(userData.user);
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'An unexpected error occurred'
      };
    } finally {
      setLoading(false);
    }
  };
  
  const logout = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/auth/logout', {
        method: 'POST',
      });
      
      setUnauthenticated();
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'An unexpected error occurred'
      };
    } finally {
      setLoading(false);
    }
  };
  
  // For testing purposes
  const mockLogin = () => {
    mockAuthenticated();
  };
  
  const mockLogout = () => {
    mockUnauthenticated();
  };
  
  return {
    isAuthenticated: auth.isAuthenticated,
    user: auth.user,
    isLoading: auth.isLoading,
    login,
    logout,
    mockLogin,
    mockLogout
  };
} 