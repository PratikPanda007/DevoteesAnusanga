import React, { createContext, useContext, useEffect, useState } from 'react';
import { jwtDecode } from 'jwt-decode';
import { login as loginApi, getToken, logout as logoutApi } from '@/lib/auth-api';

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

interface JwtPayload {
    nameid: string;
    email: string;
    role: string;
    exp: number;
}

interface AuthContextType {
    user: User | null;
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
    const [loading, setLoading] = useState(true);

    /* =======================
       AUTO LOGIN FROM JWT
    ======================= */
    useEffect(() => {
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
                setLoading(false);
                return;
            }

            // 🔄 Rehydrate user from JWT
            setUser({
                id: decoded.nameid,
                email: decoded.email,
                name: '', // optional – fetch profile later
                userRoleID: decoded.role === 'Admin' ? 1 : 2,
                roleName: decoded.role,
                isActive: true,
            });
        } catch {
            logoutApi();
            setUser(null);
        } finally {
            setLoading(false);
        }
    }, []);

    /* =======================
       LOGIN
    ======================= */
    const signIn = async (email: string, password: string) => {
        try {
            const result = await loginApi(email, password);

            setUser({
                id: result.user.id,
                email: result.user.email,
                name: result.user.name,
                userRoleID: result.user.userRoleID,
                roleName: result.user.roleName,
                isActive: result.user.isActive,
            });

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
