// backend/src/utils/constants/status.constants.js

/**
 * Status constants for various entities
 * Centralized status definitions for consistent usage
 */

// Medicine statuses
export const MEDICINE_STATUSES = {
  ACTIVE: 'active',
  INACTIVE: 'inactive',
  DISCONTINUED: 'discontinued',
  RECALLED: 'recalled'
};

// Purchase order statuses
export const PURCHASE_ORDER_STATUSES = {
  DRAFT: 'draft',
  ORDERED: 'ordered',
  CONFIRMED: 'confirmed',
  RECEIVED: 'received',
  PARTIAL: 'partial',
  CANCELLED: 'cancelled'
};

// Purchase payment statuses
export const PURCHASE_PAYMENT_STATUSES = {
  PENDING: 'pending',
  PAID: 'paid',
  PARTIAL: 'partial',
  OVERDUE: 'overdue',
  CANCELLED: 'cancelled'
};

// Sale statuses
export const SALE_STATUSES = {
  DRAFT: 'draft',
  POSTED: 'posted',
  VOID: 'void',
  RETURNED: 'returned'
};

// Inventory movement reasons
export const INVENTORY_MOVEMENT_REASONS = {
  PURCHASE: 'purchase',
  SALE: 'sale',
  ADJUSTMENT: 'adjustment',
  RETURN: 'return',
  EXPIRY: 'expiry',
  DAMAGE: 'damage',
  THEFT: 'theft',
  TRANSFER: 'transfer'
};

// User roles
export const USER_ROLES = {
  ADMIN: 'admin',
  PHARMACIST: 'pharmacist',
  DOCTOR: 'doctor',
  PATIENT: 'patient'
};

// Payment methods
export const PAYMENT_METHODS = {
  CASH: 'cash',
  CARD: 'card',
  BANK_TRANSFER: 'bank_transfer',
  CHECK: 'check',
  CREDIT: 'credit'
};

// Payment statuses
export const PAYMENT_STATUSES = {
  PENDING: 'pending',
  COMPLETED: 'completed',
  FAILED: 'failed',
  CANCELLED: 'cancelled',
  REFUNDED: 'refunded'
};

// Appointment statuses
export const APPOINTMENT_STATUSES = {
  SCHEDULED: 'scheduled',
  CONFIRMED: 'confirmed',
  IN_PROGRESS: 'in_progress',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
  NO_SHOW: 'no_show'
};

// Prescription statuses
export const PRESCRIPTION_STATUSES = {
  DRAFT: 'draft',
  ISSUED: 'issued',
  FILLED: 'filled',
  PARTIAL: 'partial',
  CANCELLED: 'cancelled'
};

// Shift statuses
export const SHIFT_STATUSES = {
  OPEN: 'open',
  CLOSED: 'closed',
  BREAK: 'break'
};

/**
 * Get all statuses for a specific entity type
 * @param {string} entityType - Type of entity (medicine, purchase, sale, etc.)
 * @returns {Object} Status constants for the entity type
 */
export function getStatusesForEntity(entityType) {
  switch (entityType) {
    case 'medicine':
      return MEDICINE_STATUSES;
    case 'purchase_order':
    case 'purchase':
      return PURCHASE_ORDER_STATUSES;
    case 'sale':
      return SALE_STATUSES;
    case 'payment':
      return PAYMENT_STATUSES;
    case 'appointment':
      return APPOINTMENT_STATUSES;
    case 'prescription':
      return PRESCRIPTION_STATUSES;
    case 'shift':
      return SHIFT_STATUSES;
    default:
      return {};
  }
}

/**
 * Check if status is valid for entity type
 * @param {string} entityType - Type of entity
 * @param {string} status - Status to check
 * @returns {boolean} Whether status is valid
 */
export function isValidStatus(entityType, status) {
  const statuses = getStatusesForEntity(entityType);
  return Object.values(statuses).includes(status);
}

/**
 * Get status label (human-readable)
 * @param {string} entityType - Type of entity
 * @param {string} status - Status value
 * @returns {string} Human-readable status label
 */
export function getStatusLabel(entityType, status) {
  const statusLabels = {
    [MEDICINE_STATUSES.ACTIVE]: 'نشط',
    [MEDICINE_STATUSES.INACTIVE]: 'غير نشط',
    [MEDICINE_STATUSES.DISCONTINUED]: 'متوقف',
    [MEDICINE_STATUSES.RECALLED]: 'مسترد',

    [PURCHASE_ORDER_STATUSES.DRAFT]: 'مسودة',
    [PURCHASE_ORDER_STATUSES.ORDERED]: 'مطلوب',
    [PURCHASE_ORDER_STATUSES.CONFIRMED]: 'مؤكد',
    [PURCHASE_ORDER_STATUSES.RECEIVED]: 'مستلم',
    [PURCHASE_ORDER_STATUSES.PARTIAL]: 'جزئي',
    [PURCHASE_ORDER_STATUSES.CANCELLED]: 'ملغي',

    [SALE_STATUSES.DRAFT]: 'مسودة',
    [SALE_STATUSES.POSTED]: 'مثبت',
    [SALE_STATUSES.VOID]: 'ملغي',
    [SALE_STATUSES.RETURNED]: 'مرتجع',

    [PAYMENT_STATUSES.PENDING]: 'معلق',
    [PAYMENT_STATUSES.COMPLETED]: 'مكتمل',
    [PAYMENT_STATUSES.FAILED]: 'فاشل',
    [PAYMENT_STATUSES.CANCELLED]: 'ملغي',
    [PAYMENT_STATUSES.REFUNDED]: 'مسترد'
  };

  return statusLabels[status] || status;
}

/**
 * Get status color for UI
 * @param {string} entityType - Type of entity
 * @param {string} status - Status value
 * @returns {string} Color class for UI
 */
export function getStatusColor(entityType, status) {
  const statusColors = {
    [MEDICINE_STATUSES.ACTIVE]: 'green',
    [MEDICINE_STATUSES.INACTIVE]: 'gray',
    [MEDICINE_STATUSES.DISCONTINUED]: 'red',
    [MEDICINE_STATUSES.RECALLED]: 'orange',

    [PURCHASE_ORDER_STATUSES.DRAFT]: 'gray',
    [PURCHASE_ORDER_STATUSES.ORDERED]: 'blue',
    [PURCHASE_ORDER_STATUSES.CONFIRMED]: 'yellow',
    [PURCHASE_ORDER_STATUSES.RECEIVED]: 'green',
    [PURCHASE_ORDER_STATUSES.PARTIAL]: 'orange',
    [PURCHASE_ORDER_STATUSES.CANCELLED]: 'red',

    [SALE_STATUSES.DRAFT]: 'gray',
    [SALE_STATUSES.POSTED]: 'green',
    [SALE_STATUSES.VOID]: 'red',
    [SALE_STATUSES.RETURNED]: 'orange',

    [PAYMENT_STATUSES.PENDING]: 'yellow',
    [PAYMENT_STATUSES.COMPLETED]: 'green',
    [PAYMENT_STATUSES.FAILED]: 'red',
    [PAYMENT_STATUSES.CANCELLED]: 'gray',
    [PAYMENT_STATUSES.REFUNDED]: 'blue'
  };

  return statusColors[status] || 'gray';
}
