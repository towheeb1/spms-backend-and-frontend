-- Simple fix for purchase order items table - basic columns only
-- Add only the essential columns needed for the receive functionality

-- Basic columns for purchase_order_items
ALTER TABLE purchase_order_items
  ADD COLUMN IF NOT EXISTS item_name VARCHAR(255) NULL,
  ADD COLUMN IF NOT EXISTS barcode VARCHAR(120) NULL,
  ADD COLUMN IF NOT EXISTS category VARCHAR(120) NULL,
  ADD COLUMN IF NOT EXISTS qty DECIMAL(10,2) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS unit_price DECIMAL(12,4) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS batch_no VARCHAR(120) NULL,
  ADD COLUMN IF NOT EXISTS expiry_date DATE NULL;

-- Basic columns for medicines (ensure they exist)
ALTER TABLE medicines
  ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT TRUE,
  ADD COLUMN IF NOT EXISTS min_stock DECIMAL(10,2) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS max_stock DECIMAL(10,2) DEFAULT 0;

-- Index for better performance
ALTER TABLE purchase_order_items
  ADD INDEX IF NOT EXISTS idx_purchase_order_items_po_id (po_id);
