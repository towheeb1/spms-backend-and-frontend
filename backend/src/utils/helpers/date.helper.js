// backend/src/utils/helpers/date.helper.js

/**
 * Date utility functions
 * Provides common date operations and formatting
 */

/**
 * Format date to ISO string without time
 * @param {Date|string} date - Date to format
 * @returns {string} Formatted date string (YYYY-MM-DD)
 */
export function formatDate(date) {
  const d = new Date(date);
  if (isNaN(d.getTime())) return null;

  return d.toISOString().split('T')[0];
}

/**
 * Format date with time
 * @param {Date|string} date - Date to format
 * @returns {string} Formatted datetime string
 */
export function formatDateTime(date) {
  const d = new Date(date);
  if (isNaN(d.getTime())) return null;

  return d.toISOString();
}

/**
 * Parse database date string
 * @param {string} dateString - Database date string
 * @returns {Date} Parsed date object
 */
export function parseDBDate(dateString) {
  if (!dateString) return null;
  const date = new Date(dateString);
  return isNaN(date.getTime()) ? null : date;
}

/**
 * Add days to a date
 * @param {Date|string} date - Base date
 * @param {number} days - Number of days to add
 * @returns {Date} New date with days added
 */
export function addDays(date, days) {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

/**
 * Check if date is today
 * @param {Date|string} date - Date to check
 * @returns {boolean} Whether date is today
 */
export function isToday(date) {
  const today = new Date();
  const checkDate = new Date(date);

  return today.toDateString() === checkDate.toDateString();
}

/**
 * Check if date is in the past
 * @param {Date|string} date - Date to check
 * @returns {boolean} Whether date is in the past
 */
export function isPast(date) {
  const checkDate = new Date(date);
  const now = new Date();

  return checkDate < now;
}

/**
 * Check if date is in the future
 * @param {Date|string} date - Date to check
 * @returns {boolean} Whether date is in the future
 */
export function isFuture(date) {
  const checkDate = new Date(date);
  const now = new Date();

  return checkDate > now;
}

/**
 * Get start of day
 * @param {Date|string} date - Date
 * @returns {Date} Start of day
 */
export function startOfDay(date) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

/**
 * Get end of day
 * @param {Date|string} date - Date
 * @returns {Date} End of day
 */
export function endOfDay(date) {
  const d = new Date(date);
  d.setHours(23, 59, 59, 999);
  return d;
}

/**
 * Calculate age from birth date
 * @param {Date|string} birthDate - Birth date
 * @returns {number} Age in years
 */
export function calculateAge(birthDate) {
  const birth = new Date(birthDate);
  const today = new Date();

  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();

  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }

  return age;
}

/**
 * Generate date range for reports
 * @param {string} period - Period type (today, week, month, year)
 * @returns {Object} Date range object
 */
export function getDateRange(period) {
  const now = new Date();
  let startDate;

  switch (period) {
    case 'today':
      startDate = new Date(now);
      startDate.setHours(0, 0, 0, 0);
      break;
    case 'week':
      startDate = new Date(now);
      startDate.setDate(now.getDate() - 7);
      break;
    case 'month':
      startDate = new Date(now);
      startDate.setMonth(now.getMonth() - 1);
      break;
    case 'year':
      startDate = new Date(now);
      startDate.setFullYear(now.getFullYear() - 1);
      break;
    default:
      startDate = new Date(now);
      startDate.setDate(now.getDate() - 7);
  }

  return {
    start: formatDate(startDate),
    end: formatDate(now)
  };
}

/**
 * Validate date string format
 * @param {string} dateString - Date string to validate
 * @param {string} format - Expected format (default: YYYY-MM-DD)
 * @returns {boolean} Whether date string is valid
 */
export function isValidDateString(dateString, format = 'YYYY-MM-DD') {
  if (!dateString || typeof dateString !== 'string') return false;

  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  if (!dateRegex.test(dateString)) return false;

  const date = new Date(dateString);
  return date instanceof Date && !isNaN(date.getTime());
}
