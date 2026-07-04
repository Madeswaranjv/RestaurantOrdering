import api from './api';

export const getReviews = async (params = {}) => {
  const res = await api.get('/reviews', { params });
  return res.data.data;
};

export const createReview = async (reviewData) => {
  const res = await api.post('/reviews', reviewData);
  return res.data.data;
};
