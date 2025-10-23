// backend/src/utils/constants/error.constants.js

/**
 * Error constants and messages
 * Centralized error definitions for consistent error handling
 */

export const ERROR_CODES = {
  // Authentication errors
  UNAUTHORIZED: 'UNAUTHORIZED',
  INVALID_CREDENTIALS: 'INVALID_CREDENTIALS',
  TOKEN_EXPIRED: 'TOKEN_EXPIRED',
  TOKEN_INVALID: 'TOKEN_INVALID',
  INSUFFICIENT_PERMISSIONS: 'INSUFFICIENT_PERMISSIONS',

  // Validation errors
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  REQUIRED_FIELD: 'REQUIRED_FIELD',
  INVALID_FORMAT: 'INVALID_FORMAT',
  INVALID_TYPE: 'INVALID_TYPE',
  INVALID_LENGTH: 'INVALID_LENGTH',

  // Resource errors
  NOT_FOUND: 'NOT_FOUND',
  ALREADY_EXISTS: 'ALREADY_EXISTS',
  CONFLICT: 'CONFLICT',

  // Business logic errors
  INSUFFICIENT_STOCK: 'INSUFFICIENT_STOCK',
  INVALID_OPERATION: 'INVALID_OPERATION',
  BUSINESS_RULE_VIOLATION: 'BUSINESS_RULE_VIOLATION',

  // Database errors
  DATABASE_ERROR: 'DATABASE_ERROR',
  CONNECTION_ERROR: 'CONNECTION_ERROR',
  CONSTRAINT_VIOLATION: 'CONSTRAINT_VIOLATION',

  // External service errors
  EXTERNAL_SERVICE_ERROR: 'EXTERNAL_SERVICE_ERROR',
  NETWORK_ERROR: 'NETWORK_ERROR',

  // Generic errors
  INTERNAL_ERROR: 'INTERNAL_ERROR',
  UNKNOWN_ERROR: 'UNKNOWN_ERROR'
};

export const ERROR_MESSAGES = {
  [ERROR_CODES.UNAUTHORIZED]: 'Unauthorized access',
  [ERROR_CODES.INVALID_CREDENTIALS]: 'Invalid email/username or password',
  [ERROR_CODES.TOKEN_EXPIRED]: 'Authentication token has expired',
  [ERROR_CODES.TOKEN_INVALID]: 'Invalid authentication token',
  [ERROR_CODES.INSUFFICIENT_PERMISSIONS]: 'Insufficient permissions for this operation',

  [ERROR_CODES.VALIDATION_ERROR]: 'Validation failed',
  [ERROR_CODES.REQUIRED_FIELD]: 'This field is required',
  [ERROR_CODES.INVALID_FORMAT]: 'Invalid format',
  [ERROR_CODES.INVALID_TYPE]: 'Invalid data type',
  [ERROR_CODES.INVALID_LENGTH]: 'Invalid length',

  [ERROR_CODES.NOT_FOUND]: 'Resource not found',
  [ERROR_CODES.ALREADY_EXISTS]: 'Resource already exists',
  [ERROR_CODES.CONFLICT]: 'Resource conflict',

  [ERROR_CODES.INSUFFICIENT_STOCK]: 'Insufficient stock for this operation',
  [ERROR_CODES.INVALID_OPERATION]: 'Invalid operation',
  [ERROR_CODES.BUSINESS_RULE_VIOLATION]: 'Business rule violation',

  [ERROR_CODES.DATABASE_ERROR]: 'Database operation failed',
  [ERROR_CODES.CONNECTION_ERROR]: 'Database connection failed',
  [ERROR_CODES.CONSTRAINT_VIOLATION]: 'Database constraint violation',

  [ERROR_CODES.EXTERNAL_SERVICE_ERROR]: 'External service error',
  [ERROR_CODES.NETWORK_ERROR]: 'Network error',

  [ERROR_CODES.INTERNAL_ERROR]: 'Internal server error',
  [ERROR_CODES.UNKNOWN_ERROR]: 'Unknown error occurred'
};

export const HTTP_STATUS_CODES = {
  [ERROR_CODES.UNAUTHORIZED]: 401,
  [ERROR_CODES.INVALID_CREDENTIALS]: 401,
  [ERROR_CODES.TOKEN_EXPIRED]: 401,
  [ERROR_CODES.TOKEN_INVALID]: 401,
  [ERROR_CODES.INSUFFICIENT_PERMISSIONS]: 403,

  [ERROR_CODES.VALIDATION_ERROR]: 400,
  [ERROR_CODES.REQUIRED_FIELD]: 400,
  [ERROR_CODES.INVALID_FORMAT]: 400,
  [ERROR_CODES.INVALID_TYPE]: 400,
  [ERROR_CODES.INVALID_LENGTH]: 400,

  [ERROR_CODES.NOT_FOUND]: 404,
  [ERROR_CODES.ALREADY_EXISTS]: 409,
  [ERROR_CODES.CONFLICT]: 409,

  [ERROR_CODES.INSUFFICIENT_STOCK]: 400,
  [ERROR_CODES.INVALID_OPERATION]: 400,
  [ERROR_CODES.BUSINESS_RULE_VIOLATION]: 400,

  [ERROR_CODES.DATABASE_ERROR]: 500,
  [ERROR_CODES.CONNECTION_ERROR]: 500,
  [ERROR_CODES.CONSTRAINT_VIOLATION]: 400,

  [ERROR_CODES.EXTERNAL_SERVICE_ERROR]: 502,
  [ERROR_CODES.NETWORK_ERROR]: 502,

  [ERROR_CODES.INTERNAL_ERROR]: 500,
  [ERROR_CODES.UNKNOWN_ERROR]: 500
};

/**
 * Create standardized error object
 * @param {string} code - Error code
 * @param {string} message - Error message
 * @param {Object} details - Additional error details
 * @returns {Object} Standardized error object
 */
export function createError(code, message = null, details = {}) {
  return {
    code,
    message: message || ERROR_MESSAGES[code] || 'Unknown error',
    details,
    timestamp: new Date().toISOString()
  };
}

/**
 * Get HTTP status code for error
 * @param {string} errorCode - Error code
 * @returns {number} HTTP status code
 */
export function getHttpStatus(errorCode) {
  return HTTP_STATUS_CODES[errorCode] || 500;
}
