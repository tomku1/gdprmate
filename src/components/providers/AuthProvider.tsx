import { useEffect } from "react";
import { useAuth } from "../hooks/useAuth";
import { setAuthenticated } from "../../lib/store/authStore";
import type { User } from "../../lib/store/authStore";

interface AuthProviderProps {
  children: React.ReactNode;
  initialUser: User | null;
  initialIsAuthenticated: boolean;
}

export function AuthProvider({ children, initialUser, initialIsAuthenticated }: AuthProviderProps) {
  const { checkSession } = useAuth();

  // Initialize auth store with server-provided values
  useEffect(() => {
    if (initialIsAuthenticated && initialUser) {
      setAuthenticated(initialUser);
    } else {
      // Only check session if not already authenticated from server
      checkSession();
    }
  }, [initialIsAuthenticated, initialUser]);

  return <>{children}</>;
}
