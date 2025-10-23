// backend/src/interfaces/contracts/i-repository.js

/**
 * Interface for all data repositories
 * Defines common methods for data access layer
 */
class IRepository {
  /**
   * Initialize repository with database connection
   * @param {Object} dbConnection - Database connection instance
   */
  constructor(dbConnection) {
    this.db = dbConnection;
  }

  /**
   * Find single record by ID
   * @param {number} id - Record ID
   * @returns {Promise<Object|null>} Found record or null
   */
  async findById(id) {
    throw new Error('Method findById must be implemented');
  }

  /**
   * Find multiple records with optional filters
   * @param {Object} filters - Search filters
   * @param {Object} options - Query options (pagination, sorting, etc.)
   * @returns {Promise<Array>} Array of records
   */
  async findMany(filters = {}, options = {}) {
    throw new Error('Method findMany must be implemented');
  }

  /**
   * Create new record
   * @param {Object} data - Data to insert
   * @returns {Promise<Object>} Created record with ID
   */
  async create(data) {
    throw new Error('Method create must be implemented');
  }

  /**
   * Update existing record
   * @param {number} id - Record ID
   * @param {Object} data - Data to update
   * @returns {Promise<boolean>} Success status
   */
  async update(id, data) {
    throw new Error('Method update must be implemented');
  }

  /**
   * Delete record by ID
   * @param {number} id - Record ID
   * @returns {Promise<boolean>} Success status
   */
  async delete(id) {
    throw new Error('Method delete must be implemented');
  }

  /**
   * Count records with optional filters
   * @param {Object} filters - Count filters
   * @returns {Promise<number>} Total count
   */
  async count(filters = {}) {
    throw new Error('Method count must be implemented');
  }

  /**
   * Execute custom query
   * @param {string} query - SQL query
   * @param {Array} params - Query parameters
   * @returns {Promise<Array>} Query results
   */
  async query(query, params = []) {
    throw new Error('Method query must be implemented');
  }

  /**
   * Begin database transaction
   * @returns {Promise<Object>} Transaction object
   */
  async beginTransaction() {
    throw new Error('Method beginTransaction must be implemented');
  }

  /**
   * Commit database transaction
   * @param {Object} transaction - Transaction object
   * @returns {Promise<void>}
   */
  async commitTransaction(transaction) {
    throw new Error('Method commitTransaction must be implemented');
  }

  /**
   * Rollback database transaction
   * @param {Object} transaction - Transaction object
   * @returns {Promise<void>}
   */
  async rollbackTransaction(transaction) {
    throw new Error('Method rollbackTransaction must be implemented');
  }
}

export default IRepository;
