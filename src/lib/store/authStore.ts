import { atom } from 'nanostores';

export interface User {
  id: string;
  email: string;
  name?: string;
}

export interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  isLoading: boolean;
}

// Initial auth state
const initialState: AuthState = {
  isAuthenticated: false,
  user: null,
  isLoading: false
};

// Create the auth store
export const authStore = atom<AuthState>(initialState);

// Helper functions to update the auth store
export function setAuthenticated(user: User) {
  authStore.set({
    isAuthenticated: true,
    user,
    isLoading: false
  });
}

export function setUnauthenticated() {
  authStore.set({
    isAuthenticated: false,
    user: null,
    isLoading: false
  });
}

export function setLoading(isLoading: boolean) {
  authStore.set({
    ...authStore.get(),
    isLoading
  });
}

// For development/testing purposes
export function mockAuthenticated() {
  setAuthenticated({
    id: 'mock-user-id',
    email: 'user@example.com',
    name: 'Test User'
  });
}

// For development/testing purposes
export function mockUnauthenticated() {
  setUnauthenticated();
} 