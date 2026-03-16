import axiosInstance from './axiosConfig';
import type { LoginRequest, LoginResponse, RefreshTokenResponse } from '../types/auth.types';

// ─── Register Types ───
export interface RegisterRequest {
  email: string;
  password: string;
  phone: string;
  role: 'RESTAURANT_OWNER';
}

export interface RegisterResponse {
  userId: number;
  token: string;
  refreshToken: string;
  email: string;
  role: string;
}

// ─── Auth API ───
export const authApi = {

  register: async (data: RegisterRequest): Promise<RegisterResponse> => {
    const response = await axiosInstance.post<RegisterResponse>(
      '/api/auth/register',
      data
    );
    return response.data;
  },

  login: async (credentials: LoginRequest): Promise<LoginResponse> => {
    const response = await axiosInstance.post<LoginResponse>(
      '/api/auth/restaurant/login',
      credentials
    );
    return response.data;
  },

  refreshToken: async (refreshToken: string): Promise<RefreshTokenResponse> => {
    const response = await axiosInstance.post<RefreshTokenResponse>(
      '/api/auth/refresh-token',
      { refreshToken }
    );
    return response.data;
  },

  logout: async (): Promise<void> => {
    const refreshToken = localStorage.getItem('refreshToken');
    try {
      await axiosInstance.post('/api/auth/logout', { refreshToken });
    } finally {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('authUser');
    }
  },
};
