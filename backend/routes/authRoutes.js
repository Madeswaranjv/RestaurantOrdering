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
  googleCredentialLogin,
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
const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';

const ensureGoogleRedirectConfigured = (req, res, next) => {
  if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
    return res.status(503).json({
      success: false,
      message: 'Google redirect OAuth is not configured on the server'
    });
  }
  next();
};

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
router.post('/google', authLimiter, googleCredentialLogin);

router.get(
  '/google',
  ensureGoogleRedirectConfigured,
  passport.authenticate('google', { scope: ['profile', 'email'], session: false })
);

router.get(
  '/google/callback',
  ensureGoogleRedirectConfigured,
  (req, res, next) => {
    passport.authenticate('google', { session: false }, (err, user) => {
      if (err || !user) {
        const message = encodeURIComponent(err?.message || 'Google login failed');
        return res.redirect(`${frontendUrl}/oauth-success?error=${message}`);
      }
      req.user = user;
      next();
    })(req, res, next);
  },
  googleAuthCallbackSuccess
);

export default router;
