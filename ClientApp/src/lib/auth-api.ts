// src/lib/auth-api.ts

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

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'https://localhost:7165';

const TOKEN_KEY = 'auth_token';

export const login = async (
  email: string,
  password: string
): Promise<LoginResponse> => {
  const response = await fetch(`${API_BASE}/api/Auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, password }),
  });

  if (!response.ok) {
    const message = await response.text();
    throw new Error(message || 'Login failed');
  }

  const data: LoginResponse = await response.json();

  // ✅ STORE JWT
  localStorage.setItem(TOKEN_KEY, data.token);

  return data;
};

export const logout = () => {
  localStorage.removeItem(TOKEN_KEY);
};

export const getToken = (): string | null => {
  return localStorage.getItem(TOKEN_KEY);
};
