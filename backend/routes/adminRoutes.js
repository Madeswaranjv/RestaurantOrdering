import { Router } from 'express';
import { updateRestaurant } from '../controllers/restaurantController.js';
import { createCategory, updateCategory, deleteCategory } from '../controllers/categoryController.js';
import { createMenuItem, updateMenuItem, deleteMenuItem } from '../controllers/menuController.js';
import { getAdminOrders, updateOrderStatus } from '../controllers/orderController.js';
import { getInquiries } from '../controllers/contactController.js';
import {
  getDashboardStats,
  getRevenueAnalytics,
  getOrderAnalytics,
  getCustomerAnalytics,
  getAdminUsers,
  getAdminUserById,
  updateUserRole,
  blockUser,
  unblockUser,
  deleteUser,
  getAdminReviews,
  hideReview,
  unhideReview,
  deleteAdminReview
} from '../controllers/adminController.js';
import { authenticate, authorizeRoles } from '../middlewares/authMiddleware.js';
import { validateCreateMenuItem, validateUpdateMenuItem } from '../validators/menuValidator.js';
import { validateUpdateOrderStatus } from '../validators/orderValidator.js';
import { body, param } from 'express-validator';
import { validate } from '../validators/validate.js';

const router = Router();

// Secure all admin routes to authenticate + admin role check
router.use(authenticate, authorizeRoles('admin'));

// Restaurant Details
router.put('/restaurant', updateRestaurant);

// Category Management
router.post(
  '/categories',
  [body('name').trim().notEmpty().withMessage('Category name is required'), validate],
  createCategory
);
router.put(
  '/categories/:id',
  [
    param('id').isMongoId().withMessage('Invalid Category ID format'),
    body('name').optional().trim().notEmpty().withMessage('Category name cannot be empty'),
    validate
  ],
  updateCategory
);
router.delete(
  '/categories/:id',
  [param('id').isMongoId().withMessage('Invalid Category ID format'), validate],
  deleteCategory
);

// Menu Item Management
router.post('/menu', validateCreateMenuItem, createMenuItem);
router.put('/menu/:id', validateUpdateMenuItem, updateMenuItem);
router.delete(
  '/menu/:id',
  [param('id').isMongoId().withMessage('Invalid Menu Item ID format'), validate],
  deleteMenuItem
);

// Order Management
router.get('/orders', getAdminOrders);
router.put('/orders/:id/status', validateUpdateOrderStatus, updateOrderStatus);

// Contact Inquiries
router.get('/contact', getInquiries);

// Dashboard & Analytical Reports
router.get('/dashboard', getDashboardStats);
router.get('/analytics/revenue', getRevenueAnalytics);
router.get('/analytics/orders', getOrderAnalytics);
router.get('/analytics/customers', getCustomerAnalytics);

// ─── Admin User Management Routes ────────────────────────────────────

/**
 * @swagger
 * /api/admin/users:
 *   get:
 *     summary: Retrieve a paginated, filterable, and sorted list of users
 *     tags: [Admin User Management]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Regex search on name or email
 *       - in: query
 *         name: role
 *         schema:
 *           type: string
 *           enum: [customer, deliveryPartner, admin]
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [active, blocked]
 *       - in: query
 *         name: sort
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *           default: desc
 *     responses:
 *       200:
 *         description: List of users retrieved successfully
 */
router.get('/users', getAdminUsers);

/**
 * @swagger
 * /api/admin/users/{id}:
 *   get:
 *     summary: Get details for a specific user
 *     tags: [Admin User Management]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: User details retrieved successfully
 *       404:
 *         description: User not found
 */
router.get('/users/:id', [param('id').isMongoId().withMessage('Invalid User ID format'), validate], getAdminUserById);

/**
 * @swagger
 * /api/admin/users/{id}/role:
 *   put:
 *     summary: Update the role of a user
 *     tags: [Admin User Management]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - role
 *             properties:
 *               role:
 *                 type: string
 *                 enum: [customer, deliveryPartner, admin]
 *     responses:
 *       200:
 *         description: Role updated successfully
 */
router.put('/users/:id/role', [
  param('id').isMongoId().withMessage('Invalid User ID format'),
  body('role').isIn(['customer', 'deliveryPartner', 'admin']).withMessage('Invalid role'),
  validate
], updateUserRole);

/**
 * @swagger
 * /api/admin/users/{id}/block:
 *   put:
 *     summary: Block a user from logging in and accessing APIs
 *     tags: [Admin User Management]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               reason:
 *                 type: string
 *     responses:
 *       200:
 *         description: User blocked successfully
 */
router.put('/users/:id/block', [
  param('id').isMongoId().withMessage('Invalid User ID format'),
  body('reason').optional().trim().notEmpty().withMessage('Block reason cannot be empty'),
  validate
], blockUser);

/**
 * @swagger
 * /api/admin/users/{id}/unblock:
 *   put:
 *     summary: Unblock a previously blocked user
 *     tags: [Admin User Management]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: User unblocked successfully
 */
router.put('/users/:id/unblock', [param('id').isMongoId().withMessage('Invalid User ID format'), validate], unblockUser);

/**
 * @swagger
 * /api/admin/users/{id}:
 *   delete:
 *     summary: Delete a user and their associated carts/profiles
 *     tags: [Admin User Management]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: User deleted successfully
 */
router.delete('/users/:id', [param('id').isMongoId().withMessage('Invalid User ID format'), validate], deleteUser);

// ─── Admin Review Moderation Routes ──────────────────────────────────

/**
 * @swagger
 * /api/admin/reviews:
 *   get:
 *     summary: Get a list of all reviews with moderation filters
 *     tags: [Admin Review Moderation]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *       - in: query
 *         name: reviewType
 *         schema:
 *           type: string
 *           enum: [Restaurant, Food, Order]
 *       - in: query
 *         name: isHidden
 *         schema:
 *           type: boolean
 *       - in: query
 *         name: rating
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: List of reviews retrieved successfully
 */
router.get('/reviews', getAdminReviews);

/**
 * @swagger
 * /api/admin/reviews/{id}/hide:
 *   put:
 *     summary: Hide a review from public view
 *     tags: [Admin Review Moderation]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Review hidden successfully
 */
router.put('/reviews/:id/hide', [param('id').isMongoId().withMessage('Invalid Review ID format'), validate], hideReview);

/**
 * @swagger
 * /api/admin/reviews/{id}/unhide:
 *   put:
 *     summary: Unhide a hidden review
 *     tags: [Admin Review Moderation]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Review unhidden successfully
 */
router.put('/reviews/:id/unhide', [param('id').isMongoId().withMessage('Invalid Review ID format'), validate], unhideReview);

/**
 * @swagger
 * /api/admin/reviews/{id}:
 *   delete:
 *     summary: Permenantly delete a review
 *     tags: [Admin Review Moderation]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Review deleted successfully
 */
router.delete('/reviews/:id', [param('id').isMongoId().withMessage('Invalid Review ID format'), validate], deleteAdminReview);

export default router;
