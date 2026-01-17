import React, { createContext, useContext, useEffect, useState } from 'react';
import { mockAuthService } from './mock-auth';
import { api } from './mock-api';
import { MockUser, ROLE_IDS } from './mock-data';

interface AuthContextType {
  user: MockUser | null;
  loading: boolean;
  profileLoading: boolean;
  roleId: number | null;
  hasProfile: boolean;
  signUp: (email: string, password: string, name: string) => Promise<{ error: Error | null }>;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  isAdmin: boolean;
  isDevotee: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<MockUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [profileLoading, setProfileLoading] = useState(false);
  const [roleId, setRoleId] = useState<number | null>(null);
  const [hasProfile, setHasProfile] = useState(false);

  const fetchUserProfile = async (userId: string) => {
    try {
      const { data } = await api.getProfileByUserId(userId);

      if (data) {
        return { 
          roleId: data.role_id, 
          exists: true 
        };
      }

      return { roleId: null, exists: false };
    } catch (error) {
      console.error('Error fetching user profile:', error);
      return { roleId: null, exists: false };
    }
  };

  useEffect(() => {
    // Check for existing session on mount
    const currentUser = mockAuthService.getCurrentUser();
    setUser(currentUser);
    
    if (currentUser) {
      setProfileLoading(true);
      fetchUserProfile(currentUser.id).then(({ roleId, exists }) => {
        setRoleId(roleId);
        setHasProfile(exists);
        setProfileLoading(false);
        setLoading(false);
      });
    } else {
      setLoading(false);
    }

    // Subscribe to auth state changes
    const unsubscribe = mockAuthService.onAuthStateChange((user) => {
      setUser(user);
      
      if (user) {
        setProfileLoading(true);
        fetchUserProfile(user.id).then(({ roleId, exists }) => {
          setRoleId(roleId);
          setHasProfile(exists);
          setProfileLoading(false);
        });
      } else {
        setRoleId(null);
        setHasProfile(false);
        setProfileLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  const signUp = async (email: string, password: string, name: string) => {
    const { user, error } = await mockAuthService.signUp(email, password, name);
    
    if (user) {
      setUser(user);
    }

    return { error };
  };

  const signIn = async (email: string, password: string) => {
    const { user, error } = await mockAuthService.signIn(email, password);
    
    if (user) {
      setUser(user);
      setProfileLoading(true);
      const { roleId, exists } = await fetchUserProfile(user.id);
      setRoleId(roleId);
      setHasProfile(exists);
      setProfileLoading(false);
    }

    return { error };
  };

  const signOut = async () => {
    await mockAuthService.signOut();
    setUser(null);
    setRoleId(null);
    setHasProfile(false);
  };

  const refreshProfile = async () => {
    if (user) {
      const { roleId, exists } = await fetchUserProfile(user.id);
      setRoleId(roleId);
      setHasProfile(exists);
    }
  };

  const isAdmin = roleId === ROLE_IDS.ADMIN;
  const isDevotee = roleId === ROLE_IDS.DEVOTEE || roleId === ROLE_IDS.ADMIN;

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        profileLoading,
        roleId,
        hasProfile,
        signUp,
        signIn,
        signOut,
        refreshProfile,
        isAdmin,
        isDevotee,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
