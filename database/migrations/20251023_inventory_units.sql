-- Migration: normalize inventory quantities to a unified base unit

-- Ensure medicines table has a base quantity column
ALTER TABLE medicines
  ADD COLUMN IF NOT EXISTS stock_base_qty DECIMAL(18,4) NOT NULL DEFAULT 0;

-- Populate base quantity column using existing configuration
UPDATE medicines
SET stock_base_qty =
  COALESCE(stock_qty, 0)
  * GREATEST(COALESCE(packs_per_carton, 1), 1)
  * GREATEST(COALESCE(blisters_per_pack, 1), 1)
  * GREATEST(COALESCE(tablets_per_blister, 1), 1);

-- Keep stock_qty aligned with the base quantity going forward
UPDATE medicines
SET stock_qty = stock_base_qty;

-- Extend inventory movements to capture unit level metadata
ALTER TABLE inventory_movements
  ADD COLUMN IF NOT EXISTS unit_type VARCHAR(32) NULL,
  ADD COLUMN IF NOT EXISTS unit_label VARCHAR(64) NULL,
  ADD COLUMN IF NOT EXISTS unit_qty DECIMAL(18,4) NULL,
  ADD COLUMN IF NOT EXISTS base_qty_change DECIMAL(18,4) NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS balance_after_base DECIMAL(18,4) NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS ref_number VARCHAR(120) NULL;

-- Extend sale items to keep track of the unit that was sold
ALTER TABLE sale_items
  ADD COLUMN IF NOT EXISTS unit_type VARCHAR(32) NULL,
  ADD COLUMN IF NOT EXISTS unit_label VARCHAR(64) NULL,
  ADD COLUMN IF NOT EXISTS base_qty DECIMAL(18,4) NOT NULL DEFAULT 0;
