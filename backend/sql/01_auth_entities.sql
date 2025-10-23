-- MySQL schema for pharmacist and patient entities
-- Run this on the same database configured in backend/.env (DB_NAME)

-- Patients table
CREATE TABLE IF NOT EXISTS patients (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  full_name     VARCHAR(150)      NOT NULL,
  phone         VARCHAR(20)       NOT NULL,
  avatar_url    VARCHAR(255)      NULL,
  gender        ENUM('m','f')     NULL,
  date_of_birth DATE              NULL,
  address       VARCHAR(255)      NULL,
  created_at    TIMESTAMP         NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at    TIMESTAMP         NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uk_patients_phone (phone)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Pharmacists table
CREATE TABLE IF NOT EXISTS pharmacists (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  full_name     VARCHAR(150)      NOT NULL,
  license_no    VARCHAR(50)       NULL,
  phone         VARCHAR(20)       NOT NULL,
  avatar_url    VARCHAR(255)      NULL,
  pharmacy_name VARCHAR(150)      NULL,
  pharmacy_addr VARCHAR(255)      NULL,
  created_at    TIMESTAMP         NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at    TIMESTAMP         NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uk_pharmacists_phone (phone)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Simple OTP log (optional for phone verification flows)
CREATE TABLE IF NOT EXISTS otp_logs (
  id         BIGINT AUTO_INCREMENT PRIMARY KEY,
  phone      VARCHAR(20) NOT NULL,
  code       VARCHAR(10) NOT NULL,
  purpose    VARCHAR(50) NOT NULL DEFAULT 'login',
  created_at TIMESTAMP   NOT NULL DEFAULT CURRENT_TIMESTAMP,
  KEY idx_otp_phone_created (phone, created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
