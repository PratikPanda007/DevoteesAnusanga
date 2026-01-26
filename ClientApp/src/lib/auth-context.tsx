import React, { createContext, useContext, useEffect, useState } from 'react';
import { jwtDecode } from 'jwt-decode';
import { login as loginApi, getToken, logout as logoutApi } from '@/lib/auth-api';
import { fetchUserDetails } from '@/lib/user-api';

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
}

export interface UserProfile {
    id: string;
    userId: string;
    phone: string;
    country: string;
    city: string;
    missionDescription: string;
    avatarUrl: string | null;
    socialLinks: string;
    isPublic: boolean;
}

interface JwtPayload {
    nameid: string;
    email: string;
    exp: number;
}

interface AuthContextType {
    user: User | null;
    profile: UserProfile | null;
    loading: boolean;
    signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
    signOut: () => void;
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
       AUTO LOGIN + FETCH PROFILE
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

                // ⏱ Token expired
                if (decoded.exp * 1000 < Date.now()) {
                    logoutApi();
                    setUser(null);
                    setProfile(null);
                    setLoading(false);
                    return;
                }

                // 🔥 Fetch full user + profile from backend
                const data = await fetchUserDetails(decoded.email);

                setUser(data.userDetails);
                setProfile(data.userProfile);
            } catch (error) {
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
            // 1️⃣ Authenticate (stores JWT)
            await loginApi(email, password);

            // 2️⃣ Fetch full user + profile
            const data = await fetchUserDetails(email);

            setUser(data.userDetails);
            setProfile(data.userProfile);

            return { error: null };
        } catch (error: any) {
            return { error };
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
       ROLE HELPERS
    ======================= */
    const isAdmin = user?.userRoleID === 1;
    const isDevotee = user?.userRoleID === 2 || isAdmin;

    return (
        <AuthContext.Provider
            value={{
                user,
                profile,
                loading,
                signIn,
                signOut,
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
