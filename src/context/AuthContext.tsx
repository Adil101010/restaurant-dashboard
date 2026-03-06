/* eslint-disable react-refresh/only-export-components */

import React, { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import type { AuthUser, LoginRequest } from '../types/auth.types';
import { authApi } from '../api/authApi';

interface AuthContextType {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: LoginRequest) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem('authUser');
    const accessToken = localStorage.getItem('accessToken');
    if (storedUser && accessToken) {
      try {
        setUser(JSON.parse(storedUser));
      } catch {
        localStorage.clear();
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (credentials: LoginRequest): Promise<void> => {
    const response = await authApi.login(credentials);
    const authUser: AuthUser = {
      restaurantId: response.restaurantId,
      restaurantName: response.restaurantName,
      email: response.email,
    };
    localStorage.setItem('accessToken', response.accessToken);
    localStorage.setItem('refreshToken', response.refreshToken);
    localStorage.setItem('authUser', JSON.stringify(authUser));
    setUser(authUser);
  };

  const logout = async (): Promise<void> => {
    try {
      await authApi.logout();
    } finally {
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
