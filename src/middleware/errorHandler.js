const AppError = require('../utils/AppError');
const logger = require('../utils/logger');
const config = require('../config');

const handleCastError = (err) => {
  return new AppError(`Invalid ${err.path}: ${err.value}`, 400);
};

const handleDuplicateKeyError = (err) => {
  const field = Object.keys(err.keyValue).join(', ');
  return new AppError(`Duplicate value for field: ${field}. Please use another value.`, 409);
};

const handleValidationError = (err) => {
  const messages = Object.values(err.errors).map((e) => e.message);
  return new AppError('Validation failed', 400, messages);
};

const handleJWTError = () => {
  return new AppError('Invalid token. Please log in again.', 401);
};

const handleJWTExpiredError = () => {
  return new AppError('Token expired. Please log in again.', 401);
};

const errorHandler = (err, req, res, _next) => {
  let error = { ...err, message: err.message, stack: err.stack };

  // Mongoose bad ObjectId
  if (err.name === 'CastError') error = handleCastError(err);
  // Mongoose duplicate key
  if (err.code === 11000) error = handleDuplicateKeyError(err);
  // Mongoose validation
  if (err.name === 'ValidationError') error = handleValidationError(err);
  // JWT errors
  if (err.name === 'JsonWebTokenError') error = handleJWTError();
  if (err.name === 'TokenExpiredError') error = handleJWTExpiredError();

  const statusCode = error.statusCode || 500;
  const isOperational = error.isOperational || false;

  // Log the error
  if (!isOperational || statusCode >= 500) {
    logger.error(`${statusCode} — ${error.message}`, {
      method: req.method,
      url: req.originalUrl,
      ip: req.ip,
      stack: error.stack,
    });
  } else {
    logger.warn(`${statusCode} — ${error.message}`, {
      method: req.method,
      url: req.originalUrl,
    });
  }

  // Build response
  const response = {
    success: false,
    status: error.status || 'error',
    message: isOperational ? error.message : 'Something went wrong',
    ...(error.details && { details: error.details }),
    ...(config.env === 'development' && { stack: error.stack }),
  };

  res.status(statusCode).json(response);
};

module.exports = errorHandler;
