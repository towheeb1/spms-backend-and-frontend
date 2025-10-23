-- Multitenancy Step 1: base schema for pharmacies and scoping columns
-- NOTE: Run this after 02_pharmacy_core.sql and 03_auth.sql

-- Pharmacies table
CREATE TABLE IF NOT EXISTS pharmacies (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(200) NOT NULL,
  owner_pharmacist_id INT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_pharmacy_owner FOREIGN KEY (owner_pharmacist_id) REFERENCES pharmacists(id) ON DELETE SET NULL,
  UNIQUE KEY uk_pharmacies_name (name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Add pharmacy_id to core tables (MariaDB-safe; duplicates will be ignored by migration runner)
ALTER TABLE pharmacists ADD COLUMN pharmacy_id INT NULL;
ALTER TABLE pharmacists ADD CONSTRAINT fk_pharmacist_pharmacy FOREIGN KEY (pharmacy_id) REFERENCES pharmacies(id) ON DELETE SET NULL;
ALTER TABLE pharmacists ADD INDEX idx_pharmacists_pharmacy (pharmacy_id);

ALTER TABLE medicines ADD COLUMN pharmacy_id INT NULL;
ALTER TABLE medicines ADD CONSTRAINT fk_meds_pharmacy FOREIGN KEY (pharmacy_id) REFERENCES pharmacies(id) ON DELETE SET NULL;
ALTER TABLE medicines ADD INDEX idx_meds_pharmacy (pharmacy_id);

ALTER TABLE suppliers ADD COLUMN pharmacy_id INT NULL;
ALTER TABLE suppliers ADD CONSTRAINT fk_sup_pharmacy FOREIGN KEY (pharmacy_id) REFERENCES pharmacies(id) ON DELETE SET NULL;
ALTER TABLE suppliers ADD INDEX idx_sup_pharmacy (pharmacy_id);

ALTER TABLE inventory_movements ADD COLUMN pharmacy_id INT NULL;
ALTER TABLE inventory_movements ADD CONSTRAINT fk_mov_pharmacy FOREIGN KEY (pharmacy_id) REFERENCES pharmacies(id) ON DELETE SET NULL;
ALTER TABLE inventory_movements ADD INDEX idx_mov_pharmacy (pharmacy_id);

ALTER TABLE purchase_orders ADD COLUMN pharmacy_id INT NULL;
ALTER TABLE purchase_orders ADD CONSTRAINT fk_po_pharmacy FOREIGN KEY (pharmacy_id) REFERENCES pharmacies(id) ON DELETE SET NULL;
ALTER TABLE purchase_orders ADD INDEX idx_po_pharmacy (pharmacy_id);

ALTER TABLE purchase_order_items ADD COLUMN pharmacy_id INT NULL;
ALTER TABLE purchase_order_items ADD CONSTRAINT fk_poi_pharmacy FOREIGN KEY (pharmacy_id) REFERENCES pharmacies(id) ON DELETE SET NULL;
ALTER TABLE purchase_order_items ADD INDEX idx_poi_pharmacy (pharmacy_id);

ALTER TABLE sales ADD COLUMN pharmacy_id INT NULL;
ALTER TABLE sales ADD CONSTRAINT fk_sales_pharmacy FOREIGN KEY (pharmacy_id) REFERENCES pharmacies(id) ON DELETE SET NULL;
ALTER TABLE sales ADD INDEX idx_sales_pharmacy (pharmacy_id);

ALTER TABLE sale_items ADD COLUMN pharmacy_id INT NULL;
ALTER TABLE sale_items ADD CONSTRAINT fk_si_pharmacy FOREIGN KEY (pharmacy_id) REFERENCES pharmacies(id) ON DELETE SET NULL;
ALTER TABLE sale_items ADD INDEX idx_si_pharmacy (pharmacy_id);

-- Removed IF NOT EXISTS variant blocks for MariaDB compatibility; see separate ALTERs above
