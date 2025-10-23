// backend/src/services/medicine.service.js
import { BaseService, ValidationError, NotFoundError } from "../base/index.js";
import { pool } from "../db.js";

/**
 * Medicine Service
 * Handles all medicine-related business logic
 * Implements Single Responsibility Principle - only handles medicine logic
 */
class MedicineService extends BaseService {
  constructor() {
    super();
    this.medicineRepository = null; // Will be injected
    this.inventoryService = null; // Will be injected
  }

  /**
   * Inject dependencies (Dependency Inversion Principle)
   * @param {Object} dependencies - Service dependencies
   */
  injectDependencies(dependencies) {
    this.medicineRepository = dependencies.medicineRepository;
    this.inventoryService = dependencies.inventoryService;
  }

  /**
   * Search medicines with filters
   * @param {Object} searchParams - Search parameters
   * @returns {Promise<Array>} Array of matching medicines
   */
  async searchMedicines(searchParams) {
    const { query, category_id, limit = 25 } = searchParams;

    if (!query || query.length < 2) {
      return [];
    }

    // Build search query
    let sql = `
      SELECT id, name, generic_name, form, strength, barcode, price, stock_qty
      FROM medicines
      WHERE pharmacy_id = ? AND (
        name LIKE ? OR
        generic_name LIKE ? OR
        barcode = ?
      )
      ORDER BY name
      LIMIT ?
    `;

    const pharmacyId = searchParams.pharmacy_id; // Should come from authenticated user
    const searchPattern = `%${query}%`;

    const [rows] = await pool.query(sql, [
      pharmacyId,
      searchPattern,
      searchPattern,
      query,
      limit
    ]);

    return this.transformMedicineData(rows);
  }

  /**
   * Get medicine by ID
   * @param {number} medicineId - Medicine ID
   * @param {number} pharmacyId - Pharmacy ID
   * @returns {Promise<Object>} Medicine data
   */
  async getMedicineById(medicineId, pharmacyId) {
    const medicine = await this.medicineRepository.findById(medicineId);

    if (!medicine || medicine.pharmacy_id !== pharmacyId) {
      throw new NotFoundError("Medicine not found");
    }

    return this.transformMedicineData([medicine])[0];
  }

  /**
   * Create new medicine
   * @param {Object} medicineData - Medicine data
   * @returns {Promise<Object>} Created medicine
   */
  async createMedicine(medicineData) {
    // Validate required fields
    const validation = this.validateMedicineData(medicineData);
    if (!validation.isValid) {
      throw new ValidationError("Invalid medicine data", validation.errors);
    }

    // Check if barcode already exists
    if (medicineData.barcode) {
      const existing = await this.medicineRepository.findByBarcode(medicineData.barcode);
      if (existing) {
        throw new ValidationError("Barcode already exists");
      }
    }

    // Create medicine
    const medicine = await this.medicineRepository.create(medicineData);

    // Initialize stock if provided
    if (medicineData.initial_stock) {
      await this.inventoryService.adjustStock(medicine.id, medicineData.initial_stock, "initial");
    }

    return medicine;
  }

  /**
   * Update medicine
   * @param {number} medicineId - Medicine ID
   * @param {Object} updateData - Update data
   * @param {number} pharmacyId - Pharmacy ID
   * @returns {Promise<Object>} Updated medicine
   */
  async updateMedicine(medicineId, updateData, pharmacyId) {
    // Validate update data
    const validation = this.validateMedicineData(updateData, false);
    if (!validation.isValid) {
      throw new ValidationError("Invalid update data", validation.errors);
    }

    // Check if medicine exists and belongs to pharmacy
    const existing = await this.getMedicineById(medicineId, pharmacyId);

    // Check barcode uniqueness if being updated
    if (updateData.barcode && updateData.barcode !== existing.barcode) {
      const duplicate = await this.medicineRepository.findByBarcode(updateData.barcode);
      if (duplicate) {
        throw new ValidationError("Barcode already exists");
      }
    }

    // Update medicine
    const updated = await this.medicineRepository.update(medicineId, updateData);

    return updated;
  }

