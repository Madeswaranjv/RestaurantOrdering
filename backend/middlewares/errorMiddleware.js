import { ApiError } from '../utils/ApiError.js';

export const errorHandler = (err, req, res, next) => {
  let error = err;

  // If the error is not an instance of ApiError, normalize it
  if (!(error instanceof ApiError)) {
    const statusCode = error.statusCode || (error.name === 'ValidationError' ? 400 : 500);
    const message = error.message || 'Internal Server Error';
    
    // Mongoose duplicate key error
    if (error.code === 11000) {
      error = new ApiError(400, 'Duplicate field value entered', [
        { field: Object.keys(error.keyValue)[0], message: 'Must be unique' }
      ]);
    } 
    // Mongoose validation or Cast error
    else if (error.name === 'CastError') {
      error = new ApiError(400, `Resource not found with id of ${error.value}`);
    } else {
      error = new ApiError(statusCode, message, error.errors || []);
    }
  }

  // Structure response payload
  const response = {
    success: false,
    message: error.message,
    errors: error.errors || []
  };

  // Include stack trace only in development mode
  if (process.env.NODE_ENV === 'development') {
    response.stack = error.stack;
  }

  res.status(error.statusCode || 500).json(response);
};
