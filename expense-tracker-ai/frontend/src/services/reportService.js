import api from './api';

export const reportService = {
  async getReportSummary(params = {}) {
    const response = await api.get('/reports/summary/', { params });
    return response.data?.data;
  },

  async downloadCSV(params = {}) {
    const response = await api.get('/reports/export/csv/', {
      params,
      responseType: 'blob',
    });
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `transactions_report_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    link.remove();
  },

  async downloadExcel(params = {}) {
    const response = await api.get('/reports/export/excel/', {
      params,
      responseType: 'blob',
    });
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `transactions_report_${new Date().toISOString().slice(0, 10)}.xlsx`);
    document.body.appendChild(link);
    link.click();
    link.remove();
  },
};
