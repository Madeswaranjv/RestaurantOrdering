import api from './api';

export const getDashboard = async () => {
  const res = await api.get('/delivery/dashboard');
  return res.data.data;
};

export const getActiveOrders = async () => {
  const res = await api.get('/delivery/active');
  return res.data.data;
};

export const getAvailableOrders = async () => {
  const res = await api.get('/delivery/orders');
  return res.data.data;
};

export const getHistory = async () => {
  const res = await api.get('/delivery/history');
  return res.data.data;
};

export const getEarnings = async () => {
  const res = await api.get('/delivery/earnings');
  return res.data.data;
};

export const acceptOrder = async (orderId) => {
  const res = await api.put(`/delivery/accept/${orderId}`);
  return res.data.data;
};

export const pickupOrder = async (orderId) => {
  const res = await api.put(`/delivery/pickup/${orderId}`);
  return res.data.data;
};

export const deliverOrder = async (orderId) => {
  const res = await api.put(`/delivery/deliver/${orderId}`);
  return res.data.data;
};
