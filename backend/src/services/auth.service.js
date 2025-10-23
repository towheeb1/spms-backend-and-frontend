// backend/src/services/auth.service.js
import { BaseService, ValidationError, UnauthorizedError } from "../base/index.js";
import { pool } from "../db.js";
import crypto from "crypto";
import jwt from "jsonwebtoken";

/**
 * Authentication Service
 * Handles all authentication-related business logic
 * Implements Single Responsibility Principle - only handles auth logic
 */
class AuthService extends BaseService {
  constructor() {
    super();
    this.userRepository = null; // Will be injected
    this.tokenRepository = null; // Will be injected
  }

  /**
   * Inject dependencies (Dependency Inversion Principle)
   * @param {Object} dependencies - Service dependencies
   */
  injectDependencies(dependencies) {
    this.userRepository = dependencies.userRepository;
    this.tokenRepository = dependencies.tokenRepository;
  }

  /**
   * Authenticate user with email/username and password
   * @param {Object} credentials - Login credentials
   * @returns {Promise<Object>} Authentication result
   */
  async authenticateUser(credentials) {
    const { emailOrUsername, password, rememberMe = false } = credentials;

    // Validate input
    if (!emailOrUsername || !password) {
      throw new ValidationError("Email/username and password are required");
    }

    // Find user by email or username
    const user = await this.userRepository.findByEmailOrUsername(emailOrUsername);
    if (!user) {
      throw new UnauthorizedError("Invalid credentials");
    }

    // Check if account is active
    if (!user.active) {
      throw new UnauthorizedError("Account is inactive");
    }

    // Check if account is locked
    if (user.locked_until && new Date(user.locked_until) > new Date()) {
      throw new UnauthorizedError("Account is temporarily locked");
    }

    // Verify password
    const isValidPassword = await this.verifyPassword(password, user.password_hash);
    if (!isValidPassword) {
      // Increment failed attempts
      await this.userRepository.incrementFailedAttempts(user.id);

      // Lock account if too many attempts
      if (user.failed_attempts >= 4) {
        await this.userRepository.lockAccount(user.id);
        throw new UnauthorizedError("Account locked due to multiple failed attempts");
      }

      throw new UnauthorizedError("Invalid credentials");
    }

    // Reset failed attempts on successful login
    await this.userRepository.resetFailedAttempts(user.id);

    // Generate tokens
    const accessToken = this.generateAccessToken(user);
    const refreshToken = await this.generateRefreshToken(user.id, rememberMe);

    return {
      user: {
        id: user.id,
        full_name: user.full_name,
        email: user.email,
        role: "Pharmacist",
        pharmacy_id: user.pharmacy_id
      },
      tokens: {
        access_token: accessToken,
        refresh_token: refreshToken,
        token_type: "Bearer",
        expires_in: 15 * 60 // 15 minutes
      }
    };
  }

  /**
   * Refresh access token using refresh token
   * @param {string} refreshToken - Refresh token
   * @returns {Promise<Object>} New tokens
   */
  async refreshAccessToken(refreshToken) {
    // Verify refresh token
    const tokenData = await this.tokenRepository.findByToken(refreshToken);
    if (!tokenData || tokenData.revoked || new Date(tokenData.expires_at) <= new Date()) {
      throw new UnauthorizedError("Invalid or expired refresh token");
    }

    // Get user data
    const user = await this.userRepository.findById(tokenData.user_id);
    if (!user) {
      throw new UnauthorizedError("User not found");
    }

    // Revoke old refresh token
    await this.tokenRepository.revokeToken(tokenData.id);

    // Generate new tokens
    const accessToken = this.generateAccessToken(user);
    const newRefreshToken = await this.generateRefreshToken(user.id, false);

    return {
      access_token: accessToken,
      refresh_token: newRefreshToken,
      token_type: "Bearer",
      expires_in: 15 * 60
    };
  }

  /**
   * Logout user by revoking refresh token
   * @param {string} refreshToken - Refresh token to revoke
   * @returns {Promise<boolean>} Success status
   */
  async logout(refreshToken) {
    if (!refreshToken) return false;

    const tokenData = await this.tokenRepository.findByToken(refreshToken);
    if (tokenData) {
      await this.tokenRepository.revokeToken(tokenData.id);
      return true;
    }

    return false;
  }

