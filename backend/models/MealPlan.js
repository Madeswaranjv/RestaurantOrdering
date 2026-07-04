import mongoose from 'mongoose';

const mealPlanSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', index: true },
  age: { type: Number, required: true },
  weight: { type: Number, required: true },
  goal: { type: String, required: true },
  dietaryPreference: { type: String, required: true },
  plan: {
    breakfast: { type: String, required: true },
    lunch: { type: String, required: true },
    dinner: { type: String, required: true },
    calories: { type: Number, required: true },
    protein: { type: Number, required: true },
    carbs: { type: Number, required: true },
    fats: { type: Number, required: true }
  }
}, {
  timestamps: true
});

const MealPlan = mongoose.model('MealPlan', mealPlanSchema);
export default MealPlan;
