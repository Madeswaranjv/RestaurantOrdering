import api from './api';

export const getDashboardStats = async () => {
  const res = await api.get('/admin/dashboard');
  return res.data.data;
};

export const getRevenueAnalytics = async () => {
  const res = await api.get('/admin/analytics/revenue');
  return res.data.data;
};

export const getOrderAnalytics = async () => {
  const res = await api.get('/admin/analytics/orders');
  return res.data.data;
};

export const getCustomerAnalytics = async () => {
  const res = await api.get('/admin/analytics/customers');
  return res.data.data;
};

// Users management
export const getAdminUsers = async (params = {}) => {
  const res = await api.get('/admin/users', { params });
  return res.data.data;
};

export const getAdminUserById = async (id) => {
  const res = await api.get(`/admin/users/${id}`);
  return res.data.data;
};

export const updateUserRole = async (id, role) => {
  const res = await api.put(`/admin/users/${id}/role`, { role });
  return res.data.data;
};

export const blockUser = async (id, reason) => {
  const res = await api.put(`/admin/users/${id}/block`, { reason });
  return res.data.data;
};

export const unblockUser = async (id) => {
  const res = await api.put(`/admin/users/${id}/unblock`);
  return res.data.data;
};

export const deleteUser = async (id) => {
  const res = await api.delete(`/admin/users/${id}`);
  return res.data.data;
};

// Orders management
export const getAdminOrders = async () => {
  const res = await api.get('/admin/orders');
  return res.data.data;
};

export const updateOrderStatus = async (id, status) => {
  const res = await api.put(`/admin/orders/${id}/status`, { status });
  return res.data.data;
};

// Reviews management
export const getAdminReviews = async (params = {}) => {
  const res = await api.get('/admin/reviews', { params });
  return res.data.data;
};

export const hideReview = async (id) => {
  const res = await api.put(`/admin/reviews/${id}/hide`);
  return res.data.data;
};

export const unhideReview = async (id) => {
  const res = await api.put(`/admin/reviews/${id}/unhide`);
  return res.data.data;
};

export const deleteAdminReview = async (id) => {
  const res = await api.delete(`/admin/reviews/${id}`);
  return res.data.data;
};
