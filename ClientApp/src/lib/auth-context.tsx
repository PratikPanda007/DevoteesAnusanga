import React, { createContext, useContext, useEffect, useState } from 'react';
import { jwtDecode } from 'jwt-decode';
import { login as loginApi, getToken, logout as logoutApi } from '@/lib/auth-api';
import { fetchMyProfile, registerUser } from '@/lib/user-api';
import { UserProfile } from '@/types/user-profile';

/* =======================
   TYPES
======================= */

export interface User {
    id: string;
    email: string;
    name: string;
    userRoleID: number;
    roleName: string;
    isActive: boolean;
    hasProfile: number; // 👈 REQUIRED (0 | 1)
}

interface JwtPayload {
    nameid: string;
    email: string;
    role: string;
    exp: number;
}

interface AuthContextType {
    user: User | null;
    profile: UserProfile | null;
    loading: boolean;
    hasProfile: boolean;
    refreshProfile: () => Promise<void>; 
    signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
    signUp: (
        email: string,
        password: string,
        name: string
    ) => Promise<{ error: Error | null }>;
    signOut: () => void;
    isSuperAdmin: boolean;
    isAdmin: boolean;
    isDevotee: boolean;
}

/* =======================
   CONTEXT
======================= */

const AuthContext = createContext<AuthContextType | undefined>(undefined);

/* =======================
   PROVIDER
======================= */

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(true);

    /* =======================
       FETCH USER + PROFILE
    ======================= */
    const loadProfile = async () => {
        const data = await fetchMyProfile();

        // Backend already decides everything
        setUser(data.userDetails);        // includes hasProfile
        setProfile(data.userProfile);     // null if hasProfile === 0
    };

    const refreshProfile = async () => {
        await loadProfile();
    };

    /* =======================
       AUTO LOGIN
    ======================= */
    useEffect(() => {
        const initAuth = async () => {
            const token = getToken();

            if (!token) {
                setLoading(false);
                return;
            }

            try {
                const decoded = jwtDecode<JwtPayload>(token);

                // Token expired
                if (decoded.exp * 1000 < Date.now()) {
                    logoutApi();
                    setUser(null);
                    setProfile(null);
                    setLoading(false);
                    return;
                }

                // JWT valid → fetch backend truth
                await loadProfile();
            } catch {
                logoutApi();
                setUser(null);
                setProfile(null);
            } finally {
                setLoading(false);
            }
        };

        initAuth();
    }, []);

    /* =======================
       LOGIN
    ======================= */
    const signIn = async (email: string, password: string) => {
        try {
            await loginApi(email, password);
            await loadProfile();
            return { error: null };
        } catch (error: any) {
            return { error };
        }
    };

    /* =======================
       SIGNUP
    ======================= */
    const signUp = async (
        email: string,
        password: string,
        name: string
    ) => {
        try {
            await registerUser({
                email,
                password,
                name,
            });

            return { error: null };
        } catch (err: any) {
            return {
                error: {
                    message: err?.response?.data || "Registration failed",
                },
            };
        }
    };

    /* =======================
       LOGOUT
    ======================= */
    const signOut = () => {
        logoutApi();
        setUser(null);
        setProfile(null);
    };

    /* =======================
       DERIVED VALUES
    ======================= */
    const hasProfile = Boolean(profile);
    const isSuperAdmin = user?.userRoleID === 1;
    const isAdmin = user?.userRoleID === 2;
    const isDevotee =
        user?.userRoleID === 3
            ? true
            : user?.userRoleID === 2
                ? isAdmin
                : isSuperAdmin;

    return (
        <AuthContext.Provider
            value={{
                user,
                profile,
                loading,
                hasProfile,
                refreshProfile,
                signIn,
                signUp,
                signOut,
                isSuperAdmin,
                isAdmin,
                isDevotee,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};

/* =======================
   HOOK
======================= */

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within AuthProvider');
    }
    return context;
};
