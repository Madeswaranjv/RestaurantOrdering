import api from './api';

export const getProfile = async () => {
  const res = await api.get('/users/profile');
  return res.data.data;
};

export const updateProfile = async (profileData) => {
  const res = await api.put('/users/profile', profileData);
  return res.data.data;
};

export const changePassword = async (oldPassword, newPassword) => {
  const res = await api.put('/users/change-password', { oldPassword, newPassword });
  return res.data;
};

export const addAddress = async (addressData) => {
  const res = await api.post('/users/address', addressData);
  return res.data.data;
};

export const updateAddress = async (id, addressData) => {
  const res = await api.put(`/users/address/${id}`, addressData);
  return res.data.data;
};

export const deleteAddress = async (id) => {
  const res = await api.delete(`/users/address/${id}`);
  return res.data.data;
};

export const toggleSaveRestaurant = async (id) => {
  const res = await api.put(`/users/save-restaurant/${id}`);
  return res.data.data;
};
