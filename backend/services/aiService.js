import { GoogleGenerativeAI } from '@google/generative-ai';
import OpenAI from 'openai';

// Initialize Gemini SDK
const getGeminiClient = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === 'dummy_gemini_key') {
    return null;
  }
  return new GoogleGenerativeAI(apiKey);
};

// Initialize OpenAI SDK
const getOpenAIClient = () => {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey || apiKey === 'dummy_openai_key') {
    return null;
  }
  return new OpenAI({ apiKey });
};

/**
 * Local fallback generator to provide realistic meal plans when no API keys are present
 */
const generateMockMealPlan = (age, weight, goal, dietaryPreference) => {
  console.log('Generating meal plan using local fallback mock generator...');
  
  let targetCalories = 2000;
  if (goal.toLowerCase().includes('lose')) {
    targetCalories = Math.round(weight * 24 - 500);
  } else if (goal.toLowerCase().includes('gain') || goal.toLowerCase().includes('bulk')) {
    targetCalories = Math.round(weight * 28 + 500);
  } else {
    targetCalories = Math.round(weight * 26);
  }

  // Calculate macros
  const protein = Math.round(weight * 2.0); // 2g per kg
  const fats = Math.round((targetCalories * 0.25) / 9); // 25% fat calories
  const carbs = Math.round((targetCalories - (protein * 4) - (fats * 9)) / 4);

  // Meal selections based on preference
  let breakfast = "Organic Egg White Scramble with Spinach and Avocado on Whole Wheat Toast";
  let lunch = "Seared Salmon Salad with Quinoa, Cucumber, Olive Oil & Lemon dressing";
  let dinner = "Grilled A5 Wagyu Tenderloin with Grilled Asparagus and Sweet Potato Mash";

  const preference = dietaryPreference.toLowerCase();
  if (preference.includes('veg') || preference.includes('vegetarian')) {
    breakfast = "High-protein Tofu Scramble with Spinach, Bell Peppers, and Avocado on Sourdough";
    lunch = "Quinoa Bowl with Roasted Chickpeas, Avocado, Tomatoes, Tahini Dressing";
    dinner = "Truffle Lentil Shepherd's Pie with Sweet Potato Crust and Asparagus";
  } else if (preference.includes('vegan')) {
    breakfast = "Chia Seed Pudding with Almond Milk, Organic Berries, Hemp Seeds";
    lunch = "Spiced Tempeh & Avocado Salad with Brown Rice, Citrus Vinaigrette";
    dinner = "Thai Green Curry with Extra Firm Tofu, Bamboo Shoots, Jasmine Rice";
  } else if (preference.includes('keto')) {
    breakfast = "Bacon & Cheddar Frittata with Avocado and Salsa";
    lunch = "Chicken Caesar Salad with Parmesan Crisp and Avocado Oil dressing";
    dinner = "Pan-seared Salmon in Lemon Garlic Butter Sauce with Steamed Broccoli";
  }

  return {
    breakfast,
    lunch,
    dinner,
    calories: targetCalories,
    protein,
    carbs,
    fats
  };
};

/**
 * Generates a meal plan using AI
 * @param {object} params - Input parameters
 * @param {number} params.age - User age
 * @param {number} params.weight - User weight in kg
 * @param {string} params.goal - Goal e.g. "Lose Weight"
 * @param {string} params.dietaryPreference - Preference e.g. "Keto"
 * @returns {Promise<object>} The generated plan
 */
export const generateMealPlanFromAI = async ({ age, weight, goal, dietaryPreference }) => {
  const provider = (process.env.AI_PROVIDER || 'gemini').toLowerCase();
  
  const systemPrompt = `You are a professional luxury dining nutritionist.
Generate a premium meal plan for the user based on their parameters:
- Age: ${age}
- Weight: ${weight} kg
- Goal: ${goal}
- Dietary Preference: ${dietaryPreference}

You must return a single JSON object. Do not wrap the JSON object in markdown blocks (like \`\`\`json). The JSON object must have exactly the following structure:
{
  "breakfast": "Detailed breakfast description (luxury/gourmet food theme)",
  "lunch": "Detailed lunch description (luxury/gourmet food theme)",
  "dinner": "Detailed dinner description (luxury/gourmet food theme)",
  "calories": number (estimated daily total calories),
  "protein": number (grams of protein),
  "carbs": number (grams of carbohydrates),
  "fats": number (grams of fats)
}
Ensure the calorie and macro math is nutritionally accurate for the weight and goals.`;

  try {
    if (provider === 'gemini') {
      const geminiClient = getGeminiClient();
      if (!geminiClient) {
        return generateMockMealPlan(age, weight, goal, dietaryPreference);
      }

      const model = geminiClient.getGenerativeModel({ model: 'gemini-1.5-flash' });
      const result = await model.generateContent({
        contents: [{ role: 'user', parts: [{ text: systemPrompt }] }],
        generationConfig: {
          responseMimeType: 'application/json'
        }
      });

      const responseText = result.response.text();
      return JSON.parse(responseText.trim());
    } else {
      // OpenAI Provider
      const openaiClient = getOpenAIClient();
      if (!openaiClient) {
        return generateMockMealPlan(age, weight, goal, dietaryPreference);
      }

      const response = await openaiClient.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [{ role: 'user', content: systemPrompt }],
        response_format: { type: 'json_object' }
      });

      const responseText = response.choices[0].message.content;
      return JSON.parse(responseText.trim());
    }
  } catch (error) {
    console.error(`AI Service Error: ${error.message}. Falling back to mock plan...`);
    return generateMockMealPlan(age, weight, goal, dietaryPreference);
  }
};
