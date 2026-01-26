// src/lib/auth-api.ts
import api from './http';

/* =======================
   CONSTANTS
======================= */
const TOKEN_KEY = 'token';

/* =======================
   TYPES
======================= */
export interface LoginRequest {
    email: string;
    password: string;
}

export interface AuthUser {
    id: string;
    email: string;
    name: string;
    roleName: string;
    userRoleID: number;
    isActive: boolean;
}

export interface LoginResponse {
    token: string;
    expiresIn: number;
    user: AuthUser;
}

/* =======================
   API CALLS
======================= */
//export const login = async (
//    email: string,
//    password: string
//): Promise<LoginResponse> => {
//    const { data } = await api.post<LoginResponse>(
//        '/Auth/login',
//        { email, password }
//    );

//    // ✅ Store JWT
//    localStorage.setItem(TOKEN_KEY, data.token);

//    return data;
//};

export const login = async (email: string, password: string) => {
    const { data } = await api.post('/api/Auth/login', {
        email,
        password,
    });

    localStorage.setItem(TOKEN_KEY, data.token);
    return data;
};

/* =======================
   TOKEN HELPERS
======================= */
export const getToken = (): string | null => {
    return localStorage.getItem(TOKEN_KEY);
};

export const logout = () => {
    localStorage.removeItem(TOKEN_KEY);
};
