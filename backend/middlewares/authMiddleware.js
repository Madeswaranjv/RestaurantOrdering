import passport from 'passport';
import { ApiError } from '../utils/ApiError.js';

/**
 * Authenticates users using JWT strategy.
 * Throws 401 if authentication fails.
 */
export const authenticate = (req, res, next) => {
  passport.authenticate('jwt', { session: false }, (err, user, info) => {
    if (err) {
      return next(err);
    }
    if (!user) {
      return next(new ApiError(401, 'Authentication failed. Invalid or expired token.'));
    }
    if (user.isBlocked) {
      return next(new ApiError(403, `Your account has been blocked. Reason: ${user.blockedReason || 'No reason provided'}`));
    }
    req.user = user;
    next();
  })(req, res, next);
};

/**
 * Restricts access based on user roles
 * @param {...string} roles - Permitted roles ('customer', 'deliveryPartner', 'admin')
 */
export const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return next(new ApiError(401, 'Unauthorized. Please login first.'));
    }
    if (!roles.includes(req.user.role)) {
      return next(new ApiError(403, `Access denied. Role '${req.user.role}' is not authorized to access this resource.`));
    }
    next();
  };
};
