import { api } from './api';

export const analyticsService = {
  getOverview: async () => {
    const res = await api.get('/analytics/overview');
    return res.data;
  },
  getUrlAnalytics: async (id: string, timeframe = '7d') => {
    const res = await api.get(`/analytics/url/${id}`, { params: { timeframe } });
    return res.data;
  },
};
