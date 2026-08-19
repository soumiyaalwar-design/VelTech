import api from './api';

export const authService = {
  async register(userData) {
    const response = await api.post('/auth/register/', userData);
    return response.data;
  },

  async login(credentials) {
    const response = await api.post('/auth/login/', credentials);
    const data = response.data?.data;
    if (data?.access && data?.refresh) {
      localStorage.setItem('access_token', data.access);
      localStorage.setItem('refresh_token', data.refresh);
      localStorage.setItem('user', JSON.stringify(data.user));
    }
    return response.data;
  },

  async logout() {
    try {
      const refresh = localStorage.getItem('refresh_token');
      if (refresh) {
        await api.post('/auth/logout/', { refresh });
      }
    } catch {
      // Ignore logout backend errors
    } finally {
      localStorage.clear();
    }
  },

  async getProfile() {
    const response = await api.get('/auth/me/');
    return response.data?.data;
  },

  async updateProfile(profileData) {
    const response = await api.put('/auth/me/', profileData);
    return response.data?.data;
  },

  async changePassword(passwordData) {
    const response = await api.post('/auth/change-password/', passwordData);
    return response.data;
  },
};
