
-- ============================================================
-- Pharmacy POS Integrated Schema Upgrade (Single-Run Script)
-- Compatible with MySQL 8.x / MariaDB 10.x+
-- Safe-ish re-runs using IF NOT EXISTS where available.
-- ============================================================
SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS=1;

-- ============================================================
-- SECTION 0) PREREQS
-- Assumes your base schema from files (01..08) is already imported.
-- This script ADDS branches, POS tables, customers, and wiring (FKs).
-- ============================================================

/* ------------------------------------------------------------
   1) BRANCHES: real table (replaces JSON branches meta)
------------------------------------------------------------ */
CREATE TABLE IF NOT EXISTS branches (
  id           INT AUTO_INCREMENT PRIMARY KEY,
  pharmacy_id  INT NOT NULL,
  name         VARCHAR(150) NOT NULL,
  code         VARCHAR(30) UNIQUE,
  city         VARCHAR(100),
  address      VARCHAR(255),
  is_active    TINYINT(1) NOT NULL DEFAULT 1,
  created_at   TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_branch_pharmacy FOREIGN KEY (pharmacy_id) REFERENCES pharmacies(id) ON DELETE CASCADE,
  INDEX idx_branches_pharmacy (pharmacy_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

/* ------------------------------------------------------------
   2) USERS / PHARMACISTS: add branch + role
------------------------------------------------------------ */
ALTER TABLE pharmacists
  ADD COLUMN IF NOT EXISTS branch_id INT NULL,
  ADD COLUMN IF NOT EXISTS role ENUM('admin','cashier','manager','pharmacist') NULL DEFAULT 'pharmacist';

SET @sql := (
  SELECT IF(
    EXISTS (
      SELECT 1
      FROM information_schema.TABLE_CONSTRAINTS tc
      WHERE tc.CONSTRAINT_SCHEMA = DATABASE()
        AND tc.TABLE_NAME = 'pharmacists'
        AND tc.CONSTRAINT_NAME = 'fk_pharmacist_branch'
        AND tc.CONSTRAINT_TYPE = 'FOREIGN KEY'
    ),
    'SELECT "fk_pharmacist_branch exists"',
    'ALTER TABLE pharmacists ADD CONSTRAINT fk_pharmacist_branch FOREIGN KEY (branch_id) REFERENCES branches(id) ON DELETE SET NULL'
  )
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

CREATE INDEX IF NOT EXISTS idx_pharmacists_branch ON pharmacists(branch_id);

/* ------------------------------------------------------------
   3) CUSTOMERS: normalized customers table
------------------------------------------------------------ */
CREATE TABLE IF NOT EXISTS customers (
  id           BIGINT AUTO_INCREMENT PRIMARY KEY,
  pharmacy_id  INT NOT NULL,
  branch_id    INT NULL,
  full_name    VARCHAR(180) NOT NULL,
  phone        VARCHAR(40),
  email        VARCHAR(120),
  tax_number   VARCHAR(50),
  is_active    TINYINT(1) NOT NULL DEFAULT 1,
  created_at   TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_customer_pharmacy FOREIGN KEY (pharmacy_id) REFERENCES pharmacies(id) ON DELETE CASCADE,
  CONSTRAINT fk_customer_branch   FOREIGN KEY (branch_id)   REFERENCES branches(id)   ON DELETE SET NULL,
  UNIQUE KEY uk_customer_unique (pharmacy_id, phone)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

/* ------------------------------------------------------------
   4) POS REGISTERS & SHIFTS
------------------------------------------------------------ */
CREATE TABLE IF NOT EXISTS pos_registers (
  id           BIGINT AUTO_INCREMENT PRIMARY KEY,
  pharmacy_id  INT NOT NULL,
  branch_id    INT NOT NULL,
  name         VARCHAR(100) NOT NULL,
  is_active    TINYINT(1) NOT NULL DEFAULT 1,
  created_at   TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_posreg_pharmacy FOREIGN KEY (pharmacy_id) REFERENCES pharmacies(id) ON DELETE CASCADE,
  CONSTRAINT fk_posreg_branch   FOREIGN KEY (branch_id)   REFERENCES branches(id)   ON DELETE CASCADE,
  INDEX idx_posreg_branch (branch_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS pos_shifts (
  id              BIGINT AUTO_INCREMENT PRIMARY KEY,
  register_id     BIGINT NOT NULL,
  opened_by       INT NOT NULL,    -- pharmacist.id
  closed_by       INT NULL,        -- pharmacist.id
  opened_at       DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  closed_at       DATETIME NULL,
  opening_float   DECIMAL(12,2) NOT NULL DEFAULT 0,
  expected_amount DECIMAL(12,2) NULL DEFAULT 0,
  closing_amount  DECIMAL(12,2) NULL,
  notes           VARCHAR(255),
  CONSTRAINT fk_shift_register   FOREIGN KEY (register_id) REFERENCES pos_registers(id) ON DELETE CASCADE,
  CONSTRAINT fk_shift_opened_by  FOREIGN KEY (opened_by)   REFERENCES pharmacists(id) ON DELETE RESTRICT,
  CONSTRAINT fk_shift_closed_by  FOREIGN KEY (closed_by)   REFERENCES pharmacists(id) ON DELETE SET NULL,
  INDEX idx_shift_register_open (register_id, opened_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

/* ------------------------------------------------------------
   5) PAYMENT METHODS & POS PAYMENTS
------------------------------------------------------------ */
CREATE TABLE IF NOT EXISTS payment_methods (
  id        BIGINT AUTO_INCREMENT PRIMARY KEY,
  name      VARCHAR(60) NOT NULL,   -- Cash / Card / Bank / OnAccount
  is_cash   TINYINT(1) NOT NULL DEFAULT 0,
  is_active TINYINT(1) NOT NULL DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS pos_payments (
  id          BIGINT AUTO_INCREMENT PRIMARY KEY,
  sale_id     BIGINT NOT NULL,
  method_id   BIGINT NOT NULL,
  amount      DECIMAL(12,2) NOT NULL,
  received_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  received_by INT NOT NULL,              -- pharmacist.id
  is_change   TINYINT(1) NOT NULL DEFAULT 0, -- Change returned
  reference   VARCHAR(120),
  CONSTRAINT fk_pay_sale    FOREIGN KEY (sale_id)   REFERENCES sales(id) ON DELETE CASCADE,
  CONSTRAINT fk_pay_method  FOREIGN KEY (method_id) REFERENCES payment_methods(id),
  CONSTRAINT fk_pay_user    FOREIGN KEY (received_by) REFERENCES pharmacists(id),
  INDEX idx_pay_sale (sale_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

/* ------------------------------------------------------------
   6) SALES & SALE ITEMS: augment with POS columns and branch
------------------------------------------------------------ */
ALTER TABLE sales
  ADD COLUMN IF NOT EXISTS pharmacy_id INT NULL,
  ADD COLUMN IF NOT EXISTS branch_id   INT NULL,
  ADD COLUMN IF NOT EXISTS register_id BIGINT NULL,
  ADD COLUMN IF NOT EXISTS shift_id    BIGINT NULL,
  ADD COLUMN IF NOT EXISTS customer_id BIGINT NULL,
  ADD COLUMN IF NOT EXISTS status ENUM('draft','posted','void','returned') NOT NULL DEFAULT 'posted';

SET @sql := (
  SELECT IF(
    EXISTS (
      SELECT 1 FROM information_schema.TABLE_CONSTRAINTS tc
      WHERE tc.CONSTRAINT_SCHEMA = DATABASE()
        AND tc.TABLE_NAME = 'sales'
        AND tc.CONSTRAINT_NAME = 'fk_sales_pharmacy'
        AND tc.CONSTRAINT_TYPE = 'FOREIGN KEY'
    ),
    'SELECT "fk_sales_pharmacy exists"',
    'ALTER TABLE sales ADD CONSTRAINT fk_sales_pharmacy FOREIGN KEY (pharmacy_id) REFERENCES pharmacies(id) ON DELETE SET NULL'
  )
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @sql := (
  SELECT IF(
    EXISTS (
      SELECT 1 FROM information_schema.TABLE_CONSTRAINTS tc
      WHERE tc.CONSTRAINT_SCHEMA = DATABASE()
        AND tc.TABLE_NAME = 'sales'
        AND tc.CONSTRAINT_NAME = 'fk_sales_branch'
        AND tc.CONSTRAINT_TYPE = 'FOREIGN KEY'
    ),
    'SELECT "fk_sales_branch exists"',
    'ALTER TABLE sales ADD CONSTRAINT fk_sales_branch FOREIGN KEY (branch_id) REFERENCES branches(id) ON DELETE SET NULL'
  )
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @sql := (
  SELECT IF(
    EXISTS (
      SELECT 1 FROM information_schema.TABLE_CONSTRAINTS tc
      WHERE tc.CONSTRAINT_SCHEMA = DATABASE()
        AND tc.TABLE_NAME = 'sales'
        AND tc.CONSTRAINT_NAME = 'fk_sales_register'
        AND tc.CONSTRAINT_TYPE = 'FOREIGN KEY'
    ),
    'SELECT "fk_sales_register exists"',
    'ALTER TABLE sales ADD CONSTRAINT fk_sales_register FOREIGN KEY (register_id) REFERENCES pos_registers(id) ON DELETE SET NULL'
  )
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @sql := (
  SELECT IF(
    EXISTS (
      SELECT 1 FROM information_schema.TABLE_CONSTRAINTS tc
      WHERE tc.CONSTRAINT_SCHEMA = DATABASE()
        AND tc.TABLE_NAME = 'sales'
        AND tc.CONSTRAINT_NAME = 'fk_sales_shift'
        AND tc.CONSTRAINT_TYPE = 'FOREIGN KEY'
    ),
    'SELECT "fk_sales_shift exists"',
    'ALTER TABLE sales ADD CONSTRAINT fk_sales_shift FOREIGN KEY (shift_id) REFERENCES pos_shifts(id) ON DELETE SET NULL'
  )
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @sql := (
  SELECT IF(
    EXISTS (
      SELECT 1 FROM information_schema.TABLE_CONSTRAINTS tc
      WHERE tc.CONSTRAINT_SCHEMA = DATABASE()
        AND tc.TABLE_NAME = 'sales'
        AND tc.CONSTRAINT_NAME = 'fk_sales_customer'
        AND tc.CONSTRAINT_TYPE = 'FOREIGN KEY'
    ),
    'SELECT "fk_sales_customer exists"',
    'ALTER TABLE sales ADD CONSTRAINT fk_sales_customer FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE SET NULL'
  )
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

CREATE INDEX IF NOT EXISTS idx_sales_status_date ON sales(status, sale_date);
CREATE INDEX IF NOT EXISTS idx_sales_branch_date ON sales(branch_id, sale_date);

ALTER TABLE sale_items
  ADD COLUMN IF NOT EXISTS pharmacy_id INT NULL,
  ADD COLUMN IF NOT EXISTS branch_id   INT NULL;

SET @sql := (
  SELECT IF(
    EXISTS (
      SELECT 1 FROM information_schema.TABLE_CONSTRAINTS tc
      WHERE tc.CONSTRAINT_SCHEMA = DATABASE()
        AND tc.TABLE_NAME = 'sale_items'
        AND tc.CONSTRAINT_NAME = 'fk_si_pharmacy'
        AND tc.CONSTRAINT_TYPE = 'FOREIGN KEY'
    ),
    'SELECT "fk_si_pharmacy exists"',
    'ALTER TABLE sale_items ADD CONSTRAINT fk_si_pharmacy FOREIGN KEY (pharmacy_id) REFERENCES pharmacies(id) ON DELETE SET NULL'
  )
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @sql := (
  SELECT IF(
    EXISTS (
      SELECT 1 FROM information_schema.TABLE_CONSTRAINTS tc
      WHERE tc.CONSTRAINT_SCHEMA = DATABASE()
        AND tc.TABLE_NAME = 'sale_items'
        AND tc.CONSTRAINT_NAME = 'fk_si_branch'
        AND tc.CONSTRAINT_TYPE = 'FOREIGN KEY'
    ),
    'SELECT "fk_si_branch exists"',
    'ALTER TABLE sale_items ADD CONSTRAINT fk_si_branch FOREIGN KEY (branch_id) REFERENCES branches(id) ON DELETE SET NULL'
  )
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

/* ------------------------------------------------------------
   7) INVENTORY MOVEMENTS: add branch + link to sales/POs
------------------------------------------------------------ */
ALTER TABLE inventory_movements
  ADD COLUMN IF NOT EXISTS branch_id INT NULL,
  ADD COLUMN IF NOT EXISTS sale_id   BIGINT NULL,
  ADD COLUMN IF NOT EXISTS po_id     BIGINT NULL;

SET @sql := (
  SELECT IF(
    EXISTS (
      SELECT 1 FROM information_schema.TABLE_CONSTRAINTS tc
      WHERE tc.CONSTRAINT_SCHEMA = DATABASE()
        AND tc.TABLE_NAME = 'inventory_movements'
        AND tc.CONSTRAINT_NAME = 'fk_mov_branch'
        AND tc.CONSTRAINT_TYPE = 'FOREIGN KEY'
    ),
    'SELECT "fk_mov_branch exists"',
    'ALTER TABLE inventory_movements ADD CONSTRAINT fk_mov_branch FOREIGN KEY (branch_id) REFERENCES branches(id) ON DELETE SET NULL'
  )
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @sql := (
  SELECT IF(
    EXISTS (
      SELECT 1 FROM information_schema.TABLE_CONSTRAINTS tc
      WHERE tc.CONSTRAINT_SCHEMA = DATABASE()
        AND tc.TABLE_NAME = 'inventory_movements'
        AND tc.CONSTRAINT_NAME = 'fk_mov_sale'
        AND tc.CONSTRAINT_TYPE = 'FOREIGN KEY'
    ),
    'SELECT "fk_mov_sale exists"',
    'ALTER TABLE inventory_movements ADD CONSTRAINT fk_mov_sale FOREIGN KEY (sale_id) REFERENCES sales(id) ON DELETE SET NULL'
  )
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @sql := (
  SELECT IF(
    EXISTS (
      SELECT 1 FROM information_schema.TABLE_CONSTRAINTS tc
      WHERE tc.CONSTRAINT_SCHEMA = DATABASE()
        AND tc.TABLE_NAME = 'inventory_movements'
        AND tc.CONSTRAINT_NAME = 'fk_mov_po'
        AND tc.CONSTRAINT_TYPE = 'FOREIGN KEY'
    ),
    'SELECT "fk_mov_po exists"',
    'ALTER TABLE inventory_movements ADD CONSTRAINT fk_mov_po FOREIGN KEY (po_id) REFERENCES purchase_orders(id) ON DELETE SET NULL'
  )
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

CREATE INDEX IF NOT EXISTS idx_mov_med_date ON inventory_movements(medicine_id, created_at);

/* ------------------------------------------------------------
   8) PURCHASE ORDERS: add branch
------------------------------------------------------------ */
ALTER TABLE purchase_orders
  ADD COLUMN IF NOT EXISTS branch_id INT NULL;

SET @sql := (
  SELECT IF(
    EXISTS (
      SELECT 1 FROM information_schema.TABLE_CONSTRAINTS tc
      WHERE tc.CONSTRAINT_SCHEMA = DATABASE()
        AND tc.TABLE_NAME = 'purchase_orders'
        AND tc.CONSTRAINT_NAME = 'fk_po_branch'
        AND tc.CONSTRAINT_TYPE = 'FOREIGN KEY'
    ),
    'SELECT "fk_po_branch exists"',
    'ALTER TABLE purchase_orders ADD CONSTRAINT fk_po_branch FOREIGN KEY (branch_id) REFERENCES branches(id) ON DELETE SET NULL'
  )
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

CREATE INDEX IF NOT EXISTS idx_po_branch ON purchase_orders(branch_id);

/* ------------------------------------------------------------
   9) DATA NORMALIZATION: unify money scales (optional, safe)
------------------------------------------------------------ */
ALTER TABLE sales                MODIFY COLUMN total      DECIMAL(12,2);
ALTER TABLE sale_items           MODIFY COLUMN unit_price DECIMAL(12,4), MODIFY COLUMN line_total DECIMAL(12,2);
ALTER TABLE purchase_orders      MODIFY COLUMN total      DECIMAL(12,2);
ALTER TABLE purchase_order_items MODIFY COLUMN unit_price DECIMAL(12,4), MODIFY COLUMN line_total DECIMAL(12,2);

/* ------------------------------------------------------------
   10) SEEDING: default payment methods (idempotent)
------------------------------------------------------------ */
INSERT INTO payment_methods (name, is_cash, is_active)
SELECT * FROM (SELECT 'Cash' AS name, 1 AS is_cash, 1 AS is_active) AS tmp
WHERE NOT EXISTS (SELECT 1 FROM payment_methods WHERE name='Cash');

INSERT INTO payment_methods (name, is_cash, is_active)
SELECT * FROM (SELECT 'Card' AS name, 0 AS is_cash, 1 AS is_active) AS tmp
WHERE NOT EXISTS (SELECT 1 FROM payment_methods WHERE name='Card');

INSERT INTO payment_methods (name, is_cash, is_active)
SELECT * FROM (SELECT 'BankTransfer' AS name, 0 AS is_cash, 1 AS is_active) AS tmp
WHERE NOT EXISTS (SELECT 1 FROM payment_methods WHERE name='BankTransfer');

INSERT INTO payment_methods (name, is_cash, is_active)
SELECT * FROM (SELECT 'OnAccount' AS name, 0 AS is_cash, 1 AS is_active) AS tmp
WHERE NOT EXISTS (SELECT 1 FROM payment_methods WHERE name='OnAccount');

/* ------------------------------------------------------------
   11) MIGRATION HELPERS: create a default branch per pharmacy
       and backfill branch_id/registers for existing data.
------------------------------------------------------------ */

-- 11.1 Create default branch for each pharmacy if none exists
INSERT INTO branches (pharmacy_id, name, code, city, address, is_active)
SELECT p.id, CONCAT(p.name, ' - Main'), CONCAT('BR', p.id), NULL, NULL, 1
FROM pharmacies p
LEFT JOIN branches b ON b.pharmacy_id = p.id
WHERE b.id IS NULL;

-- 11.2 Create a default POS register for each new branch if none exists
INSERT INTO pos_registers (pharmacy_id, branch_id, name, is_active)
SELECT b.pharmacy_id, b.id, 'Main Register', 1
FROM branches b
LEFT JOIN pos_registers r ON r.branch_id = b.id
WHERE r.id IS NULL;

-- 11.3 Backfill pharmacists.branch_id with any branch of their pharmacy (if both present)
UPDATE pharmacists ph
JOIN branches b ON b.pharmacy_id = ph.pharmacy_id
SET ph.branch_id = COALESCE(ph.branch_id, b.id)
WHERE ph.branch_id IS NULL;

-- 11.4 Backfill SALES: set branch from pharmacy where missing
UPDATE sales s
JOIN pharmacies p ON p.id = s.pharmacy_id
LEFT JOIN branches b ON b.pharmacy_id = p.id
SET s.branch_id = COALESCE(s.branch_id, b.id)
WHERE s.branch_id IS NULL;

-- 11.5 Backfill SALE_ITEMS: copy pharmacy/branch from parent sale
UPDATE sale_items si
JOIN sales s ON s.id = si.sale_id
SET si.pharmacy_id = COALESCE(si.pharmacy_id, s.pharmacy_id),
    si.branch_id   = COALESCE(si.branch_id,   s.branch_id)
WHERE si.pharmacy_id IS NULL OR si.branch_id IS NULL;

-- 11.6 Backfill INVENTORY_MOVEMENTS: set branch using sale or PO if available
UPDATE inventory_movements m
JOIN sales s ON s.id = m.sale_id
SET m.branch_id = COALESCE(m.branch_id, s.branch_id)
WHERE m.sale_id IS NOT NULL AND m.branch_id IS NULL;

UPDATE inventory_movements m
JOIN purchase_orders po ON po.id = m.po_id
SET m.branch_id = COALESCE(m.branch_id, po.branch_id)
WHERE m.po_id IS NOT NULL AND m.branch_id IS NULL;

-- 11.7 Backfill PURCHASE_ORDERS: set branch from pharmacy where missing
UPDATE purchase_orders po
JOIN pharmacies p ON p.id = po.pharmacy_id
LEFT JOIN branches b ON b.pharmacy_id = p.id
SET po.branch_id = COALESCE(po.branch_id, b.id)
WHERE po.branch_id IS NULL;

-- 11.8 Ensure each sale has a register_id if branch exists (attach the branch default register)
UPDATE sales s
JOIN pos_registers r ON r.branch_id = s.branch_id
SET s.register_id = COALESCE(s.register_id, r.id)
WHERE s.register_id IS NULL;

-- 11.9 Initialize shifts table is empty; operational app should open/close shifts at runtime.
-- No default shift is created here to avoid accounting inconsistencies.

/* ------------------------------------------------------------
   12) REPORTING INDEXES (quality-of-life)
------------------------------------------------------------ */
CREATE INDEX IF NOT EXISTS idx_sales_branch_status_date ON sales(branch_id, status, sale_date);
CREATE INDEX IF NOT EXISTS idx_payments_method_date ON pos_payments(method_id, received_at);
CREATE INDEX IF NOT EXISTS idx_customers_name ON customers(full_name);

-- ============================================================
-- END OF SCRIPT
-- ============================================================
