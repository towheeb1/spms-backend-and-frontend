-- 09_inventory_tables.sql
-- إنشاء جداول المخزون وحركات المخزون

-- جدول الأدوية في المخزون
CREATE TABLE IF NOT EXISTS medicines (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(255) NOT NULL,
  generic_name VARCHAR(255) NULL,
  form VARCHAR(50) NULL,
  strength VARCHAR(50) NULL,
  barcode VARCHAR(100) UNIQUE NULL,
  price DECIMAL(12, 4) NOT NULL,
  stock_qty DECIMAL(10, 2) DEFAULT 0,
  min_stock DECIMAL(10, 2) DEFAULT 0,
  max_stock DECIMAL(10, 2) DEFAULT 0,
  category VARCHAR(120) NULL,
  manufacturer VARCHAR(255) NULL,
  batch_no VARCHAR(100) NULL,
  expiry_date DATE NULL,
  location VARCHAR(100) NULL,
  notes TEXT NULL,
  pharmacy_id INT NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  INDEX idx_medicines_pharmacy_id (pharmacy_id),
  INDEX idx_medicines_barcode (barcode),
  INDEX idx_medicines_name (name)
);

-- جدول حركات المخزون
CREATE TABLE IF NOT EXISTS inventory_movements (
  id INT PRIMARY KEY AUTO_INCREMENT,
  medicine_id INT NOT NULL,
  type ENUM('in', 'out', 'adjustment', 'expiry', 'damage') NOT NULL,
  quantity DECIMAL(10, 2) NOT NULL,
  reference VARCHAR(255) NULL,
  notes TEXT NULL,
  pharmacist_id INT NOT NULL,
  pharmacy_id INT NOT NULL,
  batch_no VARCHAR(100) NULL,
  expiry_date DATE NULL,
  unit_cost DECIMAL(12, 4) NULL,
  unit_price DECIMAL(12, 4) NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  INDEX idx_inventory_movements_medicine_id (medicine_id),
  INDEX idx_inventory_movements_pharmacy_id (pharmacy_id),
  INDEX idx_inventory_movements_type (type),
  INDEX idx_inventory_movements_created_at (created_at),

  FOREIGN KEY (medicine_id) REFERENCES medicines(id) ON DELETE CASCADE,
  FOREIGN KEY (pharmacist_id) REFERENCES pharmacists(id) ON DELETE CASCADE
);

-- إضافة عمود received_qty إلى جدول purchase_order_items إذا لم يكن موجوداً
ALTER TABLE purchase_order_items
ADD COLUMN IF NOT EXISTS received_qty DECIMAL(10,2) DEFAULT 0 AFTER qty;

-- إضافة فهرس للبحث السريع
ALTER TABLE purchase_order_items
ADD INDEX IF NOT EXISTS idx_purchase_order_items_po_id (po_id);

-- إضافة فهرس للبحث عن الأدوية في purchase_order_items
 
-- إضافة الحقول المفقودة في جدول medicines
ALTER TABLE medicines
  ADD COLUMN IF NOT EXISTS generic_name VARCHAR(255) NULL,
  ADD COLUMN IF NOT EXISTS form VARCHAR(50) NULL,
  ADD COLUMN IF NOT EXISTS strength VARCHAR(50) NULL,
  ADD COLUMN IF NOT EXISTS location VARCHAR(100) NULL,
  ADD COLUMN IF NOT EXISTS notes TEXT NULL;

