// backend/src/interfaces/contracts/i-controller.js

/**
 * Interface for all controllers
 * Defines common methods that all controllers should implement
 */
class IController {
  /**
   * Handle HTTP request and return response
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @returns {Promise<void>}
   */
  async handleRequest(req, res) {
    throw new Error('Method handleRequest must be implemented');
  }

  /**
   * Validate request data
   * @param {Object} data - Data to validate
   * @returns {Object} Validation result with errors if any
   */
  validate(data) {
    throw new Error('Method validate must be implemented');
  }

  /**
   * Transform request data to internal format
   * @param {Object} req - Express request object
   * @returns {Object} Transformed data
   */
  transformRequest(req) {
    throw new Error('Method transformRequest must be implemented');
  }

  /**
   * Transform internal data to response format
   * @param {Object} data - Internal data
   * @returns {Object} Response data
   */
  transformResponse(data) {
    throw new Error('Method transformResponse must be implemented');
  }
}

export default IController;
