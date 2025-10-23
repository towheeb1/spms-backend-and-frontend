// backend/src/interfaces/contracts/i-service.js

/**
 * Interface for all services
 * Defines common methods that all services should implement
 */
class IService {
  /**
   * Initialize service with dependencies
   * @param {Object} dependencies - Service dependencies
   */
  constructor(dependencies = {}) {
    this.dependencies = dependencies;
  }

  /**
   * Execute main service logic
   * @param {*} params - Service parameters
   * @returns {Promise<Object>} Service result
   */
  async execute(params) {
    throw new Error('Method execute must be implemented');
  }

  /**
   * Validate service parameters
   * @param {*} params - Parameters to validate
   * @returns {Object} Validation result
   */
  validateParams(params) {
    throw new Error('Method validateParams must be implemented');
  }

  /**
   * Handle errors that occur during service execution
   * @param {Error} error - The error that occurred
   * @param {*} params - Original parameters
   * @returns {Object} Error response
   */
  handleError(error, params) {
    console.error(`${this.constructor.name} service error:`, error);
    return {
      success: false,
      error: error.message,
      code: error.code || 'SERVICE_ERROR'
    };
  }

  /**
   * Log service activity
   * @param {string} action - Action performed
   * @param {*} params - Parameters used
   * @param {Object} result - Operation result
   */
  logActivity(action, params, result) {
    // Default implementation - can be overridden
    console.log(`${this.constructor.name}: ${action}`, { params, result });
  }
}

export default IService;
