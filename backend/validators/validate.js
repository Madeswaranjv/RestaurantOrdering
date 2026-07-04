import { validationResult } from 'express-validator';
import { ApiError } from '../utils/ApiError.js';

/**
 * Validator runner middleware.
 * If express-validator has any errors, maps them and throws a 400 ApiError.
 */
export const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (errors.isEmpty()) {
    return next();
  }
  
  const extractedErrors = errors.array().map(err => ({
    field: err.path || err.param || 'unknown',
    message: err.msg
  }));
  
  throw new ApiError(400, 'Validation Failed', extractedErrors);
};
