import api from './api';

export const getNotifications = async () => {
  const res = await api.get('/notifications');
  return res.data.data;
};

export const markAsRead = async (id) => {
  const res = await api.put(`/notifications/read/${id}`);
  return res.data.data;
};

export const markAllAsRead = async () => {
  const res = await api.put('/notifications/read-all');
  return res.data.data;
};
