// backend/src/utils/validators/purchase.validator.js

/**
 * Purchase data validators
 * Implements Interface Segregation Principle - separate validators for different purchase operations
 */

/**
 * Validate purchase order creation data
 * @param {Object} purchaseData - Purchase order data to validate
 * @returns {Object} Validation result
 */
export function validatePurchaseCreation(purchaseData) {
  const errors = [];

  // Required fields
  if (!purchaseData.supplier_id || !Number.isInteger(purchaseData.supplier_id) || purchaseData.supplier_id <= 0) {
    errors.push({
      field: 'supplier_id',
      message: 'Supplier ID is required and must be a positive integer',
      code: 'REQUIRED_SUPPLIER_ID'
    });
  }

  // Items validation
  if (!purchaseData.items || !Array.isArray(purchaseData.items) || purchaseData.items.length === 0) {
    errors.push({
      field: 'items',
      message: 'Purchase items are required and must be a non-empty array',
      code: 'REQUIRED_ITEMS'
    });
  } else {
    // Validate each item
    purchaseData.items.forEach((item, index) => {
      const itemValidation = validatePurchaseItem(item, index);
      errors.push(...itemValidation.errors.map(error => ({
        ...error,
        field: `items[${index}].${error.field}`
      })));
    });
  }

  // Total amount validation
  if (purchaseData.total_amount !== undefined) {
    const total = Number(purchaseData.total_amount);
    if (isNaN(total) || total < 0) {
      errors.push({
        field: 'total_amount',
        message: 'Total amount must be a valid non-negative number',
        code: 'INVALID_TOTAL_AMOUNT'
      });
    }
  }

  // Currency validation
  if (purchaseData.currency && typeof purchaseData.currency !== 'string') {
    errors.push({
      field: 'currency',
      message: 'Currency must be a string',
      code: 'INVALID_CURRENCY_TYPE'
    });
  }

  // Exchange rate validation
  if (purchaseData.exchange_rate !== undefined) {
    const rate = Number(purchaseData.exchange_rate);
    if (isNaN(rate) || rate <= 0) {
      errors.push({
        field: 'exchange_rate',
        message: 'Exchange rate must be a positive number',
        code: 'INVALID_EXCHANGE_RATE'
      });
    }
  }

  // Payment terms validation
  if (purchaseData.payment_terms && !isValidPaymentTerm(purchaseData.payment_terms)) {
    errors.push({
      field: 'payment_terms',
      message: 'Invalid payment terms',
      code: 'INVALID_PAYMENT_TERMS'
    });
  }

  // Date validations
  if (purchaseData.order_date && !isValidDate(purchaseData.order_date)) {
    errors.push({
      field: 'order_date',
      message: 'Order date must be a valid date',
      code: 'INVALID_ORDER_DATE'
    });
  }

  if (purchaseData.expected_date && !isValidDate(purchaseData.expected_date)) {
    errors.push({
      field: 'expected_date',
      message: 'Expected date must be a valid date',
      code: 'INVALID_EXPECTED_DATE'
    });
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Validate purchase item data
 * @param {Object} itemData - Purchase item data to validate
 * @param {number} index - Item index for error reporting
 * @returns {Object} Validation result
 */
export function validatePurchaseItem(itemData, index = 0) {
  const errors = [];

  // Required fields for purchase item
  if (!itemData.name || typeof itemData.name !== 'string' || itemData.name.trim().length === 0) {
    errors.push({
      field: 'name',
      message: 'Item name is required and must be a non-empty string',
      code: 'REQUIRED_ITEM_NAME'
    });
  }

  if (itemData.quantity === undefined || itemData.quantity === null) {
    errors.push({
      field: 'quantity',
      message: 'Item quantity is required',
      code: 'REQUIRED_QUANTITY'
    });
  } else {
    const quantity = Number(itemData.quantity);
    if (isNaN(quantity) || quantity <= 0) {
      errors.push({
        field: 'quantity',
        message: 'Item quantity must be a positive number',
        code: 'INVALID_QUANTITY'
      });
    }
  }

  if (itemData.wholesale_price !== undefined) {
    const price = Number(itemData.wholesale_price);
    if (isNaN(price) || price < 0) {
      errors.push({
        field: 'wholesale_price',
        message: 'Wholesale price must be a valid non-negative number',
        code: 'INVALID_WHOLESALE_PRICE'
      });
    }
  }

  // Packs per carton validation
  if (itemData.packs_per_carton !== undefined) {
    const packs = Number(itemData.packs_per_carton);
    if (isNaN(packs) || packs <= 0) {
      errors.push({
        field: 'packs_per_carton',
        message: 'Packs per carton must be a positive number',
        code: 'INVALID_PACKS_PER_CARTON'
      });
    }
  }

  // Blisters per pack validation
  if (itemData.blisters_per_pack !== undefined) {
    const blisters = Number(itemData.blisters_per_pack);
    if (isNaN(blisters) || blisters <= 0) {
      errors.push({
        field: 'blisters_per_pack',
        message: 'Blisters per pack must be a positive number',
        code: 'INVALID_BLISTERS_PER_PACK'
      });
    }
  }

  // Tablets per blister validation
  if (itemData.tablets_per_blister !== undefined) {
    const tablets = Number(itemData.tablets_per_blister);
    if (isNaN(tablets) || tablets <= 0) {
      errors.push({
        field: 'tablets_per_blister',
        message: 'Tablets per blister must be a positive number',
        code: 'INVALID_TABLETS_PER_BLISTER'
      });
    }
  }

  // Unit validation
  if (itemData.unit && !isValidUnit(itemData.unit)) {
    errors.push({
      field: 'unit',
      message: 'Invalid unit type',
      code: 'INVALID_UNIT'
    });
  }

  // Barcode validation
  if (itemData.barcode && typeof itemData.barcode !== 'string') {
    errors.push({
      field: 'barcode',
      message: 'Barcode must be a string',
      code: 'INVALID_BARCODE_TYPE'
    });
  }

  if (itemData.barcode && itemData.barcode.length > 100) {
    errors.push({
      field: 'barcode',
      message: 'Barcode must be less than 100 characters',
      code: 'BARCODE_TOO_LONG'
    });
  }

  // Batch number validation
  if (itemData.batch_no && typeof itemData.batch_no !== 'string') {
    errors.push({
      field: 'batch_no',
      message: 'Batch number must be a string',
      code: 'INVALID_BATCH_NO_TYPE'
    });
  }

  // Expiry date validation
  if (itemData.expiry_date && !isValidDate(itemData.expiry_date)) {
    errors.push({
      field: 'expiry_date',
      message: 'Expiry date must be a valid date',
      code: 'INVALID_EXPIRY_DATE'
    });
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Validate purchase payment data
 * @param {Object} paymentData - Payment data to validate
 * @returns {Object} Validation result
 */
export function validatePurchasePayment(paymentData) {
  const errors = [];

  if (!paymentData.purchase_id || !Number.isInteger(paymentData.purchase_id) || paymentData.purchase_id <= 0) {
    errors.push({
      field: 'purchase_id',
      message: 'Purchase ID is required and must be a positive integer',
      code: 'REQUIRED_PURCHASE_ID'
    });
  }

  if (paymentData.amount === undefined || paymentData.amount === null) {
    errors.push({
      field: 'amount',
      message: 'Payment amount is required',
      code: 'REQUIRED_AMOUNT'
    });
  } else {
    const amount = Number(paymentData.amount);
    if (isNaN(amount) || amount <= 0) {
      errors.push({
        field: 'amount',
        message: 'Payment amount must be a positive number',
        code: 'INVALID_AMOUNT'
      });
    }
  }

  if (paymentData.payment_method && typeof paymentData.payment_method !== 'string') {
    errors.push({
      field: 'payment_method',
      message: 'Payment method must be a string',
      code: 'INVALID_PAYMENT_METHOD_TYPE'
    });
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Validate valid payment terms
 * @param {string} paymentTerm - Payment term to validate
 * @returns {boolean} Whether payment term is valid
 */
function isValidPaymentTerm(paymentTerm) {
  const validTerms = ['cash', 'credit', 'partial'];
  return validTerms.includes(paymentTerm);
}

/**
 * Validate valid unit types
 * @param {string} unit - Unit to validate
 * @returns {boolean} Whether unit is valid
 */
function isValidUnit(unit) {
  const validUnits = ['carton', 'pack', 'blister', 'tablet', 'piece'];
  return validUnits.includes(unit.toLowerCase());
}

/**
 * Validate date format
 * @param {string} date - Date string to validate
 * @returns {boolean} Whether date is valid
 */
function isValidDate(date) {
  if (!date || typeof date !== 'string') return false;

  const dateObj = new Date(date);
  return dateObj instanceof Date && !isNaN(dateObj);
}
