// backend/src/utils/validators/medicine.validator.js

/**
 * Medicine data validators
 * Implements Interface Segregation Principle - separate validators for different medicine operations
 */

/**
 * Validate medicine creation data
 * @param {Object} medicineData - Medicine data to validate
 * @returns {Object} Validation result
 */
export function validateMedicineCreation(medicineData) {
  const errors = [];

  // Required fields
  if (!medicineData.name || typeof medicineData.name !== 'string' || medicineData.name.trim().length === 0) {
    errors.push({
      field: 'name',
      message: 'Medicine name is required and must be a non-empty string',
      code: 'REQUIRED_NAME'
    });
  }

  // Price validation
  if (medicineData.price !== undefined) {
    const price = Number(medicineData.price);
    if (isNaN(price) || price < 0) {
      errors.push({
        field: 'price',
        message: 'Price must be a valid non-negative number',
        code: 'INVALID_PRICE'
      });
    }
  }

  // Stock quantity validation
  if (medicineData.stock_qty !== undefined) {
    const stock = Number(medicineData.stock_qty);
    if (isNaN(stock) || stock < 0) {
      errors.push({
        field: 'stock_qty',
        message: 'Stock quantity must be a valid non-negative number',
        code: 'INVALID_STOCK'
      });
    }
  }

  // Barcode validation
  if (medicineData.barcode && typeof medicineData.barcode !== 'string') {
    errors.push({
      field: 'barcode',
      message: 'Barcode must be a string',
      code: 'INVALID_BARCODE_TYPE'
    });
  }

  if (medicineData.barcode && medicineData.barcode.length > 100) {
    errors.push({
      field: 'barcode',
      message: 'Barcode must be less than 100 characters',
      code: 'BARCODE_TOO_LONG'
    });
  }

  // Generic name validation
  if (medicineData.generic_name && typeof medicineData.generic_name !== 'string') {
    errors.push({
      field: 'generic_name',
      message: 'Generic name must be a string',
      code: 'INVALID_GENERIC_NAME_TYPE'
    });
  }

  // Form validation
  if (medicineData.form && !isValidMedicineForm(medicineData.form)) {
    errors.push({
      field: 'form',
      message: 'Invalid medicine form',
      code: 'INVALID_FORM'
    });
  }

  // Strength validation
  if (medicineData.strength && typeof medicineData.strength !== 'string') {
    errors.push({
      field: 'strength',
      message: 'Strength must be a string',
      code: 'INVALID_STRENGTH_TYPE'
    });
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Validate medicine update data
 * @param {Object} updateData - Update data to validate
 * @returns {Object} Validation result
 */
export function validateMedicineUpdate(updateData) {
  const errors = [];

  // Check if at least one field is provided for update
  const updatableFields = ['name', 'generic_name', 'form', 'strength', 'barcode', 'price', 'stock_qty'];
  const hasUpdates = updatableFields.some(field => updateData[field] !== undefined);

  if (!hasUpdates) {
    errors.push({
      field: 'updateData',
      message: 'At least one field must be provided for update',
      code: 'NO_UPDATE_FIELDS'
    });
  }

  // Validate provided fields using creation validator
  const creationValidation = validateMedicineCreation(updateData);
  errors.push(...creationValidation.errors);

  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Validate medicine search parameters
 * @param {Object} searchParams - Search parameters to validate
 * @returns {Object} Validation result
 */
export function validateMedicineSearch(searchParams) {
  const errors = [];

  if (!searchParams.q || typeof searchParams.q !== 'string') {
    errors.push({
      field: 'q',
      message: 'Search query is required and must be a string',
      code: 'REQUIRED_SEARCH_QUERY'
    });
  }

  if (searchParams.q && searchParams.q.length < 2) {
    errors.push({
      field: 'q',
      message: 'Search query must be at least 2 characters long',
      code: 'SEARCH_QUERY_TOO_SHORT'
    });
  }

  if (searchParams.limit !== undefined) {
    const limit = Number(searchParams.limit);
    if (isNaN(limit) || limit < 1 || limit > 100) {
      errors.push({
        field: 'limit',
        message: 'Limit must be a number between 1 and 100',
        code: 'INVALID_LIMIT'
      });
    }
  }

  if (searchParams.category_id !== undefined) {
    const categoryId = Number(searchParams.category_id);
    if (isNaN(categoryId) || categoryId < 1) {
      errors.push({
        field: 'category_id',
        message: 'Category ID must be a positive number',
        code: 'INVALID_CATEGORY_ID'
      });
    }
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Validate medicine stock adjustment
 * @param {Object} adjustmentData - Stock adjustment data
 * @returns {Object} Validation result
 */
export function validateStockAdjustment(adjustmentData) {
  const errors = [];

  if (!adjustmentData.medicine_id || !Number.isInteger(adjustmentData.medicine_id) || adjustmentData.medicine_id <= 0) {
    errors.push({
      field: 'medicine_id',
      message: 'Medicine ID must be a positive integer',
      code: 'INVALID_MEDICINE_ID'
    });
  }

  if (adjustmentData.quantity === undefined || adjustmentData.quantity === null) {
    errors.push({
      field: 'quantity',
      message: 'Quantity is required',
      code: 'REQUIRED_QUANTITY'
    });
  } else {
    const quantity = Number(adjustmentData.quantity);
    if (isNaN(quantity)) {
      errors.push({
        field: 'quantity',
        message: 'Quantity must be a valid number',
        code: 'INVALID_QUANTITY'
      });
    }
  }

  if (!adjustmentData.reason || typeof adjustmentData.reason !== 'string' || adjustmentData.reason.trim().length === 0) {
    errors.push({
      field: 'reason',
      message: 'Reason is required and must be a non-empty string',
      code: 'REQUIRED_REASON'
    });
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Validate valid medicine forms
 * @param {string} form - Medicine form to validate
 * @returns {boolean} Whether form is valid
 */
function isValidMedicineForm(form) {
  const validForms = [
    'tablet', 'tablets', 'capsule', 'capsules', 'syrup', 'suspension',
    'injection', 'drops', 'cream', 'ointment', 'gel', 'spray', 'inhaler',
    'suppository', 'patch', 'solution', 'powder', 'granules'
  ];

  return validForms.includes(form.toLowerCase());
}
