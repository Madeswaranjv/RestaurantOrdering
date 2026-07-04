import { Router } from 'express';
import { getMenuItems, getMenuItemById } from '../controllers/menuController.js';
import { validateMenuItemId } from '../validators/menuValidator.js';

const router = Router();

// GET /api/menu (Public)
router.get('/', getMenuItems);

// GET /api/menu/:id (Public)
router.get('/:id', validateMenuItemId, getMenuItemById);

export default router;
