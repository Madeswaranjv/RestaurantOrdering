import api from './api';

export const placeOrder = async (deliveryAddress, paymentMethod) => {
  const res = await api.post('/orders', { deliveryAddress, paymentMethod });
  return res.data.data;
};

export const getOrders = async () => {
  const res = await api.get('/orders');
  return res.data.data;
};

export const getOrderById = async (id) => {
  const res = await api.get(`/orders/${id}`);
  return res.data.data;
};

export const cancelOrder = async (id) => {
  const res = await api.put(`/orders/cancel/${id}`);
  return res.data.data;
};
