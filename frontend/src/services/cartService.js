import api from './api';

export const getCart = async () => {
  const res = await api.get('/cart');
  return res.data.data;
};

export const addToCart = async (menuItemId, quantity = 1, customization = {}) => {
  const res = await api.post('/cart/add', { menuItemId, quantity, customization });
  return res.data.data;
};

export const updateCartItem = async (menuItemId, quantity, customization = {}) => {
  const res = await api.put('/cart/update', { menuItemId, quantity, customization });
  return res.data.data;
};

export const removeCartItem = async (itemId) => {
  const res = await api.delete(`/cart/remove/${itemId}`);
  return res.data.data;
};

export const clearCart = async () => {
  const res = await api.delete('/cart/clear');
  return res.data.data;
};
