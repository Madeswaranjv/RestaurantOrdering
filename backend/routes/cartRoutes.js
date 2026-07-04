import { Router } from 'express';
import {
  getCart,
  addToCart,
  updateCartItem,
  removeCartItem,
  clearCart
} from '../controllers/cartController.js';
import { authenticate } from '../middlewares/authMiddleware.js';
import { body, param } from 'express-validator';
import { validate } from '../validators/validate.js';

const router = Router();

const validateAddToCart = [
  body('menuItemId').isMongoId().withMessage('Valid menu item ID is required'),
  body('quantity').optional().isInt({ min: 1 }).withMessage('Quantity must be at least 1'),
  body('customization').optional().isObject().withMessage('Customization must be an object'),
  validate
];

const validateUpdateCart = [
  body('menuItemId').isMongoId().withMessage('Valid menu item ID is required'),
  body('quantity').isInt().withMessage('Quantity must be an integer'),
  body('customization').optional().isObject().withMessage('Customization must be an object'),
  validate
];

const validateItemIdParam = [
  param('itemId').isMongoId().withMessage('Valid item ID format is required'),
  validate
];

// Secure all cart endpoints
router.use(authenticate);

router.get('/', getCart);
router.post('/add', validateAddToCart, addToCart);
router.put('/update', validateUpdateCart, updateCartItem);
router.delete('/remove/:itemId', validateItemIdParam, removeCartItem);
router.delete('/clear', clearCart);

export default router;
