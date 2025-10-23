-- Fix medicines table and purchase_order_items table for proper medicine receiving
-- This migration ensures all required fields are available for the receive purchase functionality

-- Add missing columns to medicines table (these already exist in 09_inventory_tables.sql)
-- But we ensure they are there for the receiving process

-- Add missing columns to purchase_order_items table
ALTER TABLE purchase_order_items
  ADD COLUMN IF NOT EXISTS generic_name VARCHAR(255) NULL,
  ADD COLUMN IF NOT EXISTS form VARCHAR(50) NULL,
  ADD COLUMN IF NOT EXISTS strength VARCHAR(50) NULL,
  ADD COLUMN IF NOT EXISTS manufacturer VARCHAR(255) NULL,
  ADD COLUMN IF NOT EXISTS location VARCHAR(100) NULL,
  ADD COLUMN IF NOT EXISTS notes TEXT NULL,
  ADD COLUMN IF NOT EXISTS min_stock DECIMAL(10,2) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS max_stock DECIMAL(10,2) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS wholesale_price DECIMAL(12,4) NULL,
  ADD COLUMN IF NOT EXISTS retail_price DECIMAL(12,4) NULL,
  ADD COLUMN IF NOT EXISTS carton_price DECIMAL(12,4) NULL,
  ADD COLUMN IF NOT EXISTS blister_price DECIMAL(12,4) NULL,
  ADD COLUMN IF NOT EXISTS tablet_price DECIMAL(12,4) NULL,
  ADD COLUMN IF NOT EXISTS packs_per_carton INT NULL,
  ADD COLUMN IF NOT EXISTS blisters_per_pack INT NULL,
  ADD COLUMN IF NOT EXISTS tablets_per_blister INT NULL;

-- Add indexes for better performance
ALTER TABLE purchase_order_items
  ADD INDEX IF NOT EXISTS idx_purchase_order_items_barcode (barcode),
  ADD INDEX IF NOT EXISTS idx_purchase_order_items_medicine_id (medicine_id);
