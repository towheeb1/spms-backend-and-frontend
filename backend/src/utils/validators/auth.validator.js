// backend/src/utils/validators/auth.validator.js

/**
 * Authentication data validators
 * Implements Interface Segregation Principle - separate validators for different auth operations
 */

/**
 * Validate login credentials
 * @param {Object} credentials - Login credentials
 * @returns {Object} Validation result
 */
export function validateLoginCredentials(credentials) {
  const errors = [];

  if (!credentials.emailOrUsername || typeof credentials.emailOrUsername !== 'string') {
    errors.push({
      field: 'emailOrUsername',
      message: 'Email or username is required and must be a string',
      code: 'REQUIRED_EMAIL_OR_USERNAME'
    });
  }

  if (!credentials.password || typeof credentials.password !== 'string') {
    errors.push({
      field: 'password',
      message: 'Password is required and must be a string',
      code: 'REQUIRED_PASSWORD'
    });
  }

  if (credentials.password && credentials.password.length < 6) {
    errors.push({
      field: 'password',
      message: 'Password must be at least 6 characters long',
      code: 'PASSWORD_TOO_SHORT'
    });
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Validate OTP request data
 * @param {Object} otpData - OTP request data
 * @returns {Object} Validation result
 */
export function validateOtpRequest(otpData) {
  const errors = [];

  if (!otpData.name || typeof otpData.name !== 'string' || otpData.name.trim().length === 0) {
    errors.push({
      field: 'name',
      message: 'Name is required and must be a non-empty string',
      code: 'REQUIRED_NAME'
    });
  }

  if (!otpData.phone || typeof otpData.phone !== 'string') {
    errors.push({
      field: 'phone',
      message: 'Phone number is required and must be a string',
      code: 'REQUIRED_PHONE'
    });
  }

  if (otpData.phone && !isValidPhoneNumber(otpData.phone)) {
    errors.push({
      field: 'phone',
      message: 'Phone number format is invalid',
      code: 'INVALID_PHONE_FORMAT'
    });
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Validate OTP verification data
 * @param {Object} verificationData - OTP verification data
 * @returns {Object} Validation result
 */
export function validateOtpVerification(verificationData) {
  const errors = [];

  if (!verificationData.phone || typeof verificationData.phone !== 'string') {
    errors.push({
      field: 'phone',
      message: 'Phone number is required and must be a string',
      code: 'REQUIRED_PHONE'
    });
  }

  if (!verificationData.code || typeof verificationData.code !== 'string') {
    errors.push({
      field: 'code',
      message: 'OTP code is required and must be a string',
      code: 'REQUIRED_CODE'
    });
  }

  if (verificationData.code && verificationData.code.length !== 6) {
    errors.push({
      field: 'code',
      message: 'OTP code must be exactly 6 digits',
      code: 'INVALID_CODE_LENGTH'
    });
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Validate pharmacist registration data
 * @param {Object} registrationData - Registration data
 * @returns {Object} Validation result
 */
export function validatePharmacistRegistration(registrationData) {
  const errors = [];

  // Required fields
  if (!registrationData.full_name || typeof registrationData.full_name !== 'string') {
    errors.push({
      field: 'full_name',
      message: 'Full name is required and must be a string',
      code: 'REQUIRED_FULL_NAME'
    });
  }

  if (!registrationData.password || typeof registrationData.password !== 'string') {
    errors.push({
      field: 'password',
      message: 'Password is required and must be a string',
      code: 'REQUIRED_PASSWORD'
    });
  }

  if (registrationData.password && registrationData.password.length < 8) {
    errors.push({
      field: 'password',
      message: 'Password must be at least 8 characters long',
      code: 'PASSWORD_TOO_SHORT'
    });
  }

  // Email or username required
  if (!registrationData.email && !registrationData.username) {
    errors.push({
      field: 'emailOrUsername',
      message: 'Either email or username is required',
      code: 'REQUIRED_EMAIL_OR_USERNAME'
    });
  }

  // Email validation if provided
  if (registrationData.email && !isValidEmail(registrationData.email)) {
    errors.push({
      field: 'email',
      message: 'Email format is invalid',
      code: 'INVALID_EMAIL_FORMAT'
    });
  }

  // Username validation if provided
  if (registrationData.username && registrationData.username.length < 3) {
    errors.push({
      field: 'username',
      message: 'Username must be at least 3 characters long',
      code: 'USERNAME_TOO_SHORT'
    });
  }

  // Phone validation if provided
  if (registrationData.phone && !isValidPhoneNumber(registrationData.phone)) {
    errors.push({
      field: 'phone',
      message: 'Phone number format is invalid',
      code: 'INVALID_PHONE_FORMAT'
    });
  }

  // License validation if provided
  if (registrationData.license_no && !isValidLicenseNumber(registrationData.license_no)) {
    errors.push({
      field: 'license_no',
      message: 'License number format is invalid',
      code: 'INVALID_LICENSE_FORMAT'
    });
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Validate email format
 * @param {string} email - Email to validate
 * @returns {boolean} Whether email is valid
 */
function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validate phone number format (basic validation)
 * @param {string} phone - Phone number to validate
 * @returns {boolean} Whether phone is valid
 */
function isValidPhoneNumber(phone) {
  const phoneRegex = /^\+?[\d\s\-\(\)]{10,}$/;
  return phoneRegex.test(phone);
}

/**
 * Validate license number format (Yemeni pharmacist license)
 * @param {string} license - License number to validate
 * @returns {boolean} Whether license is valid
 */
function isValidLicenseNumber(license) {
  const licenseRegex = /^(73|77|78|71|70)\d{7}$/;
  return licenseRegex.test(license);
}
