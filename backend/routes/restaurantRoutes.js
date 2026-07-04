import { Router } from 'express';
import { getRestaurant, getRestaurants } from '../controllers/restaurantController.js';

const router = Router();

// GET /api/restaurant or /api/restaurants (Public)
router.get('/', (req, res, next) => {
  if (req.baseUrl.endsWith('/restaurants')) {
    return getRestaurants(req, res, next);
  }
  return getRestaurant(req, res, next);
});

export default router;
