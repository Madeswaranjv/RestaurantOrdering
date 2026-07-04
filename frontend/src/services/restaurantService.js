import api from './api';

export const getRestaurant = async () => {
  const res = await api.get('/restaurant');
  return res.data.data;
};
