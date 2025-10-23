
-- =====================================================================
-- smart_pharmacy1  |  POS + Inventory  |  Triggers + Views + Procedures
-- MySQL 8.x / MariaDB 10.x+
-- =====================================================================

-- OPTIONAL: Uncomment to target your database explicitly
-- USE `smart_pharmacy1`;

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS=1;

-- =====================================================================
-- INDEXES (performance helpers)
-- =====================================================================
CREATE INDEX IF NOT EXISTS idx_sales_date               ON sales(sale_date);
CREATE INDEX IF NOT EXISTS idx_sales_branch_status_date ON sales(branch_id, status, sale_date);
CREATE INDEX IF NOT EXISTS idx_sale_items_medicine      ON sale_items(medicine_id);
CREATE INDEX IF NOT EXISTS idx_mov_branch_med_date      ON inventory_movements(branch_id, medicine_id, created_at);
CREATE INDEX IF NOT EXISTS idx_payments_date_method     ON pos_payments(received_at, method_id);
CREATE INDEX IF NOT EXISTS idx_po_items_po_med          ON purchase_order_items(po_id, medicine_id);
CREATE INDEX IF NOT EXISTS idx_customers_phone          ON customers(phone);
CREATE INDEX IF NOT EXISTS idx_medicines_name           ON medicines(name);

-- =====================================================================
-- TRIGGERS (inventory automation & data integrity)
-- =====================================================================
DELIMITER $$

-- 1) SALE_ITEMS: AFTER INSERT -> stock out
DROP TRIGGER IF EXISTS trg_sale_items_ai $$
CREATE TRIGGER trg_sale_items_ai
AFTER INSERT ON sale_items
FOR EACH ROW
BEGIN
  DECLARE v_branch INT;
  DECLARE v_pharmacy INT;
  SELECT branch_id, pharmacy_id INTO v_branch, v_pharmacy FROM sales WHERE id = NEW.sale_id LIMIT 1;

  -- Ensure line_total integrity (qty * unit_price)
  IF NEW.line_total IS NULL OR NEW.line_total = 0 THEN
    UPDATE sale_items SET line_total = ROUND(NEW.qty * NEW.unit_price, 2) WHERE id = NEW.id;
  END IF;

  INSERT INTO inventory_movements(medicine_id, qty_change, reason, ref_type, ref_id, notes, created_at, branch_id, pharmacy_id, sale_id)
  VALUES (NEW.medicine_id, -NEW.qty, 'sale', 'SO', NEW.sale_id, 'Auto: sale_items insert', NOW(), v_branch, v_pharmacy, NEW.sale_id);
END $$

-- 2) SALE_ITEMS: AFTER UPDATE -> adjust stock by delta
DROP TRIGGER IF EXISTS trg_sale_items_au $$
CREATE TRIGGER trg_sale_items_au
AFTER UPDATE ON sale_items
FOR EACH ROW
BEGIN
  DECLARE v_delta INT;
  DECLARE v_branch INT;
  DECLARE v_pharmacy INT;
  SET v_delta = NEW.qty - OLD.qty;
  IF v_delta <> 0 THEN
    SELECT branch_id, pharmacy_id INTO v_branch, v_pharmacy FROM sales WHERE id = NEW.sale_id LIMIT 1;
    INSERT INTO inventory_movements(medicine_id, qty_change, reason, ref_type, ref_id, notes, created_at, branch_id, pharmacy_id, sale_id)
    VALUES (NEW.medicine_id, -v_delta, 'adjustment', 'SO', NEW.sale_id, 'Auto: sale_items update', NOW(), v_branch, v_pharmacy, NEW.sale_id);
  END IF;

  -- keep line_total consistent
  IF NEW.line_total <> ROUND(NEW.qty * NEW.unit_price, 2) THEN
    UPDATE sale_items SET line_total = ROUND(NEW.qty * NEW.unit_price, 2) WHERE id = NEW.id;
  END IF;
END $$

