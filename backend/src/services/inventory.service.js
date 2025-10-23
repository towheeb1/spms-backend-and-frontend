// backend/src/services/inventory.service.js
import { BaseService, ValidationError, DatabaseError } from "../base/index.js";
import { pool } from "../db.js";

/**
 * Inventory Service
 * Handles all inventory-related business logic
 * Implements Single Responsibility Principle - only handles inventory logic
 */
class InventoryService extends BaseService {
  constructor() {
    super();
    this.movementRepository = null; // Will be injected
  }

  /**
   * Inject dependencies (Dependency Inversion Principle)
   * @param {Object} dependencies - Service dependencies
   */
  injectDependencies(dependencies) {
    this.movementRepository = dependencies.movementRepository;
  }

  /**
   * Adjust stock quantity for a medicine
   * @param {number} medicineId - Medicine ID
   * @param {number} quantityChange - Quantity change (+ for stock in, - for stock out)
   * @param {string} reason - Reason for adjustment
   * @param {Object} reference - Reference data (optional)
   * @returns {Promise<Object>} Updated stock information
   */
  async adjustStock(medicineId, quantityChange, reason, reference = {}) {
    const connection = await pool.getConnection();

    try {
      await connection.beginTransaction();

      // Get current medicine data with lock
      const [[medicine]] = await connection.query(
        "SELECT id, stock_qty, pharmacy_id FROM medicines WHERE id = ? FOR UPDATE",
        [medicineId]
      );

      if (!medicine) {
        throw new NotFoundError("Medicine not found");
      }

      // Calculate new quantity
      const currentStock = Number(medicine.stock_qty) || 0;
      const change = Number(quantityChange) || 0;
      const newStock = currentStock + change;

      // Validate stock doesn't go negative (for stock out operations)
      if (newStock < 0) {
        throw new ValidationError("Insufficient stock for this operation");
      }

      // Update medicine stock
      await connection.query(
        "UPDATE medicines SET stock_qty = ? WHERE id = ?",
        [newStock, medicineId]
      );

      // Create inventory movement record
      await connection.query(
        `INSERT INTO inventory_movements (medicine_id, qty_change, reason, ref_type, ref_id, notes, pharmacy_id)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [
          medicineId,
          change,
          reason,
          reference.type || null,
          reference.id || null,
          reference.notes || null,
          medicine.pharmacy_id
        ]
      );

      await connection.commit();

      return {
        medicine_id: medicineId,
        previous_stock: currentStock,
        quantity_change: change,
        new_stock: newStock,
        reason,
        movement_id: null // Will be filled by repository if needed
      };

    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }

  /**
   * Stock in operation (add to inventory)
   * @param {Object} stockInData - Stock in data
   * @returns {Promise<Object>} Operation result
   */
  async stockIn(stockInData) {
    const { medicine_id, quantity, reason = "purchase", reference } = stockInData;

    if (!medicine_id || !quantity || quantity <= 0) {
      throw new ValidationError("Medicine ID and positive quantity are required");
    }

    return await this.adjustStock(medicine_id, Math.abs(quantity), reason, reference);
  }

  /**
   * Stock out operation (remove from inventory)
   * @param {Object} stockOutData - Stock out data
   * @returns {Promise<Object>} Operation result
   */
  async stockOut(stockOutData) {
    const { medicine_id, quantity, reason = "adjustment", reference } = stockOutData;

    if (!medicine_id || !quantity || quantity <= 0) {
      throw new ValidationError("Medicine ID and positive quantity are required");
    }

    return await this.adjustStock(medicine_id, -Math.abs(quantity), reason, reference);
  }

  /**
   * Get inventory movements for a medicine
   * @param {number} medicineId - Medicine ID
   * @param {Object} options - Query options
   * @returns {Promise<Array>} Inventory movements
   */
  async getInventoryMovements(medicineId, options = {}) {
    const { limit = 500, offset = 0 } = options;

    let query = `
      SELECT m.id, m.medicine_id, m.qty_change, m.reason, m.ref_type, m.ref_id, m.notes, m.created_at,
             md.name AS medicine_name
      FROM inventory_movements m
      JOIN medicines md ON md.id = m.medicine_id
      WHERE m.medicine_id = ?
      ORDER BY m.id DESC
      LIMIT ? OFFSET ?
    `;

    const [rows] = await pool.query(query, [medicineId, limit, offset]);
    return rows || [];
  }

  /**
   * Get current stock for a medicine
   * @param {number} medicineId - Medicine ID
   * @returns {Promise<Object>} Current stock information
   */
  async getCurrentStock(medicineId) {
    const [[medicine]] = await pool.query(
      "SELECT id, name, stock_qty, min_stock FROM medicines WHERE id = ?",
      [medicineId]
    );

    if (!medicine) {
      throw new NotFoundError("Medicine not found");
    }

    return {
      medicine_id: medicine.id,
      medicine_name: medicine.name,
      current_stock: Number(medicine.stock_qty) || 0,
      min_stock_level: Number(medicine.min_stock) || 0,
      is_low_stock: (Number(medicine.stock_qty) || 0) <= (Number(medicine.min_stock) || 0)
    };
  }

  /**
   * Check if medicine has stock or related records
   * @param {number} medicineId - Medicine ID
   * @returns {Promise<boolean>} Whether medicine can be safely deleted
   */
  async checkMedicineStock(medicineId) {
    // Check current stock
    const [[stock]] = await pool.query(
      "SELECT stock_qty FROM medicines WHERE id = ?",
      [medicineId]
    );

    if (stock && Number(stock.stock_qty) > 0) {
      return true;
    }

    // Check for related records
    const [[purchaseItems]] = await pool.query(
      "SELECT COUNT(*) as count FROM purchase_order_items WHERE medicine_id = ?",
      [medicineId]
    );

    const [[saleItems]] = await pool.query(
      "SELECT COUNT(*) as count FROM sale_items WHERE medicine_id = ?",
      [medicineId]
    );

    const [[movements]] = await pool.query(
      "SELECT COUNT(*) as count FROM inventory_movements WHERE medicine_id = ?",
      [medicineId]
    );

    return (
      (purchaseItems?.count || 0) > 0 ||
      (saleItems?.count || 0) > 0 ||
      (movements?.count || 0) > 0
    );
  }

  /**
   * Get inventory summary for pharmacy
   * @param {number} pharmacyId - Pharmacy ID
   * @returns {Promise<Object>} Inventory summary
   */
  async getInventorySummary(pharmacyId) {
    const [total] = await pool.query(
      "SELECT COUNT(*) as count, SUM(stock_qty) as total_stock FROM medicines WHERE pharmacy_id = ?",
      [pharmacyId]
    );

    const [lowStock] = await pool.query(
      "SELECT COUNT(*) as count FROM medicines WHERE pharmacy_id = ? AND stock_qty <= COALESCE(min_stock, 0)",
      [pharmacyId]
    );

    const [expiring] = await pool.query(
      `SELECT COUNT(*) as count FROM medicines
       WHERE pharmacy_id = ? AND expiry_date BETWEEN CURDATE() AND DATE_ADD(CURDATE(), INTERVAL 30 DAY)`,
      [pharmacyId]
    );

    return {
      total_medicines: total[0]?.count || 0,
      total_stock_quantity: Number(total[0]?.total_stock) || 0,
      low_stock_count: lowStock[0]?.count || 0,
      expiring_count: expiring[0]?.count || 0
    };
  }

  /**
   * Validate service parameters
   * @param {*} params - Parameters to validate
   * @returns {Object} Validation result
   */
  validateParams(params) {
    const errors = [];

    if (params.medicine_id !== undefined && (!Number.isInteger(params.medicine_id) || params.medicine_id <= 0)) {
      errors.push({
        field: 'medicine_id',
        message: 'Medicine ID must be a positive integer',
        code: 'INVALID_MEDICINE_ID'
      });
    }

    if (params.quantity !== undefined) {
      const qty = Number(params.quantity);
      if (!Number.isFinite(qty)) {
        errors.push({
          field: 'quantity',
          message: 'Quantity must be a valid number',
          code: 'INVALID_QUANTITY'
        });
      }
    }

    if (params.reason && typeof params.reason !== 'string') {
      errors.push({
        field: 'reason',
        message: 'Reason must be a string',
        code: 'INVALID_REASON'
      });
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }
}

export default InventoryService;
