import { generateMealPlanFromAI } from '../services/aiService.js';
import MealPlanRepository from '../repositories/MealPlanRepository.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const generateMealPlan = asyncHandler(async (req, res) => {
  const { age, weight, goal, dietaryPreference } = req.body;

  // 1. Invoke the AI Service (Gemini with OpenAI fallback)
  const plan = await generateMealPlanFromAI({
    age: Number(age),
    weight: Number(weight),
    goal,
    dietaryPreference
  });

  // 2. Save the generated plan to the database
  const mealPlan = await MealPlanRepository.create({
    user: req.user ? req.user._id : null,
    age: Number(age),
    weight: Number(weight),
    goal,
    dietaryPreference,
    plan
  });

  res.status(200).json(
    new ApiResponse(200, { mealPlan }, 'Premium AI meal plan generated successfully')
  );
});
export const getMyMealPlans = asyncHandler(async (req, res) => {
  const mealPlans = await MealPlanRepository.findByUserId(req.user._id);
  res.status(200).json(
    new ApiResponse(200, { mealPlans }, 'Meal plans history retrieved successfully')
  );
});
