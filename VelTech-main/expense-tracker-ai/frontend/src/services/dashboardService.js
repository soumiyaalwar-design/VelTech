import api from './api';

export const dashboardService = {
  async getDashboardSummary(params = {}) {
    const response = await api.get('/dashboard/', { params });
    return response.data?.data;
  },
};
