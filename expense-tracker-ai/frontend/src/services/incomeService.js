import api from './api';

export const incomeService = {
  async getIncome(params = {}) {
    const response = await api.get('/income/', { params });
    return response.data?.data;
  },

  async getIncomeById(id) {
    const response = await api.get(`/income/${id}/`);
    return response.data?.data;
  },

  async createIncome(incomeData) {
    const response = await api.post('/income/', incomeData);
    return response.data?.data;
  },

  async updateIncome(id, incomeData) {
    const response = await api.put(`/income/${id}/`, incomeData);
    return response.data?.data;
  },

  async deleteIncome(id) {
    const response = await api.delete(`/income/${id}/`);
    return response.data;
  },
};
