import { Router } from 'express';
import passport from 'passport';
import {
  register,
  login,
  logout,
  rotateRefreshToken,
  forgotPassword,
  resetPassword,
  getMe,
  googleAuthCallbackSuccess
} from '../controllers/authController.js';
import {
  validateRegister,
  validateLogin,
  validateForgotPassword,
  validateResetPassword
} from '../validators/authValidator.js';
import { authenticate } from '../middlewares/authMiddleware.js';
import { authLimiter } from '../middlewares/rateLimitMiddleware.js';

const router = Router();

// Auth Rate Limiting on creation & login endpoints
router.post('/register', authLimiter, validateRegister, register);
router.post('/login', authLimiter, validateLogin, login);
router.post('/logout', logout);
router.post('/refresh-token', rotateRefreshToken);
router.post('/forgot-password', authLimiter, validateForgotPassword, forgotPassword);
router.post('/reset-password', authLimiter, validateResetPassword, resetPassword);

// Profile
router.get('/me', authenticate, getMe);

// Google OAuth
router.get(
  '/google',
  passport.authenticate('google', { scope: ['profile', 'email'], session: false })
);

router.get(
  '/google/callback',
  passport.authenticate('google', { failureRedirect: '/login', session: false }),
  googleAuthCallbackSuccess
);

export default router;
