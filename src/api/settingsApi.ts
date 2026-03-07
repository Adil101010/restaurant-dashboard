import api from './axiosConfig';

export interface UserProfile {
  id: number;
  name: string | null;
  email: string | null;
  phone: string | null;
  role: string | null;
  active: boolean;
  createdAt: string | null;
  updatedAt: string | null;
}

export const settingsApi = {
  getProfile: () =>
    api.get<UserProfile>('/api/users/profile').then(r => r.data),

  updateProfile: (data: { name?: string; phone?: string }) =>
    api.put<{ success: boolean; message: string; name: string | null; phone: string | null }>(
      '/api/users/profile', data
    ).then(r => r.data),

  changePassword: (currentPassword: string, newPassword: string) =>
    api.put<{ success: boolean; message: string }>(
      '/api/users/change-password',
      { currentPassword, newPassword }
    ).then(r => r.data),
};
