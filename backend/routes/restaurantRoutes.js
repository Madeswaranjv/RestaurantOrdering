import { Router } from 'express';
import { getRestaurant } from '../controllers/restaurantController.js';

const router = Router();

// GET /api/restaurant (Public)
router.get('/', getRestaurant);

export default router;