  /**
   * Verify password against hash
   * @param {string} password - Plain text password
   * @param {string} hash - Password hash
   * @returns {boolean} Whether password is valid
   */
  async verifyPassword(password, hash) {
    const hashedPassword = crypto.createHash("sha256").update(password).digest("hex");
    return hashedPassword === hash;
  }

  /**
   * Generate access token
   * @param {Object} user - User object
   * @returns {string} JWT access token
   */
  generateAccessToken(user) {
    const payload = {
      sub: user.id,
      role: "Pharmacist",
      pharmacy_id: user.pharmacy_id
    };

    return jwt.sign(payload, process.env.JWT_SECRET || "dev_secret", {
      expiresIn: "15m"
    });
  }

  /**
   * Generate and store refresh token
   * @param {number} userId - User ID
   * @param {boolean} rememberMe - Whether to extend token lifetime
   * @returns {Promise<string>} Refresh token
   */
  async generateRefreshToken(userId, rememberMe) {
    const token = crypto.randomBytes(32).toString("hex");
    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");
    const expiresAt = new Date();

    // Set expiration based on rememberMe
    expiresAt.setDate(expiresAt.getDate() + (rememberMe ? 30 : 7));

    await this.tokenRepository.create({
      user_id: userId,
      role: "Pharmacist",
      token_hash: hashedToken,
      expires_at: expiresAt
    });

    return token;
  }

  /**
   * Send OTP for login
   * @param {Object} otpData - OTP data
   * @returns {Promise<string>} Generated OTP code
   */
  async sendOtp(otpData) {
    const { name, phone } = otpData;

    if (!name || !phone) {
      throw new ValidationError("Name and phone are required for OTP");
    }

    // Generate OTP code
    const otpCode = this.generateOtpCode();

    // Store OTP in database
    await pool.query(
      "INSERT INTO otp_logs (phone, code, purpose) VALUES (?, ?, 'login')",
      [phone, otpCode]
    );

    // TODO: Integrate with SMS provider
    console.log(`OTP for ${phone}: ${otpCode}`);

    return otpCode;
  }

  /**
   * Verify OTP code
   * @param {Object} verificationData - Verification data
   * @returns {Promise<boolean>} Whether OTP is valid
   */
  async verifyOtp(verificationData) {
    const { phone, code } = verificationData;

    if (!phone || !code) {
      throw new ValidationError("Phone and code are required for OTP verification");
    }

    // Find valid OTP
    const [rows] = await pool.query(
      `SELECT id, phone, code, created_at
       FROM otp_logs
       WHERE phone = ? AND code = ? AND created_at >= DATE_SUB(NOW(), INTERVAL 10 MINUTE)
       ORDER BY id DESC
       LIMIT 1`,
      [phone, code]
    );

    return rows && rows.length > 0;
  }

  /**
   * Generate OTP code
   * @returns {string} 6-digit OTP code
   */
  generateOtpCode() {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  /**
   * Validate service parameters
   * @param {*} params - Parameters to validate
   * @returns {Object} Validation result
   */
  validateParams(params) {
    const errors = [];

    // Common validation rules can be added here
    if (params.email && !this.isValidEmail(params.email)) {
      errors.push({
        field: 'email',
        message: 'Invalid email format',
        code: 'INVALID_EMAIL'
      });
    }

    if (params.phone && !this.isValidPhone(params.phone)) {
      errors.push({
        field: 'phone',
        message: 'Invalid phone number format',
        code: 'INVALID_PHONE'
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
  isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * Validate phone number format
   * @param {string} phone - Phone number to validate
   * @returns {boolean} Whether phone is valid
   */
  isValidPhone(phone) {
    const phoneRegex = /^\+?[\d\s\-\(\)]{10,}$/;
    return phoneRegex.test(phone);
  }

  /**
   * Hash password
   * @param {string} password - Plain text password
   * @returns {string} Hashed password
   */
  hashPassword(password) {
    return crypto.createHash("sha256").update(password).digest("hex");
  }
}

export default AuthService;