-- 3) SALE_ITEMS: AFTER DELETE -> put stock back
DROP TRIGGER IF EXISTS trg_sale_items_ad $$
CREATE TRIGGER trg_sale_items_ad
AFTER DELETE ON sale_items
FOR EACH ROW
BEGIN
  DECLARE v_branch INT;
  DECLARE v_pharmacy INT;
  SELECT branch_id, pharmacy_id INTO v_branch, v_pharmacy FROM sales WHERE id = OLD.sale_id LIMIT 1;

  INSERT INTO inventory_movements(medicine_id, qty_change, reason, ref_type, ref_id, notes, created_at, branch_id, pharmacy_id, sale_id)
  VALUES (OLD.medicine_id, +OLD.qty, 'return_in', 'SO', OLD.sale_id, 'Auto: sale_items delete', NOW(), v_branch, v_pharmacy, OLD.sale_id);
END $$

-- 4) PURCHASE_ORDER_ITEMS: AFTER INSERT -> if PO is 'received', stock in
DROP TRIGGER IF EXISTS trg_poi_ai $$
CREATE TRIGGER trg_poi_ai
AFTER INSERT ON purchase_order_items
FOR EACH ROW
BEGIN
  DECLARE v_status VARCHAR(20);
  DECLARE v_branch INT;
  DECLARE v_pharmacy INT;
  SELECT status, branch_id, pharmacy_id INTO v_status, v_branch, v_pharmacy FROM purchase_orders WHERE id = NEW.po_id LIMIT 1;
  IF v_status = 'received' THEN
    INSERT INTO inventory_movements(medicine_id, qty_change, reason, ref_type, ref_id, notes, created_at, branch_id, pharmacy_id, po_id)
    VALUES (NEW.medicine_id, +NEW.qty, 'purchase', 'PO', NEW.po_id, 'Auto: PO item insert on received', NOW(), v_branch, v_pharmacy, NEW.po_id);
  END IF;
END $$

-- 5) PURCHASE_ORDER_ITEMS: AFTER UPDATE -> delta if received
DROP TRIGGER IF EXISTS trg_poi_au $$
CREATE TRIGGER trg_poi_au
AFTER UPDATE ON purchase_order_items
FOR EACH ROW
BEGIN
  DECLARE v_status VARCHAR(20);
  DECLARE v_delta INT;
  DECLARE v_branch INT;
  DECLARE v_pharmacy INT;
  SELECT status, branch_id, pharmacy_id INTO v_status, v_branch, v_pharmacy FROM purchase_orders WHERE id = NEW.po_id LIMIT 1;
  SET v_delta = NEW.qty - OLD.qty;
  IF v_status = 'received' AND v_delta <> 0 THEN
    INSERT INTO inventory_movements(medicine_id, qty_change, reason, ref_type, ref_id, notes, created_at, branch_id, pharmacy_id, po_id)
    VALUES (NEW.medicine_id, +v_delta, 'adjustment', 'PO', NEW.po_id, 'Auto: PO item update on received', NOW(), v_branch, v_pharmacy, NEW.po_id);
  END IF;
END $$

-- 6) PURCHASE_ORDER_ITEMS: AFTER DELETE -> if received, reverse
DROP TRIGGER IF EXISTS trg_poi_ad $$
CREATE TRIGGER trg_poi_ad
AFTER DELETE ON purchase_order_items
FOR EACH ROW
BEGIN
  DECLARE v_status VARCHAR(20);
  DECLARE v_branch INT;
  DECLARE v_pharmacy INT;
  SELECT status, branch_id, pharmacy_id INTO v_status, v_branch, v_pharmacy FROM purchase_orders WHERE id = OLD.po_id LIMIT 1;
  IF v_status = 'received' THEN
    INSERT INTO inventory_movements(medicine_id, qty_change, reason, ref_type, ref_id, notes, created_at, branch_id, pharmacy_id, po_id)
    VALUES (OLD.medicine_id, -OLD.qty, 'return_out', 'PO', OLD.po_id, 'Auto: PO item delete on received', NOW(), v_branch, v_pharmacy, OLD.po_id);
  END IF;
END $$

DELIMITER ;

-- =====================================================================
-- VIEWS (reporting & dashboards)
-- =====================================================================

-- Current stock balance by branch & medicine
CREATE OR REPLACE VIEW v_stock_balance AS
SELECT
  im.branch_id,
  im.medicine_id,
  SUM(im.qty_change) AS qty_on_hand
