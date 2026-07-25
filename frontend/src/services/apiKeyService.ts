import { api } from './api';

export const apiKeyService = {
  getKeys: async () => {
    const res = await api.get('/api-keys');
    return res.data;
  },
  createKey: async (name: string) => {
    const res = await api.post('/api-keys', { name });
    return res.data;
  },
  deleteKey: async (id: string) => {
    const res = await api.delete(`/api-keys/${id}`);
    return res.data;
  },
};
