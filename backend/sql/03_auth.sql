-- Auth migration: add credentials to pharmacists and refresh tokens table

-- Pharmacist credentials and security columns
ALTER TABLE pharmacists
  ADD COLUMN IF NOT EXISTS email VARCHAR(150) NULL UNIQUE,
  ADD COLUMN IF NOT EXISTS username VARCHAR(80) NULL UNIQUE,
  ADD COLUMN IF NOT EXISTS password_hash VARCHAR(255) NULL,
  ADD COLUMN IF NOT EXISTS active TINYINT(1) NOT NULL DEFAULT 1,
  ADD COLUMN IF NOT EXISTS failed_attempts INT NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS locked_until DATETIME NULL;

-- Refresh tokens store
CREATE TABLE IF NOT EXISTS auth_refresh_tokens (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  role ENUM('Pharmacist') NOT NULL,
  token_hash CHAR(64) NOT NULL,
  expires_at DATETIME NOT NULL,
  revoked TINYINT(1) NOT NULL DEFAULT 0,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_tokens_user (user_id),
  UNIQUE KEY uk_tokens_hash (token_hash),
  CONSTRAINT fk_tokens_pharmacist FOREIGN KEY (user_id) REFERENCES pharmacists(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
