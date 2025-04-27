import { useStore } from "@nanostores/react";
import {
  authStore,
  setAuthenticated,
  setUnauthenticated,
  setLoading,
  mockAuthenticated,
  mockUnauthenticated,
} from "@/lib/store/authStore";
import type { User } from "@/lib/store/authStore";

export function useAuth() {
  const auth = useStore(authStore);

  const checkSession = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/auth/session", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        const data = await response.json();
        if (data.authenticated && data.user) {
          setAuthenticated(data.user);
          return { success: true, authenticated: true };
        } else {
          setUnauthenticated();
          return { success: true, authenticated: false };
        }
      } else {
        setUnauthenticated();
        return { success: false, authenticated: false };
      }
    } catch (error) {
      console.error("Failed to check session:", error);
      setUnauthenticated();
      return { success: false, authenticated: false };
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    try {
      setLoading(true);
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Login failed");
      }

      const userData = await response.json();
      setAuthenticated(userData.user);
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "An unexpected error occurred",
      };
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/auth/logout", {
        method: "POST",
      });

      setUnauthenticated();
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "An unexpected error occurred",
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
    checkSession,
    login,
    logout,
    mockLogin,
    mockLogout,
  };
}
