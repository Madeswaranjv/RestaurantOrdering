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
  body('menuItemId').notEmpty().withMessage('Menu item ID is required'),
  body('quantity').optional().isInt({ min: 1 }).withMessage('Quantity must be at least 1'),
  body('customization').optional().isObject().withMessage('Customization must be an object'),
  validate
];

const validateUpdateCart = [
  body('menuItemId').optional().notEmpty().withMessage('Menu item ID cannot be empty'),
  body('cartItemId').optional().notEmpty().withMessage('Cart item ID cannot be empty'),
  body().custom((value, { req }) => {
    if (!req.body.menuItemId && !req.body.cartItemId) {
      throw new Error('menuItemId or cartItemId is required');
    }
    return true;
  }),
  body('quantity').isInt().withMessage('Quantity must be an integer'),
  body('customization').optional().isObject().withMessage('Customization must be an object'),
  validate
];

const validateItemIdParam = [
  param('itemId').notEmpty().withMessage('Item ID is required'),
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
