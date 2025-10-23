// backend/src/base/base-repository.js
import { IRepository } from "../interfaces/index.js";
import { DatabaseError } from "./base-service.js";

/**
 * Abstract base class for all data repositories
 * Implements common database operations and enforces interface compliance
 */
class BaseRepository extends IRepository {
  constructor(dbConnection) {
    super(dbConnection);
    this.tableName = this.constructor.name.replace('Repository', '').toLowerCase();
  }

  /**
   * Find single record by ID
   * @param {number} id - Record ID
   * @returns {Promise<Object|null>} Found record or null
   */
  async findById(id) {
    try {
      const [rows] = await this.db.query(
        `SELECT * FROM ${this.tableName} WHERE id = ? LIMIT 1`,
        [id]
      );
      return rows?.[0] || null;
    } catch (error) {
      throw new DatabaseError(`Failed to find record by ID: ${error.message}`);
    }
  }

  /**
   * Find multiple records with optional filters
   * @param {Object} filters - Search filters
   * @param {Object} options - Query options (pagination, sorting, etc.)
   * @returns {Promise<Array>} Array of records
   */
  async findMany(filters = {}, options = {}) {
    try {
      let query = `SELECT * FROM ${this.tableName}`;
      let params = [];
      const conditions = [];

      // Build WHERE clause from filters
      for (const [key, value] of Object.entries(filters)) {
        if (value !== null && value !== undefined) {
          conditions.push(`${key} = ?`);
          params.push(value);
        }
      }

      if (conditions.length > 0) {
        query += ` WHERE ${conditions.join(' AND ')}`;
      }

      // Add sorting
      if (options.sort_by) {
        const direction = options.sort_order === 'desc' ? 'DESC' : 'ASC';
        query += ` ORDER BY ${options.sort_by} ${direction}`;
      } else {
        query += ` ORDER BY id DESC`;
      }

      // Add pagination
      if (options.limit) {
        query += ` LIMIT ?`;
        params.push(options.limit);

        if (options.offset) {
          query += ` OFFSET ?`;
          params.push(options.offset);
        }
      }

      const [rows] = await this.db.query(query, params);
      return rows || [];
    } catch (error) {
      throw new DatabaseError(`Failed to find records: ${error.message}`);
    }
  }

  /**
   * Create new record
   * @param {Object} data - Data to insert
   * @returns {Promise<Object>} Created record with ID
   */
  async create(data) {
    try {
      // Filter out null/undefined values and build query
      const fields = Object.keys(data).filter(key =>
        data[key] !== null && data[key] !== undefined
      );

      if (fields.length === 0) {
        throw new Error('No data provided for insertion');
      }

      const placeholders = fields.map(() => '?').join(', ');
      const values = fields.map(field => data[field]);

      const query = `INSERT INTO ${this.tableName} (${fields.join(', ')}) VALUES (${placeholders})`;
      const [result] = await this.db.query(query, values);

      // Return the created record
      return await this.findById(result.insertId);
    } catch (error) {
      throw new DatabaseError(`Failed to create record: ${error.message}`);
    }
  }

  /**
   * Update existing record
   * @param {number} id - Record ID
   * @param {Object} data - Data to update
   * @returns {Promise<boolean>} Success status
   */
  async update(id, data) {
    try {
      // Filter out null/undefined values
      const fields = Object.keys(data).filter(key =>
        data[key] !== null && data[key] !== undefined
      );

      if (fields.length === 0) {
        throw new Error('No data provided for update');
      }

      const setClause = fields.map(field => `${field} = ?`).join(', ');
      const values = fields.map(field => data[field]);
      values.push(id); // Add ID for WHERE clause

      const query = `UPDATE ${this.tableName} SET ${setClause} WHERE id = ?`;
      const [result] = await this.db.query(query, values);

      return result.affectedRows > 0;
    } catch (error) {
      throw new DatabaseError(`Failed to update record: ${error.message}`);
    }
  }

  /**
   * Delete record by ID
   * @param {number} id - Record ID
   * @returns {Promise<boolean>} Success status
   */
  async delete(id) {
    try {
      const [result] = await this.db.query(
        `DELETE FROM ${this.tableName} WHERE id = ?`,
        [id]
      );
      return result.affectedRows > 0;
    } catch (error) {
      throw new DatabaseError(`Failed to delete record: ${error.message}`);
    }
  }