FROM inventory_movements im
GROUP BY im.branch_id, im.medicine_id;

-- Detailed sales with joins
CREATE OR REPLACE VIEW v_sales_detailed AS
SELECT
  s.id AS sale_id,
  s.sale_date,
  s.status,
  s.branch_id,
  b.name AS branch_name,
  s.customer_id,
  c.full_name AS customer_name,
  si.id AS sale_item_id,
  si.medicine_id,
  md.name AS medicine_name,
  si.qty,
  si.unit_price,
  si.line_total
FROM sales s
LEFT JOIN branches b ON b.id = s.branch_id
LEFT JOIN customers c ON c.id = s.customer_id
JOIN sale_items si ON si.sale_id = s.id
LEFT JOIN medicines md ON md.id = si.medicine_id;

-- POS KPIs for today by branch (sales, invoices, avg, expected cash drawer)
CREATE OR REPLACE VIEW v_pos_dashboard_today AS
SELECT
  b.id AS branch_id,
  b.name AS branch_name,
  COALESCE(SUM(CASE WHEN s.status='posted' AND DATE(s.sale_date)=CURRENT_DATE THEN s.total END),0) AS todays_sales,
  COALESCE(SUM(CASE WHEN s.status='posted' AND DATE(s.sale_date)=CURRENT_DATE THEN 1 END),0) AS invoice_count,
  COALESCE(AVG(CASE WHEN s.status='posted' AND DATE(s.sale_date)=CURRENT_DATE THEN s.total END),0) AS avg_invoice,
  (
    -- Expected Cash Drawer: opening + cash in - change (for open shifts today)
    COALESCE((SELECT SUM(ps.opening_float)
              FROM pos_shifts ps
              JOIN pos_registers pr ON pr.id = ps.register_id
              WHERE pr.branch_id = b.id AND DATE(ps.opened_at)=CURRENT_DATE AND ps.closed_at IS NULL),0)
    +
    COALESCE((SELECT SUM(p.amount)
              FROM pos_payments p
              JOIN sales sx ON sx.id = p.sale_id
              JOIN payment_methods pm ON pm.id = p.method_id
              WHERE pm.is_cash=1 AND p.is_change=0
                AND sx.branch_id = b.id AND sx.status='posted' AND DATE(sx.sale_date)=CURRENT_DATE),0)
    -
    COALESCE((SELECT SUM(p.amount)
              FROM pos_payments p
              JOIN sales sx ON sx.id = p.sale_id
              JOIN payment_methods pm ON pm.id = p.method_id
              WHERE pm.is_cash=1 AND p.is_change=1
                AND sx.branch_id = b.id AND sx.status='posted' AND DATE(sx.sale_date)=CURRENT_DATE),0)
  ) AS expected_cash_drawer
FROM branches b
LEFT JOIN sales s ON s.branch_id = b.id
GROUP BY b.id, b.name;

-- =====================================================================
-- PROCEDURES (helpers for POS operations)
-- =====================================================================
DELIMITER $$

-- Open a shift safely (one open shift per register)
DROP PROCEDURE IF EXISTS sp_open_shift $$
CREATE PROCEDURE sp_open_shift(IN p_register_id BIGINT, IN p_opened_by INT, IN p_opening_float DECIMAL(12,2))
BEGIN
  IF EXISTS (SELECT 1 FROM pos_shifts WHERE register_id=p_register_id AND closed_at IS NULL) THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Shift already open for this register';
  ELSE
    INSERT INTO pos_shifts(register_id, opened_by, opening_float) VALUES (p_register_id, p_opened_by, p_opening_float);
  END IF;
END $$