  /**
   * Delete medicine
   * @param {number} medicineId - Medicine ID
   * @param {number} pharmacyId - Pharmacy ID
   * @returns {Promise<boolean>} Success status
   */
  async deleteMedicine(medicineId, pharmacyId) {
    // Check if medicine exists and belongs to pharmacy
    await this.getMedicineById(medicineId, pharmacyId);

    // Check if medicine has stock or related records
    const hasStock = await this.inventoryService.checkMedicineStock(medicineId);
    if (hasStock) {
      throw new ValidationError("Cannot delete medicine with existing stock or related records");
    }

    // Delete medicine
    return await this.medicineRepository.delete(medicineId);
  }

  /**
   * Get low stock medicines
   * @param {number} pharmacyId - Pharmacy ID
   * @returns {Promise<Array>} Array of low stock medicines
   */
  async getLowStockMedicines(pharmacyId) {
    const [rows] = await pool.query(
      `SELECT id, name, stock_qty, min_stock
       FROM medicines
       WHERE pharmacy_id = ? AND stock_qty <= COALESCE(min_stock, 0)
       ORDER BY stock_qty ASC`,
      [pharmacyId]
    );

    return this.transformMedicineData(rows);
  }

  /**
   * Get expiring medicines
   * @param {number} pharmacyId - Pharmacy ID
   * @param {number} days - Number of days to check
   * @returns {Promise<Array>} Array of expiring medicines
   */
  async getExpiringMedicines(pharmacyId, days = 30) {
    const [rows] = await pool.query(
      `SELECT id, name, expiry_date, stock_qty
       FROM medicines
       WHERE pharmacy_id = ?
         AND expiry_date IS NOT NULL
         AND expiry_date BETWEEN CURDATE() AND DATE_ADD(CURDATE(), INTERVAL ? DAY)
       ORDER BY expiry_date ASC`,
      [pharmacyId, days]
    );

    return this.transformMedicineData(rows);
  }

  /**
   * Transform raw medicine data to consistent format
   * @param {Array} rawData - Raw database rows
   * @returns {Array} Transformed medicine data
   */
  transformMedicineData(rawData) {
    return (rawData || []).map(row => ({
      id: row.id,
      trade_name: row.trade_name || row.name || null,
      generic_name: row.generic_name || null,
      form: row.form || null,
      strength: row.strength || null,
      barcode: row.barcode || null,
      price: Number(row.price || 0),
      stock: Number(row.stock_qty || 0),
      min_stock: Number(row.min_stock || 0),
      category: row.category || null,
      manufacturer: row.manufacturer || row.brand || null,
      dosage: row.dosage || row.dosage_form || null,
      atc: row.atc || null,
      created_at: row.created_at ? new Date(row.created_at).toISOString().slice(0, 10) : null,
      updated_at: row.updated_at ? new Date(row.updated_at).toISOString().slice(0, 10) : null,
      expiry_date: row.expiry_date || null
    }));
  }

  /**
   * Validate medicine data
   * @param {Object} data - Medicine data to validate
   * @param {boolean} isCreate - Whether this is for creation or update
   * @returns {Object} Validation result
   */
  validateMedicineData(data, isCreate = true) {
    const errors = [];

    // Required fields for creation
    if (isCreate) {
      if (!data.name || !data.name.trim()) {
        errors.push({
          field: 'name',
          message: 'Medicine name is required',
          code: 'REQUIRED_FIELD'
        });
      }

      if (data.price !== undefined && (isNaN(data.price) || data.price < 0)) {
        errors.push({
          field: 'price',
          message: 'Price must be a valid non-negative number',
          code: 'INVALID_PRICE'
        });
      }
    }

    // Optional but validated fields
    if (data.barcode && data.barcode.length > 100) {
      errors.push({
        field: 'barcode',
        message: 'Barcode must be less than 100 characters',
        code: 'INVALID_BARCODE_LENGTH'
      });
    }

    if (data.stock_qty !== undefined && (isNaN(data.stock_qty) || data.stock_qty < 0)) {
      errors.push({
        field: 'stock_qty',
        message: 'Stock quantity must be a valid non-negative number',
        code: 'INVALID_STOCK'
      });
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Get medicine statistics
   * @param {number} pharmacyId - Pharmacy ID
   * @returns {Promise<Object>} Medicine statistics
   */
  async getMedicineStats(pharmacyId) {
    const [total] = await pool.query(
      "SELECT COUNT(*) as count FROM medicines WHERE pharmacy_id = ?",
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
      low_stock_count: lowStock[0]?.count || 0,
      expiring_count: expiring[0]?.count || 0
    };
  }
}

export default MedicineService;
