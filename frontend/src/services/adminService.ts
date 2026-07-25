import { api } from './api';

export const adminService = {
  getStats: async () => {
    const res = await api.get('/admin/stats');
    return res.data;
  },
  getUsers: async (params?: any) => {
    const res = await api.get('/admin/users', { params });
    return res.data;
  },
  getUserLinks: async (id: string) => {
    const res = await api.get(`/admin/users/${id}/links`);
    return res.data;
  },
  toggleSuspension: async (id: string) => {
    const res = await api.put(`/admin/users/${id}/suspend`);
    return res.data;
  },
  toggleVerification: async (id: string) => {
    const res = await api.put(`/admin/users/${id}/verify`);
    return res.data;
  },
  updateRole: async (id: string, role: 'user' | 'admin') => {
    const res = await api.put(`/admin/users/${id}/role`, { role });
    return res.data;
  },
  deleteUser: async (id: string) => {
    const res = await api.delete(`/admin/users/${id}`);
    return res.data;
  },
};
