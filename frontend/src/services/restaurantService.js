import api from './api';

export const getRestaurant = async () => {
  const res = await api.get('/restaurants');
  return res.data.data;
};
