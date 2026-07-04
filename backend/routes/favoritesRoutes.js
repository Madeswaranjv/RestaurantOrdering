import { Router } from 'express';
import { addFavorite, removeFavorite, getFavorites } from '../controllers/favoritesController.js';
import { authenticate } from '../middlewares/authMiddleware.js';
import { param } from 'express-validator';
import { validate } from '../validators/validate.js';

const router = Router();

const validateMenuIdParam = [
  param('menuId').isMongoId().withMessage('Invalid menu item ID format'),
  validate
];

// Secure all favorites endpoints
router.use(authenticate);

router.post('/:menuId', validateMenuIdParam, addFavorite);
router.delete('/:menuId', validateMenuIdParam, removeFavorite);
router.get('/', getFavorites);

export default router;
