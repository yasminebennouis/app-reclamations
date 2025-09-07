// src/context/AuthContext.tsx
import React, { createContext, useContext, useState } from 'react';
import { login as loginApi } from '@/services/api'; // ✅ on utilise la fonction login de api.ts

export type Role = 'ADMIN' | 'TECHNICIEN' | 'DEMANDEUR';
export type ServiceType = 'IT' | 'EQUIPEMENT' | 'INFRASTRUCTURE';

export type User = {
  username: string;
  role: Role;
  service?: ServiceType | null;
};

type AuthContextShape = {
  user: User | null;
  login: (username: string, password: string) => Promise<User>;
  logout: () => void;
  loading: boolean;
  error: string | null;
};

const AuthContext = createContext<AuthContextShape | null>(null);

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within <AuthProvider>');
  return ctx;
};

const AuthProvider: React.FC<React.PropsWithChildren> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const login = async (username: string, password: string) => {
    setLoading(true);
    setError(null);
    try {
      const data = await loginApi(username, password); // ✅ appel direct au service api.ts
      setUser(data);
      return data;
    } catch (e: any) {
      const msg =
        e?.response?.data?.message ||
        e?.message ||
        'Impossible de se connecter';
      setError(msg);
      throw e;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    setError(null);
  };

  const value: AuthContextShape = { user, login, logout, loading, error };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthProvider;
