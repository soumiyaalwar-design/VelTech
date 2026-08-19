import api from './api';

export const categoryService = {
  async getCategories(params = {}) {
    const response = await api.get('/categories/', { params });
    return response.data?.data || [];
  },

  async createCategory(categoryData) {
    const response = await api.post('/categories/', categoryData);
    return response.data?.data;
  },

  async updateCategory(id, categoryData) {
    const response = await api.put(`/categories/${id}/`, categoryData);
    return response.data?.data;
  },

  async deleteCategory(id) {
    const response = await api.delete(`/categories/${id}/`);
    return response.data;
  },
};
