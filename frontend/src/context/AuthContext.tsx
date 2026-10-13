import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types';
import { api } from '../services/api';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (phone_or_email: string, password: string) => Promise<void>;
  register: (data: any) => Promise<void>;
  logout: () => void;
  quickDemoLogin: (role: 'admin' | 'panchayat_rep' | 'seller' | 'buyer') => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('pashusetu_token'));
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const refreshUser = async () => {
    try {
      const currentUser = await api.getMe();
      setUser(currentUser);
    } catch {
      setUser(null);
      setToken(null);
      localStorage.removeItem('pashusetu_token');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      refreshUser();
    } else {
      setIsLoading(false);
    }
  }, [token]);

  const login = async (phone_or_email: string, password: string) => {
    const res = await api.login(phone_or_email, password);
    setToken(res.access_token);
    setUser(res.user);
    localStorage.setItem('pashusetu_token', res.access_token);
  };

  const register = async (data: any) => {
    const res = await api.register(data);
    setToken(res.access_token);
    setUser(res.user);
    localStorage.setItem('pashusetu_token', res.access_token);
  };

  const quickDemoLogin = async (role: 'admin' | 'panchayat_rep' | 'seller' | 'buyer') => {
    const creds = {
      admin: { id: "9876500001", pass: "Admin@123" },
      panchayat_rep: { id: "9876500002", pass: "Panchayat@123" },
      seller: { id: "9876500003", pass: "Farmer@123" },
      buyer: { id: "9876500004", pass: "Buyer@123" }
    }[role];
    await login(creds.id, creds.pass);
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('pashusetu_token');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        login,
        register,
        logout,
        quickDemoLogin,
        refreshUser
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
