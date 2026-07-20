import api from './api';

const adminService = {
  getSystemAnalytics: async () => {
    const res = await api.get('/admin/analytics');
    return res.data.data;
  },
  
  getSystemHealth: async () => {
    const res = await api.get('/admin/health');
    return res.data.data;
  },

  getAllUsers: async () => {
    const res = await api.get('/admin/users');
    return res.data.data;
  },

  updateUserStatus: async (userId, status) => {
    const res = await api.put(`/admin/users/${userId}/status`, { status });
    return res.data;
  },

  getAllReports: async () => {
    const res = await api.get('/admin/reports');
    return res.data.data;
  }
};

export default adminService;
