// backend/src/utils/helpers/number.helper.js

/**
 * Number utility functions
 * Provides common number operations and formatting
 */

/**
 * Format number to specified decimal places
 * @param {number} num - Number to format
 * @param {number} decimals - Number of decimal places
 * @returns {number} Formatted number
 */
export function formatNumber(num, decimals = 2) {
  if (typeof num !== 'number' || isNaN(num)) return 0;
  return Number(num.toFixed(decimals));
}

/**
 * Round number to nearest integer
 * @param {number} num - Number to round
 * @returns {number} Rounded number
 */
export function roundToInt(num) {
  if (typeof num !== 'number' || isNaN(num)) return 0;
  return Math.round(num);
}

/**
 * Calculate percentage
 * @param {number} value - Value
 * @param {number} total - Total value
 * @param {number} decimals - Decimal places for result
 * @returns {number} Percentage
 */
export function calculatePercentage(value, total, decimals = 2) {
  if (total === 0) return 0;
  return formatNumber((value / total) * 100, decimals);
}

/**
 * Calculate discount amount
 * @param {number} originalPrice - Original price
 * @param {number} discountPercent - Discount percentage
 * @returns {number} Discount amount
 */
export function calculateDiscount(originalPrice, discountPercent) {
  if (originalPrice <= 0 || discountPercent <= 0) return 0;
  return formatNumber(originalPrice * (discountPercent / 100));
}

/**
 * Calculate final price after discount
 * @param {number} originalPrice - Original price
 * @param {number} discountPercent - Discount percentage
 * @returns {number} Final price
 */
export function calculateFinalPrice(originalPrice, discountPercent) {
  const discount = calculateDiscount(originalPrice, discountPercent);
  return formatNumber(originalPrice - discount);
}

/**
 * Calculate tax amount
 * @param {number} amount - Amount to tax
 * @param {number} taxRate - Tax rate percentage
 * @returns {number} Tax amount
 */
export function calculateTax(amount, taxRate) {
  if (amount <= 0 || taxRate <= 0) return 0;
  return formatNumber(amount * (taxRate / 100));
}

/**
 * Calculate total with tax
 * @param {number} amount - Base amount
 * @param {number} taxRate - Tax rate percentage
 * @returns {number} Total amount including tax
 */
export function calculateTotalWithTax(amount, taxRate) {
  const tax = calculateTax(amount, taxRate);
  return formatNumber(amount + tax);
}

/**
 * Generate random number within range
 * @param {number} min - Minimum value
 * @param {number} max - Maximum value
 * @returns {number} Random number
 */
export function randomBetween(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * Clamp number between min and max
 * @param {number} num - Number to clamp
 * @param {number} min - Minimum value
 * @param {number} max - Maximum value
 * @returns {number} Clamped number
 */
export function clamp(num, min, max) {
  return Math.min(Math.max(num, min), max);
}

/**
 * Check if number is even
 * @param {number} num - Number to check
 * @returns {boolean} Whether number is even
 */
export function isEven(num) {
  return num % 2 === 0;
}

/**
 * Check if number is odd
 * @param {number} num - Number to check
 * @returns {boolean} Whether number is odd
 */
export function isOdd(num) {
  return num % 2 !== 0;
}

/**
 * Format currency amount
 * @param {number} amount - Amount to format
 * @param {string} currency - Currency code
 * @param {string} locale - Locale for formatting
 * @returns {string} Formatted currency string
 */
export function formatCurrency(amount, currency = 'YER', locale = 'ar-YE') {
  if (typeof amount !== 'number' || isNaN(amount)) return '0';

  try {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount);
  } catch (error) {
    // Fallback for unsupported locales
    return `${amount.toFixed(2)} ${currency}`;
  }
}

/**
 * Parse currency string to number
 * @param {string} currencyString - Currency string to parse
 * @returns {number} Parsed number
 */
export function parseCurrency(currencyString) {
  if (!currencyString || typeof currencyString !== 'string') return 0;

  // Remove currency symbols and formatting
  const cleaned = currencyString.replace(/[^\d.,-]/g, '');
  const normalized = cleaned.replace(/,/g, '');

  const parsed = parseFloat(normalized);
  return isNaN(parsed) ? 0 : parsed;
}

/**
 * Calculate profit margin
 * @param {number} sellingPrice - Selling price
 * @param {number} costPrice - Cost price
 * @returns {number} Profit margin percentage
 */
export function calculateProfitMargin(sellingPrice, costPrice) {
  if (costPrice <= 0) return 0;
  return calculatePercentage(sellingPrice - costPrice, costPrice);
}

/**
 * Calculate markup percentage
 * @param {number} sellingPrice - Selling price
 * @param {number} costPrice - Cost price
 * @returns {number} Markup percentage
 */
export function calculateMarkup(sellingPrice, costPrice) {
  if (costPrice <= 0) return 0;
  return calculatePercentage(sellingPrice - costPrice, costPrice);
}