-- Close a shift and compute expected/closing difference
DROP PROCEDURE IF EXISTS sp_close_shift $$
CREATE PROCEDURE sp_close_shift(IN p_shift_id BIGINT, IN p_closed_by INT, IN p_closing_amount DECIMAL(12,2))
BEGIN
  DECLARE v_register BIGINT;
  DECLARE v_branch INT;
  DECLARE v_opening DECIMAL(12,2);
  DECLARE v_cash_in DECIMAL(12,2);
  DECLARE v_change DECIMAL(12,2);
  SELECT s.register_id, pr.branch_id, s.opening_float
    INTO v_register, v_branch, v_opening
  FROM pos_shifts s JOIN pos_registers pr ON pr.id = s.register_id
  WHERE s.id = p_shift_id;

  SELECT COALESCE(SUM(p.amount),0) INTO v_cash_in
  FROM pos_payments p
  JOIN sales sx ON sx.id = p.sale_id
  JOIN payment_methods pm ON pm.id = p.method_id
  WHERE pm.is_cash=1 AND p.is_change=0 AND sx.branch_id=v_branch
    AND sx.status='posted' AND sx.sale_date >= (SELECT opened_at FROM pos_shifts WHERE id=p_shift_id);

  SELECT COALESCE(SUM(p.amount),0) INTO v_change
  FROM pos_payments p
  JOIN sales sx ON sx.id = p.sale_id
  JOIN payment_methods pm ON pm.id = p.method_id
  WHERE pm.is_cash=1 AND p.is_change=1 AND sx.branch_id=v_branch
    AND sx.status='posted' AND sx.sale_date >= (SELECT opened_at FROM pos_shifts WHERE id=p_shift_id);

  UPDATE pos_shifts
    SET expected_amount = v_opening + v_cash_in - v_change,
        closing_amount  = p_closing_amount,
        closed_by       = p_closed_by,
        closed_at       = NOW()
  WHERE id = p_shift_id;
END $$

-- Recalculate sale totals from items
DROP PROCEDURE IF EXISTS sp_recalc_sale_total $$
CREATE PROCEDURE sp_recalc_sale_total(IN p_sale_id BIGINT)
BEGIN
  UPDATE sales s
     JOIN (SELECT sale_id, ROUND(SUM(line_total),2) AS tot FROM sale_items WHERE sale_id=p_sale_id GROUP BY sale_id) x
        ON x.sale_id = s.id
  SET s.total = x.tot
  WHERE s.id = p_sale_id;
END $$

-- Record a payment (with validation)
DROP PROCEDURE IF EXISTS sp_record_payment $$
CREATE PROCEDURE sp_record_payment(IN p_sale_id BIGINT, IN p_method_id BIGINT, IN p_amount DECIMAL(12,2), IN p_received_by INT, IN p_is_change TINYINT)
BEGIN
  IF p_amount <= 0 THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Amount must be > 0';
  END IF;
  INSERT INTO pos_payments(sale_id, method_id, amount, received_by, is_change) VALUES
    (p_sale_id, p_method_id, p_amount, p_received_by, p_is_change);
END $$

DELIMITER ;

-- =====================================================================
-- SAMPLE JOINS / REPORT QUERIES (ready to use in your app)
-- =====================================================================

-- 1) Daily POS dashboard for a branch (replace :branch_id)
--    SELECT * FROM v_pos_dashboard_today WHERE branch_id = :branch_id;

-- 2) Stock balance by branch & medicine
--    SELECT md.name, v.qty_on_hand
--    FROM v_stock_balance v JOIN medicines md ON md.id=v.medicine_id
--    WHERE v.branch_id=:branch_id ORDER BY md.name;

-- 3) Sales detailed report (range)
--    SELECT * FROM v_sales_detailed WHERE sale_date BETWEEN :d1 AND :d2 AND branch_id=:branch_id;

-- 4) Top-selling medicines (last 30 days)
--    SELECT md.name, SUM(si.qty) qty, SUM(si.line_total) revenue
--    FROM sale_items si JOIN sales s ON s.id=si.sale_id JOIN medicines md ON md.id=si.medicine_id
--    WHERE s.status='posted' AND s.sale_date >= (CURRENT_DATE - INTERVAL 30 DAY)
--    GROUP BY md.id ORDER BY qty DESC LIMIT 20;

-- 5) Cash vs Card split (today)
--    SELECT pm.name, SUM(p.amount) amount
--    FROM pos_payments p JOIN payment_methods pm ON pm.id=p.method_id JOIN sales s ON s.id=p.sale_id
--    WHERE DATE(s.sale_date)=CURRENT_DATE AND s.status='posted' GROUP BY pm.id;

-- =====================================================================
-- END
-- =====================================================================

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
