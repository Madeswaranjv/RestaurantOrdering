import { Router } from 'express';
import { generateMealPlan, getMyMealPlans } from '../controllers/aiController.js';
import { authenticate } from '../middlewares/authMiddleware.js';
import { body } from 'express-validator';
import { validate } from '../validators/validate.js';

const router = Router();

const validateMealPlannerInput = [
  body('age').isInt({ min: 1, max: 120 }).withMessage('Age must be a valid number between 1 and 120'),
  body('weight').isFloat({ min: 10, max: 500 }).withMessage('Weight must be a valid number in kg'),
  body('goal').trim().notEmpty().withMessage('Goal is required'),
  body('dietaryPreference').trim().notEmpty().withMessage('Dietary preference is required'),
  validate
];

// Secure AI routes
router.use(authenticate);

router.post('/meal-plan', validateMealPlannerInput, generateMealPlan);
router.get('/meal-plan', getMyMealPlans);

export default router;
