import api from './api';

export const expenseService = {
  async getExpenses(params = {}) {
    const response = await api.get('/expenses/', { params });
    // Handles paginated or non-paginated envelope
    return response.data?.data;
  },

  async getExpense(id) {
    const response = await api.get(`/expenses/${id}/`);
    return response.data?.data;
  },

  async createExpense(expenseData) {
    const response = await api.post('/expenses/', expenseData);
    return response.data?.data;
  },

  async updateExpense(id, expenseData) {
    const response = await api.put(`/expenses/${id}/`, expenseData);
    return response.data?.data;
  },

  async deleteExpense(id) {
    const response = await api.delete(`/expenses/${id}/`);
    return response.data;
  },
};
