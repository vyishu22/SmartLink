import api from './client';
import axios from 'axios';

export const urlsApi = {
  create: (data) => api.post('/urls', data),
  list: (params) => api.get('/urls', { params }),
  getById: (id) => api.get(`/urls/${id}`),
  update: (id, data) => api.put(`/urls/${id}`, data),
  delete: (id) => api.delete(`/urls/${id}`),
  analytics: (id) => api.get(`/urls/${id}/analytics`),
  dailyClicks: (id, days = 30) => api.get(`/urls/${id}/daily-clicks`, { params: { days } }),
  publicStats: (shortCode) => {
    const base = import.meta.env.VITE_BASE_URL || '';
    return axios.get(`${base}/stats/${shortCode}`);
  },
  bulk: (rows) => api.post('/bulk', { rows }),
};
