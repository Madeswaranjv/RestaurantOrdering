import api from './api';

export const getCart = async () => {
  const res = await api.get('/cart');
  return res.data.data;
};

export const addToCart = async (menuItemId, quantity = 1, customization = {}) => {
  const res = await api.post('/cart/add', { menuItemId, quantity, customization });
  return res.data.data;
};

export const updateCartItem = async (item, quantity, customization = {}) => {
  const payload = typeof item === 'object'
    ? { ...item, quantity, customization: item.customization || customization }
    : { cartItemId: item, quantity, customization };
  const res = await api.put('/cart/update', payload);
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
