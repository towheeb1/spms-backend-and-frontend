// backend/src/utils/helpers/string.helper.js

/**
 * String utility functions
 * Provides common string operations and validations
 */

/**
 * Capitalize first letter of string
 * @param {string} str - String to capitalize
 * @returns {string} Capitalized string
 */
export function capitalize(str) {
  if (typeof str !== 'string') return '';
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

/**
 * Convert string to title case
 * @param {string} str - String to convert
 * @returns {string} Title case string
 */
export function toTitleCase(str) {
  if (typeof str !== 'string') return '';
  return str.replace(/\w\S*/g, (txt) =>
    txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
  );
}

/**
 * Generate slug from string
 * @param {string} str - String to convert to slug
 * @returns {string} Slug string
 */
export function slugify(str) {
  if (typeof str !== 'string') return '';

  return str
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/**
 * Truncate string to specified length
 * @param {string} str - String to truncate
 * @param {number} length - Maximum length
 * @param {string} suffix - Suffix to add if truncated
 * @returns {string} Truncated string
 */
export function truncate(str, length, suffix = '...') {
  if (typeof str !== 'string') return '';
  if (str.length <= length) return str;

  return str.slice(0, length - suffix.length) + suffix;
}

/**
 * Remove HTML tags from string
 * @param {string} str - String with HTML tags
 * @returns {string} String without HTML tags
 */
export function stripHtml(str) {
  if (typeof str !== 'string') return '';
  return str.replace(/<[^>]*>/g, '');
}

/**
 * Sanitize string for database storage
 * @param {string} str - String to sanitize
 * @returns {string} Sanitized string
 */
export function sanitizeString(str) {
  if (typeof str !== 'string') return '';
  return str.trim().replace(/[<>]/g, '');
}

/**
 * Generate random string
 * @param {number} length - Length of random string
 * @returns {string} Random string
 */
export function randomString(length = 8) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

/**
 * Generate UUID-like string
 * @returns {string} UUID-like string
 */
export function generateId() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c == 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

/**
 * Check if string contains Arabic characters
 * @param {string} str - String to check
 * @returns {boolean} Whether string contains Arabic
 */
export function containsArabic(str) {
  if (typeof str !== 'string') return false;
  const arabicRegex = /[\u0600-\u06FF]/;
  return arabicRegex.test(str);
}

/**
 * Check if string is valid email format
 * @param {string} email - Email to validate
 * @returns {boolean} Whether email is valid
 */
export function isValidEmail(email) {
  if (typeof email !== 'string') return false;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Check if string is valid phone number format
 * @param {string} phone - Phone number to validate
 * @returns {boolean} Whether phone is valid
 */
export function isValidPhone(phone) {
  if (typeof phone !== 'string') return false;
  const phoneRegex = /^\+?[\d\s\-\(\)]{10,}$/;
  return phoneRegex.test(phone);
}

/**
 * Mask sensitive information in string
 * @param {string} str - String to mask
 * @param {number} visibleStart - Characters visible at start
 * @param {number} visibleEnd - Characters visible at end
 * @param {string} maskChar - Mask character
 * @returns {string} Masked string
 */
export function maskString(str, visibleStart = 2, visibleEnd = 2, maskChar = '*') {
  if (typeof str !== 'string') return '';

  const length = str.length;
  if (length <= visibleStart + visibleEnd) return str;

  const start = str.slice(0, visibleStart);
  const end = str.slice(-visibleEnd);
  const middle = maskChar.repeat(length - visibleStart - visibleEnd);

  return `${start}${middle}${end}`;
}

/**
 * Extract numbers from string
 * @param {string} str - String to extract numbers from
 * @returns {Array<number>} Array of numbers found
 */
export function extractNumbers(str) {
  if (typeof str !== 'string') return [];

  const matches = str.match(/\d+/g);
  return matches ? matches.map(Number) : [];
}

/**
 * Format phone number for display
 * @param {string} phone - Phone number to format
 * @returns {string} Formatted phone number
 */
export function formatPhoneNumber(phone) {
  if (typeof phone !== 'string') return '';

  // Remove all non-digit characters
  const digits = phone.replace(/\D/g, '');

  // Format based on length
  if (digits.length === 10) {
    return `${digits.slice(0, 3)}-${digits.slice(3, 6)}-${digits.slice(6)}`;
  } else if (digits.length === 9) {
    return `${digits.slice(0, 3)}-${digits.slice(3, 6)}-${digits.slice(6)}`;
  }

  return phone; // Return original if format doesn't match
}

/**
 * Normalize string for search (remove accents, special chars)
 * @param {string} str - String to normalize
 * @returns {string} Normalized string
 */
export function normalizeForSearch(str) {
  if (typeof str !== 'string') return '';

  return str
    .toLowerCase()
    .trim()
    .replace(/[\u0300-\u036f]/g, '') // Remove accents
    .replace(/[^a-z0-9\s]/g, '') // Remove special characters
    .replace(/\s+/g, ' '); // Normalize whitespace
}

/**
 * Check if string is empty or only whitespace
 * @param {string} str - String to check
 * @returns {boolean} Whether string is empty
 */
export function isEmpty(str) {
  return !str || typeof str !== 'string' || str.trim().length === 0;
}

/**
 * Check if string is blank (empty or only whitespace)
 * @param {string} str - String to check
 * @returns {boolean} Whether string is blank
 */
export function isBlank(str) {
  return isEmpty(str);
}

/**
 * Pad string with leading zeros
 * @param {string|number} str - String or number to pad
 * @param {number} length - Target length
 * @returns {string} Padded string
 */
export function padStart(str, length) {
  const string = String(str);
  return string.padStart(length, '0');
}
