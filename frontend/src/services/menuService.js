import api from './api';

export const getMenuItems = async (params = {}) => {
  const res = await api.get('/menu', { params });
  return res.data.data;
};

export const getMenuItemById = async (id) => {
  const res = await api.get(`/menu/${id}`);
  return res.data.data;
};

export const getCategories = async () => {
  const res = await api.get('/categories');
  return res.data.data;
};
