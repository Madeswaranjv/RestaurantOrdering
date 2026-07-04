import api from './api';

export const register = async (userData) => {
  const res = await api.post('/auth/register', userData);
  return res.data.data;
};

export const login = async (email, password) => {
  const res = await api.post('/auth/login', { email, password });
  return res.data.data;
};

export const logout = async (token) => {
  const res = await api.post('/auth/logout', { refreshToken: token });
  return res.data;
};

export const getMe = async () => {
  const res = await api.get('/auth/me');
  return res.data.data;
};
