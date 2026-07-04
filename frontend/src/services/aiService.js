import api from './api';

export const generateMealPlan = async (age, weight, goal, dietaryPreference) => {
  const res = await api.post('/ai/meal-plan', { age, weight, goal, dietaryPreference });
  return res.data.data;
};

export const getMyMealPlans = async () => {
  const res = await api.get('/ai/meal-plan');
  return res.data.data;
};
