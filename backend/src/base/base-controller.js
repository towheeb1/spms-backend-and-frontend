// backend/src/base/base-controller.js
import { IController } from "../interfaces/index.js";

/**
 * Abstract base class for all controllers
 * Implements common functionality and enforces interface compliance
 */
class BaseController extends IController {
  constructor(service) {
    super();
    this.service = service;
  }

  /**
   * Handle HTTP request and return response
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @returns {Promise<void>}
   */
  async handleRequest(req, res) {
    try {
      // Validate request data
      const validation = this.validate(req.body || req.query);
      if (!validation.isValid) {
        return res.status(400).json({
          success: false,
          message: "Validation failed",
          errors: validation.errors
        });
      }

      // Transform request data
      const transformedData = this.transformRequest(req);

      // Execute service logic
      const result = await this.service.execute(transformedData);

      // Transform response data
      const responseData = this.transformResponse(result);

      // Send success response
      res.json({
        success: true,
        data: responseData,
        message: "Operation completed successfully"
      });

    } catch (error) {
      console.error(`${this.constructor.name} error:`, error);

      // Handle different types of errors
      const errorResponse = this.handleError(error);

      res.status(errorResponse.status || 500).json({
        success: false,
        message: errorResponse.message || "Internal server error",
        error: errorResponse.error || error.message
      });
    }
  }

  /**
   * Validate request data
   * @param {Object} data - Data to validate
   * @returns {Object} Validation result
   */
  validate(data) {
    // Default implementation - should be overridden by subclasses
    return {
      isValid: true,
      errors: []
    };
  }

  /**
   * Transform request data to internal format
   * @param {Object} req - Express request object
   * @returns {Object} Transformed data
   */
  transformRequest(req) {
    // Default implementation - should be overridden by subclasses
    return req.body || req.query || {};
  }

  /**
   * Transform internal data to response format
   * @param {Object} data - Internal data
   * @returns {Object} Response data
   */
  transformResponse(data) {
    // Default implementation - should be overridden by subclasses
    return data;
  }

  /**
   * Handle errors that occur during request processing
   * @param {Error} error - The error that occurred
   * @returns {Object} Error response configuration
   */
  handleError(error) {
    // Default error handling
    if (error.name === 'ValidationError') {
      return {
        status: 400,
        message: "Validation failed",
        error: error.message
      };
    }

    if (error.name === 'NotFoundError') {
      return {
        status: 404,
        message: "Resource not found",
        error: error.message
      };
    }

    if (error.name === 'UnauthorizedError') {
      return {
        status: 401,
        message: "Unauthorized access",
        error: error.message
      };
    }

    // Default server error
    return {
      status: 500,
      message: "Internal server error",
      error: error.message
    };
  }

  /**
   * Extract user information from request
   * @param {Object} req - Express request object
   * @returns {Object|null} User information or null
   */
  getCurrentUser(req) {
    return req.user || null;
  }

  /**
   * Check if current user has required permission
   * @param {Object} req - Express request object
   * @param {string} permission - Required permission
   * @returns {boolean} Whether user has permission
   */
  hasPermission(req, permission) {
    const user = this.getCurrentUser(req);
    if (!user) return false;

    // Default implementation - should be overridden based on role/permission system
    return user.role === 'admin' || user.role === 'pharmacist';
  }

  /**
   * Send standardized success response
   * @param {Object} res - Express response object
   * @param {*} data - Response data
   * @param {string} message - Success message
   * @param {number} statusCode - HTTP status code (default: 200)
   */
  sendSuccess(res, data = null, message = "Success", statusCode = 200) {
    res.status(statusCode).json({
      success: true,
      data,
      message
    });
  }

  /**
   * Send standardized error response
   * @param {Object} res - Express response object
   * @param {string} message - Error message
   * @param {number} statusCode - HTTP status code (default: 500)
   * @param {Error} error - Original error object
   */
  sendError(res, message = "Internal server error", statusCode = 500, error = null) {
    console.error(`${this.constructor.name} error:`, error);

    res.status(statusCode).json({
      success: false,
      message,
      error: error?.message || "Unknown error"
    });
  }

  /**
   * Validate required fields in request data
   * @param {Object} data - Data to validate
   * @param {Array<string>} requiredFields - List of required field names
   * @returns {Object} Validation result
   */
  validateRequiredFields(data, requiredFields) {
    const errors = [];

    for (const field of requiredFields) {
      if (!data[field] && data[field] !== 0 && data[field] !== false) {
        errors.push({
          field,
          message: `${field} is required`,
          code: 'REQUIRED_FIELD'
        });
      }
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Validate data types in request data
   * @param {Object} data - Data to validate
   * @param {Object} typeRules - Type validation rules
   * @returns {Object} Validation result
   */
  validateDataTypes(data, typeRules) {
    const errors = [];

    for (const [field, expectedType] of Object.entries(typeRules)) {
      const value = data[field];
      const actualType = typeof value;

      if (value !== null && value !== undefined && actualType !== expectedType) {
        errors.push({
          field,
          message: `${field} must be of type ${expectedType}, got ${actualType}`,
          code: 'INVALID_TYPE'
        });
      }
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Sanitize string input
   * @param {string} input - Input string
   * @returns {string} Sanitized string
   */
  sanitizeString(input) {
    if (typeof input !== 'string') return '';
    return input.trim().replace(/[<>]/g, '');
  }

  /**
   * Validate email format
   * @param {string} email - Email to validate
   * @returns {boolean} Whether email is valid
   */
  isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * Validate phone number format (basic validation)
   * @param {string} phone - Phone number to validate
   * @returns {boolean} Whether phone is valid
   */
  isValidPhone(phone) {
    const phoneRegex = /^\+?[\d\s\-\(\)]{10,}$/;
    return phoneRegex.test(phone);
  }
}

export default BaseController;
