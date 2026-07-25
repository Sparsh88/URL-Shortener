import { api } from './api';

export const urlService = {
  createShortUrl: async (data: any) => {
    const res = await api.post('/urls/shorten', data);
    return res.data;
  },
  getUrls: async (params?: any) => {
    const res = await api.get('/urls', { params });
    return res.data;
  },
  getOverview: async () => {
    const res = await api.get('/analytics/overview');
    return res.data;
  },
  getUrlById: async (id: string) => {
    const res = await api.get(`/urls/${id}`);
    return res.data;
  },
  updateUrl: async (id: string, data: any) => {
    const res = await api.put(`/urls/${id}`, data);
    return res.data;
  },
  deleteUrl: async (id: string) => {
    const res = await api.delete(`/urls/${id}`);
    return res.data;
  },
  bulkDelete: async (ids: string[]) => {
    const res = await api.post('/urls/bulk-delete', { ids });
    return res.data;
  },
  bulkImport: async (urls: any[]) => {
    const res = await api.post('/urls/bulk-import', { urls });
    return res.data;
  },
  exportCsv: async () => {
    const res = await api.get('/urls/export/csv', { responseType: 'blob' });
    return res.data;
  },
  toggleFavorite: async (id: string) => {
    const res = await api.put(`/urls/${id}/favorite`);
    return res.data;
  },
  verifyPassword: async (shortCode: string, password: string) => {
    const res = await api.post('/urls/verify-password', { shortCode, password });
    return res.data;
  },
};
