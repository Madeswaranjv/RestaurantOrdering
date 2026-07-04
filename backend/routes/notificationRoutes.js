import { Router } from 'express';
import { getNotifications, markAsRead, markAllAsRead } from '../controllers/notificationController.js';
import { authenticate } from '../middlewares/authMiddleware.js';
import { param } from 'express-validator';
import { validate } from '../validators/validate.js';

const router = Router();

const validateNotificationId = [
  param('id').isMongoId().withMessage('Invalid Notification ID format'),
  validate
];

// Secure all notification endpoints
router.use(authenticate);

router.get('/', getNotifications);
router.put('/read/:id', validateNotificationId, markAsRead);
router.put('/read-all', markAllAsRead); // extra helpful helper

export default router;