  /**
   * Count records with optional filters
   * @param {Object} filters - Count filters
   * @returns {Promise<number>} Total count
   */
  async count(filters = {}) {
    try {
      let query = `SELECT COUNT(*) as count FROM ${this.tableName}`;
      let params = [];
      const conditions = [];

      // Build WHERE clause from filters
      for (const [key, value] of Object.entries(filters)) {
        if (value !== null && value !== undefined) {
          conditions.push(`${key} = ?`);
          params.push(value);
        }
      }

      if (conditions.length > 0) {
        query += ` WHERE ${conditions.join(' AND ')}`;
      }

      const [rows] = await this.db.query(query, params);
      return rows?.[0]?.count || 0;
    } catch (error) {
      throw new DatabaseError(`Failed to count records: ${error.message}`);
    }
  }

  /**
   * Execute custom query
   * @param {string} query - SQL query
   * @param {Array} params - Query parameters
   * @returns {Promise<Array>} Query results
   */
  async query(query, params = []) {
    try {
      const [rows] = await this.db.query(query, params);
      return rows || [];
    } catch (error) {
      throw new DatabaseError(`Failed to execute query: ${error.message}`);
    }
  }

  /**
   * Begin database transaction
   * @returns {Promise<Object>} Transaction object
   */
  async beginTransaction() {
    try {
      return await this.db.getConnection();
    } catch (error) {
      throw new DatabaseError(`Failed to begin transaction: ${error.message}`);
    }
  }

  /**
   * Commit database transaction
   * @param {Object} transaction - Transaction object
   * @returns {Promise<void>}
   */
  async commitTransaction(transaction) {
    try {
      await transaction.commit();
    } catch (error) {
      throw new DatabaseError(`Failed to commit transaction: ${error.message}`);
    }
  }

  /**
   * Rollback database transaction
   * @param {Object} transaction - Transaction object
   * @returns {Promise<void>}
   */
  async rollbackTransaction(transaction) {
    try {
      await transaction.rollback();
    } catch (error) {
      throw new DatabaseError(`Failed to rollback transaction: ${error.message}`);
    }
  }

  /**
   * Execute multiple queries in a transaction
   * @param {Array<{query: string, params: Array}>} queries - Array of query objects
   * @returns {Promise<Array>} Array of query results
   */
  async executeTransaction(queries) {
    const connection = await this.beginTransaction();

    try {
      const results = [];

      for (const { query, params } of queries) {
        const [result] = await connection.query(query, params);
        results.push(result);
      }

      await this.commitTransaction(connection);
      return results;
    } catch (error) {
      await this.rollbackTransaction(connection);
      throw error;
    } finally {
      connection.release();
    }
  }

  /**
   * Build WHERE clause from filters object
   * @param {Object} filters - Filter conditions
   * @returns {Object} Object with conditions and params arrays
   */
  buildWhereClause(filters) {
    const conditions = [];
    const params = [];

    for (const [key, value] of Object.entries(filters)) {
      if (value !== null && value !== undefined) {
        conditions.push(`${key} = ?`);
        params.push(value);
      }
    }

    return { conditions, params };
  }

  /**
   * Build ORDER BY clause from options
   * @param {Object} options - Query options
   * @returns {string} ORDER BY clause
   */
  buildOrderByClause(options) {
    if (!options.sort_by) {
      return 'ORDER BY id DESC';
    }

    const direction = options.sort_order === 'desc' ? 'DESC' : 'ASC';
    return `ORDER BY ${options.sort_by} ${direction}`;
  }

  /**
   * Build LIMIT/OFFSET clause from options
   * @param {Object} options - Query options
   * @returns {string} LIMIT/OFFSET clause
   */
  buildLimitClause(options) {
    if (!options.limit) return '';

    let clause = `LIMIT ${options.limit}`;
    if (options.offset) {
      clause += ` OFFSET ${options.offset}`;
    }
    return clause;
  }

  /**
   * Sanitize table name (basic protection against SQL injection)
   * @param {string} tableName - Table name to sanitize
   * @returns {string} Sanitized table name
   */
  sanitizeTableName(tableName) {
    // Basic sanitization - only allow alphanumeric and underscores
    return tableName.replace(/[^a-zA-Z0-9_]/g, '');
  }

  /**
   * Check if record exists
   * @param {number} id - Record ID
   * @returns {Promise<boolean>} Whether record exists
   */
  async exists(id) {
    const count = await this.count({ id });
    return count > 0;
  }

  /**
   * Find records with pagination
   * @param {Object} filters - Search filters
   * @param {number} page - Page number (1-based)
   * @param {number} limit - Items per page
   * @returns {Promise<Object>} Paginated results with metadata
   */
  async findWithPagination(filters = {}, page = 1, limit = 10) {
    const offset = (page - 1) * limit;
    const total = await this.count(filters);
    const data = await this.findMany(filters, { limit, offset });

    return {
      data,
      pagination: {
        current_page: page,
        per_page: limit,
        total,
        total_pages: Math.ceil(total / limit),
        has_next: page < Math.ceil(total / limit),
        has_prev: page > 1
      }
    };
  }
}

export default BaseRepository;
