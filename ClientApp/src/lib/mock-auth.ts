// Mock authentication service - replace with real API calls later

import { MockUser, mockUsers, ROLE_IDS } from './mock-data';

const STORAGE_KEY = 'mockAuthUser';

// Simulated delay to mimic network latency
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Demo credentials
const DEMO_CREDENTIALS = [
  { email: 'demo@example.com', password: 'demo123', userId: 'user-demo-1' },
  { email: 'admin@example.com', password: 'admin123', userId: 'user-admin-1' },
];

export const mockAuthService = {
  signIn: async (email: string, password: string): Promise<{ user: MockUser | null; error: Error | null }> => {
    await delay(500);
    
    const credential = DEMO_CREDENTIALS.find(
      cred => cred.email.toLowerCase() === email.toLowerCase() && cred.password === password
    );
    
    if (credential) {
      const user = mockUsers.find(u => u.id === credential.userId);
      if (user) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
        return { user, error: null };
      }
    }
    
    return { user: null, error: new Error('Invalid email or password') };
  },

  signUp: async (email: string, password: string, name: string): Promise<{ user: MockUser | null; error: Error | null }> => {
    await delay(500);
    
    // Check if email already exists
    if (DEMO_CREDENTIALS.some(c => c.email.toLowerCase() === email.toLowerCase())) {
      return { user: null, error: new Error('Email already registered') };
    }
    
    // Create a new mock user
    const newUser: MockUser = {
      id: `user-${Date.now()}`,
      email,
      user_metadata: { name },
    };
    
    // Add to mock users (in memory only - will reset on refresh)
    mockUsers.push(newUser);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newUser));
    
    return { user: newUser, error: null };
  },

  signOut: async (): Promise<void> => {
    await delay(200);
    localStorage.removeItem(STORAGE_KEY);
  },

  getCurrentUser: (): MockUser | null => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        return JSON.parse(stored) as MockUser;
      } catch {
        return null;
      }
    }
    return null;
  },

  // Subscribe to auth state changes (simplified version)
  onAuthStateChange: (callback: (user: MockUser | null) => void): (() => void) => {
    // Check initial state
    const user = mockAuthService.getCurrentUser();
    callback(user);
    
    // Listen for storage changes (for multi-tab support)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY) {
        const user = e.newValue ? JSON.parse(e.newValue) : null;
        callback(user);
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  },
};
