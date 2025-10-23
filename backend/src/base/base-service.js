// backend/src/base/base-service.js
import { IService } from "../interfaces/index.js";

/**
 * Abstract base class for all services
 * Implements common functionality and enforces interface compliance
 */
class BaseService extends IService {
  constructor(dependencies = {}) {
    super(dependencies);
    this.repository = dependencies.repository;
    this.validator = dependencies.validator;
  }

  /**
   * Execute main service logic
   * @param {*} params - Service parameters
   * @returns {Promise<Object>} Service result
   */
  async execute(params) {
    // Validate parameters
    const validation = this.validateParams(params);
    if (!validation.isValid) {
      throw new ValidationError("Invalid parameters", validation.errors);
    }

    try {
      // Log service start
      this.logActivity('START', params, null);

      // Execute service-specific logic
      const result = await this.performOperation(params);

      // Log service success
      this.logActivity('SUCCESS', params, result);

      return {
        success: true,
        data: result,
        message: "Operation completed successfully"
      };

    } catch (error) {
      // Log service error
      this.logActivity('ERROR', params, { error: error.message });

      // Re-throw error for controller handling
      throw error;
    }
  }

  /**
   * Perform the actual service operation
   * Must be implemented by subclasses
   * @param {*} params - Service parameters
   * @returns {Promise<*>} Operation result
   */
  async performOperation(params) {
    throw new Error('Method performOperation must be implemented by subclass');
  }

  /**
   * Validate service parameters
   * @param {*} params - Parameters to validate
   * @returns {Object} Validation result
   */
  validateParams(params) {
    // Default implementation - should be overridden by subclasses
    return {
      isValid: true,
      errors: []
    };
  }

  /**
   * Handle errors that occur during service execution
   * @param {Error} error - The error that occurred
   * @param {*} params - Original parameters
   * @returns {Object} Error response
   */
  handleError(error, params) {
    console.error(`${this.constructor.name} service error:`, error);

    // Determine error type and appropriate response
    if (error.name === 'ValidationError') {
      return {
        success: false,
        error: error.message,
        code: 'VALIDATION_ERROR',
        details: error.details
      };
    }

    if (error.name === 'NotFoundError') {
      return {
        success: false,
        error: error.message,
        code: 'NOT_FOUND'
      };
    }

    if (error.name === 'DatabaseError') {
      return {
        success: false,
        error: 'Database operation failed',
        code: 'DATABASE_ERROR'
      };
    }

    // Default server error
    return {
      success: false,
      error: 'Internal server error',
      code: 'INTERNAL_ERROR'
    };
  }

  /**
   * Validate required fields
   * @param {Object} data - Data to validate
   * @param {Array<string>} requiredFields - List of required field names
   * @returns {Object} Validation result
   */
  validateRequired(data, requiredFields) {
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
   * Validate data types
   * @param {Object} data - Data to validate
   * @param {Object} typeRules - Type validation rules
   * @returns {Object} Validation result
   */
  validateTypes(data, typeRules) {
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
   * Validate number ranges
   * @param {Object} data - Data to validate
   * @param {Object} rangeRules - Range validation rules
   * @returns {Object} Validation result
   */
  validateRanges(data, rangeRules) {
    const errors = [];

    for (const [field, range] of Object.entries(rangeRules)) {
      const value = Number(data[field]);

      if (!Number.isFinite(value)) {
        errors.push({
          field,
          message: `${field} must be a valid number`,
          code: 'INVALID_NUMBER'
        });
        continue;
      }

      if (range.min !== undefined && value < range.min) {
        errors.push({
          field,
          message: `${field} must be at least ${range.min}`,
          code: 'BELOW_MINIMUM'
        });
      }

      if (range.max !== undefined && value > range.max) {
        errors.push({
          field,
          message: `${field} must be at most ${range.max}`,
          code: 'ABOVE_MAXIMUM'
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
   * Generate unique ID
   * @param {string} prefix - ID prefix
   * @returns {string} Unique ID
   */
  generateId(prefix = '') {
    return `${prefix}${Date.now()}${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Format date for database storage
   * @param {Date|string} date - Date to format
   * @returns {string} Formatted date string
   */
  formatDateForDB(date) {
    const d = new Date(date);
    return d.toISOString().slice(0, 19).replace('T', ' ');
  }

  /**
   * Parse database date string
   * @param {string} dateString - Database date string
   * @returns {Date} Parsed date object
   */
  parseDBDate(dateString) {
    if (!dateString) return null;
    return new Date(dateString);
  }

  /**
   * Calculate pagination info
   * @param {number} total - Total number of items
   * @param {number} page - Current page number
   * @param {number} limit - Items per page
   * @returns {Object} Pagination information
   */
  calculatePagination(total, page, limit) {
    const totalPages = Math.ceil(total / limit);
    const hasNext = page < totalPages;
    const hasPrev = page > 1;

    return {
      current_page: page,
      per_page: limit,
      total,
      total_pages: totalPages,
      has_next: hasNext,
      has_prev: hasPrev,
      next_page: hasNext ? page + 1 : null,
      prev_page: hasPrev ? page - 1 : null
    };
  }
}

// Custom error classes
export class ValidationError extends Error {
  constructor(message, details = []) {
    super(message);
    this.name = 'ValidationError';
    this.details = details;
  }
}

export class NotFoundError extends Error {
  constructor(resource = 'Resource') {
    super(`${resource} not found`);
    this.name = 'NotFoundError';
  }
}

export class DatabaseError extends Error {
  constructor(message = 'Database operation failed') {
    super(message);
    this.name = 'DatabaseError';
  }
}

export class UnauthorizedError extends Error {
  constructor(message = 'Unauthorized access') {
    super(message);
    this.name = 'UnauthorizedError';
  }
}

export default BaseService;
